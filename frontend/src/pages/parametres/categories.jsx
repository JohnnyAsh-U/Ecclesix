import React from 'react'
import './style.css'
import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faChurch, faCity, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import useFetch from '../../hooks/fetchHook'
import { LoadingData } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import { AjouterCategorie, ModifierCategorie, SupprimerCategorie } from './categories_modal'



const Categories = () => {
    const [modal, setModal] = useState(null)
    const [categorie, setCategorie] = useState({})

    const { loading, data, error, reload } = useFetch(`/finance/categories`, 'get')
    const listeCategories = data || []

    const handleModal = () => {
        setModal(null)
    }

    if (error) {
        toast.error('Impossible de charger les donnees')
        return
    }

    const collectes = !loading && listeCategories.filter(c => c.category_type === "Credit")
    const depenses = !loading && listeCategories.filter(c => c.category_type === "Debit")
    const budgets = !loading && listeCategories.filter(c => c.category_type === "Budget")


    return (
        <div className="card mb-0" style={{ minHeight: '73vh' }}>
            <div className="card-header">
                <h5 className='card-header-left'>
                    <FontAwesomeIcon icon={faCity} className='me-1' />
                    Les Categories
                </h5>
                <div className='card-header-right'>
                    <div className='btn btn-round btn-primary btn-sm hor-grd btn-grd-primary' onClick={() => setModal('ajouter')}>
                        <FontAwesomeIcon icon={faAdd} />
                    </div>
                </div>
            </div>

            <div className=" card-body position-relative">
                {loading && <LoadingData />}
                <div className="table-responsive mb-3">
                    {/* Table des Collectes */}
                    <table className="table table-hover table-striped table-bordered nowrap caption-top">
                        <caption>Collectes</caption>
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th >ID</th>
                                <th >Collectes</th>
                                <th >Description</th>
                                <th ></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && collectes.map((categorie, id) =>
                                <tr key={id} className='custom'>
                                    <td> {categorie.id}</td>
                                    <td> {categorie.category_name}</td>
                                    <td> {categorie.description}</td>
                                    <td >
                                        <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                            <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setCategorie(categorie); setModal('modifier') }}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setCategorie(categorie); setModal('supprimer') }}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table des Depenses */}
                <div className="table-responsive">
                    <table className="table table-hover table-striped table-bordered nowrap caption-top">
                        <caption>Depenses</caption>
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th >ID</th>
                                <th >Depenses</th>
                                <th >Description</th>
                                <th ></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && depenses.map((categorie, id) =>
                                <tr key={id} className='custom'>
                                    <td> {categorie.id}</td>
                                    <td> {categorie.category_name}</td>
                                    <td> {categorie.description}</td>
                                    <td >
                                        <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                            <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setCategorie(categorie); setModal('modifier') }}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setCategorie(categorie); setModal('supprimer') }}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table des Budgets */}

                <div className="table-responsive">
                    <table className="table table-hover table-striped table-bordered nowrap caption-top">
                        <caption>Budgets</caption>
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th >ID</th>
                                <th >Budget</th>
                                <th >Description</th>
                                <th ></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && budgets.map((categorie, id) =>
                                <tr key={id} className='custom'>
                                    <td> {categorie.id}</td>
                                    <td> {categorie.category_name}</td>
                                    <td> {categorie.description}</td>
                                    <td >
                                        <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                            <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setCategorie(categorie); setModal('modifier') }}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={() => { setCategorie(categorie); setModal('supprimer') }}>
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

            <AjouterCategorie
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
            />


            <ModifierCategorie
                categorie={categorie}
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
            />

            <SupprimerCategorie
                modal={modal}
                categorie={categorie}
                handleModal={handleModal}
                fetch={reload}
            />
        </div>
    )
}
export default Categories