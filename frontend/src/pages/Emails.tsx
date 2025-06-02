import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box, Button,
  Chip,
  CircularProgress,
  Container, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const emailTypes = [
  { value: '', label: 'All' },
  { value: 'manual', label: 'Manual' },
  { value: 'bulk', label: 'Bulk' },
  { value: 'template', label: 'Template' },
  { value: 'ai', label: 'AI' },
];
const emailStatuses = [
  { value: '', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
];

const Emails: React.FC = () => {
  const { user, token } = useAuth();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [viewEmail, setViewEmail] = useState<any | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRecipients, setBulkRecipients] = useState<string[]>([]);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkPrompt, setBulkPrompt] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [recipientOptions, setRecipientOptions] = useState<any[]>([]);
  const [recipientLoading, setRecipientLoading] = useState(false);

  // Fetch emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      const res = await fetch(`${API_URL}/emails?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmails(); }, [search, type, status]);

  // Fetch recipients (leads + contacts)
  const fetchRecipients = async () => {
    setRecipientLoading(true);
    try {
      const [leadsRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/leads`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch(`${API_URL}/contacts`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      ]);
      const leadsData = await leadsRes.json();
      const contactsData = await contactsRes.json();
      const leadOptions = (leadsData.leads || []).map((l: any) => ({ label: `${l.firstName} ${l.lastName} (Lead)`, value: l.email }));
      const contactOptions = (contactsData.contacts || []).map((c: any) => ({ label: `${c.firstName} ${c.lastName} (Contact)`, value: c.email }));
      setRecipientOptions([...leadOptions, ...contactOptions]);
    } catch {
      setRecipientOptions([]);
    } finally {
      setRecipientLoading(false);
    }
  };

  // Bulk email send
  const handleBulkSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkLoading(true);
    setBulkResult([]);
    try {
      const res = await fetch(`${API_URL}/emails/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ recipients: bulkRecipients, subject: bulkSubject, body: bulkMessage }),
      });
      const data = await res.json();
      setBulkResult(data.results || []);
      fetchEmails();
    } catch {
      setBulkResult([{ to: 'All', status: 'failed', error: 'Bulk send failed' }]);
    } finally {
      setBulkLoading(false);
    }
  };

  // AI email generation for bulk
  const handleAIGenerate = async () => {
    if (!bulkPrompt.trim()) {
      setAiError('Please enter a prompt for the AI.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      // Use the first recipient as context for AI
      const lead = recipientOptions.find(r => r.value === bulkRecipients[0]);
      const res = await fetch(`${API_URL}/ai/generate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: bulkPrompt, lead }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'AI failed to generate email');
      setBulkSubject(data.subject || '');
      setBulkMessage(data.message || '');
    } catch (err: any) {
      setAiError(err.message || 'Unknown error');
    } finally {
      setAiLoading(false);
    }
  };

  // Open bulk modal and fetch recipients
  const openBulkModal = () => {
    setBulkOpen(true);
    setBulkRecipients([]);
    setBulkSubject('');
    setBulkMessage('');
    setBulkPrompt('');
    setBulkResult([]);
    setAiError(null);
    fetchRecipients();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Sent Emails</Typography>
      <Box mb={2} display="flex" gap={2} alignItems="center">
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          InputProps={{ endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment> }}
        />
        <TextField
          label="Type"
          select
          value={type}
          onChange={e => setType(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {emailTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </TextField>
        <TextField
          label="Status"
          select
          value={status}
          onChange={e => setStatus(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {emailStatuses.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </TextField>
        <Button variant="contained" startIcon={<EmailIcon />} onClick={openBulkModal} disabled={!user || !['super_admin', 'sales_manager'].includes(user.role)}>
          Bulk Email
        </Button>
      </Box>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>To</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Sent By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emails.map(email => (
                  <TableRow key={email._id}>
                    <TableCell>{email.to}</TableCell>
                    <TableCell>{email.subject}</TableCell>
                    <TableCell>{email.sentBy ? `${email.sentBy.firstName} ${email.sentBy.lastName}` : 'System'}</TableCell>
                    <TableCell>{new Date(email.sentAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={email.status} color={email.status === 'sent' ? 'success' : 'error'} size="small" />
                    </TableCell>
                    <TableCell>{email.type}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => setViewEmail(email)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {emails.length === 0 && (
                  <TableRow><TableCell colSpan={7}><Typography align="center">No emails found.</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* View Email Modal */}
      <Dialog open={!!viewEmail} onClose={() => setViewEmail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Email Details</DialogTitle>
        <DialogContent>
          {viewEmail && (
            <Box>
              <Typography variant="subtitle2">To:</Typography>
              <Typography mb={1}>{viewEmail.to}</Typography>
              <Typography variant="subtitle2">Subject:</Typography>
              <Typography mb={1}>{viewEmail.subject}</Typography>
              <Typography variant="subtitle2">Sent By:</Typography>
              <Typography mb={1}>{viewEmail.sentBy ? `${viewEmail.sentBy.firstName} ${viewEmail.sentBy.lastName}` : 'System'}</Typography>
              <Typography variant="subtitle2">Date:</Typography>
              <Typography mb={1}>{new Date(viewEmail.sentAt).toLocaleString()}</Typography>
              <Typography variant="subtitle2">Status:</Typography>
              <Typography mb={1}>{viewEmail.status}</Typography>
              <Typography variant="subtitle2">Type:</Typography>
              <Typography mb={1}>{viewEmail.type}</Typography>
              <Typography variant="subtitle2">Body:</Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, whiteSpace: 'pre-line', background: '#f9f9f9' }}>{viewEmail.body}</Paper>
              {viewEmail.error && <Typography color="error" mt={2}>Error: {viewEmail.error}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewEmail(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Bulk Email Modal */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Email</DialogTitle>
        <form onSubmit={handleBulkSend}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Recipients"
              select
              SelectProps={{ multiple: true }}
              value={bulkRecipients}
              onChange={e => setBulkRecipients(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              fullWidth
              required
              disabled={recipientLoading}
              helperText="Select one or more leads/contacts"
            >
              {recipientOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                label="AI Prompt (describe the purpose/tone)"
                value={bulkPrompt}
                onChange={e => setBulkPrompt(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. Announce new product, friendly and concise"
                disabled={aiLoading}
              />
              <Button
                variant="outlined"
                onClick={handleAIGenerate}
                disabled={aiLoading || !bulkPrompt.trim()}
                sx={{ minWidth: 140 }}
              >
                {aiLoading ? 'Generating...' : 'Generate with AI'}
              </Button>
            </Box>
            {aiError && <Typography color="error">{aiError}</Typography>}
            <TextField label="Subject" value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} fullWidth required margin="normal" />
            <TextField label="Message" value={bulkMessage} onChange={e => setBulkMessage(e.target.value)} fullWidth required margin="normal" multiline minRows={4} />
            {bulkResult.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2">Send Results:</Typography>
                {bulkResult.map((r, i) => (
                  <Typography key={i} color={r.status === 'sent' ? 'success.main' : 'error.main'}>
                    {r.to}: {r.status} {r.error && `- ${r.error}`}
                  </Typography>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkOpen(false)} disabled={bulkLoading}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={bulkLoading || !bulkRecipients.length || !bulkSubject || !bulkMessage}>
              {bulkLoading ? 'Sending...' : 'Send'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Emails; 