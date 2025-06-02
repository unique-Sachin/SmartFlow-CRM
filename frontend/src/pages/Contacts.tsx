import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Alert,
  Box, Button,
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
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
}

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'customer', label: 'Customer' },
];

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: 'lead',
    company: '',
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/contacts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContacts(data.contacts);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddOpen = () => {
    setForm({ firstName: '', lastName: '', email: '', status: 'lead', company: '' });
    setAddError(null);
    setAddOpen(true);
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
      const res = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...form, assignedTo: user?.id, source: 'direct' }),
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to add contact');
      }
      setAddOpen(false);
      fetchContacts();
    } catch (err: any) {
      setAddError(err.message || 'Unknown error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${API_URL}/contacts/${deleteId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to delete contact');
      }
      setDeleteId(null);
      fetchContacts();
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (contact: Contact) => {
    setEditForm({ ...contact });
    setEditError(null);
    setEditOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Contacts</Typography>
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
            {contacts.map(contact => (
              <Grow in={true} timeout={500} key={contact._id}>
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
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/contacts/${contact._id}`)}
                >
                  <ListItemText
                    primary={<Typography fontWeight={600} fontSize={{ xs: 15, sm: 17 }}>{contact.firstName} {contact.lastName}</Typography>}
                    secondary={<>
                      <span>Email: {contact.email}</span> | <span>Status: {contact.status}</span> | <span>Company: {contact.company || 'N/A'}</span>
                    </>}
                  />
                  {user && (
                    <>
                      <Tooltip title={user.role === 'lead_specialist' ? 'Not allowed for Lead Specialist' : 'Edit Contact'}>
                        <span>
                          <IconButton
                            sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }}
                            onClick={e => { e.stopPropagation(); if (user.role !== 'lead_specialist') handleEditClick(contact); }}
                            disabled={user.role === 'lead_specialist'}
                          >
                            <EditIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={user.role === 'lead_specialist' ? 'Not allowed for Lead Specialist' : 'Delete Contact'}>
                        <span>
                          <IconButton
                            color="error"
                            sx={{ transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.15)' } }}
                            onClick={e => { e.stopPropagation(); if (user.role !== 'lead_specialist') setDeleteId(contact._id); }}
                            disabled={user.role === 'lead_specialist'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </ListItem>
              </Grow>
            ))}
            {contacts.length === 0 && <Typography>No contacts found.</Typography>}
          </List>
        )}
      </Paper>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this contact?</Typography>
          {deleteError && <Typography color="error">{deleteError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleAddOpen}>Add Contact</Button>
      </Box>
      <Dialog open={addOpen} onClose={handleAddClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Contact</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleFormChange} required fullWidth />
            <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleFormChange} required fullWidth />
            <TextField label="Email" name="email" value={form.email} onChange={handleFormChange} required fullWidth type="email" />
            <TextField label="Company" name="company" value={form.company} onChange={handleFormChange} fullWidth />
            <TextField select label="Status" name="status" value={form.status} onChange={handleFormChange} fullWidth>
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            {addError && <Typography color="error">{addError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddClose} disabled={addLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={addLoading}>
              {addLoading ? 'Adding...' : 'Add Contact'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Contact</DialogTitle>
        <form onSubmit={async (e) => {
          e.preventDefault();
          setEditLoading(true);
          setEditError(null);
          try {
            const res = await fetch(`${API_URL}/contacts/${editForm._id}`, {
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
            fetchContacts();
          } catch (err: any) {
            setEditError(err.message || 'Unknown error');
          } finally {
            setEditLoading(false);
          }
        }}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="First Name" name="firstName" value={editForm?.firstName || ''} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} required fullWidth />
            <TextField label="Last Name" name="lastName" value={editForm?.lastName || ''} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} required fullWidth />
            <TextField label="Email" name="email" value={editForm?.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required fullWidth type="email" />
            <TextField label="Company" name="company" value={editForm?.company || ''} onChange={e => setEditForm({ ...editForm, company: e.target.value })} fullWidth />
            <TextField select label="Status" name="status" value={editForm?.status || 'lead'} onChange={e => setEditForm({ ...editForm, status: e.target.value })} fullWidth>
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            {editError && <Typography color="error">{editError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Contacts; 