import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from '../../utils/config/axiosConfig'
import { LoadingData } from '../../components/Loading/loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt, faUserCheck, faVideo, faPencil, faTrash, faCalendar, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons'
import Modal from 'react-bootstrap/Modal'
import './attendance.css'
import PresenceTab from './PresenceTab'
import RapportsTab from './RapportsTab'
import MediathequeTab from './MediathequeTab'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { AppGlobalContext } from '../../hooks/AppContext'
import { ModifierModal, SupprimerModal } from './modals'

const QuickLinks = ({ activeTab = 'presence', onTabChange, permissions = {} }) => {
    // Build tabs and filter by the same requiredPerms used by ContentPermsWrapper
    const allTabs = [
        { id: 'presence', label: 'Présence', icon: faUserCheck, color: '#4680ff', requiredPerms: ['voir_evenement','voir_touts_evenements'] },
        { id: 'rapports', label: 'Rapports', icon: faFileAlt, color: '#4680ff', requiredPerms: ['voir_evenement','voir_touts_evenements'] },
        { id: 'mediatheque', label: 'Médias', icon: faVideo, color: '#4680ff', requiredPerms: ['voir_mediafile','voirs_touts_mediafiles'] },
    ]

    const hasAnyPerm = (requiredPerms) => {
        if (!requiredPerms || requiredPerms.length === 0) return true
        if (!permissions) return false
        if (permissions.superAdmin) return true
        if (Array.isArray(permissions)) return requiredPerms.some(p => permissions.includes(p))
        return requiredPerms.some(p => !!permissions[p])
    }

    const tabs = allTabs.filter(t => hasAnyPerm(t.requiredPerms))

    return (
        <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body p-0">
                <div style={{ display: 'flex', borderBottom: '2px solid #e9ecef', gap: 0 }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            style={{
                                flex: 1,
                                padding: '16px 20px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: activeTab === tab.id ? tab.color : '#6c757d',
                                borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : 'none',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                marginBottom: '-2px',
                            }}
                        >
                            <FontAwesomeIcon icon={tab.icon} size="sm" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

const AttendancePage = () => {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const { admin, permissions } = AppGlobalContext()

    const [activeTab, setActiveTab] = useState('presence')
    const [event, setEvent] = useState(null)
    const [listetype, setListetype] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeModal, setActiveModal] = useState(null)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true)
                const [{ data: eventData }, { data: typeData }] = await Promise.all([
                    axios.get(`/evenement/${eventId}`),
                    axios.get('/evenement/type'),
                ])
                setEvent(eventData)
                setListetype(typeData?.list || [])
            } catch (e) {
                toast.error('Erreur lors du chargement de l\'événement')
                navigate('/evenements')
            } finally {
                setLoading(false)
            }
        }
        fetchEvent()
    }, [eventId, navigate])

    // Ensure the currently active tab is allowed by permissions; if not, pick the first allowed tab
    useEffect(() => {
        const allTabs = [
            { id: 'presence', requiredPerms: ['voir_evenement','voir_touts_evenements'] },
            { id: 'rapports', requiredPerms: ['voir_evenement','voir_touts_evenements'] },
            { id: 'mediatheque', requiredPerms: ['voir_mediafile','voirs_touts_mediafiles'] },
        ]

        const hasAnyPerm = (requiredPerms) => {
            if (!requiredPerms || requiredPerms.length === 0) return true
            if (!permissions) return false
            if (permissions.superAdmin) return true
            if (Array.isArray(permissions)) return requiredPerms.some(p => permissions.includes(p))
            return requiredPerms.some(p => !!permissions[p])
        }

        const allowed = allTabs.filter(t => hasAnyPerm(t.requiredPerms)).map(t => t.id)
        if (allowed.length > 0 && !allowed.includes(activeTab)) setActiveTab(allowed[0])
    }, [permissions])

    if (loading) return (
        <div className="container mt-5 text-center">
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}>
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <div className="mt-3">Chargement de l'événement…</div>
            </div>
        </div>
    )

    const mode = event ? (() => {
        const today = new Date(); today.setHours(0,0,0,0); const d = new Date(event.event_date); d.setHours(0,0,0,0);
        if (d < today) return 'past'; if (d.getTime() === today.getTime()) return 'today'; return 'future'
    })() : 'today'

    const canEditDelete = mode === 'future'
    const canMark = mode === 'today'
    const modeBadge = {
        past: <span className="badge bg-secondary ms-2">Passé</span>,
        today: <span className="badge bg-success ms-2">Aujourd'hui</span>,
        future: <span className="badge bg-primary ms-2">À venir</span>,
    }[mode]

    const isOwner = permissions && (permissions.superAdmin || event?.church == admin.church_id)

    return (
        <div className="">
            <BreadCrumb title={event?.event_type_name || 'Presence'} icon={<FontAwesomeIcon icon={faCheck} />}>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                    {modeBadge}
                    {canEditDelete && isOwner && activeTab === 'presence' && (
                        <>
                            <ContentPermsWrapper requiredPerms={["modifier_evenement"]}>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => setActiveModal('modifier-evenement')}>
                                    <FontAwesomeIcon icon={faPencil} /> Modifier
                                </button>
                            </ContentPermsWrapper>
                            <ContentPermsWrapper requiredPerms={["supprimer_evenement"]}>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => setActiveModal('supprimer-evenement')}>
                                    <FontAwesomeIcon icon={faTrash} /> Supprimer
                                </button>
                            </ContentPermsWrapper>
                        </>
                    )}
                </div>
            </BreadCrumb>

            <div className="card mb-3 border-0 shadow-sm">
                <div className="card-body py-2">
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                        <div className="text-muted small">
                            <FontAwesomeIcon icon={faCalendar} className="me-1" />
                            {new Date(event?.event_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="fw-semibold small text-primary">
                            {event?.church_name}
                        </div>

                        <div className="ms-auto">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/evenements')}>
                                <FontAwesomeIcon icon={faArrowLeft} /> Retour
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <QuickLinks activeTab={activeTab} onTabChange={setActiveTab} permissions={permissions} />
            </div>

            {activeTab === 'presence' && <ContentPermsWrapper requiredPerms={['voir_evenement','voir_touts_evenements']}><PresenceTab eventId={eventId} event={event} canMark={canMark} /></ContentPermsWrapper>}
            {activeTab === 'rapports' && <ContentPermsWrapper requiredPerms={['voir_evenement','voir_touts_evenements']}><RapportsTab eventId={eventId} event={event} /></ContentPermsWrapper>}
            {activeTab === 'mediatheque' && <ContentPermsWrapper requiredPerms={['voir_mediafile','voirs_touts_mediafiles']}><MediathequeTab eventId={eventId} event={event} /></ContentPermsWrapper>}

            {/* Edit / Delete modals */}
            {event && (
                <>
                    <ModifierModal
                        evenement={event}
                        modal={activeModal}
                        handleModal={() => setActiveModal(null)}
                        fetch={async () => {
                            const { data } = await axios.get(`/evenement/${eventId}`)
                            setEvent(data)
                        }}
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
