import React, { useEffect, useRef, useState } from 'react'
import useFetch from '../../../hooks/fetchHook'
import { toast } from 'react-toastify'
import Badge from '../../../components/buttons/badge'
import { LoadingData } from '../../../components/Loading/loading'


function LogTable({ filters }) {
    const query = new URLSearchParams({
        ...filters
    }).toString()
    const { data, error, loading, reload } = useFetch(`/finance/transactions-logs?${query}`, 'get')
    const { logs } = data || {}


    const Statut = {
        Created: <Badge color='warning' text={"Crée"} />,
        Modified: <Badge color='info' text={"Modifiée"} />,
        Deleted: <Badge color='danger' text={"Supprimée"}/>,
        Validated: <Badge color='success' text={"Validée"}/>,
        Rejected: <Badge color='dark' text={"Rejectée"}/>,
    }


    const stateObject = (obj) => {
        if (obj) {
            return Object.keys(obj).map(o =>
                <div key={o} className='fw-semibold'>{o} : {obj[o]}</div>
            )
        } else {
            return "N/A"
        }
    }


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
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }} >Action</th>
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>ID</th>
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Date</th>
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Admin</th>
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Detail</th>
                                {/* <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Nouvel Etat</th> */}
                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Observations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs && logs.map(d =>
                                <tr align='middle' key={d.id}>
                                    <td className='text-center' >{Statut[d.action]}</td>
                                    <td >#{d.transaction_no}</td>
                                    <td >
                                        {new Date(d.created_at).toLocaleString('fr')}
                                    </td>
                                    <td className='text-wrap'>
                                        {d.admin}
                                    </td>
                                    <td className='small'>{stateObject(d.detail)}</td>
                                    {/* <td className='small'>{stateObject(d.new_state)}</td> */}
                                    <td >{d.comment}</td>
                                </tr>
                            )}
                            {/* {result && result.map(d =>
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
                            )} */}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* <CCard className="shadow-sm mt-3">
              
                    <CTableBody>
                        {data.map(d =>
                            <CTableRow align='middle' key={d.id_log} className='custom' color={Statut[d.statut]}>
                                <CTableDataCell className='text-center' >{Statut[d.action]}</CTableDataCell>
                                <CTableDataCell >#{d.transaction_no}</CTableDataCell>
                                <CTableDataCell >
                                    {new Date(d.createdAt).toLocaleString('fr')}
                                </CTableDataCell>
                                <CTableDataCell className='text-wrap'>
                                    {d.membre?.nom} {d.membre?.prenom}
                                </CTableDataCell>
                                <CTableDataCell className='small'>{stateObject(d.previous_state)}</CTableDataCell>
                                <CTableDataCell className='small'>{stateObject(d.new_state)}</CTableDataCell>
                                <CTableDataCell >{d.remark}</CTableDataCell>
                            </CTableRow>
                        )}
                    </CTableBody>
                </CTable>
            </CCard> */}
        </>
    )
}

export default LogTable