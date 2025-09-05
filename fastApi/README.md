# Dooray RAG FastAPI

## 설치
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
sudo apt-get update -y && sudo apt-get install -y poppler-utils libreoffice tesseract-ocr


## 환경변수
cp .env.example .env
# .env에 OPENAI_API_KEY / DOORAY_API_TOKEN 채워라잉

## 실행
uvicorn app:app --host 0.0.0.0 --port 8000

## 확인
curl http://127.0.0.1:8000/health
curl -X POST http://127.0.0.1:8000/ask  -H "Content-Type: application/json" -d '{"query":"테스트"}'
curl -X POST http://127.0.0.1:8000/chat -H "Content-Type: application/json" -d '{"message":"안녕"}'
