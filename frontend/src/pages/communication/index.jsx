import React, { useMemo, useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { AppGlobalContext } from '../../hooks/AppContext'
import CommunicationFilterTop from './filter-top'
import CommunicationMemberList from './list'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentSms, faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import axios from 'axios'

const defaultMessage =
    "Bonjour,\n\nNous vous contactons pour une communication importante de l'eglise.\n\nMerci et que Dieu vous benisse."

const CommunicationPage = () => {
    const { admin, permissions } = AppGlobalContext()

    const defaultFilter = {
        sexe: 'tout',
        age: 'tout',
        statut_matrimonial: 'tout',
        type_metier: 'tout',
        eglise:
            permissions.superAdmin || permissions.perms.includes('envoyer_toutes_communications')
                ? 'tout'
                : admin.church_id,
        Ministre: true,
        Ouvrier: true,
        Membre: true,
        Visiteur: true,
        baptise: true,
        non_baptise: true,
        actif: true,
        inactif: true,
    }

    const [filters, setFilters] = useState(defaultFilter)
    const [search, setSearch] = useState('')
    const [selectedMap, setSelectedMap] = useState({})
    const [channel, setChannel] = useState('email')
    const [subject, setSubject] = useState('Communication - Eglise')
    const [message, setMessage] = useState(defaultMessage)
    const [sending, setSending] = useState(false)

    const handleChange = (name, value) => {
        if (name === 'statut' || name === 'bapteme' || name === 'actif') {
            setFilters((prev) => ({ ...prev, [value]: !prev[value] }))
            return
        }
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const filterDefault = () => {
        setSearch('')
        setFilters(defaultFilter)
    }

    const selectedMembers = useMemo(() => Object.values(selectedMap), [selectedMap])
    const selectedEmails = useMemo(
        () => selectedMembers.map((member) => member.email).filter(Boolean),
        [selectedMembers]
    )
    const selectedPhones = useMemo(
        () => selectedMembers.map((member) => member.phone).filter(Boolean),
        [selectedMembers]
    )

    const sendCommunication = async () => {
        if (!message.trim()) {
            toast.warn('Ajoutez un message')
            return
        }

        if (channel === 'email') {
            if (!subject.trim()) {
                toast.warn('Ajoutez un objet pour le mail')
                return
            }
            if (selectedEmails.length === 0) {
                toast.warn('Selectionnez au moins un membre avec une adresse email')
                return
            }
        }

        if (selectedPhones.length === 0) {
            toast.warn('Selectionnez au moins un membre avec un numero de telephone')
            return
        }

        try {
            setSending(true)
            const payload = {
                channel,
                subject: channel === 'email' ? subject.trim() : '',
                message: message.trim(),
                member_ids: selectedMembers.map((member) => member.id),
            }

            const { data } = await axios.post('/communication/send', payload)
            toast.success(
                `Envoi termine. Succes: ${data.success_count || 0}, Echec: ${data.failed_count || 0}`
            )
            setSelectedMap({})
            setSubject('')
            setMessage('')
        } catch (err) {
            const apiMessage =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Echec de l'envoi de la communication"
            toast.error(apiMessage)
        } finally {
            setSending(false)
        }
    }

    const clearSelection = () => setSelectedMap({})

    return (
        <div>
            <BreadCrumb icon={<i className="icofont icofont-envelope-open"></i>} title={'Communication'}>
                <span className="text-muted small">Envoyer un email ou un SMS en masse aux membres filtres</span>
            </BreadCrumb>

            <CommunicationFilterTop
                handleChange={handleChange}
                filters={filters}
                search={search}
                handleSearchChange={setSearch}
                filterDefault={filterDefault}
            />

            <div className="row">
                <div className="col-xl-8">
                    <CommunicationMemberList
                        filters={filters}
                        search={search}
                        selectedMap={selectedMap}
                        setSelectedMap={setSelectedMap}
                    />
                </div>
                <div className="col-xl-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">
                                <FontAwesomeIcon icon={channel === 'email' ? faEnvelope : faCommentSms} />
                                {' '}
                                {channel === 'email' ? 'Composer le mail' : 'Composer le SMS'}
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Canal</label>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${channel === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setChannel('email')}
                                    >
                                        <FontAwesomeIcon icon={faEnvelope} /> Email
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${channel === 'sms' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setChannel('sms')}
                                    >
                                        <FontAwesomeIcon icon={faCommentSms} /> SMS
                                    </button>
                                </div>
                            </div>

                            {channel === 'email' && (
                            <div className="mb-2">
                                <label className="form-label">Objet</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            )}

                            <div className="mb-2">
                                <label className="form-label">Message {channel === 'sms' ? '(160 caracteres recommandes)' : ''}</label>
                                <textarea
                                    className="form-control"
                                    rows={channel === 'sms' ? '6' : '10'}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="alert alert-light border p-2 small mb-3">
                                Destinataires selectionnes: <b>{selectedMembers.length}</b>
                                <br />
                                Avec email: <b>{selectedEmails.length}</b>
                                <br />
                                Avec telephone: <b>{selectedPhones.length}</b>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                                <button type="button" className="btn btn-primary" onClick={sendCommunication} disabled={sending}>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                    {' '}
                                    {sending
                                        ? 'Envoi en cours...'
                                        : channel === 'email'
                                            ? 'Envoyer email en masse'
                                            : 'Envoyer SMS en masse'}
                                </button>
                                <button type="button" className="btn btn-outline-secondary" onClick={clearSelection}>
                                    Vider la selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommunicationPage
