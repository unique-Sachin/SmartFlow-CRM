import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import type { ReactNode } from 'react';
import Header from './Header';
import { useTheme } from '../../theme/ThemeProvider';

const LayoutRoot = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
});

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  background: theme.palette.background.default,
  width: '100%',
  height: '100vh',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 50, // Header height
  overflowY: 'auto',
  paddingBottom: theme.spacing(3),
}));

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <>
      <Header toggleTheme={toggleTheme} mode={isDarkMode ? 'dark' : 'light'} />
      <LayoutRoot>
        <Sidebar />
        <MainContent>{children}</MainContent>
      </LayoutRoot>
    </>
  );
}; 