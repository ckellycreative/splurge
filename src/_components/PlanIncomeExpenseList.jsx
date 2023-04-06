import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import { CategoryForm } from '../_components/CategoryForm'
import { CategoryPlanForm } from '../_components/CategoryPlanForm'
import moment from 'moment'


function PlanIncomeExpenseList(props) {

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
                        <React.Fragment>
                                    <tr className="table-subhead no-hover">
                                        <th>
                                            <h4 className="d-inline-block">{cat.category_title}</h4>
                                            <div className="btn-group dropdown d-inline-block">
                                                <i className="bi-folder-plus" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                                <div className="dropdown-menu px-2" style={ {minWidth: '320px'} }>
                                                    <CategoryForm parentId={cat.id} category_type='expense' isGroupForm={false} getAllWithTotalByDate={props.getAllWithTotalByDate} />
                                                </div>
                                            </div>

                                        </th>
                                        <th className="fs-9 text-end">Plan</th>
                                        <th className="fs-9 text-end">Actual</th>
                                        <th className="fs-9 text-end">Difference</th>
                                    </tr>
                        </React.Fragment>

                        }
                        { !isGroupTotal && cat.ChildCategory.id != null &&  //checks if there are no children
                        <React.Fragment>
                                {props.editCategoryPlan && props.editCategoryPlan.ChildCategory.id == cat.ChildCategory.id && 
                                    <tr className="no-hover">
                                        <td colSpan="4" className="">
                                            <CategoryPlanForm 
                                                cat={cat} 
                                                handleClickCancelEditCategory={props.handleClickCancelEditCategory}
                                                onSubmitCategoryPlanForm={props.onSubmitCategoryPlanForm}
                                                handleClickHideCategory={props.handleClickHideCategory}
                                                handleShowModalDelete={props.handleShowModalDelete}
                                            />
                                        </td>
                                    </tr>
                                    ||
                                    <tr onClick={() => props.handleClickCategoryPlanItem(cat)}>
                                        <td>
                                            {cat.ChildCategory.category_title}
                                         </td>

                                        <td className="table-column-currency">
                                            <NumericFormat value={planAmount != 0 ? planAmount.toFixed(2) : '-' } valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                                        </td>
                                        <td className="table-column-currency">
                                            <NumericFormat value={totalReportAmount != 0 ? totalReportAmount.toFixed(2) : '-'} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                                        </td>
                                        <td className={`col-sm-2 table-column-currency ${difference < 0 ? 'plan-diff-danger' : (difference >= 0 && hasReportAmounts) ? 'plan-diff-success' : (difference == 0) ? 'text-muted' : ''}` }>
                                            <NumericFormat value={difference} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                                        </td>
                                    </tr>
                                }
                        </React.Fragment>

                        }
                        {

                            isGroupTotal && 
                            <React.Fragment>
                                <tr className="no-hover table-total">
                                    <td className="fw-bold">Total {cat.groupCategoryTitle}</td>
                                    <td className="text-end"><NumericFormat value={cat.groupTotalPlan.toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></td>
                                    <td className="text-end"><NumericFormat value={cat.groupTotalActual.toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></td>
                                    <td className="text-end"><NumericFormat value={(cat.groupCategoryType == 'expense') ? (cat.groupTotalPlan + cat.groupTotalActual).toFixed(2) : (cat.groupTotalActual - cat.groupTotalPlan).toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></td>
                                </tr>            
                            </React.Fragment>
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

