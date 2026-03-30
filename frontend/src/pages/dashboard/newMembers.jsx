import React from 'react'
import Badge from '../../components/buttons/badge'
import { AgeCategory } from '../../utils/datetime/agecategory'
import { useNavigate } from 'react-router-dom'
import {ActifStatut, StatutBadge} from '../../utils/membre/statut'

const NewMembers = ({ data }) => {
    const navigate = useNavigate()

    const formatDate = (date) => {
        if (!date) return '';
        let formatedDate = new Date(date)
        let month = formatedDate.getMonth()
        let year = formatedDate.getFullYear()
        let day = formatedDate.getDate()
        const mois = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']
        return day + ' ' + mois[month] + ' ' + year
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
                                        <td><i className={membre.gender === 'H' ? "icofont icofont-business-man-alt-1 fs-4 ms-1" : "icofont icofont-girl-alt fs-4 ms-1"}></i>
                                            <div className="table-contain">
                                                <h6 className='fw-light'>{membre.get_full_name}</h6>
                                                {StatutBadge(membre.status)}
                                                {' '}
                                                <p className="text-muted"> | {formatDate(membre.date_joined)}</p>
                                            </div>
                                        </td>
                                        <td>{membre.marital_status === 'V' && 'Veuf(ve)'}
                                            {membre.marital_status === 'M' && 'Marie'}
                                            {membre.marital_status === 'C' && 'Celibataire'}
                                        </td>
                                        <td>{membre.city_name}</td>
                                        <td>{membre.church_name}</td>
                                        <td>{AgeCategory(membre.birthdate)}</td>
                                        <td>{membre.profession_type}</td>
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