import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from 'axios';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';
import Select from 'react-select'
import _ from 'lodash'




export function AjouterRole({ fetch, modal, listePerms, handleModal, eglises }) {
    const [loading, setLoading] = useState(false)

    // const rolePerms = props.role.permissions.map(perm => ({ label: perm.description, value: perm.id_permission }))

    const [permissions, setPermissions] = useState([])

    const formik = useFormik({
        initialValues: {
            role_name: '',
            description: ''
        },
        validationSchema: yup.object({
            role_name: yup.string().required('Ce champ est requis'),
            description: yup.string().required('Ce champ est requis')
        }),
        onSubmit: async (values) => {
            setLoading(true)
            try {
                const { data: role } = await axios.post('/admin/roles', values )
                let data
                if (permissions.length > 0) {
                    data = await axios.post(`/admin/roles/${role.id}/permissions`,  permissions)
                }
                formik.resetForm()
                setPermissions([])
                toast.success("Success")
                fetch()
                handleModal()
            } catch (err) {
                handleModal()
                toast.error("Echec")
            } finally {
                setLoading(false)

            }
        }
    })

    const options = listePerms && listePerms.map(obj => ({ label: obj.name, value: obj.id }))


    return (
        <Modal show={modal === 'ajouter'} onHide={() => handleModal(null)} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>
                        Ajouter Un Role
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group row mb-3">
                        <label htmlFor="role_name" className="fw-bold col-sm-3 col-form-label">
                            Role
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="role_name" id="role_name" placeholder='Role' {...formik.getFieldProps('role_name')} />
                            {formik.touched.role_name && formik.errors.role_name ? (<small className='text-danger'>{formik.errors.role_name}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="type" className="fw-bold col-sm-3 col-form-label">
                            Description
                        </label>
                        <div className="col-sm-9">
                            <input type="text" className='form-control' name="description" id="description" placeholder='Description' {...formik.getFieldProps('description')} />
                            {formik.touched.description && formik.errors.description ? (<small className='text-danger'>{formik.errors.description}</small>) : null}
                        </div>
                    </div>

                    <div className="form-group row mb-3">
                        <label htmlFor="id_eglise" className="fw-bold col-sm-3 col-form-label">
                            Permissions
                        </label>
                        <div className="col-sm-9">
                            <Select isMulti value={permissions} options={options} onChange={(val) => setPermissions(val)} />
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






export const ModifierRole = ({ role, listePerms, modal, handleModal, fetch }) => {
    const [loading, setLoading] = useState(false)

    const rolePerms = role.permission?.map(perm => ({ label: perm.name, value: perm.id }))

    const [permissions, setPermissions] = useState(rolePerms)

    const initialValues = {
        role_name: role?.role_name,
        description: role?.description
    }
    const validationSchema = yup.object({
        role_name: yup.string().required('Ce champ est requis'),
        description: yup.string().required('Ce champ est requis')
    })


    const submit = async (values) => {
        setLoading(true)
        try {
            const { data } = await axios.patch(`/admin/roles/${role.id}`, values )
            const { data: data1 } = await axios.post(`/admin/roles/${role.id}/permissions`, permissions)
            setPermissions([])
            handleModal()
            toast.success("Success")
            fetch()
        } catch (err) {
            handleModal()
            toast.error("Echec")
        } finally {
            setLoading(false)
        }
    }
    const options = listePerms && listePerms.map(obj => ({ label: obj.name, value: obj.id }))

    return (
        <Modal show={modal === 'modifier'} onHide={() => handleModal(null)} centered>
            <Modal.Header closeButton>
                <Modal.Title className='fs-5'>
                    Modifier Role
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form>
                        <FormInputWithLabel name={"role_name"} title={"Role"} placeholder={"Role"} />
                        <FormInputWithLabel name={"description"} title={"Description"} placeholder={"Description"} />
                        <div className="form-group row mb-2">
                            <label className="col-sm-3 col-form-label fw-bold">Permissions</label>
                            <div className="col-sm-9">
                                <Select isMulti value={permissions} options={options} onChange={(val) => setPermissions(val)} />
                            </div>
                        </div>
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



export function SupprimerRole({ role, modal, handleModal, fetch }) {
    const [loading, setLoading] = useState(false)


    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/admin/roles/${role.id}`)
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
                    <Modal.Title className='fs-5'>Supprimer Ce role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer ce role : <span className='text-danger'>{role?.role_name}</span> ?
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








