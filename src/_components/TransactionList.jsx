import React, { useState, useEffect } from 'react';
import { alertService, transactionService } from '@/_services';
import { NumericFormat } from 'react-number-format';
import moment from 'moment'
import { CategorySelectOptions } from './CategorySelectOptions'


function TransactionList(props) {


	return(
                <div className="TransactionList">
                    Filter: 
                    <select onChange={(e) => props.handleChangeCategoryFilter(e)} value={props.activeCategory} component="select" className={'form-control CategorySelect'}>
                        <CategorySelectOptions categories={props.categories} categoryType="incomeExpense" defaultOption="Select a Category" />
                    </select>

                    {
                        props.transactions.length == 0
                        &&
                        props.transactionsAreLoaded
                        &&
                        'No transactions were found.'
                        ||
                        <table className='table table-sm'>
                            <tbody>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th className='text-end'>Amount</th>
                                    <th>Account</th>
                                    <th>Category</th>
                                    <th>{props.activeBankAccount != 0 ? 'Reconcile' : ''}</th>
                                    <th>&nbsp;</th>
                                </tr>
                                {
                                    props.transactions.map(transaction => {
                                        let childCategoryTitle = (transaction.ChildTransactions.length > 0) ? transaction.ChildTransactions[0].category.category_title : '' ;
                                        return (    
                                            <tr key={transaction.id}>
                                                <td>{moment.utc(transaction.transaction_date).format('MM/DD/YYYY')}</td>
                                                <td>{transaction.transaction_description}</td>
                                                <td className='text-end'>
                                                    <NumericFormat 
                                                        value={`${transaction.debit == 0  ? transaction.credit.toFixed(2) : transaction.debit.toFixed(2)}` } 
                                                        displayType={'text'} 
                                                        thousandSeparator={true} 
                                                        prefix={`${transaction.debit == 0  ? "+" : "-"}`} 
                                                    />
                                                </td>
                                                <td>{transaction.category.category_title}</td>
                                                <td>{childCategoryTitle}</td>
                                                <td>
                                                    { props.activeBankAccount != 0 &&
                                                        <i 
                                                            className={`bi-${transaction.reconcile == 1 ? 'check-square' : ''}${transaction.reconcile == 0 ? 'dash-square' : ''} `}
                                                            onClick={(t) => props.handleClickReconcileTransaction(transaction)}
                                                        >
                                                        </i>
                                                    }
                                                </td>
                                                <td>
                                                    { transaction.reconcile != 2 &&
                                                        <div>


                                                            <div className="btn-group dropup">
                                                              <button type="button" className="btn btn-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="bi-three-dots" role="button" aria-label="Options"></i>
                                                              </button>
                                                              <ul className="dropdown-menu">
                                                                <li><a onClick={(id) => props.handleClickEditTransaction(transaction)}>EDit</a></li>
                                                                <li><a onClick={(id) => props.handleClickDeleteTransaction(transaction.id)}>Delete</a></li>
                                                              </ul>
                                                            </div>
                                                        </div>
                                                        ||
                                                        <i className='bi-lock'></i>
                                                    }
                                                </td>
                                            </tr>
                                       )

                                    })
                                }
                                {
                                    props.transactionsCount > props.transactionsLimit &&
                                        <tr>
                                            <td colSpan="7"><button onClick={() => props.handlClickShowMore()} type="button" className="btn btn-link">Show More</button></td>
                                        </tr>

                                }



                          </tbody>
                        </table>
                    }
                </div>
	);
}


export { TransactionList };

