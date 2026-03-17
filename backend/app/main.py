from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pine Backtester API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import router
app.include_router(router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Pine Backtester API running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
