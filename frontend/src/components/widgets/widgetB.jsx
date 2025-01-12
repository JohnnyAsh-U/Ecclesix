import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const WidgetB = ({ color, icon, label, amount }) => {
    return (
        <div className="card text-white d-flex flex-row justify-content-center align-items-center shadow-sm" style={{ minWidth: '190px', height: '75px' }}>
            <div className={`d-flex w-25 bg-${color} h-100 justify-content-center align-items-center rounded-start`}>
                <FontAwesomeIcon icon={icon} size='2xl'  />
            </div>
            <div className={`card-body text-${color} w-75  h-100 border justify-content-center d-flex flex-column rounded-end`}>
                <span className='fw-semibold mt-0'>{amount}</span>
                <div className='text-muted text-uppercase small fw-semibold'>{label}</div>
            </div>
        </div>
    )
}

export default WidgetB