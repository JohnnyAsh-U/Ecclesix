import React, { useState } from 'react'
import { Form, Field, ErrorMessage, Formik } from 'formik'
import * as yup from 'yup';
import Select from 'react-select';
import useFetch from '../../hooks/fetchHook';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import Modal from 'react-bootstrap/Modal'
import { FormSelectWithLabel } from '../../components/Inputbox/form-select';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';
import axios from '../../utils/config/axiosConfig'



export const ModifierModal = ({ modal, eglise, setModal }) => {
    const [loading, setLoading] = useState(false)
    const query = new URLSearchParams({
        Ministre: true
    }).toString()
    const { data: data2, error: error2, loading: loading3 } = useFetch(`/membre/liste?${query}`, 'get')
    const { data, error, loading: loading2 } = useFetch('/eglise/type', 'get')
    const { data: data1, error: error1, loading: loading1 } = useFetch('/eglise/ville', 'get')
    const lesMinistres = data2 || {}
    const types  = data || {}
    const villes = data1 || {}

    const initialValues = {
        // id_eglise : props.eglise.id_eglise,
        church_name: eglise.church_name,
        type: eglise.type ?? 0,
        city: eglise.city ?? 0,
        leader: eglise.leader ?? 0,
        leader2: eglise.leader2 ?? 0,
        opening_date: eglise.opening_date,
        address: eglise.address
    }
    const validationSchema = yup.object({
        church_name: yup.string().required('Ce champ est requis'),
        type: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        city: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        leader: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        leader2: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        opening_date: yup.string().required('Ce champ est requis'),
        address: yup.string().required('Ce champ est requis'),
    })
    const submit = (values) => {
        setLoading(true)
        axios.put(`/eglise/${eglise.id}`, values).then(data => {
            setModal(false)
            if (data) toast.success("Success");
            window.location.reload()
        })
            .catch(err => {
                setModal(false)
                toast.error("Echec")
            }).finally(() => setLoading(false))
    }

    if (loading1 || loading2 || loading3) {
        return
    }

    if (error || error1 || error2) {
        toast.error("Impossible de charger les donnees")
        return
    }


    const options = lesMinistres.map((item) => ({ value: item.id, label: item.first_name + ' ' + item.last_name }))


    return (
        <Modal show={modal==='modifier'} onHide={() => setModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title><h5 className='fs-5'>Modification</h5></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form >

                        <FormInputWithLabel name={"church_name"} title={"Eglise"} placeholder="Eglise" />
                        <FormSelectWithLabel name={"type"} title={"Type"} placeholder="Type">
                            <option disabled value={0}>Choississez le type </option>
                            {types.map((type) =>
                                <option key={type.id} value={type.id}>{type.church_type_name}</option>
                            )}
                        </FormSelectWithLabel>

                        <FormSelectWithLabel name={"city"} title={"Ville"} placeholder="Ville">
                            <option disabled value={0}>Choississez la ville </option>
                            {villes.map((ville) =>
                                <option key={ville.id} value={ville.id}>{ville.city_name}</option>
                            )}
                        </FormSelectWithLabel>
                        <FormInputWithLabel name={"address"} title={"Situation Geo."} placeholder="Situation Geographique" as={"textarea"} />
                        <FormInputWithLabel name={"opening_date"} title={"Date Ouverture"} placeholder="Date" type={"date"} />

                        <div className='form-group row mb-2'>
                            <label htmlFor="leader" className="fw-semibold col-sm-3 col-form-label">
                                Ministre
                            </label>
                            <div className='col-sm-9' >
                                <Field name='leader'>
                                    {({ field, form }) => (
                                        <Select {...field}
                                            name='leader'
                                            options={options}
                                            value={options ? options.find(option => option.value === form.values.leader) : ''}
                                            placeholder={"Choisissez le ministre"}
                                            onChange={(option) => form.setFieldValue('leader', option.value)}
                                        />
                                    )}
                                </Field>
                                <small className='text-danger'><ErrorMessage name="leader" /></small>
                            </div>
                        </div>

                        <div className='form-group row mb-2'>
                            <label htmlFor="leader2" className="fw-semibold col-sm-3 col-form-label">
                                Assistant
                            </label>
                            <div className='col-sm-9'>
                                <Field name='leader2'>
                                    {({ field, form }) => (
                                        <Select {...field}
                                            name='leader2'
                                            options={options}
                                            value={options ? options.find(option => option.value === form.values.leader2) : ''}
                                            placeholder={"Choisissez l'assistant"}
                                            onChange={(option) => form.setFieldValue('leader2', option.value)}
                                        />
                                    )}
                                </Field>
                                <small className='text-danger'><ErrorMessage name="leader2" /></small>
                            </div>
                        </div>

                        <Modal.Footer>
                            {!loading &&
                                <button className='btn btn-outline-danger' onClick={() => setModal(false)}>
                                    Fermer
                                </button>}
                            <LoadingButton2 loading={loading} name={"Modifier"} color={"primary"} />
                        </Modal.Footer>
                    </Form>
                </Formik>
            </Modal.Body>
        </Modal>
    );
}
