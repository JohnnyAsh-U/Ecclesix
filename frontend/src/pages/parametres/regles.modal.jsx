import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from 'axios';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';



export function AjouterRegle({ fetch, modal, comptes, categories, handleModal, eglises }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            lib_regle: '',
            pourcentage: 0,
            id_compte: '0',
            id_eglise: '0',
            id_categorie: '0'
        },
        validationSchema: yup.object({
            lib_regle: yup.string().required('Ce champ est requis'),
            id_eglise: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            id_compte: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            id_categorie: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            pourcentage: yup.number().max(100, 'Pas Valid').min(1, 'Pas Valid').not([0], 'Ce champ est requis')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/regles`, { values }).then(data => {
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

    //filters compte by church
    const church_main_account = comptes && comptes.find(c => (c.id_eglise == formik.values.id_eglise && c.compte_principal))
    const filteredComptes = comptes && comptes.filter(c => c.id_compte != church_main_account?.id_compte)


    return (
        <Modal show={modal === 'ajouter'} onHide={() => handleModal(null)} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>
                        Ajouter Une Regle
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="lib_regle" className="fw-bold col-sm-3 col-form-label">
                            Regle
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="lib_regle" id="lib_regle" placeholder='Nom' {...formik.getFieldProps('lib_regle')} />
                            {formik.touched.lib_regle && formik.errors.lib_regle ? (<small className='text-danger'>{formik.errors.lib_regle}</small>) : null}
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
                        <label htmlFor="type" className="fw-bold col-sm-3 col-form-label">
                            Categorie
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="id_categorie" id="id_categorie" placeholder='Categorie' {...formik.getFieldProps('id_categorie')}>
                                <option value={0}>Choississez la Collecte </option>
                                {categories && categories.map((categorie) =>
                                    <option key={categorie.id_categorie} value={categorie.id_categorie}>{categorie.lib_categorie}</option>
                                )}
                            </select>
                            {formik.touched.id_categorie && formik.errors.id_categorie ? (<small className='text-danger'>{formik.errors.id_categorie}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="type" className="fw-bold col-sm-3 col-form-label">
                            Compte
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="id_compte" id="id_compte" placeholder='Compte' {...formik.getFieldProps('id_compte')}>
                                <option value={0}>Choississez le Compte Caisse </option>
                                {filteredComptes && filteredComptes.map((compte) =>
                                    <option key={compte.id_compte} value={compte.id_compte}>{compte.lib_compte}</option>
                                )}
                            </select>
                            {formik.touched.id_compte && formik.errors.id_compte ? (<small className='text-danger'>{formik.errors.id_compte}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="pourcentage" className="fw-bold col-sm-3 col-form-label">
                            %
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="pourcentage" id="pourcentage" placeholder='Pourcentage' {...formik.getFieldProps('pourcentage')} />
                            {formik.touched.pourcentage && formik.errors.pourcentage ? (<small className='text-danger'>{formik.errors.pourcentage}</small>) : null}
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






export const ModifierRegle = ({ regle, modal, handleModal, fetch }) => {
    const [loading, setLoading] = useState(false)

    const initialValues = {
        lib_regle: regle?.lib_regle,
        pourcentage: regle?.pourcentage,
    }

    const validationSchema = yup.object({
        lib_regle: yup.string().required('Ce champ est requis'),
        // pourcentage: yup.number().required('Ce champ est requis'),
        pourcentage: yup.number().max(100, 'Pas Valid').min(1, 'Pas Valid').not([0], 'Ce champ est requis')
    })



    const submit = (values) => {
        setLoading(true)
        axios.put(`/finance/regles/${regle.id_regle}`, { values }).then(data => {
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
                    Modifier Regle
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form>
                        <FormInputWithLabel name={"lib_regle"} title={"Regle"} placeholder={"Regle"} />
                        <FormInputWithLabel name={"pourcentage"} title={"Pourcentage"} placeholder={"Pourcentage"} type={"number"}/>
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



export function SupprimerRegle({ regle, modal, handleModal, fetch }) {
    const [loading, setLoading] = useState(false)


    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/finance/regles/${regle.id_regle}`)
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
                    <Modal.Title className='fs-5'>Supprimer Regle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer cette regle : <span className='text-danger'>{regle.lib_regle}</span> ?
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








