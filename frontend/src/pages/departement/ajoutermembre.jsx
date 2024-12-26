import axios from 'axios'
import React, { useState } from 'react'
import { AppGlobalContext } from '../../hooks/AppContext'
import AsyncSelect from 'react-select/async'
import { toast } from 'react-toastify'
import _ from 'lodash'


const AjouterMembre = ({ departement, activeEglise, fetch }) => {
    const { admin, permissions } = AppGlobalContext()
    const [addLoading, setAddLoading] = useState(false)
    const [membreAjouter, setMembreAjouter] = useState([])



    const fetchMembre = async (search) => {
        const filter = {
            eglise: activeEglise,
            Ministre: true,
            Ouvrier: true,
            Membre: false,
            Visiteur: false,
            actif : true,
            baptise:true,
            non_baptise:true
        }
        const query = new URLSearchParams({
            ...filter,
            search,
            page: 1,
            limit: 50,
        }).toString()
        try {
            const { data } = await axios.get(`/membre?${query}`);
            const nouvelleListeDesMembres = _.differenceBy(data.list, departement.member, 'id')
            //nouvelle liste pour l'ajout
            const options = nouvelleListeDesMembres.map((item) => ({ value: item.id, label: item.get_full_name }))
            return options
        } catch (err) {
            toast.error("Erreur")
        }
    }



    const ajouterMembreAuGroupe = (e) => {
        e.preventDefault()
        if (membreAjouter.length == 0) return
        setAddLoading(true)
        let id = departement.id
        axios.post(`/departement/${id}/ajouter`,
            { member: membreAjouter.value })
            .then((data) => {
                setMembreAjouter([]);
                toast.success("Success")
                fetch()
            })
            .catch(err => {
                toast.error("Echec")
            }).finally(() => setAddLoading(false))
    }



    //Modifier_departement gives perms to addremove member of the department
    //of the admin church only
    //chef_departement gives perms to addremove member of the department in
    //which the person is a head

    const AddRemoveMembersWrapper = ({ id_chef, eglise, children }) => {
        if (permissions.superAdmin) {
            return children
        }
        if (permissions.perms.includes('modifier_departement') && eglise == admin.church_id) {
            return children
        }
        if (permissions.perms.includes('chef_departement') && id_chef === admin.id) {
            return children
        }
        return null
    }


    return (
        <AddRemoveMembersWrapper id_chef={departement.department_head} eglise={departement.church}>
            <form onSubmit={(e) => ajouterMembreAuGroupe(e)} className='d-flex flex-row align-items-start justify-content-center'>
                <AsyncSelect styles={{ control: (provided) => ({ ...provided, minWidth: 200, height: 40 }) }}
                    cacheOptions
                    defaultOptions
                    value={membreAjouter}
                    placeholder={'Ajouter Membres'}
                    loadOptions={fetchMembre}
                    onChange={(val) => setMembreAjouter(val)}
                />
                <button className={`btn btn-outline-primary  ms-1 rounded`} disabled={addLoading} style={{ height: '40px' }}>
                    {addLoading && <div className='spinner-border spinner-border-sm' role='status'></div>}
                    {' '}Ajouter{addLoading && '..'}
                </button>

            </form>
        </AddRemoveMembersWrapper>
    )
}

export default AjouterMembre