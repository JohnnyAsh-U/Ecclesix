import React from 'react'

export const LoadingButton = ({ name, loading, color, ...rest }) => {
    return (
        <button color={color} className={`btn btn-${color} w-100 btn-md btn-block waves-effect text-center m-b-20`} {...rest} disabled={loading}>
            {loading && <div className='spinner-border spinner-border-sm' role='status'></div>}
            {' '}{name}..
        </button>
    )
}


export const LoadingButton2 = ({ name, loading, color, size="md", ...rest }) => {
    return (
        <button color={color} className={`btn btn-${color} btn-${size} btn-block waves-effect text-center`} {...rest} disabled={loading}>
            {loading && <div className='spinner-border spinner-border-sm' role='status'></div>}
            {' '}{name}{loading && '..'}
        </button>
    )
}
