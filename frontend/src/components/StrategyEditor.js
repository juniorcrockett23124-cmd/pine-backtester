import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

const API_URL = 'http://localhost:8000';

const StrategyEditor = ({ onStrategySaved }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('SPY');
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const res = await fetch(`${API_URL}/strategies`);
      const data = await res.json();
      setStrategies(data);
    } catch (err) {
      console.error('Failed to fetch strategies:', err);
    }
  };

  const handleSave = async () => {
    if (!name || !code) return;
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, symbol })
      });
      
      if (res.ok) {
        const saved = await res.json();
        setSnackbar({ open: true, message: 'Strategy saved!', severity: 'success' });
        fetchStrategies();
        setName('');
        setCode('');
        if (onStrategySaved) onStrategySaved(saved);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save strategy', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/strategies/${id}`, { method: 'DELETE' });
      fetchStrategies();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Paper sx={{ p: 2, flex: 1 }}>
        <Typography variant="h6" gutterBottom>New Strategy</Typography>
        <TextField
          fullWidth
          label="Strategy Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={18}
          label="Pine Script Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{ mb: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}
          placeholder="// Paste your Pine Script strategy here"
        />
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!name || !code || loading}
        >
          {loading ? 'Saving...' : 'Save Strategy'}
        </Button>
      </Paper>

      <Paper sx={{ p: 2, width: 300 }}>
        <Typography variant="h6" gutterBottom>Saved Strategies</Typography>
        {strategies.length === 0 ? (
          <Typography color="text.secondary">No strategies saved yet</Typography>
        ) : (
          <List>
            {strategies.map((s) => (
              <ListItem key={s.id}>
                <ListItemText 
                  primary={s.name} 
                  secondary={s.symbol || 'SPY'}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleDelete(s.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StrategyEditor;
