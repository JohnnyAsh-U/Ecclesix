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

    const formik = useFormik({
        initialValues: {
            lib_type_evenement: '',
            evenement_ordinaire: 'none'
        },
        validationSchema: yup.object({
            lib_type_evenement: yup.string().required('Ce champ est requis'),
            evenement_ordinaire: yup.string().notOneOf(['none'], 'Ce champ est requis')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/evenement/type`, { values }).then(data => {
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
                        <label htmlFor="lib_type_evenement" className="fw-bold col-sm-3 col-form-label">
                            Evenement
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="lib_type_evenement" id="lib_type_evenement" placeholder='Evenement' {...formik.getFieldProps('lib_type_evenement')} />
                            {formik.touched.lib_type_evenement && formik.errors.lib_type_evenement ? (<small className='text-danger'>{formik.errors.lib_type_evenement}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="evenement_ordinaire" className="fw-bold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="evenement_ordinaire" id="evenement_ordinaire" placeholder='Nom' {...formik.getFieldProps('evenement_ordinaire')}>
                                <option value={"none"} disabled>Type... </option>
                                <option value={1}>Culte Ordinaire</option>
                                <option value={0}>Culte/Evenement Special</option>
                            </select>
                            {formik.touched.evenement_ordinaire && formik.errors.evenement_ordinaire ? (<small className='text-danger'>{formik.errors.evenement_ordinaire}</small>) : null}
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






export const ModifierType = ({ type, modal, handleModal, fetch }) => {
    const [loading, setLoading] = useState(false)

    const initialValues = {
        lib_type_evenement: type.lib_type_evenement,
        evenement_ordinaire: type.evenement_ordinaire
    }

    const validationSchema = yup.object({
        lib_type_evenement: yup.string().required('Ce champ est requis'),
        evenement_ordinaire: yup.string().notOneOf(['none'], 'Ce champ est requis')
    })

    const submit = (values) => {
        setLoading(true)
        axios.put(`/evenement/type/${type.id_type_evenement}`, { values }, { withCredentials: true }).then(data => {
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
                    <Form>
                        <FormInputWithLabel name={"lib_type_evenement"} title={"Type"} />
                        <FormSelectWithLabel name={'evenement_ordinaire'} title={"Type"}>
                            <option value={"none"} disabled>Type... </option>
                            <option value={"true"}>Culte Ordinaire</option>
                            <option value={"false"}>Culte/Evenement Special</option>
                        </FormSelectWithLabel>
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
        axios.delete(`/evenement/type/${type.id_type_evenement}`)
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
                    Voulez vous supprimer ce type : {type.lib_type_evenement} ?
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








