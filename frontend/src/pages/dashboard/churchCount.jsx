import React from 'react'
import useFetch from '../../hooks/fetchHook'
import { toast } from 'react-toastify'
import Badge from '../../components/buttons/badge'
import {Link} from 'react-router-dom'

const ChurchMemberCount = () => {
    const { loading, data, error, reload } = useFetch(`/eglise/liste`, 'get')
    const { res } = data || {}

    if (loading) {
        return
    }

    if (error) {
        toast.error("Erreur")
        return
    }
    return (
        <div className="card ">
            <div className="card-header ">
                <div className="card-header-left ">
                    <h5>Les Eglises</h5>
                </div>
            </div>
            <div className="card-body " style={{ height: '335px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                {res.map(eglise =>
                    <div className="browser-card  b-t-default p-t-15 p-b-15 " key={eglise.id_eglise}>
                        <Link className="d-inline-block m-0 " to={`/eglise/${eglise.id_eglise}`}>{eglise.lib_eglise}</Link>
                        <Badge text={eglise.no_membres} color={"primary"} className={'float-end f-12 p-2 round'} />
                    </div>
                )}
                <hr className='my-1'/>
            </div>
        </div>
    )
}

export default ChurchMemberCount