import React, { useState, useEffect } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullhorn, faPlus, faEdit, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import axios from '../../utils/config/axiosConfig'
import { LoadingPage } from '../../components/Loading/loading'
import Modal from 'react-bootstrap/Modal'
import useFetch from '../../hooks/fetchHook'
import { AppGlobalContext } from '../../hooks/AppContext'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'

const CommunicationAnnouncements = () => {
    const { data: announcements = [], loading, error, reload } = useFetch('/communication/announcements', 'get')
    const { permissions, admin, eglises: churches } = AppGlobalContext()

    const canSendAll = permissions?.superAdmin || permissions?.perms?.includes('envoyer_toutes_communications')

    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [toDeleteId, setToDeleteId] = useState(null)
    const [detailAnnouncement, setDetailAnnouncement] = useState(null)
    const [publishing, setPublishing] = useState(false)
    const [selectedChurchFilter, setSelectedChurchFilter] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft',
        visibility: 'all',
        target_churches: [],
        expiry_date: '',
    })

    useEffect(() => {
        // If user cannot send to all, force visibility to specific and default to user's church
        if (!canSendAll) {
            setFormData(prev => ({
                ...prev,
                visibility: 'specific',
                target_churches: admin?.church_id ? [admin.church_id] : []
            }))
        }
    }, [permissions, admin])

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            status: 'draft',
            visibility: 'all',
            target_churches: [],
            expiry_date: '',
        })
        setIsCreating(false)
        setEditingId(null)
        setShowFormModal(false)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleChurchToggle = (churchId) => {
        setFormData(prev => ({
            ...prev,
            target_churches: prev.target_churches.includes(churchId)
                ? prev.target_churches.filter(id => id !== churchId)
                : [...prev.target_churches, churchId]
        }))
    }

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('Veuillez entrer un titre')
            return
        }
        if (!formData.content.trim()) {
            toast.error('Veuillez entrer un contenu')
            return
        }
        if (formData.visibility === 'specific' && formData.target_churches.length === 0) {
            toast.error('Veuillez sélectionner au moins une église')
            return
        }

        try {
            setSaving(true)
            const payload = {
                ...formData,
            }

            // If user cannot send to all, enforce specific visibility and send their church id
            if (!canSendAll) {
                payload.visibility = 'specific'
                payload.target_churches = admin?.church_id ? [admin.church_id] : []
            } else {
                payload.target_churches = formData.visibility === 'all' ? [] : formData.target_churches
            }

            if (editingId) {
                await axios.patch(`/communication/announcements/${editingId}/`, payload)
                toast.success('Annonce mise à jour avec succès')
            } else {
                await axios.post('/communication/announcements', payload)
                toast.success('Annonce créée avec succès')
            }
            resetForm()
            reload()
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Une erreur est survenue')
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (announcement) => {
        setFormData({
            title: announcement.title,
            content: announcement.content,
            status: announcement.status,
            visibility: canSendAll ? announcement.visibility : 'specific',
            target_churches: canSendAll ? (announcement.target_churches || []) : (admin?.church_id ? [admin.church_id] : []),
            expiry_date: announcement.expiry_date ? announcement.expiry_date.split('T')[0] : '',
        })
        setEditingId(announcement.id)
        setIsCreating(true)
        setShowFormModal(true)
    }

    const confirmDelete = (id) => {
        setToDeleteId(id)
        setShowDeleteModal(true)
    }

    const handleDelete = async () => {
        if (!toDeleteId) return
        try {
            setShowDeleteModal(false)
            await axios.delete(`/communication/announcements/${toDeleteId}/`)
            toast.success('Annonce supprimée avec succès')
            setToDeleteId(null)
            reload()
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Une erreur est survenue')
        }
    }

    const getStatusBadge = (status) => {
        return status === 'published' ?
            <span className="badge bg-success">Publié</span> :
            <span className="badge bg-secondary">Brouillon</span>
    }

    const getVisibilityBadge = (visibility) => {
        return visibility === 'all' ?
            <span className="badge bg-info">Tous les églises</span> :
            <span className="badge bg-warning">Églises spécifiques</span>
    }

    const isExpired = (announcement) => {
        if (!announcement) return false
        if (!announcement.expiry_date) return false
        try {
            const exp = new Date(announcement.expiry_date)
            return exp < new Date()
        } catch (e) {
            return false
        }
    }

    const handlePublish = async (announcement) => {
        if (!announcement) return
        try {
            setPublishing(true)
            await axios.patch(`/communication/announcements/${announcement.id}/`, { status: 'published' })
            toast.success('Annonce publiée avec succès')
            setShowDetailModal(false)
            reload()
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Une erreur est survenue')
        } finally {
            setPublishing(false)
        }
    }

    const filteredAnnouncements = announcements?.filter(announcement => {
        if (!selectedChurchFilter) return true
        if (announcement.visibility === 'all') return true
        return announcement.target_churches && announcement.target_churches.includes(parseInt(selectedChurchFilter))
    })

    if (loading) {
        return <LoadingPage />
    }

    return (
        <>
            {/* <div className="d-flex justify-content-between align-items-center mb-3"> */}
                <BreadCrumb title={'Annonces'} icon={<FontAwesomeIcon icon={faBullhorn} />} >
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                        resetForm()
                        setIsCreating(true)
                        setShowFormModal(true)
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Nouvelle Annonce
                </button>
                </BreadCrumb>
            {/* </div> */}

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center gap-3">
                                <h5 className="mb-0">Gestion des Annonces</h5>
                                <select 
                                    className="form-select" 
                                    style={{ maxWidth: '250px' }}
                                    value={selectedChurchFilter} 
                                    onChange={(e) => setSelectedChurchFilter(e.target.value)}
                                >
                                    <option value="">Toutes les églises</option>
                                    {churches.map(church => (
                                        <option key={church.id} value={church.id}>
                                            {church.church_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* form is shown in modal (see modal JSX at bottom) */}

                        {/* Announcements List */}
                        <div className="card-body" style={{ minHeight: '70vh' }}>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    Erreur lors du chargement des annonces
                                </div>
                            )}

                            {filteredAnnouncements.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Titre</th>
                                                <th>Contenu</th>
                                                <th>Statut</th>
                                                <th>Visibilité</th>
                                                <th>Expiration</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAnnouncements.map(announcement => (
                                                <tr key={announcement.id} onClick={() => { setDetailAnnouncement(announcement); setShowDetailModal(true) }} style={{ cursor: 'pointer' }}>
                                                    <td className="fw-bold">{announcement.title}</td>
                                                    <td>
                                                        <p className="text-truncate" style={{ maxWidth: '200px' }}>
                                                            {announcement.content}
                                                        </p>
                                                    </td>
                                                    <td>{getStatusBadge(announcement.status)}</td>
                                                    <td>{getVisibilityBadge(announcement.visibility)}</td>
                                                    <td>
                                                        {announcement.expiry_date
                                                            ? new Date(announcement.expiry_date).toLocaleString('fr-FR')
                                                            : <span className="text-muted">-</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-warning"
                                                                onClick={(e) => { e.stopPropagation(); handleEdit(announcement) }}
                                                                disabled={editingId === announcement.id}
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={(e) => { e.stopPropagation(); confirmDelete(announcement.id) }}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="alert alert-info" role="alert">
                                    Aucune annonce pour le moment. {!isCreating && <button className="btn btn-link" onClick={() => { resetForm(); setIsCreating(true); setShowFormModal(true); }}>Créer une nouvelle annonce</button>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Modal (react-bootstrap) */}
            <Modal show={showFormModal} onHide={resetForm} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Modifier' : 'Créer'} une Annonce</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <label className="form-label">Titre *</label>
                            <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} placeholder="Titre de l'annonce" />
                        </div>
                        <div className="col-md-12 mb-3">
                            <label className="form-label">Contenu *</label>
                            <textarea className="form-control" name="content" value={formData.content} onChange={handleInputChange} placeholder="Contenu de l'annonce" rows="6"></textarea>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Statut</label>
                            <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                <option value="draft">Brouillon</option>
                                <option value="published">Publié</option>
                            </select>
                        </div>
                        <ContentPermsWrapper requiredPerms={['envoyer_toutes_communications']}>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Visibilité</label>
                                <select className="form-select" name="visibility" value={formData.visibility} onChange={handleInputChange}>
                                    <option value="all">Tous les églises</option>
                                    <option value="specific">Églises spécifiques</option>
                                </select>
                            </div>
                            {formData.visibility === 'specific' && (
                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Sélectionner les Églises</label>
                                    <div className="border p-3 rounded">
                                        {churches.length > 0 ? churches.map(church => (
                                            <div key={church.id} className="form-check">
                                                <input type="checkbox" className="form-check-input" id={`church-modal-${church.id}`} checked={formData.target_churches.includes(church.id)} onChange={() => handleChurchToggle(church.id)} />
                                                <label className="form-check-label" htmlFor={`church-modal-${church.id}`}>{church.church_name}</label>
                                            </div>
                                        )) : (
                                            <p className="text-muted mb-0">Aucune église disponible</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </ContentPermsWrapper>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Date d'expiration</label>
                            <input type="datetime-local" className="form-control" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={resetForm} disabled={saving}><FontAwesomeIcon icon={faTimes} className="me-2" />Annuler</button>
                    <button className="btn btn-success" onClick={handleSave} disabled={saving}><FontAwesomeIcon icon={faCheck} className="me-2" />{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */}
            {showDeleteModal && (
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmer la suppression</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                        <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Detail Modal */}
            {showDetailModal && detailAnnouncement && (
                <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{detailAnnouncement.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{detailAnnouncement.content}</p>
                        <hr />
                        <p><strong>Publié par:</strong> {detailAnnouncement.created_by_name || '-'}</p>
                        <p><strong>Publié le:</strong> {detailAnnouncement.published_at ? new Date(detailAnnouncement.published_at).toLocaleString('fr-FR') : '-'}</p>
                        <p><strong>Expiration:</strong> {detailAnnouncement.expiry_date ? new Date(detailAnnouncement.expiry_date).toLocaleString('fr-FR') : '-'}</p>
                        <hr />
                        <h6>Églises concernées</h6>
                        {detailAnnouncement.target_churches_detail && detailAnnouncement.target_churches_detail.length > 0 ? (
                            <ul>
                                {detailAnnouncement.target_churches_detail.map(c => (
                                    <li key={c.id}>{c.church_name || c.name || c}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted">Visible pour toutes les églises</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        {detailAnnouncement.status === 'draft' && !isExpired(detailAnnouncement) && (
                            <button className="btn btn-primary" onClick={() => handlePublish(detailAnnouncement)} disabled={publishing}>
                                {publishing ? 'Publication...' : 'Publier'}
                            </button>
                        )}
                        <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Fermer</button>
                    </Modal.Footer>
                </Modal>
            )}

        </>
    )
}

export default CommunicationAnnouncements
