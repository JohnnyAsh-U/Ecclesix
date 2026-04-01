import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from 'axios';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';
import { FormSelectWithLabel } from '../../components/Inputbox/form-select';



export function AjouterType({ fetch, modal, handleModal }) {
    const [loading, setLoading] = useState(false)

    const isWeeklyEvent = (value) => `${value}` === '1' || value === true || `${value}`.toLowerCase() === 'true'

    const normalizePayload = (values) => {
        const weekly = isWeeklyEvent(values.weekly_event)
        return {
            ...values,
            weekly_event: weekly,
            start_time: weekly ? (values.start_time || null) : null,
            end_time: weekly ? (values.end_time || null) : null,
        }
    }

    const formik = useFormik({
        initialValues: {
            event_type_name: '',
            weekly_event: 'none',
            start_time: '',
            end_time: ''
        },
        validationSchema: yup.object({
            event_type_name: yup.string().required('Ce champ est requis'),
            weekly_event: yup.string().notOneOf(['none'], 'Ce champ est requis')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/evenement/type`, normalizePayload(values) ).then(data => {
                formik.resetForm()
                handleModal()
                toast.success("Success")
                fetch()
            })
                .catch(err => {
                    handleModal()
                    toast.error("Echec")
                })
                .finally(() => setLoading(false))
        }
    })

    return (
        <Modal show={modal === 'ajouter'} onHide={() => handleModal(null)} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>
                        Ajouter Un Type Evenement
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="event_type_name" className="fw-bold col-sm-3 col-form-label">
                            Evenement
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="event_type_name" id="event_type_name" placeholder='Evenement' {...formik.getFieldProps('event_type_name')} />
                            {formik.touched.event_type_name && formik.errors.event_type_name ? (<small className='text-danger'>{formik.errors.event_type_name}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="weekly_event" className="fw-bold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="weekly_event" id="weekly_event" placeholder='Nom' {...formik.getFieldProps('weekly_event')}>
                                <option value={"none"} disabled>Type... </option>
                                <option value={1}>Culte Ordinaire</option>
                                <option value={0}>Culte/Evenement Special</option>
                            </select>
                            {formik.touched.weekly_event && formik.errors.weekly_event ? (<small className='text-danger'>{formik.errors.weekly_event}</small>) : null}
                        </div>
                    </div>

                    {isWeeklyEvent(formik.values.weekly_event) && (
                        <>
                            <div className="form-group row mb-3">
                                <label htmlFor="start_time" className="fw-bold col-sm-3 col-form-label">
                                    Heure debut
                                </label>
                                <div className="col-sm-9">
                                    <input type="time" className='form-control' name="start_time" id="start_time" {...formik.getFieldProps('start_time')} />
                                </div>
                            </div>

                            <div className="form-group row mb-3">
                                <label htmlFor="end_time" className="fw-bold col-sm-3 col-form-label">
                                    Heure fin
                                </label>
                                <div className="col-sm-9">
                                    <input type="time" className='form-control' name="end_time" id="end_time" {...formik.getFieldProps('end_time')} />
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-danger btn-outline-danger btn-sm`} onClick={() => handleModal()}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"primary"} type={"submit"} name={"Ajouter"} size='sm' />
                </Modal.Footer>
            </form>
        </Modal>
    )
}






export const ModifierType = ({ type, modal, handleModal, fetch }) => {
    const [loading, setLoading] = useState(false)

    const isWeeklyEvent = (value) => `${value}` === '1' || value === true || `${value}`.toLowerCase() === 'true'

    const normalizePayload = (values) => {
        const weekly = isWeeklyEvent(values.weekly_event)
        return {
            ...values,
            weekly_event: weekly,
            start_time: weekly ? (values.start_time || null) : null,
            end_time: weekly ? (values.end_time || null) : null,
        }
    }

    const initialValues = {
        event_type_name: type.event_type_name,
        weekly_event: type.weekly_event,
        start_time: type.start_time || '',
        end_time: type.end_time || ''
    }

    const validationSchema = yup.object({
        event_type_name: yup.string().required('Ce champ est requis'),
        weekly_event: yup.string().notOneOf(['none'], 'Ce champ est requis')
    })

    const submit = (values) => {
        setLoading(true)
        axios.put(`/evenement/type/${type.id}`, normalizePayload(values), { withCredentials: true }).then(data => {
            handleModal()
            toast.success("Success")
            fetch()
        })
            .catch(err => {
                handleModal()
                toast.error("Echec")
            }).finally(() => setLoading(false))
    }


    return (
        <Modal show={modal === 'modifier'} onHide={() => handleModal(null)} centered>
            <Modal.Header closeButton>
                <Modal.Title className='fs-5'>
                    Modification
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    {(formik) => (
                        <Form>
                            <FormInputWithLabel name={"event_type_name"} title={"Libelle"} />
                            <FormSelectWithLabel name={'weekly_event'} title={"Type"}>
                                <option value={"none"} disabled>Type... </option>
                                <option value={"1"}>Culte Ordinaire</option>
                                <option value={"0"}>Culte/Evenement Special</option>
                            </FormSelectWithLabel>

                            {isWeeklyEvent(formik.values.weekly_event) && (
                                <>
                                    <div className="form-group row mb-3">
                                        <label htmlFor="start_time" className="fw-bold col-sm-3 col-form-label">
                                            Heure debut
                                        </label>
                                        <div className="col-sm-9">
                                            <input type="time" className='form-control' name="start_time" id="start_time" {...formik.getFieldProps('start_time')} />
                                        </div>
                                    </div>

                                    <div className="form-group row mb-3">
                                        <label htmlFor="end_time" className="fw-bold col-sm-3 col-form-label">
                                            Heure fin
                                        </label>
                                        <div className="col-sm-9">
                                            <input type="time" className='form-control' name="end_time" id="end_time" {...formik.getFieldProps('end_time')} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <Modal.Footer>
                                <button type="button" className={`btn btn-danger btn-outline-danger btn-sm`} onClick={() => handleModal()}>
                                    Fermer
                                </button>
                                <LoadingButton2 loading={loading} type={"submit"} color={"primary"} name={"Modifier"} size='sm' />
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
}



export function SupprimerType({ type, modal, handleModal, fetch }) {
    const [loading, setLoading] = useState(false)


    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/evenement/type/${type.id}`)
            .then((data) => {
                handleModal()
                toast.success("Success")
                fetch()
            }).catch(err => {
                handleModal()
                toast("Echec")
            }).finally(() => setLoading(false))

    }
    return (
        <Modal show={modal === 'supprimer'} onHide={() => handleModal()} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title className='fs-5'>Supprimer Type Evenement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer ce type : {type.event_type_name} ?
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse btn-sm`} onClick={() => handleModal(null)}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"danger"} type={"submit"} name={"Supprimer"} size='sm' />
                </Modal.Footer>
            </form>
        </Modal>
    )
}








