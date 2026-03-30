import React from 'react'

const ProgressBar = ({color, value}) => {
    return (
        <div className="progress ">
            <div className={`progress-bar bg-c-${color}`}
                style={{ width: value+ '%' }}></div>
        </div>
    )
}

export default ProgressBar