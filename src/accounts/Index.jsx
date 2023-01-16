import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { transactionService, categoryService, alertService } from '@/_services'
import { TransactionForm } from '../_components/TransactionForm'
import { TransactionList } from '../_components/TransactionList'
import { AccountsNav } from '../_components/AccountsNav'
import { AccountsForm } from '../_components/AccountsForm'





function Accounts() {
    // "Accounts" in this context means Bank Accounts. In database they are Categories (income, expense, cash, checking, savings)
    //Categories, BankAccounts
    const [categories, setCategories] = useState([])
    const [categoriesAreLoaded, setCategoriesAreLoaded] = useState(false)
    const [bankAccountCategoriesWithTotals, setBankAccountCategoriesWithTotals] = useState([])
    const [bankAccountCategoriesWithTotalsAreLoaded, setBankAccountCategoriesWithTotalsAreLoaded] = useState(false)
    const [activeBankAccount, setActiveBankAccount] = useState('')
    const [activeCategory, setActiveCategory] = useState('')
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
    const [showAddAccountForm, setShowAddAccountForm] = useState(false)
    const [unclearedTransactionsTotal, setUnClearedTransactionsTotal] = useState(0)







    /* ----------
        Fetch Data  
    -------------*/


    const getCategories = () => {
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





    const getBankAccountCategoriesWithTotals = () => {
        categoryService.getBankAccountCategoriesWithTotals()
            .then((data) => {
                setBankAccountCategoriesWithTotals(data)
                setBankAccountCategoriesWithTotalsAreLoaded(true);
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getBankAccountCategoriesWithTotals()
    }, [transactions])  





    const getTransactions = () => {
            const activeBankAccountId = (!activeBankAccount) ? 0 : activeBankAccount.id  //  0 activeBankAccount will return all categories from the API
            const activeCategoryId = (!activeCategory) ? 0 : activeCategory  //  0 activeBankAccount will return all categories from the API
            transactionService.getAll(activeBankAccountId, activeCategoryId, transactionsLimit) 
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
    }, [activeBankAccount, activeCategory, transactionsLimit])  
    





    /* ----------
        Handlers  
    -------------*/

     const handleClickEditTransaction = (t) => {
        setEditingTransaction(t)
     }

     const handleClickAccountsNavItem = (cat) => {
        setActiveBankAccount(cat)
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
        alertService.clear();
        let params = {
            id: t.id,
            ChildTransactions: t.ChildTransactions,
            reconcile: (t.reconcile == 0 ? 1 : 0 )
        }
        transactionService.update(params)
            .then((res) => {
                getTransactions();
            })
            .catch(error => {
                alertService.error(error);
            });        
        
    }

    const handleClickCompleteReconcileAccount = () => {
        alertService.clear();
        let updatedTransactions = [] 
        transactions.map((t) => {
            if (t.reconcile == 1) {
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

    const handleUnClearedTransactionsTotal = (amt) => {
        let uct = 0
        transactions.map(transaction => {
            if ( transaction.reconcile == 0) { 
                uct += (transaction.credit - transaction.debit) 
            }
            setUnClearedTransactionsTotal(uct)
        })
    }
    useEffect(() => {
        handleUnClearedTransactionsTotal()
    }, [transactions])  



    const handleChangeCategoryFilter = (e) => {
        e.preventDefault()
        setActiveCategory(e.target.value)
    }


    const handleDeleteAccount = () => {
        if (confirm("Deleting an account will delete all of its transactions. Are you sure?") == true) {
            alertService.clear();
            categoryService.delete(activeBankAccount.id)
                .then((res) => {
                    alertService.success('Deleted');
                    getTransactions(); //this will also fetch bank accounts due to getTransactions useEffect dependencies
                    setActiveCategory('')
                    setActiveBankAccount('')
                })
                .catch(error => {
                    alertService.error(error);
                });        
        } else {
            return null
        }        
    }



    return (
        <div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-3">
                        
                        {bankAccountCategoriesWithTotals &&
                            <AccountsNav bankAccountCategoriesWithTotals={bankAccountCategoriesWithTotals} activeBankAccount={activeBankAccount} handleClickAccountsNavItem={handleClickAccountsNavItem} />
                        }

                        <button onClick={() => setShowAddAccountForm((prevState) => !prevState)} type="button" className="btn btn-link"><i className="bi-plus" role="button" aria-label="Add Account"></i>Add Account</button>

                        {
                            showAddAccountForm &&

                            <AccountsForm getTransactions={getTransactions} setShowAddAccountForm={setShowAddAccountForm}/>



                        }
                    </div>
                    <div className="col-md-9">
                       <TransactionForm 
                            getTransactions={() => getTransactions()} 
                            categories={categories}
                            getCategories={() => getCategories()} 
                            editingTransaction={editingTransaction}
                            setEditingTransaction={(arr) => setEditingTransaction(arr)}
                            setShowDrawer={() => setShowDrawer()}
                        />



                        { activeBankAccount != 0 &&
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
                                                    
                                                    (activeBankAccount.bankBalance - unclearedTransactionsTotal).toFixed(2)
                                                }
                                            </span>
                                            <button onClick={() => handleClickCompleteReconcileAccount()} type="button" className="btn btn-success btn-sm">Yes</button>
                                            <button onClick={() => setShowReconcileDialog(false)} type="button" className="btn btn-secondary btn-sm">No</button>
                                        </div>
                                    }
                            </div>
                        }

                        <h3 className="card-header">Transactions</h3>
                        <TransactionList 
                            transactions={transactions}
                            transactionsAreLoaded={transactionsAreLoaded}
                            transactionsCount={transactionsCount}
                            transactionsLimit={transactionsLimit}
                            getTransactions={getTransactions} 
                            categories={categories}
                            activeBankAccount={activeBankAccount}
                            activeCategory={activeCategory}
                            handleClickEditTransaction={handleClickEditTransaction} 
                            handleClickDeleteTransaction={handleClickDeleteTransaction} 
                            handleClickReconcileTransaction={handleClickReconcileTransaction} 
                            handlClickShowMore={handlClickShowMore}
                            handleChangeCategoryFilter={handleChangeCategoryFilter}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}

export { Accounts };