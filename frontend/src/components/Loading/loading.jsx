import React from 'react'

export default function Loading() {
    return (
        <div className='d-flex flex-column vw-100 vh-100 align-items-center justify-content-center bg-white'>
            <div className="preloader3 loader-block">
                <div className="circ1 loader-md"></div>
                <div className="circ2 loader-md"></div>
                <div className="circ3 loader-md"></div>
                <div className="circ4 loader-md"></div>
            </div>
        </div>
    )
}

export function LoadingPage() {
    return (
        <div className='d-flex flex-column align-items-center justify-content-start'>
            <div className="preloader3 d-flex flex-row align-items-start">
                <div className="circ1 loader-"></div>
                <div className="circ2 loader-"></div>
                <div className="circ3 loader-"></div>
                <div className="circ4 loader-"></div>
            </div>
        </div>
    )
}


export function LoadingData() {
    return (
        <div className='position-absolute top-50 start-50 z-20'>
            <div className="spinner-border text-primary">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
}