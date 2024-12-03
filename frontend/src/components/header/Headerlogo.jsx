import React from 'react'
import Image from '../../assets/images/logo.png'
import { AppGlobalContext } from '../../hooks/AppContext'


const Headerlogo = () => {

    const { handleSideBarIconClick, setUserIconShow,
        userIconShow } = AppGlobalContext()

    return (
        <div className="navbar-logo" logo-theme="theme1">

            {/* To show or hide sidebar */}
            <a className="mobile-menu" id="mobile-collapse" onClick={() => handleSideBarIconClick()}>
                <i className="ti-menu"></i>
            </a>

            <a href="index-2.html">
                <img className="img-fluid" src={Image} alt="Theme-Logo" />
            </a>

            {/* To show userprofile icon */}
            <a className="mobile-options" onClick={() => setUserIconShow(!userIconShow)}>
                <i className="ti-more"></i>
            </a>
        </div>
    )
}

export default Headerlogo