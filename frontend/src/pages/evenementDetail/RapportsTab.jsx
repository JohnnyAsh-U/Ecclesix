import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons'
import Modal from 'react-bootstrap/Modal'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppGlobalContext } from '../../hooks/AppContext'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'

const SERVICE_TYPES = [
  'Culte dominical',
  'Culte de semaine',
  'Veillée de prière',
  'Culte spécial',
]

const withinThreeDays = (eventDate) => {
  if (!eventDate) return false
  const ev = new Date(eventDate)
  ev.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.abs(ev.getTime() - today.getTime())
  return diff <= 3 * 24 * 60 * 60 * 1000
}


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

const RapportsTab = ({ event = {}, eventId, onTabChange = () => { } }) => {
  const { permissions } = AppGlobalContext()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const current = report || null
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(() => ({
    predicateur: '',
    theme: '',
    reference: '',
    type: SERVICE_TYPES[0],
    resume: '',
    activites: '',
  }))

  const canAdd = withinThreeDays(event.event_date) && (getMode(event.event_date) === 'past' || getMode(event.event_date) === 'today')

  useEffect(() => {
    let mounted = true
    const fetchReport = async () => {
      if (!eventId) return setLoading(false)
      try {
        setLoading(true)
        const { data } = await axios.get(`/evenement/${eventId}/report`)
        if (!mounted) return
        setReport(data)
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setReport(null)
        } else if (err.response && err.response.status === 403) {
          toast.error('Accès refusé au rapport')
        } else {
          console.error(err)
          toast.error('Erreur lors du chargement du rapport')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchReport()
    return () => { mounted = false }
  }, [eventId])

  const openAddModal = () => {
    setModalMode('add')
    setForm({ predicateur: '', theme: '', reference: '', type: SERVICE_TYPES[0], resume: '', activites: '' })
    setModalOpen(true)
  }

  const openEditModal = () => {
    if (!report) return
    setModalMode('edit')
    setForm({
      predicateur: report.preacher || '',
      theme: report.sermon_theme || '',
      reference: report.bible_reference || '',
      type: SERVICE_TYPES[0],
      resume: report.sermon_summary || '',
      activites: report.after_service_activities || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.predicateur || !form.theme) return toast.error('Prédicateur et Thème sont requis')
    if (!canAdd) return toast.error('Ajout / édition non autorisé : hors fenêtre de 3 jours')
    const payload = {
      preacher: form.predicateur,
      sermon_theme: form.theme,
      bible_reference: form.reference,
      sermon_summary: form.resume,
      after_service_activities: form.activites,
    }

    try {
      if (modalMode === 'edit' && report) {
        const { data } = await axios.patch(`/evenement/${eventId}/report`, payload)
        setReport(data)
        toast.success('Rapport mis à jour')
      } else {
        const { data } = await axios.post(`/evenement/${eventId}/report`, payload)
        setReport(data)
        toast.success('Rapport créé')
      }
      setModalOpen(false)
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.detail || 'Erreur lors de l\'enregistrement'
      toast.error(msg)
    }
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h5 className="mb-">
          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
          Rapports de l'Événement
        </h5>
        <div>
         {canAdd && <ContentPermsWrapper requiredPerms={["modifier_evenement"]}>
            {report ? (
              <button className="btn btn-sm btn-outline-secondary me-2" onClick={openEditModal} disabled={!canAdd}><FontAwesomeIcon icon={faEdit} /> Éditer</button>
            ) : (
              <button className="btn btn-sm btn-outline-primary me-2" onClick={openAddModal} disabled={!canAdd}><FontAwesomeIcon icon={faPlus} /> Ajouter rapport</button>
            )}
          </ContentPermsWrapper>}
        </div>
      </div>
      <div className="card-body p-3" style={{ minHeight: 420 }}>
        <div className="row">
          <div className="col-12">
            {report ? (
              <>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="fw-semibold">{report.sermon_theme || event.event_name}</h5>
                    <div className="text-muted small">{event.church_name} • {new Date(event.event_date).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">{event.event_type_name}</div>
                    <div className="fw-semibold">{report.preacher}</div>

                  </div>
                </div>
                <hr />
                <div className="mb-2"><strong>Référence biblique:</strong> <div className="text-muted">{report.bible_reference}</div></div>
                <div className="mb-2"><strong>Résumé du message:</strong> <div className="text-muted">{report.sermon_summary}</div></div>
                <div className="mb-2"><strong>Activités après le culte:</strong> <div className="text-muted">{report.after_service_activities}</div></div>
              </>
            ) : (
              <div className="text-center text-muted py-5">Aucun rapport trouvé. Cliquez sur "Ajouter rapport" pour en créer un.</div>
            )}

          </div>
        </div>
      </div>
      {/* Modal for add/edit */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Ajouter un rapport' : 'Éditer le rapport'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Prédicateur</label>
            <input className="form-control" value={form.predicateur} onChange={e => setForm(f => ({ ...f, predicateur: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Thème du message</label>
            <input className="form-control" value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Référence biblique</label>
            <input className="form-control" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Résumé du message</label>
            <textarea className="form-control" rows={3} value={form.resume} onChange={e => setForm(f => ({ ...f, resume: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Activités après le culte</label>
            <textarea className="form-control" rows={2} value={form.activites} onChange={e => setForm(f => ({ ...f, activites: e.target.value }))} />
          </div>
          {!canAdd && <div className="text-danger small">Ajout/édition désactivé : hors fenêtre de 3 jours autour de l'événement.</div>}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!canAdd}>Enregistrer</button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default RapportsTab
