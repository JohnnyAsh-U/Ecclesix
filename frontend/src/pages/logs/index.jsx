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
    const { loading, data, error, reload } = useFetch(`/admin/logs`, 'get')
    const logs = data || {}
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

    const DayLogs = active === 'tout' ? logs : logs.filter(log => log.date_time == active)

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
                                    <li className={`list-group-item list-group-item-action ${active == log.date_time ? "active" : ""}`}
                                        key={log.date_time}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setActive(log.date_time)}>
                                        {LogDay(log.date_time)}
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
                                    <h6 className="mb-0">{LogDay(logs_by_date.date_time)}</h6>
                                </div>
                            </div>
                            <div className='card-body mt-2'>
                                <div className="card-body pt-1 border-end">
                                    {logs_by_date.logs && logs_by_date.logs.map((log, index) =>
                                        <div className="card-notification" key={index} onClick={() => setViewAdminLog(viewAdminLog === log.id ? null : log.id)}>
                                            <div className="card-noti-conatin m-b-20">
                                                <small> {timeFormat(new Date(log.action_time))}</small>
                                                <div className="text-">{LogPhrase(log)}
                                                    {log.log_type === 'UPDATE' && <FontAwesomeIcon className='ms-2' cursor={'pointer'} icon={faCaretDown} />}
                                                    {log.log_type === 'UPDATE' && viewAdminLog === log.id &&
                                                        <div className=''>
                                                            <pre>
                                                                <strong>
                                                                    {JSON.stringify(log.detail.changes, null, 1)}
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