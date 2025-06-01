import React, { useState } from 'react';
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
  LinearProgress,
  Avatar,
  Skeleton,
  Grow
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  progress?: number;
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

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, progress, delay = 0 }) => (
  <Grow in timeout={600 + delay}>
    <Paper
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        height: progress ? 170 : 150,
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
      {progress !== undefined && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
              },
            }}
          />
          <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }} color="text.secondary">
            {progress}% of goal
          </Typography>
        </Box>
      )}
    </Paper>
  </Grow>
);

const getInitials = (name: string) => {
  const parts = name.split(' ');
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const SalesManagerDashboard: React.FC = () => {
  const theme = useTheme();
  // Mock data - replace with actual API calls
  const metrics = {
    monthlyRevenue: '$85,000',
    targetRevenue: '$100,000',
    progress: 85,
    teamSize: 12,
    activeDeals: 28,
    conversionRate: '24%',
  };

  const [loading, setLoading] = useState(false); // Set to true to see skeletons
  const teamMembers = [
    { id: 1, name: 'Alice Johnson', role: 'Sales Representative', deals: 8, revenue: '$32,000' },
    { id: 2, name: 'Bob Wilson', role: 'Sales Representative', deals: 6, revenue: '$28,000' },
    { id: 3, name: 'Carol Smith', role: 'Lead Specialist', leads: 45, conversion: '28%' },
  ];

  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      <Grid container spacing={3}>
        {/* Metrics */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Monthly Revenue"
            value={metrics.monthlyRevenue}
            icon={<MoneyIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#2D3282"
            progress={metrics.progress}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Active Deals"
            value={metrics.activeDeals}
            icon={<TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#1976d2"
            delay={100}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Conversion Rate"
            value={metrics.conversionRate}
            icon={<AssignmentIcon sx={{ fontSize: 32, color: 'white' }} />}
            color="#2e7d32"
            delay={200}
          />
        </Grid>

        {/* Divider between metrics and list */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1.5, opacity: 0.18, borderBottomWidth: 2 }} />
        </Grid>

        {/* Team Performance */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2.5, borderRadius: 3, minHeight: 220, boxShadow: 1, bgcolor: theme.palette.background.paper }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" fontWeight={600}>
                Team Performance
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  sx={{ mr: 1, fontWeight: 500 }}
                  onClick={() => {/* Open team chat */}}
                >
                  Team Chat
                </Button>
                <Button
                  variant="contained"
                  startIcon={<GroupIcon />}
                  sx={{ fontWeight: 500 }}
                  onClick={() => {/* Navigate to team management */}}
                >
                  Manage Team
                </Button>
              </Box>
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
                {teamMembers.map((member, index) => (
                  <Grow in timeout={500 + index * 120} key={member.id}>
                    <ListItem sx={{ borderRadius: 2, mb: 1, transition: 'background 0.18s', '&:hover': { background: '#f5faff' } }}>
                      <Avatar sx={{ bgcolor: '#2D3282', mr: 2, fontWeight: 600 }}>
                        {getInitials(member.name)}
                      </Avatar>
                      <ListItemText
                        primary={<Typography fontWeight={500}>{member.name}</Typography>}
                        secondary={<Typography variant="body2" color="text.secondary">{member.role} • {'deals' in member ? `${member.deals} deals • ${member.revenue} revenue` : `${member.leads} leads • ${member.conversion} conversion`}</Typography>}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="view profile">
                          <PersonIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Grow>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        {/* Optionally, add a summary or chart card here in md=4 */}
      </Grid>
    </Box>
  );
};

export default SalesManagerDashboard; 