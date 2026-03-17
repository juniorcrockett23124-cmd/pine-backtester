import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

const StrategyEditor = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [strategies, setStrategies] = useState([]);

  const handleSave = () => {
    if (!name || !code) return;
    setStrategies([...strategies, { id: Date.now(), name, code }]);
    setName('');
    setCode('');
  };

  const handleDelete = (id) => {
    setStrategies(strategies.filter(s => s.id !== id));
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
          multiline
          rows={20}
          label="Pine Script Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{ mb: 2, fontFamily: 'monospace' }}
        />
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!name || !code}
        >
          Save Strategy
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
                <ListItemText primary={s.name} secondary={`${s.code.length} chars`} />
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
    </Box>
  );
};

export default StrategyEditor;
