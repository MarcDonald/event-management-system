import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './Routes';
import { Toaster } from 'react-hot-toast';

/**
 * Main app container
 */
export default function App() {
  return (
    <div className="relative min-h-screen">
      <Router>
        <Routes />
      </Router>
    </div>
  );
}
