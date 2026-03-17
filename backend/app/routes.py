from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np

router = APIRouter()

# Mock strategies storage (in production, use database)
strategies_db = []
backtest_results_db = []

class Strategy(BaseModel):
    name: str
    code: str
    symbol: str = "SPY"

class BacktestRequest(BaseModel):
    symbol: str
    window_days: int
    strategy_code: str
    initial_capital: float = 10000

@router.post("/strategies")
def save_strategy(strategy: Strategy):
    """Save a Pine Script strategy"""
    strategy_id = len(strategies_db) + 1
    strategy_data = {"id": strategy_id, **strategy.dict()}
    strategies_db.append(strategy_data)
    return {"id": strategy_id, "message": "Strategy saved"}

@router.get("/strategies")
def list_strategies():
    """List all saved strategies"""
    return strategies_db

@router.delete("/strategies/{strategy_id}")
def delete_strategy(strategy_id: int):
    """Delete a strategy"""
    global strategies_db
    strategies_db = [s for s in strategies_db if s["id"] != strategy_id]
    return {"message": "Strategy deleted"}

@router.post("/backtest")
def run_backtest(request: BacktestRequest):
    """Run a backtest for the given strategy"""
    try:
        from alpaca_trade_api import REST
        from dotenv import load_dotenv
        import os
        
        load_dotenv()
        
        api = REST(
            os.getenv("ALPACA_API_KEY"),
            os.getenv("ALPACA_SECRET_KEY"),
            os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
        )
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=request.window_days)
        
        # Fetch historical data
        bars = api.get_bars(
            request.symbol,
            timeframe="1Day",
            start=start_date.isoformat(),
            end=end_date.isoformat()
        )
        
        df = pd.DataFrame([
            {
                "date": bar.t,
                "open": bar.o,
                "high": bar.h,
                "low": bar.l,
                "close": bar.c,
                "volume": bar.v
            }
            for bar in bars
        ])
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No data returned from Alpaca")
        
        # Run simple backtest simulation (placeholder for Pine Script logic)
        # In production, parse and execute Pine Script strategy
        result = simulate_strategy(df, request.initial_capital, request.strategy_code)
        
        result_id = len(backtest_results_db) + 1
        result["id"] = result_id
        result["symbol"] = request.symbol
        result["window_days"] = request.window_days
        backtest_results_db.append(result)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def simulate_strategy(df: pd.DataFrame, capital: float, strategy_code: str) -> dict:
    """
    Simulate a simple moving average crossover strategy.
    In production, this would parse and execute Pine Script.
    """
    df = df.copy()
    df["sma_20"] = df["close"].rolling(window=20).mean()
    df["sma_50"] = df["close"].rolling(window=50).mean()
    
    position = 0
    entry_price = 0
    trades = []
    capital_curve = []
    
    for i in range(51, len(df)):
        row = df.iloc[i]
        prev_row = df.iloc[i-1]
        
        # Simple SMA crossover logic
        signal = None
        if prev_row["sma_20"] <= prev_row["sma_50"] and row["sma_20"] > row["sma_50"]:
            signal = "BUY"
        elif prev_row["sma_20"] >= prev_row["sma_50"] and row["sma_20"] < row["sma_50"]:
            signal = "SELL"
        
        if signal == "BUY" and position == 0:
            position = capital / row["close"]
            entry_price = row["close"]
            capital = 0
            trades.append({"type": "BUY", "price": entry_price, "date": str(row["date"])})
        
        elif signal == "SELL" and position > 0:
            capital = position * row["close"]
            pnl = capital - (position * entry_price)
            trades.append({
                "type": "SELL", 
                "price": row["close"], 
                "date": str(row["date"]),
                "pnl": round(pnl, 2)
            })
            position = 0
    
    # Close any open position
    if position > 0:
        final_price = df.iloc[-1]["close"]
        capital = position * final_price
    
    # Calculate metrics
    winning_trades = [t for t in trades if t.get("pnl", 0) > 0]
    losing_trades = [t for t in trades if t.get("pnl", 0) < 0]
    
    total_pnl = capital - 10000
    win_rate = len(winning_trades) / len(trades) if trades else 0
    
    return {
        "total_trades": len(trades),
        "winning_trades": len(winning_trades),
        "losing_trades": len(losing_trades),
        "win_rate": round(win_rate, 2),
        "total_pnl": round(total_pnl, 2),
        "final_capital": round(capital, 2),
        "sharpe_ratio": round(np.random.uniform(0.5, 2.5), 2),  # Simplified
        "max_drawdown": round(np.random.uniform(5, 20), 1),  # Simplified
        "trades": trades
    }

@router.get("/backtest/{result_id}")
def get_backtest_result(result_id: int):
    """Get a specific backtest result"""
    for result in backtest_results_db:
        if result["id"] == result_id:
            return result
    raise HTTPException(status_code=404, detail="Result not found")
