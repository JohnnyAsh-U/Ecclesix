import React, { useEffect } from 'react'
import { formatAmount } from '../../../utils/datetime/amount'
import { dateDisplay } from '../../../utils/datetime/formatdate'
import useFetch from '../../../hooks/fetchHook'
import { LoadingData } from '../../../components/Loading/loading'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'


function TransactionTable({ filters, id_eglise, modal, setModal, setSelectTransaction }) {
    const query = new URLSearchParams({
        ...filters,
        id_eglise
    }).toString()
    const { data, reload, error, loading } = useFetch(`/finance/transactions?${query}`, 'get')
    const { res, accounts: accountCols } = data || {}
    let result = []
    if (res) {
        result = [...res].reverse()
    }

    const Statut = {
        Pending: "warning",
        Validated: "",
        Rejected: "danger"
    }

    const Type = {
        Debit: "Depense",
        Credit: "Collecte",
        Transfer: "Transfert"
    }


    const transactionCategorieDetails = (val) => {

        if (val.transaction_type == 'Transfer') {

            let sendingAccount = val.from_account_name
            let receivingAccount = val.to_account_name

            return <span >
                {sendingAccount} {' '}
                <FontAwesomeIcon icon={faArrowRight} /> {' '}
                {receivingAccount}
            </span>
        } else if (val.transaction_type == 'Credit' || val.transaction_type == 'Debit') {
            if (val.transaction_type == 'Credit' && val.parent_id) {

                let sendingAccount = val.from_account_name
                let receivingAccount = val.to_account_name

                return <span >
                    #{val.parent_id}  {Type[val.transaction_type]} ({val.category_name})
                    <br />
                    {sendingAccount} {' '}
                    <FontAwesomeIcon icon={faArrowRight} /> {' '}
                    {receivingAccount}
                </span>
            } else {
                return `${Type[val.transaction_type]} (${val.category_name})`
            }
        }
    }


    useEffect(() => {
        reload()
    }, [modal])


    if (error) {
        toast.error("Impossible de charger les donnees")
        return
    }

    return (
        <>
            <div className="card" style={{ minHeight: '350px' }}>
                {loading && <LoadingData />}
                <div className="card-body contact-details p-0 table-responsive">
                    <table className="table table-hover table-bordered align-middle">
                        <thead className='bg-inverse'>
                            <tr className='bg-success' >
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }} >#</th>
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Date</th>
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Categorie</th>
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Description</th>
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Montant</th>
                                {accountCols && accountCols.map(acc =>
                                    <th className='text-wrap' style={{ backgroundColor: '#f3f4f7' }} key={acc.id} scope='col'>{acc.name}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {result && result.map(d =>
                                <tr className={`table-${Statut[d.status]}`} key={d.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectTransaction(d); setModal('trans') }}>
                                    <td>#{d.id}</td>
                                    <td>{d.type == 'Don' ? dateDisplay(d.evenement?.date_evenement) : dateDisplay(d.created_at)} <br />
                                       {d.event_type_name && <span>({d.event_type_name })</span>}
                                    </td>
                                    <td>
                                        {transactionCategorieDetails(d)}
                                    </td>
                                    <td className=' text-wrap'>{d.description}</td>
                                    <td>{formatAmount(d.amount)}</td>
                                    {d.accounts.map((a, index) =>
                                        <td key={index}>
                                            {a.balance > 0 && <span className='text-success fw-bold'>{formatAmount(a.balance)}</span>}
                                            {a.balance < 0 && <span className='text-danger '>{formatAmount(a.balance)}</span>}
                                            {a.balance == 0 && <span>{formatAmount(a.balance)}</span>}
                                        </td>
                                    )}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default TransactionTable