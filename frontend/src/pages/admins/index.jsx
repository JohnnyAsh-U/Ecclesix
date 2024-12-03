import React from 'react'
import { toast } from 'react-toastify';
import useFetch from '../../hooks/fetchHook';
import { LoadingPage } from '../../components/Loading/loading';
import BreadCrumb from '../../components/breadcrumbs/breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGear } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { capitalizeFirstLetter } from '../../utils/string/formatting';
import Badge from '../../components/buttons/badge';
import { timeFormat } from '../../utils/datetime/formattime';

const Admins = () => {
  const navigate = useNavigate()

  const { data, error, loading, reload } = useFetch('/admin', 'get')

  const { liste: listeAdmin } = data || {}
  let bg = { backgroundColor: '#cbd5e1' }



  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    toast.error("Echec")
    return
  }


  return (
    <div>
      <BreadCrumb icon={<FontAwesomeIcon icon={faUserGear} />} title={"Admins"} />
      <div className='card mb-0' style={{ height: '73vh', overflowY: 'auto', scrollbarWidth: 'thin' }}>
        <div className="card-body marketing-card p-t-0 px-0">
          <div className="table-responsive">
            <table className="table table-hover table-bordered nowrap">
              <thead className='bg-inverse'>
                <tr className='bg-inverse'>
                  <th style={bg}>Nom Et Prenom</th>
                  <th style={bg}>Email</th>
                  <th style={bg}>Eglise</th>
                  <th style={bg}>Contact</th>
                  <th style={bg}>Role</th>
                  <th style={bg}>En Ligne</th>
                  <th style={bg}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {listeAdmin && listeAdmin.map((membre, index) => (
                  <tr style={{ cursor: 'pointer' }} key={index} className='custom' onClick={() => navigate(`/membres/profile/${membre.id}`)}>
                    <td>
                      {capitalizeFirstLetter(membre.nom)} {capitalizeFirstLetter(membre.prenom)}
                    </td>
                    <td>{membre.email}</td>
                    <td>{membre.eglise?.lib_eglise}</td>
                    <td>{membre.numero_tel}</td>
                    <td>{capitalizeFirstLetter(membre.role?.lib_role)}</td>
                    <td> {membre.profile_admin && timeFormat(membre.profile_admin?.deniere_connexion)}</td>
                    <td>{membre.profile_admin && membre.profile_admin.super_admin ?
                      <Badge color='success' className='me-1' text={"SuperAdmin"} /> : <Badge color='info' text={"Admin"} />}</td>
                  </tr>
                ))}

                {/* {liste && liste.map((membre, index) =>
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
                            )} */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admins