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

const API_URL = 'http://localhost:8000';

const BacktestRunner = ({ onBacktestComplete }) => {
  const [symbol, setSymbol] = useState('SPY');
  const [window, setWindow] = useState('30');
  const [strategyCode, setStrategyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/backtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symbol, 
          window_days: parseInt(window),
          strategy_code: strategyCode || 'default',
          initial_capital: 10000
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Backtest failed');
      }
      
      const result = await response.json();
      onBacktestComplete(result);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Run Backtest</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
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
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Strategy Code (optional - leave empty for default SMA crossover)"
        value={strategyCode}
        onChange={(e) => setStrategyCode(e.target.value)}
        sx={{ mb: 2, fontFamily: 'monospace', fontSize: '0.8rem' }}
        placeholder="// Pine Script code (advanced)"
      />

      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
        onClick={handleRun}
        disabled={loading || !symbol}
        size="large"
      >
        {loading ? 'Running Backtest...' : 'Run Backtest'}
      </Button>
    </Paper>
  );
};

export default BacktestRunner;
