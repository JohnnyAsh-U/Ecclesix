import { faPencil, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from '../../utils/config/axiosConfig'
import _ from 'lodash'
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { AdminEtSuperAdmin, ContentPermsWrapper } from '../../utils/permissions/permwrapper';
import { capitalizeFirstLetter } from '../../utils/string/formatting';
import AsyncSelect from 'react-select/async'
import Select from 'react-select';
import Modal from 'react-bootstrap/Modal'



const Relation = ({ membre, fetch }) => {

    const [modifierRelation, setModifierRelation] = useState(false);
    const [supprimerRelation, setSupprimerRelation] = useState('');
    const [relation, setRelation] = useState({})
    const [modal, setModal] = useState(false);


    const fetchMembre = async (search) => {
        const filter = {
            Ministre: true,
            Ouvrier: true,
            Membre: true,
            Visiteur: true,
            baptise: true,
            non_baptise: true,
            actif: true
        }
        const query = new URLSearchParams({
            ...filter,
            search,
            page: 1,
            limit: 50,
        }).toString()
        try {
            const { data } = await axios.get(`/membre?${query}`);

            const membrefiltrer = data.list.filter((m) => m.id != membre.id)
            //removes the relations id from options
            // const nouvelleListeDesMembres = _.differenceBy(membrefiltrer, membre.relations.to_member_info, 'id')
            // const nouvelleListeDesMembres = membrefiltrer.filter((item) => !membre.relations.some(rel => item.id == rel.from_member_info.id))

            const options = membrefiltrer.map((item) => ({ value: item.id, label: item.get_full_name }))
            return options
        } catch (err) { }
    }



    const ajouterRelation = async (e) => {
        let data = {
            to_member: membre.id,
            from_member: relation.relation_id.value,
            relationship: relation.type.value
        }
        e.preventDefault()
        axios.post(`/membre/${membre.id}/relation`, data)
            .then(data => {
                toast.success('Success')
                setModifierRelation(false)
                setModal(false)
                setRelation({ relation_id: '', type: '' })
                fetch()
            })
            .catch(err => {
                toast.error(err.message)
            })
    }


    const suppresionRelation = async (e) => {
        e.preventDefault()
        try {
            // const { data } = await axios.delete(`/membre/${membre.id}/relation/${supprimerRelation}`);
            const { data } = await axios.delete(`/membre/${supprimerRelation}/relation`);
            setRelation({ relation_id: '', type: '' })
            toast.success('Success')
            setModal(false)
            window.location.reload()
        } catch (err) {
            toast.error('Echec')
        }
    }

    const type_relation = [
        { value: 'Marriage', label: 'Marriage' },
        { value: 'Parent', label: 'Parent' },
        { value: 'Enfant', label: 'Enfant' },
        { value: 'Frere/Soeur', label: 'Frere/Soeur' },
        { value: 'Autres', label: 'Autres' }
    ]

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-header-text">
                    <h5 className="card-title">
                        Relations
                    </h5>
                </div>
                <AdminEtSuperAdmin membre={membre}>
                    <ContentPermsWrapper requiredPerms={['modifier_membre']}>
                        <div className="card-header-right me-2" style={{ cursor: 'pointer' }} onClick={() => setModifierRelation(!modifierRelation)}>
                            <FontAwesomeIcon icon={faPencil} />
                        </div>
                    </ContentPermsWrapper>
                </AdminEtSuperAdmin>
            </div>

            <div className="card-body">
                <ul className="list-group list-group-flush">
                    {membre.relations && membre.relations.map((lien) =>
                        <li className="list-group-item d-flex justify-content-between align-items-center m-b-10" key={lien.id}>
                            <a className='d-flex justify-content-start align-items-center' href={`/membres/profile/${lien.from_member_info.id}`}>
                                <div className="media-left m-0" >
                                    <FontAwesomeIcon icon={faUser} size='2xl' />
                                </div>
                                <div className="media-body">
                                    <div className="chat-header">
                                        {lien.from_member_info?.name}
                                    </div>
                                    <div className="text-muted social-designation">
                                        {lien.relationship}
                                    </div>
                                </div>
                            </a>

                            <FontAwesomeIcon
                                icon={faTrash}
                                style={{ cursor: 'pointer' }}
                                className={`me-0 ${modifierRelation ? 'd-block' : 'd-none'}`}
                                onClick={() => { setSupprimerRelation(lien.id); setModal(true) }}
                            />
                        </li>
                    )}
                </ul>

                <form onSubmit={ajouterRelation}>
                    <div className='row g-1 mt-2' style={{ display: `${modifierRelation ? '' : 'none'}` }}>
                        <div className='col-12'>
                            <AsyncSelect styles={{ control: (provided) => ({ ...provided, minWidth: 150 }) }}
                                cacheOptions
                                defaultOptions
                                loadOptions={fetchMembre}
                                value={relation.relation_id}
                                placeholder="Relation"
                                onChange={(e) => setRelation({ ...relation, relation_id: e })}
                            />
                        </div>
                        <div className='col-12' >
                            <Select options={type_relation} name='type' value={relation.type} placeholder="Type" onChange={(e) => setRelation({ ...relation, type: e })} />
                        </div>
                        <div className='col-12'>
                            <button type='submit' className='float-end btn btn-sm rounded btn-outline-primary'>OK</button>
                        </div>
                    </div>
                </form>

            </div>

            <Modal show={modal} onHide={() => setModal(false)} centered>
                <form onSubmit={suppresionRelation}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Supprimer
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Supprimer Cette Relation ?
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className={`btn btn-inverse btn-outline-inverse rounded btn-sm`} onClick={() => setModal(false)}>
                            Fermer
                        </button>
                        <button type="submit" className={`btn btn-danger hor-grd btn-grd-danger btn-sm waves-effect waves-light rounded`}>
                            Ok
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    )
}

export default Relation