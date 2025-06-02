import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StarIcon from '@mui/icons-material/Star';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import EmailIcon from '@mui/icons-material/Email';
import {
  Alert,
  Box, Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List, ListItem, ListItemText,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import Grow from '@mui/material/Grow';
import Skeleton from '@mui/material/Skeleton';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusOptions = [
  'new', 'contacted', 'qualified', 'unqualified', 'lost'
];
const sourceOptions = [
  'website', 'referral', 'social', 'event', 'cold_outreach', 'other'
];

type LeadForm = {
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  source: string;
  score: number;
  assignedTo: string;
  location: { country?: string };
};

const Leads: React.FC = () => {
  const { user, token } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<LeadForm>({
    firstName: '',
    lastName: '',
    email: '',
    status: 'new',
    source: 'website',
    score: 0,
    assignedTo: '',
    location: { country: '' },
  });
  const [users, setUsers] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scoreValue, setScoreValue] = useState(0);
  const [nurtureOpen, setNurtureOpen] = useState(false);
  const [nurtureLoading, setNurtureLoading] = useState(false);
  const [nurtureError, setNurtureError] = useState<string | null>(null);
  const [nurtureSequence, setNurtureSequence] = useState('');
  const [nurtureStatus, setNurtureStatus] = useState('new');
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [convertSuccess, setConvertSuccess] = useState<string | null>(null);
  const [convertDeal, setConvertDeal] = useState<any | null>(null);
  const [convertForm, setConvertForm] = useState<{ value: number; expectedCloseDate: string; currency: string }>({ value: 0, expectedCloseDate: '', currency: 'INR' });
  const [personaOpen, setPersonaOpen] = useState(false);
  const [personaLoading, setPersonaLoading] = useState(false);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [personaData, setPersonaData] = useState<{ persona: string; traits: string[]; communicationStyle: string; recommendations: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedLeads, setImportedLeads] = useState<any[]>([]);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailLoading, setMailLoading] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const [mailSuccess, setMailSuccess] = useState<string | null>(null);
  const [mailSubject, setMailSubject] = useState('');
  const [mailMessage, setMailMessage] = useState('');
  const [mailPrompt, setMailPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/leads`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (!user || !['super_admin', 'sales_manager', 'lead_specialist', 'sales_representative'].includes(user.role)) return;
    fetchLeads();
    fetchUsers();
  }, [user, token, addSuccess]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      setForm({
        ...form,
        location: {
          ...form.location,
          [name.split('.')[1]]: value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);
    // Prepare lead data with required metadata fields
    const leadData: any = {
      ...form,
      metadata: {
        firstTouchpoint: 'manual entry',
        lastTouchpoint: 'manual entry',
        totalTouchpoints: 1
      }
    };
    // Only include location if country is provided
    if (form.location && typeof form.location.country === 'string' && form.location.country.trim() !== '') {
      leadData.location = { country: form.location.country.trim() };
    }
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to add lead');
      }
      setAddSuccess('Lead created successfully!');
      setForm({ firstName: '', lastName: '', email: '', status: 'new', source: 'website', score: 0, assignedTo: '', location: { country: '' } });
      setAddOpen(false);
    } catch (err: any) {
      setAddError(err.message || 'Unknown error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditClick = (lead: any) => {
    setEditForm({ ...lead });
    setEditOpen(true);
    setEditError(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`${API_URL}/leads/${editForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to update lead');
      }
      setEditOpen(false);
      setEditForm(null);
      setAddSuccess('Lead updated successfully!');
      fetchLeads();
    } catch (err: any) {
      setEditError(err.message || 'Unknown error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (lead: any) => {
    setSelectedLead(lead);
    setDeleteOpen(true);
    setDeleteError(null);
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${API_URL}/leads/${selectedLead._id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to delete lead');
      }
      setDeleteOpen(false);
      setSelectedLead(null);
      setAddSuccess('Lead deleted successfully!'); // triggers reload
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Assign Lead
  const handleAssignClick = (lead: any) => {
    setSelectedLead(lead);
    setAssignUserId(lead.assignedTo || '');
    setAssignOpen(true);
    setAssignError(null);
  };
  const handleAssignLead = async () => {
    if (!selectedLead || !assignUserId) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      const res = await fetch(`${API_URL}/leads/${selectedLead._id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ assignedTo: assignUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to assign lead');
      }
      setAssignOpen(false);
      setSelectedLead(null);
      setAddSuccess('Lead assigned successfully!');
    } catch (err: any) {
      setAssignError(err.message || 'Unknown error');
    } finally {
      setAssignLoading(false);
    }
  };

  // Score Lead
  const handleScoreClick = (lead: any) => {
    setSelectedLead(lead);
    setScoreValue(lead.score || 0);
    setScoreOpen(true);
    setScoreError(null);
  };
  const handleScoreLead = async () => {
    if (!selectedLead) return;
    setScoreLoading(true);
    setScoreError(null);
    try {
      const res = await fetch(`${API_URL}/leads/${selectedLead._id}/score`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ score: scoreValue }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to update score');
      }
      setScoreOpen(false);
      setSelectedLead(null);
      setAddSuccess('Lead score updated!');
    } catch (err: any) {
      setScoreError(err.message || 'Unknown error');
    } finally {
      setScoreLoading(false);
    }
  };

  // Nurture Lead
  const handleNurtureClick = (lead: any) => {
    setSelectedLead(lead);
    setNurtureSequence(lead.nurturingSequence || '');
    setNurtureStatus(lead.status || 'new');
    setNurtureOpen(true);
    setNurtureError(null);
  };
  const handleNurtureLead = async () => {
    if (!selectedLead) return;
    setNurtureLoading(true);
    setNurtureError(null);
    try {
      const res = await fetch(`${API_URL}/leads/${selectedLead._id}/nurturing`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nurturingSequence: nurtureSequence, status: nurtureStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to update nurturing info');
      }
      setNurtureOpen(false);
      setSelectedLead(null);
      setAddSuccess('Lead nurturing updated!');
    } catch (err: any) {
      setNurtureError(err.message || 'Unknown error');
    } finally {
      setNurtureLoading(false);
    }
  };

  const handleConvertClick = (lead: any) => {
    setSelectedLead(lead);
    setConvertForm({ value: 0, expectedCloseDate: '', currency: 'INR' });
    setConvertOpen(true);
    setConvertError(null);
    setConvertSuccess(null);
    setConvertDeal(null);
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setConvertLoading(true);
    setConvertError(null);
    setConvertSuccess(null);
    setConvertDeal(null);
    try {
      const res = await fetch(`${API_URL}/leads/${selectedLead._id}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          value: convertForm.value,
          expectedCloseDate: convertForm.expectedCloseDate,
          currency: convertForm.currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to convert lead');
      setConvertSuccess('Lead converted to deal successfully!');
      setConvertDeal(data.deal);
      setAddSuccess('Lead converted successfully!'); // triggers reload
      fetchLeads();
    } catch (err: any) {
      setConvertError(err.message || 'Unknown error');
    } finally {
      setConvertLoading(false);
    }
  };

  const handlePersonaClick = async (lead: any) => {
    setPersonaOpen(true);
    setPersonaLoading(true);
    setPersonaError(null);
    setPersonaData(null);
    try {
      const res = await fetch(`${API_URL}/ai/persona/${lead._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch AI persona profile');
      const data = await res.json();
      setPersonaData(data);
    } catch (err: any) {
      setPersonaError(err.message || 'Unknown error');
    } finally {
      setPersonaLoading(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        setImportedLeads(results.data);
      },
      error: (err: any) => {
        setImportError('Failed to parse CSV: ' + err.message);
      },
    });
  };

  const handleImportLeads = async () => {
    setImportLoading(true);
    setImportError(null);
    try {
      const leadsWithAssigned = importedLeads.map(l => ({
        ...l,
        assignedTo: l.assignedTo || user?.id,
        location: { country: l.country || (l.location?.country) || 'Unknown' },
        metadata: {
          firstTouchpoint: l['metadata.firstTouchpoint'] || 'import',
          lastTouchpoint: l['metadata.lastTouchpoint'] || 'import',
          totalTouchpoints: 1
        }
      }));
      const res = await fetch(`${API_URL}/leads/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ leads: leadsWithAssigned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to import leads');
      setImportOpen(false);
      setImportedLeads([]);
      fetchLeads();
    } catch (err: any) {
      setImportError(err.message || 'Unknown error');
    } finally {
      setImportLoading(false);
    }
  };

  // Open mail modal for a lead
  const handleMailClick = (lead: any) => {
    setSelectedLead(lead);
    setMailSubject('');
    setMailMessage('');
    setMailError(null);
    setMailSuccess(null);
    setMailOpen(true);
  };

  // Send mail API call
  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setMailLoading(true);
    setMailError(null);
    setMailSuccess(null);
    try {
      const res = await fetch(`${API_URL}/leads/${selectedLead._id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subject: mailSubject, message: mailMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send email');
      setMailSuccess('Email sent successfully!');
      setMailOpen(false);
    } catch (err: any) {
      setMailError(err.message || 'Unknown error');
    } finally {
      setMailLoading(false);
    }
  };

  // AI email generation
  const handleAIGenerate = async () => {
    if (!selectedLead || !mailPrompt.trim()) {
      setAiError('Please enter a prompt for the AI.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_URL}/ai/generate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: mailPrompt, lead: selectedLead }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'AI failed to generate email');
      setMailSubject(data.subject || '');
      setMailMessage(data.message || '');
    } catch (err: any) {
      setAiError(err.message || 'Unknown error');
    } finally {
      setAiLoading(false);
    }
  };

  if (!user || !['super_admin', 'sales_manager', 'lead_specialist', 'sales_representative'].includes(user.role)) {
    return <Container sx={{ mt: 4 }}><Alert severity="error">Access denied.</Alert></Container>;
  }

  // Filter leads for sales representatives and exclude converted leads for all roles
  const visibleLeads = user.role === 'sales_representative'
    ? leads.filter(lead => (lead.assignedTo && (lead.assignedTo._id === user.id || lead.assignedTo === user.id)) && lead.status !== 'converted')
    : leads.filter(lead => lead.status !== 'converted');

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Lead Management</Typography>
      <Box mb={2} display="flex" justifyContent="flex-end" gap={2}>
        {user.role !== 'sales_representative' && (
          <>
            <Button variant="contained" color="primary" onClick={() => {
              setAddOpen(true);
              setForm(f => ({ ...f, assignedTo: '' }));
            }}>
              Add Lead
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setImportOpen(true)}>
              Import Leads
            </Button>
          </>
        )}
      </Box>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" flexDirection="column" gap={2} minHeight={100}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <List>
            {visibleLeads.map(lead => (
              <Grow in={true} timeout={500} key={lead._id}>
                <ListItem
                  divider
                  alignItems="flex-start"
                  sx={{
                    transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 4,
                      background: '#f5faff',
                    },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                  }}
                >
                  <ListItemText
                    primary={<>
                      <Typography fontWeight={600} fontSize={{ xs: 15, sm: 17 }}>{lead.firstName} {lead.lastName}</Typography>
                      <Chip label={lead.status} size="small" sx={{ ml: 1 }} />
                      <Chip icon={<StarIcon />} label={`Score: ${lead.score}`} size="small" sx={{ ml: 1 }} />
                    </>}
                    secondary={<>
                      <span>Email: {lead.email}</span> | <span>Source: {lead.source}</span> | <span>
                        Assigned: {
                          lead.assignedTo && typeof lead.assignedTo === 'object' && lead.assignedTo.firstName
                            ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                            : (lead.assignedTo ? `User ID: ${typeof lead.assignedTo === 'string' ? lead.assignedTo : ''}` : 'Unassigned')
                        }
                      </span>
                    </>}
                  />
                  {/* Only show these actions for non-sales_representative roles */}
                  {user.role !== 'sales_representative' && <>
                    <Tooltip title="Edit Lead"><IconButton sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }} onClick={() => handleEditClick(lead)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Delete Lead"><IconButton sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }} color="error" onClick={() => handleDeleteClick(lead)}><DeleteIcon /></IconButton></Tooltip>
                    <Tooltip title="Assign Lead"><IconButton sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }} onClick={() => handleAssignClick(lead)}><AssignmentIndIcon /></IconButton></Tooltip>
                    <Tooltip title="Update Score"><IconButton sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }} onClick={() => handleScoreClick(lead)}><StarIcon /></IconButton></Tooltip>
                    <Tooltip title="Nurturing"><IconButton sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }} onClick={() => handleNurtureClick(lead)}><TrackChangesIcon /></IconButton></Tooltip>
                    <Tooltip title="Send Email"><IconButton sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }} onClick={() => handleMailClick(lead)}><EmailIcon /></IconButton></Tooltip>
                  </>}
                  {/* AI Persona Profile is available to all */}
                  <Tooltip title="AI Persona Profile">
                    <IconButton sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }} onClick={() => handlePersonaClick(lead)}><SmartToyIcon /></IconButton>
                  </Tooltip>
                  {/* Convert to Deal: Only show if user is allowed (backend will enforce too) */}
                  {(['super_admin', 'sales_manager', 'sales_representative'].includes(user.role)) && (
                    <Tooltip title="Convert to Deal">
                      <span>
                        <IconButton sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }} onClick={() => handleConvertClick(lead)} disabled={lead.status === 'converted'}>
                          <MonetizationOnIcon color={lead.status === 'converted' ? 'disabled' : 'primary'} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </ListItem>
              </Grow>
            ))}
            {visibleLeads.length === 0 && <Typography>No leads found.</Typography>}
          </List>
        )}
      </Paper>
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Lead</DialogTitle>
        <form onSubmit={handleAddLead}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleFormChange} required fullWidth />
            <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleFormChange} required fullWidth />
            <TextField label="Email" name="email" value={form.email} onChange={handleFormChange} required fullWidth type="email" />
            <TextField select label="Status" name="status" value={form.status} onChange={handleFormChange} required fullWidth>
              {statusOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Source" name="source" value={form.source} onChange={handleFormChange} required fullWidth>
              {sourceOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            <TextField label="Score" name="score" value={form.score} onChange={handleFormChange} required fullWidth type="number" inputProps={{ min: 0, max: 100 }} />
            <TextField select label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={handleFormChange} fullWidth>
              <MenuItem value="">Unassigned</MenuItem>
              {users.map(u => (
                <MenuItem key={u._id} value={u._id}>{u.firstName} {u.lastName}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Country" name="location.country" value={form.location?.country || ''} onChange={handleFormChange} required fullWidth>
              <MenuItem value="">Select Country</MenuItem>
              <MenuItem value="India">India</MenuItem>
            </TextField>
            {addError && <Alert severity="error">{addError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)} disabled={addLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={addLoading}>
              {addLoading ? 'Adding...' : 'Add Lead'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Lead</DialogTitle>
        <form onSubmit={handleEditLead}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="First Name" name="firstName" value={editForm?.firstName || ''} onChange={handleEditFormChange} required fullWidth />
            <TextField label="Last Name" name="lastName" value={editForm?.lastName || ''} onChange={handleEditFormChange} required fullWidth />
            <TextField label="Email" name="email" value={editForm?.email || ''} onChange={handleEditFormChange} required fullWidth type="email" />
            <TextField select label="Status" name="status" value={editForm?.status || 'new'} onChange={handleEditFormChange} required fullWidth>
              {statusOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Source" name="source" value={editForm?.source || 'website'} onChange={handleEditFormChange} required fullWidth>
              {sourceOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            <TextField label="Score" name="score" value={editForm?.score || 0} onChange={handleEditFormChange} required fullWidth type="number" inputProps={{ min: 0, max: 100 }} />
            <TextField select label="Assigned To" name="assignedTo" value={editForm?.assignedTo || ''} onChange={handleEditFormChange} fullWidth>
              <MenuItem value="">Unassigned</MenuItem>
              {users.map(u => (
                <MenuItem key={u._id} value={u._id}>{u.firstName} {u.lastName}</MenuItem>
              ))}
            </TextField>
            {editError && <Alert severity="error">{editError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this lead?</Typography>
          {deleteError && <Alert severity="error">{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDeleteLead} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Assign Lead Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Assign Lead</DialogTitle>
        <DialogContent>
          <TextField select label="Assign To" value={assignUserId} onChange={e => setAssignUserId(e.target.value)} fullWidth required>
            {users.map(u => (
              <MenuItem key={u._id} value={u._id}>{u.firstName} {u.lastName}</MenuItem>
            ))}
          </TextField>
          {assignError && <Alert severity="error">{assignError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)} disabled={assignLoading}>Cancel</Button>
          <Button onClick={handleAssignLead} variant="contained" disabled={assignLoading || !assignUserId}>
            {assignLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Score Lead Dialog */}
      <Dialog open={scoreOpen} onClose={() => setScoreOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Update Lead Score</DialogTitle>
        <DialogContent>
          <TextField label="Score" type="number" value={scoreValue} onChange={e => setScoreValue(Number(e.target.value))} inputProps={{ min: 0, max: 100 }} fullWidth required />
          {scoreError && <Alert severity="error">{scoreError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScoreOpen(false)} disabled={scoreLoading}>Cancel</Button>
          <Button onClick={handleScoreLead} variant="contained" disabled={scoreLoading}>
            {scoreLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Nurture Lead Dialog */}
      <Dialog open={nurtureOpen} onClose={() => setNurtureOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nurturing Workflow</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Nurturing Sequence" value={nurtureSequence} onChange={e => setNurtureSequence(e.target.value)} fullWidth multiline minRows={2} />
          <TextField select label="Status" value={nurtureStatus} onChange={e => setNurtureStatus(e.target.value)} fullWidth>
            {statusOptions.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          {nurtureError && <Alert severity="error">{nurtureError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNurtureOpen(false)} disabled={nurtureLoading}>Cancel</Button>
          <Button onClick={handleNurtureLead} variant="contained" disabled={nurtureLoading}>
            {nurtureLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Convert Lead Dialog */}
      <Dialog open={convertOpen} onClose={() => setConvertOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Convert Lead to Deal</DialogTitle>
        <form onSubmit={handleConvertLead}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Deal Value"
              type="number"
              value={convertForm.value}
              onChange={e => setConvertForm(f => ({ ...f, value: Number(e.target.value) }))}
              required
              fullWidth
              inputProps={{ min: 0 }}
            />
            <DatePicker
              label="Expected Close Date"
              value={convertForm.expectedCloseDate ? dayjs(convertForm.expectedCloseDate, 'YYYY-MM-DD') : null}
              onChange={date => setConvertForm(f => ({ ...f, expectedCloseDate: date ? date.format('YYYY-MM-DD') : '' }))}
              format="DD/MM/YYYY"
              slotProps={{ textField: { required: true, fullWidth: true } }}
            />
            <TextField
              label="Currency"
              value={convertForm.currency}
              onChange={e => setConvertForm(f => ({ ...f, currency: e.target.value }))}
              required
              fullWidth
              select
            >
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </TextField>
            {convertError && <Alert severity="error">{convertError}</Alert>}
            {convertSuccess && convertDeal && (
              <Alert severity="success">
                {convertSuccess} <br />
                <Button size="small" onClick={() => navigate(`/deals/${convertDeal._id}`)} variant="outlined" sx={{ mt: 1 }}>
                  View Deal
                </Button>
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConvertOpen(false)} disabled={convertLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={convertLoading}>
              {convertLoading ? 'Converting...' : 'Convert'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={personaOpen} onClose={() => setPersonaOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>AI Persona Profile</DialogTitle>
        <DialogContent>
          {personaLoading ? (
            <Box display="flex" alignItems="center"><CircularProgress size={20} sx={{ mr: 2 }} /> Loading AI persona...</Box>
          ) : personaError ? (
            <Alert severity="error">{personaError}</Alert>
          ) : personaData ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Persona:</Typography>
              <Typography sx={{ mb: 2 }}>{personaData.persona}</Typography>
              <Typography variant="subtitle1">Traits:</Typography>
              <ul>{personaData.traits.map((trait, idx) => <li key={idx}>{trait}</li>)}</ul>
              <Typography variant="subtitle1">Communication Style:</Typography>
              <Typography sx={{ mb: 2 }}>{personaData.communicationStyle}</Typography>
              <Typography variant="subtitle1">Recommendations:</Typography>
              <Typography>{personaData.recommendations}</Typography>
            </Box>
          ) : (
            <Typography color="text.secondary">No AI persona available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPersonaOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Import Leads from CSV</DialogTitle>
        <DialogContent>
          <input type="file" accept=".csv" onChange={handleImportFile} />
          {importError && <Alert severity="error">{importError}</Alert>}
          {importedLeads.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle1">Preview ({importedLeads.length} leads):</Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                <pre style={{ fontSize: 12 }}>{JSON.stringify(importedLeads.slice(0, 5), null, 2)}{importedLeads.length > 5 ? '\n...and more' : ''}</pre>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)} disabled={importLoading}>Cancel</Button>
          <Button onClick={handleImportLeads} variant="contained" color="primary" disabled={importLoading || importedLeads.length === 0}>
            {importLoading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Mail Lead Dialog */}
      <Dialog open={mailOpen} onClose={() => setMailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send Email to Lead</DialogTitle>
        <form onSubmit={handleSendMail}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="To" value={selectedLead?.email || ''} fullWidth InputProps={{ readOnly: true }} margin="normal" />
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                label="AI Prompt (describe the purpose/tone)"
                value={mailPrompt}
                onChange={e => setMailPrompt(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. Follow up after demo, friendly and concise"
                disabled={aiLoading}
              />
              <Button
                variant="outlined"
                onClick={handleAIGenerate}
                disabled={aiLoading || !mailPrompt.trim()}
                sx={{ minWidth: 140 }}
              >
                {aiLoading ? 'Generating...' : 'Generate with AI'}
              </Button>
            </Box>
            {aiError && <Alert severity="error">{aiError}</Alert>}
            <TextField label="Subject" value={mailSubject} onChange={e => setMailSubject(e.target.value)} fullWidth required margin="normal" />
            <TextField label="Message" value={mailMessage} onChange={e => setMailMessage(e.target.value)} fullWidth required margin="normal" multiline minRows={4} />
            {mailError && <Alert severity="error">{mailError}</Alert>}
            {mailSuccess && <Alert severity="success">{mailSuccess}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMailOpen(false)} disabled={mailLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={mailLoading}>
              {mailLoading ? 'Sending...' : 'Send'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Leads; 