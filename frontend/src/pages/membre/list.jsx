import React, { useEffect, useState } from 'react'
import Pagination from '../../components/pagination/pagination'
import { LoadingData } from '../../components/Loading/loading'
import { formatDate } from '../../utils/datetime/month'
import { AgeCategory } from '../../utils/datetime/agecategory'
import { useNavigate } from 'react-router-dom'
import { ActifStatut, StatutBadge } from '../../utils/membre/statut'
import { toast } from 'react-toastify'
import axios from '../../utils/config/axiosConfig'
import useDebounce from './debounce'

const List = ({ filters, search }) => {
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [liste, setListe] = useState([])
    const [totalPages, setTotalPages] = useState(null)
    const [total, setTotal] = useState(null)
    const navigate = useNavigate()
    const debouncedSearch = useDebounce(search, 1000)

    const handlePageChange = async (num) => {
        setPage(num)
    }

    let bg = { backgroundColor: '#cbd5e1' }

    const formatDate = (date) => {
        if (!date) return '';
        let formatedDate = new Date(date)
        let month = formatedDate.getMonth()
        let year = formatedDate.getFullYear()
        let day = formatedDate.getDate()
        const mois = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
        return day + ' ' + mois[month] + ' ' + year
    }


    useEffect(() => {
        const query = new URLSearchParams({
            ...filters,
            search: debouncedSearch,
            page,
            limit: 200,
        }).toString()
        const fetchData = async () => {
            setLoading(true)
            try {
                const { data } = await axios.get(`/membre?${query}`)
                // setData(data)
                setListe(data.list)
                setTotalPages(data.total_pages)
                setTotal(data.total_members)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [filters, page, debouncedSearch])



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
                                    <td><i className={membre.gender === 'H' ? "icofont icofont-business-man-alt-1 fs-4 ms-1" : "icofont icofont-girl-alt fs-4 ms-1"}></i>
                                        <div className="table-contain">
                                            <h6 className='fw-light'>{membre.get_full_name}</h6>
                                            {StatutBadge(membre.status)}
                                            {' '}
                                            <p className="text-muted"> | {formatDate(membre.date_joined)}</p>
                                        </div>
                                    </td>
                                    <td>{membre.marital_status === 'V' && 'Veuf(ve)'}
                                        {membre.marital_status === 'M' && 'Marie'}
                                        {membre.marital_status === 'C' && 'Celibataire'}
                                    </td>
                                    <td>{membre.city_name}</td>
                                    <td>{membre.church_name}</td>
                                    <td>{AgeCategory(membre.birthdate)}</td>
                                    <td>{membre.profession_type}</td>
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