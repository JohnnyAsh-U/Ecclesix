import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Field, ErrorMessage, Formik } from 'formik'
import axios from 'axios';
import * as yup from 'yup';
import Select from 'react-select'
import { AppGlobalContext } from '../../hooks/AppContext';
import { date_aujourdhui } from '../../utils/datetime/formatdate';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';
import { FormSelectWithLabel } from '../../components/Inputbox/form-select';




export default function AjouterModal({ fetch, modal, handleModal }) {
    const [options, setOptions] = useState([])
    const { permissions, admin, eglises } = AppGlobalContext()
    const [loading, setLoading] = useState(false)

    const formik = useFormik({
        initialValues: {
            lib_groupe: '',
            description: '',
            id_eglise: admin.id_eglise || '0',
            id_chef: '0',
            date_de_creation: date_aujourdhui(new Date()),
            id_c: { value: '', label: '' }
        },
        validationSchema: yup.object({
            lib_groupe: yup.string().required('Ce champ est requis'),
            id_eglise: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            description: yup.string().notRequired(),
            id_chef: yup.string().notOneOf(['0'], 'Ce champ est requis'),
            date_de_creation: yup.string().required('Ce champ est requis'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/departement`, { values }).then(data => {
                toast.success("Success")
                formik.resetForm()
                handleModal(false)
                // fetch()
                setLoading(false)
                window.location.reload()
            })
                .catch(err => {
                    toast.error("Echec")
                    handleModal(false);
                    setLoading(false)
                })
        }
    })

    const loadMembers = async () => {
        const query = new URLSearchParams({
            Ministre: true,
            Ouvrier: true,
            eglise: formik.values.id_eglise
        }).toString()
        try {
            const { data } = await axios.get(`/membre/liste?${query}`)
            setOptions(data.res.map((item) => ({ value: item.id, label: item.prenom + ' ' + item.nom })))
        } catch (err) {
        }
    }



    return (
        <Modal show={modal === 'ajouter-dep'} onHide={() => handleModal()} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Ajouter Un Departement
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="lib_groupe" className="fw-bold col-sm-3 col-form-label">
                            Nom
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="lib_groupe" id="lib_groupe" placeholder='Nom' {...formik.getFieldProps('lib_groupe')} />
                            {formik.touched.lib_groupe && formik.errors.lib_groupe ? (<small className='text-danger'>{formik.errors.lib_groupe}</small>) : null}
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

                    {permissions.superAdmin &&
                        <div className="form-group row mb-3">
                            <label htmlFor="id_eglise" className="fw-bold col-sm-3 col-form-label">
                                Eglise
                            </label>
                            <div className="col-sm-9">
                                <select type="text" className='form-control form-select' name="id_eglise" id="id_eglise" placeholder='Nom' {...formik.getFieldProps('id_eglise')}>
                                    <option value={0} disabled>Eglise </option>
                                    {eglises.map((eglise) =>
                                        <option key={eglise.id_eglise} value={eglise.id_eglise}>{eglise.lib_eglise}</option>
                                    )}
                                </select>
                                {formik.touched.id_eglise && formik.errors.id_eglise ? (<small className='text-danger'>{formik.errors.id_eglise}</small>) : null}
                            </div>
                        </div>
                    }

                    <div className="form-group row mb-3">
                        <label htmlFor="id_chef" className="fw-bold col-sm-3 col-form-label">
                            Chef
                        </label>
                        <div className="col-sm-9">
                            <Select name='id_chef' id='id_chef' options={options} value={options ? options.find(option => option.value === formik.values.id_chef) : ''}
                                onChange={(option) => formik.setFieldValue('id_chef', option.value)}
                                placeholder={"Chef departement"}
                                onMenuOpen={() => loadMembers()} />
                            {formik.touched.id_chef && formik.errors.id_chef ? (<small className='text-danger'>{formik.errors.id_chef}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="date_de_creation" className="fw-bold col-sm-3 col-form-label">
                            Date
                        </label>
                        <div className="col-sm-9">
                            <input type="date" className='form-control' name="date_de_creation" id="date_de_creation" placeholder='Date' {...formik.getFieldProps('date_de_creation')} />
                            {formik.touched.date_de_creation && formik.errors.date_de_creation ? (<small className='text-danger'>{formik.errors.date_de_creation}</small>) : null}
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-danger btn-outline-danger`} onClick={() => handleClose()}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"primary"} name={"Ajouter"} />
                </Modal.Footer>
            </form>
        </Modal>
    )
}



export const ModifierModal = ({ groupe, setModal, modal, fetch }) => {
    const { permissions, admin, eglises } = AppGlobalContext()

    const [options, setOptions] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadMembers = async () => {
            const query = new URLSearchParams({
                Ministre: true,
                Ouvrier: true,
                eglise: groupe.id_eglise
            }).toString()
            try {
                const { data } = await axios.get(`/membre/liste?${query}`)
                setOptions(data.res.map((item) => ({ value: item.id, label: item.prenom + ' ' + item.nom })))
            } catch (err) {
            }
        }
        if (groupe.id_eglise) loadMembers();
    }, [groupe.id_eglise])

    const initialValues = {
        lib_groupe: groupe.lib_groupe,
        description: groupe.description,
        id_eglise: groupe.id_eglise,
        id_chef: groupe.id_chef ? groupe.id_chef : '0',
    }
    const validationSchema = yup.object({
        lib_groupe: yup.string().required('Ce champ est requis'),
        id_eglise: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        description: yup.string().notRequired(),
        id_chef: yup.string().notOneOf(['0'], 'Ce champ est requis'),
    })
    const submit = (values) => {
        setLoading(true)
        axios.put(`/departement/${groupe.id_groupe}`, {
            values
        }).then(data => {
            toast.success('Modifié');
            setModal(false)
            fetch()
            setLoading(false)
            // window.location.reload()

        })
            .catch(err => {
                toast.error(err.message);
                handleModal()
                setLoading(false)
            })
    }

    return (
        <Modal show={modal === 'modifier-dep'} onHide={() => setModal(null)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Modification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form >

                        <FormInputWithLabel name={"lib_groupe"} title={"Nom"} />
                        <FormInputWithLabel name={"description"} title={"Description"} />
                        {permissions.superAdmin &&
                            <FormSelectWithLabel name={'id_eglise'} title={"Eglise"} disabled={true}>
                                <option disabled value={0}>Choississez le eglise </option>
                                {eglises.map((eglise) =>
                                    <option key={eglise.id_eglise} value={eglise.id_eglise}>{eglise.lib_eglise}</option>
                                )}
                            </FormSelectWithLabel>
                        }


                        <div className='form-group row mb-2'>
                            <label htmlFor="id_chef" className="fw-bold col-sm-3 col-form-label">
                                Chef
                            </label>
                            <div className="col-sm-9">
                                <Field name='id_chef'>
                                    {({ field, form }) => (
                                        <Select {...field}
                                            name='id_chef'
                                            options={options}
                                            value={options ? options.find(option => option.value === form.values.id_chef) : ''}
                                            placeholder={"Choisissez le chef"}
                                            onChange={(option) => form.setFieldValue('id_chef', option.value)}
                                        />
                                    )}
                                </Field>
                                <small className='text-danger'><ErrorMessage name="id_chef" /></small>
                            </div>
                        </div>

                        <Modal.Footer>
                            <button type="button" className={`btn btn-danger btn-outline-danger`} onClick={() => setModal(null)}>
                                Fermer
                            </button>
                            <LoadingButton2 loading={loading} color={"primary"} name={"Modifier"} />
                        </Modal.Footer>

                    </Form>
                </Formik>
            </Modal.Body>
        </Modal>
    );
}



export function SupprimerModal({ groupe, modal, setModal }) {
    const [loading, setLoading] = useState(false)

    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/departement/${groupe.id_groupe}`)
            .then((data) => {
                setModal(null);
                toast.success("Success")
                window.location.reload()
                setLoading(false)
            }).catch(err => {
                toast("Echec");
                setModal(null);
                setLoading(false)
            })
    }
    return (
        <Modal show={modal === 'supprimer-dep'} onHide={() => setModal(null)} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title>Supprimer Departement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer ce departement: {groupe.lib_groupe}
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse`} onClick={() => setModal(null)}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"danger"} name={"Supprimer"} />
                </Modal.Footer>
            </form>
        </Modal>
    )
}





export function SupprimerModalMembre({ depMembre, modal, setModal, fetch }) {
    const [loading, setLoading] = useState(false)

    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/departement/${depMembre.dep}/supprimer/${depMembre.membre.id}`)
            .then((data) => {
                setModal(null);
                toast.success("Success");
                fetch()
                setLoading(false)
            }).catch(err => {
                setModal(null);
                toast.error("Echec");
                setLoading(false)
            })

    }
    return (
        <Modal show={modal === 'retirer-membre'} onHide={() => setModal(null)} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title>Retirer Membre</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous retirer {depMembre.membre?.nom} {depMembre.membre?.prenom} du departement
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse`} onClick={() => setModal(null)}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"danger"} name={"Retirer"} />
                </Modal.Footer>
            </form>
        </Modal>
    )
}

