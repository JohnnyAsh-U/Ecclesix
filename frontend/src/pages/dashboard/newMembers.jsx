import React from 'react'
import Badge from '../../components/buttons/badge'
import { formatDate } from '../../utils/datetime/month'
import { AgeCategory } from '../../utils/datetime/agecategory'
import { useNavigate } from 'react-router-dom'

const NewMembers = ({ data }) => {
    const navigate = useNavigate()

    const StatutBadge = (statut) => {
        if (statut == 'Ministre') {
            return <Badge color="success" text={statut} />
        } else if (statut == 'Ouvrier') {
            return <Badge color="primary" text={statut} />
        } else if (statut == 'Membre') {
            return <Badge color="warning" text={statut} />
        } else {
            return <Badge color="danger" text={statut} />
        }
    }


    const ActifStatut = (membre) => {
        if (membre.profile_admin?.super_admin) {
            return <Badge color='success' text={"SuperAdmin"} />
        } else if (membre.admin) {
            return <Badge color='success' text={"Admin"} />
        } else if (membre.estActif) {
            return <Badge color='info' text={"Actif"} />
        } else {
            return <Badge color='dark' text={"Inactif"} />
        }
    }

    return (
        <div className="col-md-12">
            <div className="card">
                <div className="card-header">
                    <div className="card-header-left">
                        <h5>Membres</h5>
                    </div>

                </div>
                <div className="card-body marketing-card p-t-0">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Nom Et Prenom</th>
                                    <th>Statut M.</th>
                                    <th>Ville</th>
                                    <th>Eglise</th>
                                    <th>Categorie</th>
                                    <th>Profession</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>

                            {data.map((membre, index) =>
                                <tr style={{ cursor: 'pointer' }} key={index} onClick={() => navigate(`/membres/profile/${membre.id}`)}>
                                    <td><i className={membre.sexe === 'H' ? "icofont icofont-business-man-alt-1 fs-4 ms-1" : "icofont icofont-girl-alt fs-4 ms-1"}></i>
                                        <div className="table-contain">
                                            <h6 className='fw-light'>{membre.prenom} {membre.nom}</h6>
                                            {StatutBadge(membre.statut)}
                                            {' '}
                                            <p className="text-muted"> | {formatDate(membre.date_arrive)}</p>
                                        </div>
                                    </td>
                                    <td>{membre.statut_matrimonial === 'V' && 'Veuf(ve)'}
                                        {membre.statut_matrimonial === 'M' && 'Marie'}
                                        {membre.statut_matrimonial === 'C' && 'Celibataire'}
                                    </td>
                                    <td>{membre.ville && membre.ville.lib_ville}</td>
                                    <td>{membre.eglise && membre.eglise.lib_eglise}</td>
                                    <td>{AgeCategory(membre.date_de_naissance)}</td>
                                    <td>{membre.type_metier}</td>
                                    <td>{ActifStatut(membre)}</td>
                                </tr>
                            )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default NewMembers