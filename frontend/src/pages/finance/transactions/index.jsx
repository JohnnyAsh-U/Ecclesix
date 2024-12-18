import React, { useEffect, useRef, useState } from 'react'
import { ContentPermsWrapper } from '../../../utils/permissions/permwrapper';
import { list_month } from '../../../utils/datetime/month';
import Dropdown from 'react-bootstrap/Dropdown'
import Comptes from '../comptes';
import { AppGlobalContext } from '../../../hooks/AppContext';
import { toast } from 'react-toastify'
import { LoadingData, LoadingPage } from '../../../components/Loading/loading';
import { faAdd, faCartPlus, faEnvelopeOpen, faMoneyBills, faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BreadCrumb from '../../../components/breadcrumbs/breadcrumb';
import { FormSelect } from '../../../components/Inputbox/form-select';
import axios from 'axios';
import TransactionTable from './transactionTable';
import Ajouter, { Info } from './transactionModal';



function Index() {
    const { permissions, admin } = AppGlobalContext()
    const [loading, setLoading] = useState(true)

    const [firstDate, setFirstDate] = useState(null)
    const [comptes, setComptes] = useState([])
    const [eglises, setEglises] = useState([])
    const [currentEglise, setCurrentEglise] = useState('')
    const [modal, setModal] = useState(null)
    const [type, setType] = useState(null)
    const [listeCategories, setListeCategories] = useState([])
    const [evenements, setEvenements] = useState([])
    const [toutComptes, setToutComptes] = useState([])
    const [selectTransaction, setSelectTransaction] = useState({})


    const handleModal = () => {
        setModal(null)
    }



    let annee = new Date().getFullYear()
    let eventfirstyear = new Date(firstDate)?.getFullYear()

    const yearslist = Array.from({ length: annee - eventfirstyear + 1 }, (_, index) => annee - index)



    let filter = {
        type: 'Caisse',
        categorie: 'tout',
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
            setEvenements(data.events)
            setToutComptes(data.account)
            setEglises(data.church_account); //when the church is empty the comp doesn't load

            if (data.church_account.length > 0) {
                //if admin church doesn't have an account we set it to the first church and first account
                let adminEglise = data.church_account.find(eg => eg.id == admin.church_id) || data.church_account[0]
                if (!currentEglise) {
                    setCurrentEglise(adminEglise?.id)
                }
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

    const options = listeCategories.map(c => {
        if (c.category_type == 'Credit') {
            return { id_categorie: c.id, lib_categorie: `(Collecte) ${c.category_name}` }
        } else {
            return { id_categorie: c.id, lib_categorie: `(Depense) ${c.category_name}` }
        }
    })



    return (
        <>
            {loading && <LoadingPage />}
            {!loading &&
                <div>
                    <BreadCrumb title={"Finance - Transactions"} icon={<FontAwesomeIcon icon={faMoneyBillTransfer} />} >
                        <ContentPermsWrapper requiredPerms={['ajouter_transaction']}>
                            {(permissions.superAdmin || admin.church_id == currentEglise) &&
                                <Dropdown direction="dropend" >
                                    <Dropdown.Toggle variant='link' className='btn  btn-outline-default py-0 rounded'>
                                        <div className='btn btn-round btn-primary btn-sm hor-grd btn-grd-primary'>
                                            <FontAwesomeIcon icon={faAdd} />
                                        </div>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => { setModal('ajouter'); setType('Credit') }} >
                                            <FontAwesomeIcon icon={faEnvelopeOpen} className='me-1' /> Ajouter Collecte
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => { setModal('ajouter'); setType('Debit') }}>
                                            <FontAwesomeIcon icon={faCartPlus} className='me-1' /> Ajouter Depense
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => { setModal('ajouter'); setType('Transfer') }}>
                                            <FontAwesomeIcon icon={faMoneyBillTransfer} className='me-1' /> Faire Transfert
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            }
                        </ContentPermsWrapper>
                    </BreadCrumb>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className='card p-0 mb-2' style={{ minHeight: '125px' }}>
                                <div className="card-body pb-0">
                                    {currentEglise && <Comptes eglise={currentEglise} type={filters.type} modal = {modal} />}
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
                                        <label htmlFor='d' className="col-form-label me-1">
                                            Categories:
                                        </label>
                                        <FormSelect name='categorie' value={filters.categorie} onChange={({ target }) => setFilters({ ...filters, [target.name]: target.value })}>
                                            <option value={'tout'}>Tout</option>
                                            <option value={'tout_dons'}>Toutes Les Collectes</option>
                                            <option value={'tout_depenses'}>Touts Les Depenses</option>
                                            <option value={'tout_transferts'}>Touts Les Transferts</option>
                                            {options.map(cate => <option key={cate.id_categorie} value={cate.id_categorie}>{cate.lib_categorie}</option>)}
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
                            {currentEglise && <TransactionTable
                                filters={filters}
                                modal={modal}
                                id_eglise={currentEglise}
                                setModal={setModal}
                                setSelectTransaction={setSelectTransaction}
                            />}
                        </div>

                    </div>

                    {/* <Ajouter
                        handleModal={handleModal}
                        modal={modal}
                        type={type}
                        comptes={comptes}
                        categorie={listeCategories}
                        evenements={evenements}
                        toutComptes={toutComptes}
                        eglise={currentEglise}
                    />

                    <Info
                        handleModal={handleModal}
                        comptes={comptes}
                        categorie={listeCategories}
                        evenements={evenements}
                        toutComptes={toutComptes}
                        modal={modal}
                        transaction={selectTransaction}
                        fetch={fetchEgliseCompte}
                    /> */}
                </div>
            }

        </>

    )
}

export default Index