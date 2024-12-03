import React, { useEffect, useState } from 'react'
import Pagination from '../../components/pagination/pagination'
import { LoadingData } from '../../components/Loading/loading'
import { formatDate } from '../../utils/datetime/month'
import { AgeCategory } from '../../utils/datetime/agecategory'
import { useNavigate } from 'react-router-dom'
import { ActifStatut, StatutBadge } from '../../utils/membre/statut'
import { toast } from 'react-toastify'
import useFetch from '../../hooks/fetchHook'

const List = ({ filters, search }) => {
    const [page, setPage] = useState(1)

    const query = new URLSearchParams({
        ...filters,
        search,
        page,
        limit: 200,
    }).toString()
    const { loading, data, error } = useFetch(`/membre/?${query}`, 'get')
    const { res: liste, totalPages, totalMembers: total } = data || {}
    const navigate = useNavigate()

    const handlePageChange = async (num) => {
        setPage(num)
    }

    let bg = { backgroundColor: '#cbd5e1' }

 
    
    useEffect(() => {
        setPage(1)
    }, [filters, search])


    if (error) {
        toast.error('Impossible de charger les donnees')
        return
    }


    return (
        <div className="card mb-0" >
            {loading && <LoadingData />}
            {!loading && liste.length == 0 &&
                <div className='position-absolute end-50 top-25 fw-bold fs-5 mt-5 ms-5'>
                    Aucun Membres
                </div>
            }
            <div className="card-body marketing-card p-t-0 px-0" style={{ height: '64vh', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th style={bg}>Nom Et Prenom</th>
                                <th style={bg}>Statut M.</th>
                                <th style={bg}>Ville</th>
                                <th style={bg}>Eglise</th>
                                <th style={bg}>Categorie</th>
                                <th style={bg}>Profession</th>
                                <th style={bg}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>

                            {liste && liste.map((membre, index) =>
                                <tr style={{ cursor: 'pointer' }} key={index} onClick={() => navigate(`/membres/profile/${membre.id}`)}>
                                    <td><i className={membre.sexe === 'H' ? "icofont icofont-business-man-alt-1 fs-4 ms-1" : "icofont icofont-girl-alt fs-4 ms-1"}></i>
                                        <div className="table-contain">
                                            <h6 className='fw-light'>{membre.prenom} {membre.nom}</h6>
                                            {StatutBadge(membre.statut)}
                                            {' '}
                                            <p className="text-muted"> | {formatDate(membre.date_arrive)}</p>
                                        </div>
                                    </td>
                                    <td>{membre.statut_matrimonial === 'V' && 'Veuf(ve)'}
                                        {membre.statut_matrimonial === 'M' && 'Marie'}
                                        {membre.statut_matrimonial === 'C' && 'Celibataire'}
                                    </td>
                                    <td>{membre.ville && membre.ville.lib_ville}</td>
                                    <td>{membre.eglise && membre.eglise.lib_eglise}</td>
                                    <td>{AgeCategory(membre.date_de_naissance)}</td>
                                    <td>{membre.type_metier}</td>
                                    <td>{ActifStatut(membre)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='card-footer'>
                <div className="d-flex justify-content-between align-items-center">
                    <div className='fs-6 fw-semibold '>
                        {total} Membres
                    </div>
                    <Pagination
                        handler={handlePageChange}
                        totalPages={totalPages}
                        currentPage={page}
                    />
                </div>

            </div>
        </div>
    )
}

export default List