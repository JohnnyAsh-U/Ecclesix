import React, { useEffect, useRef, useState } from 'react'
import { AppGlobalContext } from '../../../hooks/AppContext'
import { ContentPermsWrapper } from '../../../utils/permissions/permwrapper'
import { list_month } from '../../../utils/datetime/month'
import { LoadingData, LoadingPage } from '../../../components/Loading/loading'
import BreadCrumb from '../../../components/breadcrumbs/breadcrumb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBill, faMoneyBillTrendUp } from '@fortawesome/free-solid-svg-icons'
import WidgetB from '../../../components/widgets/widgetB'
import Comptes from '../comptes'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FormSelect } from '../../../components/Inputbox/form-select'
import RapportTable from './rapportTable'

function Rapports() {
    const { permissions, admin } = AppGlobalContext()
    const [loading, setLoading] = useState(false)
    const [firstDate, setFirstDate] = useState(null)
    const [comptes, setComptes] = useState([])
    const [eglises, setEglises] = useState([])
    const [currentEglise, setCurrentEglise] = useState('')
    const [modal, setModal] = useState(null)
    const [evenements, setEvenements] = useState([])

    let annee = new Date().getFullYear()
    let eventfirstyear = new Date(firstDate)?.getFullYear()

    const yearslist = Array.from({ length: annee - eventfirstyear + 1 }, (_, index) => annee - index)



    let filter = {
        type: 'Caisse',
        mois: new Date().getMonth(),
        annee: new Date().getFullYear(),
    }

    const [filters, setFilters] = useState(filter)


    const fetchEgliseCompte = async () => {
        if (!eglises.length) setLoading(true);
        try {
            const { data } = await axios.get(`/finance`);
            setFirstDate(data.date)
            setEvenements(data.events)
            setEglises(data.church_account); //when the church is empty the comp doesn't load

            if (data.church_account.length > 0) {
                //if admin church doesn't have an account we set it to the first church and first account
                let adminEglise = data.church_account.find(eg => eg.id == admin.church_id) || data.church_account[0]
                setCurrentEglise(adminEglise?.id)
                setComptes(adminEglise?.accounts)
            }
        } catch (err) {
            toast.error("Impossible de charger les donnees")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEgliseCompte()
    }, [])

    useEffect(() => {
        if (currentEglise) {
            let adminEglise = eglises.find(eg => eg.id == currentEglise)
            setComptes(adminEglise?.accounts)
        }
    }, [currentEglise])


    return (
        <> {loading && <LoadingPage />}
            {!loading &&
                <div>
                    <BreadCrumb title={"Finance - Rapports"} icon={<FontAwesomeIcon icon={faMoneyBillTrendUp} />} />
                    <div className="row">
                        <div className="col-sm-12">
                            <div className='card mb-2' style={{minHeight: '125px'}}>
                                <div className="card-body pb-0">
                                    {currentEglise && <Comptes eglise={currentEglise} type={filters.type} />}
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div className="card mb-2">
                                <div className="card-body d-flex justify-content-between">
                                    <ContentPermsWrapper requiredPerms={['voir_toutes_finances']}>
                                        <div className='d-flex flex-row justify-content-between me-2'>
                                            <label htmlFor='eglise' className="col-form-label me-1">
                                                Eglise:
                                            </label>
                                            <FormSelect id='eglise' name='eglise' onChange={(e) => setCurrentEglise(e.target.value)} value={currentEglise}>
                                                {eglises.map(eglise =>
                                                    <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                                                )}
                                            </FormSelect>
                                        </div>
                                    </ContentPermsWrapper>

                                    <div className='d-flex flex-row justify-content-between me-2'>
                                        <label htmlFor='type' className="col-form-label me-1">
                                            Type:
                                        </label>
                                        <FormSelect id='type' name='type' placeholder='type'
                                            value={filters.type}
                                            onChange={({ target }) => setFilters({ ...filters, [target.name]: target.value })}>
                                            <option value={'Caisse'}>Caisse</option>
                                            <option value={'Bancaire'}>Bancaire</option>
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
                        <div className='col-sm-12'>
                            {currentEglise && <RapportTable
                                id_eglise={currentEglise}
                                eglise={eglises.find(e => e.id == currentEglise)?.church_name}
                                filters={filters}
                            />}
                        </div>
                    </div>
                </div >
            }
        </>
    )
}

export default Rapports