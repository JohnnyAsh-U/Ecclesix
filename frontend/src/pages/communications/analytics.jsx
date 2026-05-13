import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faMessage, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

const Analytics = () => {
    const stats = [
        {
            title: 'Emails Sent This Month',
            value: '12,430',
            icon: faEnvelope,
            color: 'primary',
            trend: '+5.2%',
            trendUp: true
        },
        {
            title: 'WhatsApp Messages Sent',
            value: '4,200',
            icon: faMessage,
            color: 'success',
            trend: '+12.1%',
            trendUp: true
        },
        {
            title: 'Delivery Rate',
            value: '97%',
            icon: faCheckCircle,
            color: 'info',
            trend: '+2.3%',
            trendUp: true
        },
        {
            title: 'Failures',
            value: '2%',
            icon: faExclamationCircle,
            color: 'danger',
            trend: '-0.5%',
            trendUp: false
        }
    ]

    return (
        <div>
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
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

            {/* Charts Section */}
            <div className="row g-3">
                {/* Delivery Trends */}
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Delivery Trends</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="text-center text-muted">
                                    <p className="mb-0">Chart visualization placeholder</p>
                                    <small>Integrate with Chart.js, Recharts, or similar library</small>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small">May 10</span>
                                    <span className="small fw-bold">1,243 sent</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small">May 9</span>
                                    <span className="small fw-bold">2,156 sent</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small">May 8</span>
                                    <span className="small fw-bold">945 sent</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="small">May 7</span>
                                    <span className="small fw-bold">1,834 sent</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Channel Usage */}
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Channel Usage</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="text-center text-muted">
                                    <p className="mb-0">Pie/Doughnut chart visualization</p>
                                    <small>Email vs WhatsApp usage percentage</small>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="mb-2">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="small">
                                            <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                                            Email
                                        </span>
                                        <span className="small fw-bold">65%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div className="progress-bar bg-primary" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="small">
                                            <FontAwesomeIcon icon={faMessage} className="me-2 text-success" />
                                            WhatsApp
                                        </span>
                                        <span className="small fw-bold">35%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div className="progress-bar bg-success" style={{ width: '35%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Rates */}
            <div className="row g-3 mt-0">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Message Success Rates by Channel</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Channel</th>
                                            <th>Sent</th>
                                            <th>Delivered</th>
                                            <th>Delivery Rate</th>
                                            <th>Failed</th>
                                            <th>Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                                                Email
                                            </td>
                                            <td>8,586</td>
                                            <td className="text-success fw-bold">8,289</td>
                                            <td>
                                                <span className="badge bg-success">96.5%</span>
                                            </td>
                                            <td className="text-danger">215</td>
                                            <td>82</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <FontAwesomeIcon icon={faMessage} className="me-2 text-success" />
                                                WhatsApp
                                            </td>
                                            <td>4,200</td>
                                            <td className="text-success fw-bold">4,074</td>
                                            <td>
                                                <span className="badge bg-success">97%</span>
                                            </td>
                                            <td className="text-danger">89</td>
                                            <td>37</td>
                                        </tr>
                                        <tr className="table-active">
                                            <td className="fw-bold">Total</td>
                                            <td className="fw-bold">12,786</td>
                                            <td className="fw-bold text-success">12,363</td>
                                            <td>
                                                <span className="badge bg-success">96.7%</span>
                                            </td>
                                            <td className="fw-bold text-danger">304</td>
                                            <td className="fw-bold">119</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Campaigns */}
            <div className="row g-3 mt-0">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Recent Campaign Performance</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-sm table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Campaign</th>
                                            <th>Date</th>
                                            <th>Recipients</th>
                                            <th>Delivered</th>
                                            <th>Failed</th>
                                            <th>Success Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="fw-bold">Sunday Reminder</td>
                                            <td>May 10, 2024</td>
                                            <td>1,243</td>
                                            <td className="text-success">1,200</td>
                                            <td className="text-danger">20</td>
                                            <td>
                                                <span className="badge bg-success">96.5%</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold">Prayer Meeting</td>
                                            <td>May 11, 2024</td>
                                            <td>324</td>
                                            <td className="text-success">318</td>
                                            <td className="text-danger">3</td>
                                            <td>
                                                <span className="badge bg-success">98.1%</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-bold">Weekly Newsletter</td>
                                            <td>May 09, 2024</td>
                                            <td>2,150</td>
                                            <td className="text-success">2,089</td>
                                            <td className="text-danger">45</td>
                                            <td>
                                                <span className="badge bg-success">97.2%</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics
