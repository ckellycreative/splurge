import React, { useState } from "react";
import { NumericFormat } from 'react-number-format';

function Spinner(props) {
	return(
        <React.Fragment>
                <span  
                    className={
                        `spinner-${props.spinnerIcon} ${(props.size) ? 'spinner-'+props.spinnerIcon+'-'+props.size : ''} ${(props.overlay) ? 'spinner-page' : ''} text-${props.textColor} ${(props.classNames) ? props.classNames : ''}`
                    } 
                    role="status">
                <span className="visually-hidden">Loading...</span>
                </span>
                {props.overlay &&
                    <div  className="spinner-overlay" role="status"></div>
                }
        </React.Fragment>
 	);
}

export { Spinner };

