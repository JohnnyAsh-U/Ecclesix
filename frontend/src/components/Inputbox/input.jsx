import { ErrorMessage, Field } from 'formik'
import React from 'react'

//with formik
export const FormInput = ({ name, ...rest }) => {
    return (
        <React.Fragment>
            <Field className="form-control input-danger" name={name} {...rest} />
            <span className="messages text-left">
                <p className="text-danger text-left  error small ms-1">
                    <ErrorMessage name={name} />
                </p>
            </span>
        </React.Fragment>
    )
}


export const FormInputWithLabel = ({title, name, ...rest }) => {
    return (
        <div className="form-group row mb-2">
            <label className="col-sm-3 col-form-label fw-bold">{title}</label>
            <div className="col-sm-9">
                <FormInput name={name} {...rest} />
            </div>
        </div>
    )
}


//with formik
export const FormInputAddOn = ({ name, color, addon, ...rest }) => {
    return (
        <React.Fragment>
            <div className="input-group mb-0">
                <span className={`input-group-text bg-${color}`}
                    id="basic-addon1">
                    {addon}
                </span>
                <Field className="form-control input-danger" name={name} {...rest} />
            </div>
            <span className="messages text-left mb-0">
                <p className="text-danger messages mb-0 text-left  error small ms-1">
                    <ErrorMessage name={name} />
                </p>
            </span>
        </React.Fragment>

    )
}
