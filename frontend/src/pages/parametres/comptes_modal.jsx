import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from '../../utils/config/axiosConfig'
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';



export function AjouterCompte({ fetch, modal, handleModal, eglises }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            account_name: '',
            account_type: '0',
            balance: '0.00',
            church: '0'
        },
        validationSchema: yup.object({
            account_name: yup.string().required('Ce champ est requis'),
            account_type: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            balance: yup.string().required('Ce champ est requis'),
            church: yup.string().notOneOf(['0'], 'Ce champ est requis')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/comptes`, values).then(data => {
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
                        Ajouter Un Compte
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="account_name" className="fw-bold col-sm-3 col-form-label">
                            Nom
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="account_name" id="account_name" placeholder='Nom' {...formik.getFieldProps('account_name')} />
                            {formik.touched.account_name && formik.errors.account_name ? (<small className='text-danger'>{formik.errors.account_name}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="account_type" className="fw-bold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="account_type" id="account_type" placeholder='Type' {...formik.getFieldProps('account_type')}>
                                <option value={0} disabled>Type... </option>
                                <option value={"Caisse"}>Compte Caisse</option>
                                <option value={"Bancaire"}>Compte Bancaire</option>
                            </select>
                            {formik.touched.account_type && formik.errors.account_type ? (<small className='text-danger'>{formik.errors.account_type}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="church" className="fw-bold col-sm-3 col-form-label">
                            Eglise
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="church" id="church" placeholder='Eglise' {...formik.getFieldProps('church')}>
                                <option value={0} disabled>Choississez l'eglise </option>
                                {eglises && eglises.map((eglise) =>
                                    <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                )}
                            </select>
                            {formik.touched.church && formik.errors.church ? (<small className='text-danger'>{formik.errors.church}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="balance" className="fw-bold col-sm-3 col-form-label">
                            Montant
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="balance" id="balance" placeholder='Montant' {...formik.getFieldProps('balance')} />
                            {formik.touched.balance && formik.errors.balance ? (<small className='text-danger'>{formik.errors.balance}</small>) : null}
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






export const ModifierCompte = ({ compte, modal, handleModal, fetch }) => {
    const [loading, setLoading] = useState(false)

    const initialValues = {
        account_name: compte?.account_name,
    }

    const validationSchema = yup.object({
        account_name: yup.string().required('Ce champ est requis'),
    })


    const submit = (values) => {
        setLoading(true)
        axios.patch(`/finance/comptes/${compte.id}`,  values).then(data => {
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
                    Modifier Compte
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form>
                        <FormInputWithLabel name={"account_name"} title={"Compte"} placeholder={"Nom du Compte"}/>
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



export function SupprimerCompte({ compte, modal, handleModal, fetch }) {
    const [loading, setLoading] = useState(false)


    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/finance/comptes/${compte.id}`)
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
                    <Modal.Title className='fs-5'>Supprimer Compte</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer ce compte : <span className='text-danger'>{compte.account_name}</span> ?
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








