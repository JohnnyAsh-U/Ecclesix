import React from 'react'
import { useTranslation } from 'react-i18next'
import HeaderNotification from './HeaderNotification'
import HeaderProfileIcon from './HeaderProfileIcon'
import HeaderMessageIcon from './HeaderMessageIcon'
import Announcement from '../Announcement/Announcement'
import { Dropdown } from 'react-bootstrap'



const HeaderMenu = ({ userIconShow }) => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        window.location.reload(); // optionally reload to ensure all data refetches if necessary, but just changing lng triggers re-render for i18n
    };

    return (
        <div className="navbar-container container-fluid">
            <ul className="nav-left">
                <li className="mega-menu-top ps-4 d-flex align-items-center">
                    <Dropdown className="me-3">
                        <Dropdown.Toggle variant="outline-secondary" size="sm" id="languageDropdown">
                            {i18n.language === 'fr' ? t('header.french') : t('header.english')}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => changeLanguage('fr')}>{t('header.french')}</Dropdown.Item>
                            <Dropdown.Item onClick={() => changeLanguage('en')}>{t('header.english')}</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                  

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