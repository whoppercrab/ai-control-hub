from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
import torch
import asyncio
from datetime import datetime
import os

from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import torch.nn as nn
import torch.optim as optim

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import bcrypt
import jwt


from fastapi import UploadFile, File, Form
from typing import List
import shutil


from fastapi.responses import FileResponse

# ==========================================
# 1. DB 설정 (PostgreSQL)
# ==========================================
SQLALCHEMY_DATABASE_URL = "postgresql://admin:password123@localhost:5432/ai_hub"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

SECRET_KEY = "my_super_secret_key" # JWT 토큰 생성용 비밀키 (필수!)

# ==========================================
# 2. DB 테이블 (Models)
# ==========================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    target_type = Column(String, index=True) 
    target_id = Column(String, index=True)   
    username = Column(String)                
    content = Column(Text)                   
    created_at = Column(DateTime, default=datetime.utcnow)

class AIModel(Base):
    __tablename__ = "ai_models"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    author = Column(String)
    downloads = Column(String, default="0")
    likes = Column(Integer, default=0)
    license = Column(String)
    tags = Column(String) 
    readme = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    liked_by = Column(String, default="")

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    author = Column(String)
    downloads = Column(String, default="0")
    likes = Column(Integer, default=0)
    license = Column(String)
    tags = Column(String) 
    readme = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    liked_by = Column(String, default="")

Base.metadata.create_all(bind=engine)

# ==========================================
# 3. FastAPI 및 CORS 설정
# ==========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 4. AI 하드웨어 장치 설정
# ==========================================
if torch.cuda.is_available():
    device = torch.device("cuda:0")
    pipeline_device = 0
    print("🚀 AI Engine Loaded on: GPU (cuda:0)")
else:
    device = torch.device("cpu")
    pipeline_device = -1
    print("🚀 AI Engine Loaded on: CPU")

classifier = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment", device=pipeline_device)

# ==========================================
# 5. AI 학습 (MNIST) 로직
# ==========================================
training_state = {
    "is_training": False,
    "progress": 0,
    "logs": [],
    "epoch": 0,
    "total_epochs": 10
}

async def run_real_training(epochs: int, batch_size: int, lr: float):
    global training_state
    training_state["is_training"] = True
    training_state["progress"] = 0
    training_state["logs"] = [f"[{datetime.now().time()}] Real Training Started (MNIST) on {device}..."]

    try:
        training_state["logs"].append(f"[{datetime.now().time()}] Downloading MNIST Dataset...")
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.1307,), (0.3081,))
        ])
        dataset = datasets.MNIST('./data', train=True, download=True, transform=transform)
        train_loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        training_state["logs"].append(f"[{datetime.now().time()}] Dataset Loaded. Batch Size: {batch_size}")

        model = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28*28, 128),
            nn.ReLU(),
            nn.Linear(128, 10)
        ).to(device)

        optimizer = optim.SGD(model.parameters(), lr=lr)
        criterion = nn.CrossEntropyLoss()

        model.train()
        total_steps = len(train_loader)
        
        for epoch in range(1, epochs + 1):
            epoch_loss = 0
            correct = 0
            total = 0
            
            for batch_idx, (data, target) in enumerate(train_loader):
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

                if batch_idx % 10 == 0:
                    await asyncio.sleep(0.001) 

            acc = 100. * correct / total
            avg_loss = epoch_loss / total_steps
            log_msg = f"Epoch {epoch}/{epochs} - Loss: {avg_loss:.4f} - Acc: {acc:.2f}%"
            training_state["logs"].append(f"[{datetime.now().time()}] {log_msg}")
            training_state["epoch"] = epoch
            training_state["progress"] = int((epoch / epochs) * 100)

        if not os.path.exists("./models"): os.makedirs("./models")
        torch.save(model.state_dict(), "./models/mnist_model.pt")
        
        training_state["logs"].append(f"[{datetime.now().time()}] Model saved to ./models/mnist_model.pt")
        training_state["logs"].append(f"[{datetime.now().time()}] Training Completed Successfully!")

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(error_msg)
        training_state["logs"].append(f"[ERROR] {str(e)}")
    finally:
        training_state["is_training"] = False


# 🟢 [NEW] 실제 폴더 용량과 타입을 계산하는 마법의 함수!
def get_real_file_info(target_dir, default_type):
    if not os.path.exists(target_dir):
        return "0 MB", default_type
        
    total_size = 0
    largest_ext = ""
    max_size = 0
    
    # 폴더 안의 모든 파일을 뒤져서 총 용량과 가장 큰 파일의 확장자를 찾습니다.
    for f in os.listdir(target_dir):
        fp = os.path.join(target_dir, f)
        if os.path.isfile(fp):
            sz = os.path.getsize(fp)
            total_size += sz
            if sz > max_size:
                max_size = sz
                largest_ext = os.path.splitext(f)[1].lower()
                
    # 1. 예쁜 용량 텍스트로 변환 (KB, MB, GB)
    if total_size == 0:
        size_str = "0 MB"
    elif total_size < 1024 * 1024:
        size_str = f"{total_size / 1024:.1f} KB"
    elif total_size < 1024 * 1024 * 1024:
        size_str = f"{total_size / (1024 * 1024):.1f} MB"
    else:
        size_str = f"{total_size / (1024 * 1024 * 1024):.2f} GB"
        
    # 2. 가장 큰 파일 확장자를 기준으로 타입 결정!
    type_str = default_type
    if largest_ext:
        if largest_ext in ['.pt', '.pth']: type_str = "PyTorch (.pt)"
        elif largest_ext == '.safetensors': type_str = "Safetensors"
        elif largest_ext == '.bin': type_str = "Binary (.bin)"
        elif largest_ext == '.csv': type_str = "CSV Data"
        elif largest_ext == '.json': type_str = "JSON Data"
        elif largest_ext == '.txt': type_str = "Text Data"
        elif largest_ext == '.zip': type_str = "ZIP Archive"
        else: type_str = f"{largest_ext.upper()[1:]} File"
        
    return size_str, type_str

# ==========================================
# 6. API 엔드포인트
# ==========================================

@app.get("/")
def read_root():
    return {"status": "AI Server Running"}

# --- 추론 및 학습 ---
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

# --- 플랫폼 AI 모델 통합 관리 (DB 연동) ---
class ModelCreate(BaseModel):
    name: str
    author: str
    license: str
    tags: str
    readme: str

@app.post("/models")
def create_model(model: ModelCreate):
    db = SessionLocal()
    existing = db.query(AIModel).filter(AIModel.name == model.name).first()
    if existing:
        db.close()
        return {"status": "error", "message": "이미 사용 중인 모델 이름입니다."}
    
    new_model = AIModel(
        name=model.name, author=model.author, license=model.license,
        tags=model.tags, readme=model.readme, downloads="0", likes=0
    )
    db.add(new_model)
    db.commit()
    db.close()
    return {"status": "success", "message": "새 모델이 성공적으로 등록되었습니다."}

@app.get("/models")
def get_all_models():
    db = SessionLocal()
    models = db.query(AIModel).order_by(AIModel.created_at.desc()).all()
    db.close()
    
    result = []
    for m in models:

        # 🟢 계산기 작동!
        target_dir = f"./storage/models/{m.name}"
        real_size, real_type = get_real_file_info(target_dir, "AI Model")

        result.append({
            "id": m.id,
            "name": m.name,
            "author": m.author,
            "size": real_size,  # 계산된 진짜 용량!
            "type": real_type,  # 계산된 진짜 타입!
            "created_at": m.created_at.strftime("%Y-%m-%d %H:%M"),
            "downloads": int(m.downloads) if m.downloads and m.downloads.isdigit() else 0,
            "likes": int(m.likes) if hasattr(m, 'likes') and m.likes else 0
        })
    return {"status": "success", "data": result}

@app.get("/models/{model_name}")
def get_model(model_name: str):
    db = SessionLocal()
    model = db.query(AIModel).filter(AIModel.name == model_name).first()
    db.close()
    
    if not model:
        return {"status": "error", "message": "모델을 찾을 수 없습니다."}
        
    return {
        "status": "success",
        "data": {
            "name": model.name, "author": model.author, "downloads": model.downloads,
            "likes": model.likes, "license": model.license,
            "tags": model.tags.split(",") if model.tags else [], "readme": model.readme,
            "liked_by": model.liked_by if hasattr(model, 'liked_by') else ""
        }
    }

# --- 데이터셋 및 게이트웨이 모니터링 ---


class DatasetItem(BaseModel):
    name: str; source: str; type: str

@app.post("/datasets/create")
def create_dataset(item: DatasetItem):
    new_dataset = {"id": len(datasets_db) + 1, "name": item.name, "source": item.source, "size": "0 B (Indexing...)", "type": item.type, "status": "Syncing...", "date": datetime.now().strftime('%Y-%m-%d')}
    datasets_db.insert(0, new_dataset) 
    return {"status": "success", "data": new_dataset}

gateways_db = [
    {"id": "GW-1001", "location": "101동 203호", "status": "Online", "uptime": "14d 2h 12m", "cpu": 12, "memory": 34, "flash": 45, "fw_ver": "1.2.0", "app_ver": "2.0.1", "sensors": 8},
    {"id": "GW-1003", "location": "103동 501호", "status": "Offline", "uptime": "0m", "cpu": 0, "memory": 0, "flash": 0, "fw_ver": "1.1.9", "app_ver": "1.9.8", "sensors": 0},
]

@app.get("/gateways")
def get_gateways():
    total = len(gateways_db)
    online = sum(1 for gw in gateways_db if gw["status"] == "Online")
    online_gws = [gw for gw in gateways_db if gw["status"] == "Online"]
    avg_cpu = sum(gw["cpu"] for gw in online_gws) / len(online_gws) if online_gws else 0
    return {"summary": {"total": total, "online": online, "offline": total - online, "avg_cpu": round(avg_cpu, 1)}, "devices": gateways_db}

# --- 인증 및 커뮤니티 (로그인/회원가입/댓글) ---
class AuthRequest(BaseModel):
    username: str
    password: str

@app.post("/signup")
def signup(request: AuthRequest):
    db = SessionLocal()
    if db.query(User).filter(User.username == request.username).first():
        db.close()
        return {"status": "error", "message": "이미 사용 중인 아이디입니다."}
    
    hashed_pw = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(username=request.username, password_hash=hashed_pw.decode('utf-8'))
    db.add(new_user)
    db.commit()
    db.close()
    return {"status": "success", "message": "회원가입이 완료되었습니다."}

@app.post("/login")
def login(request: AuthRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.username == request.username).first()
    db.close()
    if not user or not bcrypt.checkpw(request.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return {"status": "error", "message": "아이디 또는 비밀번호가 올바르지 않습니다."}
    
    token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm="HS256")
    return {"status": "success", "token": token, "username": user.username}

class CommentCreate(BaseModel):
    target_type: str; target_id: str; username: str; content: str

@app.get("/comments/{target_type}/{target_id}")
def get_comments(target_type: str, target_id: str):
    db = SessionLocal()
    comments = db.query(Comment).filter(Comment.target_type == target_type, Comment.target_id == target_id).order_by(Comment.created_at.desc()).all()
    db.close()
    return [{"id": c.id, "username": c.username, "content": c.content, "created_at": c.created_at.strftime("%Y-%m-%d %H:%M")} for c in comments]

@app.post("/comments")
def add_comment(comment: CommentCreate):
    db = SessionLocal()
    db.add(Comment(target_type=comment.target_type, target_id=comment.target_id, username=comment.username, content=comment.content))
    db.commit()
    db.close()
    return {"status": "success", "message": "의견이 등록되었습니다."}




# 🟢 [NEW] 특정 모델에 파일 업로드하기 API
@app.post("/models/{model_name}/upload")
async def upload_model_files(model_name: str, files: List[UploadFile] = File(...)):
    # 1. 모델별 전용 폴더 생성 (예: ./storage/models/test-model/)
    save_dir = f"./storage/models/{model_name}"
    os.makedirs(save_dir, exist_ok=True)
    
    uploaded_files = []
    # 2. 전송받은 파일들을 폴더에 저장
    for file in files:
        file_path = os.path.join(save_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        uploaded_files.append(file.filename)
        
    return {"status": "success", "message": f"{len(uploaded_files)}개의 파일이 업로드되었습니다.", "files": uploaded_files}





# 🟢 [NEW] 특정 모델의 진짜 파일 목록 가져오기
@app.get("/models/{model_name}/files")
def get_model_files(model_name: str):
    target_dir = f"./storage/models/{model_name}"
    
    # 폴더가 없으면(파일이 없으면) 빈 배열 반환
    if not os.path.exists(target_dir):
        return {"status": "success", "data": []}
        
    files_info = []
    for f in os.listdir(target_dir):
        filepath = os.path.join(target_dir, f)
        if os.path.isfile(filepath):
            size_bytes = os.path.getsize(filepath)
            
            # 크기에 따라 KB, MB로 예쁘게 변환
            if size_bytes < 1024 * 1024:
                size_str = f"{size_bytes / 1024:.1f} KB"
            else:
                size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
            
            # 파일 확장자에 따라 타입 지정
            file_type = "json" if f.endswith(".json") else "bin" if f.endswith(".bin") or f.endswith(".pt") else "text"
            
            files_info.append({
                "name": f,
                "size": size_str,
                "type": file_type,
                "lfs": size_bytes > 50 * 1024 * 1024 # 50MB 넘으면 LFS 뱃지 달아줌
            })
            
    return {"status": "success", "data": files_info}

# 🟢 [NEW] 파일 진짜 다운로드 하기
@app.get("/models/{model_name}/files/{file_name}")
def download_model_file(model_name: str, file_name: str):
    file_path = f"./storage/models/{model_name}/{file_name}"
    if not os.path.exists(file_path):
        return {"status": "error", "message": "파일을 찾을 수 없습니다."}
    
    # ==========================================
    # 🟢 [NEW] DB에서 다운로드 숫자 1 증가시키기
    # ==========================================
    db = SessionLocal()
    model = db.query(AIModel).filter(AIModel.name == model_name).first()
    if model:
        # 기존 숫자를 정수로 바꿔서 1 더한 후, 다시 문자로 저장 ("0" -> "1")
        current_downloads = int(model.downloads) if model.downloads.isdigit() else 0
        model.downloads = str(current_downloads + 1)
        db.commit()
    db.close()
    # 브라우저가 파일을 다운로드하도록 응답
    return FileResponse(path=file_path, filename=file_name)






# ==========================================
# 🟢 데이터셋 (Datasets) 통합 관리 API
# ==========================================
class DatasetCreate(BaseModel):
    name: str
    author: str
    license: str
    tags: str
    readme: str

@app.post("/datasets")
def create_dataset(dataset: DatasetCreate):
    db = SessionLocal()
    existing = db.query(Dataset).filter(Dataset.name == dataset.name).first()
    if existing:
        db.close()
        return {"status": "error", "message": "이미 사용 중인 데이터셋 이름입니다."}
    
    new_dataset = Dataset(
        name=dataset.name, author=dataset.author, license=dataset.license,
        tags=dataset.tags, readme=dataset.readme, downloads="0", likes=0
    )
    db.add(new_dataset)
    db.commit()
    db.close()
    return {"status": "success", "message": "새 데이터셋이 성공적으로 등록되었습니다."}

@app.get("/datasets")
def get_all_datasets():
    db = SessionLocal()
    datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
    db.close()
    
    result = []
    for d in datasets:
        # 🟢 계산기 작동!
        target_dir = f"./storage/datasets/{d.name}"
        real_size, real_type = get_real_file_info(target_dir, "Dataset")
        result.append({
            "id": d.id,
            "name": d.name,
            "author": d.author,
            "size": real_size,  # 계산된 진짜 용량!
            "type": real_type,  # 계산된 진짜 타입!
            "created_at": d.created_at.strftime("%Y-%m-%d %H:%M"),
            "downloads": int(d.downloads) if d.downloads and d.downloads.isdigit() else 0,
            "likes": int(d.likes) if hasattr(d, 'likes') and d.likes else 0
        })
    return {"status": "success", "data": result}

@app.get("/datasets/{dataset_name}")
def get_dataset(dataset_name: str):
    db = SessionLocal()
    dataset = db.query(Dataset).filter(Dataset.name == dataset_name).first()
    db.close()
    
    if not dataset:
        return {"status": "error", "message": "데이터셋을 찾을 수 없습니다."}
        
    return {
        "status": "success",
        "data": {
            "name": dataset.name, "author": dataset.author, "downloads": dataset.downloads,
            "likes": dataset.likes, "license": dataset.license,
            "tags": dataset.tags.split(",") if dataset.tags else [], "readme": dataset.readme,
            "downloads": int(dataset.downloads) if dataset.downloads and dataset.downloads.isdigit() else 0 ,
            "liked_by": dataset.liked_by if hasattr(dataset, 'liked_by') else ""
        }
    }

@app.post("/datasets/{dataset_name}/upload")
async def upload_dataset_files(dataset_name: str, files: List[UploadFile] = File(...)):
    # 모델은 storage/models 였지만, 데이터셋은 storage/datasets 에 저장합니다!
    save_dir = f"./storage/datasets/{dataset_name}"
    os.makedirs(save_dir, exist_ok=True)
    
    uploaded_files = []
    for file in files:
        file_path = os.path.join(save_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        uploaded_files.append(file.filename)
        
    return {"status": "success", "message": f"{len(uploaded_files)}개의 파일이 업로드되었습니다.", "files": uploaded_files}

@app.get("/datasets/{dataset_name}/files")
def get_dataset_files(dataset_name: str):
    target_dir = f"./storage/datasets/{dataset_name}"
    if not os.path.exists(target_dir):
        return {"status": "success", "data": []}
        
    files_info = []
    for f in os.listdir(target_dir):
        filepath = os.path.join(target_dir, f)
        if os.path.isfile(filepath):
            size_bytes = os.path.getsize(filepath)
            size_str = f"{size_bytes / 1024:.1f} KB" if size_bytes < 1024 * 1024 else f"{size_bytes / (1024 * 1024):.1f} MB"
            
            # 데이터셋에 흔한 확장자들 아이콘 처리를 위해 분류
            file_type = "csv" if f.endswith(".csv") else "json" if f.endswith(".json") else "zip" if f.endswith(".zip") else "text"
            
            files_info.append({
                "name": f,
                "size": size_str,
                "type": file_type,
                "lfs": size_bytes > 50 * 1024 * 1024
            })
            
    return {"status": "success", "data": files_info}

@app.get("/datasets/{dataset_name}/files/{file_name}")
def download_dataset_file(dataset_name: str, file_name: str):
    file_path = f"./storage/datasets/{dataset_name}/{file_name}"
    if not os.path.exists(file_path):
        return {"status": "error", "message": "파일을 찾을 수 없습니다."}


    db = SessionLocal()
    dataset = db.query(Dataset).filter(Dataset.name == dataset_name).first()
    if dataset:
        current_downloads = int(dataset.downloads) if dataset.downloads.isdigit() else 0
        dataset.downloads = str(current_downloads + 1)
        db.commit()
    db.close()

    return FileResponse(path=file_path, filename=file_name)


# 🟢 [NEW] 데이터셋 완전 삭제 (DB + 실제 폴더 파일 삭제)
@app.delete("/datasets/{dataset_name}")
def delete_dataset(dataset_name: str):
    db = SessionLocal()
    dataset = db.query(Dataset).filter(Dataset.name == dataset_name).first()
    
    if not dataset:
        db.close()
        return {"status": "error", "message": "데이터셋을 찾을 수 없습니다."}
        
    # 1. DB에서 기록 삭제
    db.delete(dataset)
    db.commit()
    db.close()
    
    # 2. 로컬 서버에 저장된 무거운 실제 파일/폴더 깔끔하게 날리기!
    target_dir = f"./storage/datasets/{dataset_name}"
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir) # 폴더 통째로 삭제
        
    return {"status": "success", "message": f"{dataset_name} 데이터셋이 완벽하게 삭제되었습니다."}



# ==========================================
# 🟢 [NEW] 좋아요 기능 API 추가
# ==========================================
# 🟢 모델 좋아요 누르기 (계정당 1회 & 토글 기능)
@app.post("/models/{model_name}/like")
def like_model(model_name: str, username: str):
    db = SessionLocal()
    model = db.query(AIModel).filter(AIModel.name == model_name).first()
    if not model:
        db.close()
        return {"status": "error", "message": "모델을 찾을 수 없습니다."}
    
    # "admin,testuser" 같은 문자열을 리스트로 변환
    liked_users = model.liked_by.split(",") if hasattr(model, 'liked_by') and model.liked_by else []
    liked_users = [u.strip() for u in liked_users if u.strip()]
    
    # 🟢 토글(Toggle) 로직: 이미 누른 명단에 있으면 빼고, 없으면 넣기!
    if username in liked_users:
        liked_users.remove(username)
    else:
        liked_users.append(username)
        
    model.liked_by = ",".join(liked_users)
    model.likes = str(len(liked_users)) # 좋아요 갯수 동기화
    db.commit()
    
    result_likes = len(liked_users)
    result_liked_by = model.liked_by
    db.close()
    
    return {"status": "success", "likes": result_likes, "liked_by": result_liked_by}

# 🟢 데이터셋 좋아요 누르기 (계정당 1회 & 토글 기능)
@app.post("/datasets/{dataset_name}/like")
def like_dataset(dataset_name: str, username: str):
    db = SessionLocal()
    dataset = db.query(Dataset).filter(Dataset.name == dataset_name).first()
    if not dataset:
        db.close()
        return {"status": "error", "message": "데이터셋을 찾을 수 없습니다."}
    
    liked_users = dataset.liked_by.split(",") if hasattr(dataset, 'liked_by') and dataset.liked_by else []
    liked_users = [u.strip() for u in liked_users if u.strip()]
    
    if username in liked_users:
        liked_users.remove(username)
    else:
        liked_users.append(username)
        
    dataset.liked_by = ",".join(liked_users)
    dataset.likes = str(len(liked_users))
    db.commit()
    
    result_likes = len(liked_users)
    result_liked_by = dataset.liked_by
    db.close()
    
    return {"status": "success", "likes": result_likes, "liked_by": result_liked_by}