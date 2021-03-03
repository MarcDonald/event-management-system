import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Management, { ManagementPage } from './pages/Management';
import Dashboard from './pages/Dashboard/Dashboard';

/**
 * Application routing
 */
export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/management/venues">
        <Management initialSelectedPage={ManagementPage.Venues} />
      </Route>
      <Route exact path="/management/events">
        <Management initialSelectedPage={ManagementPage.Events} />
      </Route>
      <Route exact path="/management/staff">
        <Management initialSelectedPage={ManagementPage.Staff} />
      </Route>
      <Route exact path="/dashboard/:eventId">
        <Dashboard />
      </Route>
      <Route component={NotFound} />
      <Route path="/404" component={NotFound} />
    </Switch>
  );
}
