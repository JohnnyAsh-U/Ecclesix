import React, { useEffect, useMemo, useState } from 'react'
import Pagination from '../../components/pagination/pagination'
import { LoadingData } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import axios from '../../utils/config/axiosConfig'
import useDebounce from '../membre/debounce'

const CommunicationMemberList = ({ filters, search, selectedMap, setSelectedMap }) => {
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [liste, setListe] = useState([])
    const [totalPages, setTotalPages] = useState(null)
    const [total, setTotal] = useState(null)
    const debouncedSearch = useDebounce(search, 1000)

    useEffect(() => {
        const query = new URLSearchParams({
            ...filters,
            search: debouncedSearch,
            page,
            limit: 200,
        }).toString()

        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const { data } = await axios.get(`/communication/members?${query}`)
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

    const visibleSelectedCount = useMemo(
        () => liste.filter((member) => selectedMap[member.id]).length,
        [liste, selectedMap]
    )

    const toggleMember = (member) => {
        setSelectedMap((prev) => {
            const next = { ...prev }
            if (next[member.id]) {
                delete next[member.id]
            } else {
                next[member.id] = {
                    id: member.id,
                    name: member.get_full_name,
                    email: member.email,
                    phone: member.phone,
                    church_name: member.church_name,
                }
            }
            return next
        })
    }

    const toggleAllVisible = () => {
        const allSelected = liste.length > 0 && liste.every((member) => !!selectedMap[member.id])
        setSelectedMap((prev) => {
            const next = { ...prev }
            if (allSelected) {
                liste.forEach((member) => {
                    delete next[member.id]
                })
            } else {
                liste.forEach((member) => {
                    next[member.id] = {
                        id: member.id,
                        name: member.get_full_name,
                        email: member.email,
                        phone: member.phone,
                        church_name: member.church_name,
                    }
                })
            }
            return next
        })
    }

    if (error) {
        toast.error('Impossible de charger les donnees')
        return null
    }

    return (
        <div className="card mb-0" >
            {loading && <LoadingData />}
            <div className="card-header py-2">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h6 className="mb-0">Liste des membres ({total || 0})</h6>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-outline-primary">Selectionnes: {Object.keys(selectedMap).length}</span>
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={toggleAllVisible}>
                            {visibleSelectedCount === liste.length && liste.length > 0
                                ? 'Deselectionner la page'
                                : 'Selectionner la page'}
                        </button>
                    </div>
                </div>
            </div>
            {!loading && liste.length === 0 && (
                <div className="card-body text-center fw-bold fs-6">Aucun membre</div>
            )}
            <div className="card-body contact-details mt-2" style={{ maxHeight: '58vh', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered nowrap mb-0">
                        <thead>
                            <tr role="row">
                                <th style={{ width: '72px' }} className="text-center">#</th>
                                <th>Nom Et Prenom</th>
                                <th>Email</th>
                                <th>Telephone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liste.map((membre, index) => (
                                <tr key={membre.id} style={{ cursor: 'pointer' }} className="custom" onClick={() => toggleMember(membre)}>
                                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <span className="me-2">{((page - 1) * 200) + index + 1}</span>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedMap[membre.id]}
                                            onChange={() => toggleMember(membre)}
                                        />
                                    </td>

                                    <td>
                                        <div className="table-contain">
                                            <h6 className='fw-light'>{membre.get_full_name}</h6>
                                        </div>
                                    </td>
                                    <td>{membre.email || '-'}</td>
                                    <td>{membre.phone || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card-footer">
                <Pagination handler={setPage} totalPages={totalPages} currentPage={page} />
            </div>
        </div>
    )
}

export default CommunicationMemberList
