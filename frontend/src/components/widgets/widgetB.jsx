import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const WidgetB = ({ color, icon, label, amount }) => {
    return (
        <div className="card text-white d-flex flex-row justify-content-center align-items-center shadow-sm" style={{ width: '200px', height: '75px' }}>
            <div className={`card-body w-25 bg-${color}  h-100 text-center`}>
                <FontAwesomeIcon icon={icon} size='2xl' />
            </div>
            <div className={`card-body text-${color} w-50  h-100 border justify-content-center d-flex flex-column`}>
                <span className='fw-semibold mt-0'>{amount}</span>
                <div className='text-muted text-uppercase small fw-semibold'>{label}</div>
            </div>
        </div>
    )
}

export default WidgetB