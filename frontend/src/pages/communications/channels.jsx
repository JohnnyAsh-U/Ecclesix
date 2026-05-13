import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faMessage, faToggleOn, faToggleOff, faCog, faPlus, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { useProviderConfigs, createProviderConfig, testProviderConnection, getAvailableProviders } from '../../services/providers'

const Channels = ({ refresh }) => {
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [selectedChannel, setSelectedChannel] = useState(null)
    const [selectedProvider, setSelectedProvider] = useState(null)
    const [setupStep, setSetupStep] = useState(1)
    const [apiKey, setApiKey] = useState('')
    const [domain, setDomain] = useState('')
    const [availableProviders, setAvailableProviders] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    // Fetch provider configs from API
    const { configs, isLoading: configsLoading, mutate } = useProviderConfigs()

    // Fetch available providers
    useEffect(() => {
        const fetchProviders = async () => {
            const result = await getAvailableProviders()
            if (result.success) {
                setAvailableProviders(result.data)
            }
        }
        fetchProviders()
    }, [])

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

    const getChannelStatus = (channelId) => {
        const config = configs.find(c => c.channel === channelId && c.is_active)
        return config ? 'connected' : 'not_connected'
    }

    const getChannelConfig = (channelId) => {
        return configs.find(c => c.channel === channelId && c.is_active)
    }

    const getAvailableProvidersForChannel = (channelId) => {
        if (!availableProviders.providers) return []
        return availableProviders.providers
            .filter(p => p.channels.includes(channelId))
            .map(p => p.id)
    }

    const handleConnectClick = (channel) => {
        setSelectedChannel(channel)
        setShowConnectModal(true)
        setSetupStep(1)
        setSelectedProvider(null)
        setApiKey('')
        setDomain('')
    }

    const handleProviderSelect = (provider) => {
        setSelectedProvider(provider)
        setSetupStep(2)
    }

    const handleTestConnection = async () => {
        if (!apiKey.trim()) {
            toast.error('Please enter API key')
            return
        }
        if (selectedProvider === 'resend' && !domain.trim()) {
            toast.error('Please enter domain')
            return
        }

        setIsLoading(true)
        try {
            const credentials = {
                api_key: apiKey,
                ...(selectedProvider === 'resend' && { from_email: domain })
            }

            const result = await testProviderConnection({ 
                channel: selectedChannel.id,
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
            const credentials = {
                api_key: apiKey,
                ...(selectedProvider === 'resend' && { from_email: domain })
            }

            const result = await createProviderConfig({
                channel: selectedChannel.id,
                provider: selectedProvider,
                credentials
            })

            if (result.success) {
                toast.success(`${selectedChannel.name} connected successfully!`)
                setShowConnectModal(false)
                setApiKey('')
                setDomain('')
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

    return (
        <div>
            {/* Header */}
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title mb-0">Connected Channels</h5>
                </div>
            </div>

            {/* Channels Grid */}
            <div className="row g-3">
                {channelList.map(channel => {
                    const status = getChannelStatus(channel.id)
                    const config = getChannelConfig(channel.id)
                    const providersForChannel = getAvailableProvidersForChannel(channel.id)

                    return (
                        <div key={channel.id} className="col-md-6">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon 
                                                    icon={channel.icon} 
                                                    size="lg" 
                                                    className={`text-${channel.color} me-3`}
                                                />
                                                <h5 className="card-title mb-0">{channel.name}</h5>
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
                                            <button className="btn btn-sm btn-outline-primary w-100">
                                                <FontAwesomeIcon icon={faCog} className="me-2" />
                                                Manage
                                            </button>
                                        </>
                                    ) : (
                                        <p className="text-muted mb-3">Not yet connected. Click to set up this communication channel.</p>
                                    )}

                                    {status === 'not_connected' && (
                                        <button
                                            className="btn btn-sm btn-primary w-100"
                                            onClick={() => handleConnectClick(channel)}
                                            disabled={configsLoading}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                                            Connect
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Connect Modal */}
            {showConnectModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Connect {selectedChannel?.name}</h5>
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
                                        <h6 className="mb-3">Choose {selectedChannel?.name} Provider</h6>
                                        <div className="row g-3">
                                            {getAvailableProvidersForChannel(selectedChannel?.id).map(provider => (
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
                                        <h6 className="mb-3">{selectedProvider} Setup Steps</h6>
                                        <ol className="mb-4">
                                            <li>Create {selectedProvider} account</li>
                                            {selectedProvider === 'resend' && <li>Verify domain</li>}
                                            <li>Generate API key</li>
                                            <li>Paste key below</li>
                                        </ol>

                                        <div className="mb-3">
                                            <label className="form-label">API Key:</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                placeholder="Paste your API key"
                                                disabled={isLoading}
                                            />
                                        </div>

                                        {selectedProvider === 'resend' && (
                                            <div className="mb-3">
                                                <label className="form-label">Domain/Email:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={domain}
                                                    onChange={(e) => setDomain(e.target.value)}
                                                    placeholder="e.g., noreply@church.org"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        )}

                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={handleTestConnection}
                                            disabled={isLoading}
                                        >
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
                                            Your {selectedProvider} account is now connected to {selectedChannel?.name}
                                        </p>
                                        <button
                                            className="btn btn-success w-100"
                                            onClick={handleConfirmConnection}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Saving...' : 'Confirm and Save'}
                                        </button>
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

export default Channels
