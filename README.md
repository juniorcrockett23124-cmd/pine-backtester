# Pine Script Backtester

Backtest Pine Script strategies over 30 & 60 day windows using Alpaca market data.

## Tech Stack
- **Frontend**: ReactJS + MUI
- **Backend**: Python (FastAPI)
- **Data**: Alpaca Markets API

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```
