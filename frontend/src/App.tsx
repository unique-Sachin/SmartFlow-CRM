import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Layout } from './components/layout/Layout';
import CssBaseline from '@mui/material/CssBaseline';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Deals from './pages/Deals';
import DealDetail from './pages/DealDetail';
import Users from './pages/Users';
import Leads from './pages/Leads';
import Reporting from './pages/Reporting';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import NotFound from './pages/NotFound';
import Documents from './pages/Documents';
import AICoach from './pages/AICoach';

function App() {
  // Layout for all protected routes
  const ProtectedLayout = () => (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );

  return (
    <Router>
        <CssBaseline />
        <AuthProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/contacts/:id" element={<ContactDetail />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/deals/:id" element={<DealDetail />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/users" element={<Users />} />
              <Route path="/reporting" element={<Reporting />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/ai-coach" element={<AICoach />} />
              <Route path="*" element={<NotFound />} />
              {/* Add more protected routes here */}
            </Route>
          </Routes>
        </LocalizationProvider>
        </AuthProvider>
    </Router>
  );
}

export default App;
