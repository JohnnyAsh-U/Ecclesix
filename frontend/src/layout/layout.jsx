import React from 'react'
import Header from '../components/header/Header'
import Sidebar from '../components/sidebar/Sidebar'
import { Content } from '../components/content/Content'
import { AppGlobalContext } from '../hooks/AppContext'

const Layout = () => {

    const { verticalEffect, verticalNavType, deviceType, handleSideBarIconClick } = AppGlobalContext()

    return (
        <div id="pcoded"
            className="pcoded iscollapsed"
            theme-layout="vertical"
            vertical-placement="left"
            vertical-layout="wide"
            pcoded-device-type={deviceType}
            vertical-nav-type={verticalNavType}
            vertical-effect={verticalEffect}
            vnavigation-view="view1"
            nav-type="st2"
        >
            <div className="pcoded-overlay-box" onClick={() => handleSideBarIconClick()}></div>
            <div className="pcoded-container navbar-wrapper">
                <Header />
                <div className="pcoded-main-container">
                    <div className="pcoded-wrapper">
                        <Sidebar deviceType={deviceType} />
                        <div className="pcoded-content" style={{ marginTop: '60px' }}>
                            <Content />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout