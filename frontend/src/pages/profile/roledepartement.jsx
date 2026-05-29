import { faCalendarAlt, faCalendarCheck, faGear, faLevelDownAlt, faPencil, faUserGear, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from '../../utils/config/axiosConfig'
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/datetime/formatdate';
import { AdminEtSuperAdmin, ContentPermsWrapper } from '../../utils/permissions/permwrapper';
import { FormSelect } from '../../components/Inputbox/form-select';
import { ActifStatut } from '../../utils/membre/statut';


const RoleDepartement = ({ membre, roles, ...props }) => {
    const [modifierRole, setModifierRole] = useState(false)
    const [membreRole, setMembreRole] = useState(membre.role?.id_role || '0')


    const handleRole = async (e) => {
        if (membreRole === '0') return
        // e.preventDefault()
        axios.patch(`/membre/${membre.id}/role`,
            { role: membreRole }).then(data => {
                toast.success('Success')
                props.fetch()
            })
            .catch(err => {
                toast.error('Echec')
            })
    }

    const formatDate = (date) => {
        if (!date) return '';
        let formatedDate = new Date(date)
        let month = formatedDate.getMonth()
        let year = formatedDate.getFullYear()
        let day = formatedDate.getDate()
        const mois = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
        return day + ' ' + mois[month] + ' ' + year
    }



    return (
        <>
            <div className="card">
                <div className="card-header pb-2">
                    <div className="card-header-text">
                        <h5 className="card-title">
                            Info
                        </h5>
                    </div>
                </div>

                <div className="card-body p-2">
                    <ul className="list-group list-group-flush ">
                        <li className="list-group-item justify-content-between">
                            <FontAwesomeIcon icon={faCalendarAlt} className='me-1' />
                            Arrivé le
                            <span className="text-muted f-right">
                                {membre.date_joined ? formatDate(membre.date_joined) : ''}
                            </span>
                        </li>

                        <li className="list-group-item justify-content-between">
                            <FontAwesomeIcon icon={faUserGear} className='me-1' />
                            Statut
                            <span className="text-muted f-right">
                                {ActifStatut(membre)}
                            </span>
                        </li>

                        <li className="list-group-item justify-content-between align-items-center">

                            <FontAwesomeIcon icon={faGear} className='me-1' />

                            Role
                            <span className="text-secondary f-right">
                                {membre.role_name}
                                {!modifierRole &&

                                    <AdminEtSuperAdmin membre={membre}>
                                        <ContentPermsWrapper requiredPerms={['modifier_membre']}>
                                            <FontAwesomeIcon icon={faPencil} className='ms-2' onClick={() => setModifierRole(true)} style={{ cursor: 'pointer' }} />
                                        </ContentPermsWrapper>
                                    </AdminEtSuperAdmin>
                                }
                            </span>

                            {modifierRole &&
                                <p className='d-flex mt-3'>
                                    <FormSelect type='text' value={membreRole} onChange={(val) => setMembreRole(val.target.value)}>
                                        <option value={0} disabled>Role...</option>
                                        {roles && roles.roles?.map(role =>
                                            <option key={role.id} value={role.id}>{role.role_name}</option>)}
                                    </FormSelect>
                                    <button className='btn btn-primary btn-sm rounded ms-1' onClick={() => { setModifierRole(false); handleRole() }}>Ok</button>
                                </p>
                            }
                        </li>
                    </ul>
                </div>
                <hr className='my-1' />

                <div className="card-body groups-contact ">
                    <h6 className="card-title f-w-500 mb-4">
                        <FontAwesomeIcon icon={faUserGroup} className='me-1'/>
                        Departements
                    </h6>
                    <ul className="list-group ">
                        {membre.departments && membre.departments.map((dep) =>
                            <li className="list-group-item justify-content-between" key={dep.id}>
                                {dep.name}
                                <span className="float-end">{dep.head == membre.id ? "Responsable" : ''}</span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default RoleDepartement