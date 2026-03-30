import React, { useEffect, useState } from 'react'
import { FormInputWithLabel } from '../../components/Inputbox/input'
import { Formik, Form } from 'formik'
import * as yup from 'yup'
import { FormSelectWithLabel } from '../../components/Inputbox/form-select'
import { AppGlobalContext } from '../../hooks/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { LoadingButton2 } from '../../components/buttons/loadingbuttons'


const EditForm = ({ membre, ville, handleClose }) => {
    const [listeSuiviPar, setListeSuiviPar] = useState([]);
    const { permissions, eglises } = AppGlobalContext()
    const [loading, setLoading] = useState(false)


    const initialValues = {
        id: membre.id,
        first_name: membre.first_name,
        last_name: membre.last_name,
        gender: membre.gender,
        birthdate: membre.birthdate,
        phone: membre.phone,
        city: membre.city || '0',
        date_joined: membre.date_joined,
        email: membre.email,
        baptism_date: membre.baptism_date,
        marital_status: membre.marital_status,
        category: membre.category,
        status: membre.status,
        church: membre.church || '0',
        profession_type: membre.profession_type,
        profession: membre.profession,
        address: membre.address,
        followed_up_by: membre.followed_up_by || '0',
      }

      const validationSchema = yup.object({
        first_name: yup.string().required('Ce champ est requis'),
        last_name: yup.string().required('Ce champ est requis'),
        gender: yup.string().required('Ce champ est requis'),
        birthdate: yup.string().notRequired(),
        phone: yup.string().notRequired(),
        city: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        date_joined: yup.string().required('Ce champ est requis'),
        email: yup.string().email("Email Invalide").notRequired(),
        baptism_date: yup.string().notRequired(),
        marital_status: yup.string().required('Ce champ est requis'),
        profession_type: yup.string().required('Ce champ est requis'),
        category: yup.string().required('Ce champ est requis'),
        status: yup.string().required('Ce champ est requis'),
        church: yup.string().notOneOf(['0'],'Ce champ est requis'),
        profession: yup.string().required('Ce champ est requis'),
        address: yup.string().required('Ce champ est requis'),
        followed_up_by: yup.string().notRequired()
      })



    const fetchMembres = async () => {
        const query = new URLSearchParams({
            Ministre: true,
            Ouvrier: true,
            eglise: membre.church
        }).toString()
        try {
            const { data } = await axios.get(`/membre/liste?${query}`);
            setListeSuiviPar(data)
        } catch (err) {
            toast.error('Impossible de charger les donnees')
        }
    }

    useEffect(() => {
        fetchMembres()
    }, [])



    const onSubmit = async (values) => {
        setLoading(true)
        for (let val in values){
            if (values[val] == "" || values[val] == '0'){
                delete values[val]
            }
        }
        try {
            const { data } = await axios.put(`/membre/${membre.id}`,values );
            toast.success('Success')
            window.location.reload()
        } catch (err) {
           toast.error('Echec')
        } finally{
            setLoading(false)
        }
    }


    return (
        <div id="view-info" className="row">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}>
                <Form>
                    <div className="col-sm-12 px-3">
                        <FormInputWithLabel title={"Nom"} name={"last_name"} />
                        <FormInputWithLabel title={"Prenom"} name={"first_name"} />
                        <FormSelectWithLabel name={'gender'} title={'Sexe'}>
                            <option value="H">Homme</option>
                            <option value="F">Femme</option>
                        </FormSelectWithLabel>
                        <FormInputWithLabel title={"Date De Naissance"} type={"date"} name={"birthdate"}
                        />

                        <FormInputWithLabel
                            title={"Contacte"}
                            type={"text"}
                            name={"phone"}
                        />

                        <FormSelectWithLabel name='profession_type' title={'Categorie Metier'}>
                            <option value="Travailleur">Travailleur</option>
                            <option value="Entrepreneur">Entrepreneur</option>
                            <option value="Eleve/Etudiant">Elève/Etudiant</option>
                            <option value="Autres">Autres</option>
                        </FormSelectWithLabel>

                        <FormInputWithLabel
                            title={"Metier"}
                            type={"text"}
                            name={"profession"}
                        />

                        <FormSelectWithLabel name='city' title={'Ville'}>
                            <option disabled value={'0'}>Choississez la ville </option>
                            {ville && ville.map((v) => <option value={v.id} key={v.id} >{v.city_name}</option>)}
                        </FormSelectWithLabel>

                        <FormInputWithLabel
                            title={"Addresse"}
                            type={"addresse"}
                            name={"address"}
                        />

                        <FormInputWithLabel
                            title={"Email"}
                            type={"email"}
                            name={"email"}
                        />

                        <FormInputWithLabel
                            title={"Annee Bapteme"}
                            type={"date"}
                            name={"baptism_date"}
                        />


                        <FormSelectWithLabel name='marital_status' title={"Statut Matrimonial"}>
                            <option value="M">Marié</option>
                            <option value="C">Celibataire</option>
                            <option value="V">Veuf(ve)</option>
                        </FormSelectWithLabel>



                        <FormSelectWithLabel name='category' title={"Categorie"}>
                            <option value="Adulte">Adulte</option>
                            <option value="Jeunesse">Jeunesse</option>
                            <option value="Ecodim">Ecodim</option>
                        </FormSelectWithLabel>

                        <FormSelectWithLabel name='status' title={"Statut"}>
                            <option value="Ministre">Ministre</option>
                            <option value="Ouvrier">Ouvrier</option>
                            <option value="Membre">Membre</option>
                            <option value="Visiteur">Visiteur</option>
                        </FormSelectWithLabel>

                        {permissions.superAdmin &&
                            <FormSelectWithLabel name='church' title={"Eglise"}>
                                <option disabled value={'0'}>Choississez l'eglise</option>
                                {eglises.map((eg) => <option key={eg.id} value={eg.id}>{eg.church_name}</option>)}
                            </FormSelectWithLabel>}

                        <FormSelectWithLabel name='followed_up_by' title={'Suivi(e) Par'}>
                            <option disabled value={'0'}>Suivi(e) par</option>
                            {listeSuiviPar.map((m) => <option value={m.id} disabled={m.id == membre.id} key={m.id} >{m.get_full_name}</option>)}
                        </FormSelectWithLabel>
                    </div>

                    <div className="card-footer my-4">
                        <div className="row">
                            <div className="col-sm-12 text-right">
                                <button className={'btn  btn-outline-danger me-2'} onClick={() => handleClose(false)}>
                                    Annuler
                                </button>
                                <LoadingButton2 color={'primary'} loading={loading} name={"Modifier"} type="submit" />
                            </div>
                        </div>
                    </div>
                </Form>

            </Formik>

        </div>
    )
}

export default EditForm