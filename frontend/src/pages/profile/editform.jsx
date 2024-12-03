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
        nom: membre.nom,
        prenom: membre.prenom,
        numero_tel: membre.numero_tel ? membre.numero_tel : '',
        email: membre.email,
        id_ville: membre.id_ville ? membre.id_ville : '0',
        sexe: membre.sexe,
        statut_matrimonial: membre.statut_matrimonial,
        annee_bapt: membre.annee_bapt ? membre.annee_bapt : '',
        date_de_naissance: membre.date_de_naissance ? membre.date_de_naissance : '',
        date_arrive: membre.date_arrive,
        statut: membre.statut,
        categorie: membre.categorie,
        metier: membre.metier ? membre.metier : '',
        id_eglise: membre.id_eglise ? membre.id_eglise : '0',
        type_metier: membre.type_metier,
        addresse: membre.addresse,
        id_suivi_par: membre.id_suivi_par || '0'
    }


    const validationSchema = yup.object({
        nom: yup.string().required('Ce Champ est requis'),
        prenom: yup.string().required('Ce Champ est requis'),
        numero_tel: yup.string().notRequired(),
        email: yup.string().email('Email Invalid'),
        id_ville: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        date_de_naissance: yup.string().notRequired(),
        date_arrive: yup.string().required('Ce champ est requis'),
        annee_bapt: yup.string().notRequired(),
        type_metier: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        id_eglise: yup.string().notOneOf(['0'], 'Ce champ est requis'),
        metier: yup.string().required('Ce champ est requis'),
        addresse: yup.string().required('Ce champ est requis'),
        id_suivi_par: yup.string().notRequired()
    })

    const fetchMembres = async () => {
        const query = new URLSearchParams({
            Ministre: true,
            Ouvrier: true,
            eglise: membre.id_eglise
        }).toString()
        try {
            const { data } = await axios.get(`/membre/liste?${query}`);
            setListeSuiviPar(data.res)
        } catch (err) {
            toast.error('Impossible de charger les donnees')
        }
    }

    useEffect(() => {
        fetchMembres()
    }, [])



    const onSubmit = async (values) => {
        setLoading(true)
        try {
            const { data } = await axios.put(`/membre/${membre.id}`,{ values });
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
                        <FormInputWithLabel title={"Nom"} name={"nom"} />
                        <FormInputWithLabel title={"Prenom"} name={"prenom"} />
                        <FormSelectWithLabel name={'sexe'} title={'Sexe'}>
                            <option value="H">Homme</option>
                            <option value="F">Femme</option>
                        </FormSelectWithLabel>
                        <FormInputWithLabel title={"Date De Naissance"} type={"date"} name={"date_de_naissance"}
                        />

                        <FormInputWithLabel
                            title={"Contacte"}
                            type={"text"}
                            name={"numero_tel"}
                        />

                        <FormSelectWithLabel name='type_metier' title={'Categorie Metier'}>
                            <option value="Travailleur">Travailleur</option>
                            <option value="Entrepreneur">Entrepreneur</option>
                            <option value="Eleve/Etudiant">Elève/Etudiant</option>
                            <option value="Autres">Autres</option>
                        </FormSelectWithLabel>

                        <FormInputWithLabel
                            title={"Metier"}
                            type={"text"}
                            name={"metier"}
                        />

                        <FormSelectWithLabel name='id_ville' title={'Ville'}>
                            <option disabled value={'0'}>Choississez la ville </option>
                            {ville && ville.map((v) => <option value={v.id_ville} key={v.id_ville} >{v.lib_ville}</option>)}
                        </FormSelectWithLabel>

                        <FormInputWithLabel
                            title={"Addresse"}
                            type={"addresse"}
                            name={"addresse"}
                        />

                        <FormInputWithLabel
                            title={"Email"}
                            type={"email"}
                            name={"email"}
                        />

                        <FormInputWithLabel
                            title={"Annee Bapteme"}
                            type={"date"}
                            name={"annee_bapt"}
                        />


                        <FormSelectWithLabel name='statut_matrimonial' title={"Statut Matrimonial"}>
                            <option value="M">Marié</option>
                            <option value="C">Celibataire</option>
                            <option value="V">Veuf(ve)</option>
                        </FormSelectWithLabel>



                        <FormSelectWithLabel name='categorie' title={"Categorie"}>
                            <option value="Adulte">Adulte</option>
                            <option value="Jeunesse">Jeunesse</option>
                            <option value="Ecodim">Ecodim</option>
                        </FormSelectWithLabel>

                        <FormSelectWithLabel name='statut' title={"Statut"}>
                            <option value="Ministre">Ministre</option>
                            <option value="Ouvrier">Ouvrier</option>
                            <option value="Membre">Membre</option>
                            <option value="Visiteur">Visiteur</option>
                        </FormSelectWithLabel>

                        {permissions.superAdmin &&
                            <FormSelectWithLabel name='id_eglise' title={"Eglise"}>
                                <option disabled value={'0'}>Choississez l'eglise</option>
                                {eglises.map((eg) => <option key={eg.id_eglise} value={eg.id_eglise}>{eg.lib_eglise}</option>)}
                            </FormSelectWithLabel>}

                        <FormSelectWithLabel name='id_suivi_par' title={'Suivi(e) Par'}>
                            <option disabled value={'0'}>Suivi(e) par</option>
                            {listeSuiviPar.map((m) => <option value={m.id} disabled={m.id == membre.id} key={m.id} >{m.prenom} {m.nom}</option>)}
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