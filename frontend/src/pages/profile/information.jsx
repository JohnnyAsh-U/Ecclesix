import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import Relation from './relation'
import RoleDepartement from './roledepartement'
import { capitalizeFirstLetter } from '../../utils/string/formatting'
import { formatDate } from '../../utils/datetime/formatdate'
import { AgeCategory } from '../../utils/datetime/agecategory'
import { StatutBadge } from '../../utils/membre/statut'
import { AdminEtSuperAdmin, ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import Dropdown from 'react-bootstrap/Dropdown'
import './style.css'
import { AppGlobalContext } from '../../hooks/AppContext'
import { DesactiverModal, SupprimerModal } from './modals'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../../utils/config/axiosConfig'
import EditForm from './editform'

const Information = ({ membre, roles, ville, fetch }) => {
    const { admin } = AppGlobalContext()
    const navigate = useNavigate()
    const [modal, setModal] = useState(null)
    const [desactivationMembre, setDesactivationMembre] = useState(null)
    const [supprimermembre, setSupprimermembre] = useState(null)
    const [edit, setEdit] = useState(false);
    const handleClose = () => setModal(null)
    const timerRef = useRef(null)





    //active or deactive member status toggler
    const desactivation = async (e) => {
        try {
            e.preventDefault();
            await axios.patch(`/membre/${desactivationMembre.id}`)
            toast.success('Success')
            fetch()
        } catch (err) {
            toast.error("Echec")
        }
    }

    const suppression = async (e) => {
        try {
            e.preventDefault();
            await axios.delete(`/membre/${supprimermembre.id}`)
            toast.success('Success')
            timerRef.current = setTimeout(() => {
                navigate('/membres')
            }, 300)
        } catch (err) {
            toast.error('Echec')
        }
    }

    const formatDate = (date) => {
        if (!date) return '';
        let formatedDate = new Date(date)
        let month = formatedDate.getMonth()
        let year = formatedDate.getFullYear()
        let day = formatedDate.getDate()
        const mois = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
        return day + ' ' + mois[month] + ' ' + year
    }

    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current)
        }
    }, [])


    return (
        <div className="row">
            <div className="col-xl-3">
                <RoleDepartement
                    membre={membre}
                    roles={roles}
                    fetch={fetch} />
                <Relation membre={membre} fetch={fetch} />
            </div>

            <div className='col-xl-9'>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-header-text">
                                    Informations Personnelles</h5>

                                {/* SuperAdmin seul a le droit de supprimer ou modifier un admin */}
                                <AdminEtSuperAdmin membre={membre}>
                                    <ContentPermsWrapper requiredPerms={['modifier_membre']}>
                                        <div className='f-right'>
                                            <Dropdown>
                                                <Dropdown.Toggle variant='link' className='btn  btn-outline-default py-0 rounded' as={"button"}>
                                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>

                                                    {membre.is_active &&
                                                        <ContentPermsWrapper requiredPerms={['modifier_membre']}>
                                                            <Dropdown.Item onClick={() => setEdit(true)}>
                                                                Modifier
                                                            </Dropdown.Item>
                                                        </ContentPermsWrapper>
                                                    }

                                                    {membre.id != admin.id &&
                                                        <ContentPermsWrapper requiredPerms={['modifier_membre']}>
                                                            <Dropdown.Item onClick={() => { setModal("statut"); setDesactivationMembre(membre) }}>{
                                                                membre.is_active ? "Deactivation" : "Activation"
                                                            }</Dropdown.Item>
                                                        </ContentPermsWrapper>}

                                                    {membre.id != admin.id &&
                                                        <ContentPermsWrapper requiredPerms={['superAdmin']}>
                                                            <Dropdown.Item onClick={() => { setModal("supprimer"); setSupprimermembre(membre) }}>
                                                                Supprimer
                                                            </Dropdown.Item>
                                                        </ContentPermsWrapper>
                                                    }
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>

                                    </ContentPermsWrapper>
                                </AdminEtSuperAdmin>
                            </div>
                            <div className="card-body">
                                {!edit &&
                                    <div id="view-info" className="row">
                                        <div className="col-md-12">
                                            <table className="table table-responsive m-b-0">
                                                <tbody>
                                                    <tr>
                                                        <th className="social-label b-none p-t-0">Nom</th>
                                                        <td className="social-user-name b-none p-t-0 text-muted">
                                                            {capitalizeFirstLetter(membre.last_name)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th className="social-label b-none">Prenom</th>
                                                        <td className="social-user-name b-none text-muted">
                                                            {capitalizeFirstLetter(membre.first_name)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th className="social-label b-none">Sexe</th>
                                                        <td className="social-user-name b-none text-muted">
                                                            {membre.gender === 'H' && 'Homme'}
                                                            {membre.gender === 'F' && 'Femme'}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th className="social-label b-none">Date Naissance</th>
                                                        <td className="social-user-name b-none text-muted">
                                                            {formatDate(membre.birthdate)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th className="social-label b-none">
                                                            Statut Matrimonial
                                                        </th>
                                                        <td className="social-user-name b-none p-b-0 text-muted">
                                                            {membre.marital_status === 'V' && 'Veuf(ve)'}
                                                            {membre.marital_status === 'M' && 'Marie'}
                                                            {membre.marital_status === 'C' && 'Celibataire'}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th className="social-label b-none">Contact</th>
                                                        <td className="social-user-name b-none text-muted">
                                                            {membre.phone}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <th className="social-label b-none p-b-0">Email</th>
                                                        <td className="social-user-name b-none text-muted">
                                                            {membre.email}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                }
                                {edit && <EditForm membre={membre} ville={ville} handleClose={setEdit} />}
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-12">
                        <div className={`card d-${edit ? 'none' : 'block'}`}>
                            <div className="card-header">
                                <h5 className="card-header-text">
                                    Addresse Et Metier</h5>
                            </div>
                            <div className="card-body">
                                <div id="contact-info" className="row">
                                    <div className=" col-md-12">
                                        <table className="table table-responsive m-b-0">
                                            <tbody><tr>
                                                <th className="social-label b-none p-t-0">
                                                    Ville
                                                </th>
                                                <td className="social-user-name b-none p-t-0 text-muted">
                                                    {membre.city_name}
                                                </td>
                                            </tr>
                                                <tr>
                                                    <th className="social-label b-none">
                                                        Addresse
                                                    </th>
                                                    <td className="social-user-name b-none text-muted">
                                                        {membre.address}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th className="social-label b-none">
                                                        Type Metier
                                                    </th>
                                                    <td className="social-user-name b-none text-muted">
                                                        {membre.profession_type}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th className="social-label b-none p-b-0">
                                                        Metier
                                                    </th>
                                                    <td className="social-user-name b-none p-b-0 text-muted">
                                                        {membre.profession}
                                                    </td>
                                                </tr>
                                            </tbody></table>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>


                    <div className="col-sm-12">
                        <div className={`card d-${edit ? 'none' : 'block'}`}>
                            <div className="card-header">
                                <h5 className="card-header-text">
                                    Info Eglise</h5>
                            </div>
                            <div className="card-body">
                                <div id="work-info" className="row">
                                    <div className="col-lg-6 col-md-12">
                                        <table className="table table-responsive m-b-0">
                                            <tbody><tr>
                                                <th className="social-label b-none p-t-0">
                                                    Eglise
                                                </th>
                                                <td className="social-user-name b-none p-t-0 text-muted">
                                                    {membre.church_name}
                                                </td>
                                            </tr>
                                                <tr>
                                                    <th className="social-label b-none">
                                                        Categorie
                                                    </th>
                                                    <td className="social-user-name b-none text-muted">
                                                        {AgeCategory(membre.birthdate)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th className="social-label b-none">
                                                        Statut
                                                    </th>
                                                    <td className="social-user-name b-none p-b-0 text-muted">
                                                        {StatutBadge(membre.status)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th className="social-label b-none">
                                                        Date Bapteme
                                                    </th>
                                                    <td className="social-user-name b-none p-b-0 text-muted">
                                                        {formatDate(membre.baptism_date)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th className="social-label b-none">
                                                        {membre.status === 'Visiteur' ? 'Suivi(e) par' : 'Etait suivi(e) par'}
                                                    </th>
                                                    <td className="social-user-name b-none p-b-0 text-muted">
                                                        <Link to={'/membres/profile/' + membre.followed_up_by_name?.id}>
                                                            {membre.followed_up_by_name?.name}
                                                        </Link>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th className="social-label b-none">
                                                        Enreg. Le
                                                    </th>
                                                    <td className="social-user-name b-none p-b-0 text-muted">
                                                        {membre.date_joined ? formatDate(membre.date_joined) : ''}
                                                    </td>
                                                </tr>
                                            </tbody></table>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <DesactiverModal
                membre={membre}
                modal={modal}
                handleClose={handleClose}
                handleSubmit={desactivation} />


            <SupprimerModal
                membre={membre}
                modal={modal}
                handleClose={handleClose}
                handleSubmit={suppression}
            />

        </div >
    )
}

export default Information