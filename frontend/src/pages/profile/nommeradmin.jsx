import { faUserGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { toast } from 'react-toastify'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { AppGlobalContext } from '../../hooks/AppContext'


const NommerAdmin = ({ membre }) => {
    const { admin } = AppGlobalContext()
    const [adminModal, setAdminModal] = useState(false)


    const handleAdmin = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post(`/admin/option`, { estAdmin: membre.admin, id: membre.id });
            setAdminModal(false)
            toast.success("Success");
            window.location.reload()
        } catch (err) {
            toast.error("Echec")
        }
    }

    return (
        <>
            {parseInt(membre.id) !== parseInt(admin.id) && membre.estActif && membre.id != 1 &&
                <ContentPermsWrapper requiredPerms={['superAdmin']}>
                    <button type="button"
                        className="btn btn-primary  p-2 me-2 rounded"
                        onClick={() => setAdminModal(!adminModal)}
                    >
                        <FontAwesomeIcon icon={faUserGear} className='me-1' />
                        {membre.admin ? 'Retirer Admin' : 'Ajouter Admin'}
                    </button>
                </ContentPermsWrapper>
            }

            <button type="button"
                className="btn btn-primary p-2 rounded"><i
                    className="icofont icofont-ui-messaging"></i>
                Message
            </button>
            <Modal show={adminModal} onHide={() => handleClose()} centered>
                <form onSubmit={(e) => handleAdmin(e)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {membre.admin ? 'Retirer' : 'Nommer'} Admin
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {membre.admin ? "Retirer" : "Ajouter"} {membre.nom} {membre.prenom} en tant qu'Admin
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className={`btn btn-inverse btn-outline-inverse rounded btn-sm`} onClick={() => setAdminModal(false)}>
                            Fermer
                        </button>
                        <button type="submit" className={`btn btn-primary hor-grd btn-grd-primary btn-sm waves-effect waves-light rounded`}>
                            Ok
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}

export default NommerAdmin