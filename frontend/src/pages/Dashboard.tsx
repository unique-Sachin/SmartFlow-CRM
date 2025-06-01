import React from 'react';
import { Box, Container,  GridLegacy as Grid, Paper, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';
import SalesManagerDashboard from '../components/dashboard/SalesManagerDashboard';
import SalesRepDashboard from '../components/dashboard/SalesRepDashboard';
import LeadSpecialistDashboard from '../components/dashboard/LeadSpecialistDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'sales_manager':
        return <SalesManagerDashboard />;
      case 'sales_representative':
        return <SalesRepDashboard />;
      case 'lead_specialist':
        return <LeadSpecialistDashboard />;
      default:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" color="error">
              Invalid role or not authenticated
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',  
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 6px rgba(0, 0, 0, 0.2)'
                  : '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography component="h1" variant="h4" color="primary" gutterBottom>
              Welcome, {user?.firstName} {user?.lastName}
            </Typography>
            {renderDashboard()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;