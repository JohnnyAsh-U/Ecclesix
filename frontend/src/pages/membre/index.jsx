import React, { useEffect, useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faPlus } from '@fortawesome/free-solid-svg-icons'
import Filter from './filter'
import List from './list'
import { NavLink } from 'react-router-dom'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { AppGlobalContext } from '../../hooks/AppContext'


const Membres = () => {
    const { admin, permissions, eglises } = AppGlobalContext()

    let filter = {
        sexe: 'tout',
        age: 'tout',
        statut_matrimonial: 'tout',
        type_metier: 'tout',
        eglise: (permissions.superAdmin || permissions.perms.includes('voir_touts_membres')) ?
            'tout' : admin.church_id,
        Ministre: true,
        Ouvrier: true,
        Membre: true,
        Visiteur: true,
        baptise: true,
        non_baptise: true,
        actif: true,
        inactif: true
    }
    const [filters, setFilters] = useState(filter)
    const [search, setSearch] = useState('')


    const handleChange = (name, value) => {
        let filter = {}
        if (name == "statut" || name == "bapteme" || name == "actif") {
            filter = { ...filters, [value]: !filters[value] }
        } else {
            filter = { ...filters, [name]: value }
        }
        setFilters(filter)
    }

    const filterDefault = () => {
        setSearch('')
        setFilters(filter)
    }


    return (
        <div>
            <BreadCrumb icon={<i className="icofont icofont-user-alt-3"></i>} title={"Membres"} >
                <ContentPermsWrapper requiredPerms={['ajouter_membre']}>

                    <NavLink
                        className='btn btn-round  btn-grd-primary btn-sm'
                        to={"/membres/ajouter"}
                    >
                        <FontAwesomeIcon icon={faUser} size='lg' />
                        <FontAwesomeIcon icon={faPlus} />
                    </NavLink>
                </ContentPermsWrapper>
            </BreadCrumb>


            <div className="row">
                <div className="col-xl-3">
                    <Filter
                        handleChange={handleChange}
                        filters={filters}
                        search={search}
                        handleSearchChange={setSearch}
                        filterDefault={filterDefault}
                    />
                </div>
                <div className="col-xl-9">
                    <List
                        filters={filters}
                        search={search}
                    />
                </div>
            </div>
        </div>
    )
}

export default Membres