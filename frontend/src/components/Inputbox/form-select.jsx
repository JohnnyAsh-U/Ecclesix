import React from 'react'
import { ErrorMessage, Field } from 'formik'



//without formik
export const FormSelect = ({ children, color, ...rest }) => {
    return (
        <select name="select" className={`form-select form-select-sm form-control form-control-${color}`} {...rest}>
            {children}
        </select>
    )
}

export const FormSelectWithLabel = ({ children, name, title, ...rest }) => {
    return (
        <div className="form-group row mb-2">
            <label className="col-sm-3 col-form-label fw-bold">{title}</label>
            <div className="col-sm-9">
                <Field name={name} className="form-control form-select" {...rest} as={"select"}>
                    {children}
                </Field>
                <span className="messages text-left mb-0">
                    <p className="text-danger text-left  error small ms-1">
                        <ErrorMessage name={name} />
                    </p>
                </span>
            </div>
        </div>
    )
}



//with formik
export const FormSelectAddOn = ({ children, addon, color, name, ...rest }) => {
    return (
        <React.Fragment>
            <div className="input-group mb-0">
                <span className={`input-group-text bg-${color}`}
                    id="basic-addon1">
                    {addon}
                </span>
                <Field name={name} className="form-control form-select" {...rest} as={"select"}>
                    {children}
                </Field>
            </div>
            <span className="messages text-left mb-0">
                <p className="text-danger text-left  error small ms-1">
                    <ErrorMessage name={name} />
                </p>
            </span>
        </React.Fragment>
    )
}
// export default FormSelect