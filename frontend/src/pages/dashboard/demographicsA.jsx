import React from 'react'
import ProgressBar from '../../components/progress/progress'

const DemographicsA = ({ data }) => {
    const color = ['blue', 'pink', 'yellow', 'red', 'inverse']
    return (
        <div className="card summery-card">
            <div className="card-body pb-1">
                <div className="row">
                    {data && data.map((d, index) =>
                        <div className="col b-r-default p-b-40" key={index}>
                            <h2 className="f-w-400">{d.count}</h2>
                            <p className="text-muted f-w-400">{d.title} ({d.percentage}%)</p>
                            <ProgressBar color={color[index]} value={d.percentage} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DemographicsA