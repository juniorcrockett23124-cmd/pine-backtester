from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Pine Backtester API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Pine Backtester API running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# TODO: Alpaca API routes
# - POST /backtest - run a backtest
# - GET /strategies - list strategies
# - POST /strategies - save strategy
# - GET /results/{id} - get backtest results
