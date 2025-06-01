import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import type { TextFieldProps } from '@mui/material/TextField';
import { useSocket } from '../contexts/SocketContext';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import Grow from '@mui/material/Grow';
import Skeleton from '@mui/material/Skeleton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reporting: React.FC = () => {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sales, setSales] = useState<any>(null);
  const [conversion, setConversion] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [ai, setAI] = useState<any>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(29, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const theme = useTheme();

  // Fetch users for filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const data = await res.json();
        setUsers(data.users || []);
      } catch {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        let params = startDate && endDate ? `?start=${startDate.format('YYYY-MM-DD')}&end=${endDate.format('YYYY-MM-DD')}` : '';
        if (selectedUser) {
          params += params ? `&userId=${selectedUser}` : `?userId=${selectedUser}`;
        }
        const [salesRes, convRes, actRes, aiRes] = await Promise.all([
          fetch(`${API_URL}/reporting/sales-metrics${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          fetch(`${API_URL}/reporting/conversion-analytics${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          fetch(`${API_URL}/reporting/activity-tracking${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          fetch(`${API_URL}/reporting/ai-usage${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        ]);
        if (!salesRes.ok || !convRes.ok || !actRes.ok || !aiRes.ok) {
          throw new Error('Failed to fetch reporting data');
        }
        setSales(await salesRes.json());
        setConversion(await convRes.json());
        setActivity(await actRes.json());
        setAI(await aiRes.json());
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // Listen for real-time events
    if (!socket) return;
    const events = ['dealCreated', 'dealUpdated', 'leadCreated', 'leadUpdated'];
    events.forEach(event => socket.on(event, fetchAll));
    return () => {
      events.forEach(event => socket.off(event, fetchAll));
    };
  }, [token, startDate, endDate, selectedUser, socket]);

  if (loading) return <Box display="flex" flexDirection="row" gap={3} minHeight={200}>
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} variant="rectangular" width={280} height={220} sx={{ borderRadius: 3 }} />
    ))}
  </Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: theme.palette.background.paper, boxShadow: 0 }}>
        <DatePicker
          label="Start date"
          value={startDate}
          onChange={setStartDate}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
        />
        <Box sx={{ mx: 1, color: 'text.secondary' }}> to </Box>
        <DatePicker
          label="End date"
          value={endDate}
          onChange={setEndDate}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
        />
        <TextField
          select
          label="User"
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Users</MenuItem>
          {users.map(u => (
            <MenuItem key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</MenuItem>
          ))}
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Box>
          <button
            onClick={async () => {
              setExporting(true);
              try {
                let params = startDate && endDate ? `?start=${startDate.format('YYYY-MM-DD')}&end=${endDate.format('YYYY-MM-DD')}` : '';
                if (selectedUser) {
                  params += params ? `&userId=${selectedUser}` : `?userId=${selectedUser}`;
                }
                const res = await fetch(`${API_URL}/reporting/export/csv${params}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error('Failed to export CSV');
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report_${startDate?.format('YYYYMMDD') || ''}_${endDate?.format('YYYYMMDD') || ''}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                alert('Export failed.');
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            style={{
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              border: 'none',
              borderRadius: 6,
              padding: '6px 18px',
              fontWeight: 600,
              fontSize: 15,
              cursor: exporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 1px 4px rgba(80,80,80,0.08)',
              transition: 'background 0.2s, transform 0.18s, box-shadow 0.18s',
              opacity: exporting ? 0.7 : 1,
              transform: 'scale(1)',
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <DownloadIcon sx={{ fontSize: 20, mr: 1 }} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </Box>
      </Paper>
      <Typography variant="h4" gutterBottom>Reporting Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Grow in={true} timeout={500}>
            <Card sx={{
              transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)',
              borderRadius: 3,
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: 6,
                background: '#f5faff',
              },
            }}>
              <CardContent>
                <Typography variant="h6">Sales Metrics</Typography>
                <Typography>Total Deals: {sales?.totalDeals}</Typography>
                <Typography>Total Value:</Typography>
                {sales?.totalValue && Object.entries(sales.totalValue).map(([currency, value]) => (
                  <Typography key={currency} variant="body2" sx={{ ml: 2 }}>
                    {currency}: {value}
                  </Typography>
                ))}
                <Typography>Won Deals:</Typography>
                {sales?.wonDeals && Object.entries(sales.wonDeals).map(([currency, data]) => {
                  const d = data as { count: number; sum: number };
                  return (
                    <Typography key={currency} variant="body2" sx={{ ml: 2 }}>
                      {currency}: {d.count} deals, {d.sum} {currency}
                    </Typography>
                  );
                })}
                <Typography>Lost Deals:</Typography>
                {sales?.lostDeals && Object.entries(sales.lostDeals).map(([currency, data]) => {
                  const d = data as { count: number; sum: number };
                  return (
                    <Typography key={currency} variant="body2" sx={{ ml: 2 }}>
                      {currency}: {d.count} deals, {d.sum} {currency}
                    </Typography>
                  );
                })}
                <Box sx={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ name: 'Won', value: sales?.wonDeals || 0 }, { name: 'Lost', value: sales?.lostDeals || 0 }]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        <Cell key="won" fill="#4caf50" />
                        <Cell key="lost" fill="#f44336" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Grow in={true} timeout={500}>
            <Card sx={{
              transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)',
              borderRadius: 3,
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: 6,
                background: '#f5faff',
              },
            }}>
              <CardContent>
                <Typography variant="h6">Conversion Analytics</Typography>
                <Typography>Total Leads: {conversion?.totalLeads}</Typography>
                <Typography>Converted Leads: {conversion?.convertedLeads}</Typography>
                <Typography>Conversion Rate: {conversion?.conversionRate?.toFixed(2)}%</Typography>
                <Box sx={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Converted', value: conversion?.convertedLeads || 0 },
                          { name: 'Not Converted', value: (conversion?.totalLeads || 0) - (conversion?.convertedLeads || 0) }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        <Cell key="converted" fill="#2196f3" />
                        <Cell key="not-converted" fill="#bdbdbd" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Grow in={true} timeout={500}>
            <Card sx={{
              transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)',
              borderRadius: 3,
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: 6,
                background: '#f5faff',
              },
            }}>
              <CardContent>
                <Typography variant="h6">Activity Tracking</Typography>
                {activity?.activityCounts && Object.keys(activity.activityCounts).length > 0 ? (
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(activity.activityCounts).map(([type, count]) => ({ type, count }))}>
                        <XAxis dataKey="type" />
                        <YAxis allowDecimals={false} />
                        <Bar dataKey="count" fill="#ff9800" />
                        <Tooltip />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography>No activities tracked.</Typography>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Grow in={true} timeout={500}>
            <Card sx={{
              transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)',
              borderRadius: 3,
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: 6,
                background: '#f5faff',
              },
            }}>
              <CardContent>
                <Typography variant="h6">AI Usage Stats</Typography>
                <Typography>AI Requests: {ai?.aiRequests}</Typography>
                <Typography>AI Success: {ai?.aiSuccess}</Typography>
                <Typography>AI Failure: {ai?.aiFailure}</Typography>
                <Box sx={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Requests', value: ai?.aiRequests || 0 },
                      { name: 'Success', value: ai?.aiSuccess || 0 },
                      { name: 'Failure', value: ai?.aiFailure || 0 }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Bar dataKey="value" fill="#9c27b0" />
                      <Tooltip />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reporting; 