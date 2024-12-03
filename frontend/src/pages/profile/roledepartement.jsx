import { faCalendarAlt, faCalendarCheck, faGear, faLevelDownAlt, faPencil, faUserGear, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
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
        axios.put(`/membre/${membre.id}/role`,
            { id_role: membreRole }).then(data => {
                toast.success('Success')
                props.fetch()
            })
            .catch(err => {
                toast.error('Echec')
            })
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
                            <FontAwesomeIcon icon={faCalendarAlt} className='me-1'/>
                            Arrivé le
                            <span className="text-muted f-right">
                                {membre.date_arrive ? formatDate(membre.date_arrive) : ''}
                            </span>
                        </li>

                        <li className="list-group-item justify-content-between">
                        <FontAwesomeIcon icon={faUserGear} className='me-1'/>
                            Statut
                            <span className="text-muted f-right">
                                {ActifStatut(membre)}
                            </span>
                        </li>

                        <li className="list-group-item justify-content-between align-items-center">
                            
                            <FontAwesomeIcon icon={faGear} className='me-1'/>
                            
                            Role

                            {!modifierRole &&
                                <span className="text-secondary f-right">
                                    {membre.role && membre.role.lib_role}
                                    <AdminEtSuperAdmin membre={membre}>
                                        <ContentPermsWrapper requiredPerms={['modifier_membre']}>
                                            <FontAwesomeIcon icon={faPencil} className='ms-2' onClick={() => setModifierRole(true)} style={{ cursor: 'pointer' }} />
                                        </ContentPermsWrapper>
                                    </AdminEtSuperAdmin>
                                </span>
                            }

                            {modifierRole &&
                                <p className='d-flex mt-3'>
                                    <FormSelect type='text' value={membreRole} onChange={(val) => setMembreRole(val.target.value)}>
                                        <option value={0} disabled>Role...</option>
                                        {roles.map(role =>
                                            <option key={role.id_role} value={role.id_role}>{role.lib_role}</option>)}
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
                        {membre.departement.map((dep) =>
                            <li className="list-group-item justify-content-between" key={dep.id_groupe}>
                                {dep.lib_groupe}
                                <span className="float-end">{dep.id_chef == membre.id ? "Responsable" : ''}</span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default RoleDepartement