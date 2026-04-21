import React, { useEffect, useState } from 'react'
import Pagination from '../../components/pagination/pagination'
import { LoadingData } from '../../components/Loading/loading'
import { formatDate, list_month } from '../../utils/datetime/month'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useFetch from '../../hooks/fetchHook'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'


const List = ({ filters }) => {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)

    const query = new URLSearchParams({
        page,
        limit: 15,
        ...filters,
    }).toString()
    const { loading, data, error, reload } = useFetch(`/evenement?${query}`, 'get')
    const { list: evenements, total_pages: totalPages, total_events: totalEvents } = data || {}

    const handlePageChange = (num) => setPage(num)

    const getRowVariant = (eventDate) => {
        if (!eventDate) return ''
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const d = new Date(eventDate)
        d.setHours(0, 0, 0, 0)
        if (d < today) return 'text-muted'
        if (d.getTime() === today.getTime()) return 'table-success fw-semibold'
        return 'table-primary'
    }

    useEffect(() => { setPage(1) }, [filters])

    if (error) {
        toast.error('Impossible de charger les donnees')
        return null
    }


    return (
        <div className="card mb-0" >
            <div className="card-header border-bottom py-3" style={{ backgroundColor: '#cbd5e1' }}>
                <h5><FontAwesomeIcon icon={faCalendar} className='mx-1' />
                    {filters.mois == 'tout' ? filters.annee : list_month[filters.mois] + " " + filters.annee}
                </h5>
            </div>
            <div className="card-body marketing-card" style={{ height: '57vh', overflowY: 'auto' }}>
                {loading && <LoadingData />}
                {!loading && evenements.length == 0 &&
                    <div className='position-absolute end-50 top-25 fw-semibold fs-6 mt-5 ms-5'>
                        Aucune Evenement
                    </div>
                }
                <div className="table-responsive mt-2">
                    <table className="table table-hover table-bordered">
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th>Evenement</th>
                                <th>Date</th>
                                <th>Eglise</th>
                                <th>Hommes</th>
                                <th>Femmes</th>
                                <th>Enfants</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && evenements?.length > 0 && evenements.map((evenement, index) => (
                                <tr
                                    key={index}
                                    className={getRowVariant(evenement.event_date)}
                                    onClick={() => navigate(`/evenements/${evenement.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>
                                        {evenement.event_type_name}
                                        {evenement.event_name && <><br /><span className="p-1 fw-normal small">{evenement.event_name}</span></>}
                                    </td>
                                    <td>{formatDate(evenement.event_date)}</td>
                                    <td>{evenement.church_name}</td>
                                    <td>{evenement.men}</td>
                                    <td>{evenement.women}</td>
                                    <td>{evenement.children}</td>
                                    <td>{evenement.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='card-footer'>
                <div className="d-flex justify-content-between align-items-center">
                    <div className='fs-6 fw-semibold '>
                        {totalEvents} Evenements
                    </div>
                    {totalEvents > 0 &&
                        <Pagination
                            handler={handlePageChange}
                            totalPages={totalPages}
                            currentPage={page}
                        />}
                </div>
            </div>
        </div>
    )
}

export default List