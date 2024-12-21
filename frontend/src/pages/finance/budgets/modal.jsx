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
            budget_name: '',
            account: '0',
            category: '0',
            allocated_amount: '',
            start_date: date_aujourdhui(new Date()),
            end_date: '',
        },
        validationSchema: yup.object({
            budget_name: yup.string().required('Ce champ est requis'),
            account: yup.number().notOneOf([0], 'Ce champ est requis'),
            category: yup.number().notOneOf([0], 'Ce champ est requis'),
            allocated_amount: yup.number().required('Ce champ est requis').min(1, 'Ce champ est requis'),
            start_date: yup.string().required('Ce champ est requis'),
            end_date: yup.date().required('Ce champ est requis').min(new Date(), 'Pas Valide')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/budgets`,  values).then(data => {
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
                        <label htmlFor="budget_name" className="col-sm-3 col-form-label fw-bold">
                            Budget
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="budget_name" name='budget_name' {...formik.getFieldProps('budget_name')} placeholder='Budget' />
                            {formik.touched.budget_name && formik.errors.budget_name ? (<small className='text-danger'>{formik.errors.budget_name}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="account" className="fw-bold col-sm-3 col-form-label">
                            Compte
                        </label>
                        <div className='col-sm-9'>
                            <select name='account' className="form-select form-control mb-1"  {...formik.getFieldProps('account')}>
                                <option value={0}>Choississez le compte </option>
                                {comptes.map((compte) =>
                                    <option key={compte.id} value={compte.id}>{compte.account_name}</option>
                                )}
                            </select>
                            {formik.touched.account && formik.errors.account ? (<small className='text-danger'>{formik.errors.account}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="category" className="fw-bold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className='col-sm-9'>
                            <select size="md" name='category' className="form-select form-control mb-1"  {...formik.getFieldProps('category')}>
                                <option value={0}>Choississez type Budget </option>
                                {categorie.map((c) =>
                                    <option key={c.id} value={c.id}>{c.category_name}</option>
                                )}
                            </select>
                            {formik.touched.category && formik.errors.category ? (<small className='text-danger'>{formik.errors.category}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="allocated_amount" className="col-sm-3 col-form-label fw-bold">
                            Montant
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="allocated_amount" type='number' name='allocated_amount' {...formik.getFieldProps('allocated_amount')} placeholder='Montant' />
                            {formik.touched.allocated_amount && formik.errors.allocated_amount ? (<small className='text-danger'>{formik.errors.allocated_amount}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="start_date" className="col-sm-3 col-form-label fw-bold">
                            Debut
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="start_date" type='date' name='start_date' {...formik.getFieldProps('start_date')} placeholder='Debut' />
                            {formik.touched.start_date && formik.errors.start_date ? (<small className='text-danger'>{formik.errors.start_date}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-2">
                        <label htmlFor="end_date" className="col-sm-3 col-form-label fw-bold">
                            Fin
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="end_date" type='date' name='end_date' {...formik.getFieldProps('end_date')} placeholder='Fin' />
                            {formik.touched.end_date && formik.errors.end_date ? (<small className='text-danger'>{formik.errors.end_date}</small>) : null}
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
        budget_name: budget.budget_name,
        allocated_amount: budget.allocated_amount,
        start_date: budget.start_date,
        end_date: budget.end_date,
    }

    const validationSchema = yup.object({
        budget_name: yup.string().required('Ce champ est requis'),
        allocated_amount: yup.number().required('Ce champ est requis').min(1, 'Ce champ est requis'),
        start_date: yup.string().required('Ce champ est requis'),
        end_date: yup.date().required('Ce champ est requis').min(new Date(), 'Pas Valide')
    })


    const submit = (values) => {
        setLoading(true)
        values.action = "all"
        axios.patch(`/finance/budgets/${budget.id}`, values ).then(data => {
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
                        <FormInputWithLabel name={"budget_name"} title={"Budget"} placeholder="Budget" />
                        <FormInputWithLabel name={"allocated_amount"} title={"Montant"} placeholder="Montant" />
                        <FormInputWithLabel name={"start_date"} title={"Debut"} placeholder="Debut" type="date" />
                        <FormInputWithLabel name={"end_date"} title={"Fin"} placeholder="Fin" type="date" />
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
        axios.delete(`/finance/budgets/${budget.id}`)
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
                    <h6>Supprimer ce budget: <span className='text-danger'>{budget.budget_name}</span> </h6>
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
            category: '',
            description: '',
            amount: '',
        },
        validationSchema: yup.object({
            category: yup.number().notOneOf(['0'], 'Ce champ est requis'),
            amount: yup.number().required('Ce champ est requis').min(1, 'Ce champ est requis'),
            description: yup.string().required('Ce champ est requis'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/budgets/${budget.id}/add-expense`, values).then(data => {
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
                    <Modal.Title className='fs-5'>Ajouter Une Depense ({budget.budget_name})</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className="form-group row mb-2">
                        <label htmlFor="category" className="col-sm-3 col-form-label fw-bold">
                            Depense
                        </label>
                        <div className='col-sm-9'>
                            <select name='category' className="form-select form-control mb-1"  {...formik.getFieldProps('category')}>
                                <option value={0}>Choississez Depense</option>
                                {categorie.map((c) =>
                                    <option key={c.id} value={c.id}>{c.category_name}</option>
                                )}
                            </select>
                            {formik.touched.category && formik.errors.category ? (<small className='text-danger'>{formik.errors.category}</small>) : null}
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
                        <label htmlFor="amount" className="col-sm-3 col-form-label fw-bold">
                            Montant
                        </label>
                        <div className='col-sm-9'>
                            <input className='form-control' id="amount" type='number' name='amount' {...formik.getFieldProps('amount')} placeholder='Montant' />
                            {formik.touched.amount && formik.errors.amount ? (<small className='text-danger'>{formik.errors.amount}</small>) : null}
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