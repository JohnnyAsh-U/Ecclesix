import React from 'react'
import { Tabs } from '../../components/tabs/tabs'
import Information from './information'
import Admin from './admin'
import Header from './header'
import { AppGlobalContext } from '../../hooks/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { LoadingPage } from '../../components/Loading/loading'
import { toast } from 'react-toastify'
import useFetch from '../../hooks/fetchHook'
import AmesSuivis from './ames-suivis'



const Profile = () => {
  const navigate = useNavigate()
  const { permissions } = AppGlobalContext()
  let { id } = useParams();

  const { loading, data, error, reload } = useFetch(`/membre/${id}`, 'get')
  const { res: membre, liste_ville: ville, liste_role: roles } = data || {}
  window.scrollTo(0, 0)


  if (error) {
    toast.error('Impossible de charger les donnees')
    if (error.response.status == 403) navigate('/404');
    return
  }

  const tab = [
    { id: 1, label: "Information", content: <Information roles={roles} membre={membre} fetch={reload} ville={ville} /> },
    { id: 2, label: "Membres Suivis", content: <AmesSuivis roles={roles} membre={membre} /> },
    { id: 3, label: "Admin", content: <Admin roles={roles} membre={membre} fetch={reload} /> },
  ]

  return (
    <>
      {loading && <LoadingPage />}
      {!loading && data &&
        <> <BreadCrumb title={'Profile'} />
          <div className="row">
            <div className="col-lg-12">
              <Header membre={data.res} />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <Tabs tabs={tab.map(t => {
                if (t.id == 1) {
                  return t;
                }
                if (t.id == 2 && membre.statut !== 'Visiteur' && membre.statut !== 'Membre') {
                  return t
                }
                if (t.id == 3 && membre.admin && permissions.superAdmin) {
                  return t
                }
                return null
              }).filter(t => t !== null)}
              />
            </div>
          </div>
        </>}
    </>
  )
}

export default Profile