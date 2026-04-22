import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { list_month } from '../../utils/datetime/month'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const Calendar = ({ events = [], filters = {}, navigate }) => {
    const [dateModalOpen, setDateModalOpen] = useState(false)
    const [dateEvents, setDateEvents] = useState([])
    const [dateLabel, setDateLabel] = useState('')

    const evts = events || []

    // build events map keyed by YYYY-MM-DD
    const eventsByDate = {}
    evts.forEach(ev => {
        const key = ev.event_date
        if (!eventsByDate[key]) eventsByDate[key] = []
        eventsByDate[key].push(ev)
    })

    const openDateModal = (dateStr) => {
        const items = eventsByDate[dateStr] || []
        setDateEvents(items)
        setDateLabel(dateStr)
        setDateModalOpen(true)
    }

    const month = (filters && filters.mois && filters.mois !== 'tout') ? Number(filters.mois) : new Date().getMonth()
    const year = (filters && filters.annee) ? Number(filters.annee) : new Date().getFullYear()

    const now = new Date()
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0')
    const todayDay = String(now.getDate()).padStart(2, '0')
    const todayKey = `${now.getFullYear()}-${todayMonth}-${todayDay}`

    const firstDay = new Date(year, month, 1).getDay()
    const offset = (firstDay + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const weeks = []
    let day = 1 - offset
    while (day <= daysInMonth) {
        const week = []
        for (let i = 0; i < 7; i++, day++) {
            if (day < 1 || day > daysInMonth) {
                week.push(null)
            } else {
                const monthStr = String(month + 1).padStart(2, '0')
                const dayStr = String(day).padStart(2, '0')
                const dateKey = `${year}-${monthStr}-${dayStr}`
                week.push({ day, dateKey })
            }
        }
        weeks.push(week)
    }

    return (
        <div>
           
            <table className="table table-bordered mt-3" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                    <tr>
                        <th className="text-center" style={{ width: '14.2857%' }}>Lun</th>
                        <th className="text-center" style={{ width: '14.2857%' }}>Mar</th>
                        <th className="text-center" style={{ width: '14.2857%' }}>Mer</th>
                        <th className="text-center" style={{ width: '14.2857%' }}>Jeu</th>
                        <th className="text-center" style={{ width: '14.2857%' }}>Ven</th>
                        <th className="text-center" style={{ width: '14.2857%' }}>Sam</th>
                        <th className="text-center" style={{ width: '14.2857%' }}>Dim</th>
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, wi) => (
                        <tr key={wi}>
                            {week.map((cell, ci) => (
                                        <td
                                            key={ci}
                                            className={cell && cell.dateKey === todayKey ? 'table-primary' : ''}
                                            style={{ verticalAlign: 'top', width: '14.2857%', height: 120 }}
                                        >
                                            {cell ? (
                                                <div style={{ height: '100%', overflowY: 'auto' }}>
                                                    <div className="small text-muted">{cell.day}</div>
                                                    {eventsByDate[cell.dateKey] && (
                                                        <div>
                                                            <button className="btn btn-sm btn-outline-secondary mt-1 w-100 text-truncate" onClick={(e) => { e.stopPropagation(); openDateModal(cell.dateKey) }}>
                                                                {eventsByDate[cell.dateKey].length} événements
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}
                                        </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={dateModalOpen} onHide={() => setDateModalOpen(false)} centered>
                <Modal.Header closeButton>
                        <Modal.Title>Événements le {dateLabel ? format(parseISO(dateLabel), 'PPPP', { locale: fr }) : ''}</Modal.Title>
                    </Modal.Header>
                <Modal.Body>
                    {dateEvents.length === 0 && <div className="text-muted">Aucun événement</div>}
                    {dateEvents.map(ev => {
                        return (
                            <div key={ev.id} className="d-flex justify-content-between p-2 border-bottom" style={{ cursor: 'pointer' }} onClick={() => navigate(`/evenements/${ev.id}`)}>
                                <div>
                                    <div className="fw-semibold">{ev.event_type_name} ({ev.church_name})</div>
                                    <div className="small text-muted">{ev.event_name}</div>
                                </div>
                                <div className="text-end small text-muted" style={{ minWidth: 90 }}>
                                    <div className="ms-2">
                            <span className="badge bg-primary">{ev.total}</span>
                        </div>
                                </div>
                            </div>
                        )
                    })}
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default Calendar
