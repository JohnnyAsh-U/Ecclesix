import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faMobileAlt, faRotateRight, faTrash } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

import { LoadingData } from '../../components/Loading/loading'
import useFetch from '../../hooks/fetchHook'
import './style.css'

const formatDateTime = (value) => {
    if (!value) return '-'

    return new Date(value).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const Devices = () => {
    const { loading, data, error, reload } = useFetch('/device', 'get')
    const devices = useMemo(() => Array.isArray(data) ? data : [], [data])
    const [selectedId, setSelectedId] = useState(null)
    const [busyAction, setBusyAction] = useState(false)

    useEffect(() => {
        if (!devices.length) {
            setSelectedId(null)
            return
        }

        const currentExists = devices.some(device => device.id === selectedId)
        if (!currentExists) {
            setSelectedId(devices[0].id)
        }
    }, [devices, selectedId])

    const selectedDevice = devices.find(device => device.id === selectedId) || null

    const handleActivate = async () => {
        if (!selectedDevice || selectedDevice.is_registered) return

        try {
            setBusyAction(true)
            await axios.patch(`/device/${selectedDevice.id}`)
            toast.success('Appareil activé avec succès')
            reload()
        } catch (err) {
            toast.error("Impossible d'activer l'appareil")
        } finally {
            setBusyAction(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedDevice) return

        const confirmDelete = window.confirm(`Supprimer l'appareil ${selectedDevice.identifier} ?`)
        if (!confirmDelete) return

        try {
            setBusyAction(true)
            await axios.delete(`/device/${selectedDevice.id}`)
            toast.success('Appareil supprimé avec succès')
            reload()
        } catch (err) {
            toast.error("Impossible de supprimer l'appareil")
        } finally {
            setBusyAction(false)
        }
    }

    if (error) {
        toast.error('Impossible de charger les appareils')
        return
    }

    return (
        <div className='card mb-0' style={{ minHeight: '73vh' }}>
            <div className='card-header'>
                <h5 className='card-header-left'>
                    <FontAwesomeIcon icon={faMobileAlt} className='me-1' />
                    Les appareils
                </h5>
                <div className='card-header-right'>
                    <button
                        className='btn btn-round hor-grd btn-grd-primary btn-primary btn-sm'
                        disabled={loading || busyAction}
                        onClick={reload}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </div>

            <div className='card-body position-relative'>
                {loading && <LoadingData />}

                <div className='row g-3'>
                    <div className='col-lg-5'>
                        <div className='list-group'>
                            {!loading && !devices.length && (
                                <div className='alert alert-info mb-0'>
                                    Aucun appareil enregistré.
                                </div>
                            )}

                            {devices.map((device) => (
                                <button
                                    key={device.id}
                                    type='button'
                                    className={`list-group-item list-group-item-action text-start ${selectedId === device.id ? 'active' : ''}`}
                                    onClick={() => setSelectedId(device.id)}>
                                    <div className='d-flex justify-content-between align-items-start gap-2'>
                                        <div>
                                            <div className='fw-semibold'>{device.identifier}</div>
                                            <small className={selectedId === device.id ? 'text-white' : 'text-muted'}>
                                                {device.brand_name} {device.model_name}
                                            </small>
                                        </div>
                                        <span className={`badge ${device.is_registered ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {device.is_registered ? 'Actif' : 'En attente'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='col-lg-7'>
                        <div className='border rounded p-3 h-100 bg-light-subtle'>
                            {!selectedDevice ? (
                                <div className='text-muted'>Sélectionnez un appareil pour voir ses détails.</div>
                            ) : (
                                <>
                                    <div className='d-flex justify-content-between align-items-start gap-2 mb-3'>
                                        <div>
                                            <h5 className='mb-1'>{selectedDevice.device_name || selectedDevice.identifier}</h5>
                                            <div className='text-muted small'>{selectedDevice.identifier}</div>
                                        </div>
                                        <span className={`badge ${selectedDevice.is_registered ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {selectedDevice.is_registered ? 'Enregistré' : 'Non enregistré'}
                                        </span>
                                    </div>

                                    <div className='row small'>
                                        <div className='col-sm-6 mb-3'>
                                            <div className='text-muted'>Marque</div>
                                            <div className='fw-semibold'>{selectedDevice.brand_name || '-'}</div>
                                        </div>
                                        <div className='col-sm-6 mb-3'>
                                            <div className='text-muted'>Modèle</div>
                                            <div className='fw-semibold'>{selectedDevice.model_name || '-'}</div>
                                        </div>
                                        <div className='col-sm-6 mb-3'>
                                            <div className='text-muted'>Version de l’application</div>
                                            <div className='fw-semibold'>{selectedDevice.app_version || '-'}</div>
                                        </div>
                                        <div className='col-sm-6 mb-3'>
                                            <div className='text-muted'>Statut</div>
                                            <div className='fw-semibold'>
                                                {selectedDevice.is_active ? 'Disponible' : 'Désactivé'}
                                            </div>
                                        </div>
                                        <div className='col-sm-6 mb-3'>
                                            <div className='text-muted'>Créé le</div>
                                            <div className='fw-semibold'>{formatDateTime(selectedDevice.created_at)}</div>
                                        </div>
                                        <div className='col-sm-6 mb-3'>
                                            <div className='text-muted'>Mis à jour le</div>
                                            <div className='fw-semibold'>{formatDateTime(selectedDevice.updated_at)}</div>
                                        </div>
                                    </div>

                                    <div className='d-flex flex-wrap gap-2 mt-2'>
                                        {!selectedDevice.is_registered ? (
                                            <button
                                                className='btn btn-primary btn-sm'
                                                disabled={busyAction}
                                                onClick={handleActivate}>
                                                <FontAwesomeIcon icon={faCheckCircle} className='me-1' />
                                                Activer l’appareil
                                            </button>
                                        ) : (
                                            <button className='btn btn-outline-success btn-sm' disabled>
                                                <FontAwesomeIcon icon={faCheckCircle} className='me-1' />
                                                Appareil déjà activé
                                            </button>
                                        )}

                                        <button
                                            className='btn btn-outline-danger btn-sm'
                                            disabled={busyAction}
                                            onClick={handleDelete}>
                                            <FontAwesomeIcon icon={faTrash} className='me-1' />
                                            Supprimer
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Devices
