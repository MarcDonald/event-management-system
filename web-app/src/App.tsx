import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './Routes';
import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyle, GlobalThemedStyle } from './styles/GlobalStyles';
import LightTheme from './styles/themes/LightTheme';

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
  height: 100vh;
`;

/**
 * Main app container
 */
export default function App() {
  return (
    <AppContainer>
      <GlobalStyle />
      <ThemeProvider theme={LightTheme}>
        <GlobalThemedStyle>
          <Router>
            <Routes />
          </Router>
        </GlobalThemedStyle>
      </ThemeProvider>
    </AppContainer>
  );
}
