import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faCheckCircle, faTimes, faCog, faPlus, faPaperPlane, faSave, faMessage } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { useProviderConfigs, createProviderConfig, testProviderConnection, getAvailableProviders } from '../../services/providers'

const CommConfig = () => {
  const [selectedChannel, setSelectedChannel] = useState('email')
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [setupStep, setSetupStep] = useState(1)
  const [credentials, setCredentials] = useState({})
  const [availableProviders, setAvailableProviders] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [providerMetadata, setProviderMetadata] = useState({})
  const [showManageModal, setShowManageModal] = useState(false)

  // Fetch provider configs from API
  const { configs, isLoading: configsLoading, mutate } = useProviderConfigs()

  // Provider credential field definitions
  const providerCredentials = {
    resend: {
      fields: [
        { name: 'api_key', label: 'API Key', type: 'password', required: true },
        { name: 'from_email', label: 'From Email', type: 'email', required: true }
      ]
    },
    sendgrid: {
      fields: [
        { name: 'api_key', label: 'API Key', type: 'password', required: true }
      ]
    },
    smtp: {
      fields: [
        { name: 'smtp_host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com', required: true },
        { name: 'smtp_port', label: 'SMTP Port', type: 'number', placeholder: '587', required: true },
        { name: 'smtp_username', label: 'Username (Email)', type: 'email', required: true },
        { name: 'smtp_password', label: 'Password', type: 'password', required: true }
      ]
    },
    sendpulse: {
      fields: [
        { name: 'api_key', label: 'API Key', type: 'password', required: true }
      ]
    },
    twilio: {
      fields: [
        { name: 'account_sid', label: 'Account SID', type: 'password', required: true },
        { name: 'auth_token', label: 'Auth Token', type: 'password', required: true },
        { name: 'phone_number', label: 'WhatsApp Phone Number', type: 'text', placeholder: '+1234567890', required: true }
      ]
    }
  }

  // Fetch available providers
  useEffect(() => {
    const fetchProviders = async () => {
      const result = await getAvailableProviders()
      if (result.success) {
        setAvailableProviders(result.data)
        // Create metadata from available providers
        const metadata = {}
        if (result.data.providers) {
          result.data.providers.forEach(p => {
            if (p.channels.includes(selectedChannel)) {
              metadata[p.id] = providerCredentials[p.id] || { fields: [] }
            }
          })
        }
        setProviderMetadata(metadata)
      }
    }
    fetchProviders()
  }, [selectedChannel])

  const getChannelStatus = () => {
    const config = configs.find(c => c.channel === selectedChannel && c.is_active)
    return config ? 'connected' : 'not_connected'
  }

  const getChannelConfig = () => {
    return configs.find(c => c.channel === selectedChannel && c.is_active)
  }

  const getAvailableChannelProviders = () => {
    if (!availableProviders.providers) return []
    return availableProviders.providers
      .filter(p => p.channels.includes(selectedChannel))
      .map(p => p.id)
  }

  const handleConnectClick = () => {
    setShowConnectModal(true)
    setSetupStep(1)
    setSelectedProvider(null)
    setCredentials({})
  }

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider)
    setSetupStep(2)
    // Initialize credentials based on provider fields
    const providerFields = providerMetadata[provider]?.fields || []
    const initialCreds = {}
    providerFields.forEach(field => {
      initialCreds[field.name] = ''
    })
    setCredentials(initialCreds)
  }

  const handleCredentialChange = (fieldName, value) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleTestConnection = async () => {
    // Validate required fields
    const providerFields = providerMetadata[selectedProvider]?.fields || []
    for (const field of providerFields) {
      if (field.required && !credentials[field.name]?.trim()) {
        toast.error(`Please enter ${field.label}`)
        return
      }
    }

    setIsLoading(true)
    try {
      const result = await testProviderConnection({
        channel: 'email',
        provider: selectedProvider,
        credentials
      })

      if (result.success) {
        toast.success('Connection verified!')
        setSetupStep(3)
      } else {
        toast.error(result.error || 'Connection failed')
      }
    } catch (error) {
      toast.error('Failed to test connection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmConnection = async () => {
    setIsLoading(true)
    try {
      const result = await createProviderConfig({
        channel: 'email',
        provider: selectedProvider,
        credentials
      })

      if (result.success) {
        toast.success('Email configuration saved successfully!')
        setShowConnectModal(false)
        setCredentials({})
        mutate() // Refresh configs
      } else {
        toast.error(result.error || 'Failed to save configuration')
      }
    } catch (error) {
      toast.error('Failed to save configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageClick = () => {
    const config = getChannelConfig()
    if (config) {
      setSelectedProvider(config.provider)
      // Load credentials for editing
      const providerFields = providerMetadata[config.provider]?.fields || []
      const creds = {}
      providerFields.forEach(field => {
        creds[field.name] = config.credentials?.[field.name] || ''
      })
      setCredentials(creds)
      setShowManageModal(true)
      setSetupStep(2)
    }
  }

  const handleUpdateConnection = async () => {
    setIsLoading(true)
    try {
      const result = await createProviderConfig({
        channel: 'email',
        provider: selectedProvider,
        credentials
      })

      if (result.success) {
        toast.success('Email configuration updated successfully!')
        setShowManageModal(false)
        setCredentials({})
        mutate()
      } else {
        toast.error(result.error || 'Failed to update configuration')
      }
    } catch (error) {
      toast.error('Failed to update configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const getAvailableProvidersForChannel = (channelId) => {
    if (!availableProviders.providers) return []
    return availableProviders.providers
      .filter(p => p.channels.includes(channelId))
      .map(p => p.id)
  }

  const status = getChannelStatus()
  const config = getChannelConfig()
  const emailProviders = getAvailableChannelProviders()

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

  return (
    <div className="card mb-0" style={{ minHeight: '73vh' }}>
      <div className="card-header">
        <h5 className="card-header-left">
          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
          Email Configuration
        </h5>
      </div>

      <div className="card-body">
        {configsLoading ? (
          <p className="text-muted mb-0">Loading configuration...</p>
        ) : (
          <div className="row g-3">
            {/* Email Channel Card */}
            {channelList.map((c, index) => {
              const status = getChannelStatus(c.id)
              const config = getChannelConfig(c.id)
              const providersForChannel = getAvailableProvidersForChannel(c.id)
              return (
                <div className='col-md-6'>
                  <div className="card shadow-md" key={index} >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon
                              icon={c.icon}
                              size="lg"
                              className={`text-${c.color} me-3`}
                            />
                            <h5 className="card-title mb-0">{c.name}</h5>
                          </div>
                        </div>
                        <div>
                          {status === 'connected' ? (
                            <span className="badge bg-success">
                              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                              Connected
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              <FontAwesomeIcon icon={faTimes} className="me-1" />
                              Not Connected
                            </span>
                          )}
                        </div>
                      </div>

                      {status === 'connected' && config ? (
                        <>
                          <div className="mb-3">
                            <small className="text-muted">Provider:</small>
                            <p className="mb-0 fw-bold">{config.provider}</p>
                          </div>
                          {config.is_verified && (
                            <div className="mb-3">
                              <small className="text-success">✓ Verified</small>
                            </div>
                          )}
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={handleManageClick}
                            >
                              <FontAwesomeIcon icon={faCog} className="me-2" />
                              Manage
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={handleConnectClick}
                            >
                              <FontAwesomeIcon icon={faPlus} className="me-2" />
                              Change Provider
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-muted mb-3">
                            Configure an email service to send system emails and support messages.
                          </p>
                          <button
                            className="btn btn-primary"
                            onClick={handleConnectClick}
                            disabled={configsLoading}
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Connect Email Provider
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
                <h5 className="modal-title">Connect Email Provider</h5>
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
                    <h6 className="mb-3">Choose Email Provider</h6>
                    <div className="row g-3">
                      {emailProviders.map(provider => (
                        <div key={provider} className="col-md-6">
                          <div
                            className="card border-2"
                            style={{
                              borderColor: selectedProvider === provider ? '#0d6efd' : '#dee2e6',
                              backgroundColor: selectedProvider === provider ? '#f0f7ff' : 'white',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleProviderSelect(provider)}
                          >
                            <div className="card-body text-center">
                              <h6 className="card-title">{provider}</h6>
                              <button className="btn btn-sm btn-outline-primary">
                                Select
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
                    <h6 className="mb-3">{selectedProvider} Setup</h6>
                    <ol className="mb-4">
                      <li>Create {selectedProvider} account</li>
                      <li>Generate API credentials</li>
                      <li>Fill in the details below</li>
                      <li>Test the connection</li>
                    </ol>

                    <div>
                      {(providerMetadata[selectedProvider]?.fields || []).map(field => (
                        <div key={field.name} className="mb-3">
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
                      {isLoading ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                )}

                {setupStep === 3 && (
                  <div className="text-center">
                    <div className="mb-3">
                      <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success" />
                    </div>
                    <h6 className="mb-2">Connection Verified</h6>
                    <p className="text-muted mb-4">
                      Your {selectedProvider} account is now ready to send emails
                    </p>
                    <button
                      className="btn btn-success w-100"
                      onClick={handleConfirmConnection}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      {isLoading ? 'Saving...' : 'Confirm and Save'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Modal */}
      {showManageModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Email Configuration</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowManageModal(false)}
                  disabled={isLoading}
                ></button>
              </div>

              <div className="modal-body">
                <div>
                  <h6 className="mb-3">{selectedProvider} Configuration</h6>

                  <div>
                    {(providerMetadata[selectedProvider]?.fields || []).map(field => (
                      <div key={field.name} className="mb-3">
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

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={() => setShowManageModal(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary flex-grow-1"
                      onClick={handleUpdateConnection}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      {isLoading ? 'Saving...' : 'Update Configuration'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommConfig
