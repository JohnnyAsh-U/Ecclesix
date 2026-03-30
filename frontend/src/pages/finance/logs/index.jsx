import React, { useState } from 'react'
import useFetch from '../../../hooks/fetchHook'
import { toast } from 'react-toastify'
import { LoadingPage } from '../../../components/Loading/loading'
import BreadCrumb from '../../../components/breadcrumbs/breadcrumb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardList } from '@fortawesome/free-solid-svg-icons'
import { FormSelect } from '../../../components/Inputbox/form-select'
import { list_month } from '../../../utils/datetime/month'
import LogTable from './log_table'



function FinanceLog() {
    const { data, error, loading, reload } = useFetch('/finance/transactions-logs/filters', 'get')
    const { first_date: firstDate, alladmins: admins } = data || {}

    let filter = {
        action: 'tout',
        admin: 'tout',
        search: '',
        mois: new Date().getMonth(),
        annee: new Date().getFullYear(),
    }

    const [filters, setFilters] = useState(filter)

    if (error) {
        toast.error("Impossible de charger les donnees")
        return
    }

    let annee = new Date().getFullYear()
    let eventfirstyear = new Date(firstDate)?.getFullYear()

    const yearslist = Array.from({ length: annee - eventfirstyear + 1 }, (_, index) => annee - index)



    return (
        <> {loading && <LoadingPage />}
            {!loading &&
                <div>
                    <BreadCrumb title={"Finance - Logs"} icon={<FontAwesomeIcon icon={faClipboardList} />} />
                    <div className='row'>
                        <div className="col-sm-12">
                            <div className="card mb-2">
                                <div className="card-body d-flex justify-content-between">
                                    <div className='d-flex'>
                                        <div className="input-group mb-0">
                                            <span className={`input-group-text bg-light`}
                                                id="basic-addon1">
                                                #
                                            </span>
                                            <input
                                                name="search"
                                                type='number'
                                                placeholder='ID'
                                                className="form-control input-danger"
                                                value={filters.search}
                                                onChange={({ target }) => setFilters({ ...filters, [target.name]: target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className='d-flex flex-row justify-content-between'>
                                        <label htmlFor='action' className="col-form-label me-1">
                                            Action:
                                        </label>
                                        <FormSelect id='action' name='action' placeholder='action'
                                            value={filters.action}
                                            onChange={({ target }) => setFilters({ ...filters, [target.name]: target.value })}>
                                            <option value={'tout'}>Tout</option>
                                            <option value={'Created'}>Crée</option>
                                            <option value={'Modified'}>Modifiée</option>
                                            <option value={'Deleted'}>Supprimée</option>
                                            <option value={'Validated'}>Validée</option>
                                            <option value={'Rejected'}>Rejectée</option>
                                        </FormSelect>
                                    </div>

                                    <div className='d-flex flex-row justify-content-between'>
                                        <label htmlFor='admin' className="col-form-label me-1">
                                            Admin:
                                        </label>
                                        <FormSelect name='admin' value={filters.admin} onChange={({ target }) => setFilters({ ...filters, [target.name]: target.value })}>
                                            <option value={'tout'}>Tout</option>
                                            {admins.map(a =>
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            )}
                                        </FormSelect>
                                    </div>

                                    <div className='d-flex flex-row justify-content-between me-2'>
                                        <label htmlFor='mois' className="col-form-label me-1">
                                            Mois:
                                        </label>
                                        <FormSelect id='mois' name='mois' value={filters.mois}
                                            onChange={({ target }) => setFilters({ ...filters, [target.name]: target.value })}>
                                            {list_month.map((mon, id) =>
                                                <option key={id} value={id}>{mon}</option>
                                            )}
                                        </FormSelect>
                                    </div>

                                    <div className='d-flex flex-row justify-content-between mx-1'>
                                        <label htmlFor='annee' className="col-form-label me-1">
                                            Annee:
                                        </label>
                                        <FormSelect id='annee' name='annee' value={filters.annee}
                                            onChange={({ target }) => setFilters({ ...filters, [target.name]: target.value })}>
                                            {yearslist.map(y => <option value={y} key={y}>{y}</option>)}
                                        </FormSelect>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <LogTable
                                filters={filters}
                            />
                        </div>
                    </div>
                </div>
            }

        </>

    )
}

export default FinanceLog