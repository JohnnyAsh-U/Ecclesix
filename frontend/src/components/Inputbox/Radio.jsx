import React from 'react'


//without formik
const Radio = ({label, ...rest}) => {
    return (
        <div className="radio radiofill radio-inline">
            <label >
                <input type="radio" name="radio" {...rest}/>
                <i className="helper"></i>{label}
            </label>
        </div>
    )
}

export default Radio