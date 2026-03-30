import React from 'react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import UserIcon from './UserIcon'
import SideBarNavigation from './SidebarNavigation'
import { NavList } from './NavList'


const Sidebar = ({ deviceType }) => {

    return (
        <SimpleBar
            className="pcoded-navbar"
            navbar-theme="themelight1"
            active-item-theme="theme4"
            sub-item-theme="theme2"
            active-item-style="style0"
            style={{ height: deviceType == 'desktop' ? '89%' : '100%', position: 'fixed', top:deviceType =='desktop'? '80px': '0', marginBottom:'100px' }}
        >
            <div className="pcoded-inner-navbar main-menu" id='fix-menu'>

                {/* <UserIcon /> */}

                <SideBarNavigation items={NavList()} />
            </div>
        </SimpleBar>
    )
}

export default React.memo(Sidebar)