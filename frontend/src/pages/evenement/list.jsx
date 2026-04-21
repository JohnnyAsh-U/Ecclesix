import React, { useEffect, useState } from 'react'
import Pagination from '../../components/pagination/pagination'
import { LoadingData } from '../../components/Loading/loading'
import { formatDate, list_month } from '../../utils/datetime/month'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useFetch from '../../hooks/fetchHook'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faEllipsisVertical, faPencil, faTrash, faClipboardList } from '@fortawesome/free-solid-svg-icons'
import { AppGlobalContext } from '../../hooks/AppContext'
import Dropdown from 'react-bootstrap/Dropdown'
import Modal from 'react-bootstrap/Modal'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { ModifierModal, SupprimerModal } from './modals'


const List = ({ filters, modal, handleModal,setModal, listetype }) => {
    const { admin, permissions, eglises, appConfig } = AppGlobalContext()
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [modifierEvenement, setModifierEvenement] = useState({})
    const [supprimerEvenement, setSupprimerEvenement] = useState({})
    const [attendanceModal, setAttendanceModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [attendancePage, setAttendancePage] = useState(1)
    const [attendanceLoading, setAttendanceLoading] = useState(false)
    const [attendanceList, setAttendanceList] = useState([])
    const [attendanceTotalPages, setAttendanceTotalPages] = useState(1)
    const [attendanceTotal, setAttendanceTotal] = useState(0)

    const query = new URLSearchParams({
        page,
        limit: 15,
        ...filters,
    }).toString()
    const { loading, data, error, reload } = useFetch(`/evenement?${query}`, 'get')
    const { list: evenements, total_pages: totalPages, total_events: totalEvents } = data || {}

    const handlePageChange = async (num) => {
        setPage(num)
    }

    const handleAttendancePageChange = (num) => {
        setAttendancePage(num)
    }

    const openAttendanceModal = (evenement) => {
        setSelectedEvent(evenement)
        setAttendancePage(1)
        setAttendanceModal(true)
    }

    const closeAttendanceModal = () => {
        setAttendanceModal(false)
        setSelectedEvent(null)
        setAttendanceList([])
        setAttendanceTotalPages(1)
        setAttendanceTotal(0)
    }

    const diffInDaysFromNow = (date) => {
        if (!date) return;
        let b = new Date(date)
        let n = new Date()
        return parseInt((n - b) / (1000 * 60 * 60 * 24))
    }


    useEffect(() => {
        setPage(1)
    }, [filters])

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!attendanceModal || !selectedEvent?.id) {
                return
            }

            setAttendanceLoading(true)
            try {
                const { data } = await axios.get(
                    `/evenement/${selectedEvent.id}/attendance?page=${attendancePage}&limit=10`
                )
                setAttendanceList(data.list || [])
                setAttendanceTotalPages(data.total_pages || 1)
                setAttendanceTotal(data.total_attendance || 0)
            } catch (err) {
                toast.error('Impossible de charger la liste des presences')
            } finally {
                setAttendanceLoading(false)
            }
        }

        fetchAttendance()
    }, [attendanceModal, selectedEvent, attendancePage])


    if (error) {
        toast.error('Impossible de charger les donnees')
        return
    }


    return (
        <div className="card mb-0" >
            <div className="card-header border-bottom py-3" style={{ backgroundColor: '#cbd5e1' }}>
                <h5><FontAwesomeIcon icon={faCalendar} className='mx-1' />
                    {filters.mois == 'tout' ? filters.annee : list_month[filters.mois] + " " + filters.annee}
                </h5>
            </div>
            <div className="card-body marketing-card" style={{ height: '57vh', overflowY: 'auto' }}>
                {loading && <LoadingData />}
                {!loading && evenements.length == 0 &&
                    <div className='position-absolute end-50 top-25 fw-semibold fs-6 mt-5 ms-5'>
                        Aucune Evenement
                    </div>
                }
                <div className="table-responsive mt-2">
                    <table className="table table-hover table-bordered">
                        <thead className='bg-inverse'>
                            <tr className='bg-inverse'>
                                <th>Evenement</th>
                                <th>Date</th>
                                <th>Eglise</th>
                                <th>Hommes</th>
                                <th>Femmes</th>
                                <th>Enfants</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && evenements.length > 0 && evenements.map((evenement, index) => (
                                <tr key={index} onClick={() => openAttendanceModal(evenement)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        {evenement.event_type_name}
                                        {evenement.event_name && <><br /> <span className="p-1 fw-normal small">{evenement.event_name}</span></>}
                                    </td>

                                    <td >
                                        {formatDate(evenement.event_date)}
                                    </td>

                                    <td >
                                        {evenement.church_name}
                                    </td>

                                    <td>
                                        {evenement.men}
                                    </td>

                                    <td>
                                        {evenement.women}
                                    </td>

                                    <td >
                                        {evenement.children}
                                    </td>
                                    <td >
                                        {evenement.total}
                                    </td>

                                    <td onClick={(e) => e.stopPropagation()}>
                                        {diffInDaysFromNow(evenement.event_date) <= 7 &&
                                            <ContentPermsWrapper requiredPerms={['modifier_evenement', 'supprimer_evenement']}>
                                                {/* Checks if the admin is superadin or the event belong to the admin church events  */}
                                                {(permissions.superAdmin || evenement.church == admin.church_id)
                                                    &&
                                                    <Dropdown direction="dropend" className="m-0">
                                                        <Dropdown.Toggle variant='link' className='btn  btn-outline-default py-0 rounded' as={"button"}>
                                                            <FontAwesomeIcon icon={faEllipsisVertical} />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <ContentPermsWrapper requiredPerms={['modifier_evenement']}>
                                                                <Dropdown.Item onClick={() => { setModifierEvenement(evenement); setModal('modifier-evenement') }} >
                                                                    <FontAwesomeIcon icon={faPencil} /> Modifier
                                                                </Dropdown.Item>
                                                            </ContentPermsWrapper>
                                                            {diffInDaysFromNow(evenement.event_date) === 0 &&
                                                                <ContentPermsWrapper requiredPerms={['ajouter_evenement']}>
                                                                    <Dropdown.Item onClick={() => navigate(`/attendance/${evenement.id}`)} >
                                                                        <FontAwesomeIcon icon={faClipboardList} /> Marquer Presence
                                                                    </Dropdown.Item>
                                                                </ContentPermsWrapper>
                                                            }
                                                            <ContentPermsWrapper requiredPerms={['supprimer_evenement']}>
                                                                <Dropdown.Item onClick={() => { setSupprimerEvenement(evenement); setModal('supprimer-evenement') }}>
                                                                    <FontAwesomeIcon icon={faTrash} /> Supprimer
                                                                </Dropdown.Item>
                                                            </ContentPermsWrapper>
                                                        </Dropdown.Menu>
                                                    </Dropdown>}
                                            </ContentPermsWrapper>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='card-footer'>
                <div className="d-flex justify-content-between align-items-center">
                    <div className='fs-6 fw-semibold '>
                        {totalEvents} Evenements
                    </div>
                    {totalEvents > 0 &&
                        <Pagination
                            handler={handlePageChange}
                            totalPages={totalPages}
                            currentPage={page}
                        />}
                </div>
            </div>
            <ModifierModal
                evenement={modifierEvenement}
                modal={modal}
                handleModal={handleModal}
                fetch={reload}
                listetype={listetype}
            />

            <SupprimerModal
                modal={modal}
                evenement={supprimerEvenement}
                setModal={setModal}
                fetch={reload}
                listetype={listetype}
            />

            <Modal show={attendanceModal} onHide={closeAttendanceModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Liste Des Presences
                        {selectedEvent && (
                            <div className='text-muted mt-1 fw-normal' style={{ fontSize: '12px' }}>
                                {selectedEvent.event_type_name} - {formatDate(selectedEvent.event_date)}
                            </div>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {attendanceLoading && <LoadingData />}

                    {!attendanceLoading && attendanceList.length === 0 && (
                        <div className='text-center py-3'>Aucune presence</div>
                    )}

                    {!attendanceLoading && attendanceList.length > 0 && (
                        <div className='table-responsive'>
                            <table className='table table-hover table-bordered mb-0'>
                                <thead className='bg-inverse'>
                                    <tr>
                                        <th>Nom Complet</th>
                                        <th>Heure Arrivee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceList.map((attendance) => (
                                        <tr key={attendance.id}>
                                            <td>{attendance.full_name}</td>
                                            <td>{attendance.time || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-between align-items-center'>
                    <div className='fs-6 fw-semibold'>{attendanceTotal} Presences</div>
                    {attendanceTotal > 0 && (
                        <Pagination
                            handler={handleAttendancePageChange}
                            totalPages={attendanceTotalPages}
                            currentPage={attendancePage}
                        />
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default List