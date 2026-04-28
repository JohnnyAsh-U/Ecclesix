import React from 'react'
import HeaderNotification from './HeaderNotification'
import HeaderProfileIcon from './HeaderProfileIcon'
import HeaderMessageIcon from './HeaderMessageIcon'
import Announcement from '../Announcement/Announcement'



const HeaderMenu = ({ userIconShow }) => {

    return (
        <div className="navbar-container container-fluid">
            <ul className="nav-left">

                <li className="mega-menu-top ps-4">

                  

                    <Announcement />
                    {/* <Marquee></Marquee> */}

                    {/* <a href="#">
                        Home
                        <i className="ti-angle-down"></i>
                    </a> */}
                </li>
            </ul>
            {/* To toggle display of userprofile icon */}
            <ul className="nav-right" style={{ display: userIconShow ? 'block' : 'none' }}>
                <HeaderNotification />
                {/* <HeaderMessageIcon /> */}
                <HeaderProfileIcon />
            </ul>

        </div>
    )
}

export default HeaderMenu