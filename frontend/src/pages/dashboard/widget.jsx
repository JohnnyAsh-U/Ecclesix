import React from 'react'
import { WidgetA } from '../../components/widgets/firstWidgets'

const Widgets = ({ data }) => {
    let lastmembercount = data.SixMonthsMembersCount[5].count
    let lastchurchcount = data.SixYearsChurchCount[5].count
    let lastministercount = data.SixMonthsMinistersCount[5].count
    let lasteventcount = data.SixMonthsEventCount[5].count


    const percentageIncrease = (fifthValue, sixthValue) => {
        let diff = sixthValue - fifthValue
        return (parseFloat(diff / sixthValue) * 100).toFixed(1)
    }

    return (
        <>
            <div className="col-md-6 col-xl-3">
                <WidgetA
                    title={'Membres'}
                    percentage={percentageIncrease(data.SixMonthsMembersCount[4].count, lastmembercount)}
                    label={data.SixMonthsMembersCount.map(d=>d.month)}
                    value={lastmembercount}
                    chartData={data.SixMonthsMembersCount.map(d=>d.count)}
                    cardColor={'blue'}
                    graphColor={'#3a73f1'}
                    chartType={'line'}
                />
            </div>
            <div className="col-md-6 col-xl-3">
                <WidgetA
                    title={'Eglises'}
                    value={lastchurchcount}
                    percentage={percentageIncrease(data.SixYearsChurchCount[4].count, lastchurchcount)}
                    label={data.SixYearsChurchCount.map(d=>d.years)}
                    chartData={data.SixYearsChurchCount.map(d=>d.count)}
                    graphColor={'#e55571'}
                    cardColor={'pink'}
                    chartType={'line'}
                />
            </div>
            <div className="col-md-6 col-xl-3">
                <WidgetA
                    title={'Ministres'}
                    percentage={percentageIncrease(data.SixMonthsMinistersCount[4].count, lastministercount)}
                    value={lastministercount}
                    label={data.SixMonthsMinistersCount.map(d=>d.month)}
                    chartData={data.SixMonthsMinistersCount.map(d=>d.count)}
                    graphColor={'#83a84c'}
                    cardColor={'green'} 
                    chartType={'line'}/>
            </div>
            <div className="col-md-6 col-xl-3">
                <WidgetA
                    title={'Evenements'}
                    percentage={((lasteventcount / (data.totalEvents-lasteventcount))*100).toFixed(1)}
                    value={lasteventcount}
                    label={data.SixMonthsEventCount.map(d=>d.month)}
                    chartData={data.SixMonthsEventCount.map(d=>d.count)}
                    graphColor={'#E99F36'}
                    cardColor={'yellow'}
                    chartType={'bar'}
                    />
            </div>
        </>
    )
}

export default Widgets