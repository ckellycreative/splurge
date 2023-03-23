import React, { useState, useEffect } from 'react';
import { alertService, transactionService } from '@/_services';
import { NumericFormat } from 'react-number-format';
import moment from 'moment'
import { CategorySelectOptions } from './CategorySelectOptions'


function TransactionList(props) {
	return(
                <div className="TransactionList">
                    <div className="row">
                        <div className="col-md-4">
                            <div className='input-group'>
                                <select onChange={(e) => props.handleChangeCategoryFilter(e)} value={props.activeCategory} component="select" className={'form-control CategorySelect'}>
                                    <CategorySelectOptions categories={props.categories} categoryType="all" defaultOption="Filter Categories" />
                                </select>
                                {props.activeCategory &&
                                    <button onClick={() => props.handleChangeCategoryFilter('')} className="btn btn-secondary" type="button" id="button-addon2"><i className="bi-slash-circle"></i></button>
                                }
                            </div>
                        </div>
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
                            { props.activeCashTrackingAccount != 0 &&
                                <div className="col-sm-1">Reconcile</div>
                            }
                            {
                                props.activeCashTrackingAccount == 0 &&
                                    <div className="col-sm-2">Account</div>
                            }
                            <div className="col-sm-2">Category</div>
                        </div>
                    }
                                {
                                    props.transactions.map(transaction => {
                                        let childCategoryTitle = (transaction.ChildTransactions.length > 0) ? transaction.ChildTransactions[0].category.category_title : '' ;
                                        let parentCategoryTitle = (transaction.ParentTransaction) ? transaction.ParentTransaction.category.category_title : ''
                                        let isTransferChild = (transaction.ParentTransaction) ? true : false
                                        let isTransferParent = (transaction.category.category_type == 'cash' && transaction.ChildTransactions.length > 0 && transaction.ChildTransactions[0].category.category_type == 'cash') ? true : false
                                        let isTransferParentBeingFiltered = (transaction.category.id == props.activeCategory)
                                        return (    
                                            <div className='row tabular-data' key={transaction.id}>
                                                <div className="col-sm-1">{moment.utc(transaction.transaction_date).format('MM/DD/YYYY')}</div>
                                                <div className="col-sm-3">{transaction.transaction_description}</div>
                                                <div className="col-sm-2 text-end">
                                                    <NumericFormat 
                                                        value={`${transaction.debit == 0  ? transaction.credit : transaction.debit}` } 
                                                        displayType={'text'} 
                                                        thousandSeparator={true} 
                                                        prefix={`${(transaction.debit == 0 || isTransferParentBeingFiltered)  ? "+" : "-"}`} 
                                                    />
                                                </div>

                                                    <div className="col-sm-1">
                                                        { props.activeCashTrackingAccount != 0 && props.reconcilingTransaction != transaction.id &&
                                                            <i 
                                                                className={`bi-${(transaction.reconcile == 1) ? 'check-square' : ''}${(transaction.reconcile == 0)  ? 'dash-square' : ''} `}
                                                                onClick={(t) => props.handleClickReconcileTransaction(transaction)}
                                                            >
                                                            </i>
                                                        }

                                                        { props.reconcilingTransaction == transaction.id && props.reconcilingTransactionIsLoading &&
                                                            <div  className="spinner-grow spinner-grow-sm text-primary" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                        }
                                                    </div>


                                                {props.activeCashTrackingAccount == 0 &&
                                                    <div className="col-sm-2">{transaction.category.category_title}</div>
                                                }
                                                <div className="col-sm-2">
                                                    {!isTransferChild && !isTransferParent && childCategoryTitle}
                                                    {(isTransferParent && !isTransferParentBeingFiltered ) && <span>Transfer to: {childCategoryTitle}</span>}
                                                    {(isTransferChild && !isTransferParentBeingFiltered) && <span>Transfer from: {parentCategoryTitle}</span>}
                                                    {isTransferParentBeingFiltered  && <span>Transfer from: {transaction.category.category_title}</span>}

                                                </div>
                                                <div className="col-sm-1">
                                                    { transaction.reconcile != 2 &&
                                                        <div>


                                                            <div className="btn-group dropup">
                                                                <i className="bi-three-dots dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Options"></i>
                                                              <ul className="dropdown-menu">
                                                                <li><a onClick={(id) => props.handleClickEditTransaction(isTransferChild ? transaction.ParentTransaction : transaction)}>Edit</a></li>
                                                                <li><a onClick={(id) => props.handleClickDeleteTransaction(isTransferChild ? transaction.ParentTransaction.id : transaction.id)}>Delete</a></li>
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

