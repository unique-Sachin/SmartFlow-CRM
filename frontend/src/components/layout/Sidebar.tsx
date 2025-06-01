import { styled } from '@mui/material/styles';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Lightbulb as LightbulbIcon,
  Logout as LogoutIcon,
  AssignmentInd as AssignmentIndIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../../contexts/AuthContext';
import Chip from '@mui/material/Chip';

const DRAWER_WIDTH = 280;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    background: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.palette.divider} ${theme.palette.background.paper}`,
    '&::-webkit-scrollbar': {
      width: 6,
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.divider,
      borderRadius: 4,
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
  },
}));

const Logo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Contacts', icon: <PeopleIcon />, path: '/contacts' },
  { text: 'Deals', icon: <AssessmentIcon />, path: '/deals' },
  { text: 'Leads', icon: <AssignmentIndIcon />, path: '/leads', roles: ['super_admin', 'sales_manager', 'lead_specialist'] },
  { text: 'Documents', icon: <DescriptionIcon />, path: '/documents' },
  { text: 'Reporting', icon: <AssessmentIcon />, path: '/reporting' },
  { text: 'AI Coach', icon: <LightbulbIcon />, path: '/ai-coach' },
  { text: 'Email', icon: <EmailIcon />, path: '/email' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const roleMap: Record<string, string> = {
    super_admin: 'Super Admin',
    sales_manager: 'Sales Manager',
    sales_representative: 'Sales Rep',
    lead_specialist: 'Lead Specialist',
    support: 'Support',
    user: 'User',
  };

  return (
    <StyledDrawer variant="permanent">
      <Logo>
        {user && (
          <Chip
            label={roleMap[user.role] || user.role}
            color="primary"
            sx={{ fontWeight: 600, fontSize: 16, px: 2, py: 1, borderRadius: 2 }}
          />
        )}
      </Logo>
      <List>
        {navigationItems.map((item) => {
          if (item.text === 'Leads' && user && !['super_admin', 'sales_manager', 'lead_specialist'].includes(user.role)) {
            return null;
          }
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'inherit',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
        {/* Super Admin: User Management link */}
        {user?.role === 'super_admin' && (
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/users'}
              onClick={() => navigate('/users')}
              sx={{
                borderRadius: 1,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><PeopleIcon /></ListItemIcon>
              <ListItemText primary="User Management" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      {/* Logout button */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{ width: '100%' }}
        >
          Logout
        </Button>
      </Box>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <IconButton onClick={toggleTheme} color="inherit">
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
    </StyledDrawer>
  );
}; 