import React, { useState, useEffect } from 'react';
import { NavLink, Route, Link } from 'react-router-dom';
import { LinkContainer} from 'react-router-bootstrap'
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';


import SplurgeLogo from '../img/splurge-logo-reverse.svg';
import { Role } from '@/_helpers';
import { accountService } from '@/_services';


function Navigation() {
    const [navExpanded, setNavExpanded] = useState(false);
    const [user, setUser] = useState({});
    useEffect(() => {
        const subscription = accountService.user.subscribe(x => setUser(x));
        return subscription.unsubscribe;
    }, []);

    // only show nav when logged in
    if (!user) return null;

    return (

    <Navbar expanded={navExpanded} expand="lg" bg="dark" data-bs-theme="dark">
      <Container fluid>
        <LinkContainer exact to="/" className="nav-link navbar-brand text-white me-3" activeClassName="">
           <Navbar.Brand onClick={() => setNavExpanded(false)} href="#"><div style={ {width:'86px'} } dangerouslySetInnerHTML={{__html: SplurgeLogo}} /></Navbar.Brand>
        </LinkContainer>
         
        <Navbar.Toggle onClick={() => setNavExpanded(navExpanded ? false : true)} aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to='/accounts'>
              <Nav.Link onClick={() => setNavExpanded(false)} href="#">Accounts</Nav.Link>
            </LinkContainer>
            <LinkContainer to='/plan'>
              <Nav.Link onClick={() => setNavExpanded(false)} href="#">Plan</Nav.Link>
            </LinkContainer>
            <LinkContainer to='/reports'>
              <Nav.Link onClick={() => setNavExpanded(false)} href="#">Reports</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            <Dropdown as={ButtonGroup} className="dropstart">
              <Dropdown.Toggle id="dropdown-custom-1" className="btn-link">
                <i className="bi-person-circle text-white" role="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="User"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-dark">

                            <Dropdown.ItemText>{user.firstName} {user.lastName}</Dropdown.ItemText>
                            <Dropdown.Divider />
                            {user.role === Role.Admin &&
                             <Dropdown.Item as={Link} to="/admin" onClick={() => setNavExpanded(false)}>Admin 
                                  <Route path="/admin" component={AdminNav} />
                              </Dropdown.Item>
                            }
                            <Dropdown.Item as={Link} to="/profile" onClick={() => setNavExpanded(false)}>Profile</Dropdown.Item>
                            <Dropdown.Item onClick={accountService.logout} onClick={() => setNavExpanded(false)}>Logout</Dropdown.Item>                            
              </Dropdown.Menu>
            </Dropdown>{' '}


          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>


    );
}

function AdminNav({ match }) {
    const { path } = match;

    return (
                <ul className="nav mb-auto">
                    <li className="nav-item">
                        <NavLink to={`${path}/users`} className="nav-item nav-link">Users</NavLink>
                    </li>
                </ul>
    );
}

export { Navigation }; 