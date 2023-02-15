import React, { useState, useEffect } from 'react';
import { alertService, transactionService } from '@/_services';
import { NumericFormat } from 'react-number-format';
import moment from 'moment'
import { CategorySelectOptions } from './CategorySelectOptions'


function TransactionList(props) {


	return(
                <div className="TransactionList">
                    <div className='input-group'>
                        <span className="input-group-text"><i className="bi-filter"></i></span>
                        <select onChange={(e) => props.handleChangeCategoryFilter(e)} value={props.activeCategory} component="select" className={'form-control CategorySelect'}>
                            <CategorySelectOptions categories={props.categories} categoryType="incomeExpense" defaultOption="Filter Categories" />
                        </select>
                    </div>

                    {
                        props.transactions.length == 0
                        &&
                        props.transactionsAreLoaded
                        &&
                        'No transactions were found.'
                        ||
                        <div className='row tabular-data tabular-head'>
                            <div className="col-sm-1">Date</div>
                            <div className="col-sm-3">Description</div>
                            <div className="col-sm-2 text-end">Amount</div>
                            <div className="col-sm-2">Account</div>
                            <div className="col-sm-2">Category</div>
                            <div className="col-sm-1">{props.activeCashTrackingAccount != 0 ? 'Reconcile' : ''}</div>
                        </div>
                    }
                                {
                                    props.transactions.map(transaction => {
                                        let childCategoryTitle = (transaction.ChildTransactions.length > 0) ? transaction.ChildTransactions[0].category.category_title : '' ;
                                        return (    
                                            <div className='row tabular-data' key={transaction.id}>
                                                <div className="col-sm-1">{moment.utc(transaction.transaction_date).format('MM/DD/YYYY')}</div>
                                                <div className="col-sm-3">{transaction.transaction_description}</div>
                                                <div className="col-sm-2 text-end">
                                                    <NumericFormat 
                                                        value={`${transaction.debit == 0  ? transaction.credit : transaction.debit}` } 
                                                        displayType={'text'} 
                                                        thousandSeparator={true} 
                                                        prefix={`${transaction.debit == 0  ? "+" : "-"}`} 
                                                    />
                                                </div>
                                                <div className="col-sm-2">{transaction.category.category_title}</div>
                                                <div className="col-sm-2">{childCategoryTitle}</div>
                                                <div className="col-sm-1">
                                                    { props.activeCashTrackingAccount != 0 &&
                                                        <i 
                                                            className={`bi-${transaction.reconcile == 1 ? 'check-square' : ''}${transaction.reconcile == 0 ? 'dash-square' : ''} `}
                                                            onClick={(t) => props.handleClickReconcileTransaction(transaction)}
                                                        >
                                                        </i>
                                                    }
                                                </div>
                                                <div className="col-sm-1">
                                                    { transaction.reconcile != 2 &&
                                                        <div>


                                                            <div className="btn-group dropup">
                                                                <i className="bi-three-dots dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Options"></i>
                                                              <ul className="dropdown-menu">
                                                                <li><a onClick={(id) => props.handleClickEditTransaction(transaction)}>EDit</a></li>
                                                                <li><a onClick={(id) => props.handleClickDeleteTransaction(transaction.id)}>Delete</a></li>
                                                              </ul>
                                                            </div>
                                                        </div>
                                                        ||
                                                        <i className='bi-lock'></i>
                                                    }
                                                </div>
                                            </div>
                                       )

                                    })
                                }
                                {
                                    props.transactionsCount > props.transactionsLimit &&
                                            <div><button onClick={() => props.handlClickShowMore()} type="button" className="btn btn-link">Show More</button></div>

                                }

                </div>
	);
}


export { TransactionList };

