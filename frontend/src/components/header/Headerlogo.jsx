import React from 'react'
import Image from '../../assets/images/logo.png'
import { AppGlobalContext } from '../../hooks/AppContext'
import { Theme1 } from '../../utils/theme/color'
import Logo from '../logo'


const Headerlogo = () => {

    const { handleSideBarIconClick, setUserIconShow,
        userIconShow } = AppGlobalContext()

    return (
        <div className="navbar-logo" logo-theme="theme1" style={{backgroundColor: Theme1}}>

            {/* To show or hide sidebar */}
            <a className="mobile-menu" id="mobile-collapse" onClick={() => handleSideBarIconClick()}>
                <i className="ti-menu"></i>
            </a>

            <a href="#" style={{ padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                {/* <img
                    className="img-fluid"
                    src={"/ecclesix-logo-dark.png"}
                    alt="Theme-Logo"
                    style={{ maxHeight: '65px', width: 'auto' }}
                /> */}
                <Logo />
            </a>

            {/* To show userprofile icon */}
            <a className="mobile-options" onClick={() => setUserIconShow(!userIconShow)}>
                <i className="ti-more"></i>
            </a>
        </div>
    )
}

export default Headerlogo