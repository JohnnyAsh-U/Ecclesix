import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from 'axios';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';
import { FormSelectWithLabel } from '../../components/Inputbox/form-select';



export function AjouterCategorie({ fetch, modal, handleModal }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            category_name: '',
            category_type: '0',
            description: ''
        },
        validationSchema: yup.object({
            category_name: yup.string().required('Ce champ est requis'),
            category_type: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            description: yup.string().required('Ce champ est requis'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/categories`, values).then(data => {
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
                        Ajouter Une Categorie
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="category_name" className="fw-bold col-sm-3 col-form-label">
                            Categorie
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="category_name" id="category_name" placeholder='Categorie' {...formik.getFieldProps('category_name')} />
                            {formik.touched.category_name && formik.errors.category_name ? (<small className='text-danger'>{formik.errors.category_name}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="category_type" className="fw-bold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="category_type" id="category_type" placeholder='Type' {...formik.getFieldProps('category_type')}>
                                <option value={0} disabled>Type... </option>
                                <option value={"Credit"}>Collecte</option>
                                <option value={"Debit"}>Depense</option>
                                <option value={"Budget"}>Budget</option>
                            </select>
                            {formik.touched.category_type && formik.errors.category_type ? (<small className='text-danger'>{formik.errors.category_type}</small>) : null}
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
                    <LoadingButton2 loading={loading} color={"primary"} type={"submit"} name={"Ajouter"} size='sm' />
                </Modal.Footer>
            </form>
        </Modal>
    )
}






export const ModifierCategorie = ({ categorie, modal, handleModal, fetch }) => {
    const [loading, setLoading] = useState(false)

    const initialValues = {
        category_name: categorie?.category_name,
        description: categorie?.description
    }

    const validationSchema = yup.object({
        category_name: yup.string().required('Ce champ est requis'),
        description: yup.string().required('Ce champ est requis'),
    })

    const submit = (values) => {
        setLoading(true)
        axios.patch(`/finance/categories/${categorie.id}`, values ).then(data => {
            handleModal()
            toast.success("Success")
            fetch()
        })
            .catch(err => {
                handleModal()
                toast.error("Echec")
            }).finally(() => setLoading(false))
    }

    const type = {
        Credit: 'Collecte',
        Debit: 'Depense',
        Budget: 'Budget'
    }


    return (
        <Modal show={modal === 'modifier'} onHide={() => handleModal(null)} centered>
            <Modal.Header closeButton>
                <Modal.Title className='fs-5'>
                    Modifier {type[categorie.category_type]}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form>
                        <FormInputWithLabel name={"category_name"} title={"Categorie"} placeholder={"Categorie"} />
                        <FormInputWithLabel name={"description"} title={"Description"} placeholder={"Description"} />
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



export function SupprimerCategorie({ categorie, modal, handleModal, fetch }) {
    const [loading, setLoading] = useState(false)


    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/finance/categories/${categorie.id}`)
            .then((data) => {
                handleModal()
                toast.success("Success")
                fetch()
            }).catch(err => {
                handleModal()
                toast("Echec")
            }).finally(() => setLoading(false))

    }

    const type = {
        Credit: 'Collecte',
        Debit: 'Depense',
        Budget: 'Budget'
    }


    return (
        <Modal show={modal === 'supprimer'} onHide={() => handleModal()} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title className='fs-5'>Supprimer {type[categorie.category_type]}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer cette categorie : <span className='text-danger'>{categorie.category_name}</span> ?
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








