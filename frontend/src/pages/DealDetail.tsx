import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, CircularProgress, Button, Chip, Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Grow from '@mui/material/Grow';
import Skeleton from '@mui/material/Skeleton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Deal {
  _id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  assignedTo: string;
  contact: string;
  company?: string;
  notes: string;
  tags: string[];
  priority: string;
  lossReason?: string;
  winReason?: string;
  competitors?: string[];
  activities: Array<{
    type: string;
    date: string;
    description: string;
    outcome?: string;
    nextAction?: string;
  }>;
}

const stageLabels: Record<string, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const DealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [coachData, setCoachData] = useState<{ nextSteps: string; probability: number } | null>(null);
  const [coachRequested, setCoachRequested] = useState(false);
  const [objectionOpen, setObjectionOpen] = useState(false);
  const [objectionText, setObjectionText] = useState('');
  const [objectionLoading, setObjectionLoading] = useState(false);
  const [objectionError, setObjectionError] = useState<string | null>(null);
  const [objectionResponses, setObjectionResponses] = useState<string[] | null>(null);
  const [winLossRequested, setWinLossRequested] = useState(false);
  const [winLossLoading, setWinLossLoading] = useState(false);
  const [winLossError, setWinLossError] = useState<string | null>(null);
  const [winLossData, setWinLossData] = useState<{ explanation: string } | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/deals/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch deal');
        const data = await res.json();
        setDeal(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id, token]);

  const handleGetCoach = async () => {
    if (!deal) return;
    setCoachRequested(true);
    setCoachLoading(true);
    setCoachError(null);
    setCoachData(null);
    try {
      const res = await fetch(`${API_URL}/ai/deal-coach/${deal._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch AI deal coach');
      const data = await res.json();
      setCoachData(data);
    } catch (err: any) {
      setCoachError(err.message || 'Unknown error');
    } finally {
      setCoachLoading(false);
    }
  };

  const handleObjection = async () => {
    setObjectionLoading(true);
    setObjectionError(null);
    setObjectionResponses(null);
    try {
      const res = await fetch(`${API_URL}/ai/objection-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ objection: objectionText, dealId: deal?._id }),
      });
      if (!res.ok) throw new Error('Failed to get AI objection responses');
      const data = await res.json();
      setObjectionResponses(data.responses);
    } catch (err: any) {
      setObjectionError(err.message || 'Unknown error');
    } finally {
      setObjectionLoading(false);
    }
  };

  const handleGetWinLoss = async () => {
    if (!deal) return;
    setWinLossRequested(true);
    setWinLossLoading(true);
    setWinLossError(null);
    setWinLossData(null);
    try {
      const res = await fetch(`${API_URL}/ai/win-loss-explainer/${deal._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch AI win-loss explanation');
      const data = await res.json();
      setWinLossData(data);
    } catch (err: any) {
      setWinLossError(err.message || 'Unknown error');
    } finally {
      setWinLossLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" gap={2} minHeight={200}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    return <Paper sx={{ p: 2, color: 'error.main' }}>{error}</Paper>;
  }

  if (!deal) {
    return <Typography>No deal found.</Typography>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {loading ? (
        <Box display="flex" flexDirection="column" gap={2} minHeight={200}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <Grow in={true} timeout={500}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" gutterBottom>
                {deal.title}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/deals')}
                sx={{
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  '&:hover': { transform: 'scale(1.07)', boxShadow: 3 }
                }}
              >
                Back to Pipeline
              </Button>
            </Box>
            <Typography>Value: {deal.value} {deal.currency}</Typography>
            <Typography>Stage: {stageLabels[deal.stage] || deal.stage}</Typography>
            <Typography>Probability: {deal.probability}%</Typography>
            <Typography>Expected Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</Typography>
            {deal.actualCloseDate && <Typography>Actual Close: {new Date(deal.actualCloseDate).toLocaleDateString()}</Typography>}
            <Typography>Priority: {deal.priority}</Typography>
            <Typography>Assigned To: {deal.assignedTo}</Typography>
            <Typography>Contact: {deal.contact}</Typography>
            {deal.company && <Typography>Company: {deal.company}</Typography>}
            <Typography>Notes: {deal.notes || 'None'}</Typography>
            <Typography>Tags: {deal.tags.join(', ') || 'None'}</Typography>
            {deal.lossReason && <Typography color="error">Loss Reason: {deal.lossReason}</Typography>}
            {deal.winReason && <Typography color="success.main">Win Reason: {deal.winReason}</Typography>}
            {deal.competitors && deal.competitors.length > 0 && (
              <Typography>Competitors: {deal.competitors.join(', ')}</Typography>
            )}
            <Box mt={2} mb={2}>
              <Button
                variant="outlined"
                onClick={() => setObjectionOpen(true)}
                sx={{
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  '&:hover': { transform: 'scale(1.07)', boxShadow: 3 }
                }}
              >
                Objection Handler
              </Button>
            </Box>
            <Box mt={4} mb={2}>
              <Typography variant="h6" gutterBottom>AI Deal Coach</Typography>
              <Button variant="contained" onClick={handleGetCoach} disabled={coachLoading || !deal} sx={{ mb: 2 }}>
                {coachLoading ? 'Loading...' : 'Get AI Next Steps'}
              </Button>
              {coachRequested && (
                coachLoading ? (
                  <Box display="flex" alignItems="center"><CircularProgress size={20} sx={{ mr: 2 }} /> Loading AI insights...</Box>
                ) : coachError ? (
                  <Alert severity="error">{coachError}</Alert>
                ) : coachData ? (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Next Steps:</Typography>
                    <Typography sx={{ mb: 2 }}>{coachData.nextSteps}</Typography>
                    <Typography variant="subtitle1">AI Close Probability: <b>{coachData.probability}%</b></Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No AI insights available.</Typography>
                )
              )}
            </Box>
            <Box mt={4}>
              <Typography variant="h6">Activities</Typography>
              {deal.activities.length === 0 ? (
                <Typography>No activities yet.</Typography>
              ) : (
                deal.activities.map((activity, idx) => (
                  <Box key={idx} sx={{ mt: 1, mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                    <Chip label={activity.type} size="small" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" display="inline">{new Date(activity.date).toLocaleString()}</Typography>
                    <Typography>{activity.description}</Typography>
                    {activity.outcome && <Typography>Outcome: {activity.outcome}</Typography>}
                    {activity.nextAction && <Typography>Next: {activity.nextAction}</Typography>}
                  </Box>
                ))
              )}
            </Box>
            <Dialog open={objectionOpen} onClose={() => setObjectionOpen(false)} fullWidth maxWidth="sm">
              <DialogTitle>Objection Handler</DialogTitle>
              <DialogContent>
                <TextField
                  label="Paste customer objection here"
                  value={objectionText}
                  onChange={e => setObjectionText(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleObjection}
                  disabled={objectionLoading || !objectionText.trim()}
                  sx={{ mb: 2 }}
                >
                  {objectionLoading ? 'Getting AI Response...' : 'Get AI Response'}
                </Button>
                {objectionLoading && <Box display="flex" alignItems="center"><CircularProgress size={20} sx={{ mr: 2 }} /> Loading...</Box>}
                {objectionError && <Alert severity="error">{objectionError}</Alert>}
                {objectionResponses && (
                  <Box mt={2}>
                    <Typography variant="subtitle1">AI Suggested Responses:</Typography>
                    <ul>
                      {objectionResponses.map((resp, idx) => <li key={idx}>{resp}</li>)}
                    </ul>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setObjectionOpen(false)}>Close</Button>
              </DialogActions>
            </Dialog>
            {['closed_won', 'closed_lost'].includes(deal.stage) && (
              <Box mt={4} mb={2}>
                <Typography variant="h6" gutterBottom>Win-Loss Analysis</Typography>
                <Button variant="contained" onClick={handleGetWinLoss} disabled={winLossLoading || !deal} sx={{ mb: 2 }}>
                  {winLossLoading ? 'Loading...' : 'Get AI Explanation'}
                </Button>
                {winLossRequested && (
                  winLossLoading ? (
                    <Box display="flex" alignItems="center"><CircularProgress size={20} sx={{ mr: 2 }} /> Loading AI explanation...</Box>
                  ) : winLossError ? (
                    <Alert severity="error">{winLossError}</Alert>
                  ) : winLossData ? (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>AI Explanation:</Typography>
                      <Typography>{winLossData.explanation}</Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No AI explanation available.</Typography>
                  )
                )}
              </Box>
            )}
          </Paper>
        </Grow>
      )}
    </Container>
  );
};

export default DealDetail; 