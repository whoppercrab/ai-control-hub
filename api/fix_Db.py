from sqlalchemy import text
from server import SessionLocal # (만약 server.py가 아니라 database.py 등에 SessionLocal이 있다면 그 파일명으로 바꿔주세요)

def add_columns():
    db = SessionLocal()
    try:
        # 모델 테이블에 칸 추가
        db.execute(text("ALTER TABLE ai_models ADD COLUMN liked_by VARCHAR DEFAULT '';"))
        print("✅ ai_models 테이블에 liked_by 칸 추가 완료!")
        
        # 데이터셋 테이블에 칸 추가
        db.execute(text("ALTER TABLE datasets ADD COLUMN liked_by VARCHAR DEFAULT '';"))
        print("✅ datasets 테이블에 liked_by 칸 추가 완료!")
        
        db.commit()
    except Exception as e:
        print("이미 칸이 있거나 에러가 발생했습니다:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_columns()