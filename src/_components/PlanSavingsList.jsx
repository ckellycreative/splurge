import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import { CategoryForm } from '../_components/CategoryForm'
import { CategoryPlanForm } from '../_components/CategoryPlanForm'

function PlanSavingsList(props) {
    
    let parentTitle = '' //For iterating the cash reserves row subheadings
    const categories =  props.categoryArray.map((cat, index, array) => {
                let isNewCategoryGroup = (parentTitle != cat.category_title) ? true : false
                let isGroupTotal = (cat.groupTotalPlan != null) ? true : false
                let totalReportAmount = (!isGroupTotal) ? cat.totalReportAmountDebit - cat.totalReportAmountCredit : 0
                let planAmount = (!isGroupTotal && cat.CategoryPlan.planAmount) ? cat.CategoryPlan.planAmount  : 0
                parentTitle = cat.category_title
                    return (    
                        <React.Fragment key={isGroupTotal ? cat.grpCatId : cat.ChildCategory.id}>
                        {isNewCategoryGroup  && !isGroupTotal &&


                            <React.Fragment>
                                        <tr className="table-subhead no-hover">
                                            <th className="">
                                                <h4 className="d-inline-block mb-0">{cat.category_title}</h4>
                                            </th>
                                            <th className="text-end fs-9">Plan</th>
                                            <th className="text-end fs-9">Actual</th>
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
                                                />
                                            </td>
                                        </tr>
                                        ||
                                        <tr>
                                            <td>
                                                <a className="d-block fw-semibold" onClick={() => props.handleClickCategoryPlanItem(cat)}>
                                                    {cat.ChildCategory.category_title}
                                                </a>
                                             </td>

                                            <td className="table-column-currency">
                                                <NumericFormat value={planAmount != 0 ? planAmount : '-' } valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                                            </td>
                                            <td className="table-column-currency">
                                                <NumericFormat value={planAmount != 0 ? planAmount : '-' } valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                                            </td>
                                        </tr>
                                    }
                            </React.Fragment>
                        }
                        {
                            isGroupTotal && 
                                <tr className="no-hover">
                                    <td colSpan="4" className="border border-0">
                                         <div className="btn-group dropdown">
                                            <button type="button" className="btn btn-link btn-sm text-secondary p-0 fs-8" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i className="bi-plus" data-bs-toggle="dropdown" aria-expanded="false"></i>Add Category
                                            </button>
                                            <div className="dropdown-menu px-2" style={ {minWidth: '320px'} }>
                                                <CategoryForm parentId={cat.grpCatId} category_type='expense' isGroupForm={false} getAllWithTotalByDate={props.getAllWithTotalByDate} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>

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

export { PlanSavingsList };

