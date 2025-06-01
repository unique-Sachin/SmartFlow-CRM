import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Skeleton,
  Grow
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useAuth } from '../../contexts/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useTheme } from '@mui/material/styles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const stages = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];
const stageLabels: Record<string, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

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

const MetricCard = ({ title, value, icon, color, delay = 0 }: { title: string; value: string | number; icon: React.ReactNode; color: string; delay?: number }) => (
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

const SalesRepDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const theme = useTheme();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/deals?assignedTo=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setDeals(data.deals || []);
      } catch {
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [user, token]);

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const dealsByStage: Record<string, number> = {};
  stages.forEach(stage => {
    dealsByStage[stage] = deals.filter(d => d.stage === stage).length;
  });
  const recentDeals = [...deals].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()).slice(0, 5);

  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
     
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="My Active Deals"
            value={deals.length}
            icon={<AssignmentIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#2D3282"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Pipeline Value"
            value={totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            icon={<MonetizationOnIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#1976d2"
            delay={100}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Deals by Stage"
            value={''}
            icon={<TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#2e7d32"
            delay={200}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {stages.map(stage => (
              <Chip key={stage} label={`${stageLabels[stage]}: ${dealsByStage[stage]}`} color="default" />
            ))}
          </Box>
        </Grid>
        {/* Divider between metrics and list */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, opacity: 0.18, borderBottomWidth: 2 }} />
        </Grid>
        {/* Recent Deals */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2.5, borderRadius: 3, minHeight: 220, boxShadow: 1, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>Recent Deals</Typography>
            {loading ? (
              <Box>
                {[...Array(3)].map((_, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
                    <Skeleton variant="rectangular" width="60%" height={32} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="40%" height={18} />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <List>
                {recentDeals.map((deal, idx) => (
                  <Grow in timeout={500 + idx * 120} key={deal._id}>
                    <ListItem sx={{ borderRadius: 2, mb: 1, transition: 'background 0.18s', '&:hover': { background: '#f5faff' } }}>
                      <ListItemText
                        primary={<Typography fontWeight={500}>{deal.title}</Typography>}
                        secondary={<Typography variant="body2" color="text.secondary">Stage: {stageLabels[deal.stage] || deal.stage} • Value: {deal.value} {deal.currency}</Typography>}
                      />
                    </ListItem>
                  </Grow>
                ))}
                {recentDeals.length === 0 && <Typography>No recent deals found.</Typography>}
              </List>
            )}
          </Paper>
        </Grid>
        {/* Optionally, add a summary or chart card here in md=4 */}
      </Grid>
    </Box>
  );
};

export default SalesRepDashboard; 