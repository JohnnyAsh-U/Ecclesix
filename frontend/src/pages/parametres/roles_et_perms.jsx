import React from 'react'
import './style.css'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faEdit, faTrash, faUserGear } from '@fortawesome/free-solid-svg-icons'
import useFetch from '../../hooks/fetchHook'
import { LoadingData } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import { AjouterRole, ModifierRole, SupprimerRole } from './roles_et_perms_modal'



const RolesPerms = () => {
    const [modal, setModal] = useState(null)
    const [role, setRole] = useState({})
    const { loading, data, error, reload } = useFetch(`/admin/roles`, 'get')
    const { perms: listePerms, roles: listeRoles } = data || {}

    const handleModal = () => {
        setModal(null)
        setRole({})
    }


    if (error) {
        toast.error('Impossible de charger les donnees')
        return
    }


    return (
        <div className="card mb-0" style={{ minHeight: '73vh' }}>
            <div className="card-header">
                <h5 className='card-header-left'>
                    <FontAwesomeIcon icon={faUserGear} className='me-1' />
                    Les Roles Et Permissions
                </h5>
                <div className='card-header-right'>
                    <div className='btn btn-round hor-grd btn-grd-primary btn-primary btn-sm' onClick={() => setModal('ajouter')}>
                        <FontAwesomeIcon icon={faAdd} />
                    </div>
                </div>
            </div>

            <div className=" card-body position-relative">
                {loading && <LoadingData />}

                <div className="table-responsive mb-3">
                    <table className="table table-hover table-striped table-bordered align-middle">
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th>ID</th>
                                <th >Roles</th>
                                <th >Description</th>
                                <th >Permissions</th>
                                <th style={{ width: '80px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && listeRoles.map((role, id) =>
                                <tr key={id} className='custom'>
                                    <td> {role.id}</td>
                                    <td> {role.role_name}</td>
                                    <td>{role.description}</td>
                                    <td>
                                        <ul className='list-group list-group-horizontal flex-wrap'>
                                            {role.permission.map((perm) =>
                                                <li className="list-group-item p-1 rounded" key={perm.id}>
                                                    <h6 className="mb-0 small">{perm.name}</h6>
                                                </li>
                                            )}
                                        </ul>
                                    </td>
                                    <td >
                                        <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                            <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setRole(role); setModal('modifier') }}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setRole(role); setModal('supprimer') }}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AjouterRole
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
                listePerms={!loading && listePerms}
            />

            {Object.keys(role).length > 0 && <ModifierRole
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
                role={role}
                listePerms={listePerms}
            />}

            <SupprimerRole
                modal={modal}
                role={role}
                handleModal={handleModal}
                fetch={reload}
            />
        </div>
    )
}
export default RolesPerms