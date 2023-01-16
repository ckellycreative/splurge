import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import moment from 'moment'
import { categoryService, transactionService, planService, alertService } from '@/_services'
import { CategoryForm } from '../_components/CategoryForm'
import { CategorySelectOptions } from '../_components/CategorySelectOptions'
import { PlanSavingsList } from '../_components/PlanSavingsList'
import  { PlanIncomeList }  from '../_components/PlanIncomeList'
import  { PlanExpenseList }  from '../_components/PlanExpenseList'
import { Modal } from '../_components/Modal'




function Plan() {

    const [thisMonth, setThisMonth] = useState(moment().format('MM'));
    const [thisYear, setThisYear] = useState(moment().format('YYYY'));
    const [incomeArr, setIncomeArr] = useState([])
    const [expenseArr, setExpenseArr] = useState([])
    const [savingsArr, setSavingsArr] = useState([])
    const [planIncomeTotal, setPlanIncomeTotal] = useState(0)
    const [planExpenseTotal, setPlanExpenseTotal] = useState(0)
    const [planSavingsTotal, setPlanSavingsTotal] = useState(0)
    const [actualIncomeTotal, setActualIncomeTotal] = useState(0)
    const [actualExpenseTotal, setActualExpenseTotal] = useState(0)
    const [categories, setCategories] = useState([])
    const [categoriesAreLoaded, setCategoriesAreLoaded] = useState(false)
    const [bankAccountCategoriesWithTotals, setBankAccountCategoriesWithTotals] = useState([])
    const [bankAccountCategoriesWithTotalsAreLoaded, setBankAccountCategoriesWithTotalsAreLoaded] = useState(false)
    const [bankAccountsTotal, setBankAccountsTotal] = useState(0)
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [deleteCategory, setDeleteCategory] = useState('');
    const [deleteCategoryHasTransactions, setDeleteCategoryHasTransactions] = useState(false);
    const [deleteCategoryHasLoaded, setDeleteCategoryHasLoaded] = useState(false);
    const [radioValue, setRadioValue] = useState(''); 
    const [transferToCategory, setTransferToCategory] = useState('') //id
    const [editCategory, setEditCategory] = useState('')
    const [newCategoryTitle, setNewCategoryTitle] = useState('')
    const [editPlan, setEditPlan] = useState('')
    const [newPlanAmount, setNewPlanAmount] = useState('')

    const dataIsLoading = 
    (
        !categoriesAreLoaded ||
        !bankAccountCategoriesWithTotalsAreLoaded ||
        !expenseArr ||
        !incomeArr ||
        !savingsArr ||
        !bankAccountsTotal ||
        !planIncomeTotal ||
        !planExpenseTotal ||
        !actualIncomeTotal ||
        !actualExpenseTotal
    ) ? true : false



/*****************
    
    Fetch Data

****************** */

    const getAllWithTotalByDate = () => {
        let startDate = `${thisYear}-${thisMonth}-01` 
        let lastDayOfEndMonth = moment(`${thisYear}-${thisMonth}`, "YYYY-MM").daysInMonth()
        let endDate = `${thisYear}-${thisMonth}-${lastDayOfEndMonth}`
        categoryService.getAllWithTotalByDate(startDate, endDate)
            .then((data) => {

                let groupTotalPlan = 0
                let groupTotalActual = 0
                let calcPlanExpenseTotal = 0
                let calcActualExpenseTotal = 0
                let calcPlanIncomeTotal = 0
                let calcActualIncomeTotal = 0
                let calcPlanSavingsTotal = 0
                let calcActualSavingsTotal = 0
                let tmpExpenseArr = []
                let tmpIncomeArr =[]
                let tmpSavingsArr =[]
                
                data.map( (cat, index, array) => {
                    // These could probably be consolidated (redundancy)--maybe benefit in separating
                    if (cat.category_type == 'expense' || cat.category_type == 'income' || cat.category_type == 'savings') {
                        let nextIsNewCategoryGroup = (array[index+1].category_title != cat.category_title) ? true : false    
                        if (cat.category_type == 'expense') {
                            tmpExpenseArr.push(cat)
                            groupTotalPlan += cat.CategoryPlan.planAmount
                            groupTotalActual += cat.totalReportAmountDebit - cat.totalReportAmountCredit
                            calcPlanExpenseTotal += cat.CategoryPlan.planAmount
                            calcActualExpenseTotal += cat.totalReportAmountCredit - cat.totalReportAmountDebit  
                            if (nextIsNewCategoryGroup) {
                                let groupTotalObj = {grpid:cat.id , groupCategoryTitle: cat.category_title, groupTotalPlan, groupTotalActual }
                                tmpExpenseArr.push(groupTotalObj)
                                groupTotalPlan = 0
                                groupTotalActual = 0
                            }
                        }
                        if (cat.category_type == 'income') {
                            tmpIncomeArr.push(cat)
                            groupTotalPlan += cat.CategoryPlan.planAmount
                            groupTotalActual += cat.totalReportAmountDebit - cat.totalReportAmountCredit
                            calcPlanIncomeTotal += cat.CategoryPlan.planAmount
                            calcActualIncomeTotal += cat.totalReportAmountDebit - cat.totalReportAmountCredit
                            if (nextIsNewCategoryGroup) {
                                let groupTotalObj = {grpid:cat.id , groupCategoryTitle: cat.category_title, groupTotalPlan, groupTotalActual }
                                tmpIncomeArr.push(groupTotalObj)
                                groupTotalPlan = 0
                                groupTotalActual = 0
                            }
                        }
                        if (cat.category_type == 'savings') {
                            tmpSavingsArr.push(cat)
                            groupTotalPlan += cat.CategoryPlan.planAmount
                            groupTotalActual = 0  //Not using the actual totals yet (not sure if/how)
                            calcPlanSavingsTotal += cat.CategoryPlan.planAmount
                            calcActualSavingsTotal = 0 //Not using the actual totals yet (not sure if/how)
                            if (nextIsNewCategoryGroup) {
                                let groupTotalObj = {grpid:cat.id , groupCategoryTitle: cat.category_title, groupTotalPlan, groupTotalActual }
                                tmpSavingsArr.push(groupTotalObj)
                                groupTotalPlan = 0
                                groupTotalActual = 0
                            }
                        }

                   }
                })
                setExpenseArr(tmpExpenseArr)
                setIncomeArr(tmpIncomeArr)
                setSavingsArr(tmpSavingsArr)
                setPlanIncomeTotal(calcPlanIncomeTotal)
                setPlanExpenseTotal(calcPlanExpenseTotal)
                setPlanSavingsTotal(calcPlanSavingsTotal)
                setActualIncomeTotal(calcActualIncomeTotal)
                setActualExpenseTotal(calcActualExpenseTotal)        

            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getAllWithTotalByDate()
    }, [thisMonth, thisYear])  




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
                let total = 0
                data.map( cat => {
                    total += cat.bankBalance
                })
                setBankAccountsTotal(total)
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getBankAccountCategoriesWithTotals()
    }, [])  





/*****************
    
    Modal
    
****************** */

    const handleShowModalDelete = (id) => {   //Actions: 'edit' 'delete'
        //Clear all state values
        setRadioValue('')
        setDeleteCategoryHasLoaded(false)
        setDeleteCategoryHasTransactions(false)

        categoryService.getById(id)
            .then((data) => {
                setDeleteCategory(data)
                setDeleteCategoryHasLoaded(true)
                if (data.CategoryTransactions.length == 0) {
                    setDeleteCategoryHasTransactions(false)
                }else {
                    setDeleteCategoryHasTransactions(true)
                }     
                setShowModalDelete(true)            
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    }


/*****************
    
    Edit Category Title
    
****************** */


    const handleClickEditCategory = (id, title) => {
        setNewCategoryTitle(title)
        setEditCategory(id)
    }


    const handleChangeNewCategoryTitle = (e) => {
        setNewCategoryTitle(e.target.value)
    }


    const handleUpdateCategory = () => {
        let newCat = {
            id: editCategory,
            category_title: newCategoryTitle
        }
        categoryService.update(newCat)
            .then((data) => {
                getAllWithTotalByDate()
                setNewCategoryTitle('')
                setEditCategory('')
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
        });
    }


/*****************
    
    Delete Category
    
****************** */

    const handleClickDeleteCategory = () => {
            alertService.clear();
            categoryService.delete(deleteCategory.id)
                .then((res) => {
                    alertService.success('Deleted');
                    setShowModalDelete('')
                    setDeleteCategory('')
                    getAllWithTotalByDate()
                    getCategories()
                })
                .catch(error => {
                    alertService.error(error);
                });        
    }

    // Choose options
    const handleChangeInput = (e) => {  // values are 'delete', 'transfer', 'hide'
        setRadioValue(e.target.value)

    }

    //Select category to transfer transactions to
    const handleChangeSelectCategory = (e) => {
        setTransferToCategory(e.target.value)

    }

    const handleTransferTransactions = () => {
            alertService.clear();
           let transferTransactions = []
           deleteCategory.CategoryTransactions.map( t => {
               let obj = {
                id: t.id,
                categoryId: transferToCategory
               }
               transferTransactions.push(obj)
            })

        transactionService.bulkCreate(transferTransactions)
                .then((res) => {
                    handleClickDeleteCategory()
                })
                .catch(error => {
                    alertService.error(error);
                });        
    }



/*****************
    
    Edit Plan
    
****************** */


    const handleClickEditPlan = (id, amt) => {
        setNewPlanAmount(amt)
        setEditPlan(id)
    }

    const handleChangePlanAmount = (e) => {
        setNewPlanAmount(e.target.value)
    }

    const handleUpdatePlan = () => {
        let newPlan = {
            id: editPlan,
            planAmount: newPlanAmount
        }
        planService.update(newPlan)
            .then((data) => {
                getAllWithTotalByDate()
                setNewPlanAmount('')
                setEditPlan('')
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
        });
    }







    return (
        <div className="container-fluid">
            {
                dataIsLoading && 'Loader' ||
                <div className="row">
                    <div className="col-md-9">
                        <h1>Plan</h1>
                            <p>Total Cash: <NumericFormat value={bankAccountsTotal.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} /></p>
                            <p>Unallocated: <NumericFormat value={(bankAccountsTotal - (planExpenseTotal + planSavingsTotal)).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} /></p>

                                <div>

                                    <div className="btn-group dropdown">
                                      <button type="button" className="btn btn-link btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="bi-plus"></i> Add Category Group
                                      </button>
                                        <div className="dropdown-menu px-2" style={ {minWidth: '500px'} }>
                                            <CategoryForm parentId={null} category_type='expense' isGroupForm={true} getAllWithTotalByDate={getAllWithTotalByDate} />
                                        </div>
                                    </div>


                                    <table className='table table-sm'>
                                        <tbody>
                                            <tr>
                                                <th></th>
                                                <th className='text-end'>Plan</th>
                                                <th className='text-end'>Actual</th>
                                                <th className='text-end'>Difference</th>


                                            </tr>
                         
                                            <PlanExpenseList 
                                                categoryArray={expenseArr}
                                                handleChangeNewCategoryTitle = {handleChangeNewCategoryTitle}
                                                handleClickEditCategory = {handleClickEditCategory}
                                                handleClickEditPlan = {handleClickEditPlan}
                                                handleShowModalDelete = {handleShowModalDelete}
                                                handleUpdateCategory={handleUpdateCategory}
                                                newCategoryTitle = {newCategoryTitle}
                                                getAllWithTotalByDate = {getAllWithTotalByDate}
                                                editCategory = {editCategory}
                                                editPlan={editPlan}
                                                handleChangePlanAmount={handleChangePlanAmount}
                                                newPlanAmount={newPlanAmount}
                                                handleUpdatePlan={handleUpdatePlan}
                                            />

                                            <tr className="table-info">
                                                <td className='fw-bold'>Total Expenses</td>
                                                <td className='text-end'><NumericFormat value={planExpenseTotal.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} /></td>
                                                <td className='text-end'><NumericFormat value={actualExpenseTotal.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} /></td>
                                                <td className='text-end'><NumericFormat value={(actualExpenseTotal - planExpenseTotal).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} /></td>

                                            </tr>           


                                        </tbody>
                                    </table>

                                    { showModalDelete  &&
                                        <Modal showModal={showModalDelete} setShowModal={setShowModalDelete} title='Alert!'>


                                             { deleteCategoryHasTransactions   &&
                                                <div>
                                                    <p>This category has {deleteCategory.CategoryTransactions.length} transactions associated with it. </p>
                                                        
                                                    <div className="form-check">
                                                      <input onChange={(e) => handleChangeInput(e)} className="form-check-input" type="radio"name="radio_option" value="transfer" id="radio-transfer-it" />
                                                      <label className="form-check-label" htmlFor="radio-transfer-it">
                                                        Transfer transactions to another category.
                                                      </label>
                                                    </div>
                                                </div>
                                            }

                                            { !deleteCategoryHasTransactions   &&
                                                <div>
                                                    <p>Yippee! This category has no transactions associated with it. </p>
                                                    <div className="form-check">
                                                      <input onChange={(e) => handleChangeInput(e)} className="form-check-input" type="radio" name="radio_option" value="delete" id="radio-delete-it" />
                                                      <label className="form-check-label" htmlFor="radio-delete-it">
                                                        Go ahead and delete it.
                                                      </label>
                                                    </div>
                                                </div>
                                            }
                                             
                                            <div className="form-check">
                                              <input onChange={(e) => handleChangeInput(e)} className="form-check-input" type="radio" name="radio_option" value="hide" id="radio-hide-it" />
                                              <label className="form-check-label" htmlFor="radio-delete-it">
                                                Hide it and save it for later.
                                              </label>
                                            </div>


                                            { radioValue=='transfer' &&
                                                <div>
                                                    <select onChange={handleChangeSelectCategory} name="bank_account_id" component="select" className={'form-control CategorySelect'}>
                                                        <CategorySelectOptions categories={categories} categoryType={(deleteCategory.category_type == 'income' ? 'incomeOnly' : 'expenseOnly')} defaultOption="Select an Account" />
                                                    </select>
                                                    <button onClick={handleTransferTransactions} type="button" className="btn btn-primary">Transfer Transactions</button>
                                                </div>
                                            }

                                            { radioValue=='hide' &&
                                                <button onClick={handleHideCategory} type="button" className="btn btn-primary">Hide it</button>
                                            }

                                            { radioValue=='delete' &&
                                                <button onClick={handleClickDeleteCategory} type="button" className="btn btn-danger">Delete it!</button>
                                            }
                                        </Modal>
                                    }


                                </div>
                
                    </div>
                    <div className="col-md-3">
                        <div> 

                            <table className='table table-sm'>
                                <tbody>
                                    <PlanIncomeList 
                                        categoryArray={incomeArr}
                                        handleChangeNewCategoryTitle = {handleChangeNewCategoryTitle}
                                        handleClickEditCategory = {handleClickEditCategory}
                                        handleShowModalDelete = {handleShowModalDelete}
                                        handleUpdateCategory= {handleUpdateCategory}
                                        newCategoryTitle = {newCategoryTitle}
                                        getAllWithTotalByDate = {getAllWithTotalByDate}
                                        editCategory = {editCategory}
                                    />
                                </tbody>
                            </table>

                            <table className='table table-sm'>
                                <tbody>
                                    <PlanSavingsList 
                                        categoryArray={savingsArr}
                                        handleChangeNewCategoryTitle = {handleChangeNewCategoryTitle}
                                        handleClickEditCategory = {handleClickEditCategory}
                                        handleClickEditPlan = {handleClickEditPlan}
                                        handleShowModalDelete = {handleShowModalDelete}
                                        handleUpdateCategory={handleUpdateCategory}
                                        newCategoryTitle = {newCategoryTitle}
                                        getAllWithTotalByDate = {getAllWithTotalByDate}
                                        editCategory = {editCategory}
                                        editPlan={editPlan}
                                        handleChangePlanAmount={handleChangePlanAmount}
                                        newPlanAmount={newPlanAmount}
                                        handleUpdatePlan={handleUpdatePlan}
                                    />
                                </tbody>
                            </table>


                        </div>
                    </div>
                </div> 
            }


        </div>

    );
}

export { Plan };