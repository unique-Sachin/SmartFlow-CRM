import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: string;
  source: string;
  assignedTo: string;
  tags: string[];
  notes: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  interactions: Array<{
    type: string;
    date: string;
    summary: string;
    outcome?: string;
  }>;
  preferences?: {
    communicationChannel: string;
    frequency: string;
    newsletter: boolean;
  };
  lastContactDate?: string;
  nextFollowUp?: string;
}

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'customer', label: 'Customer' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [interactionForm, setInteractionForm] = useState({
    type: 'note',
    summary: '',
    outcome: '',
  });
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [personaLoading, setPersonaLoading] = useState(false);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [personaData, setPersonaData] = useState<{ persona: string; traits: string[]; communicationStyle: string; recommendations: string } | null>(null);
  const [personaRequested, setPersonaRequested] = useState(false);

  const fetchContact = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/contacts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch contact');
      const data = await res.json();
      setContact(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
    // eslint-disable-next-line
  }, [id]);

  const handleEditOpen = () => {
    if (!contact) return;
    setEditForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      position: contact.position || '',
      status: contact.status,
    });
    setEditError(null);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editForm),
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to update contact');
      }
      setEditOpen(false);
      fetchContact();
    } catch (err: any) {
      setEditError(err.message || 'Unknown error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to delete contact');
      }
      setDeleteConfirmOpen(false);
      navigate('/contacts');
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInteractionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInteractionForm({ ...interactionForm, [e.target.name]: e.target.value });
  };

  const handleInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInteractionLoading(true);
    setInteractionError(null);
    try {
      const res = await fetch(`${API_URL}/contacts/${id}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(interactionForm),
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to add interaction');
      }
      setInteractionForm({ type: 'note', summary: '', outcome: '' });
      fetchContact();
    } catch (err: any) {
      setInteractionError(err.message || 'Unknown error');
    } finally {
      setInteractionLoading(false);
    }
  };

  const handleGetPersona = async () => {
    setPersonaRequested(true);
    setPersonaLoading(true);
    setPersonaError(null);
    setPersonaData(null);
    try {
      const res = await fetch(`${API_URL}/ai/persona/${id}`, {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Paper sx={{ p: 2, color: 'error.main' }}>{error}</Paper>;
  }

  if (!contact) {
    return <Typography>No contact found.</Typography>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" gutterBottom>
            {contact.firstName} {contact.lastName}
          </Typography>
          <Box>
            <Button variant="outlined" onClick={handleEditOpen} sx={{ mr: 1 }}>Edit</Button>
            <Button variant="outlined" color="error" onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
          </Box>
        </Box>
        <Typography>Email: {contact.email}</Typography>
        <Typography>Phone: {contact.phone || 'N/A'}</Typography>
        <Typography>Company: {contact.company || 'N/A'}</Typography>
        <Typography>Position: {contact.position || 'N/A'}</Typography>
        <Typography>Status: {contact.status}</Typography>
        <Typography>Source: {contact.source}</Typography>
        <Typography>Assigned To: {contact.assignedTo}</Typography>
        <Typography>Tags: {contact.tags.join(', ') || 'None'}</Typography>
        <Typography>Notes: {contact.notes || 'None'}</Typography>
        <Box mt={4} mb={2}>
          <Typography variant="h6" gutterBottom>AI Persona Profile</Typography>
          <Button variant="contained" onClick={handleGetPersona} disabled={personaLoading || !contact} sx={{ mb: 2 }}>
            {personaLoading ? 'Loading...' : 'Generate Persona'}
          </Button>
          {personaRequested && (
            personaLoading ? (
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
            )
          )}
        </Box>
        <Box mt={2}>
          <Button variant="outlined" onClick={() => navigate('/contacts')}>Back to Contacts</Button>
        </Box>
        <Box mt={4}>
          <Typography variant="h6">Interactions</Typography>
          {/* Add interaction form */}
          <Box component="form" onSubmit={handleInteractionSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <TextField
              select
              label="Type"
              name="type"
              value={interactionForm.type}
              onChange={handleInteractionChange}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="note">Note</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="call">Call</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
            </TextField>
            <TextField
              label="Summary"
              name="summary"
              value={interactionForm.summary}
              onChange={handleInteractionChange}
              size="small"
              required
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              label="Outcome"
              name="outcome"
              value={interactionForm.outcome}
              onChange={handleInteractionChange}
              size="small"
              sx={{ minWidth: 120 }}
            />
            <Button type="submit" variant="contained" color="primary" disabled={interactionLoading}>
              {interactionLoading ? 'Adding...' : 'Add'}
            </Button>
            {interactionError && <Typography color="error">{interactionError}</Typography>}
          </Box>
          {/* List of interactions */}
          {contact.interactions.length === 0 ? (
            <Typography>No interactions yet.</Typography>
          ) : (
            contact.interactions.map((interaction, idx) => (
              <Box key={idx} sx={{ mt: 1, mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle2">{interaction.type} on {new Date(interaction.date).toLocaleString()}</Typography>
                <Typography>{interaction.summary}</Typography>
                {interaction.outcome && <Typography>Outcome: {interaction.outcome}</Typography>}
              </Box>
            ))
          )}
        </Box>
      </Paper>
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Contact</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="First Name" name="firstName" value={editForm?.firstName || ''} onChange={handleEditChange} required fullWidth />
            <TextField label="Last Name" name="lastName" value={editForm?.lastName || ''} onChange={handleEditChange} required fullWidth />
            <TextField label="Email" name="email" value={editForm?.email || ''} onChange={handleEditChange} required fullWidth type="email" />
            <TextField label="Phone" name="phone" value={editForm?.phone || ''} onChange={handleEditChange} fullWidth />
            <TextField label="Company" name="company" value={editForm?.company || ''} onChange={handleEditChange} fullWidth />
            <TextField label="Position" name="position" value={editForm?.position || ''} onChange={handleEditChange} fullWidth />
            <TextField select label="Status" name="status" value={editForm?.status || 'lead'} onChange={handleEditChange} fullWidth>
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            {editError && <Typography color="error">{editError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose} disabled={editLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this contact?</Typography>
          {deleteError && <Typography color="error">{deleteError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContactDetail; 