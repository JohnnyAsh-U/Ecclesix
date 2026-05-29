import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from '../../utils/config/axiosConfig'
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';



export function AjouterRegle({ fetch, modal, comptes, categories, handleModal, eglises }) {
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            rule_name: '',
            percentage: 0,
            account: '0',
            church: '0',
            category: '0'
        },
        validationSchema: yup.object({
            rule_name: yup.string().required('Ce champ est requis'),
            church: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            account: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            category: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            percentage: yup.number().max(100, 'Pas Valid').min(1, 'Pas Valid').not([0], 'Ce champ est requis')
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/finance/regles`,  values ).then(data => {
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
    const church_main_account = comptes && comptes.find(c => (c.church == formik.values.church && c.is_main))
    const filteredComptes = comptes && comptes.filter(c => c.id != church_main_account?.id)


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
                        <label htmlFor="rule_name" className="fw-bold col-sm-3 col-form-label">
                            Regle
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="rule_name" id="rule_name" placeholder='Nom' {...formik.getFieldProps('rule_name')} />
                            {formik.touched.rule_name && formik.errors.rule_name ? (<small className='text-danger'>{formik.errors.rule_name}</small>) : null}
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
                        <label htmlFor="type" className="fw-bold col-sm-3 col-form-label">
                            Categorie
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="category" id="category" placeholder='Categorie' {...formik.getFieldProps('category')}>
                                <option value={0}>Choississez la Collecte </option>
                                {categories && categories.map((categorie) =>
                                    <option key={categorie.id} value={categorie.id}>{categorie.category_name}</option>
                                )}
                            </select>
                            {formik.touched.category && formik.errors.category ? (<small className='text-danger'>{formik.errors.category}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="account" className="fw-bold col-sm-3 col-form-label">
                            Compte
                        </label>
                        <div className="col-sm-9">
                            <select type="text" className='form-control form-select' name="account" id="account" placeholder='Compte' {...formik.getFieldProps('account')}>
                                <option value={0}>Choississez le Compte Caisse </option>
                                {filteredComptes && filteredComptes.map((compte) =>
                                    <option key={compte.id} value={compte.id}>{compte.account_name}</option>
                                )}
                            </select>
                            {formik.touched.account && formik.errors.account ? (<small className='text-danger'>{formik.errors.account}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="percentage" className="fw-bold col-sm-3 col-form-label">
                            %
                        </label>
                        <div className="col-sm-9">
                            <input type="number" className='form-control' name="percentage" id="percentage" placeholder='Pourcentage' {...formik.getFieldProps('percentage')} />
                            {formik.touched.percentage && formik.errors.percentage ? (<small className='text-danger'>{formik.errors.percentage}</small>) : null}
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
        rule_name: regle?.rule_name,
        percentage: regle?.percentage,
    }

    const validationSchema = yup.object({
        rule_name: yup.string().required('Ce champ est requis'),
        // pourcentage: yup.number().required('Ce champ est requis'),
        percentage: yup.number().max(100, 'Pas Valid').min(1, 'Pas Valid').not([0], 'Ce champ est requis')
    })



    const submit = (values) => {
        setLoading(true)
        axios.patch(`/finance/regles/${regle.id}`, values).then(data => {
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
                        <FormInputWithLabel name={"rule_name"} title={"Regle"} placeholder={"Regle"} />
                        <FormInputWithLabel name={"percentage"} title={"Pourcentage"} placeholder={"Pourcentage"} type={"number"}/>
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
        axios.delete(`/finance/regles/${regle.id}`)
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
                    Voulez vous supprimer cette regle : <span className='text-danger'>{regle.rule_name}</span> ?
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








