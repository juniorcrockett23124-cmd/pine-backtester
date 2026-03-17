# Project Plan: Pine Script Backtesting Platform

## Overview
Build a local web app to paste Pine Script strategies and run backtests over 30 and 60 day windows using Alpaca data.

## Core Features

1. **Strategy Management**
   - UI to paste/upload Pine Script code
   - Strategy library with naming and tagging
   - Version history for each strategy

2. **Backtest Engine**
   - Alpaca API integration for historical market data
   - Run backtests across configurable windows (default: 30 & 60 days)
   - Support options trading logic

3. **Results Dashboard**
   - P&L curves, win rate, Sharpe ratio
   - Options-specific stats: max drawdown, trade count, avg hold time
   - Visual charts (MUI charts library) and exportable reports

4. **Data Handling**
   - Cache historical data locally for fast re-runs
   - Support multiple timeframes and asset classes

## Tech Stack
- **Frontend**: ReactJS + MUI (Material UI)
- **Backend**: Python (FastAPI) — easier Alpaca integration
- **Data**: Alpaca Markets API
- **Storage**: SQLite for strategy metadata and results

## Key Metrics to Track (Suggestions)
- P&L (total, per trade)
- Win rate / loss rate
- Sharpe ratio
- Max drawdown
- Trade frequency
- Avg hold time
- Best/worst trade

## Milestones
1. **Day 1**: Project setup, Alpaca API connection, data fetching
2. **Day 2**: Pine Script parser + strategy execution engine
3. **Day 3**: Backtest runner (30/60 day windows)
4. **Day 4**: Results calculation + MUI dashboard
5. **Day 5**: Polish, error handling, testing

## Assumptions
- Alpaca account has API keys ready
- Focus on options strategies initially
- Local deployment (not cloud)
