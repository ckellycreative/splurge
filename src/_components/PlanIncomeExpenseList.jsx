import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import { CategoryForm } from '../_components/CategoryForm'
import { PlanCategoryActions } from '../_components/PlanCategoryActions'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import moment from 'moment'


function PlanIncomeExpenseList(props) {
    const currencyMask = createNumberMask({
      prefix: '',
      suffix: '',
      requireDecimal: true,
      includeThousandsSeparator: false,
    })

    let parentTitle = '' //For iterating the expense row subheadings
    const categories =  props.categoryArray.map((cat, index, array) => {
                //If the category is hidden, only render it if there is actual report amounts
                let isHidden = (cat.ChildCategory && cat.ChildCategory.hidden) ? true : false
                let hasReportAmounts = (cat.totalReportAmountDebit != null || cat.totalReportAmountCredit != null) ? true : false
                if ( isHidden && !hasReportAmounts) {return} 

                let childId = (typeof cat.ChildCategory != 'undefined') ? cat.ChildCategory.id : null
                let isGroupTotal = (typeof cat.ChildCategory == 'undefined') ? true : false
                let isNewCategoryGroup = (parentTitle != cat.category_title && !isGroupTotal) ? true : false
                let isNewCategoryGroupWithoutChildren = (isNewCategoryGroup && !childId) ? true : false
                let grpid = (isGroupTotal) ? cat.grpid : null
                let totalReportAmount = (!isGroupTotal) ? cat.totalReportAmountDebit - cat.totalReportAmountCredit : 0
                let planAmount = (!isGroupTotal) ? +cat.CategoryPlan.planAmount  : 0
                let difference = ''
                if (cat.category_type == 'expense' || cat.category_type == 'investment'){
                    difference =  (planAmount + totalReportAmount).toFixed(2)
                }else if (cat.category_type == 'income'){
                    difference = (totalReportAmount - planAmount).toFixed(2)
                }else {
                    difference = '-'
                }

                let keyId = null
                if (isNewCategoryGroup) {
                    keyId = cat.id
                }else if (isNewCategoryGroupWithoutChildren){
                    keyId = cat.id
                }else if (isGroupTotal) {
                    keyId = grpid
                }else {
                    keyId = childId
                }

                parentTitle = cat.category_title
                    return (    
                        <React.Fragment key={keyId}>
                        {isNewCategoryGroup  && !isGroupTotal &&
                            <div className="row tabular-data">
                                <div className="col-sm-6">
                                    <h4>{cat.category_title}</h4>

                                    <div className="btn-group dropdown">
                                        <i className="bi-folder-plus dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                        <div className="dropdown-menu px-2" style={ {minWidth: '500px'} }>
                                            <CategoryForm parentId={cat.id} category_type='expense' isGroupForm={false} getAllWithTotalByDate={props.getAllWithTotalByDate} />
                                        </div>
                                    </div>

                                    
                                </div>

                            </div>
                        }
                        { !isGroupTotal && cat.ChildCategory.id != null &&  //checks if there are no children
                        <div className="row tabular-data">
                             <div className="col-sm-6">
                                {
                                    props.editCategory == cat.ChildCategory.id &&
                                    <input onKeyPress={props.handleUpdateCategory} onBlur={props.handleUpdateCategory} onChange={props.handleChangeNewCategoryTitle} value={props.newCategoryTitle} autoFocus name="category_title" type="text" placeholder='Category Title' className={'form-control'} />
                                    ||
                                    <span>
                                    {cat.ChildCategory.category_title}


                                    <div className="btn-group dropend">
                                        <i className="bi-pencil dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                        <PlanCategoryActions 
                                            cat={cat}
                                            actions={{editTitle: true,  editPlan: (props.activeMonthYear >= moment().format('YYYY-MM')) ? true : false, delete: true, hide:true}}
                                            hasAmts={hasReportAmounts}
                                            handleClickHideCategory={props.handleClickHideCategory} 
                                            handleClickEditPlan={props.handleClickEditPlan} 
                                            handleClickEditCategory={props.handleClickEditCategory}
                                            handleShowModalDelete={props.handleShowModalDelete}
                                        />
                                    </div>



                                    </span>
                                }

                            </div>
                            <div className="col-sm-2 text-end">
                                {
                                    props.editPlan == cat.CategoryPlan.id &&

                                        <MaskedInput
                                              mask={currencyMask}
                                              id={`plan${cat.CategoryPlan.id}`}
                                              type="text"
                                              value={props.newPlanAmount}
                                              onChange={props.handleChangePlanAmount}
                                              onBlur={props.handleUpdatePlan}
                                              onKeyPress={props.handleUpdatePlan}
                                              className="form-control"
                                              autoFocus
                                        />
                                    ||

                                    <NumericFormat value={planAmount != 0 ? planAmount.toFixed(2) : '-' } valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                                }
                            </div>
                            <div className="col-sm-2 text-end">
                                <NumericFormat value={totalReportAmount != 0 ? totalReportAmount.toFixed(2) : '-'} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                            </div>
                            <div className={`col-sm-2 text-end ${difference < 0 ? 'bg-danger text-white' : (difference >= 0 && hasReportAmounts) ? 'bg-success text-white' : (difference == 0) ? 'text-muted' : ''}` }>
                                <NumericFormat value={difference} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                            </div>
                        </div>
                        }
                        {

                            isGroupTotal && 
                            <div className="row tabular-data bg-light">
                                <div className="col-sm-6 fw-bold">Total {cat.groupCategoryTitle}</div>
                                <div className="col-sm-2 text-end"><NumericFormat value={cat.groupTotalPlan.toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                                <div className="col-sm-2 text-end"><NumericFormat value={cat.groupTotalActual.toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                                <div className="col-sm-2 text-end"><NumericFormat value={(cat.groupCategoryType == 'expense') ? (cat.groupTotalPlan + cat.groupTotalActual).toFixed(2) : (cat.groupTotalActual - cat.groupTotalPlan).toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></div>

                            </div>            


                        }




                        </React.Fragment>
                    )
    })


 


    return (
        <React.Fragment>
            { categories }
        </React.Fragment>
    );
}

export { PlanIncomeExpenseList };

