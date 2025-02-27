import React  from 'react';

function CategorySelectOptions(props) {
    let bankAccounts = props.categories.map(category => {
                        if ((category.category_type == 'tracking' || category.category_type == 'cash')  && category.hidden == false) {
                            return (    
                                <option key={category.id} value={category.id}>{category.category_title}</option>
                            )
                        }
                    })

    let incomeCats = props.categories.map(category => {

                        if (category.category_type == 'income') {
                            if (category.ChildCategory.length > 0 ) {
                                return ([    
                                    <optgroup key={category.id} label={category.category_title} ></optgroup>,

                                    category.ChildCategory.map((child) => {
                                       if(child.hidden == false){
                                            return  <option key={child.id} value={child.id}>{child.category_title}</option>
                                        }
                                    })
                                ])
                            }
                        }
                    })



    let expenseCats = props.categories.map(category => {
                        if (category.category_type == 'expense' ) {
                            if (category.ChildCategory.length > 0 ) {
                                return ([    
                                    <optgroup key={category.id} label={category.category_title} ></optgroup>,

                                    category.ChildCategory.map((child) => {
                                       if(child.hidden == false){
                                            return  <option key={child.id} value={child.id}>{child.category_title}</option>
                                        }
                                    })
                                ])
                            }
                        }
                    })


    let investmentCats = props.categories.map(category => {
                        if (category.category_type == 'investment' ) {
                            if (category.ChildCategory.length > 0 ) {
                                return ([    
                                    <optgroup key={category.id} label={category.category_title} ></optgroup>,

                                    category.ChildCategory.map((child) => {
                                       if(child.hidden == false){
                                            return  <option key={child.id} value={child.id}>{child.category_title}</option>
                                        }
                                    })
                                ])
                            }
                        }
                    })


	return(
        <React.Fragment>
            <option value='0'>{props.defaultOption}</option>

            { props.categoryType == 'bankAccount' && bankAccounts }

             { props.categoryType == 'all' && <optgroup label='Transfer to Account'></optgroup> }
             { props.categoryType == 'all' && bankAccounts }
             { props.categoryType == 'all' && investmentCats }

             { (props.categoryType == 'incomeExpense' || props.categoryType == 'all') && incomeCats }
             { (props.categoryType == 'incomeExpense' || props.categoryType == 'all') && expenseCats }

             { (props.categoryType == 'incomeOnly') && incomeCats }
             { (props.categoryType == 'expenseOnly') && expenseCats }

           
        </React.Fragment>

	);
}


export { CategorySelectOptions };

