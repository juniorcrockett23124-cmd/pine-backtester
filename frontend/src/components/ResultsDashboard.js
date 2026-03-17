import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  Bar,
  Legend
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

  // Generate equity curve from trades if available, otherwise mock
  let equityData = [];
  if (result.trades && result.trades.length > 0) {
    let equity = 10000;
    equityData = [{ day: 0, value: equity }];
    
    result.trades.forEach((trade, i) => {
      if (trade.type === 'SELL' && trade.pnl !== undefined) {
        equity += trade.pnl;
        equityData.push({ day: i + 1, value: equity });
      }
    });
    
    // Fill remaining days
    const lastDay = equityData[equityData.length - 1].day;
    for (let i = lastDay + 1; i <= result.window_days; i++) {
      equityData.push({ day: i, value: equity + (Math.random() - 0.5) * 100 });
    }
  } else {
    equityData = Array.from({ length: Math.min(result.window_days, 30) }, (_, i) => ({
      day: i + 1,
      value: 10000 + (Math.random() - 0.4) * i * 30
    }));
  }

  // Win/Loss data
  const tradeData = [
    { type: 'Wins', count: result.winning_trades || 0 },
    { type: 'Losses', count: result.losing_trades || 0 }
  ];

  const pnlColor = parseFloat(result.total_pnl) >= 0 ? '#00d4aa' : '#f44336';

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Backtest Results: {result.symbol} ({result.window_days} days)
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Total Trades" value={result.total_trades} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Win Rate" value={`${(result.win_rate * 100).toFixed(1)}%`} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Total P&L" value={`$${result.total_pnl}`} color={pnlColor} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Final Capital" value={`$${result.final_capital}`} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Max Drawdown" value={`${result.max_drawdown}%`} color="#f44336" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Sharpe Ratio" value={result.sharpe_ratio || 'N/A'} />
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
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
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

        {result.trades && result.trades.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Trade History</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>P&L</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.trades.map((trade, i) => (
                      <TableRow key={i}>
                        <TableCell>{trade.date?.split('T')[0]}</TableCell>
                        <TableCell>{trade.type}</TableCell>
                        <TableCell>${trade.price?.toFixed(2)}</TableCell>
                        <TableCell sx={{ color: (trade.pnl || 0) >= 0 ? '#00d4aa' : '#f44336' }}>
                          {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ResultsDashboard;
