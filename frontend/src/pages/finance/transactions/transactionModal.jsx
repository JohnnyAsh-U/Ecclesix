import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import _ from 'lodash'
import { useFormik, Form, Field, ErrorMessage, Formik } from 'formik'
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppGlobalContext } from '../../../hooks/AppContext';
import { LoadingButton2 } from '../../../components/buttons/loadingbuttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCancel, faCheckCircle, faClose, faCross, faEdit, faMoneyCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { formatAmount } from '../../../utils/datetime/amount';
import { ContentPermsWrapper } from '../../../utils/permissions/permwrapper';
import { FormInputWithLabel } from '../../../components/Inputbox/input';




export default function Ajouter({ type, eglise, categorie, handleModal, modal, toutComptes, comptes, ...props }) {
    const { permissions, admin } = AppGlobalContext()
    const [loading, setLoading] = useState(false)

    const title = (val) => {
        if (val == 'Credit') {
            return "Ajouter une Collecte"
        } else if (val == 'Debit') {
            return "Ajouter une Depense"
        } else if (val == 'Transfer') {
            return "Faire un Transfert"
        }
    }

    const formik = useFormik({
        initialValues: {
            description: '',
            amount: 0.00,
            from_account: 0,
            to_account: 0,
            category: 0,
            event: '0',
            added_by: admin.id,
        },
        validationSchema: yup.object({
            description: yup.string().notRequired(),
            montant: yup.number().min(1, 'Ce champ est requis'),
            from_account: type != 'Credit' && yup.string().notOneOf(['0'], 'Ce champ est requis'),
            to_account: type == 'Transfer' && yup.string().notOneOf(['0'], 'Ce champ est requis'),
            category: type != 'Transfer' && yup.string().notOneOf(['0'], 'Ce champ est requis'),
            event: type == 'Credit' && yup.string().notOneOf(['0'], 'Ce champ est requis'),
        }),
        onSubmit: values => {
            setLoading(true)
            values['church'] = eglise
            values['type'] = type
            axios.post(`/finance/transactions`, values).then(data => {
                toast.success('Success')
                formik.resetForm()
                handleModal()
            })
                .catch(err => {
                    toast.error(err.message)
                    handleModal();
                }).finally(() => setLoading(false))
        }
    })

    //Filters categories according to transaction type: Credit, Debit
    let filteredCategorie = categorie.filter(cate => cate.category_type == type)

    //filters comptes to remove the sending compte from the list of receiving compte in transfert
    const receivingCompte = toutComptes.filter(c => c.id != formik.values.id)



    return (
        <Modal alignment="center" show={modal === 'ajouter'} onHide={() => handleModal()} centered>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>{title(type)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    {type != 'Transfer' &&
                        <div className="form-group row mb-3">
                            <label htmlFor="category" className="fw-bold col-sm-3 col-form-label">
                                Categorie
                            </label>
                            <div className="col-sm-9">
                                <select className='form-control form-select' name="category" id="category" placeholder='Categorie' {...formik.getFieldProps('category')}>
                                    <option value={0} disabled>Categorie {type == 'Credit' ? 'Collecte' : 'Depense'} </option>
                                    {filteredCategorie.map((cate) =>
                                        <option key={cate.id} value={cate.id}>{cate.category_name}</option>
                                    )}
                                </select>
                                {formik.touched.category && formik.errors.category ? (<small className='text-danger'>{formik.errors.category}</small>) : null}
                            </div>
                        </div>
                    }

                    {
                        type == 'Credit' &&
                        <div className="form-group row mb-3">
                            <label htmlFor="event" className="fw-bold col-sm-3 col-form-label">
                                Evenement
                            </label>
                            <div className='col-sm-9' sm={10}>
                                <select name='event' className="form-control form-select mb-1"  {...formik.getFieldProps('event')}>
                                    <option value={0} disabled>Evenement </option>
                                    {props.evenements.map((ev) =>
                                        <option key={ev.id} value={ev.id}>{ev.event}</option>
                                    )}
                                </select>
                                {formik.touched.event && formik.errors.event ? (<small className='text-danger'>{formik.errors.event}</small>) : null}
                            </div>
                        </div>
                    }

                    {type != 'Credit' &&
                        <div className="form-group row mb-2">
                            <label htmlFor="from_account" className="fw-semibold col-sm-3 col-form-label">
                                Compte
                            </label>
                            <div className="col-sm-9">
                                <select name='from_account' className="form-control form-select mb-1"  {...formik.getFieldProps('from_account')}>
                                    <option value={0} disabled>Du Compte </option>
                                    {comptes.map((com) =>
                                        <option key={com.id} value={com.id}>{com.account_name}</option>
                                    )}
                                </select>
                                {formik.touched.account_name && formik.errors.account_name ? (<small className='text-danger'>{formik.errors.account_name}</small>) : null}
                            </div>
                        </div>}

                    {type == 'Transfer' &&
                        <div className="form-group row mb-2">
                            <label htmlFor="to_account" className="fw-semibold col-sm-3 col-form-label">
                                Compte
                            </label>
                            <div className='col-sm-9'>
                                <select name='to_account' className="form-control form-select mb-1"  {...formik.getFieldProps('to_account')}>
                                    <option value={0} disabled>Au Compte </option>
                                    {receivingCompte.map((com) =>
                                        <option key={com.id} value={com.id}>{com.account_name}</option>
                                    )}
                                </select>
                                {formik.touched.to_account && formik.errors.to_account ? (<small className='text-danger'>{formik.errors.to_account}</small>) : null}
                            </div>
                        </div>
                    }

                    <div className="form-group row mb-2">
                        <label htmlFor="amount" className="fw-semibold col-sm-3 col-form-label">
                            Montant
                        </label>
                        <div className='col-sm-9'>
                            <input type="number" className='form-control' name="amount" id="amount" {...formik.getFieldProps('amount')} />
                            {formik.touched.amount && formik.errors.amount ? (<small className='text-danger'>{formik.errors.amount}</small>) : null}
                        </div>
                    </div>


                    <div className="form-group row mb-2">
                        <label htmlFor="description" className="col-sm-3 col-form-label fw-semibold">
                            Description
                        </label>
                        <div className='col-sm-9'>
                            <textarea id="description" className="form-control" name='description' {...formik.getFieldProps('description')} rows={3} placeholder='Description'>
                            </textarea>
                            {formik.touched.description && formik.errors.description ? (<small className='text-danger'>{formik.errors.description}</small>) : null}
                        </div>
                    </div>

                </Modal.Body>

                <Modal.Footer>
                    {!loading &&
                        <button color="secondary" className='btn btn-danger btn-outline-danger' onClick={() => handleModal()}>
                            Fermer
                        </button>}
                    <LoadingButton2 loading={loading} color={"primary"} type={"submit"} name={"Ajouter"} />
                </Modal.Footer>
            </form>
        </Modal>
    )
}




export function Info({ transaction, handleModal, fetch, modal }) {
    const { permissions, admin } = AppGlobalContext()

    const [action, setAction] = useState(null)
    const [loading, setLoading] = useState(false)


    const type = (val) => {
        if (val == 'Credit') {
            return "Collecte"
        } else if (val == 'Debit') {
            return "Depense"
        } else if (val == 'Transfer') {
            return "Transfert"
        }
    }

    const timeDate = (t) => {
        if (t) {
            let d = new Date(t)
            return <>{d.toLocaleTimeString('fr')}  {d.toLocaleDateString('fr')}</>
        }
    }

    const ApprovedOrRejected = (status) => {
        if (status == 'Rejected') {
            return <>Rejecté par{' '}
                <span color='danger' className='fw-bold text-danger'>
                    <FontAwesomeIcon icon={faClose} />
                </span> : </>
        } else {
            return <>Validé par{' '}
                <span color='success' className='fw-bold text-success'>
                    <FontAwesomeIcon icon={faCheckCircle} />
                </span> : </>
        }
    }

    const title = (val) => {
        let res = ""
        if (val === 'm') {
            res = "Modifier"
        } else if (val === 's') {
            res = "Supprimer"
        } else if (val === 'r') {
            res = "Refuser"
        } else if (val === 'v') {
            res = "Valider"
        } else if (val === null) {
            res = "Info"
        }
        return res
    }


    const ShowValidationButtons = ({ trans, children }) => {
        //checks if the transaction is still pending and the admin not the owner
        //of the transaction
        if (trans.status == 'Pending' && trans.added_by != admin.id) {
            //checks if the account of the transaction is the church of the
            //admin or if the admin is a superadmin
            if (transaction.church?.id == admin.church_id) {
                return children
            }
            if (permissions.superAdmin) {
                return children
            }
        }
    }

    const ShowEditDeleteButtons = ({ trans, children }) => {
        //checks if the transaction is still pending and the admin is the owner
        //of the transaction
        if (trans.status == 'Pending' && trans.added_by == admin.id) {
            return children
        }
    }

    const validateOrRejectTransaction = async (values) => {
        setLoading(true)
        let a = action === 'v' ? 'Validate' : 'Reject'
        try {
            const { data } = await axios.put(`/finance/transactions/${transaction.id}`, { notes: values.comment, action: a })
            handleModal(null)
            fetch()
            toast.success('Success')
        } catch (err) {
            toast.error('Echec')
            handleModal(null);
        } finally {
            setLoading(false)
            setAction(null)
        }
    }


    const DeleteTransaction = async (values) => {
        setLoading(true)
        const query = new URLSearchParams({ notes: values.comment }).toString()
        let data
        try {
            if (action == 's') {
                data = await axios.delete(`/finance/transactions/${transaction.id}?${query}`)
            }
            handleModal()
            if (data) toast.success('Success');
        } catch (err) {
            handleModal()
            toast.error('Echec')
        } finally {
            setLoading(false)
            setAction(null)
        }
    }


    return (
        <Modal show={modal === 'trans'} onHide={() => { setAction(null); handleModal() }} centered>
            <Modal.Header closeButton>
                <Modal.Title className='fs-5'>{title(action)} Transaction #{transaction.id}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <ul className='list-group'>
                    <li className='list-group-item'>
                        Type
                        <span className='float-end fw-semibold'>
                            {type(transaction.transaction_type)}
                        </span>
                    </li>
                    <li className='list-group-item'>
                        Montant
                        <span className='float-end fw-semibold'>
                            {formatAmount(transaction.amount)}
                        </span>
                    </li>
                    <li className='list-group-item'>
                        Enreg. par :
                        <span className='float-end fw-semibold'>
                            {transaction.added_by_name}
                        </span>
                    </li>
                    <li className='list-group-item'>
                        {ApprovedOrRejected(transaction.status)}
                        <span className='float-end fw-semibold'>
                            {transaction.approved_by_name}
                        </span>
                    </li>
                    <li className='list-group-item'>
                        Date
                        <span className='float-end'>{timeDate(transaction.created_at)}</span>
                    </li>
                </ul>

                {action === 's' &&
                    <Formik
                        initialValues={{ comment: '' }}
                        validationSchema={yup.object({ comment: yup.string().required('Ce champ est requis') })}
                        onSubmit={DeleteTransaction}
                    >
                        <Form className='mt-3' >
                            <FormInputWithLabel name={"comment"} title={"Observation"} placeholder={"Observation"} />
                            <Modal.Footer>
                                {!loading &&
                                    <button className="btn btn-danger btn-outline-danger" onClick={() => setAction(null)}>
                                        Fermer
                                    </button>}
                                <LoadingButton2 color={"danger"} loading={loading} name={"Supprimer"} type={"submit"} />
                            </Modal.Footer>
                        </Form>
                    </Formik>
                }


                {(action === 'r' || action === 'v') ?
                    <Formik
                        initialValues={{ comment: '' }}
                        validationSchema={yup.object({ comment: yup.string().required('Ce champ est requis') })}
                        onSubmit={validateOrRejectTransaction}
                    >
                        <Form className='mt-3' >
                            <FormInputWithLabel name={"comment"} title={"Observation"} placeholder={"Observation"} />

                            <Modal.Footer>
                                {!loading &&
                                    <button className="btn btn-outline-dark" onClick={() => setAction(null)}>
                                        Fermer
                                    </button>}
                                <LoadingButton2
                                    color={action === 'v' ? 'success' : 'danger'}
                                    loading={loading}
                                    name={<><FontAwesomeIcon icon={faCheckCircle} />{action === 'v' ? ' Valider' : ' Rejecter'}</>}
                                    type={"submit"} />
                            </Modal.Footer>
                        </Form>
                    </Formik> : ''
                }
            </Modal.Body>


            {!transaction.parent && !action &&
                <Modal.Footer>
                    <ShowEditDeleteButtons trans={transaction}>
                        <button className='btn btn-outline-danger rounded float-end mt-2'
                            type='submit'
                            onClick={() => setAction("s")}
                        > <FontAwesomeIcon icon={faTrash} /> Supprimer
                        </button>
                    </ShowEditDeleteButtons>


                    <ShowValidationButtons trans={transaction}>
                        <ContentPermsWrapper requiredPerms={['confirmer_transaction']}>
                            <button className='btn btn-outline-success rounded float-end mt-2'
                                type='submit'
                                onClick={() => setAction('v')}
                            > <FontAwesomeIcon icon={faMoneyCheck} /> Valider
                            </button>
                            <button className='btn btn-outline-danger rounded float-end mt-2'
                                type='submit'
                                onClick={() => setAction('r')}
                            > <FontAwesomeIcon icon={faCancel} /> Rejecter
                            </button>
                        </ContentPermsWrapper>
                    </ShowValidationButtons>
                </Modal.Footer>
            }

        </Modal>
    )
}

