import React from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
)

const funnelStages = [
    { label: 'Visitors', value: 1200, conversion: '100%', color: '#5fbeaa' },
    { label: '2nd Visit', value: 640, conversion: '53.3%', color: '#39adb5' },
    { label: 'Active', value: 402, conversion: '62.8%', color: '#4680ff' },
    { label: 'Members', value: 238, conversion: '59.2%', color: '#93be52' },
]

const metrics = [
    { title: 'Visitor -> Member Conversion', value: '19.8%', note: '238 of 1200 visitors' },
    { title: 'Net Growth Rate', value: '+3.4%', note: 'This month' },
    { title: 'New Members', value: '57', note: 'This month' },
    { title: 'Lost Members', value: '19', note: 'This month' },
]

const dropOffBarData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5+'],
    datasets: [
        {
            label: 'Drop-off Members',
            data: [168, 105, 64, 39, 26],
            backgroundColor: ['#fc6180', '#ffb64d', '#ffda79', '#39adb5', '#4680ff'],
            borderRadius: 4,
        },
    ],
}

const dropOffLineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5+'],
    datasets: [
        {
            label: 'Drop-off %',
            data: [42, 26, 16, 10, 6],
            borderColor: '#fc6180',
            backgroundColor: 'rgba(252, 97, 128, 0.18)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
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

const GrowthDashboard = () => {
    const maxStageValue = funnelStages[0].value

    return (
        <>
            <BreadCrumb title={'Growth Dashboard'} />

            <div className='row'>
                <div className='col-md-12 col-xl-7 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Conversion Funnel</h5>
                        </div>
                        <div className='card-body'>
                            {funnelStages.map((stage, index) => {
                                const width = (stage.value / maxStageValue) * 100
                                return (
                                    <div key={index} className='mb-3'>
                                        <div className='d-flex justify-content-between mb-1'>
                                            <strong>{stage.label}</strong>
                                            <span>
                                                {stage.value} ({stage.conversion})
                                            </span>
                                        </div>
                                        <div className='progress' style={{ height: '18px' }}>
                                            <div
                                                className='progress-bar'
                                                role='progressbar'
                                                style={{ width: `${width}%`, backgroundColor: stage.color }}
                                            >
                                                {stage.conversion}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className='col-md-12 col-xl-5 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Key Metrics</h5>
                        </div>
                        <div className='card-body'>
                            <div className='row'>
                                {metrics.map((metric, index) => (
                                    <div className='col-12 mb-3' key={index}>
                                        <div className='border rounded p-3'>
                                            <div className='text-muted'>{metric.title}</div>
                                            <h4 className='mb-1'>{metric.value}</h4>
                                            <small>{metric.note}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-md-12 col-xl-7 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Drop-off Chart (Where People Leave)</h5>
                        </div>
                        <div className='card-body' style={{ height: '300px' }}>
                            <Bar data={dropOffBarData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className='col-md-12 col-xl-5 mb-3'>
                    <div className='card h-100'>
                        <div className='card-header'>
                            <h5 className='mb-0'>Drop-off Rate Trend</h5>
                        </div>
                        <div className='card-body' style={{ height: '300px' }}>
                            <Line data={dropOffLineData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default GrowthDashboard
