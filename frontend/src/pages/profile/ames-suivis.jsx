import React from 'react'
import RoleDepartement from './roledepartement'
import Relation from './relation'
import { Link, useNavigate } from 'react-router-dom'
import { StatutBadge } from '../../utils/membre/statut'
import Badge from '../../components/buttons/badge'
import { formatDate } from '../../utils/datetime/formatdate'

const AmesSuivis = ({ membre, roles, fetch }) => {
    const formatDate = (date) => {
        if (!date) return '';
        let formatedDate = new Date(date)
        let month = formatedDate.getMonth()
        let year = formatedDate.getFullYear()
        let day = formatedDate.getDate()
        const mois = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
        return day + ' ' + mois[month] + ' ' + year
    }
    const navigate = useNavigate()
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
                <div className="card" style={{ minHeight: "50vh" }}>
                    <div className="card-header">
                        <h5 className="card-header-text">
                            Membres Suivis ({membre.follow_up?.length})
                        </h5>
                    </div>
                    {membre.follow_up?.length === 0 && (<div className='card-body text-center fw-bold'>Aucun Membre Suivi</div>)}
                    {membre.follow_up?.length > 0 &&
                        <div className="card-body contact-details">
                            <table className="table table-striped table-bordered nowrap">
                                <thead>
                                    <tr role="row">
                                        <th >Nom Et Prenom</th>
                                        <th >Categorie</th>
                                        <th >Statut Actu.</th>
                                        <th >Baptisé le</th>
                                        <th >Arrivé le</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {membre?.follow_up != null && membre.follow_up.map(mem =>
                                        <tr onClick={() => navigate(`/membres/profile/${mem.id}`)} style={{ cursor: 'pointer' }} key={mem.id}>
                                            <td >{mem.get_full_name}</td>
                                            <td>{mem.category}</td>
                                            <td>
                                                {mem.is_active && StatutBadge(mem.status)}
                                                {!mem.is_active && <Badge color='dark' text={"Inactif"} />}
                                            </td>
                                            <td>{formatDate(mem.baptism_date)}</td>
                                            <td>{formatDate(mem.date_joined)}</td>
                                        </tr>)}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default AmesSuivis