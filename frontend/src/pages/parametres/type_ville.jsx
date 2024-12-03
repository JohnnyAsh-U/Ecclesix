import React from 'react'
import './style.css'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faChurch, faCity, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import Dropdown from 'react-bootstrap/Dropdown'
import useFetch from '../../hooks/fetchHook'
import { LoadingData } from '../../components/Loading/loading'

import {
  AjouterVille,
  AjouterType,
  ModifierType,
  ModifierVille,
  SupprimerType,
  SupprimerVille
} from './type_eglise_ville_modal'
import { toast } from 'react-toastify'



const TypeVille = () => {
  const [modal, setModal] = useState(null)
  const [ville, setVille] = useState({})
  const [type, setType] = useState({})
  const { loading, data, error, reload } = useFetch(`/eglise/ville`, 'get')
  const { loading: loading1, data: data1, reload: reload1, error: error1 } = useFetch(`/eglise/type`, 'get')
  const listeville = data || []
  const listetype = data1 || []

  const handleModal = () => {
    setModal(null)
    setVille({})
    setType({})
  }

  if (error || error1) {
    toast.error('Impossible de charger les donnees')
    return
  }


  return (
    <div className="card mb-0" style={{ minHeight: '73vh' }}>
      <div className="card-header">
        <h5 className='card-header-left'>
          <FontAwesomeIcon icon={faCity} className='me-1' />
          Les Villes Et Types Eglise
        </h5>
        <div className='card-header-right'>
          <Dropdown direction="dropend" >
            <Dropdown.Toggle variant='link' className='btn  btn-outline-default py-0 rounded'>
              <div className='btn btn-round btn-primary btn-sm hor-grd btn-grd-primary'>
                <FontAwesomeIcon icon={faAdd} />
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setModal('ajouter-ville')} >
                <FontAwesomeIcon icon={faCity} className='me-1'/> Ajouter Ville
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setModal('ajouter-type')}>
                <FontAwesomeIcon icon={faChurch} className='me-1'/> Ajouter Type
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className=" card-body position-relative">
        {(loading || loading1) && <LoadingData />}

        <div className="table-responsive mb-3">
          <table className="table table-hover table-striped table-bordered nowrap caption-top">
            <caption>Villes</caption>
            <thead className='bg-inverse'>
              <tr className='bg-inverse'>
                <th >ID</th>
                <th >Ville</th>
                <th ><FontAwesomeIcon icon={faChurch} /> Eglises</th>
                <th ></th>
              </tr>
            </thead>
            <tbody>
              {!loading && listeville.map((ville, id) =>
                <tr key={id} className='custom'>
                  <td> {ville.id}</td>
                  <td> {ville.city_name}</td>
                  <td> {ville.city_church.length && ville.city_church.length}</td>
                  <td >
                    <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                      <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setVille(ville); setModal('modifier-ville') }}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setVille(ville); setModal('supprimer-ville') }}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered nowrap caption-top">
          <caption>Types Eglise</caption>
            <thead className='bg-inverse'>
              <tr className='bg-inverse'>
                <th >ID</th>
                <th >Type</th>
                <th >Description</th>
                <th ><FontAwesomeIcon icon={faChurch} /> Eglises</th>
                <th ></th>
              </tr>
            </thead>
            <tbody>
              {!loading1 && listetype.map((type, id) =>
                <tr key={id} className='custom'>
                  <td> {type.id}</td>
                  <td> {type.church_type_name}</td>
                  <td> {type.description}</td>
                  <td> {type.type_church.length && type.type_church.length}</td>
                  <td >
                    <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                      <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setType(type); setModal('modifier-type') }}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setType(type); setModal('supprimer-type') }}>
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

      <AjouterVille
        modal={modal}
        handleModal={handleModal}
        fetch={reload}
      />

      <ModifierVille
        ville_m={ville}
        modal={modal}
        handleModal={handleModal}
        fetch={reload}
      />

      <SupprimerVille
        modal={modal}
        ville_s={ville}
        handleModal={handleModal}
        fetch={reload}
      />

      <AjouterType
        modal={modal}
        handleModal={handleModal}
        fetch={reload1}
      />


      <ModifierType
        type={type}
        modal={modal}
        handleModal={handleModal}
        fetch={reload1}
      />

      <SupprimerType
        modal={modal}
        type={type}
        handleModal={handleModal}
        fetch={reload1}
      />
    </div>
  )
}
export default TypeVille