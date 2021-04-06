import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './Routes';
import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyle, GlobalThemedStyle } from './styles/GlobalStyles';
import LightTheme from './styles/themes/LightTheme';
import { useEffect, useState } from 'react';
import { breakpoints } from './styles/Breakpoints';

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
  height: 100vh;
`;

const FullscreenCover = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ScreenSizeWarning = styled.h1`
  font-size: 1rem;
  margin: 1rem;
  width: 100%;
  text-align: center;
`;

/**
 * Main app container
 */
export default function App() {
  const [screenTooSmall, setScreenTooSmall] = useState(false);

  useEffect(() => {
    function handleResize() {
      setScreenTooSmall(window.innerWidth < breakpoints.desktop);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return (
    <AppContainer>
      <GlobalStyle />
      <ThemeProvider theme={LightTheme}>
        <GlobalThemedStyle>
          <Router>
            {screenTooSmall && (
              <FullscreenCover>
                <ScreenSizeWarning>
                  Please use a larger screen to view this dashboard
                </ScreenSizeWarning>
              </FullscreenCover>
            )}
            {!screenTooSmall && <Routes />}
          </Router>
        </GlobalThemedStyle>
      </ThemeProvider>
    </AppContainer>
  );
}
