import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Views/Home';
import NotFound from './Views/NotFound';
import Login from './Views/Login';
import useLocalAuth from './Hooks/useLocalAuth';

function Routes() {
  const localAuth = useLocalAuth();

  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route component={NotFound} />
      <Route path="/404" component={NotFound} />
    </Switch>
  );
}

export default Routes;
