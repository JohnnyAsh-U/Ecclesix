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

  const listeAdmin = data || []
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
                      {membre.get_full_name}
                    </td>
                    <td>{membre.email}</td>
                    <td>{membre.church}</td>
                    <td>{membre.phone}</td>
                    <td>{membre.role}</td>
                    <td> {timeFormat(membre.last_login)}</td>
                    <td>{membre.is_superuser ?
                      <Badge color='success' className='me-1' text={"SuperAdmin"} /> : <Badge color='info' text={"Admin"} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admins