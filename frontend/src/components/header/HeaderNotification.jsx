import React from 'react'
import User from '../../assets/images/user.png'

const HeaderNotification = () => {
    return (
        <li className="header-notification">
            <a href="#!">
                <i className="ti-bell"></i>
                <span className="badge bg-c-pink"></span>
            </a>
            <ul className="show-notification">
                <li>
                    <h6>Notifications</h6>
                    <label className="label label-danger">New</label>
                </li>
                <li>
                    <div className="d-flex">
                        <img className="d-flex align-self-center" src={User}
                            alt="Generic placeholder image" />
                        <div className="media-body">
                            <h5 className="notification-user">John Doe</h5>
                            <p className="notification-msg">Lorem ipsum dolor sit amet, consectetuer
                                elit.</p>
                            <span className="notification-time">30 minutes ago</span>
                        </div>
                    </div>
                </li>
                <li>
                    <div className="d-flex">
                        <img className="d-flex align-self-center" src={User}
                            alt="Generic placeholder image" />
                        <div className="media-body">
                            <h5 className="notification-user">Joseph William</h5>
                            <p className="notification-msg">Lorem ipsum dolor sit amet, consectetuer
                                elit.</p>
                            <span className="notification-time">30 minutes ago</span>
                        </div>
                    </div>
                </li>
                <li>
                    <div className="d-flex">
                        <img className="d-flex align-self-center" src={User}
                            alt="Generic placeholder image" />
                        <div className="media-body">
                            <h5 className="notification-user">Sara Soudein</h5>
                            <p className="notification-msg">Lorem ipsum dolor sit amet, consectetuer
                                elit.</p>
                            <span className="notification-time">30 minutes ago</span>
                        </div>
                    </div>
                </li>
            </ul>
        </li>
    )
}

export default HeaderNotification