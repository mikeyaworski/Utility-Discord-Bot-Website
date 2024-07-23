import { createTheme } from '@mui/material';

const ALT_BACKGROUND_COLOR = '#282828';

declare module '@mui/material/styles' {
  interface Palette {
    altBackground: Palette['primary'];
  }
  interface PaletteOptions {
    altBackground: PaletteOptions['primary'];
  }
}

export default createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00A651',
      contrastText: '#FFFFFF',
    },
    secondary: {
      // Discord blue
      main: '#404EED',
      contrastText: '#FFFFFF',
    },
    altBackground: {
      main: ALT_BACKGROUND_COLOR,
      contrastText: '#FFFFFF',
    },
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          color: 'white',
        },
      },
    },
  },
});
