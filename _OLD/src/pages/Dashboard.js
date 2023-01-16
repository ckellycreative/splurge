import React, { Fragment } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";
import { Button } from "../components/FormElements";
import Transactions from './Transactions';
import Accounts from './Accounts';
import Reports from './Reports';
import TransactionForm from '../components/TransactionForm';
import { ModalProvider, ModalConsumer } from '../components/Modal/ModalContext';
import ModalRoot from '../components/Modal/ModalRoot';


function Dashboard(props) {
  let { path, url } = useRouteMatch();

  return (
  	<div>
  		<h1>Dashboard Page</h1>
		<ModalProvider>
			<ModalRoot />
			<ModalConsumer>
	  			{({ showModal }) => (
	    			<Fragment>
	      				<Button width={'300px'} onClick={() => showModal(TransactionForm)}>New Transaction</Button>
	    			</Fragment>
	  			)}
			</ModalConsumer>
		</ModalProvider>
		<ul>
			<li>
				<Link to={path}>Transactions</Link>
			</li>
			<li>
				<Link to={`${url}/accounts`}>Accounts</Link>
			</li>
			<li>
				<Link to={`${url}/reports`}>Reports</Link>
			</li>
		</ul>  		




		<Switch>
			<Route exact path={path}>
				<Transactions />
			</Route>
			<Route path={`${url}/accounts`}>
		  		<Accounts />
			</Route>
			<Route path={`${url}/reports`}>
		  		<Reports />
			</Route>
		</Switch>


  	</div>
  )
}

export default Dashboard;