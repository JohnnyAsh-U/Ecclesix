import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AppGlobalContext } from '../../hooks/AppContext'
import { LoadingData } from '../../components/Loading/loading'
import { LoadingButton } from '../../components/buttons/loadingbuttons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import './attendance.css'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'


const AttendancePage = () => {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const { admin, permissions } = AppGlobalContext()

    const [event, setEvent] = useState(null)
    const [members, setMembers] = useState([])
    const [selectedMembers, setSelectedMembers] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch event details
                const { data: eventData } = await axios.get(`/evenement/${eventId}`)
                setEvent(eventData)

                // Fetch church members
                const { data: membersData } = await axios.get(`/attendance/members`)
                setMembers(membersData || [])

                // Fetch existing attendance for this event
                const { data: attendanceData } = await axios.get(
                    `/evenement/${eventId}/attendance?limit=1000`
                )
                const existingAttendance = new Set(
                    attendanceData.list?.map(a => a.member_id) || []
                )
                setSelectedMembers(existingAttendance)
            } catch (err) {
                toast.error('Erreur lors du chargement des donnees')
                navigate('/evenement')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [eventId, navigate])

    const handleSelectMember = (memberId) => {
        const newSelected = new Set(selectedMembers)
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId)
        } else {
            newSelected.add(memberId)
        }
        setSelectedMembers(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedMembers.size === filteredMembers.length) {
            setSelectedMembers(new Set())
        } else {
            setSelectedMembers(new Set(filteredMembers.map(m => m.id)))
        }
    }

    const handleSubmit = async () => {
        try {
            setSubmitting(true)

            // Get current attendance
            const { data: currentAttendance } = await axios.get(
                `/evenement/${eventId}/attendance?limit=1000`
            )
            const currentAttendanceIds = new Set(
                currentAttendance.list?.map(a => a.member_id) || []
            )

            // Find members to add
            const toAdd = Array.from(selectedMembers).filter(
                memberId => !currentAttendanceIds.has(memberId)
            )

            // Find members to remove
            const toRemove = currentAttendance.list?.filter(
                a => !selectedMembers.has(a.member_id)
            ) || []

            // Remove old attendance records
            for (const attendance of toRemove) {
                try {
                    await axios.delete(`/attendance/${attendance.id}`)
                } catch (err) {
                    console.error('Error deleting attendance:', err)
                }
            }

            // Add new attendance records
            for (const memberId of toAdd) {
                try {
                    await axios.post('/attendance', {
                        member: memberId,
                        event_type: event.event_type,
                        church: event.church,
                        date: event.event_date,
                    })
                } catch (err) {
                    console.error('Error creating attendance:', err)
                }
            }

            toast.success('Presences mises a jour avec succes')
            navigate('/evenement')
        } catch (err) {
            toast.error('Erreur lors de la mise a jour des presences')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredMembers = members.filter(member =>
        member.get_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.phone && member.phone.includes(searchTerm))
    )

    if (loading) {
        return (
            <div className="container">
                <LoadingData />
            </div>
        )
    }

    return (
        <div className="container-fluid">
            <BreadCrumb title={'Presence - ' + (event?.event_type_name || '')} icon={<FontAwesomeIcon icon={faCheck} />}>
            {new Date(event?.event_date).toLocaleDateString('fr-FR')}
            </BreadCrumb>

            <div className="row mt-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <button
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        onClick={() => navigate('/evenements')}
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} /> Retour
                                    </button>  
                                </div>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="mb-3">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Chercher par nom ou telephone"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mb-3 d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={handleSelectAll}
                                >
                                    {selectedMembers.size === filteredMembers.length
                                        ? 'Deselectionner tous'
                                        : 'Selectionner tous'}
                                </button>
                                <span className="badge bg-info align-self-center">
                                    {selectedMembers.size} / {filteredMembers.length} selected
                                </span>
                            </div>

                            <div className="attendance-list" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {filteredMembers.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        Aucun membre trouve
                                    </div>
                                ) : (
                                    <div className="list-group">
                                        {filteredMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className="list-group-item d-flex justify-content-between align-items-center cursor-pointer"
                                                onClick={() => handleSelectMember(member.id)}
                                            >
                                                <div>
                                                    <div className="fw-semibold">
                                                        {member.get_full_name}
                                                    </div>
                                                    {member.phone && (
                                                        <div className="text-muted small">
                                                            {member.phone}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`member-${member.id}`}
                                                        checked={selectedMembers.has(member.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation()
                                                            handleSelectMember(member.id)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-footer d-flex gap-2 justify-content-end">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/evenement')}
                            >
                                Annuler
                            </button>
                            <LoadingButton
                                loading={submitting}
                                color="primary"
                                name="Enregistrer Presences"
                                onClick={handleSubmit}
                                type="button"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AttendancePage
