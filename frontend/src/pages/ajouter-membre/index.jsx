import React, { useEffect, useRef, useState } from 'react'
import { AppGlobalContext } from '../../hooks/AppContext';
import { date_aujourdhui } from '../../utils/datetime/formatdate';
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';
import BreadCrumb from '../../components/breadcrumbs/breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faCalendarCheck, faChurch, faCity, faLocation, faPhone, faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { FormInputAddOn } from '../../components/Inputbox/input';
import { FormSelectAddOn } from '../../components/Inputbox/form-select';
import { LoadingButton2 } from '../../components/buttons/loadingbuttons';

const AjouterMembre = () => {

  const navigate = useNavigate()
  const { permissions, admin, eglises } = AppGlobalContext()

  const [listeville, setListeVille] = useState([]);
  const [suiveurs, setSuiveurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null)


  const initialValues = {
    first_name: '',
    last_name: '',
    gender: '',
    birthdate: '',
    phone: '',
    city: '',
    date_joined: date_aujourdhui(new Date()),
    email: '',
    baptism_date: '',
    marital_status: '',
    category: '',
    status: '',
    church: admin.church_id || '',
    profession_type: '',
    profession: '',
    address: '',
    followed_up_by: '',
  }
  const validationSchema = yup.object({
    first_name: yup.string().required('Ce champ est requis'),
    last_name: yup.string().required('Ce champ est requis'),
    gender: yup.string().required('Ce champ est requis'),
    birthdate: yup.string().notRequired(),
    phone: yup.string().notRequired(),
    city: yup.string().required('Ce champ est requis'),
    date_joined: yup.string().required('Ce champ est requis'),
    email: yup.string().email("Email Invalide").notRequired(),
    baptism_date: yup.string().notRequired(),
    marital_status: yup.string().required('Ce champ est requis'),
    profession_type: yup.string().required('Ce champ est requis'),
    category: yup.string().required('Ce champ est requis'),
    status: yup.string().required('Ce champ est requis'),
    church: yup.string().required('Ce champ est requis'),
    profession: yup.string().required('Ce champ est requis'),
    address: yup.string().required('Ce champ est requis'),
    followed_up_by: yup.string().notRequired()
  })

  const submit = async (values) => {
    setLoading(true)
    try {
      const { data } = await axios.post('/membre', values );
      if (data) {
        toast.success('Success')
        timerRef.current = setTimeout(() => {
          navigate('/membres')
        }, 1000)
      }
    } catch (err) {
      toast.error("Erreur")
    } finally {
      setLoading(false)
    }
  }


  const fetchData = async () => {
    const query = new URLSearchParams({
      eglise: admin.church_id,
      Ministre: true,
      Ouvrier: true
    }).toString()
    try {
      const { data } = await axios.get(`/eglise/ville`, { withCredentials: true });
      const { data: liste_suivi_par } = await axios.get(`/membre/liste?${query}`, { withCredentials: true })
      setSuiveurs(liste_suivi_par)
      setListeVille(data)
    } catch (err) {
      toast.error("Impossible de charger les donnees")
    }
  }


  useEffect(() => {
    fetchData()
    return () => {
      clearTimeout(timerRef.current)
    }
  }, [])
  return (
    <div>
      <BreadCrumb icon={<> <FontAwesomeIcon icon={faUser} />
        <FontAwesomeIcon icon={faPlus} size='xs' className='me-1' /></>} title={"Ajouter Un Membre"} />



      {/* </BreadCrumb> */}
      <div className='row'>
        <div className="col-lg-12 col-xl-12">
          <Formik initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={submit}>
            <Form>
              <div className="card">
                <div className="card-body">
                  <h4 className="sub-title">Information Personnelles</h4>
                  <div className="form-group row mb-2">
                    <div className="col-sm-6 m-b-5">
                      <FormInputAddOn
                        addon={'N'}
                        color={'primary'}
                        name={"last_name"}
                        type="text"
                        placeholder="Nom" />
                    </div>
                    <div className="col-sm-6">
                      <FormInputAddOn
                        addon={'P'}
                        color={'primary'}
                        name={"first_name"}
                        type="text"
                        placeholder="Prenom" />
                    </div>
                  </div>
                  <div className="form-group row mb-2">
                    <div className="col-sm-6 m-b-5">
                      <FormInputAddOn
                        addon={"@"}
                        color={'primary'}
                        name={"email"} type="email" placeholder="Email" />
                    </div>
                    <div className="col-sm-6">
                      <FormInputAddOn
                        addon={<FontAwesomeIcon icon={faPhone} />}
                        color={'primary'}
                        name={"phone"}
                        type="text"
                        placeholder="Contact" />
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faUser} />}
                        name={"gender"}
                      >
                        <option disabled value="">Sexe</option>
                        <option value="H">Homme</option>
                        <option value="F">Femme</option>
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormInputAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faCalendarCheck} />}
                        name={"birthdate"}
                        type={"date"}
                        placeholder={"Date De Naissance"}
                      />
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={"S"}
                        name={"marital_status"}
                      >
                        <option value={""} disabled>Statut Matrimoniale</option>
                        <option value="M">Marié</option>
                        <option value="C">Celibataire</option>
                        <option value="V">Veuf(ve)</option>
                      </FormSelectAddOn>
                    </div>
                  </div>
                  <hr className='mt-4' />
                  <h4 className="sub-title">Addresse Et Metier</h4>
                  <div className="form-group row">
                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faCity} />}
                        name={"city"}
                      >
                        <option value='' disabled>Ville</option>
                        {listeville.map((ville) =>
                          <option value={ville.id} key={ville.id}>{ville.city_name}</option>
                        )}
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-8 m-b-5">
                      <FormInputAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faLocation} />}
                        name={"address"}
                        type={"text"}
                        placeholder={"Addresse"}
                      />
                    </div>
                  </div>

                  <div className="form-group row">
                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faBriefcase} />}
                        name={"profession_type"}
                        placeholder="Type Metier"
                      >
                        <option value="" disabled>Type Metier</option>
                        <option value="Travailleur">Travailleur</option>
                        <option value="Entrepreneur">Entrepreneur</option>
                        <option value="Eleve/Etudiant">Eleve/Etudiant</option>
                        <option value="Autres">Autres</option>
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-8 m-b-5">
                      <FormInputAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faBriefcase} />}
                        name={"profession"}
                        type={"text"}
                        placeholder={"Metier"}
                      />
                    </div>
                  </div>
                  <hr />
                  <h4 className="sub-title">Inscription Eglise</h4>
                  <div className="form-group row">
                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faChurch} />}
                        name={"church"}
                        placeholder="Eglise"
                        disabled = {!permissions.superAdmin}
                      >
                        <option value="" disabled>Choississez l'eglise</option>
                        {eglises.map((eglise) =>
                          <option key={eglise.id} value={eglise.id}>{eglise.church_name}</option>
                        )}
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={"C"}
                        name={"category"}
                      >
                        <option value="" disabled>Categorie</option>
                        <option value="Adulte">Adulte</option>
                        <option value="Jeunesse">Jeunesse</option>
                        <option value="Ecodim">Ecodim</option>
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={"S"}
                        name={"status"}
                      >
                        <option value='' disabled>Statut</option>
                        <option value="Ministre">Ministre</option>
                        <option value="Ouvrier">Ouvrier</option>
                        <option value="Membre">Membre</option>
                        <option value="Visiteur">Visiteur</option>
                      </FormSelectAddOn>
                    </div>
                  </div>

                  <div className="form-group row">
                    <div className="col-sm-4 m-b-5">
                      <FormInputAddOn
                        color={"primary"}
                        addon={"Bapteme"}
                        name={"baptism_date"}
                        type={"date"}
                        placeholder={"Date De Bapteme"}
                      />
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={"Suivi Par"}
                        name={"followed_up_by"}
                      >
                        <option value='' disabled>Suivi(e) par</option>
                        {suiveurs.map((suiveur) =>
                          <option value={suiveur.id} key={suiveur.id}>{suiveur.get_full_name}</option>
                        )}
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormInputAddOn
                        color={"primary"}
                        addon={"Date"}
                        name={"date_joined"}
                        type={"date"}
                        placeholder={"Date"}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-footer mb-4">
                  <div className="row">
                    <div className="col-sm-12 text-right">
                      <a href={'/membres'} className={'btn  btn-outline-danger me-2'} >
                        Annuler
                      </a>
                      <LoadingButton2 color={'primary'} loading={loading} name={"Inscription"} type="submit" />
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default AjouterMembre