import React from 'react'
import FirstChart from '../charts/firstchart'


export const WidgetA = ({ title, chartType, value, percentage, label, graphColor, cardColor, chartData }) => {

    return (
        <div className={`card card-${cardColor} total-card`}>
            <div className="card-body">
                <div className="text-left">
                    <h4>{value}</h4>
                    <p className="m-0">{title}</p>
                </div>
                <span className={`label bg-c-${cardColor} value-badges`}>{percentage}%</span>
            </div>
            <FirstChart
                chart={chartType}
                chartData={chartData}
                label={label}
                color={graphColor}
                id="total-value-graph-1"
                className="total-value-graph" />
        </div>
    )
}