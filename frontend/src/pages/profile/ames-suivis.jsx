import React from 'react'
import RoleDepartement from './roledepartement'
import Relation from './relation'
import { Link, useNavigate } from 'react-router-dom'
import { StatutBadge } from '../../utils/membre/statut'
import Badge from '../../components/buttons/badge'
import { formatDate } from '../../utils/datetime/formatdate'

const AmesSuivis = ({ membre, roles, fetch }) => {
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
                            Membres Suivis ({membre.membres_suivis?.length})
                        </h5>
                    </div>
                    {membre.membres_suivis?.length === 0 && (<div className='card-body text-center fw-bold'>Aucun Membre Suivi</div>)}
                    {membre.membres_suivis?.length > 0 &&
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
                                    {membre?.membres_suivis != null && membre.membres_suivis.map(mem =>
                                        <tr onClick={() => navigate(`/membres/profile/${mem.id}`)} style={{ cursor: 'pointer' }} key={mem.id}>
                                            <td >{mem.prenom} {mem.nom}</td>
                                            <td>{mem.categorie}</td>
                                            <td>
                                                {mem.estActif && StatutBadge(mem.statut)}
                                                {!mem.estActif && <Badge color='dark'>Inactif</Badge>}
                                            </td>
                                            <td>{formatDate(mem.annee_bapt)}</td>
                                            <td>{formatDate(mem.date_arrive)}</td>
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