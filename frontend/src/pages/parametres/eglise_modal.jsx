import React, { useState } from 'react'
import { useFormik, Form, Field, ErrorMessage, Formik } from 'formik'
import Select from 'react-select';
import * as yup from 'yup';
import Modal from 'react-bootstrap/Modal'
import { toast } from 'react-toastify';
import axios from 'axios';
import useFetch from '../../hooks/fetchHook';
import { date_aujourdhui } from '../../utils/datetime/formatdate';
import { capitalizeFirstLetter } from '../../utils/string/formatting';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';




function AjouterModal({ setModal, modal }) {
    const [loading, setLoading] = useState(false)
    const query = new URLSearchParams({
        Ministre: true
    }).toString()
    const { data: data2, error: error2, loading: loading3 } = useFetch(`/membre/liste?${query}`, 'get')
    const { data, error, loading: loading2 } = useFetch('/eglise/type', 'get')
    const { data: data1, error: error1, loading: loading1 } = useFetch('/eglise/ville', 'get')
    const  lesMinistres = data2 || {}
    const types = data || {}
    const villes  = data1 || {}

    const formik = useFormik({
        initialValues: {
            church_name: '',
            type: '',
            city: '',
            leader: '',
            leader2: '',
            opening_date: date_aujourdhui(new Date()),
            address: ''
        },
        validationSchema: yup.object({
            church_name: yup.string().required('Ce champ est requis'),
            type: yup.string().required('Ce champ est requis'),
            city: yup.string().required('Ce champ est requis'),
            leader: yup.string().required('Ce champ est requis'),
            leader2: yup.string().notRequired(),
            opening_date: yup.string().required('Ce champ est requis'),
            address: yup.string().required('Ce champ est requis'),
        }),
        onSubmit: values => {
            setLoading(true)
            axios.post(`/eglise`, values).then(data => {
                formik.resetForm()
                setModal(null);
                if (data) toast.success("Success");
                window.location.reload()
            }).catch(err => {
                toast.error("Echec")
                setLoading(false)
            }).finally(() => setLoading(false))
        }
    })

    if (loading1 || loading2 || loading3) {
        return
    }

    if (error || error1 || error2) {
        toast.error("Impossible de charger les donnees")
        return
    }

    const options = lesMinistres.map((item) => ({ value: item.id, label: capitalizeFirstLetter(item.last_name) + ' ' + capitalizeFirstLetter(item.first_name) }))


    return (
        <Modal show={modal === 'ajouter'} onHide={() => setModal(null)} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title><h5 className='fs-5'>Ajouter Eglise</h5></Modal.Title>
                </Modal.Header>
                <Modal.Body>


                    <div className="form-group row mb-2">
                        <label htmlFor="church_name" className="fw-semibold col-sm-3 col-form-label">
                            Eglise
                        </label>
                        <div className='col-sm-9' sm={10}>
                            <input type="text" className='form-control' name="church_name" id="church_name" placeholder='Eglise' {...formik.getFieldProps('church_name')} />
                            {formik.touched.church_name && formik.errors.church_name ? (<small className='text-danger'>{formik.errors.church_name}</small>) : null}
                        </div>
                    </div>


                    <div className="form-group row mb-2">
                        <label htmlFor="type" className="fw-semibold col-sm-3 col-form-label">
                            Type
                        </label>
                        <div className='col-sm-9'>
                            <select size="md" name='type' className="form-control form-select mb-1"  {...formik.getFieldProps('type')}>
                                <option value={0}>Choississez le type </option>
                                {types.map((type) =>
                                    <option key={type.id} value={type.id}>{type.church_type_name}</option>
                                )}
                            </select>
                            {formik.touched.type && formik.errors.type ? (<small className='text-danger'>{formik.errors.type}</small>) : null}
                        </div>
                    </div>


                    <div className="form-group row mb-2">
                        <label htmlFor="city" className="fw-semibold col-sm-3 col-form-label">
                            Ville
                        </label>
                        <div className='col-sm-9'>
                            <select size="md" name='city' className="form-control form-select mb-1"  {...formik.getFieldProps('city')}>
                                <option value={0}>Choississez la Ville </option>
                                {villes.map((ville) =>
                                    <option key={ville.id} value={ville.id}>{ville.city_name}</option>
                                )}
                            </select>
                            {formik.touched.city && formik.errors.city ? (<small className='text-danger'>{formik.errors.city}</small>) : null}
                        </div>
                    </div>


                    <div className="form-group row mb-2">
                        <label htmlFor="address" className="col-sm-3 col-form-label fw-semibold">
                            Situation Geo.
                        </label>
                        <div className='col-sm-9'>
                            <textarea id="address" className='form-control' name='address' {...formik.getFieldProps('address')} rows={3} placeholder='Situation Geographique'>
                            </textarea>
                            {formik.touched.address && formik.errors.address ? (<small className='text-danger'>{formik.errors.address}</small>) : null}
                        </div>
                    </div>


                    <div className="form-group row mb-2">
                        <label htmlFor="opening_date" className="fw-semibold col-sm-3 col-form-label">
                            Date
                        </label>
                        <div className='col-sm-9'>
                            <input type="date" className='form-control' name="opening_date" id="opening_date" {...formik.getFieldProps('opening_date')} />
                            {formik.touched.opening_date && formik.errors.opening_date ? (<small className='text-danger'>{formik.errors.opening_date}</small>) : null}
                        </div>
                    </div>

                    <div className='form-group row mb-2'>
                        <label htmlFor="leader" className="fw-semibold col-sm-3 col-form-label">
                            Ministre
                        </label>
                        <div className='col-sm-9' >
                            <Select name='leader' id='leader' options={options} value={options ? options.find(option => option.value === formik.values.leader) : ''}
                                onChange={(option) => formik.setFieldValue('leader', option.value)}
                                placeholder={"Choisissez le ministre"} />
                            {formik.touched.leader && formik.errors.leader ? (<small className='text-danger'>{formik.errors.leader}</small>) : null}
                        </div>
                    </div>

                    <div className='form-group row mb-2'>
                        <label htmlFor="leader2" className="fw-semibold col-sm-3 col-form-label">
                            Assistant
                        </label>
                        <div className='col-sm-9'>
                            <Select name='leader2' id='leader2' options={options} value={options ? options.find(option => option.value === formik.values.leader2) : ''}
                                onChange={(option) => formik.setFieldValue('leader2', option.value)}
                                placeholder={"Choisissez l'Assistant"} />
                            {formik.touched.leader2 && formik.errors.leader2 ? (<small className='text-danger'>{formik.errors.leader2}</small>) : null}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    {!loading &&
                        <button className='btn btn-outline-danger' onClick={() => setModal(false)}>
                            Fermer
                        </button>}
                    <LoadingButton2 loading={loading} name={"Ajouter"} color={"primary"} type="submit" />
                </Modal.Footer>
            </form>
        </Modal>
    )
}
export default AjouterModal



export function SupprimerModal({ eglise, modal, setModal }) {
    const [loading, setLoading] = useState(false)

    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/eglise/${eglise.id}`)
            .then((data) => {
                if (data) toast.success("Success");
                window.location.reload()
            }).catch(err => {
                toast.error("Echec");
            }).finally(()=>{setModal(false);setLoading(false)})
    }

    return (
        <Modal  show={modal === 'supprimer'} onHide={() => setModal(false)} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title>Supprimer {eglise.church_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer l'eglise : <span className='text-danger'>{eglise.church_name}</span> ?
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
