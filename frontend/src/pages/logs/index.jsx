import React, { useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faClipboardList } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import { LoadingPage } from '../../components/Loading/loading'
import useFetch from '../../hooks/fetchHook'
import { LogPhrase } from '../../utils/logs/logs'
import { formatDate } from '../../utils/datetime/formatdate'
import { timeFormat } from '../../utils/datetime/formattime'

const Logs = () => {
    const { loading, data, error, reload } = useFetch(`/log`, 'get')
    const { logByDate: logs } = data || {}
    const [viewAdminLog, setViewAdminLog] = useState(null)
    const [active, setActive] = useState('tout')

    const LogDay = (date) => {
        let today = new Date()
        if (date) {
            let [year, month, day] = date.split('-')
            if (today.getDate() == day && today.getMonth() + 1 == month && today.getFullYear() == year) {
                return "Aujourd'hui"
            } else if (today.getDate() - 1 == day && today.getMonth() + 1 == month && today.getFullYear() == year) {
                return "Hier"
            } else {
                return formatDate(date)
            }
        }
    }

    if (error) {
        toast.error('Impossible de charger les donnees')
        return
    }

    if (loading) {
        return <LoadingPage />
    }

    const DayLogs = active === 'tout' ? logs : logs.filter(log => log.time_date == active)

    return (
        <div>
            <BreadCrumb icon={<FontAwesomeIcon icon={faClipboardList} />} title={"Logs"} />
            <div className="row">
                <div className="col-sm-3">
                    <div className="card">
                        <div className="card-header">
                            <h5 className='card-header-title'>Filtre Par Jour</h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                <li
                                    className={`list-group-item list-group-item-action ${active === 'tout' ? "active" : ""}`}
                                    onClick={() => setActive('tout')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Tout</li>
                                {logs.map((log) =>
                                    <li className={`list-group-item list-group-item-action ${active == log.time_date ? "active" : ""}`}
                                        key={log.time_date}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setActive(log.time_date)}>
                                        {LogDay(log.time_date)}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-sm-9">
                    {DayLogs && DayLogs.map((logs_by_date, id) =>
                        <div className="card" key={id}>
                            <div className="card-header py-3" style={{ backgroundColor: '#cbd5e1' }}>
                                <div className='card-header-title'>
                                    <h6 className="mb-0">{LogDay(logs_by_date.time_date)}</h6>
                                </div>
                            </div>
                            <div className='card-body mt-2'>
                                <div className="card-body pt-1 border-end">
                                    {logs_by_date.log && logs_by_date.log.map((log, index) =>
                                        <div className="card-notification" key={index} onClick={() => setViewAdminLog(viewAdminLog === log.id_log ? null : log.id_log)}>
                                            <div className="card-noti-conatin m-b-20">
                                                <small> {timeFormat(new Date(log.time_of_action))}</small>
                                                <div className="text-">{LogPhrase(log)}
                                                    {log.type_log === 'UPDATE' && <FontAwesomeIcon className='ms-2' cursor={'pointer'} icon={faCaretDown} />}
                                                    {log.type_log === 'UPDATE' && viewAdminLog === log.id_log &&
                                                        <div className=''>
                                                            <pre>
                                                                <strong>
                                                                    {JSON.stringify(log.details.changes, null, 1)}
                                                                </strong>
                                                            </pre>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Logs