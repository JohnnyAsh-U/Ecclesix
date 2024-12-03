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
    const { res, accountCols } = data || {}
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

        if (val.type == 'Transfer') {

            let sendingAccount = val.compte
            let receivingAccount = val.compte_c

            return <span >
                {sendingAccount?.lib_compte} {' '}
                <FontAwesomeIcon icon={faArrowRight} /> {' '}
                {receivingAccount?.lib_compte}
            </span>
        } else if (val.type == 'Credit' || val.type == 'Debit') {
            if (val.type == 'Credit' && val.id_parent) {

                let sendingAccount = val.compte
                let receivingAccount = val.compte_c

                return <span >
                    #{val.id_parent}  {Type[val.type]} ({val.categorie?.lib_categorie})
                    <br />
                    {sendingAccount?.lib_compte} {' '}
                    <FontAwesomeIcon icon={faArrowRight} /> {' '}
                    {receivingAccount?.lib_compte}
                </span>
            } else {
                return `${Type[val.type]} (${val.categorie?.lib_categorie})`
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
                                    <th className='text-wrap' style={{ backgroundColor: '#f3f4f7' }} key={acc.id_compte} scope='col'>{acc.lib_compte}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {result && result.map(d =>
                                <tr className={`table-${Statut[d.statut]}`} key={d.id_transaction} style={{ cursor: 'pointer' }} onClick={() => { setSelectTransaction(d); setModal('trans') }}>
                                    <td>#{d.id_transaction}</td>
                                    <td>{d.type == 'Don' ? dateDisplay(d.evenement?.date_evenement) : dateDisplay(d.createdAt)} <br />
                                        {d.evenement && <span>({d.evenement?.type_evenement?.lib_type_evenement})</span>}
                                    </td>
                                    <td>
                                        {transactionCategorieDetails(d)}
                                    </td>
                                    <td className=' text-wrap'>{d.description}</td>
                                    <td>{formatAmount(d.montant)}</td>
                                    {d.accounts.map((a, index) =>
                                        <td key={index}>
                                            {a.montant > 0 && <span className='text-success fw-bold'>{formatAmount(a.montant)}</span>}
                                            {a.montant < 0 && <span className='text-danger '>{formatAmount(a.montant)}</span>}
                                            {a.montant == 0 && <span>{formatAmount(a.montant)}</span>}
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