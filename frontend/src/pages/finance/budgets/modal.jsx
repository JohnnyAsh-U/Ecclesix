import React, { useRef, useState } from 'react'
import { useFormik, Form, Field, ErrorMessage, Formik } from 'formik'
import * as yup from 'yup';
import { date_aujourdhui } from '../../../utils/datetime/formatdate';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal'
import { LoadingButton2 } from '../../../components/buttons/loadingbuttons';
import { FormInput, FormInputWithLabel } from '../../../components/Inputbox/input';




export function Ajouter({ handleModal, modal, comptes, categorie, eglise }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            lib_budget: '',
            id_compte: '0',
            id_categorie: '0',
            montant: '',
            date_de_debut: date_aujourdhui(new Date()),
            date_de_fin: '',
        },
        validationSchema: yup.object({
            lib_budget: yup.string().required('Ce champ est requis'),
            id_compte: yup.number().notOneOf([0], 'Ce champ est requis'),
            id_categorie: yup.number().notOneOf([0], 'Ce champ est requis'),
            montant: yup.number().required('Ce champ est requis').min(1, 'Ce champ est requis'),
            date_de_debut: yup.string().required('Ce champ est requis'),
            date_de_fin: yup.date().required('Ce champ est requis').min(new Date(), 'Pas Valide')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/budgets`, { values }).then(data => {
                formik.resetForm()
                handleModal()
                toast.success("Success")
            })
                .catch(err => {
                    handleModal()
                    toast.error("Echec")

                }).finally(() => setLoading(false))
        }
    })

    return (
        <Modal alignment="center" show={modal === 'ajouter'} onHide={() => handleModal()} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header>
                    <Modal.Title className='fs-5'>Ajouter Un Budget</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-2">
                        <label htmlFor="lib_budget" className="col-sm-3 col-form-label fw-bold">
                            Budget
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="lib_budget" name='lib_budget' {...formik.getFieldProps('lib_budget')} placeholder='Budget' />
                            {formik.touched.lib_budget && formik.errors.lib_budget ? (<small className='text-danger'>{formik.errors.lib_budget}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="id_compte" className="fw-bold col-sm-3 col-form-label">
                            Compte
                        </label>
                        <div className='col-sm-9'>
                            <select name='id_compte' className="form-select form-control mb-1"  {...formik.getFieldProps('id_compte')}>
                                <option value={0}>Choississez le compte </option>
                                {comptes.map((compte) =>
                                    <option key={compte.id_compte} value={compte.id_compte}>{compte.lib_compte}</option>
                                )}
                            </select>
                            {formik.touched.id_compte && formik.errors.id_compte ? (<small className='text-danger'>{formik.errors.id_compte}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="id_categorie" className="fw-bold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className='col-sm-9'>
                            <select size="md" name='id_categorie' className="form-select form-control mb-1"  {...formik.getFieldProps('id_categorie')}>
                                <option value={0}>Choississez type Budget </option>
                                {categorie.map((c) =>
                                    <option key={c.id_categorie} value={c.id_categorie}>{c.lib_categorie}</option>
                                )}
                            </select>
                            {formik.touched.id_categorie && formik.errors.id_categorie ? (<small className='text-danger'>{formik.errors.id_categorie}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="montant" className="col-sm-3 col-form-label fw-bold">
                            Montant
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="montant" type='number' name='montant' {...formik.getFieldProps('montant')} placeholder='Montant' />
                            {formik.touched.montant && formik.errors.montant ? (<small className='text-danger'>{formik.errors.montant}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="date_de_debut" className="col-sm-3 col-form-label fw-bold">
                            Debut
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="date_de_debut" type='date' name='date_de_debut' {...formik.getFieldProps('date_de_debut')} placeholder='Debut' />
                            {formik.touched.date_de_debut && formik.errors.date_de_debut ? (<small className='text-danger'>{formik.errors.date_de_debut}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="date_de_fin" className="col-sm-3 col-form-label fw-bold">
                            Fin
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="date_de_fin" type='date' name='date_de_fin' {...formik.getFieldProps('date_de_fin')} placeholder='Fin' />
                            {formik.touched.date_de_fin && formik.errors.date_de_fin ? (<small className='text-danger'>{formik.errors.date_de_fin}</small>) : null}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    {!loading &&
                        <button className='btn btn-outline-danger' onClick={() => handleModal()}>
                            Fermer
                        </button>}
                    <LoadingButton2 loading={loading} color={"primary"} type={"submit"} name={"Ajouter"} />
                </Modal.Footer>
            </form>
        </Modal>
    )
}




export const Modifier = ({ budget, handleModal, modal }) => {
    const [loading, setLoading] = useState(false)

    const initialValues = {
        lib_budget: budget.lib_budget,
        montant: budget.montant,
        date_de_debut: budget.date_de_debut,
        date_de_fin: budget.date_de_fin,
    }

    const validationSchema = yup.object({
        lib_budget: yup.string().required('Ce champ est requis'),
        montant: yup.number().required('Ce champ est requis').min(1, 'Ce champ est requis'),
        date_de_debut: yup.string().required('Ce champ est requis'),
        date_de_fin: yup.date().required('Ce champ est requis').min(new Date(), 'Pas Valide')
    })


    const submit = (values) => {
        setLoading(true)
        values.action = "all"
        axios.put(`/finance/budgets/${budget.id_budget}`, { values }).then(data => {
            handleModal()
            if (data) toast.success("Success")
        })
            .catch(err => {
                handleModal()
                toast.error("Echec")

            }).finally(() => setLoading(false))
    }


    return (
        <Modal show={modal === 'modifier'} onHide={() => handleModal()} centered>
            <Modal.Header>
                <Modal.Title className='fs-5'>Modifier Budget</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form>
                        <FormInputWithLabel name={"lib_budget"} title={"Budget"} placeholder="Budget" />
                        <FormInputWithLabel name={"montant"} title={"Montant"} placeholder="Montant" />
                        <FormInputWithLabel name={"date_de_debut"} title={"Debut"} placeholder="Debut" type="date" />
                        <FormInputWithLabel name={"date_de_fin"} title={"Fin"} placeholder="Fin" type="date" />
                        <Modal.Footer>
                            {!loading &&
                                <button className='btn btn-outline-danger' type='button' onClick={() => handleModal()}>
                                    Fermer
                                </button>}
                            <LoadingButton2 loading={loading} color={"primary"} type="submit" name={"Modifier"} />
                        </Modal.Footer>
                    </Form>
                </Formik>
            </Modal.Body>
        </Modal>
    );
}




export function Supprimer({ budget, modal, handleModal }) {
    const [loading, setLoading] = useState(false)


    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/finance/budgets/${budget.id_budget}`, { withCredentials: true })
            .then((data) => {
                handleModal()
                toast.success("Success")
            }).catch(err => {
                handleModal()
                toast.success("Echec")
            }).finally(() => setLoading(false))

    }
    return (
        <Modal show={modal === 'supprimer'} onHide={() => handleModal()} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title className='fs-5'>Supprimer Ce Budget</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h6>Supprimer ce budget: <span className='text-danger'>{budget.lib_budget}</span> </h6>
                </Modal.Body>
                <Modal.Footer>
                    {!loading &&
                        <button className='btn btn-outline-dark' onClick={() => handleModal()}>
                            Fermer
                        </button>}
                    <LoadingButton2 loading={loading} color={"danger"} name={"Supprimer"} type="submit" />
                </Modal.Footer>
            </form>
        </Modal>
    )
}


export function DepenseBudget({ budget, modal, categorie, handleModal }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            id_categorie: '',
            description: '',
            montant: '',
        },
        validationSchema: yup.object({
            id_categorie: yup.number().notOneOf(['0'], 'Ce champ est requis'),
            montant: yup.number().required('Ce champ est requis').min(1, 'Ce champ est requis'),
            description: yup.string().required('Ce champ est requis'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/budgets/${budget.id_budget}/depense`, { values }).then(data => {
                formik.resetForm()
                toast.success("Success")
                handleModal(null)
            })
                .catch(err => {
                    handleModal()
                    toast.error("Echec")
                }).finally(() => setLoading(false))
        }
    })

    return (
        <Modal show={modal === 'depense'} onHide={() => handleModal()} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header>
                    <Modal.Title className='fs-5'>Ajouter Une Depense ({budget.lib_budget})</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className="form-group row mb-2">
                        <label htmlFor="id_categorie" className="col-sm-3 col-form-label fw-bold">
                            Depense
                        </label>
                        <div className='col-sm-9'>
                            <select name='id_categorie' className="form-select form-control mb-1"  {...formik.getFieldProps('id_categorie')}>
                                <option value={0}>Choississez Depense</option>
                                {categorie.map((c) =>
                                    <option key={c.id_categorie} value={c.id_categorie}>{c.lib_categorie}</option>
                                )}
                            </select>
                            {formik.touched.id_categorie && formik.errors.id_categorie ? (<small className='text-danger'>{formik.errors.id_categorie}</small>) : null}
                        </div>
                    </div>


                    <div className="form-group row mb-2">
                        <label htmlFor="description" className="col-sm-3 col-form-label fw-bold">
                            Descrip.
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="description" type='text' name='description' {...formik.getFieldProps('description')} placeholder='Description' />
                            {formik.touched.description && formik.errors.description ? (<small className='text-danger'>{formik.errors.description}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="montant" className="col-sm-3 col-form-label fw-bold">
                            Montant
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="montant" type='number' name='montant' {...formik.getFieldProps('montant')} placeholder='Montant' />
                            {formik.touched.montant && formik.errors.montant ? (<small className='text-danger'>{formik.errors.montant}</small>) : null}
                        </div>
                    </div>


                </Modal.Body>

                <Modal.Footer>
                    {!loading &&
                        <button className='btn btn-outline-danger' type='button' onClick={() => handleModal()}>
                            Fermer
                        </button>
                    }
                    <LoadingButton2 loading={loading} name={"Ajouter"} color={"primary"} />
                </Modal.Footer>
            </form>
        </Modal>
    )
}