import React, { useState } from 'react'
import { AppGlobalContext } from '../../hooks/AppContext'
import Headerlogo from './Headerlogo'
import HeaderMenu from './HeaderMenu'

const Header = () => {
    const { userIconShow } = AppGlobalContext()


    return (
        <nav className="navbar header-navbar pcoded-header iscollapsed" header-theme="theme1" pcoded-header-position="fixed">
            <div className="navbar-wrapper">
                <Headerlogo />
                <HeaderMenu userIconShow={userIconShow} />
            </div>
        </nav>
    )
}

export default Header