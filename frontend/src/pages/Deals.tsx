import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Paper, CircularProgress, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Grow from '@mui/material/Grow';

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

interface Deal {
  _id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
}

const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    value: '',
    currency: 'INR',
    stage: 'prospecting',
    probability: 0,
    expectedCloseDate: '',
    assignedTo: '',
    contact: '',
    priority: 'medium',
  });
  const [users, setUsers] = useState<{ _id: string; firstName: string; lastName: string; email: string }[]>([]);
  const [contacts, setContacts] = useState<{ _id: string; firstName: string; lastName: string; email: string }[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/deals`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch deals');
        const data = await res.json();
        setDeals(data.deals);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [token]);

  // Group deals by stage
  const dealsByStage: Record<string, Deal[]> = {};
  stages.forEach(stage => {
    dealsByStage[stage] = deals.filter(deal => deal.stage === stage);
  });

  const handleAddOpen = async () => {
    setForm({
      title: '', value: '', currency: 'INR', stage: 'prospecting', probability: 0, expectedCloseDate: '', assignedTo: '', contact: '', priority: 'medium',
    });
    setAddError(null);
    setAddOpen(true);
    // Fetch users and contacts for selects
    try {
      const [usersRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch(`${API_URL}/contacts`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      ]);
      const usersData = await usersRes.json();
      const contactsData = await contactsRes.json();
      console.log('contactsData', contactsData); // Debug log
      setUsers(usersData.users || usersData);
      // Always use contactsData.contacts for contacts
      setContacts(Array.isArray(contactsData.contacts) ? contactsData.contacts : []);
      setTimeout(() => {
        console.log('contacts state', contactsData.contacts); // Debug log
      }, 1000);
    } catch {
      setUsers([]);
      setContacts([]);
    }
  };
  const handleAddClose = () => setAddOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch(`${API_URL}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to add deal');
      }
      setAddOpen(false);
      setForm({ title: '', value: '', currency: 'INR', stage: 'prospecting', probability: 0, expectedCloseDate: '', assignedTo: '', contact: '', priority: 'medium' });
      // Refresh deals
      setLoading(true);
      const dealsRes = await fetch(`${API_URL}/deals`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const dealsData = await dealsRes.json();
      setDeals(dealsData.deals);
      setLoading(false);
    } catch (err: any) {
      setAddError(err.message || 'Unknown error');
      setAddLoading(false);
    }
  };

  // Add this function to handle stage change
  const handleStageChange = async (dealId: string, newStage: string) => {
    try {
      await fetch(`${API_URL}/deals/${dealId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stage: newStage }),
      });
      // Refresh deals
      setLoading(true);
      const dealsRes = await fetch(`${API_URL}/deals`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const dealsData = await dealsRes.json();
      setDeals(dealsData.deals);
      setLoading(false);
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, bgcolor: theme.palette.background.default }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="text.primary">Deal Pipeline</Typography>
        {user && ['super_admin', 'sales_manager', 'sales_representative'].includes(user.role) && (
          <Button variant="contained" color="primary" onClick={handleAddOpen}>Add Deal</Button>
        )}
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 2, color: 'error.main', bgcolor: theme.palette.background.paper }}>{error}</Paper>
      ) : (
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          gap: { xs: 1, sm: 2, md: 3 },
          p: 1,
          alignItems: 'flex-start',
          minHeight: 340,
          bgcolor: '#f8fafd',
          boxShadow: 1,
          px: { xs: 0.5, sm: 1, md: 2 },
        }}>
          {stages.map((stage, idx) => (
            <Box key={stage} sx={{
              minWidth: { xs: 180, sm: 220, md: 260 },
              maxWidth: { xs: 220, sm: 260, md: 280 },
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              pb: 2,
              mx: { xs: 0.5, sm: 1, md: 2 },
            }}>
              {/* Stage Header */}
              <Box sx={{
                width: '100%',
                bgcolor: idx === 0 ? '#e3f2fd' : idx === stages.length - 2 ? '#e8f5e9' : idx === stages.length - 1 ? '#ffebee' : '#f5f5f5',
                borderRadius: 1,
                p: 1.2,
                mb: 1.5,
                boxShadow: 0,
                border: '1px solid #e0e0e0',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: { xs: 14, sm: 16 },
                color: 'text.primary',
                letterSpacing: 0.5,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
              }}>
                {stageLabels[stage]}
                {/* Connector Arrow (except after last stage) */}
                {idx < stages.length - 1 && (
                  <Box sx={{
                    position: 'absolute',
                    right: -32,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    zIndex: 2,
                  }}>
                    <ArrowForwardIcon sx={{
                      fontSize: 22,
                      color: '#b0b8c1',
                      filter: 'drop-shadow(0 1px 2px rgba(160,180,200,0.12))',
                      background: '#fff',
                      borderRadius: '50%',
                      border: '1.5px solid #e0e0e0',
                      boxShadow: '0 2px 8px 0 rgba(160,180,200,0.10)',
                      p: '2px',
                    }} />
                  </Box>
                )}
              </Box>
              {/* Deals in this stage */}
              <Box sx={{ width: '100%', minHeight: 180 }}>
                {dealsByStage[stage].length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>No deals</Typography>
                ) : (
                  dealsByStage[stage].map(deal => (
                    <Grow
                      in={true}
                      timeout={{ enter: 600, exit: 300 }}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}
                      key={deal._id}
                    >
                      <Card
                        sx={{
                          mb: 2,
                          p: 0,
                          borderRadius: 2,
                          boxShadow: 2,
                          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s cubic-bezier(0.4,0,0.2,1)',
                          '&:hover': {
                            transform: 'scale(1.04)',
                            boxShadow: 8,
                            borderColor: theme.palette.primary.light,
                          },
                          border: deal.stage === 'closed_won' ? '2px solid #4caf50' : deal.stage === 'closed_lost' ? '2px solid #f44336' : `1px solid ${theme.palette.divider}`,
                          bgcolor: deal.stage === 'closed_won' ? '#e8f5e9' : deal.stage === 'closed_lost' ? '#ffebee' : theme.palette.background.paper,
                          position: 'relative',
                          minHeight: 120,
                        }}
                        onClick={() => navigate(`/deals/${deal._id}`)}
                      >
                        <CardContent sx={{ pb: 0.5, pt: 1.5 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography fontWeight={700} color="text.primary" variant="subtitle1">
                              {deal.title}
                            </Typography>
                            {deal.stage === 'closed_won' && <CheckCircleIcon color="success" sx={{ ml: 1, fontSize: 20 }} />}
                            {deal.stage === 'closed_lost' && <CancelIcon color="error" sx={{ ml: 1, fontSize: 20 }} />}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {deal.value} {deal.currency}
                          </Typography>
                          <Chip label={`Prob: ${deal.probability}%`} size="small" sx={{ mb: 0.5, bgcolor: '#f5f5f5', fontWeight: 500 }} />
                          <Box sx={{ mt: 0.5, mb: 0.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={deal.stage === 'closed_won' || deal.stage === 'closed_lost'
                                ? 100
                                : Math.round((stages.indexOf(deal.stage) / (stages.length - 2)) * 100)}
                              sx={{ height: 8, borderRadius: 4, bgcolor: '#e3e3e3', '& .MuiLinearProgress-bar': { bgcolor: deal.stage === 'closed_won' ? '#4caf50' : deal.stage === 'closed_lost' ? '#f44336' : theme.palette.primary.main } }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Progress: {deal.stage === 'closed_won' || deal.stage === 'closed_lost'
                                ? 100
                                : Math.round((stages.indexOf(deal.stage) / (stages.length - 2)) * 100)}%
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                          <TextField
                            select
                            label="Stage"
                            value={deal.stage}
                            size="small"
                            onChange={e => handleStageChange(deal._id, e.target.value)}
                            sx={{ minWidth: 100, bgcolor: '#fafafa', borderRadius: 2, fontWeight: 500 }}
                            onClick={e => e.stopPropagation()}
                          >
                            {stages.map(s => (
                              <MenuItem key={s} value={s}>{stageLabels[s]}</MenuItem>
                            ))}
                          </TextField>
                        </CardActions>
                      </Card>
                    </Grow>
                  ))
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {user && ['super_admin', 'sales_manager', 'sales_representative'].includes(user.role) && (
        <Dialog open={addOpen} onClose={handleAddClose} fullWidth maxWidth="sm">
          <DialogTitle>Add Deal</DialogTitle>
          <form onSubmit={handleAddSubmit}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: theme.palette.background.default }}>
              <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} required fullWidth />
              <TextField label="Value" name="value" value={form.value} onChange={handleFormChange} required fullWidth type="number" />
              <TextField
                select
                label="Currency"
                name="currency"
                value={form.currency}
                onChange={handleFormChange}
                required
                fullWidth
              >
                <MenuItem value="INR">INR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </TextField>
              <TextField select label="Stage" name="stage" value={form.stage} onChange={handleFormChange} required fullWidth>
                {stages.map(stage => (
                  <MenuItem key={stage} value={stage}>{stageLabels[stage]}</MenuItem>
                ))}
              </TextField>
              <TextField label="Probability" name="probability" value={form.probability} onChange={handleFormChange} required fullWidth type="number" inputProps={{ min: 0, max: 100 }} />
              <TextField label="Expected Close Date" name="expectedCloseDate" value={form.expectedCloseDate} onChange={handleFormChange} required fullWidth type="date" InputLabelProps={{ shrink: true }} />
              <TextField
                select
                label="Assigned To"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleFormChange}
                required
                fullWidth
              >
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Contact"
                name="contact"
                value={form.contact}
                onChange={handleFormChange}
                required
                fullWidth
                disabled={contacts.length === 0}
              >
                {contacts.length === 0 ? (
                  <MenuItem value="" disabled>
                    {addLoading ? 'Loading contacts...' : 'No contacts found'}
                  </MenuItem>
                ) : (
                  contacts.map(contact => (
                    <MenuItem key={contact._id} value={contact._id}>
                      {contact.firstName} {contact.lastName} ({contact.email})
                    </MenuItem>
                  ))
                )}
              </TextField>
              <TextField select label="Priority" name="priority" value={form.priority} onChange={handleFormChange} required fullWidth>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
              {addError && <Typography color="error">{addError}</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddClose} disabled={addLoading}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add Deal'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Container>
  );
};

export default Deals; 