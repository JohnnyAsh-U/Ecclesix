import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faCheckCircle, faTimes, faCog, faPlus, faPaperPlane, faSave, faMessage, faTrash } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import useFetch from '../../hooks/fetchHook'
import axios from 'axios'



const channelList = [
  {
    id: 'email',
    name: 'Email',
    icon: faEnvelope,
    color: 'primary'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: faMessage,
    color: 'success'
  }
]

const providerCredentials = {
  "whatsapp": [
    {
      name: 'dialog360',
      fields: [
        { name: 'api_key', label: 'Clé API', type: 'password', required: true },
        { name: 'phone_number_id', label: 'ID du numéro de téléphone', type: 'text', required: true }
      ]
    },
  ],
  "email": [
    {
      name: 'smtp',
      fields: [
        { name: 'smtp_host', label: 'Hôte SMTP', type: 'text', placeholder: 'smtp.gmail.com', required: true },
        { name: 'smtp_port', label: 'Port SMTP', type: 'number', placeholder: '587', required: true },
        { name: 'smtp_username', label: 'Nom d\'utilisateur (Email)', type: 'email', required: true },
        { name: 'smtp_password', label: 'Mot de passe', type: 'password', required: true }
      ]
    },
    {
      name: 'resend',
      fields: [
        { name: 'api_key', label: 'Clé API', type: 'password', required: true },
        { name: 'from_email', label: 'Email d\'expédition', type: 'email', required: true }
      ]
    },
    {
      name: 'sendgrid',
      fields: [
        { name: 'api_key', label: 'Clé API', type: 'password', required: true }
      ]
    },
  ]
}

const CommConfig = () => {
  const [selectedChannel, setSelectedChannel] = useState('email')
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [setupStep, setSetupStep] = useState(1)
  const [credentials, setCredentials] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)

  // Fetch the provider configs
  const { loading, data: providerConfigs, error, reload } = useFetch(`/communication/provider-configs`, 'get')

  const handleConnectClick = (channelId) => {
    setSelectedChannel(channelId)
    setShowConnectModal(true)
    setSetupStep(1)
    setSelectedProvider(null)
    setCredentials({})
  }

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider)
    setSetupStep(2)
    setCredentials({})
  }

  const handleCredentialChange = (fieldName, value) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleTestConnection = async () => {
    // Validate required fields
    const providerFields = selectedProvider?.fields || []
    for (const field of providerFields) {
      if (field.required && !credentials[field.name]?.trim()) {
        toast.error(`Veuillez entrer ${field.label}`)
        return
      }
    }

    setIsLoading(true)
    try {
      // Call the backend to create/test provider config
      console.log(credentials.name)
      const response = await axios.post('/communication/provider-configs', {
        name: credentials.name,
        channel: selectedChannel,
        provider: selectedProvider.name,
        credentials: credentials
      })

      if (response.status === 201 || response.status === 200) {
        toast.success('Connexion vérifiée et sauvegardée !')
        setSetupStep(3)
        setTimeout(() => {
          setShowConnectModal(false)
          reload() // Refresh the provider configs list
        }, 1500)
      } else {
        toast.error(response.data.detail || 'Échec de la connexion')
      }
    } catch (error) {

      toast.error('Échec du test de connexion')
      console.error(error.response)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProvider = async (providerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette configuration de fournisseur ?')) {
      return
    }

    setIsLoading(true)
    try {
      const { data } = await axios.delete(`/communication/provider-configs/${providerId}`)
      toast.success('Configuration supprimée')
      setSetupStep(3)
      reload()
    } catch (error) {
      toast.error('Échec de la suppression')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="card mb-0" style={{ minHeight: '73vh' }}>
      <div className="card-header">
        <h5 className="card-header-left">
          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
          Configuration Email et WhatsApp
        </h5>
      </div>

      <div className="card-body">
        {loading ? (
          <p className="text-muted mb-0">Chargement de la configuration...</p>
        ) : (
          <div className="row g-3">
            {/* Channel Cards */}
            {channelList.map((c, index) => {
              const provider = providerConfigs?.find(pc => pc.channel === c.id)
              const status = provider ? provider.is_verified : false
              return (
                <div className='col-md-6' key={index}>
                  <div className="card shadow-md">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon
                              icon={c.icon}
                              size="lg"
                              className={`text-${c.color} me-3`}
                            />
                            <h6 className="card-title mb-0">{c.name}</h6>
                          </div>
                        </div>
                      </div>

                      {provider ? (
                        <>
                          <div className="mb-3">
                            <small className="text-muted">Fournisseur :</small>
                            <p className="mb-0 fw-bold">{provider.provider}</p>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted">{c.id == "email" ? "Email" : "WhatsApp"}:</small>
                            <p className="mb-0 fw-bold">{provider.name}</p>
                          </div>
                          {provider.is_verified && (
                            <div className="mb-3">
                              <small className="text-success">✓ Vérifié</small>
                            </div>
                          )}
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteProvider(provider.id)}
                              disabled={isLoading}
                            >
                              <FontAwesomeIcon icon={faTrash} className="me-2" />
                              Supprimer
                            </button>

                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-muted mb-3">
                            Configurer un service {c.name}
                          </p>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleConnectClick(c.id)}
                            disabled={isLoading || loading}
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Ajouter {c.name}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Connecter un fournisseur {selectedChannel}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConnectModal(false)}
                  disabled={isLoading}
                ></button>
              </div>

              <div className="modal-body">
                {setupStep === 1 && (
                  <div>
                    <h6 className="mb-3">Choisir un fournisseur {selectedChannel}</h6>
                    <div className="row g-3">
                      {providerCredentials[selectedChannel]?.map((provider, index) => (
                        <div key={index} className="col-md-6">
                          <div
                            className="card border-2"
                            style={{
                              borderColor: '#dee2e6',
                              backgroundColor: 'white',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleProviderSelect(provider)}
                          >
                            <div className="card-body text-center">
                              <h6 className="card-title">{provider.name}</h6>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                type="button"
                              >
                                Sélectionner
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {setupStep === 2 && (
                  <div>
                    <h6 className="mb-3">Configuration de {selectedProvider?.name}</h6>
                    <ol className="mb-4">
                      <li>Créer un compte {selectedProvider?.name}</li>
                      <li>Générer les identifiants API</li>
                      <li>Remplir les détails ci-dessous</li>
                      <li>Tester la connexion</li>
                    </ol>

                    <div>
                      <div className="mb-3">
                        <label className="form-label">
                          {selectedChannel == "email"? "Email": "WhatsApp"}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name={"name"}
                          placeholder={selectedChannel == "email"? "Email": "WhatsApp"}
                          value={credentials["name"] || ""}
                          onChange={(e) => handleCredentialChange("name", e.target.value)}
                          required={true}
                          disabled={isLoading}
                        />
                      </div>
                      {(selectedProvider?.fields || []).map((field, id) => (
                        <div key={id} className="mb-3">
                          <label className="form-label">
                            {field.label}
                            {field.required && <span className="text-danger">*</span>}
                          </label>
                          {field.type === 'number' ? (
                            <input
                              type="number"
                              className="form-control"
                              name={field.name}
                              placeholder={field.placeholder}
                              value={credentials[field.name] || ''}
                              onChange={(e) => handleCredentialChange(field.name, e.target.value)}
                              disabled={isLoading}
                            />
                          ) : (
                            <input
                              type={field.type}
                              className="form-control"
                              name={field.name}
                              placeholder={field.placeholder}
                              value={credentials[field.name] || ''}
                              onChange={(e) => handleCredentialChange(field.name, e.target.value)}
                              disabled={isLoading}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn btn-primary w-100"
                      onClick={handleTestConnection}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                      {isLoading ? 'Test en cours...' : 'Tester la connexion'}
                    </button>
                  </div>
                )}

                {setupStep === 3 && (
                  <div className="text-center">
                    <div className="mb-3">
                      <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success" />
                    </div>
                    <h6 className="mb-2">Connexion vérifiée</h6>
                    <p className="text-muted mb-4">
                      Votre compte {selectedProvider?.name} a été configuré avec succès
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommConfig
