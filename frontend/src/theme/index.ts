import { createTheme, type Theme as MuiTheme } from '@mui/material/styles';

// Define custom theme colors and options
const themeOptions = {
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
};

export type Theme = MuiTheme;

// Light theme
export const lightTheme = createTheme({
  ...themeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#2D3282',
      light: '#3D43A2',
      dark: '#1D2262',
    },
    secondary: {
      main: '#6B4CE6',
      light: '#8E76EC',
      dark: '#4F35C6',
    },
    success: {
      main: '#0ACF83',
      light: '#39D99B',
      dark: '#07A266',
    },
    warning: {
      main: '#FFB648',
      light: '#FFC876',
      dark: '#E69C2E',
    },
    error: {
      main: '#FF5E84',
      light: '#FF8CA7',
      dark: '#E63E64',
    },
    background: {
      default: '#F5F5F9',
      paper: '#FFFFFF',
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...themeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3D43A2',
      light: '#5A5FB8',
      dark: '#2D3282',
    },
    secondary: {
      main: '#8E76EC',
      light: '#AB98F0',
      dark: '#6B4CE6',
    },
    success: {
      main: '#39D99B',
      light: '#62E0AF',
      dark: '#0ACF83',
    },
    warning: {
      main: '#FFC876',
      light: '#FFD699',
      dark: '#FFB648',
    },
    error: {
      main: '#FF8CA7',
      light: '#FFADC0',
      dark: '#FF5E84',
    },
    background: {
      default: '#1A1B35',
      paper: '#2D2E4A',
    },
  },
}); 