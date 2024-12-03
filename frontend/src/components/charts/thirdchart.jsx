import React, { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

const ThirdChart = ({ chart, label, chartData, ...rest }) => {
    const chartRef = useRef(null)
    const instanceRef = useRef(null)


    const data = {
        labels: label,
        datasets: [{
            label: "",
            borderColor: "rgba(255,255,255,.55)",
            borderWidth: 2,
            hitRadius: 2,
            pointHoverRadius: 3,
            pointBorderWidth: 0,
            pointHoverBorderWidth: 3,
            pointBackgroundColor: 'rgba(200,200,200,1)',
            pointBorderColor: 'rgb(0,0,0,0.5)',
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: 'rgb(0,0,0,0.1)',
            fill: true,
            backgroundColor: 'rgba(255,255,255,.1)',
            data: chartData
        }]
    }

    const options = {
        responsive: true,
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 1,
            },
            point: {
                radius: 2,
                hitRadius: 10,
                hoverRadius: 4,
                hoverBorderWidth: 3,
            },
        },
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                intersect: false,
                mode: 'nearest',
                padding: {
                    x: 10,
                    y: 10,
                },
                caretPadding: 10,
            }
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            },
        },
    }

    useEffect(() => {
        if (chartRef && chartRef.current) {
            if (instanceRef.current) {
                instanceRef.current.destroy()
            }
            const myChartRef = chartRef.current.getContext('2d')
            instanceRef.current = new Chart(myChartRef, {
                type: chart,
                data: data,
                options: options
            })
        }

        return () => {
            if (instanceRef.current) {
                instanceRef.current.destroy()
            }
        }
    }, [])



    return (
        <div {...rest}>
            <canvas ref={chartRef} ></canvas>
        </div>
    )
}

export default ThirdChart