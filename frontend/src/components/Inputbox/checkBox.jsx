import React from 'react'


//without formik
const CheckBox = ({ label, color, ...rest }) => {
    return (
        <div className={`checkbox-fade fade-in-${color} form-check p-0`}>
            <label>
                <input type="checkbox" {...rest}/>
                <span className="cr">
                    <i
                        className={`cr-icon icofont icofont-ui-check txt-${color}`}></i>
                </span>
                {label}
            </label>
        </div>
    )
}

export default CheckBox