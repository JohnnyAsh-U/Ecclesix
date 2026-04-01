import React from 'react'
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const metrics = [
    { title: 'Total Members', value: '1,248', note: 'Across all churches', color: 'primary' },
    { title: 'Active vs Inactive', value: '932 / 316', note: '74.7% active', color: 'info' },
    { title: 'At-Risk Members', value: '35', note: 'No attendance in 6 weeks', color: 'danger' },
    { title: 'New Members (30 days)', value: '57', note: '+8.2% vs previous 30 days', color: 'success' },
]

const lifecyclePieData = {
    labels: ['Visitors', 'New', 'Active', 'Inactive', 'At-Risk'],
    datasets: [
        {
            data: [185, 140, 932, 281, 35],
            backgroundColor: ['#5fbeaa', '#ffb64d', '#93be52', '#4680ff', '#fc6180'],
            borderWidth: 1,
        },
    ],
}

const lifecycleBarData = {
    labels: ['Visitors', 'New', 'Active', 'Inactive', 'At-Risk'],
    datasets: [
        {
            label: 'Members',
            data: [185, 140, 932, 281, 35],
            backgroundColor: ['#5fbeaa', '#ffb64d', '#93be52', '#4680ff', '#fc6180'],
            borderRadius: 5,
        },
    ],
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' },
    },
}

const atRiskMembers = [
    { name: 'Sarah Makabu', lastAttendance: '2026-02-10', risk: 'High' },
    { name: 'Joel Nzambe', lastAttendance: '2026-02-18', risk: 'High' },
    { name: 'Grace Mbuyi', lastAttendance: '2026-02-24', risk: 'Medium' },
    { name: 'David Mutombo', lastAttendance: '2026-03-02', risk: 'Medium' },
    { name: 'Ruth Ilunga', lastAttendance: '2026-03-05', risk: 'Low' },
    { name: 'Patrick Nsimba', lastAttendance: '2026-03-06', risk: 'Low' },
]

const riskBadgeClass = {
    High: 'danger',
    Medium: 'warning',
    Low: 'info',
}

const MembersDashboard = () => {
    return (
        <>
            <BreadCrumb title={'Members Dashboard'} />

            <div className='row'>
                {metrics.map((metric, index) => (
                    <div className='col-md-6 col-xl-3 mb-3' key={index}>
                        <div className='card h-100'>
                            <div className='card-body'>
                                <p className='text-muted mb-1'>{metric.title}</p>
                                <h3 className='mb-1'>{metric.value}</h3>
                                <span className={`badge bg-${metric.color}`}>{metric.note}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='row'>
                <div className='col-md-12 col-xl-5 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Lifecycle Distribution</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Pie data={lifecyclePieData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className='col-md-12 col-xl-7 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Lifecycle Distribution (Count)</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Bar data={lifecycleBarData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-header'>
                            <h5 className='mb-0'>At-Risk Members</h5>
                        </div>
                        <div className='card-body'>
                            <div className='table-responsive'>
                                <table className='table table-striped table-bordered mb-0'>
                                    <thead className='bg-inverse'>
                                        <tr>
                                            <th>Name</th>
                                            <th>Last attendance</th>
                                            <th>Risk level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {atRiskMembers.map((member, index) => (
                                            <tr key={index}>
                                                <td>{member.name}</td>
                                                <td>{member.lastAttendance}</td>
                                                <td>
                                                    <span className={`badge bg-${riskBadgeClass[member.risk]}`}>
                                                        {member.risk}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MembersDashboard
