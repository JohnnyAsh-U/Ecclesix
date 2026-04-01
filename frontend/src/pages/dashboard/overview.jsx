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

const kpis = [
    { title: 'Total Members', value: '1,248', note: '+4.3% vs last month', color: 'primary' },
    { title: 'Active Members (4 weeks)', value: '932', note: '74.7% engagement', color: 'success' },
    { title: 'Attendance (last service)', value: '817', note: 'Sunday 09:00 service', color: 'info' },
    { title: 'Net Growth (this month)', value: '+38', note: '57 new / 19 lost', color: 'warning' },
    { title: 'Retention Rate', value: '89.4%', note: '-10% vs previous month', color: 'danger' },
    { title: 'At-Risk Members', value: '35', note: 'No attendance in last 6 weeks', color: 'inverse' },
]

const attendanceTrendData = {
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
        {
            label: 'Average Attendance',
            data: [690, 720, 745, 770, 758, 817],
            borderColor: '#39adb5',
            backgroundColor: 'rgba(57, 173, 181, 0.18)',
            tension: 0.35,
            fill: true,
            pointRadius: 3,
        },
    ],
}

const attendanceTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: false },
    },
}

const growthTrendData = {
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
        {
            label: 'New Members',
            data: [42, 49, 51, 58, 61, 57],
            backgroundColor: '#93be52',
        },
        {
            label: 'Lost Members',
            data: [16, 19, 20, 18, 17, 19],
            backgroundColor: '#fc6180',
        },
    ],
}

const growthTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: false },
    },
}

const alerts = [
    {
        title: '35 members at risk',
        description: 'Members with no check-in over the last 6 weeks require follow-up.',
        type: 'warning',
    },
    {
        title: 'Retention dropped 10% this month',
        description: 'Compare onboarding and follow-up cadence with the previous quarter.',
        type: 'danger',
    },
    {
        title: 'Youth department driving most growth',
        description: 'Youth accounts for 43% of this month\'s net growth.',
        type: 'success',
    },
]

const OverviewDashboard = () => {
    return (
        <>
            <BreadCrumb title={'Executive Dashboard'} />

            <div className='row'>
                {kpis.map((kpi, index) => (
                    <div className='col-md-6 col-xl-4 mb-3' key={index}>
                        <div className='card border-left border-3 h-100'>
                            <div className='card-body'>
                                <p className='text-muted mb-1'>{kpi.title}</p>
                                <h3 className='mb-1'>{kpi.value}</h3>
                                <span className={`badge bg-${kpi.color}`}>{kpi.note}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='row'>
                <div className='col-md-12 col-xl-7 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Attendance Trend (Last 6 Months)</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Line data={attendanceTrendData} options={attendanceTrendOptions} />
                        </div>
                    </div>
                </div>

                <div className='col-md-12 col-xl-5 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Growth Trend (New vs Lost)</h5>
                        </div>
                        <div className='card-body' style={{ height: '320px' }}>
                            <Bar data={growthTrendData} options={growthTrendOptions} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Alerts</h5>
                        </div>
                        <div className='card-body'>
                            {alerts.map((alert, index) => (
                                <div className={`alert alert-${alert.type} mb-2`} role='alert' key={index}>
                                    <strong>{alert.title}</strong>
                                    <div>{alert.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OverviewDashboard
