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
            event_type: 0,
            event_name: '',
            church: admin.church_id,
            event_date: '',
            men: 0,
            women: 0,
            children: 0,
        },
        validationSchema: yup.object({
            // id_type_evenement: yup.string().required('Ce champ est requis'),
            event_type: yup.string().notOneOf(['0'], 'Ce Champ est requis'),
            event_name: yup.string().notRequired('Ce champ est requis'),
            event_date: yup.string().required('Ce champ est requis'),
            church: yup.string().required('Ce champ est requis'),
        }),
        onSubmit: form => {
            setLoading(true)
            form.total = form.men + form.women  + form.children
            axios.post(`/evenement`,  form ).then(data => {
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
                            <select type="text" className='form-control form-select' name="event_type" id="event_type" placeholder='Evenement' {...formik.getFieldProps('event_type')}>
                                <option value={0} disabled>Evenement </option>
                                {listetype.map((type) =>
                                    <option key={type.id} value={type.id}>{type.event_type_name}</option>
                                )}
                            </select>
                            {formik.touched.event_type && formik.errors.event_type ? (<small className='text-danger'>{formik.errors.event_type}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="event_name" className="fw-bold col-sm-3 col-form-label">
                            Details
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="event_name" id="event_name" placeholder='Detail' {...formik.getFieldProps('event_name')} />
                            {formik.touched.event_name && formik.errors.event_name ? (<small className='text-danger'>{formik.errors.event_name}</small>) : null}
                        </div>
                    </div>

                    {permissions.superAdmin &&
                        <div className="form-group row mb-3">
                            <label htmlFor="church" className="fw-bold col-sm-3 col-form-label">
                                Eglise
                            </label>
                            <div className="col-sm-9">
                                <select type="text" className='form-control form-select' name="church" id="church" placeholder='Eglise' {...formik.getFieldProps('church')}>
                                    <option value={0} disabled>Eglise </option>
                                    {eglises.map((eglise) =>
                                        <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                    )}
                                </select>
                                {formik.touched.church && formik.errors.church ? (<small className='text-danger'>{formik.errors.church}</small>) : null}
                            </div>
                        </div>
                    }

                    <div className="form-group row mb-3">
                        <label htmlFor="event_date" className="fw-bold col-sm-3 col-form-label">
                            Date
                        </label>
                        <div className="col-sm-9">
                            <input type="date" className='form-control' name="event_date" id="event_date" placeholder='Date' {...formik.getFieldProps('event_date')} />
                            {formik.touched.event_date && formik.errors.event_date ? (<small className='text-danger'>{formik.errors.event_date}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="men" className="fw-bold col-sm-3 col-form-label">
                            Hommes
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="men" id="men" placeholder='Hommes' {...formik.getFieldProps('men')} />
                            {formik.touched.men && formik.errors.men ? (<small className='text-danger'>{formik.errors.men}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="women" className="fw-bold col-sm-3 col-form-label">
                            Femmes
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="women" id="women" placeholder='women' {...formik.getFieldProps('women')} />
                            {formik.touched.women && formik.errors.women ? (<small className='text-danger'>{formik.errors.women}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="children" className="fw-bold col-sm-3 col-form-label">
                            Enfants
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="children" id="children" placeholder='children' {...formik.getFieldProps('children')} />
                            {formik.touched.children && formik.errors.children ? (<small className='text-danger'>{formik.errors.children}</small>) : null}
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-danger btn-outline-danger`} onClick={() => handleModal()}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"primary"} name={"Ajouter"} type = "submit"/>
                </Modal.Footer>
            </form>
        </Modal>
    )
}



export const ModifierModal = ({ evenement, modal, fetch, handleModal, listetype }) => {
    const { permissions, admin, eglises } = AppGlobalContext()
    const [loading, setLoading] = useState(false)

    const initialValues = {
        id: evenement.id,
        event_name: evenement.event_name,
        church: evenement.church,
        men: evenement.men,
        women: evenement.women,
        children: evenement.children,
    }

    const validationSchema = yup.object({
        event_name: yup.string().notRequired(),
        church: yup.string().required('Ce champ est requis'),
    })

    const submit = (values) => {
        setLoading(true)
        let id = evenement.id;
        values.total = values.men + values.women + values.children
        axios.patch(`/evenement/${id}`, values ).then(data => {
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
                                <option key={type.id} value={type.id}>{type.event_type_name}</option>
                            )}
                        </FormSelectWithLabel>
                        <FormInputWithLabel name={"event_name"} title={"Detail"} />
                        {permissions.superAdmin &&
                            <FormSelectWithLabel name={'church'} title={"Eglise"} disabled={true}>
                                <option disabled value={0}>Choississez le eglise </option>
                                {eglises.map((eglise) =>
                                    <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                )}
                            </FormSelectWithLabel>
                        }
                        <FormInputWithLabel name={"men"} title={"Hommes"} type={"number"} />
                        <FormInputWithLabel name={"women"} title={"Femmes"} type={"number"} />
                        <FormInputWithLabel name={"children"} title={"Enfants"} type={"number"} />


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
        axios.delete(`/evenement/${evenement.id}`)
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
                        Supprimer <strong>{listetype.find(type => type.id == evenement.event_type)?.event_type_name}</strong>  du
                        {evenement.event_date ? ' ' + formatDate(evenement?.event_date) : ''}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse`} onClick={() => setModal(null)}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"danger"} name={"Supprimer"} type = "submit"/>
                </Modal.Footer>
            </form>
        </Modal>
    )
}