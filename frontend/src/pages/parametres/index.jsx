import React, { useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faCartArrowDown, faChurch, faCity, faGear, faMobileAlt, faMoneyBillTransfer, faMoneyBillTrendUp, faUserGear } from '@fortawesome/free-solid-svg-icons'
import TypeVille from './type_ville'
import Comptes from './comptes'
import './style.css'
import TypeEvenement from './type_evenement'
import Categories from './categories'
import Regles from './regles'
import RolesPerms from './roles_et_perms'
import Eglise from './eglise'
import Devices from './devices'

const Parametres = () => {
    const [settings, setSettings] = useState(5)


    return (
        <div>
            <BreadCrumb title={"Parametres"} icon={<FontAwesomeIcon icon={faGear} />} />
            <div className='row'>
                <div className='col-xl-3 mt-1'>
                    <div className="card">
                        <ul className='list-group list-group-flush rounded'>
                            <li
                                className={`list-group-item list-group-item-action py-3 ${settings == 5 ? 'active' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSettings(5)}>
                                <FontAwesomeIcon icon={faCity} /> Les Villes Et Types Eglise</li>
                            <li
                                className={`list-group-item list-group-item-action py-3 ${settings == 7 ? 'active' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSettings(7)}>
                                <FontAwesomeIcon icon={faChurch} /> Les Eglises</li>
                            <li
                                style={{ cursor: 'pointer' }}
                                className={`list-group-item list-group-item-action py-3 ${settings == 4 ? 'active' : ''}`}
                                onClick={() => setSettings(4)}>
                                <FontAwesomeIcon icon={faCalendar} /> Les Types Evenement</li>
                            <li
                                style={{ cursor: 'pointer' }}
                                className={`list-group-item list-group-item-action py-3 ${settings == 1 ? 'active' : ''}`}
                                onClick={() => setSettings(1)}>
                                <FontAwesomeIcon icon={faMoneyBillTrendUp} /> Les Comptes</li>
                            <li
                                style={{ cursor: 'pointer' }}
                                className={`list-group-item list-group-item-action py-3 ${settings == 2 ? 'active' : ''}`}
                                onClick={() => setSettings(2)}>
                                <FontAwesomeIcon icon={faCartArrowDown} /> Les Categories</li>
                            <li
                                style={{ cursor: 'pointer' }}
                                className={`list-group-item list-group-item-action py-3 ${settings == 3 ? 'active' : ''}`}
                                onClick={() => setSettings(3)}>
                                <FontAwesomeIcon icon={faMoneyBillTransfer} /> Les Regles de Transfert</li>
                            <li
                                style={{ cursor: 'pointer' }}
                                className={`list-group-item list-group-item-action py-3 ${settings == 6 ? 'active' : ''}`}
                                onClick={() => setSettings(6)}>
                                <FontAwesomeIcon icon={faUserGear} /> Les Roles Et Permissions</li>
                            <li
                                style={{ cursor: 'pointer' }}
                                className={`list-group-item list-group-item-action py-3 ${settings == 8 ? 'active' : ''}`}
                                onClick={() => setSettings(8)}>
                                <FontAwesomeIcon icon={faMobileAlt} /> Les Appareils</li>
                        </ul>
                    </div>

                </div>
                <div className={"col-xl-9 mt-1"}>

                    {settings === 1 && <Comptes />}
                    {settings === 2 && <Categories />}
                    {settings === 3 && <Regles />}
                    {settings === 4 && <TypeEvenement />}
                    {settings === 5 && <TypeVille />}
                    {settings === 6 && <RolesPerms />}
                    {settings === 7 && <Eglise />}
                    {settings === 8 && <Devices />}

                </div>
            </div >
        </div>
    )
}

export default Parametres