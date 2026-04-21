import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { LoadingData } from '../../components/Loading/loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faCheck, faTrash, faUserCheck, faTimes,
    faUsers, faPencil, faCalendar, faCalendarPlus,
} from '@fortawesome/free-solid-svg-icons'
import Modal from 'react-bootstrap/Modal'
import './attendance.css'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { AppGlobalContext } from '../../hooks/AppContext'
import { ModifierModal, SupprimerModal } from './modals'


const getMode = (eventDate) => {
    if (!eventDate) return 'today'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(eventDate)
    d.setHours(0, 0, 0, 0)
    if (d < today) return 'past'
    if (d.getTime() === today.getTime()) return 'today'
    return 'future'
}

const AttendancePage = () => {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const { admin, permissions } = AppGlobalContext()

    const [event, setEvent] = useState(null)
    const [members, setMembers] = useState([])
    const [listetype, setListetype] = useState([])
    const [attendanceMap, setAttendanceMap] = useState({})
    const [loading, setLoading] = useState(true)
    const [processingIds, setProcessingIds] = useState(new Set())
    const [removingMember, setRemovingMember] = useState(null)
    const [removeLoading, setRemoveLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeModal, setActiveModal] = useState(null)

    const fetchAttendanceMap = useCallback(async () => {
        const { data } = await axios.get(`/evenement/${eventId}/attendance?limit=10000`)
        const map = {}
        for (const a of (data.list || [])) {
            map[a.member_id] = { id: a.id, time: a.time }
        }
        return map
    }, [eventId])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [{ data: eventData }, { data: membersData }, { data: typeData }, map] = await Promise.all([
                    axios.get(`/evenement/${eventId}`),
                    axios.get('/attendance/members'),
                    axios.get('/evenement/type'),
                    fetchAttendanceMap(),
                ])
                setEvent(eventData)
                setMembers(membersData || [])
                setListetype(typeData?.list || [])
                setAttendanceMap(map)
            } catch {
                toast.error('Erreur lors du chargement des donnees')
                navigate('/evenements')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [eventId, navigate, fetchAttendanceMap])

    const mode = event ? getMode(event.event_date) : 'today'
    const canMark = mode === 'today'
    const canEditDelete = mode === 'today' || mode === 'future'

    const handleToggle = async (memberId) => {
        if (!canMark || processingIds.has(memberId)) return
        setProcessingIds(prev => new Set([...prev, memberId]))
        try {
            if (attendanceMap[memberId]) {
                await axios.delete(`/attendance/${attendanceMap[memberId].id}`)
                setAttendanceMap(prev => { const n = { ...prev }; delete n[memberId]; return n })
            } else {
                await axios.post(`/attendance/mark-present/${eventId}`, { ids: [memberId] })
                setAttendanceMap(await fetchAttendanceMap())
            }
        } catch {
            toast.error('Erreur lors du marquage de presence')
        } finally {
            setProcessingIds(prev => { const n = new Set(prev); n.delete(memberId); return n })
        }
    }

    const handleRemoveConfirm = async () => {
        if (!removingMember) return
        setRemoveLoading(true)
        try {
            await axios.delete(`/attendance/${removingMember.attendanceId}`)
            setAttendanceMap(prev => { const n = { ...prev }; delete n[removingMember.memberId]; return n })
            toast.success(`${removingMember.name} retiré de la liste`)
            setRemovingMember(null)
        } catch {
            toast.error('Erreur lors de la suppression')
        } finally {
            setRemoveLoading(false)
        }
    }

    const reloadEvent = async () => {
        const { data } = await axios.get(`/evenement/${eventId}`)
        setEvent(data)
    }

    const filteredMembers = members.filter(m =>
        m.get_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm))
    )
    const presentMembers = members.filter(m => attendanceMap[m.id])
    const filteredPresentMembers = presentMembers.filter(m =>
        m.get_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm))
    )
    const totalMembers = members.length
    const presentCount = presentMembers.length
    const absentCount = totalMembers - presentCount

    if (loading) return <div className="container mt-5"><LoadingData /></div>

    const modeBadge = {
        past: <span className="badge bg-secondary ms-2">Passé</span>,
        today: <span className="badge bg-success ms-2">Aujourd'hui</span>,
        future: <span className="badge bg-primary ms-2">À venir</span>,
    }[mode]

    const isOwner = permissions.superAdmin || event?.church == admin.church_id

    return (
        <div className="container-fluid">
            <BreadCrumb title={event?.event_type_name || 'Presence'} icon={<FontAwesomeIcon icon={faCheck} />}>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                    {modeBadge}
                    {canEditDelete && isOwner && (
                        <>
                            <ContentPermsWrapper requiredPerms={['modifier_evenement']}>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => setActiveModal('modifier-evenement')}>
                                    <FontAwesomeIcon icon={faPencil} /> Modifier
                                </button>
                            </ContentPermsWrapper>
                            <ContentPermsWrapper requiredPerms={['supprimer_evenement']}>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => setActiveModal('supprimer-evenement')}>
                                    <FontAwesomeIcon icon={faTrash} /> Supprimer
                                </button>
                            </ContentPermsWrapper>
                        </>
                    )}
                </div>
            </BreadCrumb>

            {/* Event info bar */}
            <div className="card mb-3 border-0 shadow-sm">
                <div className="card-body py-2">
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/evenements')}>
                            <FontAwesomeIcon icon={faArrowLeft} /> Retour
                        </button>
                        <div>
                            <span className="fw-bold me-1">{event?.event_type_name}</span>
                            {event?.event_name && <span className="text-muted small">— {event.event_name}</span>}
                        </div>
                        <div className="text-muted small">
                            <FontAwesomeIcon icon={faCalendar} className="me-1" />
                            {new Date(event?.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="fw-semibold small text-primary">
                            {event?.church_name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="row g-2 gx-3 mb-3">
                {[
                    { icon: faUsers, color: 'secondary', value: totalMembers, label: 'Membres' },
                    { icon: faUserCheck, color: 'success', value: presentCount, label: 'Presents' },
                    { icon: faTimes, color: 'danger', value: absentCount, label: 'Absents' },
                ].map(s => (
                    <div key={s.label} className="col-6 col-md-2">
                        <div className="card text-center border-0 shadow-sm h-100">
                            <div className="card-body py-2">
                                <FontAwesomeIcon icon={s.icon} className={`text-${s.color}`} />
                                <div className={`fw-bold fs-5 text-${s.color}`}>{s.value}</div>
                                <div className="text-muted small">{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {[
                    { symbol: '♂', color: 'info', value: event?.men ?? 0, label: 'Hommes' },
                    { symbol: '♀', color: 'danger', value: event?.women ?? 0, label: 'Femmes' },
                    { symbol: '●', color: 'warning', value: event?.children ?? 0, label: 'Enfants' },
                ].map(s => (
                    <div key={s.label} className="col-6 col-md-2">
                        <div className="card text-center border-0 shadow-sm h-100">
                            <div className="card-body py-2">
                                <div className={`text-${s.color} fw-bold`}>{s.symbol}</div>
                                <div className="fw-bold fs-5">{s.value}</div>
                                <div className="text-muted small">{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Future: upcoming banner */}
            {mode === 'future' && (
                <div className="card border-primary shadow-sm">
                    <div className="card-body text-center py-5">
                        <FontAwesomeIcon icon={faCalendarPlus} size="3x" className="text-primary mb-3" />
                        <h5 className="text-primary">Evenement à venir</h5>
                        <p className="text-muted mb-0">
                            Cet événement est programmé pour le{' '}
                            <strong>{new Date(event?.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                            <br />Le marquage des présences sera disponible le jour de l'événement.
                        </p>
                    </div>
                </div>
            )}

            {/* Past: read-only present list */}
            {mode === 'past' && (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <FontAwesomeIcon icon={faUserCheck} className="text-success me-2" />
                            <span className="fw-semibold">Presents ({presentCount})</span>
                        </div>
                        <input
                            type="text"
                            className="form-control form-control-sm w-auto"
                            placeholder="Chercher..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="card-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        {filteredPresentMembers.length === 0 ? (
                            <div className="text-center py-4 text-muted">Aucun present enregistré</div>
                        ) : (
                            <div className="row g-2">
                                {filteredPresentMembers.map(member => (
                                    <div key={member.id} className="col-md-4 col-sm-6">
                                        <div className="present-card card border-success">
                                            <div className="card-body py-2 px-3">
                                                <div className="fw-semibold small">{member.get_full_name}</div>
                                                {attendanceMap[member.id]?.time && (
                                                    <div className="text-success" style={{ fontSize: '11px' }}>
                                                        ✓ Arrivée: {attendanceMap[member.id].time}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Today: two-panel layout */}
            {mode === 'today' && (
                <div className="row g-2 gx-3">
                    <div className="col-md-7">
                        <div className="card">
                            <div className="card-header fw-bold">Liste des Membres</div>
                            <div className="card-body">
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Chercher par nom ou telephone"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <div className="attendance-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                    {filteredMembers.length === 0 ? (
                                        <div className="text-center py-4 text-muted">Aucun membre trouvé</div>
                                    ) : (
                                        <div className="list-group">
                                            {filteredMembers.map(member => {
                                                const isPresent = !!attendanceMap[member.id]
                                                const isProcessing = processingIds.has(member.id)
                                                return (
                                                    <div
                                                        key={member.id}
                                                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center${isPresent ? ' list-group-item-success' : ''}`}
                                                        onClick={() => !isProcessing && handleToggle(member.id)}
                                                        style={{ cursor: isProcessing ? 'wait' : 'pointer' }}
                                                    >
                                                        <div>
                                                            <div className="fw-semibold">{member.get_full_name}</div>
                                                            {member.phone && <div className="text-muted small">{member.phone}</div>}
                                                            {isPresent && attendanceMap[member.id]?.time && (
                                                                <div className="text-success small">✓ {new Date(`1970-01-01T${attendanceMap[member.id].time}Z`).toLocaleTimeString()}</div>
                                                            )}
                                                        </div>
                                                        {isProcessing
                                                            ? <div className="spinner-border spinner-border-sm text-primary" />
                                                            : <input type="checkbox" className="form-check-input" checked={isPresent} onChange={() => {}} onClick={e => e.stopPropagation()} />
                                                        }
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-5">
                        <div className="card">
                            <div className="card-header">
                                <FontAwesomeIcon icon={faUserCheck} className="text-success me-2" />
                                <span className="fw-semibold">Presents ({presentCount})</span>
                            </div>
                            <div className="card-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                {presentMembers.length === 0 ? (
                                    <div className="text-center py-4 text-muted">Aucun present pour l'instant</div>
                                ) : (
                                    <div className="row g-2">
                                        {presentMembers.map(member => (
                                            <div key={member.id} className="col-12">
                                                <div
                                                    className="present-card card border-success"
                                                    onClick={() => setRemovingMember({
                                                        memberId: member.id,
                                                        attendanceId: attendanceMap[member.id].id,
                                                        name: member.get_full_name,
                                                    })}
                                                    title="Cliquer pour retirer"
                                                >
                                                    <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold small">{member.get_full_name}</div>
                                                            {attendanceMap[member.id]?.time && (
                                                                <div className="text-success" style={{ fontSize: '11px' }}>
                                                                    ✓ Arrivée: {new Date(`1970-01-01T${attendanceMap[member.id].time}Z`).toLocaleTimeString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <FontAwesomeIcon icon={faTrash} className="text-danger" size="sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove confirmation modal */}
            <Modal show={!!removingMember} onHide={() => !removeLoading && setRemovingMember(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Retirer de la liste</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Confirmer le retrait de <strong>{removingMember?.name}</strong> de la liste des présences ?
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-secondary" onClick={() => setRemovingMember(null)} disabled={removeLoading}>
                        Annuler
                    </button>
                    <button className="btn btn-danger" onClick={handleRemoveConfirm} disabled={removeLoading}>
                        {removeLoading && <span className="spinner-border spinner-border-sm me-1" />}
                        Retirer
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Edit / Delete modals */}
            {event && (
                <>
                    <ModifierModal
                        evenement={event}
                        modal={activeModal}
                        handleModal={() => setActiveModal(null)}
                        fetch={reloadEvent}
                        listetype={listetype}
                    />
                    <SupprimerModal
                        evenement={event}
                        modal={activeModal}
                        setModal={setActiveModal}
                        fetch={() => navigate('/evenements')}
                        listetype={listetype}
                    />
                </>
            )}
        </div>
    )
}

export default AttendancePage
