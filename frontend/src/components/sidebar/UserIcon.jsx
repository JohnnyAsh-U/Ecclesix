import React, { useState } from 'react'
import Avatar4 from '../../assets/images/avatar-4.jpg'
import { jwtDecode } from 'jwt-decode'
import { NavLink } from 'react-router-dom'
import { AppGlobalContext } from '../../hooks/AppContext'


const UserIcon = () => {
    const [showOptions, setShowOptions] = useState(false)
    const admin = jwtDecode(localStorage.getItem('chms'))
  const { deconnexion } = AppGlobalContext()


    return (
        <div className="">
            <div className="main-menu-header">
                <img className="img-40 img-radius" src={Avatar4}
                    alt="User-Profile-Image" />
                <div className="user-details" onClick={() => setShowOptions(!showOptions)}>
                    <span>{admin?.username}</span>
                    <span id="more-details">UX Designer<i className="ti-angle-down"></i></span>
                </div>
            </div>
            {showOptions &&
                <div className="main-menu-content" >
                    <ul>
                        <li className="more-details" style={{ display: 'list-item' }}>
                            <a href="user-profile.html"><i className="ti-user"></i>View Profile</a>
                            <a href="#!"><i className="ti-settings"></i>Settings</a>
                            <NavLink to="#" onClick={()=>deconnexion()}>
                                <i className="ti-layout-sidebar-left"></i>
                                Deconnexion
                                </NavLink>
                        </li>
                    </ul>
                </div>}
        </div>
    )
}

export default UserIcon