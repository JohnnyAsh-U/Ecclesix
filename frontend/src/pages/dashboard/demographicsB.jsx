import React from 'react'
import ProgressRow from '../../components/progress/progressRow'

const DemographicsB = ({ title, color, data }) => {
    return (
        <div className="card p-1">
            <div className="card-header mb-0 pb-1">
                <div className="card-header-left">
                    <h5>{title}</h5>
                </div>
            </div>
            <div className="card-body w-100 mt-0">
                {data && data.map((d, index) =>
                    <div className="card-progress p-t-10" key={index}>
                        <ProgressRow title={d.title || d.sexe || d.profession || d.statut} color={color} value={d.percent} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default DemographicsB