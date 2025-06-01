import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Input,
  Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Grow from '@mui/material/Grow';
import Skeleton from '@mui/material/Skeleton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Documents: React.FC = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/documents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to upload document');
      }
      setFile(null);
      fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Documents</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleUpload} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Input type="file" onChange={handleFileChange} disabled={uploading} />
          <Button type="submit" variant="contained" color="primary" disabled={uploading || !file}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
        {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
      </Paper>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" flexDirection="column" gap={2} minHeight={100}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Uploaded At</TableCell>
                  <TableCell>Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <Grow in={true} timeout={500} key={doc._id}>
                    <TableRow
                      sx={{
                        transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)',
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: 3,
                          background: '#f5faff',
                        },
                      }}
                    >
                      <TableCell>{doc.originalName || doc.fileName || doc.title}</TableCell>
                      <TableCell>{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</TableCell>
                      <TableCell>{doc.metadata?.createdAt ? new Date(doc.metadata.createdAt).toLocaleString() : ''}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          href={`${API_URL}/documents/${doc._id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            transition: 'transform 0.18s',
                            '&:hover': { transform: 'scale(1.12)' }
                          }}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  </Grow>
                ))}
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No documents found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default Documents; 