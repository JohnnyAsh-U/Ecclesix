import React from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const metrics = [
    { title: 'Total Departments', value: '12', note: 'Active this quarter', color: 'primary' },
    { title: 'Most Active Department', value: 'Youth', note: '28% of new members', color: 'success' },
    { title: 'Least Active Department', value: 'Hospitality', note: '4% of new members', color: 'warning' },
]

const contributionData = {
    labels: ['Youth', 'Women', 'Men', 'Choir', 'Evangelism', 'Hospitality'],
    datasets: [
        {
            label: '% of New Members',
            data: [28, 22, 18, 14, 14, 4],
            backgroundColor: ['#4680ff', '#fc6180', '#39adb5', '#ffb64d', '#5fbeaa', '#ab7967'],
            borderRadius: 5,
        },
    ],
}

const engagementRanking = [
    { department: 'Youth', score: 94 },
    { department: 'Women', score: 89 },
    { department: 'Evangelism', score: 86 },
    { department: 'Men', score: 84 },
    { department: 'Choir', score: 79 },
    { department: 'Hospitality', score: 62 },
]

const engagementData = {
    labels: engagementRanking.map((item) => item.department),
    datasets: [
        {
            label: 'Engagement Score',
            data: engagementRanking.map((item) => item.score),
            backgroundColor: '#93be52',
            borderRadius: 5,
        },
    ],
}

const leaderPerformance = [
    { leader: 'Pastor Kalala', department: 'Youth', members: 210, retention: 92, growth: 14 },
    { leader: 'Mama Esther', department: 'Women', members: 178, retention: 90, growth: 11 },
    { leader: 'Deacon Joel', department: 'Men', members: 160, retention: 85, growth: 8 },
    { leader: 'Sister Ruth', department: 'Choir', members: 120, retention: 83, growth: 6 },
    { leader: 'Brother Alain', department: 'Hospitality', members: 88, retention: 74, growth: 3 },
]

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
    },
}

const DepartmentsDashboard = () => {
    return (
        <>
            <BreadCrumb title={'Departments Dashboard'} />

            <div className='row'>
                {metrics.map((metric, index) => (
                    <div className='col-md-12 col-xl-4 mb-3' key={index}>
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
                <div className='col-md-12 col-xl-7 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Contribution to Growth</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Bar data={contributionData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className='col-md-12 col-xl-5 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Engagement Score Ranking</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Doughnut data={engagementData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Leader Performance</h5>
                        </div>
                        <div className='card-body'>
                            <div className='table-responsive'>
                                <table className='table table-striped table-bordered mb-0'>
                                    <thead className='bg-inverse'>
                                        <tr>
                                            <th>Leader</th>
                                            <th>Department</th>
                                            <th>Members Under Leader</th>
                                            <th>Retention %</th>
                                            <th>Growth %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderPerformance.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.leader}</td>
                                                <td>{item.department}</td>
                                                <td>{item.members}</td>
                                                <td>{item.retention}%</td>
                                                <td>{item.growth}%</td>
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

export default DepartmentsDashboard
