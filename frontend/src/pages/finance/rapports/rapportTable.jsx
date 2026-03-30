import React, { useState } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { AppGlobalContext } from '../../../hooks/AppContext'
import useFetch from '../../../hooks/fetchHook'
import { LoadingData } from '../../../components/Loading/loading'
import { toast } from 'react-toastify'
import { list_month } from '../../../utils/datetime/month'
import { formatAmount } from '../../../utils/datetime/amount'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudDownload } from '@fortawesome/free-solid-svg-icons'


function RapportTable({ filters, id_eglise, eglise }) {
    const { permissions, admin } = AppGlobalContext()
    const query = new URLSearchParams({
        ...filters,
        id_eglise
    }).toString()

    const { data, error, loading, reload } = useFetch(`/finance/rapports?${query}`, 'get')

    const {
        rapportCategories: categories,
        accountCols,
        accountsName: finalBalance,
        InitialBalance: initialBalance,
        TotalExpenses: totalExpenses,
        TotalIncome: totalIncome,
        TotalTransferIn: totalTransferIn,
        TotalTransferOut: totalTransferOut
    } = data || {}

    const generatePDF = () => {
        const input = document.getElementById('rapport')
        html2canvas(input).then((canvas) => {
            const img = canvas.toDataURL('image/png')
            const pdf = new jsPDF()
            const imgWidth = 190
            const pageHeight = pdf.internal.pageSize.height
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            let heightLeft = imgHeight
            let position = 0
            pdf.addImage(img, 'PNG', 10, position, imgWidth, imgHeight)
            heightLeft -= pageHeight;
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(img, 'PNG', 10, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }
            pdf.save('table.pdf')
        })
    }

    if (error) {
        toast.error("Impossible de charger les donnees")
        return
    }

    const listeDons = !loading && categories.filter(a => a.type === 'Credit' && a.accounts?.find(b => b.name == 'Total')?.amount !== 0)
    const listeDepense = !loading && categories.filter(a => a.type === 'Debit' && a.accounts?.find(b => b.name == 'Total')?.amount !== 0)


    return (
        <>
            <div className="card mt-1">
                {loading && <LoadingData />}
                <div className='card-header'>
                    <h5 className="card-header-title">Rapport</h5>
                    <span className='float-end'>
                        <button className='btn btn-outline-default btn-sm' onClick={() => generatePDF()}>
                            <FontAwesomeIcon icon={faCloudDownload} />
                        </button>
                    </span>
                </div>
                <div id='rapport'>
                    {!loading && accountCols.length > 0 &&
                        <div className='card-body'>
                              <div className="row invoive-info">
                                <div className="col-md-4 col-xs-12 invoice-client-info">
                                    <h6>Eglise {eglise}</h6>
                                    <h6 className="m-0">Comptes {filters.type}</h6>
                                    <p className="m-0 m-t-10">{list_month[filters.mois]} {filters.annee}</p>
                                   </div>
                              
                            </div>

                            <div className="table-responsive mt-2">
                                <table className="table table-hover table-bordered">
                                    <thead >
                                        <tr className='bg-inverse thead-default'>
                                            <th colSpan={4} style={{ backgroundColor: '#f3f4f7' }}>Resumé</th>
                                            {accountCols.map(acc =>
                                                <th className='text-wrap' style={{ backgroundColor: '#f3f4f7' }} key={acc.id} scope='col'>{acc.name}</th>)}
                                            {/* <th style={{ backgroundColor: '#f3f4f7' }}>Total</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th colSpan={4}>Solde Initial</th>
                                            {initialBalance.map(acc => <td className='text-wrap text-success fw-bold' key={acc.id} scope='col'>
                                                {formatAmount(acc.balance)}
                                            </td>)}
                                        </tr>
                                        <tr>
                                            <th colSpan={4}>Collectes Totales</th>
                                            {totalIncome.map(acc => <td className='text-wrap text-success fw-bold' key={acc.id} scope='col'>
                                                {formatAmount(acc.balance)}
                                            </td>)}
                                        </tr>
                                        <tr>
                                            <th colSpan={4}>Depenses Totales</th>
                                            {totalExpenses.map(acc => <td className='text-wrap text-danger fw-bold' key={acc.id} scope='col'>
                                                {formatAmount(acc.balance)}
                                            </td>)}
                                        </tr>
                                        <tr>
                                            <th colSpan={4}>Transferts Totaux Entrants</th>
                                            {totalTransferIn.map(acc => <th className='text-wrap text-success ' key={acc.id} scope='col'>
                                                {formatAmount(acc.balance)}
                                            </th>)}
                                        </tr>
                                        <tr>
                                            <th colSpan={4}>Transferts Totaux Sortants</th>
                                            {totalTransferOut.map(acc => <td className='text-wrap text-danger fw-bold' key={acc.id} scope='col'>
                                                {formatAmount(acc.balance)}
                                            </td>)}
                                        </tr>
                                        <tr>
                                            <th colSpan={4}>Solde Final</th>
                                            {finalBalance.map(acc => <th className='text-wrap' key={acc.id} scope='col'>
                                                {parseFloat(acc.balance) >= 0 && <span className='text-success'>{formatAmount(acc.balance)}</span>}
                                            </th>)}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>


                            {listeDons > 0 || listeDepense > 0 &&
                                <>
                                    <hr className='mt-5' />
                                    <p>Details</p>
                                    <hr />
                                </>
                            }


                            {listeDons.length > 0 &&
                                <div className="table-responsive mt-2">
                                    <table className="table table-hover table-bordered caption-top">
                                        <caption>Collectes</caption>
                                        <thead className='bg-inverse'>
                                            <tr className='bg-inverse'>
                                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Categorie</th>
                                                {accountCols.map(acc =>
                                                    <th className='text-wrap' style={{ backgroundColor: '#f3f4f7' }} key={acc.id} scope='col'>{acc.name}</th>)}
                                                {/* <th style={{ backgroundColor: '#f3f4f7' }}>Total</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listeDons.map((a, index) =>
                                                <tr key={index}>
                                                    <td>{a.category}</td>
                                                    {a.accounts?.map(e =>
                                                        <td key={e.id}>{formatAmount(e.balance)}</td>
                                                    )}
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            }



                            {listeDepense.length > 0 &&
                                <div className="table-responsive mt-2">
                                    <table className="table table-hover table-bordered caption-top">
                                        <caption>Depenses</caption>
                                        <thead className='bg-inverse'>
                                            <tr className='bg-inverse'>
                                                <th scope="col" style={{ backgroundColor: '#f3f4f7' }}>Categorie</th>
                                                {accountCols.map(acc =>
                                                    <th className='text-wrap' style={{ backgroundColor: '#f3f4f7' }} key={acc.id} scope='col'>{acc.name}</th>)}
                                                {/* <th style={{ backgroundColor: '#f3f4f7' }}>Total</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listeDepense.map((a, index) =>
                                                <tr key={index}>
                                                    <td>{a.category}</td>
                                                    {a.accounts?.map(e =>
                                                        <td key={e.id_compte} className='text-danger fw-bold'>{formatAmount(e.balance)}</td>
                                                    )}
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>

        </>

    )
}

export default RapportTable