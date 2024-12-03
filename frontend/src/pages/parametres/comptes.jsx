import React from 'react'
import './style.css'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faChurch, faEdit, faMoneyBill, faTrash } from '@fortawesome/free-solid-svg-icons'
import useFetch from '../../hooks/fetchHook'
import { LoadingData } from '../../components/Loading/loading'

import {
  AjouterCompte,
  ModifierCompte,
  SupprimerCompte,
} from './comptes_modal'
import { toast } from 'react-toastify'
import { list_month } from '../../utils/datetime/month'
import { formatAmount } from '../../utils/datetime/amount'



const Comptes = () => {
  const [modal, setModal] = useState(null)
  const [compte, setCompte] = useState({})
  const { loading, data, error, reload } = useFetch(`/finance/comptes`, 'get')
  const { res: listeComptes, eglises: eglises } = data || {}


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
          <FontAwesomeIcon icon={faMoneyBill} className='me-1' />
          Les Comptes
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
          <table className="table table-hover table-striped table-bordered nowrap">
            <thead className='bg-inverse'>
              <tr className='bg-inverse'>
                <th><FontAwesomeIcon icon={faChurch} /> Eglise</th>
                <th >Nom</th>
                <th >Type</th>
                <th >Montant</th>
                <th >Cree le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!loading && listeComptes.map((com, id) =>
                <tr key={id} className='custom'>
                  <td> {com.eglise.lib_eglise}</td>
                  <td> {com.lib_compte}</td>
                  <td>  {com.compte_principal == true ? <strong>{com.type}</strong> : <>{com.type}</>}</td>
                  <td>{formatAmount(com.montant)}</td>
                  <td>{dateFormat(com.createdAt)}</td>
                  <td >
                    <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                      <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setCompte(com); setModal('modifier') }}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setCompte(com); setModal('supprimer') }}>
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

      <AjouterCompte
        modal={modal}
        handleModal={handleModal}
        fetch={reload}
        eglises={!loading && eglises}
      />

      <ModifierCompte
        compte={compte}
        modal={modal}
        handleModal={handleModal}
        fetch={reload}
      />

      <SupprimerCompte
        modal={modal}
        compte={compte}
        handleModal={handleModal}
        fetch={reload}
      />
    </div>
  )
}
export default Comptes