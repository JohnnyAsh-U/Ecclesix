import React from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
)

const metrics = [
    { title: 'Last Service Attendance', value: '817', note: 'Sunday 09:00 service', color: 'primary' },
    { title: 'Average Attendance', value: '764', note: 'Last 12 services', color: 'success' },
    { title: 'Attendance Growth %', value: '+7.6%', note: 'Compared to previous month', color: 'info' },
]

const weeklyTrendData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    datasets: [
        {
            label: 'Weekly Attendance',
            data: [702, 718, 744, 739, 761, 772, 790, 817],
            borderColor: '#39adb5',
            backgroundColor: 'rgba(57, 173, 181, 0.18)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
        },
    ],
}

const serviceComparisonData = {
    labels: ['Sunday Service', 'Midweek Service'],
    datasets: [
        {
            label: 'Average Attendance',
            data: [802, 512],
            backgroundColor: ['#4680ff', '#ffb64d'],
            borderRadius: 5,
        },
    ],
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
    },
}

const bestAttendanceDays = [
    { day: 'Sunday', avg: 802, note: 'Highest consistency' },
    { day: 'Wednesday', avg: 512, note: 'Strong bible-study turnout' },
    { day: 'Friday', avg: 436, note: 'Prayer-focused attendance' },
]

const peakTimes = [
    { range: '08:30 - 09:15', percent: 46, badge: 'primary' },
    { range: '09:15 - 10:00', percent: 32, badge: 'info' },
    { range: '18:00 - 18:45', percent: 22, badge: 'warning' },
]

const AttendanceDashboard = () => {
    return (
        <>
            <BreadCrumb title={'Attendance Dashboard'} />

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
                            <h5 className='mb-0'>Weekly Attendance Trend</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Line data={weeklyTrendData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className='col-md-12 col-xl-5 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Service Comparison</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Bar data={serviceComparisonData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-md-12 col-xl-6 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Best Attendance Days</h5>
                        </div>
                        <div className='card-body'>
                            <div className='table-responsive'>
                                <table className='table table-striped table-bordered mb-0'>
                                    <thead className='bg-inverse'>
                                        <tr>
                                            <th>Day</th>
                                            <th>Average Attendance</th>
                                            <th>Insight</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bestAttendanceDays.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.day}</td>
                                                <td>{item.avg}</td>
                                                <td>{item.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='col-md-12 col-xl-6 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Peak Times</h5>
                        </div>
                        <div className='card-body'>
                            {peakTimes.map((item, index) => (
                                <div className='mb-3' key={index}>
                                    <div className='d-flex justify-content-between mb-1'>
                                        <strong>{item.range}</strong>
                                        <span>{item.percent}% of arrivals</span>
                                    </div>
                                    <div className='progress' style={{ height: '16px' }}>
                                        <div
                                            className={`progress-bar bg-${item.badge}`}
                                            role='progressbar'
                                            style={{ width: `${item.percent}%` }}
                                        >
                                            {item.percent}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AttendanceDashboard
