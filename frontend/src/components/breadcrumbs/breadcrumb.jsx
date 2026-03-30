import React, { useEffect } from 'react'

const BreadCrumb = ({ title, icon, children }) => {

    useEffect(() => {
        document.title = `${title} | Church Management System`
    }, [title])

    if(title==='Dashboard' || title === 'Eglises' || title === 'Profile') return;

    return (
        <div className="card mb-3">
            <div className="card-body p-3">
                <div className='d-flex justify-content-between align-items-center'>
                    <h5> {icon} {title}</h5>
                    <span className='float-end'>
                        {children}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default BreadCrumb