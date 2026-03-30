import React from 'react'
import { Field, ErrorMessage } from 'formik';

const InputBox = ({ name, ...rest }) => {
    return (
        <div className="form-group row has-error">
            <div className="col-sm-12">
                <Field className="form-control input-danger" name={name} {...rest} />
                <span className="messages text-left">
                    <p className="text-danger text-left  error small ms-1">
                        <ErrorMessage name={name} />
                    </p>
                </span>
            </div>
        </div>
    )
}

export default InputBox