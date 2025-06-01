import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Box, Button, TextField, MenuItem, List, ListItem, ListItemText, CircularProgress, Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Grow from '@mui/material/Grow';
import Skeleton from '@mui/material/Skeleton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'sales_representative', label: 'Sales Representative' },
  { value: 'lead_specialist', label: 'Lead Generation Specialist' },
];

const Users: React.FC = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'sales_manager',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'super_admin') return;
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err: any) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, token, addSuccess]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.msg || data?.error || 'Failed to add user');
      }
      setAddSuccess('User created successfully!');
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'sales_manager' });
    } catch (err: any) {
      setAddError(err.message || 'Unknown error');
    } finally {
      setAddLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return <Container sx={{ mt: 4 }}><Alert severity="error">Access denied. Super Admins only.</Alert></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New User</Typography>
        <form onSubmit={handleAddUser} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleFormChange} required size="small" />
          <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleFormChange} required size="small" />
          <TextField label="Email" name="email" value={form.email} onChange={handleFormChange} required size="small" type="email" />
          <TextField label="Password" name="password" value={form.password} onChange={handleFormChange} required size="small" type="password" />
          <TextField select label="Role" name="role" value={form.role} onChange={handleFormChange} required size="small">
            {roleOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" color="primary" disabled={addLoading} sx={{ minWidth: 120 }}>
            {addLoading ? 'Adding...' : 'Add User'}
          </Button>
        </form>
        {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
        {addSuccess && <Alert severity="success" sx={{ mt: 2 }}>{addSuccess}</Alert>}
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>User List</Typography>
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
            {users.map(u => (
              <Grow in={true} timeout={500} key={u._id}>
                <ListItem
                  divider
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
                    primary={<Typography fontWeight={600} fontSize={{ xs: 15, sm: 17 }}>{u.firstName} {u.lastName} ({u.email})</Typography>}
                    secondary={`Role: ${u.role}`}
                  />
                </ListItem>
              </Grow>
            ))}
            {users.length === 0 && <Typography>No users found.</Typography>}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Users; 