import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Field, ErrorMessage, Formik } from 'formik'
import axios from '../../utils/config/axiosConfig'
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
            department_name: '',
            description: '',
            church: admin.church_id || '0',
            department_head: '',
            // id_c: { value: '', label: '' }
        },
        validationSchema: yup.object({
            department_name: yup.string().required('Ce champ est requis'),
            church: yup.string().notOneOf([0]).required('Ce champ est requis'),
            description: yup.string().notRequired(),
            department_head: yup.string().required('Ce champ est requis'),
            // date_de_creation: yup.string().required('Ce champ est requis'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/departement`, values).then(data => {
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

    const loadMembers = async (churchId = formik.values.church) => {
        if (!churchId || churchId === '0') {
            setOptions([])
            return
        }

        const query = new URLSearchParams({
            Ministre: true,
            Ouvrier: true,
            eglise: churchId
        }).toString()
        try {
            const { data } = await axios.get(`/membre/liste?${query}`)
            setOptions(data.map((item) => ({ value: item.id, label: item.get_full_name })))
        } catch (err) {
            setOptions([])
        }
    }

    useEffect(() => {
        if (modal === 'ajouter-dep') {
            formik.setFieldValue('department_head', '')
            loadMembers(formik.values.church)
        }
    }, [formik.values.church, modal])


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
                        <label htmlFor="department_name" className="fw-bold col-sm-3 col-form-label">
                            Nom
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="department_name" id="department_name" placeholder='Nom' {...formik.getFieldProps('department_name')} />
                            {formik.touched.department_name && formik.errors.department_name ? (<small className='text-danger'>{formik.errors.department_name}</small>) : null}
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
                            <label htmlFor="church" className="fw-bold col-sm-3 col-form-label">
                                Eglise
                            </label>
                            <div className="col-sm-9">
                                <select
                                    type="text"
                                    className='form-control form-select'
                                    name="church"
                                    id="church"
                                    placeholder='Eglise'
                                    {...formik.getFieldProps('church')}
                                    onChange={(e) => {
                                        formik.handleChange(e)
                                        formik.setFieldValue('department_head', '')
                                    }}
                                >
                                    <option value={0} disabled>Eglise </option>
                                    {eglises.map((eglise) =>
                                        <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                    )}
                                </select>
                                {formik.touched.church && formik.errors.church ? (<small className='text-danger'>{formik.errors.church}</small>) : null}
                            </div>
                        </div>
                    }

                    <div className="form-group row mb-3">
                        <label htmlFor="id_chef" className="fw-bold col-sm-3 col-form-label">
                            Chef
                        </label>
                        <div className="col-sm-9">
                            <Select name='department_head' id='department_head' options={options} value={options ? options.find(option => option.value === formik.values.department_head) : ''}
                                onChange={(option) => formik.setFieldValue('department_head', option.value)}
                                placeholder={"Chef departement"}
                                onMenuOpen={() => loadMembers()} />
                            {formik.touched.department_head && formik.errors.department_head ? (<small className='text-danger'>{formik.errors.department_head}</small>) : null}
                        </div>
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-danger btn-outline-danger`} onClick={() => handleModal()}>
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

    const loadMembers = async (churchId = groupe.church) => {
        if (!churchId || churchId === '0') {
            setOptions([])
            return
        }

        const query = new URLSearchParams({
            Ministre: true,
            Ouvrier: true,
            eglise: churchId
        }).toString()
        try {
            const { data } = await axios.get(`/membre/liste?${query}`)
            setOptions(data.map((item) => ({ value: item.id, label: item.get_full_name })))
        } catch (err) {
            setOptions([])
        }
    }

    useEffect(() => {
        if (groupe.church) loadMembers(groupe.church);
    }, [groupe.church])

    const initialValues = {
        department_name: groupe.department_name,
        description: groupe.description,
        church: groupe.church || '',
        department_head: groupe.department_head || '',
    }
    const validationSchema = yup.object({
        department_name: yup.string().required('Ce champ est requis'),
        church: yup.string().required('Ce champ est requis'),
        description: yup.string().notRequired(),
        department_head: yup.string().required( 'Ce champ est requis'),
    })
    const submit = (values) => {
        setLoading(true)
        axios.patch(`/departement/${groupe.id}`,values).then(data => {
            toast.success('Modifié');
            setModal(false)
            fetch()
            setLoading(false)
            // window.location.reload()

        })
            .catch(err => {
                toast.error(err.message);
                setModal(null)
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
                    {({ values, setFieldValue }) => (
                        <Form >

                            <FormInputWithLabel name={"department_name"} title={"Departement"} />
                            <FormInputWithLabel name={"description"} title={"Description"} />
                            {permissions.superAdmin &&
                                <div className="form-group row mb-2">
                                    <label className="col-sm-3 col-form-label fw-bold">Eglise</label>
                                    <div className="col-sm-9">
                                        <Field
                                            name='church'
                                            className="form-control form-select"
                                            as={'select'}
                                            onChange={(e) => {
                                                const churchId = e.target.value
                                                setFieldValue('church', churchId)
                                                setFieldValue('department_head', '')
                                                loadMembers(churchId)
                                            }}
                                        >
                                            <option disabled value={0}>Choississez le eglise </option>
                                            {eglises.map((eglise) =>
                                                <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                            )}
                                        </Field>
                                        <small className='text-danger'><ErrorMessage name="church" /></small>
                                    </div>
                                </div>
                            }


                            <div className='form-group row mb-2'>
                                <label htmlFor="department_head" className="fw-bold col-sm-3 col-form-label">
                                    Chef
                                </label>
                                <div className="col-sm-9">
                                    <Field name='department_head'>
                                        {({ field, form }) => (
                                            <Select {...field}
                                                name='department_head'
                                                options={options}
                                                value={options ? options.find(option => option.value === form.values.department_head) : ''}
                                                placeholder={"Choisissez le chef"}
                                                onChange={(option) => form.setFieldValue('department_head', option.value)}
                                            />
                                        )}
                                    </Field>
                                    <small className='text-danger'><ErrorMessage name="department_head" /></small>
                                </div>
                            </div>

                            <Modal.Footer>
                                <button type="button" className={`btn btn-danger btn-outline-danger`} onClick={() => setModal(null)}>
                                    Fermer
                                </button>
                                <LoadingButton2 loading={loading} color={"primary"} name={"Modifier"} />
                            </Modal.Footer>

                        </Form>
                    )}
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
        axios.delete(`/departement/${groupe.id}`)
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
                    Voulez vous supprimer ce departement: {groupe.department_name}
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
                    Voulez vous retirer {depMembre.membre?.get_full_name} du departement
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

