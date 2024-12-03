import { faPencil, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios';
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
        const filter = {}
        const query = new URLSearchParams({
            ...filter,
            search,
            page: 1,
            limit: 50,
        }).toString()
        try {
            const { data } = await axios.get(`/membre?${query}`);

            const membrefiltrer = data.res.filter((m) => m.id != membre.id)
            //removes the relations id from options
            const nouvelleListeDesMembres = _.differenceBy(membrefiltrer, membre.relation, 'id')

            const options = nouvelleListeDesMembres.map((item) => ({ value: item.id, label: item.nom + ' ' + item.prenom }))
            return options
        } catch (err) { }
    }


    const ajouterRelation = async (e) => {
        e.preventDefault()
        axios.post(`/membre/${membre.id}/relation`,
            { id_relation: relation.relation_id.value, type_relation: relation.type.value })
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
            const { data } = await axios.delete(`/membre/${membre.id}/relation/${supprimerRelation}`);
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
                    {membre.relation.map((lien) =>
                        <li className="list-group-item d-flex justify-content-between align-items-center m-b-10" key={lien.id}>
                            <a className='d-flex justify-content-start align-items-center' href={`/membres/profile/${lien.id}`}>
                                <div className="media-left m-0" >
                                    <FontAwesomeIcon icon={faUser} size='2xl' />
                                </div>
                                <div className="media-body">
                                    <div className="chat-header">
                                        {capitalizeFirstLetter(lien.nom)} {capitalizeFirstLetter(lien.prenom)}
                                    </div>
                                    <div className="text-muted social-designation">
                                        {lien.RelationMembres.type_relation}
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

            <Modal show={modal} onHide={()=> setModal(false)}  centered>
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
                    <button type="button" className={`btn btn-inverse btn-outline-inverse rounded btn-sm`} onClick={()=>setModal(false)}>
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