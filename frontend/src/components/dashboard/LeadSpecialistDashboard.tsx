import {
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  FilterList as FilterIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Grow,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; progress?: number; delay?: number }> = ({ title, value, icon, color, progress, delay = 0 }) => (
  <Grow in timeout={600 + delay}>
    <Paper
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        height: 180,
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
        <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', mr: 1 }}>{icon}</Box>
        <Typography component="p" variant="h4" fontWeight={600}>{value}</Typography>
      </Box>
      <Typography component="h2" variant="h6" sx={{ mt: 1 }} color="text.secondary">{title}</Typography>
      {progress !== undefined && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': { backgroundColor: color },
            }}
          />
          <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }} color="text.secondary">{progress}% qualified</Typography>
        </Box>
      )}
    </Paper>
  </Grow>
);

const getStatusColor = (status: string, theme: any) => {
  switch (status.toLowerCase()) {
    case 'hot': return theme.palette.error.main;
    case 'warm': return theme.palette.warning.main;
    case 'cold': return theme.palette.info.main;
    default: return theme.palette.grey[500];
  }
};

const LeadSpecialistDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/leads?assignedTo=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setLeads(data.leads || []);
      } catch {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [user, token]);

  // Metrics calculation
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const progress = totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
  const conversionRate = totalLeads ? `${Math.round((leads.filter(l => l.status === 'converted').length / totalLeads) * 100)}%` : '0%';



  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      {/* Metrics row using Box instead of Grid */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          mb: isMobile ? 2 : 4,
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}
      >
        <Box >
          {loading ? (
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3, flex: 1 }} />
          ) : (
            <MetricCard
              title="Total Leads"
              value={totalLeads}
              icon={<PersonIcon sx={{ fontSize: 32, color: 'white' }} />}
              color={theme.palette.primary.main}
              progress={progress}
              delay={0}
            />
          )}
        </Box>
        <Box >
          {loading ? (
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3, flex: 1 }} />
          ) : (
            <MetricCard
              title="New Leads"
              value={newLeads}
              icon={<TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />}
              color={theme.palette.secondary.main}
              delay={100}
            />
          )}
        </Box>
        <Box >
          {loading ? (
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3, flex: 1 }} />
          ) : (
            <MetricCard
              title="Conversion Rate"
              value={conversionRate}
              icon={<AssignmentIcon sx={{ fontSize: 32, color: 'white' }} />}
              color={theme.palette.success.main}
              delay={200}
            />
          )}
        </Box>
      </Box>
      {/* Recent Leads as a card in a new full-width row below metrics */}
      <Box sx={{ width: '100%', mt: isMobile ? 2 : 4, display: 'flex' }}>
        <Paper sx={{ p: isMobile ? 2 : 2.5, borderRadius: 3, minHeight: 150, boxShadow: 1, bgcolor: theme.palette.background.paper, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" component="h2" fontWeight={600}>Recent Leads</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<FilterIcon />} sx={{ fontWeight: 500, height: 36, minWidth: 0, px: 1.5 }} onClick={() => {}}>
                Filter
              </Button>
              <Button variant="contained" startIcon={<PersonIcon />} sx={{ fontWeight: 500, height: 36, minWidth: 0, px: 1.5 }} onClick={() => {}}>
                Add
              </Button>
            </Box>
          </Box>
          {loading ? (
            <Box>
              {[...Array(2)].map((_, i) => (
                <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
                  <Skeleton variant="rectangular" width="60%" height={24} />
                  <Box flex={1}>
                    <Skeleton variant="text" width="40%" height={16} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <List dense sx={{ p: 0 }}>
              {leads.slice(0, 2).map((lead, index) => (
                <Grow in timeout={500 + index * 120} key={lead._id}>
                  <ListItem sx={{ borderRadius: 2, mb: 1, transition: 'background 0.18s', '&:hover': { background: theme.palette.action.hover }, flexWrap: 'wrap', p: 0.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          {lead.company || `${lead.firstName} ${lead.lastName}`}
                          <Chip
                            label={lead.status}
                            size="small"
                            sx={{ backgroundColor: getStatusColor(lead.status, theme), color: 'white', ml: 1 }}
                          />
                          <Chip label={`Score: ${lead.score}`} size="small" variant="outlined" sx={{ ml: 1 }} />
                        </Box>
                      }
                      secondary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">{lead.contact || lead.email || ''} • {lead.source} • {lead.lastActivity || ''}</Typography>
                        <Tooltip title="Company"><IconButton edge="end" aria-label="company" sx={{ ml: 1 }}><BusinessIcon /></IconButton></Tooltip>
                        <Tooltip title="Email"><IconButton edge="end" aria-label="email" sx={{ ml: 1 }}><EmailIcon /></IconButton></Tooltip>
                        <Tooltip title="View Details"><IconButton edge="end" aria-label="view details" sx={{ ml: 1 }}><OpenInNewIcon /></IconButton></Tooltip>
                      </Box>}
                    />
                  </ListItem>
                </Grow>
              ))}
              {leads.length === 0 && <Typography>No leads found.</Typography>}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default LeadSpecialistDashboard; 