import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheckCircle, faTimes, faClock, faEnvelope, faMessage } from '@fortawesome/free-solid-svg-icons'

const CampaignDetail = ({ campaign, onBack }) => {
    const getStatusColor = (status) => {
        const map = {
            completed: 'success',
            sending: 'info',
            scheduled: 'warning'
        }
        return map[status] || 'secondary'
    }

    const getProgressPercentage = (campaign) => {
        const total = campaign.sentCount
        if (total === 0) return 0
        return Math.round(((campaign.deliveredCount + campaign.failedCount + campaign.pendingCount) / total) * 100)
    }

    const deliveryRate = campaign.sentCount > 0 
        ? Math.round((campaign.deliveredCount / campaign.sentCount) * 100)
        : 0

    return (
        <div>
            {/* Back Button */}
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={onBack}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back to Campaigns
            </button>

            {/* Campaign Header */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h3 className="card-title mb-0">{campaign.name}</h3>
                            <small className="text-muted">Created on {campaign.createdAt}</small>
                        </div>
                        <span className={`badge bg-${getStatusColor(campaign.status)} p-2`}>
                            <FontAwesomeIcon icon={
                                campaign.status === 'completed' ? faCheckCircle :
                                campaign.status === 'sending' ? faClock :
                                faClock
                            } className="me-1" />
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                    </div>

                    {/* Progress */}
                    {campaign.status === 'sending' && (
                        <div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="fw-bold">Overall Progress</span>
                                <span className="fw-bold">{campaign.deliveredCount + campaign.failedCount + campaign.pendingCount} / {campaign.sentCount}</span>
                            </div>
                            <div className="progress mb-3" style={{ height: '8px' }}>
                                <div 
                                    className="progress-bar bg-success" 
                                    style={{ width: `${(campaign.deliveredCount / campaign.sentCount) * 100}%` }}
                                ></div>
                                <div 
                                    className="progress-bar bg-danger" 
                                    style={{ width: `${(campaign.failedCount / campaign.sentCount) * 100}%` }}
                                ></div>
                                <div 
                                    className="progress-bar bg-warning" 
                                    style={{ width: `${(campaign.pendingCount / campaign.sentCount) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-3 mb-3">
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h4 className="card-title fw-bold text-success mb-1">{campaign.deliveredCount}</h4>
                            <small className="text-muted">Delivered</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h4 className="card-title fw-bold text-danger mb-1">{campaign.failedCount}</h4>
                            <small className="text-muted">Failed</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h4 className="card-title fw-bold text-warning mb-1">{campaign.pendingCount}</h4>
                            <small className="text-muted">Pending</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h4 className="card-title fw-bold text-info mb-1">{deliveryRate}%</h4>
                            <small className="text-muted">Success Rate</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Details */}
            <div className="row g-3">
                {/* Left Column */}
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Campaign Details</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label small text-muted">Channel</label>
                                <p className="fw-bold">
                                    <FontAwesomeIcon 
                                        icon={campaign.channel === 'email' ? faEnvelope : faMessage}
                                        className="me-2"
                                    />
                                    {campaign.channel.charAt(0).toUpperCase() + campaign.channel.slice(1)}
                                </p>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">Audience</label>
                                <p className="fw-bold">{campaign.audience}</p>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">Provider</label>
                                <p className="fw-bold">{campaign.provider}</p>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">Schedule Type</label>
                                <p className="fw-bold">{campaign.schedule || 'One-time'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Delivery Summary</h6>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-md-6 mb-3">
                                    <h5 className="fw-bold text-success">{campaign.deliveredCount}</h5>
                                    <small className="text-muted">Successfully Delivered</small>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <h5 className="fw-bold text-danger">{campaign.failedCount}</h5>
                                    <small className="text-muted">Failed/Bounced</small>
                                </div>
                            </div>
                            <hr />
                            <div className="row text-center">
                                <div className="col-md-6">
                                    <h5 className="fw-bold text-info">{campaign.sentCount}</h5>
                                    <small className="text-muted">Total Sent</small>
                                </div>
                                <div className="col-md-6">
                                    <h5 className="fw-bold text-warning">{campaign.pendingCount}</h5>
                                    <small className="text-muted">Still Processing</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="card mt-3">
                <div className="card-header">
                    <h6 className="card-title mb-0">Delivery Timeline</h6>
                </div>
                <div className="card-body">
                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-marker" style={{ background: '#0d6efd' }}></div>
                            <div className="timeline-content">
                                <h6 className="mb-1">Campaign Created</h6>
                                <p className="mb-0 text-muted small">{campaign.createdAt}</p>
                            </div>
                        </div>
                        {campaign.status !== 'scheduled' && (
                            <>
                                <div className="timeline-item">
                                    <div className="timeline-marker" style={{ background: '#0d6efd' }}></div>
                                    <div className="timeline-content">
                                        <h6 className="mb-1">Processing Started</h6>
                                        <p className="mb-0 text-muted small">2 minutes after creation</p>
                                    </div>
                                </div>
                                <div className="timeline-item">
                                    <div className="timeline-marker" style={{ background: campaign.status === 'completed' ? '#198754' : '#0d6efd' }}></div>
                                    <div className="timeline-content">
                                        <h6 className="mb-1">Delivery {campaign.status === 'completed' ? 'Completed' : 'In Progress'}</h6>
                                        <p className="mb-0 text-muted small">
                                            {campaign.completedAt || 'Processing messages...'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                        {campaign.status === 'scheduled' && (
                            <div className="timeline-item">
                                <div className="timeline-marker" style={{ background: '#ffc107' }}></div>
                                <div className="timeline-content">
                                    <h6 className="mb-1">Scheduled for</h6>
                                    <p className="mb-0 text-muted small">{campaign.scheduledFor}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Failures and Retries */}
            {campaign.failedCount > 0 && (
                <div className="card mt-3">
                    <div className="card-header">
                        <h6 className="card-title mb-0">Failed Deliveries</h6>
                    </div>
                    <div className="card-body">
                        <p className="text-muted mb-3">
                            {campaign.failedCount} messages failed to deliver. Click to view details.
                        </p>
                        <button className="btn btn-sm btn-outline-danger">
                            View Failed Recipients
                        </button>
                        <button className="btn btn-sm btn-outline-primary ms-2">
                            Retry Failed
                        </button>
                    </div>
                </div>
            )}

            {/* Styles for timeline */}
            <style>{`
                .timeline {
                    position: relative;
                    padding: 20px 0;
                }
                .timeline-item {
                    display: flex;
                    margin-bottom: 30px;
                    position: relative;
                    padding-left: 40px;
                }
                .timeline-item:last-child {
                    margin-bottom: 0;
                }
                .timeline-marker {
                    position: absolute;
                    left: 0;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    margin-top: 5px;
                    border: 3px solid white;
                }
                .timeline-content {
                    flex: 1;
                }
                .timeline-item:not(:last-child)::before {
                    content: '';
                    position: absolute;
                    left: 7px;
                    top: 25px;
                    bottom: -30px;
                    width: 2px;
                    background: #dee2e6;
                }
            `}</style>
        </div>
    )
}

export default CampaignDetail
