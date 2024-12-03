import React, { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

const FirstChart = ({ chart, color, label, chartData, ...rest }) => {
    const chartRef = useRef(null)
    const instanceRef = useRef(null)


    const data = {
        labels: label,
        datasets: [{
            label: "",
            borderColor: "#fff",
            borderWidth: 1,
            hitRadius: 2,
            pointHoverRadius: 3,
            pointBorderWidth: 1,
            pointHoverBorderWidth: 1,
            pointBackgroundColor: 'rgba(200,200,200,1)',
            pointBorderColor: 'rgb(0,0,0,0.5)',
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: 'rgb(0,0,0,0.1)',
            fill: true,
            backgroundColor: color,
            data: chartData
        }]
    }

    const options = {
        title: { display: true },
        responsive: true,
        maintainAspectRatio: false,
        // aspectRatio: 1,
        plugins: {
            legend: {
                display: false,
                labels: {
                    usePointStyle: false
                }
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
                grid: false,
            },
            y: {
                display: false,
                // min: 0,
                grid: false,
                ticks: {
                    display: false,
                },
                beginAtZero: true,
            }
        },
        elements: {
            line: {
                borderWidth: 1,
                tension: 0.4,
            },
            point: {
                radius: 2,
                hitRadius: 5,
                hoverRadius: 4,
                borderColor: 2,
            },
        },
        // layout: {
        //     padding: {
        //         left: 0, right: 0, top: 5, bottom: 0
        //     },
        // }
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

export default FirstChart