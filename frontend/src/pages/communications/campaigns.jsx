import React, { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faMessage, faClock, faCheckCircle, faClock as faPending, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import CampaignDetail from '../../components/communications/CampaignDetail'
import { useCampaigns } from '../../services/campaigns'

const Campaigns = ({ refresh }) => {
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [channelFilter, setChannelFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [search, setSearch] = useState('')

    // Fetch campaigns from API
    const filters = {
        ...(channelFilter !== 'all' && { channel: channelFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
    }
    const { campaigns, isLoading, error, mutate } = useCampaigns(filters)

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
            completed: { label: 'Completed', color: 'bg-success', icon: faCheckCircle },
            processing: { label: 'Processing', color: 'bg-info', icon: faClock },
            queued: { label: 'Queued', color: 'bg-warning', icon: faPending },
            scheduled: { label: 'Scheduled', color: 'bg-warning', icon: faPending },
            draft: { label: 'Draft', color: 'bg-secondary', icon: faExclamationCircle },
            failed: { label: 'Failed', color: 'bg-danger', icon: faExclamationCircle },
            paused: { label: 'Paused', color: 'bg-secondary', icon: faPending }
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
            {/* Header */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <h5 className="card-title mb-0">Campaigns Dashboard</h5>
                        <button className="btn btn-primary btn-sm">
                            <i className="fa fa-plus me-2"></i> New Campaign
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row gap-2">
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search campaigns..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={channelFilter}
                                onChange={(e) => setChannelFilter(e.target.value)}
                            >
                                <option value="all">All Channels</option>
                                <option value="email">Email</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select form-select-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="queued">Queued</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Campaign Name</th>
                                <th>Channel</th>
                                <th>Sent</th>
                                <th>Delivered</th>
                                <th>Failed</th>
                                <th>Pending</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-danger">
                                        Error loading campaigns. Please refresh.
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
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        No campaigns found
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
