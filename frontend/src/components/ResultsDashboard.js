import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const StatCard = ({ label, value, color }) => (
  <Card sx={{ bgcolor: 'background.paper' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ color: color || 'primary.main' }}>{value}</Typography>
    </CardContent>
  </Card>
);

const ResultsDashboard = ({ result }) => {
  if (!result) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No backtest results yet. Run a backtest first!
        </Typography>
      </Paper>
    );
  }

  // Generate mock equity curve data
  const equityData = Array.from({ length: result.window }, (_, i) => ({
    day: i + 1,
    value: 10000 + (Math.random() - 0.4) * i * 50
  }));

  // Generate mock trade distribution
  const tradeData = [
    { type: 'Wins', count: Math.floor(result.totalTrades * result.winRate) },
    { type: 'Losses', count: Math.floor(result.totalTrades * (1 - result.winRate)) }
  ];

  const pnlColor = parseFloat(result.totalPnL) >= 0 ? '#00d4aa' : '#f44336';

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Backtest Results: {result.symbol} ({result.window} days)
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Total Trades" value={result.totalTrades} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Win Rate" value={`${(result.winRate * 100).toFixed(1)}%`} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Total P&L" value={`$${result.totalPnL}`} color={pnlColor} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Sharpe Ratio" value={result.sharpeRatio} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Max Drawdown" value={`${result.maxDrawdown}%`} color="#f44336" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Avg Hold (days)" value={result.avgHoldTime} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Equity Curve</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00d4aa" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Win/Loss Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="type" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }}
                />
                <Bar dataKey="count" fill="#00d4aa" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResultsDashboard;
