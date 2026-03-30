import React from 'react'
import Relation from './relation'
import RoleDepartement from './roledepartement'
import Activites from './activites'
import useFetch from '../../hooks/fetchHook'
import { toast } from 'react-toastify'
import LastLogin from './lastlogin'

const Admin = ({ membre, roles, fetch }) => {
    const { loading, data, error, reload } = useFetch(`/admin/logs?id=${membre.id}&limit=6`, 'get')
    const logs = data || []

    if (error) {
        toast.error("Echec")
        return;
    }

    return (
        <div className="row">
            <div className="col-xl-3">
                <RoleDepartement
                    membre={membre}
                    roles={roles}
                    fetch={fetch} />
                <Relation membre={membre} fetch={fetch} />
            </div>
            <div className='col-xl-9'>
                <div className='card pb-2'>
                    <div className='card-header pb-3'>
                        <div className="card-header-text">
                            <h5 className="card-title">
                                Activites
                            </h5>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 col-xl-8">
                            <Activites logs={logs} />
                        </div>
                        <div className='col-sm-12 col-xl-4'>
                            <LastLogin membre={membre} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Admin