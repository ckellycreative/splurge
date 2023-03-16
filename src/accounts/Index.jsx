import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { transactionService, categoryService, alertService } from '@/_services'
import { TransactionForm } from '../_components/TransactionForm'
import { TransactionList } from '../_components/TransactionList'
import { AccountsNav } from '../_components/AccountsNav'
import { AccountsForm } from '../_components/AccountsForm'





function Accounts() {
    // "Accounts" in this context means cash and tracking accounts. In database they are Categories 

    //Categories, CashTrackingAccounts
    const [categories, setCategories] = useState([])
    const [categoriesAreLoaded, setCategoriesAreLoaded] = useState(false)
    const [cashTrackingAccountsWithTotals, setCashTrackingAccountsWithTotals] = useState([])
    const [cashTrackingAccountsWithTotalsAreLoaded, setCashTrackingAccountsWithTotalsAreLoaded] = useState(false)
    const [activeCashTrackingAccount, setActiveCashTrackingAccount] = useState('')
    const [activeCategory, setActiveCategory] = useState('')
    const [showAddAccountForm, setShowAddAccountForm] = useState(false)
    //Transactions
    const [transactions, setTransactions] = useState([])
    const [transactionsAreLoaded, setTransactionsAreLoaded] = useState(false)
    const [transactionsCount, setTransactionsCount] = useState('')
    const defaultTransactionsLimit = 100
    const defaultTransactionsLimitIncrement = 100
    const [transactionsLimit, setTransactionsLimit] = useState(defaultTransactionsLimit)
    const [editingTransaction, setEditingTransaction] = useState(null)
    //Reconcile
    const [showReconcileDialog, setShowReconcileDialog] = useState(false)
    const [reconcilingTransaction, setReconcilingTransaction] = useState('')
    const [reconcilingTransactionIsLoading, setReconcilingTransactionIsLoading] = useState(false)
    const [unclearedTransactionsTotal, setUnclearedTransactionsTotal] = useState(0)
    const [clearedTransactionsTotal, setClearedTransactionsTotal] = useState(0)
    const [beginningBalance, setBeginningBalance] = useState(0)

    const dataIsLoading = 
    (
        !categoriesAreLoaded ||
        !transactionsAreLoaded ||
        !cashTrackingAccountsWithTotalsAreLoaded 
    ) ? true : false






    /* ----------
        Fetch Data  
    -------------*/


    const getCategories = () => {
        setCategoriesAreLoaded(false);
        categoryService.getAll()
            .then((data) => {
                setCategoriesAreLoaded(true);
                setCategories(data)
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getCategories()
    }, [])  




    const getCashTrackingAccountsWithTotals = () => {
        setCashTrackingAccountsWithTotalsAreLoaded(false);
        categoryService.getCashTrackingAccountsWithTotals('3000-01-01') // Use this future date to get all past and future transactions 
            .then((data) => {
                setCashTrackingAccountsWithTotals(data)
                setCashTrackingAccountsWithTotalsAreLoaded(true);
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getCashTrackingAccountsWithTotals()
    }, [transactions])  





    const getTransactions = () => {
            setTransactionsAreLoaded(false)
            const activeCashTrackingAccountId = (!activeCashTrackingAccount) ? 0 : activeCashTrackingAccount.id  //  0 activeCashTrackingAccount will return all categories from the API
            const activeCategoryId = (!activeCategory) ? 0 : activeCategory  //  0 activeCashTrackingAccount will return all categories from the API
            transactionService.getAll(activeCashTrackingAccountId, activeCategoryId, transactionsLimit) 
            .then((data) => {
                setTransactionsAreLoaded(true);
                setTransactions(data.transactions);
                setTransactionsCount(data.count);
            })
            .catch(error => {
                //alertService.error(error)
                console.log('error', error)
            });
    };

    useEffect(() => {
        getTransactions()
    }, [activeCashTrackingAccount, activeCategory, transactionsLimit])  
    





    /* ----------
        Handlers  
    -------------*/

     const handleClickEditTransaction = (t) => {
        setEditingTransaction(t)
     }

     const handleClickAccountsNavItem = (cat) => {
        setActiveCashTrackingAccount(cat)
        setTransactionsLimit(defaultTransactionsLimit)
        setShowReconcileDialog(false)
     }
        
    const handleClickDeleteTransaction = (id) => {
        alertService.clear();
        transactionService.delete(id)
            .then((res) => {
                alertService.success('Deleted');
                getTransactions();
            })
            .catch(error => {
                alertService.error(error);
            });        
    }

    const handlClickShowMore = () => {
        setTransactionsLimit(transactionsLimit + defaultTransactionsLimitIncrement)
    }


    const handleClickReconcileTransaction = (t) => {
        setReconcilingTransaction(t.id)
        setReconcilingTransactionIsLoading(true)
        let params = {
            id: t.id,
            ChildTransactions: t.ChildTransactions,
            reconcile: (t.reconcile == 0 ? 1 : 0 )
        }
        transactionService.update(params)
            .then((res) => {
                getTransactions();
                setReconcilingTransaction('')
                setReconcilingTransactionIsLoading(false)
            })
            .catch(error => {
                alertService.error(error);
            });        
        
    }

    const handleClickCompleteReconcileAccount = () => {
        alertService.clear();
        let updatedTransactions = [] 
        transactions.map((t) => {
            if (t.reconcile == 1 ) {
                    t.reconcile = 2
                    updatedTransactions.push(t)
            }
        })
        transactionService.bulkCreate(updatedTransactions)
            .then((res) => {
                alertService.success('Account Reconciled');
                setShowReconcileDialog(false)
                getTransactions();
            })
            .catch(error => {
                alertService.error(error);
            });        

    }

    const handleClearedTransactionsTotal = () => {
        let uct = 0
        let ct = 0
        transactions.map(transaction => {
            if (transaction.reconcile == 0) { 
                uct += (transaction.credit - transaction.debit) 
            }
            if (transaction.reconcile == 1) { 
                ct += (transaction.credit - transaction.debit) 
            }

            setUnclearedTransactionsTotal(uct)
            setClearedTransactionsTotal(ct)
            setBeginningBalance( +activeCashTrackingAccount.bankBalance - uct - ct)

        })
    }
    useEffect(() => {
        handleClearedTransactionsTotal()
    }, [transactions])  



    const handleChangeCategoryFilter = (e) => {
        e.preventDefault()
        setActiveCategory(e.target.value)
    }


    const handleDeleteAccount = () => {
        if (confirm("Deleting an account will delete all of its transactions. Are you sure?") == true) {
            alertService.clear();
            categoryService.delete(activeCashTrackingAccount.id)
                .then((res) => {
                    alertService.success('Deleted');
                    getTransactions(); //this will also fetch bank accounts due to getTransactions useEffect dependencies
                    setActiveCategory('')
                    setActiveCashTrackingAccount('')
                })
                .catch(error => {
                    alertService.error(error);
                });        
        } else {
            return null
        }        
    }



    return (


        <div className="row Accounts">

            { dataIsLoading &&
                <React.Fragment>
                        <div  className="spinner-border spinner-page text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div  className="spinner-overlay" role="status"></div>
                </React.Fragment>
            }

            <div className="col-md-3 sidebar">
                
                <button onClick={() => setShowAddAccountForm((prevState) => !prevState)} type="button" className="btn btn-link"><i className="bi-plus" role="button" aria-label="Add Account"></i>Add Account</button>
                {
                    showAddAccountForm &&
                    <AccountsForm getTransactions={getTransactions} setShowAddAccountForm={setShowAddAccountForm}/>
                }

                {cashTrackingAccountsWithTotals &&
                    <AccountsNav cashTrackingAccountsWithTotals={cashTrackingAccountsWithTotals} activeCashTrackingAccount={activeCashTrackingAccount} handleClickAccountsNavItem={handleClickAccountsNavItem} />
                }

            </div>
            <div className="col-md-9 main">
               
               <div className="row mb-4">
                   <div className="col">
                       <TransactionForm 
                            getTransactions={() => getTransactions()} 
                            categories={categories}
                            getCategories={() => getCategories()} 
                            editingTransaction={editingTransaction}
                            setEditingTransaction={(arr) => setEditingTransaction(arr)}
                            setShowDrawer={() => setShowDrawer()}
                        />
                    </div>

                   <div className="col">
                        { activeCashTrackingAccount != 0 &&
                            <div>
                                <div className="dropdown">
                                  <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Actions
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" onClick={() => setShowReconcileDialog(true)}>Reconcile</a></li>
                                    <li><a className="dropdown-item" onClick={handleDeleteAccount}>Delete Account</a></li>
                                  </ul>
                                </div>

                                {
                                        showReconcileDialog && 
                                        <div>
                                            <span> 
                                                Does your bank balance match?: 
                                                {
                                                    
                                                    (beginningBalance + clearedTransactionsTotal  ).toFixed(2)
                                                }
                                            </span>
                                            <button onClick={() => handleClickCompleteReconcileAccount()} type="button" className="btn btn-success btn-sm">Yes</button>
                                            <button onClick={() => setShowReconcileDialog(false)} type="button" className="btn btn-secondary btn-sm">No</button>
                                        </div>
                                    }
                            </div>
                        }
                    </div>
                </div>


                <TransactionList 
                    transactions={transactions}
                    transactionsAreLoaded={transactionsAreLoaded}
                    transactionsCount={transactionsCount}
                    transactionsLimit={transactionsLimit}
                    getTransactions={getTransactions} 
                    categories={categories}
                    activeCashTrackingAccount={activeCashTrackingAccount}
                    activeCategory={activeCategory}
                    handleClickEditTransaction={handleClickEditTransaction} 
                    handleClickDeleteTransaction={handleClickDeleteTransaction} 
                    handleClickReconcileTransaction={handleClickReconcileTransaction} 
                    reconcilingTransaction={reconcilingTransaction}
                    reconcilingTransactionIsLoading={reconcilingTransactionIsLoading}
                    handlClickShowMore={handlClickShowMore}
                    handleChangeCategoryFilter={handleChangeCategoryFilter}
                />

            </div>


        </div>

    );
}

export { Accounts };