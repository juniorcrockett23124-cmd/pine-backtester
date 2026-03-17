import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const BacktestRunner = ({ onBacktestComplete }) => {
  const [symbol, setSymbol] = useState('SPY');
  const [window, setWindow] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Connect to backend API
      // const response = await fetch('http://localhost:8000/backtest', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ symbol, window: parseInt(window), strategy })
      // });
      
      // Simulated result for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        symbol,
        window: parseInt(window),
        totalTrades: Math.floor(Math.random() * 20) + 5,
        winRate: (Math.random() * 0.4 + 0.4).toFixed(2),
        totalPnL: (Math.random() * 2000 - 500).toFixed(2),
        sharpeRatio: (Math.random() * 2 + 0.5).toFixed(2),
        maxDrawdown: (Math.random() * 15 + 5).toFixed(1),
        avgHoldTime: Math.floor(Math.random() * 5) + 1,
        trades: []
      };
      
      onBacktestComplete(mockResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Run Backtest</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          sx={{ width: 120 }}
        />
        
        <FormControl sx={{ width: 150 }}>
          <InputLabel>Window</InputLabel>
          <Select
            value={window}
            label="Window"
            onChange={(e) => setWindow(e.target.value)}
          >
            <MenuItem value="30">30 Days</MenuItem>
            <MenuItem value="60">60 Days</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleRun}
          disabled={loading || !symbol}
        >
          {loading ? 'Running...' : 'Run Backtest'}
        </Button>
      </Box>
    </Paper>
  );
};

export default BacktestRunner;
