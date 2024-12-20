import React, { useEffect, useRef, useState } from 'react'
import { list_month } from '../../../utils/datetime/month';
import Comptes from '../comptes';
import { AppGlobalContext } from '../../../hooks/AppContext';
import { toast } from 'react-toastify'
import { LoadingPage } from '../../../components/Loading/loading';
import BreadCrumb from '../../../components/breadcrumbs/breadcrumb';
import { faAdd, faMoneyCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormSelect } from '../../../components/Inputbox/form-select';
import { ContentPermsWrapper } from '../../../utils/permissions/permwrapper';
import axios from 'axios';
import Main from './main';
import { Ajouter, DepenseBudget, Modifier, Supprimer } from './modal';

function Budgets() {
    const { loading, setLoading, admin, permissions } = AppGlobalContext()

    const [firstDate, setFirstDate] = useState(null)
    const [comptes, setComptes] = useState([])
    const [eglises, setEglises] = useState([])
    const [currentEglise, setCurrentEglise] = useState('')
    const [modal, setModal] = useState(null)
    const [listeCategories, setListeCategories] = useState([])
    const [toutComptes, setToutComptes] = useState([])
    const [budget, setBudget] = useState({})

    const handleModal = () => {
        setModal(null)
    }

    let annee = new Date().getFullYear()
    let eventfirstyear = new Date(firstDate)?.getFullYear()

    const yearslist = Array.from({ length: annee - eventfirstyear + 1 }, (_, index) => annee - index)



    let filter = {
        type: 'Caisse',
        id_categorie: 'tout',
        mois: new Date().getMonth(),
        annee: new Date().getFullYear(),
    }

    const [filters, setFilters] = useState(filter)


    const fetchEgliseCompte = async () => {
        if (!eglises.length) setLoading(true);
        try {
            const { data } = await axios.get(`/finance`);
            setFirstDate(data.date)
            setListeCategories(data.category)
            setToutComptes(data.account)
            setEglises(data.church_account); //when the church is empty the comp doesn't load

            if (data.church_account.length > 0) {
                //if admin church doesn't have an account we set it to the first church and first account
                let adminEglise = data.church_account.find(eg => eg.id == admin.church_id) || data.church_account[0]
                setCurrentEglise(adminEglise?.id)
                setComptes(adminEglise?.accounts)
            }

        } catch (err) {
            toast.error('Impossible de charger les donnees')
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


    const categorieBudget = listeCategories.filter(c => c.category_type === 'Budget')

    return (
        <>  {loading && <LoadingPage />}
            {!loading &&
                <div>
                    <BreadCrumb title={"Finance - Budgets"} icon={<FontAwesomeIcon icon={faMoneyCheck} />}>
                        <ContentPermsWrapper requiredPerms={['ajouter_budget']}>
                            {(permissions.superAdmin || currentEglise == admin.church_id) &&
                                <button
                                    className='btn btn-round btn-primary btn-sm hor-grd btn-grd-primary float-end'
                                    onClick={() => { setModal('ajouter') }}>
                                    <FontAwesomeIcon icon={faAdd} />
                                </button>}
                        </ContentPermsWrapper>
                    </BreadCrumb>

                    <div className='row'>
                        <div className="col-sm-12">
                            <div className='card mb-2' style={{ minHeight: '125px' }}>
                                <div className="card-body pb-0">
                                    {currentEglise && <Comptes eglise={currentEglise} type={filters.type} modal={modal} />}
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
                                        <label htmlFor='id_categorie' className="col-form-label me-1">
                                            Type:
                                        </label>
                                        <FormSelect id='id_categorie' name='id_categorie' value={filters.id_categorie}
                                            onChange={({ target }) => setFilters({ ...filters, [target.name]: target.value })}>
                                            <option value={'tout'}>Touts</option>
                                            {categorieBudget.map((budget, id) =>
                                                <option key={budget.id} value={budget.id}>{budget.category_name}</option>
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

                        <div className='col-sm-12'>
                            {currentEglise &&
                                <Main
                                    filters={filters}
                                    modal={modal}
                                    setModal={setModal}
                                    id_eglise={currentEglise}
                                    setBudget={setBudget}
                                />}
                        </div>


                        <Ajouter
                            handleModal={handleModal}
                            modal={modal}
                            comptes={comptes}
                            categorie={categorieBudget}
                            eglise={currentEglise}
                        />

                        <Modifier
                            handleModal={handleModal}
                            modal={modal}
                            budget={budget}
                        />

                        <Supprimer
                            handleModal={handleModal}
                            modal={modal}
                            budget={budget}
                        />

                        <DepenseBudget
                            handleModal={handleModal}
                            modal={modal}
                            budget={budget}
                            categorie={listeCategories.filter(c => c.category_type === 'Debit')}
                        />
                    </div>

                </div>


            }

        </>

    )
}

export default Budgets