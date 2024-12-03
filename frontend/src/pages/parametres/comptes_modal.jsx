import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from 'axios';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';



export function AjouterCompte({ fetch, modal, handleModal, eglises }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            lib_compte: '',
            type: '0',
            montant: '0.00',
            id_eglise: '0'
        },
        validationSchema: yup.object({
            lib_compte: yup.string().required('Ce champ est requis'),
            type: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            montant: yup.string().required('Ce champ est requis'),
            id_eglise: yup.string().notOneOf(['0'], 'Ce champ est requis')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/comptes`, { values }).then(data => {
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
                        <label htmlFor="lib_compte" className="fw-bold col-sm-3 col-form-label">
                            Nom
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="lib_compte" id="lib_compte" placeholder='Nom' {...formik.getFieldProps('lib_compte')} />
                            {formik.touched.lib_compte && formik.errors.lib_compte ? (<small className='text-danger'>{formik.errors.lib_compte}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="type" className="fw-bold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="type" id="type" placeholder='Type' {...formik.getFieldProps('type')}>
                                <option value={0} disabled>Type... </option>
                                <option value={"Caisse"}>Compte Caisse</option>
                                <option value={"Bancaire"}>Compte Bancaire</option>
                            </select>
                            {formik.touched.type && formik.errors.type ? (<small className='text-danger'>{formik.errors.type}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="id_eglise" className="fw-bold col-sm-3 col-form-label">
                            Eglise
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="id_eglise" id="id_eglise" placeholder='Eglise' {...formik.getFieldProps('id_eglise')}>
                                <option value={0} disabled>Choississez l'eglise </option>
                                {eglises && eglises.map((eglise) =>
                                    <option key={eglise.id_eglise} value={eglise.id_eglise}>{eglise.lib_eglise}</option>
                                )}
                            </select>
                            {formik.touched.id_eglise && formik.errors.id_eglise ? (<small className='text-danger'>{formik.errors.id_eglise}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="montant" className="fw-bold col-sm-3 col-form-label">
                            Montant
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="montant" id="montant" placeholder='Montant' {...formik.getFieldProps('montant')} />
                            {formik.touched.montant && formik.errors.montant ? (<small className='text-danger'>{formik.errors.montant}</small>) : null}
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
        lib_compte: compte?.lib_compte,
    }

    const validationSchema = yup.object({
        lib_compte: yup.string().required('Ce champ est requis'),
    })


    const submit = (values) => {
        setLoading(true)
        axios.put(`/finance/comptes/${compte.id_compte}`, { values }).then(data => {
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
                        <FormInputWithLabel name={"lib_compte"} title={"Compte"} placeholder={"Nom du Compte"}/>
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
        axios.delete(`/finance/comptes/${compte.id_compte}`)
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
                    Voulez vous supprimer ce compte : <span className='text-danger'>{compte.lib_compte}</span> ?
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








