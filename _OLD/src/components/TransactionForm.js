import React, { useState } from "react";
import { Card, Logo, Form, Input, Checkbox, Select, Button, Label, Error } from "./FormElements";
import Modal from 'react-modal';
import axios from 'axios';

function TransactionForm({ onRequestClose, ...otherProps }) {
	const [date, setDate] = useState('');
	const [description, setDescription] = useState('');
	const [amount, setAmount] = useState('');
	const [accountId, setAccountId] = useState('');
	const [categoryId, setCategoryId] = useState('');
	const [transactionIsPosted, setTransactionIsPosted] = useState(false);
  	const [isCredit, setIsCredit] = useState(false);
  	const [isError, setIsError] = useState(false);


	function postTransaction() {
		const debit = (isCredit) ? '0.00' : amount;
		const credit = (isCredit) ? amount : '0.00';
		const tokens = JSON.parse(localStorage.tokens);
		const jwtToken = tokens.jwtToken;
		axios({
				url: 'api/transactions',
				method: 'post',
				data: {
			  		'transaction_date': date,
			  		'transaction_description': description,
			  		'debit': debit,
			  		'credit': credit,
			  		'account_id': accountId,
		  			'category_id': categoryId
				},
				headers: {'AUTHORIZATION': `Bearer ${jwtToken}`}
			}
		).then(result => {
	  		if (result.status === 200) {
	  			setTransactionIsPosted(true);
	    		alert('The transaction was '+ transactionIsPosted + 'ly posted');
	  	} else {
	    	setIsError(true);
	    	alert('Poop, an error');
	  	}
		}).catch(e => {
			console.log('e', e.response);

	  	setIsError(true);
	});
	}




	return(
		<Modal isOpen onRequestClose={onRequestClose} {...otherProps}>
			<Card>
			  <Form>
			    <Input
			      type="date"
			      value={date}
			      onChange={e => {setDate(e.target.value)}}
			    />
			    <Input
			      type="text"
			      value={description}
			      onChange={e => {setDescription(e.target.value)}}
			      placeholder="description"
			    />
			    <Input
			      type="text"
			      value={amount}
			      onChange={e => {setAmount(e.target.value)}}
			      placeholder="amount"
			    />	    
			    <Label>
			    	<Checkbox type='checkbox' value={isCredit} onChange={e => {setIsCredit(e.target.value)}} />
			    	Income
			    </Label>
			    <Select defaultValue={'Select Account'} onChange={e => {setAccountId(e.target.value)}}>
			    	<option value='Select Account' disabled>Select Account</option>
			    	<option value='1'>Checking fpo</option>
			    	<option value='2'>Savings fpo</option>
			    </Select>
			    <Select defaultValue={'Select Category'} onChange={e => {setCategoryId(e.target.value)}}>
			    	<option value='Select Category' disabled>Select Category</option>
			    	<option value='1'>Groceries</option>
			    	<option value='2'>Auto Insurance</option>
			    </Select>
			    <Button onClick={postTransaction}>Save</Button>
			  </Form>
	    	<Button onClick={onRequestClose}>close</Button>
			</Card>  
		</Modal>
	);
}

Modal.setAppElement('#root');

export default TransactionForm;