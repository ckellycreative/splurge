import React, { useState } from "react";

function PlanCategoryActions(props) {
	return(
        <ul className="dropdown-menu">
            {props.actions.editTitle && <li><a className="dropdown-item" onClick={() => props.handleClickEditCategory(props.cat.ChildCategory.id, props.cat.ChildCategory.category_title)} type="li">Edit Name</a></li>}
            {props.actions.editPlan && <li><a className="dropdown-item" onClick={() => props.handleClickEditPlan(props.cat.CategoryPlan.id, props.cat.CategoryPlan.planAmount)}>Change Plan Amount</a></li>}
            {props.actions.delete && <li><a className="dropdown-item"  onClick={() => props.handleShowModalDelete(props.cat.ChildCategory.id)}>Delete</a></li>}
            
        </ul>

	);
}


export { PlanCategoryActions };

