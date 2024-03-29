import React from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { alertService, categoryService } from '@/_services';
import { fetchWrapper, history } from '@/_helpers';


function CategoryForm(props) {

    const initialValues = {
        category_title: ''
    };



    const validationSchema = Yup.object().shape({
        category_title: Yup.string().required('Description is required')
    });


	function onSubmit({ category_title }, { setSubmitting, resetForm }) {
        alertService.clear();
        let newCat = {
            category_title, 
            category_type: props.isGroupForm ? 'expense' : props.category_type, //Only Expense Cats have groups
            parentId: props.parentId
        }

        categoryService.create(newCat)
            .then(() => {
                alertService.success('Saved');
                setSubmitting(false);  
                resetForm();
                props.getAllWithTotalByDate();              
            })
            .catch(error => {
                setSubmitting(false);
                alertService.error(error);
            });
	}




	return(


          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} >
            {({ values, errors, touched, isSubmitting, isValid, handleChange, handleBlur }) => (
                <Form>
                    <div className="input-group">
                            <Field name="category_title" type="text" placeholder={props.isGroupForm ? 'New Group Title' : 'New Category Title'} className={'form-control'} />
                            <button className="btn btn-outline-secondary" type="submit" disabled={!isValid} id="button-addon2">Save</button>
                    </div>
                    <ErrorMessage name="category_title" component="div" className="text-danger" />

                </Form>
            )}
        </Formik>
	);
}


export { CategoryForm };