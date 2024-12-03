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
    nom: '',
    prenom: '',
    sexe: '0',
    date_de_naissance: '',
    numero_tel: '',
    id_ville: '0',
    date_arrive: date_aujourdhui(new Date()),
    email: '',
    annee_bapt: '',
    statut_matrimonial: '0',
    categorie: '0',
    statut: '0',
    id_eglise: admin.id_eglise || '0',
    type_metier: '0',
    metier: '',
    addresse: '',
    id_suivi_par: '0',
  }
  const validationSchema = yup.object({
    nom: yup.string().required('Ce champ est requis'),
    prenom: yup.string().required('Ce champ est requis'),
    sexe: yup.string().notOneOf(['0'], 'Ce champ est requis'),
    date_de_naissance: yup.string().notRequired(),
    numero_tel: yup.string().notRequired(),
    id_ville: yup.string().notOneOf(['0'], 'Ce champ est requis'),
    date_arrive: yup.string().required('Ce champ est requis'),
    email: yup.string().email("Email Invalide").notRequired(),
    annee_bapt: yup.string().notRequired(),
    statut_matrimonial: yup.string().notOneOf(['0'], 'Ce champ est requis'),
    type_metier: yup.string().notOneOf(['0'], 'Ce champ est requis'),
    categorie: yup.string().notOneOf(['0'], 'Ce champ est requis'),
    statut: yup.string().notOneOf(['0'], 'Ce champ est requis'),
    id_eglise: yup.string().notOneOf(['0'], 'Ce champ est requis'),
    metier: yup.string().required('Ce champ est requis'),
    addresse: yup.string().required('Ce champ est requis'),
    id_suivi_par: yup.string().notRequired()
  })

  const submit = async (values) => {
    setLoading(true)
    try {
      const { data } = await axios.post('/membre', { values });
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
      eglise: admin.id_eglise,
      Ministre: true,
      Ouvrier: true
    }).toString()
    try {
      const { data } = await axios.get(`/eglise/ville`, { withCredentials: true });
      const { data: liste_suivi_par } = await axios.get(`/membre/liste?${query}`, { withCredentials: true })
      setSuiveurs(liste_suivi_par.res)
      setListeVille(data.res)
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
                        name={"nom"}
                        type="text"
                        placeholder="Nom" />
                    </div>
                    <div className="col-sm-6">
                      <FormInputAddOn
                        addon={'P'}
                        color={'primary'}
                        name={"prenom"}
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
                        name={"numero_tel"}
                        type="text"
                        placeholder="Contact" />
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faUser} />}
                        name={"sexe"}
                      >
                        <option disabled value="0">Sexe</option>
                        <option value="H">Homme</option>
                        <option value="F">Femme</option>
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormInputAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faCalendarCheck} />}
                        name={"date_de_naissance"}
                        type={"date"}
                        placeholder={"Date De Naissance"}
                      />
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={"S"}
                        name={"statut_matrimonial"}
                      >
                        <option value={"0"} disabled>Statut Matrimoniale</option>
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
                        name={"id_ville"}
                      >
                        <option value='0' disabled>Ville</option>
                        {listeville.map((ville) =>
                          <option value={ville.id_ville} key={ville.id_ville}>{ville.lib_ville}</option>
                        )}
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-8 m-b-5">
                      <FormInputAddOn
                        color={"primary"}
                        addon={<FontAwesomeIcon icon={faLocation} />}
                        name={"addresse"}
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
                        name={"type_metier"}
                        placeholder="Type Metier"
                      >
                        <option value="0" disabled>Type Metier</option>
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
                        name={"metier"}
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
                        name={"id_eglise"}
                        placeholder="Eglise"
                        disabled = {!permissions.superAdmin}
                      >
                        <option value="0" disabled>Choississez l'eglise</option>
                        {eglises.map((eglise) =>
                          <option key={eglise.id_eglise} value={eglise.id_eglise}>{eglise.lib_eglise}</option>
                        )}
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={"C"}
                        name={"categorie"}
                      >
                        <option value="0" disabled>Categorie</option>
                        <option value="Adulte">Adulte</option>
                        <option value="Jeunesse">Jeunesse</option>
                        <option value="Ecodim">Ecodim</option>
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={"S"}
                        name={"statut"}
                      >
                        <option value='0' disabled>Statut</option>
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
                        name={"annee_bapt"}
                        type={"date"}
                        placeholder={"Date De Bapteme"}
                      />
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormSelectAddOn
                        color={"primary"}
                        addon={"Suivi Par"}
                        name={"id_suivi_par"}
                      >
                        <option value='0' disabled>Suivi(e) par</option>
                        {suiveurs.map((suiveur) =>
                          <option value={suiveur.id} key={suiveur.id}>{suiveur.prenom} {suiveur.nom}</option>
                        )}
                      </FormSelectAddOn>
                    </div>

                    <div className="col-sm-4 m-b-5">
                      <FormInputAddOn
                        color={"primary"}
                        addon={"Date"}
                        name={"date_arrive"}
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