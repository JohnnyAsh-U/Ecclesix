import React from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const metrics = [
    { title: 'Total Branches', value: '8', note: 'Multi-site active branches', color: 'primary' },
    { title: 'Best Performing Branch', value: 'Kinshasa Central', note: 'Top growth and retention', color: 'success' },
    { title: 'Lowest Performing Branch', value: 'Matadi East', note: 'Needs targeted support', color: 'warning' },
]

const branches = ['Kinshasa Central', 'Goma North', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Kolwezi', 'Bukavu', 'Matadi East']

const growthPerBranchData = {
    labels: branches,
    datasets: [
        {
            label: 'Growth %',
            data: [18, 14, 13, 11, 9, 8, 7, 4],
            backgroundColor: '#4680ff',
            borderRadius: 5,
        },
    ],
}

const attendancePerBranchData = {
    labels: branches,
    datasets: [
        {
            label: 'Average Attendance',
            data: [820, 610, 575, 520, 468, 442, 409, 298],
            backgroundColor: '#39adb5',
            borderRadius: 5,
        },
    ],
}

const rankingRows = [
    { branch: 'Kinshasa Central', growth: '18%', retention: '93%', attendance: 820 },
    { branch: 'Goma North', growth: '14%', retention: '89%', attendance: 610 },
    { branch: 'Lubumbashi', growth: '13%', retention: '88%', attendance: 575 },
    { branch: 'Mbuji-Mayi', growth: '11%', retention: '86%', attendance: 520 },
    { branch: 'Kisangani', growth: '9%', retention: '84%', attendance: 468 },
    { branch: 'Kolwezi', growth: '8%', retention: '83%', attendance: 442 },
    { branch: 'Bukavu', growth: '7%', retention: '81%', attendance: 409 },
    { branch: 'Matadi East', growth: '4%', retention: '76%', attendance: 298 },
]

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
    },
}

const BranchesDashboard = () => {
    return (
        <>
            <BreadCrumb title={'Branches Dashboard'} />

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
                <div className='col-md-12 col-xl-6 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Growth per Branch</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Bar data={growthPerBranchData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className='col-md-12 col-xl-6 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Attendance per Branch</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Bar data={attendancePerBranchData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Ranking Table</h5>
                        </div>
                        <div className='card-body'>
                            <div className='table-responsive'>
                                <table className='table table-striped table-bordered mb-0'>
                                    <thead className='bg-inverse'>
                                        <tr>
                                            <th>Branch</th>
                                            <th>Growth</th>
                                            <th>Retention</th>
                                            <th>Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankingRows.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.branch}</td>
                                                <td>{row.growth}</td>
                                                <td>{row.retention}</td>
                                                <td>{row.attendance}</td>
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

export default BranchesDashboard
