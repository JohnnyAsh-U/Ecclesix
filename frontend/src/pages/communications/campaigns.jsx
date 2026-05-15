import React, { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faMessage, faClock, faCheckCircle, faClock as faPending, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import CampaignDetail from '../../components/communications/CampaignDetail'
import { useCampaigns } from '../../services/campaigns'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { FormSelect } from '../../components/Inputbox/form-select'
import { AppGlobalContext } from '../../hooks/AppContext'

const Campaigns = ({ refresh }) => {
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [channelFilter, setChannelFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [churchFilter, setChurchFilter] = useState('all')
    const [search, setSearch] = useState('')
    const { eglises } = AppGlobalContext()


    const stats = [
        {
            title: 'E-mails envoyés ce mois',
            value: '0',
            icon: faEnvelope,
            color: 'primary',
            trend: '0%',
            trendUp: true
        },
        {
            title: 'Messages WhatsApp envoyés',
            value: '0',
            icon: faMessage,
            color: 'success',
            trend: '0%',
            trendUp: true
        },
        {
            title: 'Taux de livraison',
            value: '0%',
            icon: faCheckCircle,
            color: 'info',
            trend: '0%',
            trendUp: true
        },
        {
            title: 'Échecs',
            value: '0%',
            icon: faExclamationCircle,
            color: 'danger',
            trend: '0%',
            trendUp: false
        }
    ]

    // Fetch campaigns from API
    const filters = {
        ...(channelFilter !== 'all' && { channel: channelFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
    }
    const { campaigns, isLoading, error, mutate } = useCampaigns(filters)
    console.log(error)

    // Local search filtering
    const filteredCampaigns = useMemo(() => {
        if (!campaigns || campaigns.length === 0) return []

        return campaigns.filter(campaign => {
            const matchSearch = campaign.name.toLowerCase().includes(search.toLowerCase())
            return matchSearch
        })
    }, [campaigns, search])

    const getStatusBadge = (status) => {
        const statusMap = {
            completed: { label: 'Terminé', color: 'bg-success', icon: faCheckCircle },
            processing: { label: 'Traitement', color: 'bg-info', icon: faClock },
            queued: { label: 'En attente', color: 'bg-warning', icon: faPending },
            scheduled: { label: 'Programmé', color: 'bg-warning', icon: faPending },
            draft: { label: 'Brouillon', color: 'bg-secondary', icon: faExclamationCircle },
            failed: { label: 'Échoué', color: 'bg-danger', icon: faExclamationCircle },
            paused: { label: 'Suspendu', color: 'bg-secondary', icon: faPending }
        }
        const statusInfo = statusMap[status] || { label: status, color: 'bg-secondary' }
        return statusInfo
    }

    const getChannelIcon = (channel) => {
        return channel === 'email' ? faEnvelope : faMessage
    }

    if (selectedCampaign) {
        return <CampaignDetail campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
    }

    return (
        <div>
            {/* Stats Cards */}
            <div className="row gx-3">
                {stats.map((stat, index) => (
                    <div key={index} className="col-md-6 col-lg-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small className="text-muted">{stat.title}</small>
                                        <h4 className="fw-bold mt-2">{stat.value}</h4>
                                        <small className={stat.trendUp ? 'text-success' : 'text-danger'}>
                                            {stat.trend}
                                        </small>
                                    </div>
                                    <FontAwesomeIcon
                                        icon={stat.icon}
                                        size="lg"
                                        className={`text-${stat.color} opacity-50`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Rechercher des campagnes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <FormSelect
                                value={channelFilter}
                                onChange={(e) => setChannelFilter(e.target.value)}
                            >
                                <option value="all">Tous les canaux</option>
                                <option value="email">E-mail</option>
                                <option value="whatsapp">WhatsApp</option>
                            </FormSelect>
                        </div>
                        <div className="col-md-3">
                            <FormSelect
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="draft">Brouillon</option>
                                <option value="queued">En attente</option>
                                <option value="processing">Traitement</option>
                                <option value="completed">Terminé</option>
                                <option value="failed">Échoué</option>
                            </FormSelect>
                        </div>
                        <ContentPermsWrapper requiredPerms={['superAdmin', 'envoyer_toutes_communications']}>
                            <div className="col-md-3">
                                <FormSelect
                                    name="eglise"
                                    onChange={(e) => setChurchFilter(e.target.value)}
                                    value={churchFilter}
                                >
                                    <option value={'tout'}>Eglise: Tout</option>
                                    {eglises.map((eglise) => (
                                        <option key={eglise.id} value={eglise.id}>
                                            {eglise.church_name}
                                        </option>
                                    ))}
                                </FormSelect>
                            </div>
                        </ContentPermsWrapper>
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Nom de la campagne</th>
                                <th>Canal</th>
                                <th>Envoyé</th>
                                <th>Livré</th>
                                <th>Échoué</th>
                                <th>En attente</th>
                                <th>Statut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Chargement...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-danger">
                                        Erreur lors du chargement des campagnes. Veuillez actualiser.
                                    </td>
                                </tr>
                            ) : filteredCampaigns.length > 0 ? (
                                filteredCampaigns.map(campaign => {
                                    const statusInfo = getStatusBadge(campaign.status)
                                    return (
                                        <tr key={campaign.id} style={{ cursor: 'pointer' }}>
                                            <td className="fw-bold">{campaign.name}</td>
                                            <td>
                                                <FontAwesomeIcon icon={getChannelIcon(campaign.channel)} className="me-2" />
                                                {campaign.channel.charAt(0).toUpperCase() + campaign.channel.slice(1)}
                                            </td>
                                            <td>
                                                <span className="badge bg-secondary">{campaign.sent_count || 0}</span>
                                            </td>
                                            <td>
                                                <span className="text-success fw-bold">{campaign.delivered_count || 0}</span>
                                            </td>
                                            <td>
                                                <span className="text-danger">{campaign.failed_count || 0}</span>
                                            </td>
                                            <td>
                                                <span className="text-warning">{campaign.pending_count || 0}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${statusInfo.color}`}>
                                                    <FontAwesomeIcon icon={statusInfo.icon} className="me-1" />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSelectedCampaign(campaign)}
                                                >
                                                    Afficher les détails
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        Aucune campagne trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Campaigns
