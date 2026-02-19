from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
import torch
import asyncio
import random
from datetime import datetime
import os

from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import torch.nn as nn
import torch.optim as optim

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
import bcrypt
import jwt


SQLALCHEMY_DATABASE_URL = "postgresql://admin:password123@localhost:5432/ai_hub"

# PostgreSQL은 check_same_thread 옵션이 필요 없습니다.
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# 🟢 [NEW] 사용자(User) 테이블 정의
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

# DB 테이블 생성
Base.metadata.create_all(bind=engine)

# 🟢 [NEW] 서버 켜질 때 기본 관리자(admin) 계정 자동 생성
def create_default_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        hashed_pw = bcrypt.hashpw("admin1234!".encode('utf-8'), bcrypt.gensalt())
        new_admin = User(username="admin", password_hash=hashed_pw.decode('utf-8'))
        db.add(new_admin)
        db.commit()
        print("✅ 기본 관리자 계정 생성 완료 (ID: admin / PW: admin1234!)")
    db.close()

create_default_admin()

SECRET_KEY = "my_super_secret_key_for_ai_hub" # JWT 토큰 암호화 키






app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🟢 [수정됨] CPU/GPU 장치 설정 로직 개선
# PyTorch는 'cpu' 또는 'cuda' 객체를 사용해야 안전합니다.
if torch.cuda.is_available():
    device = torch.device("cuda:0")
    pipeline_device = 0 # 파이프라인용 (0 = 첫번째 GPU)
    print("🚀 AI Engine Loaded on: GPU (cuda:0)")
else:
    device = torch.device("cpu")
    pipeline_device = -1 # 파이프라인용 (-1 = CPU)
    print("🚀 AI Engine Loaded on: CPU")

# 감정 분석 모델
classifier = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment", device=pipeline_device)

# --- 2. 학습 상태 관리 ---
training_state = {
    "is_training": False,
    "progress": 0,
    "logs": [],
    "epoch": 0,
    "total_epochs": 10
}

# --- 3. 진짜 MNIST 학습 함수 ---
async def run_real_training(epochs: int, batch_size: int, lr: float):
    global training_state
    training_state["is_training"] = True
    training_state["progress"] = 0
    training_state["logs"] = [f"[{datetime.now().time()}] Real Training Started (MNIST) on {device}..."]

    try:
        # 1. 데이터 준비
        training_state["logs"].append(f"[{datetime.now().time()}] Downloading MNIST Dataset...")
        
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.1307,), (0.3081,))
        ])
        
        # 데이터셋 로드
        dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
        train_loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        training_state["logs"].append(f"[{datetime.now().time()}] Dataset Loaded. Batch Size: {batch_size}")

        # 2. 모델 정의 및 장치 할당 (여기가 에러 원인이었음 -> 수정됨)
        model = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28*28, 128),
            nn.ReLU(),
            nn.Linear(128, 10)
        ).to(device) # device가 'cpu' 또는 'cuda' 객체이므로 안전함

        optimizer = optim.SGD(model.parameters(), lr=lr)
        criterion = nn.CrossEntropyLoss()

        # 3. 학습 루프
        model.train()
        total_steps = len(train_loader)
        
        for epoch in range(1, epochs + 1):
            epoch_loss = 0
            correct = 0
            total = 0
            
            for batch_idx, (data, target) in enumerate(train_loader):
                # 🟢 [수정됨] 데이터를 올바른 장치로 이동
                data, target = data.to(device), target.to(device)
                
                optimizer.zero_grad()
                output = model(data)
                loss = criterion(output, target)
                loss.backward()
                optimizer.step()

                epoch_loss += loss.item()
                pred = output.argmax(dim=1, keepdim=True)
                correct += pred.eq(target.view_as(pred)).sum().item()
                total += target.size(0)

                # CPU 부하를 줄이기 위한 대기
                if batch_idx % 10 == 0:
                    await asyncio.sleep(0.001) 

            # 결과 기록
            acc = 100. * correct / total
            avg_loss = epoch_loss / total_steps
            
            log_msg = f"Epoch {epoch}/{epochs} - Loss: {avg_loss:.4f} - Acc: {acc:.2f}%"
            training_state["logs"].append(f"[{datetime.now().time()}] {log_msg}")
            training_state["epoch"] = epoch
            training_state["progress"] = int((epoch / epochs) * 100)

        # 4. 모델 저장
        if not os.path.exists("./models"): os.makedirs("./models")
        torch.save(model.state_dict(), "./models/mnist_model.pt")
        
        training_state["logs"].append(f"[{datetime.now().time()}] Model saved to ./models/mnist_model.pt")
        training_state["logs"].append(f"[{datetime.now().time()}] Training Completed Successfully!")

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(error_msg) # 서버 터미널에 상세 에러 출력
        training_state["logs"].append(f"[ERROR] {str(e)}")
    
    finally:
        training_state["is_training"] = False


# --- API 엔드포인트 ---

@app.get("/")
def read_root():
    return {"status": "AI Server Running"}

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(request: TextRequest):
    result = classifier(request.text)[0]
    return {
        "label": result['label'],
        "score": round(result['score'], 4),
        "input": request.text
    }

class TrainRequest(BaseModel):
    epochs: int
    batch_size: int

@app.post("/train/start")
def start_training(request: TrainRequest, background_tasks: BackgroundTasks):
    if training_state["is_training"]:
        return {"status": "error", "message": "Already training"}
    
    background_tasks.add_task(run_real_training, request.epochs, request.batch_size, 0.01)
    return {"status": "success", "message": "Real Training started"}

@app.get("/train/status")
def get_training_status():
    return training_state

# 🟢 [NEW] 모델 파일 목록 조회 API
@app.get("/models")
def list_models():
    model_dir = "./models"
    if not os.path.exists(model_dir):
        return []
    
    files = []
    for f in os.listdir(model_dir):
        if f.endswith(".pt") or f.endswith(".pth") or f.endswith(".bin"):
            path = os.path.join(model_dir, f)
            size_mb = round(os.path.getsize(path) / (1024 * 1024), 2)
            created_time = datetime.fromtimestamp(os.path.getctime(path)).strftime('%Y-%m-%d %H:%M:%S')
            
            files.append({
                "name": f,
                "size": f"{size_mb} MB",
                "created": created_time,
                "type": "PyTorch Model"
            })
    return files

# 🟢 [NEW] 데이터셋 관리 API
# 요구사항에 명시된 데이터셋들을 기본값으로 설정
datasets_db = [
    {"id": 1, "name": "COCO 2017", "source": "Common Objects in Context", "size": "25 GB", "type": "Image (Vision)", "status": "Ready", "date": "2024-01-15"},
    {"id": 2, "name": "UCI Machine Learning", "source": "UCI Repository", "size": "1.2 GB", "type": "Tabular", "status": "Ready", "date": "2023-11-20"},
    {"id": 3, "name": "MIT Indoor Scenes", "source": "MIT Vision", "size": "2.4 GB", "type": "Image", "status": "Ready", "date": "2023-12-05"},
    {"id": 4, "name": "CMU Panoptic", "source": "CMU Perceptual Lab", "size": "150 GB", "type": "Video/Motion", "status": "Archived", "date": "2022-08-10"},
    {"id": 5, "name": "UbiComp HAR", "source": "UbiComp Data", "size": "450 MB", "type": "Sensor/Log", "status": "Ready", "date": "2024-02-01"},
    {"id": 6, "name": "Self_Collected_CCTV_v1", "source": "자체 수집 (강남구)", "size": "500 GB", "type": "Video", "status": "Processing", "date": "2024-03-10"},
]

@app.get("/datasets")
def get_datasets():
    return datasets_db

class DatasetItem(BaseModel):
    name: str
    source: str
    type: str

@app.post("/datasets/create")
def create_dataset(item: DatasetItem):
    new_id = len(datasets_db) + 1
    new_dataset = {
        "id": new_id,
        "name": item.name,
        "source": item.source,
        "size": "0 B (Indexing...)",
        "type": item.type,
        "status": "Syncing...",
        "date": datetime.now().strftime('%Y-%m-%d')
    }
    datasets_db.insert(0, new_dataset) # 목록 맨 앞에 추가
    return {"status": "success", "data": new_dataset}

    # 🟢 [NEW] 게이트웨이 모니터링 API
# 가상의 게이트웨이 데이터 생성
gateways_db = [
    {"id": "GW-1001", "location": "101동 203호", "status": "Online", "uptime": "14d 2h 12m", "cpu": 12, "memory": 34, "flash": 45, "fw_ver": "1.2.0", "app_ver": "2.0.1", "sensors": 8},
    {"id": "GW-1002", "location": "102동 1105호", "status": "Online", "uptime": "5d 12h 30m", "cpu": 25, "memory": 48, "flash": 55, "fw_ver": "1.2.0", "app_ver": "2.0.1", "sensors": 12},
    {"id": "GW-1003", "location": "103동 501호", "status": "Offline", "uptime": "0m", "cpu": 0, "memory": 0, "flash": 0, "fw_ver": "1.1.9", "app_ver": "1.9.8", "sensors": 0},
    {"id": "GW-1004", "location": "104동 302호", "status": "Online", "uptime": "45d 1h 0m", "cpu": 8, "memory": 29, "flash": 80, "fw_ver": "1.2.1", "app_ver": "2.0.2", "sensors": 5},
    {"id": "GW-1005", "location": "105동 909호", "status": "Online", "uptime": "2h 15m", "cpu": 65, "memory": 72, "flash": 40, "fw_ver": "1.2.0", "app_ver": "2.0.1", "sensors": 15},
]

@app.get("/gateways")
def get_gateways():
    # 1. 전체 통계 계산
    total = len(gateways_db)
    online = sum(1 for gw in gateways_db if gw["status"] == "Online")
    offline = total - online
    
    # 2. 리소스 평균 계산 (Online인 장비만)
    online_gws = [gw for gw in gateways_db if gw["status"] == "Online"]
    avg_cpu = sum(gw["cpu"] for gw in online_gws) / len(online_gws) if online_gws else 0
    
    return {
        "summary": {
            "total": total,
            "online": online,
            "offline": offline,
            "avg_cpu": round(avg_cpu, 1)
        },
        "devices": gateways_db
    }


# 🟢 [NEW] 로그인 API
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(request: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.username == request.username).first()
    db.close()

    # 계정이 없거나 비밀번호가 틀린 경우
    if not user or not bcrypt.checkpw(request.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return {"status": "error", "message": "아이디 또는 비밀번호가 올바르지 않습니다."}
    
    # 로그인 성공 시 JWT 토큰 발급
    token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm="HS256")
    return {"status": "success", "token": token, "username": user.username}



# 🟢 [NEW] 회원가입 API
class SignupRequest(BaseModel):
    username: str
    password: str

@app.post("/signup")
def signup(request: SignupRequest):
    db = SessionLocal()
    
    # 1. 이미 존재하는 아이디인지 검사
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        db.close()
        return {"status": "error", "message": "이미 사용 중인 아이디입니다."}
    
    # 2. 비밀번호 암호화 후 DB에 저장
    hashed_pw = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(username=request.username, password_hash=hashed_pw.decode('utf-8'))
    
    db.add(new_user)
    db.commit()
    db.close()
    
    return {"status": "success", "message": "회원가입이 완료되었습니다. 로그인해 주세요."}