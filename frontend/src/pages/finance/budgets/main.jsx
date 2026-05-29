import React, { useEffect, useState } from 'react'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as yup from 'yup';
import { ContentPermsWrapper } from '../../../utils/permissions/permwrapper';
import { AppGlobalContext } from '../../../hooks/AppContext';
import axios from '../../../utils/config/axiosConfig'
import { toast } from 'react-toastify';
import useFetch from '../../../hooks/fetchHook';
import { LoadingData } from '../../../components/Loading/loading';
import { formatDate } from '../../../utils/datetime/month';
import { formatAmount } from '../../../utils/datetime/amount';
import { faArrowRight, faCalendar, faCaretUp, faCartPlus, faEdit, faMoneyBill, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormInputWithLabel } from '../../../components/Inputbox/input';


function Main({ id_eglise, filters, modal, setBudget, setModal }) {
    const { admin, permissions } = AppGlobalContext()
    const [viewDetail, setViewDetail] = useState(null)
    const [budgetDetail, setBudgetDetail] = useState([])
    const [transCategorie, setTransCategorie] = useState([])
    const [details, setDetails] = useState({})
    const [action, setAction] = useState(null)
    const [budgetLoading, setBudgetLoading] = useState(false)

    const query = new URLSearchParams({
        ...filters,
        id_eglise
    }).toString()
    const { data, reload, error, loading } = useFetch(`/finance/budgets?${query}`, 'get')

    const budgets = data || {}


    const fetchBudgetDetails = async (id) => {
        setBudgetLoading(true)
        if (viewDetail === id) {
            setViewDetail(null)
            return
        }
        setViewDetail(id)
        try {
            const { data } = await axios.get('/finance/budgets/' + id);
            setBudgetDetail(data.data)
            setTransCategorie(data.transCategorie)
            setDetails(data.details)
        } catch (err) {
            toast.error('Impossible de charger les donnees')
        } finally {
            setBudgetLoading(false)
        }
    }


    //Checks if the budget end date is past, before returning
    // add expenses icons
    const BudgetDateCheck = ({ item, children }) => {
        if (new Date(item.end_date).setHours(23, 59) < new Date()) {
            return null;
        }
        if (parseFloat(item.allocated_amount) <= parseFloat(item.actual_amount)) {
            return null;
        }
        return children
    }

    const Statut = {
        Pending: "warning",
        Validated: "",
        Rejected: "danger"
    }



    const percentage = (val, total) => {
        return Math.floor((val / total) * 100)
    }

    const submit = async (values) => {
        try {
            if (values.amount) {
                values.action = "amount"
                const { data } = await axios.patch(`/finance/budgets/${viewDetail}`, values)
            }
            if (values.date) {
                values.action = "date"
                const { data } = await axios.patch(`/finance/budgets/${viewDetail}`,  values)
            }
            setAction(null)
            setViewDetail(null)
            toast.success('Success')
        } catch (err) {
            toast.error('Impossible de charger les donnees')
        }
    }

    useEffect(() => {
        if (action === null) reload()
    }, [modal, action])


    if (error) {
        toast.error("Impossible de charger les donnees")
        return
    }



    return (
        <> {loading && <LoadingData />}
            {!loading && budgets?.map(item =>
                <div className="col-md-12 col-xl-12 " key={item.id}>
                    <div className="card app-design">
                        <div className="card-body">
                            <ContentPermsWrapper requiredPerms={['ajouter_transaction']}>
                                {(permissions.superAdmin || id_eglise == admin.church_id) &&
                                    <BudgetDateCheck item={item}>
                                        <button className="btn btn-outline-primary f-right"
                                            onClick={() => { setBudget(item); setModal('depense') }}
                                        >
                                            <FontAwesomeIcon icon={faCartPlus} />
                                        </button>
                                    </BudgetDateCheck>}
                            </ContentPermsWrapper>

                            <h5 className="f-w-400 custom">{item.budget_name}
                                {item.actual_amount == 0 &&
                                    <ContentPermsWrapper requiredPerms={['ajouter_budget']}>
                                        {(permissions.superAdmin || id_eglise == admin.church_id) &&
                                            <span className="align-items-center ms-2 hidden" role="group">
                                                <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                                    <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setBudget(item); setModal('modifier') }}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={(e) => { setBudget(item); setModal('supprimer') }}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </span>}
                                    </ContentPermsWrapper>
                                }
                            </h5>
                            <h6 className="f-w-400 text-muted mt-1">{item.account_name}</h6>
                            <p className="text-muted"> {formatDate(item.start_date)} - {formatDate(item.end_date)}</p>
                            <p className="text-c-blue">
                                Montant Budget : {formatAmount(item.allocated_amount)} ({item.account_name})<br />
                                Montant Actuel : {formatAmount(item.actual_amount)}<br />
                            </p>
                            <div className='d-flex justify-content-between'>
                                <div className="progress-box w-75">
                                    <div className="progress d-inline-block">
                                        <div className={`progress-bar bg-c-${item.percent > 80 ? "red" : "blue"}`} style={{ width: item.percent + "%" }}>
                                            <label>{item.percent} %</label>
                                        </div>
                                    </div>
                                </div>
                                <button className='btn btn-outline-primary'
                                    onClick={() => fetchBudgetDetails(item.id)}>
                                    {viewDetail === item.id ? <FontAwesomeIcon icon={faCaretUp} /> : "Plus..."}</button>
                            </div>


                            {viewDetail === item.id &&
                                <>
                                    <hr />
                                    {budgetLoading &&
                                        <div className='text-center'>
                                            <div className="spinner-border text-primary spinner-border-sm">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    }
                                    {!budgetLoading &&
                                        <div className='row'>
                                            <div className="col-sm-12 col-lg-7">
                                                <div className="table-responsive mt-2">
                                                    <table className="table table-hover table-bordered caption-top">
                                                        <caption>Depenses</caption>
                                                        <thead>
                                                            <tr>
                                                                <th scope='row'>ID</th>
                                                                <th>Date</th>
                                                                <th>Categorie</th>
                                                                <th>Description</th>
                                                                <th>Montant</th>
                                                                <th>Enreg. par</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {!loading && budgetDetail.map((b) =>
                                                                <tr v-for="item in tableItems" className={`custom table-${Statut[b.status]}`} key={b.id}>

                                                                    <td className="ms-1 small">
                                                                        {b.id}
                                                                    </td>

                                                                    <td className="ms-1 small">
                                                                        {new Date(b.created_at).toLocaleString('fr')}
                                                                    </td>

                                                                    <td className="ms-1 small">
                                                                        {b.category_name}
                                                                    </td>

                                                                    <td className='small'>
                                                                        {b.description}
                                                                    </td>

                                                                    <td className='small'>
                                                                        {formatAmount(b.amount)}
                                                                    </td>

                                                                    <td className='small'>
                                                                        {b.added_by_name}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-lg-5">
                                                <div className='card shadow-none border'>
                                                    <div className='card-header border p-3'>
                                                        <h5 className='card-header-title'>Historique</h5>
                                                    </div>
                                                    <div className='card-body mt-2'>
                                                        {Object.keys(details).map(ob =>
                                                            <div className='d-flex flex-column' key={ob}>
                                                                <div className='text-muted'>{new Date(details[ob].date).toLocaleString('fr')}</div>
                                                                <div>
                                                                    {details[ob].admin} :  {' '}
                                                                    {details[ob].extension === 'date' &&
                                                                        <span>
                                                                            {new Date(details[ob].old).toLocaleDateString('fr')}
                                                                            <FontAwesomeIcon icon={faArrowRight} className='mx-1' />
                                                                            {new Date(details[ob].new).toLocaleDateString('fr')}
                                                                        </span>
                                                                    }
                                                                    {details[ob].extension === 'amount' &&
                                                                        <span>
                                                                            {details[ob].old.toLocaleString('fr')}
                                                                            <FontAwesomeIcon icon={faArrowRight} className='mx-1' />
                                                                            {details[ob].new.toLocaleString('fr')}
                                                                        </span>
                                                                    }
                                                                </div>
                                                                <hr className='my-1' />
                                                            </div>
                                                        )}
                                                        {action &&
                                                            <Formik
                                                                initialValues={{ amount: '', date: '' }}
                                                                validationSchema={
                                                                    yup.object({
                                                                        amount: action === 'ajouter' && yup.number().min(1, 'Invalid').required('Ce champ est requis'),
                                                                        date: action === 'prolonger' && yup.date().min(new Date(item.end_date), 'Invalid').required('Ce champ est requis')
                                                                    })
                                                                }
                                                                onSubmit={submit}
                                                            >

                                                                <Form>
                                                                    <div className='d-flex flex-column mt-3'>
                                                                        {action === 'ajouter' &&
                                                                            <FormInputWithLabel title={"Montant"} name={"amount"} placeholder="Montant" />
                                                                        }

                                                                        {action === 'prolonger' &&
                                                                            <FormInputWithLabel title={"Date"} name={"date"} type="date" />
                                                                        }

                                                                        <div className='mt-1 d-flex justify-content-end align-items-end float-end'>
                                                                            <button className='btn btn-outline-success' type='submit'>
                                                                                {action === 'ajouter' ? 'Ajouter' : 'Prolonger'}
                                                                            </button>
                                                                            <button className="btn btn-outline-dark mx-1" onClick={() => setAction(null)}>
                                                                                Fermer
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </Form>

                                                            </Formik>
                                                        }

                                                        {!action &&
                                                            <ContentPermsWrapper requiredPerms={['ajouter_budget']}>
                                                                {(permissions.superAdmin || id_eglise == admin.church_id) &&
                                                                    <div className='btn-group btn-group-sm mt-2 float-end'>
                                                                        <button className="btn btn-outline-primary" onClick={() => setAction('prolonger')}>
                                                                            <FontAwesomeIcon icon={faCalendar} />
                                                                            {' '}Prolonger
                                                                        </button>
                                                                        <button className='btn btn-outline-primary' variant='outline' onClick={() => setAction('ajouter')}>
                                                                            <FontAwesomeIcon icon={faMoneyBill} />
                                                                            {' '}Ajouter
                                                                        </button>
                                                                    </div>}
                                                            </ContentPermsWrapper>
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    }
                                </>
                            }
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Main