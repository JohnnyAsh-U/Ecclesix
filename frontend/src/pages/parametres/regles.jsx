import React from 'react'
import './style.css'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faChurch, faEdit, faMoneyBillTransfer, faTrash } from '@fortawesome/free-solid-svg-icons'
import useFetch from '../../hooks/fetchHook'
import { LoadingData } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import { list_month } from '../../utils/datetime/month'
import { AjouterRegle, ModifierRegle, SupprimerRegle } from './regles.modal'



const Regles = () => {
    const [modal, setModal] = useState(null)
    const [regle, setRegle] = useState({})
    const { loading, data, error, reload } = useFetch(`/finance/regles`, 'get')
    const { rules: listeRegles, category : categories, account : comptes, church: eglises } = data || {}


    const handleModal = () => {
        setModal(null)
    }


    const dateFormat = (date) => {
        if (!date) return null;
        let datetime = new Date(date)
        return `${datetime.getDate()} ${list_month[datetime.getMonth()]} ${datetime.getFullYear()}`
    }

    if (error) {
        toast.error('Impossible de charger les donnees')
        return
    }


    return (
        <div className="card mb-0" style={{ minHeight: '73vh' }}>
            <div className="card-header">
                <h5 className='card-header-left'>
                    <FontAwesomeIcon icon={faMoneyBillTransfer} className='me-1' />
                    Les Regles de Transfert
                </h5>
                <div className='card-header-right'>
                    <div className='btn btn-round hor-grd btn-grd-primary btn-primary btn-sm' onClick={() => setModal('ajouter')}>
                        <FontAwesomeIcon icon={faAdd} />
                    </div>
                </div>
            </div>

            <div className=" card-body position-relative ">
                {loading && <LoadingData />}

                <div className="table-responsive mb-3">
                    <table className="table table-hover table-striped table-bordered ">
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th><FontAwesomeIcon icon={faChurch} /> Eglise</th>
                                <th >Regle</th>
                                <th >Categorie</th>
                                <th >Pourcentage</th>
                                <th >Au Compte</th>
                                <th>Date Modification</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && listeRegles.map((reg, id) =>
                                <tr key={id} className='custom'>
                                    <td> {reg.church_name}</td>
                                    <td> {reg.rule_name}</td>
                                    <td>  {reg.category_name}</td>
                                    <td> {reg.percentage} % </td>
                                    <td> {reg.account_name}</td>
                                    <td>{dateFormat(reg.updated_at)}</td>
                                    <td >
                                        <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                            <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setRegle(reg); setModal('modifier') }}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setRegle(reg); setModal('supprimer') }}>
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

            <AjouterRegle
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
                eglises={!loading && eglises}
                categories={!loading && categories}
                comptes={!loading && comptes}
            />

            <ModifierRegle
                regle={regle}
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
            />

            <SupprimerRegle
                modal={modal}
                regle={regle}
                handleModal={handleModal}
                fetch={reload}
            />
        </div>
    )
}
export default Regles