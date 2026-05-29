import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useFormik, Form, Formik } from 'formik'
import axios from '../../utils/config/axiosConfig'
import * as yup from 'yup';
import { AppGlobalContext } from '../../hooks/AppContext';
import { toast } from 'react-toastify';
import { FormInputWithLabel } from '../../components/Inputbox/input';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';
import { FormSelectWithLabel } from '../../components/Inputbox/form-select';
import { formatDate } from '../../utils/datetime/month';


export const ModifierModal = ({ evenement, modal, fetch, handleModal, listetype }) => {
    const { permissions, admin, eglises } = AppGlobalContext()
    const [loading, setLoading] = useState(false)

    const initialValues = {
        id: evenement.id,
        event_name: evenement.event_name,
        church: evenement.church,
        men: evenement.men,
        women: evenement.women,
        children: evenement.children,
    }

    const validationSchema = yup.object({
        event_name: yup.string().notRequired(),
        church: yup.string().required('Ce champ est requis'),
    })

    const submit = (values) => {
        setLoading(true)
        let id = evenement.id;
        values.total = values.men + values.women + values.children
        axios.patch(`/evenement/${id}`, values ).then(data => {
            handleModal()
            toast.success("Success")
            fetch()
        }).catch(err => {
            toast.error("Echec")
            handleModal()
        }).finally(() => setLoading(false))
    }

    return (
        <Modal show={modal === 'modifier-evenement'} onHide={() => handleModal()} centered>
            <Modal.Header closeButton>
                <Modal.Title>Modification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={submit} >
                    <Form >

                        <FormSelectWithLabel name={'id_type_evenement'} title={"Evenement"} disabled={true}>
                            <option disabled value={0}>Choississez le eglise </option>
                            {listetype.map((type) =>
                                <option key={type.id} value={type.id}>{type.event_type_name}</option>
                            )}
                        </FormSelectWithLabel>
                        <FormInputWithLabel name={"event_name"} title={"Detail"} />
                        {permissions.superAdmin &&
                            <FormSelectWithLabel name={'church'} title={"Eglise"} disabled={true}>
                                <option disabled value={0}>Choississez le eglise </option>
                                {eglises.map((eglise) =>
                                    <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                )}
                            </FormSelectWithLabel>
                        }
                        <FormInputWithLabel name={"men"} title={"Hommes"} type={"number"} />
                        <FormInputWithLabel name={"women"} title={"Femmes"} type={"number"} />
                        <FormInputWithLabel name={"children"} title={"Enfants"} type={"number"} />


                        <Modal.Footer>
                            <button type="button" className={`btn btn-danger btn-outline-danger`} onClick={() => handleModal()}>
                                Fermer
                            </button>
                            <LoadingButton2 loading={loading} color={"primary"} name={"Modifier"} type={"submit"} />
                        </Modal.Footer>

                    </Form>
                </Formik>
            </Modal.Body>
        </Modal>
    );
}



export function SupprimerModal({ evenement, modal, setModal, fetch, listetype }) {
    const [loading, setLoading] = useState(false)

    const suppression = async (e) => {
        setLoading(true)
        e.preventDefault()
        axios.delete(`/evenement/${evenement.id}`)
            .then((data) => {
                setModal(null);
                toast.success("Success")
                fetch()
                setLoading(false)
            }).catch(err => {
                toast.error("Echec");
                setModal(null);
                setLoading(false)
            })
    }
    return (
        <Modal show={modal === 'supprimer-evenement'} onHide={() => setModal(null)} centered>
            <form onSubmit={suppression}>
                <Modal.Header>
                    <Modal.Title>Supprimer Evenement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        Supprimer <strong>{listetype.find(type => type.id == evenement.event_type)?.event_type_name}</strong>  du
                        {evenement.event_date ? ' ' + formatDate(evenement?.event_date) : ''}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse`} onClick={() => setModal(null)}>
                        Fermer
                    </button>
                    <LoadingButton2 loading={loading} color={"danger"} name={"Supprimer"} type = "submit"/>
                </Modal.Footer>
            </form>
        </Modal>
    )
}