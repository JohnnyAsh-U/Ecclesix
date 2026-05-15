import React, { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faMessage, faArrowRight, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import CommunicationFilterTop from './filter-top'
import CommunicationMemberList from './list'

const defaultFilters = {
    sexe: 'tout',
    age: 'tout',
    statut_matrimonial: 'tout',
    type_metier: 'tout',
    eglise: 'tout',
    Ministre: true,
    Ouvrier: true,
    Membre: true,
    Visiteur: true,
    baptise: true,
    non_baptise: true,
    actif: true,
    inactif: true,
}

const CreateCampaign = ({ onCampaignCreated, onBack }) => {
    const [step, setStep] = useState(1)
    const [filters, setFilters] = useState(defaultFilters)
    const [search, setSearch] = useState('')
    const [selectedMembersMap, setSelectedMembersMap] = useState({})
    
    const [formData, setFormData] = useState({
        channel: null,
        audience: 'all',
        audienceFilter: null,
        subject: '',
        message: '',
        template: null,
        variables: {},
        sendNow: true,
        scheduledDate: '',
        scheduledTime: '',
        timezone: 'UTC'
    })

    const selectedMembers = useMemo(() => Object.values(selectedMembersMap), [selectedMembersMap])

    const handleChannelSelect = (channel) => {
        setFormData({ ...formData, channel })
        setStep(2)
    }

    const handleFilterChange = (name, value) => {
        if (name === 'statut' || name === 'bapteme' || name === 'actif') {
            setFilters((prev) => ({ ...prev, [value]: !prev[value] }))
            return
        }
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const filterDefault = () => {
        setSearch('')
        setFilters(defaultFilters)
    }

    const handleAudienceSelect = (audience) => {
        setFormData({ ...formData, audience })
        setStep(3)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleScheduleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSendNowChange = (e) => {
        setFormData({ ...formData, sendNow: e.target.value === 'now' })
    }

    const handleVariableChange = (key, value) => {
        setFormData({
            ...formData,
            variables: { ...formData.variables, [key]: value }
        })
    }

    const handleSubmit = () => {
        // Validate form
        if (!formData.channel) {
            toast.error('Veuillez sélectionner un canal')
            return
        }
        if (selectedMembers.length === 0) {
            toast.error('Veuillez sélectionner au moins un destinataire')
            return
        }
        if (!formData.message.trim()) {
            toast.error('Veuillez ajouter un message')
            return
        }
        if (formData.channel === 'email' && !formData.subject.trim()) {
            toast.error('Veuillez ajouter un objet pour l\'e-mail')
            return
        }
        if (!formData.sendNow && !formData.scheduledDate) {
            toast.error('Veuillez sélectionner une date programmée')
            return
        }

        // Simulate API call
        toast.success('Campagne créée avec succès !')
        onCampaignCreated()
        // Reset form
        setFormData({
            channel: null,
            audience: 'all',
            audienceFilter: null,
            subject: '',
            message: '',
            template: null,
            variables: {},
            sendNow: true,
            scheduledDate: '',
            scheduledTime: '',
            timezone: 'UTC'
        })
        setSelectedMembersMap({})
        setStep(1)
    }

    return (
        <div>
            {/* Back Button */}
            {onBack && (
                <button 
                    className="btn btn-sm btn-outline-secondary mb-3"
                    onClick={onBack}
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Retour
                </button>
            )}
            
            {/* Progress Bar */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className="d-flex align-items-center flex-grow-1">
                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center fw-bold`}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: step >= s ? '#0d6efd' : '#e9ecef',
                                        color: step >= s ? 'white' : '#666',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => step > s && setStep(s)}
                                >
                                    {step > s ? <FontAwesomeIcon icon={faCheck} /> : s}
                                </div>
                                {s < 5 && <div className="flex-grow-1 mx-2" style={{ height: '2px', backgroundColor: step > s ? '#0d6efd' : '#e9ecef' }}></div>}
                            </div>
                        ))}
                    </div>
                    <div className="d-flex justify-content-between mt-3 small text-muted">
                        <span>Canal</span>
                        <span>Audience</span>
                        <span>Composer</span>
                        <span>Planifier</span>
                        <span>Examen</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Channel Selection */}
            {step === 1 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Étape 1 : Choisir le canal</h5>
                        <div className="row g-4">
                            {/* Email Card */}
                            <div className="col-md-6">
                                <div
                                    className="card border-2 cursor-pointer transition"
                                    style={{
                                        borderColor: formData.channel === 'email' ? '#0d6efd' : '#dee2e6',
                                        backgroundColor: formData.channel === 'email' ? '#f0f7ff' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => handleChannelSelect('email')}
                                >
                                    <div className="card-body text-center">
                                        <FontAwesomeIcon icon={faEnvelope} size="3x" className="text-primary mb-3" />
                                        <h5 className="card-title">E-mail</h5>
                                        <p className="card-text text-muted">Envoyer des bulletins d'information et des annonces</p>
                                        <button className="btn btn-sm btn-primary">Sélectionner</button>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp Card */}
                            <div className="col-md-6">
                                <div
                                    className="card border-2 cursor-pointer transition"
                                    style={{
                                        borderColor: formData.channel === 'whatsapp' ? '#0d6efd' : '#dee2e6',
                                        backgroundColor: formData.channel === 'whatsapp' ? '#f0f7ff' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => handleChannelSelect('whatsapp')}
                                >
                                    <div className="card-body text-center">
                                        <FontAwesomeIcon icon={faMessage} size="3x" className="text-success mb-3" />
                                        <h5 className="card-title">WhatsApp</h5>
                                        <p className="card-text text-muted">Notifications instantanées des membres</p>
                                        <button className="btn btn-sm btn-success">Sélectionner</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Audience Selection */}
            {step === 2 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Étape 2 : Sélectionner l'audience</h5>
                        
                        {/* Filters */}
                        <CommunicationFilterTop
                            handleChange={handleFilterChange}
                            filters={filters}
                            search={search}
                            handleSearchChange={setSearch}
                            filterDefault={filterDefault}
                        />

                        {/* Member List */}
                        <div className="mt-3 mb-3">
                            <CommunicationMemberList
                                filters={filters}
                                search={search}
                                selectedMap={selectedMembersMap}
                                setSelectedMap={setSelectedMembersMap}
                            />
                        </div>

                        <div className="alert alert-light border p-2 small mb-3">
                            Destinataires sélectionnés: <b>{selectedMembers.length}</b>
                        </div>

                        <div className="mt-4 d-flex gap-2 justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Retour
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setStep(3)}
                                disabled={selectedMembers.length === 0}
                            >
                                Suivant <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Compose Message */}
            {step === 3 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">
                            Étape 3 : Composer {formData.channel === 'email' ? "l'e-mail" : "le message WhatsApp"}
                        </h5>

                        {formData.channel === 'email' ? (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Objet :</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="Objet de l'e-mail"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Message :</label>
                                    <textarea
                                        className="form-control"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="8"
                                        placeholder="Écrivez votre message e-mail ici..."
                                    ></textarea>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Modèle :</label>
                                    <select
                                        className="form-select"
                                        name="template"
                                        onChange={handleInputChange}
                                    >
                                        <option>Sélectionner un modèle</option>
                                        <option value="sunday_reminder">Rappel du dimanche</option>
                                        <option value="prayer_meeting">Réunion de prière</option>
                                        <option value="offering_reminder">Rappel de collecte</option>
                                    </select>
                                </div>

                                {formData.template && (
                                    <div className="mb-3">
                                        <label className="form-label">Variables :</label>
                                        <div className="mb-2">
                                            <label className="form-label small">Heure du service :</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={formData.variables.serviceTime || ''}
                                                onChange={(e) => handleVariableChange('serviceTime', e.target.value)}
                                                placeholder="p. ex., 8h00"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label small">Lieu :</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={formData.variables.location || ''}
                                                onChange={(e) => handleVariableChange('location', e.target.value)}
                                                placeholder="p. ex., Salle principale"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">Message :</label>
                                    <textarea
                                        className="form-control"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="6"
                                        placeholder="Écrivez votre message WhatsApp ici..."
                                    ></textarea>
                                </div>
                            </>
                        )}

                        <div className="mt-4 d-flex gap-2 justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Retour
                            </button>
                            <button className="btn btn-primary" onClick={() => setStep(4)}>
                                Suivant <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Schedule */}
            {step === 4 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Étape 4 : Planifier la campagne</h5>

                        <div className="mb-3">
                            <label className="form-label">Quand envoyer :</label>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sendOption"
                                    id="sendNow"
                                    value="now"
                                    checked={formData.sendNow}
                                    onChange={handleSendNowChange}
                                />
                                <label className="form-check-label" htmlFor="sendNow">
                                    Envoyer maintenant
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sendOption"
                                    id="scheduleLater"
                                    value="later"
                                    checked={!formData.sendNow}
                                    onChange={handleSendNowChange}
                                />
                                <label className="form-check-label" htmlFor="scheduleLater">
                                    Planifier pour plus tard
                                </label>
                            </div>
                        </div>

                        {!formData.sendNow && (
                            <>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date :</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="scheduledDate"
                                            value={formData.scheduledDate}
                                            onChange={handleScheduleChange}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Heure :</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="scheduledTime"
                                            value={formData.scheduledTime}
                                            onChange={handleScheduleChange}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Fuseau horaire :</label>
                                    <select
                                        className="form-select"
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleScheduleChange}
                                    >
                                        <option>UTC</option>
                                        <option>EST</option>
                                        <option>CST</option>
                                        <option>MST</option>
                                        <option>PST</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="mt-4 d-flex gap-2 justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(3)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Retour
                            </button>
                            <button className="btn btn-primary" onClick={() => setStep(5)}>
                                Suivant <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Étape 5 : Examen de la campagne</h5>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Canal :</label>
                                    <p className="fw-bold">{formData.channel.charAt(0).toUpperCase() + formData.channel.slice(1)}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Destinataires :</label>
                                    <p className="fw-bold">{selectedMembers.length}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Fournisseur :</label>
                                    <p className="fw-bold">{formData.channel === 'email' ? 'Resend' : '360dialog'}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Planifié :</label>
                                    <p className="fw-bold">
                                        {formData.sendNow ? 'Immédiat' : `${formData.scheduledDate} ${formData.scheduledTime}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {formData.channel === 'email' && (
                            <div className="mb-3">
                                <label className="form-label small text-muted">Objet :</label>
                                <p>{formData.subject}</p>
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label small text-muted">Message :</label>
                            <p style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                                {formData.message}
                            </p>
                        </div>

                        <div className="mt-4 d-flex gap-2 justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(4)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Retour
                            </button>
                            <button className="btn btn-success btn-lg" onClick={handleSubmit}>
                                <FontAwesomeIcon icon={faCheck} className="me-2" /> Envoyer la campagne
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateCampaign
