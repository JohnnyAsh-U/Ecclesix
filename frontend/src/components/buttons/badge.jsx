import React from 'react'

const Badge = ({ text, color, className }) => {
    return (
        <span className={`badge text-bg-${color} text-white ${className}`}>
            {text}
        </span>
    )
}

export default Badge