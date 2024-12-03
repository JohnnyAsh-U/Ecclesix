import React from 'react'
import './style.css'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faCalendar, faCheck, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import useFetch from '../../hooks/fetchHook'
import { LoadingData } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import { AjouterType, ModifierType, SupprimerType } from './type_evenement_modal'



const TypeEvenement = () => {
    const [modal, setModal] = useState(null)
    const [type, setType] = useState({})
    const { loading, data, error, reload } = useFetch(`/evenement/type`, 'get')
    const { liste: listetype } = data || {}

    const handleModal = () => {
        setModal(null)
    }



    if (error) {
        toast.error('Impossible de charger les donnees')
        return
    }


    return (
        <div className="card mb-0" style={{ minHeight: '73vh' }}>
            <div className="card-header">
                <h5 className='card-header-left'>
                    <FontAwesomeIcon icon={faCalendar} className='me-1' />
                    Les Types Evenements
                </h5>
                <div className='card-header-right'>
                    <div className='btn btn-round btn-primary btn-sm hor-grd btn-grd-primary' onClick={() => setModal('ajouter')}>
                        <FontAwesomeIcon icon={faAdd} />
                    </div>
                </div>
            </div>

            <div className=" card-body position-relative">
                {(loading) && <LoadingData />}

                <div className="table-responsive mb-3">
                    <table className="table table-hover table-striped table-bordered nowrap">
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th >ID</th>
                                <th >Type Evenement</th>
                                <th >Culte Ordinaire</th>
                                <th ></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && listetype.map((type, id) =>
                                <tr key={id} className='custom'>
                                    <td> {type.id_type_evenement}</td>
                                    <td> {type.lib_type_evenement}</td>
                                    <td> {type.evenement_ordinaire && <FontAwesomeIcon icon={faCheck} />}</td>
                                    <td >
                                        <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                            <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setType(type); setModal('modifier') }}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setType(type); setModal('supprimer') }}>
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

            <AjouterType
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
            />


            <ModifierType
                type={type}
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
            />

            <SupprimerType
                modal={modal}
                type={type}
                handleModal={handleModal}
                fetch={reload}
            />
        </div>
    )
}
export default TypeEvenement