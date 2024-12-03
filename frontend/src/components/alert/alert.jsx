import React from 'react'

const Alert = ({message}) => {
    return (
        <div className="alert alert-danger text-danger bg-light p-0 mb-3">
            {message}
        </div>
    )
}

export default Alert