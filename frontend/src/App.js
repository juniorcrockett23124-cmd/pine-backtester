import React, { useState } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import StrategyEditor from './components/StrategyEditor';
import BacktestRunner from './components/BacktestRunner';
import ResultsDashboard from './components/ResultsDashboard';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4aa',
    },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              📈 Pine Backtester
            </Typography>
          </Toolbar>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ px: 2 }}
            TabIndicatorProps={{ style: { backgroundColor: '#00d4aa' } }}
          >
            <Tab label="Strategy" />
            <Tab label="Run Backtest" />
            <Tab label="Results" />
          </Tabs>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {tabValue === 0 && <StrategyEditor />}
          {tabValue === 1 && <BacktestRunner onBacktestComplete={setLastResult} />}
          {tabValue === 2 && <ResultsDashboard result={lastResult} />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
