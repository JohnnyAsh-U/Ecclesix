import React from 'react'
import './style.css'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faChurch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import useFetch from '../../hooks/fetchHook'
import { LoadingData } from '../../components/Loading/loading'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { formatDate } from '../../utils/datetime/month'
import { capitalizeFirstLetter } from '../../utils/string/formatting'
import { ModifierModal } from '../eglise/modal'
import AjouterModal, { SupprimerModal } from './eglise_modal'


const Eglise = () => {
    const [modal, setModal] = useState(null)
    const [eglise, setEglise] = useState({})
    const { loading, data, error, reload } = useFetch(`/eglise`, 'get')
    const liste = data || {}


    if (error) {
        toast.error('Impossible de charger les donnees')
        return
    }



    return (
        <div className="card mb-0" style={{ minHeight: '73vh' }}>
            <div className="card-header">
                <h5 className='card-header-left'>
                    <FontAwesomeIcon icon={faChurch} className='me-1' />
                    Les Eglises
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
                    <table className="table table-hover table-striped table-bordered ">
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th><FontAwesomeIcon icon={faChurch} /> Eglise</th>
                                <th >Type</th>
                                <th >Ville</th>
                                <th>Address</th>
                                <th>Date</th>
                                <th >Ministre</th>
                                <th>Assistant</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && liste.map((eg, id) =>
                                <tr key={id} className='custom'>
                                    <td> {eg.church_name}</td>
                                    <td> {eg.type_name ? eg.type_name : <i className="small font-italic"> Pas de type</i>}</td>
                                    <td> {eg.city_name ? eg.city_name : 'Pas de Ville'}</td>
                                    <td className='text-wrap'>{eg.address}</td>
                                    <td>
                                        {formatDate(eg.opening_date)}
                                    </td>
                                    <td>
                                        <Link to={`/membres/profile/${eg.leader_name?.id}`}>
                                            {/* {eg.ministre ? capitalizeFirstLetter(eg.ministre?.nom) + ' ' + capitalizeFirstLetter(eg.ministre?.prenom) : ''}] */}
                                            {eg.leader_name?.name}
                                        </Link>
                                    </td>
                                    <td>
                                        <Link to={`/membres/profile/${eg.leader2_name?.id}`}>
                                            {/* {eg.assistant_ministre ? capitalizeFirstLetter(eg.assistant_ministre?.nom) + ' ' + capitalizeFirstLetter(eg.assistant_ministre?.prenom) : ''} */}
                                            {eg.leader2_name?.name}
                                        </Link>
                                    </td>


                                    <td >
                                        <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                            <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setEglise(eg); setModal('modifier') }}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setEglise(eg); setModal('supprimer') }}>
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

            <AjouterModal
                modal={modal}
                setModal={setModal}
            />

            <ModifierModal
                modal={modal}
                eglise={eglise}
                setModal={setModal}
            />

            <SupprimerModal
                modal={modal}
                eglise={eglise}
                setModal={setModal}
            />
        </div>
    )
}

export default Eglise