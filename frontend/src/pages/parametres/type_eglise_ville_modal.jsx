import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from '../../utils/config/axiosConfig'
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';



export function AjouterVille({ fetch, modal, handleModal }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            ville: '',
        },
        validationSchema: yup.object({
            ville: yup.string().required('Ce champ est requis')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/eglise/ville`, { city_name: values.ville }).then(data => {
                handleModal()
                formik.resetForm()
                if (data) toast.success("Success")
                fetch()
                setLoading(false)
            })
                .catch(err => {
                    handleModal()
                    toast.error('Echec')
                    setLoading(false)
                })
        }
    })

    return (
        <Modal show={modal === 'ajouter-ville'} onHide={() => handleModal(null)} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>
                        Ajouter Une Ville
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="ville" className="fw-bold col-sm-3 col-form-label">
                            Ville
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="ville" id="ville" placeholder='Ville' {...formik.getFieldProps('ville')} />
                            {formik.touched.ville && formik.errors.ville ? (<small className='text-danger'>{formik.errors.ville}</small>) : null}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-danger btn-outline-danger btn-sm`} onClick={() => handleModal()}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"primary"} name={"Ajouter"} size='sm' />
                </Modal.Footer>
            </form>
        </Modal>
    )
}



export const ModifierVille = ({ ville_m, modal, handleModal, fetch }) => {
    const [loading, setLoading] = useState(false)
    const initialValues = {
        ville: ville_m.city_name
    }
    const validationSchema = yup.object({
        ville: yup.string().required('Ce champ est requis')
    })
    const submit = (values) => {
        setLoading(true)
        axios.put(`/eglise/ville/${ville_m.id}`, { city_name: values.ville }).then(data => {
            handleModal()
            if (data) toast.success("Success");
            fetch()
            setLoading(false)
        })
            .catch(err => {
                toast.error("Echec")
                setLoading(false)
            })
    }

    return (
        <Modal show={modal === 'modifier-ville'} onHide={() => handleModal(null)} centered>
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
                    <Form>
                        <FormInputWithLabel name={"ville"} title={"Ville"} />
                        <Modal.Footer>
                            <button type="button" className={`btn btn-danger btn-outline-danger btn-sm`} onClick={() => handleModal()}>
                                Fermer
                            </button>
                            <LoadingButton2 loading={loading} type={"submit"} color={"primary"} name={"Modifier"} size='sm' />
                        </Modal.Footer>
                    </Form>
                </Formik>
            </Modal.Body>
        </Modal>
    );
}



export function SupprimerVille({ ville_s, fetch, handleModal, modal }) {
    const [loading, setLoading] = useState(false)


    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/eglise/ville/${ville_s.id}`)
            .then((data) => {
                handleModal()
                if (data) toast.success("Success");
                fetch()
                setLoading(false)
            }).catch(err => {
                handleModal()
                setLoading(false)
                toast.error("Echec")
            })
    }

    return (
        <Modal show={modal === 'supprimer-ville'} onHide={() => handleModal()} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title className='fs-5'>Supprimer  {ville_s.city_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer cette ville : {ville_s.city_name} ?
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse btn-sm`} onClick={() => handleModal(null)}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"danger"} name={"Supprimer"} size='sm' />
                </Modal.Footer>
            </form>
        </Modal>
    )
}


export function AjouterType({ fetch, modal, handleModal }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            type: '',
            description: ''
        },
        validationSchema: yup.object({
            type: yup.string().required('Ce champ est requis'),
            description: yup.string().required('Ce champ est requis')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/eglise/type`, { church_type_name: values.type, description: values.description }).then(data => {
                formik.resetForm()
                handleModal()
                if (data) toast.success("Success");
                fetch()
                setLoading(false)
            })
                .catch(err => {
                    handleModal()
                    toast.error("Echec")
                    setLoading(false)
                })
        }
    })

    return (
        <Modal show={modal === 'ajouter-type'} onHide={() => handleModal(null)} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>
                        Ajouter Un Type
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="type" className="fw-bold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="type" id="type" placeholder='Type' {...formik.getFieldProps('type')} />
                            {formik.touched.type && formik.errors.type ? (<small className='text-danger'>{formik.errors.type}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="description" className="fw-bold col-sm-3 col-form-label">
                            Description
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="description" id="description" placeholder='Description' {...formik.getFieldProps('description')} />
                            {formik.touched.description && formik.errors.description ? (<small className='text-danger'>{formik.errors.description}</small>) : null}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-danger btn-outline-danger btn-sm`} onClick={() => handleModal()}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"primary"} name={"Ajouter"} size='sm' />
                </Modal.Footer>
            </form>
        </Modal>
    )
}






export const ModifierType = ({ fetch, modal, handleModal, type }) => {
    const [loading, setLoading] = useState(false)
    const initialValues = {
        type: type.church_type_name,
        description: type.description
    }
    const validationSchema = yup.object({
        type: yup.string().required('Ce champ est requis'),
        description: yup.string().required('Ce champ est requis')
    })
    const submit = (values) => {
        setLoading(true)
        axios.put(`/eglise/type/${type.id}`, {
            church_type_name: values.type,
            description: values.description
        }).then(data => {
            handleModal()
            if (data) toast.success("Success");
            fetch()
            setLoading(false)
        })
            .catch(err => {
                handleModal()
                toast.error("Echec")
                setLoading(false)
            })
    }


    return (
        <Modal show={modal === 'modifier-type'} onHide={() => handleModal(null)} centered>
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
                    <Form>
                        <FormInputWithLabel name={"type"} title={"Type"} />
                        <FormInputWithLabel name={"description"} title={"Description"} />
                        <Modal.Footer>
                            <button type="button" className={`btn btn-danger btn-outline-danger btn-sm`} onClick={() => handleModal()}>
                                Fermer
                            </button>
                            <LoadingButton2 loading={loading} type={"submit"} color={"primary"} name={"Modifier"} size='sm' />
                        </Modal.Footer>
                    </Form>
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
        axios.delete(`/eglise/type/${type.id}`)
            .then((data) => {
                handleModal()
                if (data) toast.success("Success");
                fetch()
                setLoading(false)
            }).catch(err => {
                handleModal()
                toast.error("Echec")
                setLoading(false)
            })

    }
    return (
        <Modal show={modal === 'supprimer-type'} onHide={() => handleModal()} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title className='fs-5'>Supprimer  {type.church_type_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer ce type : {type.church_type_name} ?
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse btn-sm`} onClick={() => handleModal(null)}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"danger"} name={"Supprimer"} size='sm' />
                </Modal.Footer>
            </form>
        </Modal>
    )
}








