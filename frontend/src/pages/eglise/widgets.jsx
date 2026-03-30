import React from 'react'
import WidgetC from '../../components/widgets/widgetC'
import { faCalendar, faCalendarCheck, faUserGroup } from '@fortawesome/free-solid-svg-icons'

const Widgets = ({ members, totalMembers, events, totalEvents, attendance }) => {
    return (
        <div className="row">
            <div className="col-xl-4 col-md-4 col-sm-6">
                <WidgetC
                    title={"Membres"}
                    value={totalMembers}
                    chartData={members.map(element => element.count)}
                    chartLabel={members.map(element => element.month)}
                    icon={faUserGroup}
                    color={"#3b5998"} />
            </div>

            <div className="col-xl-4 col-md-4 col-sm-6">
                <WidgetC
                    title={"Evenement"}
                    value={totalEvents}
                    chartData={events.map(element => element.count)}
                    chartLabel={events.map(element => element.month)}
                    icon={faCalendar}
                    color={"#F9B115"} />
            </div>

            <div className="col-xl-4 col-md-4 col-sm-6">
                <WidgetC
                    title={"Participation(Ce Mois)"}
                    value={attendance[5]?.count}
                    chartData={attendance.map(element => element.count)}
                    chartLabel={attendance.map(element => element.month)}
                    icon={faCalendarCheck}
                    color={"#00aced"} />
            </div>
        </div>
    )
}

export default Widgets