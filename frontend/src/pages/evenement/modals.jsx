import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from 'axios';
import * as yup from 'yup';
import { AppGlobalContext } from '../../hooks/AppContext';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';
import { FormSelectWithLabel } from '../../components/Inputbox/form-select';
import { formatDate } from '../../utils/datetime/month';




export default function AjouterModal({ fetch, listetype, modal, handleModal }) {
    const { permissions, admin, eglises } = AppGlobalContext()
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            id_type_evenement: 0,
            lib_evenement: '',
            id_eglise: admin.id_eglise,
            date_evenement: '',
            hommes: 0,
            femmes: 0,
            enfants: 0,
        },
        validationSchema: yup.object({
            // id_type_evenement: yup.string().required('Ce champ est requis'),
            id_type_evenement: yup.string().notOneOf(['0'], 'Ce Champ est requis'),
            lib_evenement: yup.string().notRequired('Ce champ est requis'),
            date_evenement: yup.string().required('Ce champ est requis'),
            id_eglise: yup.string().required('Ce champ est requis'),
        }),
        onSubmit: form => {
            setLoading(true)
            axios.post(`/evenement`, { form }).then(data => {
                toast.success("Success")
                formik.resetForm()
                handleModal(null)
                fetch()
                setLoading(false)
            }).catch(err => {
                toast.error("Echec")
                handleModal(null);
                setLoading(false)
            })
        }
    })



    return (
        <Modal show={modal === 'ajouter-evenement'} onHide={() => handleModal(null)} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Ajouter Un Evenement
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="id_type_departement" className="fw-bold col-sm-3 col-form-label">
                            Evenement
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="id_type_evenement" id="id_type_evenement" placeholder='Evenement' {...formik.getFieldProps('id_type_evenement')}>
                                <option value={0} disabled>Eglise </option>
                                {listetype.map((type) =>
                                    <option key={type.id_type_evenement} value={type.id_type_evenement}>{type.lib_type_evenement}</option>
                                )}
                            </select>
                            {formik.touched.id_type_evenement && formik.errors.id_type_evenement ? (<small className='text-danger'>{formik.errors.id_type_evenement}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="lib_evenement" className="fw-bold col-sm-3 col-form-label">
                            Details
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="lib_evenement" id="lib_evenement" placeholder='Detail' {...formik.getFieldProps('lib_evenement')} />
                            {formik.touched.lib_evenement && formik.errors.lib_evenement ? (<small className='text-danger'>{formik.errors.lib_evenement}</small>) : null}
                        </div>
                    </div>

                    {permissions.superAdmin &&
                        <div className="form-group row mb-3">
                            <label htmlFor="id_eglise" className="fw-bold col-sm-3 col-form-label">
                                Eglise
                            </label>
                            <div className="col-sm-9">
                                <select type="text" className='form-control form-select' name="id_eglise" id="id_eglise" placeholder='Eglise' {...formik.getFieldProps('id_eglise')}>
                                    <option value={0} disabled>Eglise </option>
                                    {eglises.map((eglise) =>
                                        <option key={eglise.id_eglise} value={eglise.id_eglise}>{eglise.lib_eglise}</option>
                                    )}
                                </select>
                                {formik.touched.id_eglise && formik.errors.id_eglise ? (<small className='text-danger'>{formik.errors.id_eglise}</small>) : null}
                            </div>
                        </div>
                    }

                    <div className="form-group row mb-3">
                        <label htmlFor="date_evenement" className="fw-bold col-sm-3 col-form-label">
                            Date
                        </label>
                        <div className="col-sm-9">
                            <input type="date" className='form-control' name="date_evenement" id="date_evenement" placeholder='Date' {...formik.getFieldProps('date_evenement')} />
                            {formik.touched.date_evenement && formik.errors.date_evenement ? (<small className='text-danger'>{formik.errors.date_evenement}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="hommes" className="fw-bold col-sm-3 col-form-label">
                            Hommes
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="hommes" id="hommes" placeholder='hommes' {...formik.getFieldProps('hommes')} />
                            {formik.touched.hommes && formik.errors.hommes ? (<small className='text-danger'>{formik.errors.hommes}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="femmes" className="fw-bold col-sm-3 col-form-label">
                            Femmes
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="femmes" id="femmes" placeholder='femmes' {...formik.getFieldProps('femmes')} />
                            {formik.touched.femmes && formik.errors.femmes ? (<small className='text-danger'>{formik.errors.femmes}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="enfants" className="fw-bold col-sm-3 col-form-label">
                            Enfants
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="enfants" id="enfants" placeholder='enfants' {...formik.getFieldProps('enfants')} />
                            {formik.touched.enfants && formik.errors.enfants ? (<small className='text-danger'>{formik.errors.enfants}</small>) : null}
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-danger btn-outline-danger`} onClick={() => handleClose()}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"primary"} name={"Ajouter"} />
                </Modal.Footer>
            </form>
        </Modal>
    )
}



export const ModifierModal = ({ evenement, modal, fetch, handleModal, listetype }) => {
    const { permissions, admin, eglises } = AppGlobalContext()
    const [loading, setLoading] = useState(false)

    const initialValues = {
        id_type_evenement: evenement.id_type_evenement,
        lib_evenement: evenement.lib_evenement,
        id_eglise: evenement.id_eglise,
        hommes: evenement.hommes,
        femmes: evenement.femmes,
        enfants: evenement.enfants,
    }

    const validationSchema = yup.object({
        lib_evenement: yup.string().notRequired(),
        id_eglise: yup.string().required('Ce champ est requis'),
    })

    const submit = (values) => {
        setLoading(true)
        let id_evenement = evenement.id_evenement;
        axios.put(`/evenement/${id_evenement}`, { values }).then(data => {
            handleModal()
            toast.success("Success")
            fetch()
        }).catch(err => {
            toast.error("Echec")
            handleModal()
        }).finally(() => setLoading(false))
    }

    return (
        <Modal show={modal === 'modifier-evenement'} onHide={() => handleModal()} centered>
            <Modal.Header closeButton>
                <Modal.Title>Modification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form >

                        <FormSelectWithLabel name={'id_type_evenement'} title={"Evenement"} disabled={true}>
                            <option disabled value={0}>Choississez le eglise </option>
                            {listetype.map((type) =>
                                <option key={type.id_type_evenement} value={type.id_type_evenement}>{type.lib_type_evenement}</option>
                            )}
                        </FormSelectWithLabel>
                        <FormInputWithLabel name={"lib_evenement"} title={"Detail"} />
                        {permissions.superAdmin &&
                            <FormSelectWithLabel name={'id_eglise'} title={"Eglise"} disabled={true}>
                                <option disabled value={0}>Choississez le eglise </option>
                                {eglises.map((eglise) =>
                                    <option key={eglise.id_eglise} value={eglise.id_eglise}>{eglise.lib_eglise}</option>
                                )}
                            </FormSelectWithLabel>
                        }
                        <FormInputWithLabel name={"hommes"} title={"Hommes"} type={"number"} />
                        <FormInputWithLabel name={"femmes"} title={"Femmes"} type={"number"} />
                        <FormInputWithLabel name={"enfants"} title={"Enfants"} type={"number"} />


                        <Modal.Footer>
                            <button type="button" className={`btn btn-danger btn-outline-danger`} onClick={() => handleModal()}>
                                Fermer
                            </button>
                            <LoadingButton2 loading={loading} color={"primary"} name={"Modifier"} type={"submit"} />
                        </Modal.Footer>

                    </Form>
                </Formik>
            </Modal.Body>
        </Modal>
    );
}



export function SupprimerModal({ evenement, modal, setModal, fetch, listetype }) {
    const [loading, setLoading] = useState(false)

    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/evenement/${evenement.id_evenement}`)
            .then((data) => {
                setModal(null);
                toast.success("Success")
                fetch()
                setLoading(false)
            }).catch(err => {
                toast.error("Echec");
                setModal(null);
                setLoading(false)
            })
    }
    return (
        <Modal show={modal === 'supprimer-evenement'} onHide={() => setModal(null)} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title>Supprimer Evenement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        Supprimer <strong>{listetype.find(type => type.id_type_evenement == evenement.id_type_evenement)?.lib_type_evenement}</strong>  du
                        {evenement.date_evenement ? ' ' + formatDate(evenement?.date_evenement) : ''}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse`} onClick={() => setModal(null)}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"danger"} name={"Supprimer"} />
                </Modal.Footer>
            </form>
        </Modal>
    )
}