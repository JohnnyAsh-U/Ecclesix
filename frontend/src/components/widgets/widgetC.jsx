import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import ThirdChart from '../charts/thirdchart'

const WidgetC = ({icon, title, value, chartData, chartLabel, color}) => {
    return (
        <div className="card shadow-none border" style={{ height: '220px' }}>
            <div className="card-header position-relative d-flex justify-content-center align-items-center" style={{ height: '120px', background: color }}>
                <FontAwesomeIcon icon={icon} className='text-white' size='3x' bounce />
                <ThirdChart chart={'line'} label={chartLabel} chartData={chartData} className="chart-wrapper position-absolute w-100 h-100" />
            </div>
            <div className="card-body row text-center align-items-center" >
                <div className="col">
                    <div className="fs-5 fw-semibold">{value}
                    </div>
                    <div className="text-uppercase text-body-secondary small">
                        {title}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WidgetC