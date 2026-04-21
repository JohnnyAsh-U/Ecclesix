import React, { useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck, faCalendarPlus } from '@fortawesome/free-solid-svg-icons'
import Filter from './filter'
import List from './list'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { AppGlobalContext } from '../../hooks/AppContext'
import useFetch from '../../hooks/fetchHook'
import { LoadingPage } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import AjouterModal from './modals'


const Evenements = () => {
    const { admin, permissions, appConfig } = AppGlobalContext()
    const { loading, data, error, reload } = useFetch(`/evenement/type`, 'get')
    const { list: listetype, first_event_date: firstDate } = data || {}

    let filter = {
        type_evenement: 'tout',
        eglise: permissions.superAdmin ? 'tout' : admin.church_id,
        mois: new Date().getMonth(),
        annee: new Date().getFullYear(),
    }
    const [filters, setFilters] = useState(filter)
    const [modal, setModal] = useState()



    const handleModal = () => {
        setModal(null)
    }


    const handleChange = (name, value) => {
        filter = { ...filters, [name]: value }
        setFilters(filter)
    }

    const filterDefault = () => {
        setFilters(filter)
    }

    if (loading) {
        return <LoadingPage />
    }

    if (error) {
        toast.error("Echec")
        return
    }

    return (
        <div>
            <BreadCrumb icon={<FontAwesomeIcon icon={faCalendarCheck} />} title={"Evenements"} >
                <ContentPermsWrapper requiredPerms={['ajouter_evenement']}>
                    <button onClick={() => setModal('ajouter-evenement')} className='btn btn-primary rounded hor-grd btn-grd-primary btn-sm' >
                        <FontAwesomeIcon color='primary' icon={faCalendarPlus} size='xl' />
                    </button>
                </ContentPermsWrapper>
            </BreadCrumb>

            <div className="row">
                <div className="col-xl-3">
                    <Filter
                        handleChange={handleChange}
                        listetype={listetype}
                        filters={filters}
                        firstDate={firstDate}
                        filterDefault={filterDefault}
                    />
                </div>
                <div className="col-xl-9">
                    <List
                        filters={filters}
                        modal={modal}
                        handleModal={handleModal}
                        listetype={listetype}
                        setModal={setModal}
                    />
                </div>
            </div>
            <AjouterModal
                modal={modal}
                listetype={listetype}
                handleModal={handleModal}
                fetch={reload} />
        </div>
    )
}

export default Evenements