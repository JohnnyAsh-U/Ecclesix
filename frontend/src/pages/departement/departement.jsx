import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { LoadingData } from '../../components/Loading/loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { ContentPermsWrapper, LinkProfile } from '../../utils/permissions/permwrapper'
import { AppGlobalContext } from '../../hooks/AppContext'
import AjouterMembre from './ajoutermembre'
import { capitalizeFirstLetter } from '../../utils/string/formatting'
import { AgeCategory } from '../../utils/datetime/agecategory'
import { StatutBadge } from '../../utils/membre/statut'
import { ModifierModal, SupprimerModal, SupprimerModalMembre } from './modals'


const Departement = ({ activeDep, activeEglise, setDepartement, departement, modal, setModal }) => {
    const { admin, permissions } = AppGlobalContext()
    const [depLoading, setDepLoading] = useState(true)
    const [membreSupprimer, setMembreSupprimer] = useState({})


    let bg = { backgroundColor: '#cbd5e1' }

    const fetchDepartement = async () => {
        setDepLoading(true)
        try {
            const { data } = await axios.get('/departement/' + activeDep)
            setDepartement(data.dep)
        } catch (err) {
            toast.error('Echec')
        } finally {
            setDepLoading(false)
        }
    }


    useEffect(() => {
        if (activeDep) {
            fetchDepartement()
        }
    }, [activeDep])


    const AddRemoveMembersWrapper = ({ id_chef, eglise, children }) => {
        if (permissions.superAdmin) {
            return children
        }
        if (permissions.perms.includes('modifier_departement') && eglise == admin.id_eglise) {
            return children
        }
        if (permissions.perms.includes('chef_departement') && id_chef === admin.id) {
            return children
        }
        return null
    }


    return (
        <>
            <div className="card mb-0" style={{ height: '72vh', overflowY: 'auto' }}>
                <div className="card-header py-2 d-flex align-items-center justify-content-between custom" style={{ backgroundColor: bg.backgroundColor }}>
                    <h5>  <FontAwesomeIcon icon={faUserGroup} className='me-2' />
                        {departement?.department_name}
                        {(permissions.superAdmin || departement.id_eglise == admin.id_eglise)
                            && <ContentPermsWrapper requiredPerms={['modifier_departement', 'supprimer_departement']}>
                                <div className="btn-group btn-group-sm hidden" role="group" shape="rounded-pill">
                                    <ContentPermsWrapper requiredPerms={['modifier_departement']}>
                                        <button className='btn btn-default btn-sm btn-outline-default p-1 mx-2' onClick={() => { setModal('modifier-dep') }}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    </ContentPermsWrapper>
                                    <ContentPermsWrapper requiredPerms={['supprimer_departement']}>
                                        <button className='btn btn-default btn-sm btn-outline-default p-1' onClick={(e) => { setModal('supprimer-dep') }}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </ContentPermsWrapper>
                                </div>
                            </ContentPermsWrapper>}
                    </h5>
                    <AjouterMembre departement={departement} activeEglise={activeEglise} fetch={fetchDepartement} />
                </div>
                {depLoading && <LoadingData />}
                {/* {!depLoading && Object.keys(departement).length > 0 && */}
                <div className="card-body contact-details mt-2">
                    <table className="table table-striped table-bordered nowrap">
                        <thead>
                            <tr role="row">
                                <th >Nom Et Prenom</th>
                                <th >Statut M.</th>
                                <th >Contact</th>
                                <th >Profession</th>
                                <th >Categorie</th>
                                <th >Statut</th>
                                <th ></th>
                            </tr>
                        </thead>
                        <tbody>
                            {departement.membres && departement.membres.map((membre, index) => (
                                <tr style={{ cursor: 'pointer' }} className='custom' key={membre.id}>
                                    <td >
                                        <LinkProfile to={`/membres/profile/${membre.id}`} className='text-decoration-none'>
                                            {capitalizeFirstLetter(membre.nom)} {capitalizeFirstLetter(membre.prenom)}
                                        </LinkProfile>
                                        <strong>{' '}{membre.id === departement.id_chef ? ' (responsable)' : ''}</strong>
                                    </td>
                                    <td>
                                        <div>
                                            {membre.statut_matrimonial === 'V' && 'Veuf(ve)'}
                                            {membre.statut_matrimonial === 'M' && 'Marie'}
                                            {membre.statut_matrimonial === 'C' && 'Celibataire'}
                                        </div>
                                    </td>
                                    <td>
                                        {membre.numero_tel}
                                    </td>
                                    <td> {membre.type_metier}</td>
                                    <td> {AgeCategory(membre.date_de_naissance)}</td>
                                    <td> {StatutBadge(membre.statut)}</td>
                                    <td>
                                        <AddRemoveMembersWrapper eglise={departement.id_eglise} id_chef={departement.id_chef}>
                                            <FontAwesomeIcon icon={faTrash} onClick={() => {
                                                setMembreSupprimer({ dep: departement.id_groupe, membre });
                                                setModal('retirer-membre')
                                            }} className='hidden' style={{ cursor: 'pointer' }} />
                                        </AddRemoveMembersWrapper>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            <ModifierModal
                groupe={departement}
                modal={modal}
                setModal={setModal}
                fetch={fetchDepartement}
            />

            <SupprimerModal
                modal={modal}
                groupe={departement}
                setModal={setModal}
            />

            <SupprimerModalMembre
                modal={modal}
                depMembre={membreSupprimer}
                setModal={setModal}
                fetch={fetchDepartement} />
        </>

    )
}

export default Departement