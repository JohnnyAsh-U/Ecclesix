import React from 'react'
// import Avatar4 from '../../assets/images/avatar-4.jpg'
import { jwtDecode } from 'jwt-decode'
import { NavLink } from 'react-router-dom'
import { AppGlobalContext } from '../../hooks/AppContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons'



const HeaderProfileIcon = () => {
    const { deconnexion, permissions } = AppGlobalContext()

    const admin = jwtDecode(localStorage.getItem('chms'))


    return (
        <li className="user-profile header-notification">
            <a href="#!" className='d-flex justify-content-center align-items-center'>
                {/* <img src={Avatar4} className="img-radius"
                    alt="User-Profile-Image" /> */}
                <FontAwesomeIcon icon={faUser} size='xl' border className='img-radius mx-1' />
                <span>{admin?.username}</span>
                <i className="ti-angle-down"></i>
            </a>
            <ul className="show-notification profile-notification">
                {/* <li>
                    <a href="#!">
                        <i className="ti-settings"></i> Settings
                    </a>
                </li> */}
                <li>
                    <NavLink to={`/membres/profile/${admin.id}`}>
                        <i className="ti-user"></i> Profil
                    </NavLink>
                </li>
                {permissions?.superAdmin &&
                    <li>
                        <NavLink to="/abonnement">
                            <i className="ti-wallet"></i> Abonnement
                        </NavLink>
                    </li>
                }
                <li>
                    <NavLink to="/support">
                        <i className="ti-email"></i> Support
                    </NavLink>
                </li>
                {/* <li>
                    <a href="email-inbox.html">
                        <i className="ti-email"></i> My Messages
                    </a>
                </li>
                <li>
                    <a href="auth-lock-screen.html">
                        <i className="ti-lock"></i> Lock Screen
                    </a>
                </li> */}
                <li>
                    <NavLink to="#" onClick={() => deconnexion()}>
                        <i className="ti-layout-sidebar-left"></i> Deconnexion
                    </NavLink>
                </li>
            </ul>
        </li>
    )
}

export default HeaderProfileIcon