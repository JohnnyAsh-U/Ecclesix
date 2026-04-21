import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons'
import Modal from 'react-bootstrap/Modal'

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

const RapportsTab = ({ event = {}, onTabChange = () => {} }) => {
  const [reports, setReports] = useState(() => [
    {
      id: 1,
      name: event.event_name || 'Rapport 1',
      branche: event.church_name || 'Générale',
      date: event.event_date || new Date().toISOString(),
      predicateur: 'Pasteur Jean',
      statut: 'Publié',
      type: SERVICE_TYPES[0],
      theme: 'La grâce',
      reference: 'Jean 3:16',
      resume: 'Bref résumé du message',
      activites: 'Accueil, prière',
    },
  ])

  const current = reports[0] || null
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

  const canAdd = withinThreeDays(event.event_date)

  const openAddModal = () => {
    setModalMode('add')
    setForm({ predicateur: '', theme: '', reference: '', type: SERVICE_TYPES[0], resume: '', activites: '' })
    setEditingId(null)
    setModalOpen(true)
  }

  const openEditModal = (r) => {
    setModalMode('edit')
    setEditingId(r.id)
    setForm({
      predicateur: r.predicateur || '',
      theme: r.theme || r.name || '',
      reference: r.reference || '',
      type: r.type || SERVICE_TYPES[0],
      resume: r.resume || '',
      activites: r.activites || '',
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.predicateur || !form.theme) return alert('Prédicateur et Thème sont requis')
    if (!canAdd) return alert('Ajout / édition non autorisé : hors fenêtre de 3 jours')
    if (modalMode === 'edit' && editingId != null) {
      setReports(prev => prev.map(r => r.id === editingId ? { ...r, ...form } : r))
      setModalOpen(false)
      setEditingId(null)
      return
    }
    const id = Math.max(0, ...reports.map(r => r.id)) + 1
    const newReport = {
      id,
      name: form.theme,
      branche: event.church_name || 'Générale',
      date: new Date().toISOString(),
      predicateur: form.predicateur,
      statut: 'Brouillon',
      type: form.type,
      theme: form.theme,
      reference: form.reference,
      resume: form.resume,
      activites: form.activites,
    }
    setReports(prev => [newReport, ...prev])
    setModalOpen(false)
    setForm({ predicateur: '', theme: '', reference: '', type: SERVICE_TYPES[0], resume: '', activites: '' })
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
        <h5 className="mb-0" style={{ color: '#ffb64d', fontSize: '16px', fontWeight: '600' }}>
          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
          Rapports de l'Événement
        </h5>
        <div>
          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onTabChange && onTabChange('presence')}>
            Retour à la présence
          </button>
          <button className="btn btn-sm btn-primary" onClick={openAddModal} disabled={!canAdd}>
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Ajouter rapport
          </button>
        </div>
      </div>
      <div className="card-body p-3" style={{ minHeight: 420 }}>
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                {current ? (
                  <>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="fw-semibold">{current.theme || current.name}</h5>
                        <div className="text-muted small">{current.branche} • {new Date(current.date).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div className="text-end">
                        <div className="small text-muted">{current.type}</div>
                        <div className="fw-semibold">{current.predicateur}</div>
                        <div className="mt-2">
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEditModal(current)} disabled={!canAdd}><FontAwesomeIcon icon={faEdit} /> Éditer</button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => onTabChange && onTabChange('presence')}>Retour</button>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="mb-2"><strong>Référence biblique:</strong> <div className="text-muted">{current.reference}</div></div>
                    <div className="mb-2"><strong>Résumé du message:</strong> <div className="text-muted">{current.resume}</div></div>
                    <div className="mb-2"><strong>Activités après le culte:</strong> <div className="text-muted">{current.activites}</div></div>
                  </>
                ) : (
                  <div className="text-center text-muted py-5">Aucun rapport trouvé. Cliquez sur "Ajouter rapport" pour en créer un.</div>
                )}
              </div>
            </div>
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
            <label className="form-label">Type de service</label>
            <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
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
