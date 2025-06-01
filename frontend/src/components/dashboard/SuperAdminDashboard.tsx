import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Avatar,
  Tooltip,
  Skeleton,
  Grow
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

const IconCircle = ({ icon, color }: { icon: React.ReactNode; color: string }) => (
  <Box
    sx={{
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      mr: 1,
    }}
  >
    {icon}
  </Box>
);

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, delay = 0 }) => (
  <Grow in timeout={600 + delay}>
    <Paper
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        height: 150,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 3,
        boxShadow: 2,
        transition: 'transform 0.18s, box-shadow 0.18s',
        '&:hover': {
          transform: 'scale(1.035)',
          boxShadow: 6,
          background: '#f5faff',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconCircle icon={icon} color={color} />
        <Typography component="p" variant="h4" fontWeight={600}>
          {value}
        </Typography>
      </Box>
      <Typography component="h2" variant="h6" sx={{ mt: 1 }} color="text.secondary">
        {title}
      </Typography>
    </Paper>
  </Grow>
);

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return '?';
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

const SuperAdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setUsers(data.users || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const metrics = {
    totalUsers: users.length,
    activeCompanies: 42, // TODO: fetch real company count if available
    monthlyRevenue: '$125,000', // TODO: fetch real revenue if available
  };

  const recentUsers = users.slice(-3).reverse();

  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      <Grid container spacing={3}>
        {/* Metrics */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={<PeopleIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#2D3282"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Active Companies"
            value={metrics.activeCompanies}
            icon={<BusinessIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#1976d2"
            delay={100}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Monthly Revenue"
            value={metrics.monthlyRevenue}
            icon={<TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#2e7d32"
            delay={200}
          />
        </Grid>

        {/* Divider between metrics and list */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, opacity: 0.18, borderBottomWidth: 2 }} />
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, borderRadius: 3, minHeight: 220, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" fontWeight={600}>
                Recent Users
              </Typography>
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/users')}
                sx={{ boxShadow: 0 }}
              >
                Manage Users
              </Button>
            </Box>
            {loading ? (
              <Box>
                {[...Array(3)].map((_, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={18} />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <List>
                {recentUsers.map((user, index) => (
                  <Grow in timeout={500 + index * 120} key={user._id}>
                    <ListItem sx={{ borderRadius: 2, mb: 1, transition: 'background 0.18s', '&:hover': { background: '#f5faff' } }}>
                      <Avatar sx={{ bgcolor: '#2D3282', mr: 2, fontWeight: 600 }}>
                        {getInitials(user.firstName, user.lastName)}
                      </Avatar>
                      <ListItemText
                        primary={<Typography fontWeight={500}>{user.firstName} {user.lastName}</Typography>}
                        secondary={<Typography variant="body2" color="text.secondary">{user.role} • {user.email}</Typography>}
                      />
                    </ListItem>
                  </Grow>
                ))}
                {recentUsers.length === 0 && <Typography>No users found.</Typography>}
              </List>
            )}
          </Paper>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              minHeight: 220,
              boxShadow: 1,
              bgcolor: theme.palette.background.paper,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(120deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
                : `linear-gradient(120deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              color: theme.palette.text.primary,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                <SettingsIcon />
              </Avatar>
              <Typography variant="h6" component="h2" fontWeight={600}>
                System Settings
              </Typography>
            </Box>
            <Tooltip title="Configure system-wide settings" arrow>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => {/* Navigate to settings */}}
                sx={{ fontWeight: 500 }}
              >
                Configure
              </Button>
            </Tooltip>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SuperAdminDashboard; 