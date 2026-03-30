import React from 'react'
import ProgressBar from './progress'

const ProgressRow = ({title, color, value}) => {
    return (
        <div className="row ">
            <div className="col-sm-4 text-left ">
                <label className="text-muted ">{title}</label>
            </div>
            <div className="col-sm-6 ">
                <ProgressBar color={color} value={value} />
            </div>
            <div className="col-sm-2 ">
                <label className="text-muted ">{value}%</label>
            </div>
        </div>
    )
}

export default ProgressRow