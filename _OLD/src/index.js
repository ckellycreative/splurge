import "./sass/style.scss";
import React, { useContext, createContext, useState } from "react";
import { render } from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation
} from "react-router-dom";
import { AuthContext } from "./context/auth";
import PrivateRoute from './PrivateRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App(props) {

  const existingTokens = JSON.parse(localStorage.getItem("tokens"));
  const [authTokens, setAuthTokens] = useState(existingTokens);

  const setTokens = (data) => {
    localStorage.setItem("tokens", JSON.stringify(data));
    setAuthTokens(data);
  }

  return (
    <AuthContext.Provider value={{ authTokens, setAuthTokens: setTokens }}>
      <Router>
        <div>
          <ul>
            <li>
              <Link to="/">Home Page</Link>
            </li>
            <li>
                <Link to="/dashboard">Dashboard</Link>
            </li>
          </ul>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <PrivateRoute path="/dashboard" component={Dashboard} />
        </div>
      </Router>
    </AuthContext.Provider>

  );
}

export default App;

render(<App />, document.getElementById("root"));