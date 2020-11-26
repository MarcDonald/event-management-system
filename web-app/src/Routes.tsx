import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Views/Home';
import NotFound from './Views/NotFound';
import Login from './Views/Login';
import Management, { ManagementPage } from './Views/Management/Management';
import Sandbox from './Views/Sandbox/Sandbox';

function Routes() {
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
      {/*TODO only for dev purposes - DELETE*/}
      <Route exact path="/dev/sandbox">
        <Sandbox />
      </Route>
      <Route component={NotFound} />
      <Route path="/404" component={NotFound} />
    </Switch>
  );
}

export default Routes;
