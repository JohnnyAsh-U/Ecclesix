import { faUserGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from '../../utils/config/axiosConfig'
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
            const { data } = await axios.patch(`/admin/${membre.id}`);
            setAdminModal(false)
            toast.success("Success");
            window.location.reload()
        } catch (err) {
            toast.error("Echec")
        }
    }

    return (
        <>
            {parseInt(membre.id) !== parseInt(admin.id) && membre.is_active && membre.id != 1 &&
                <ContentPermsWrapper requiredPerms={['superAdmin']}>
                    <button type="button"
                        className="btn btn-primary  p-2 me-2 rounded"
                        onClick={() => setAdminModal(!adminModal)}
                    >
                        <FontAwesomeIcon icon={faUserGear} className='me-1' />
                        {membre.is_admin ? 'Retirer Admin' : 'Ajouter Admin'}
                    </button>
                </ContentPermsWrapper>
            }

            {parseInt(membre.id) !== parseInt(admin.id) &&
                <button type="button"
                    className="btn btn-primary p-2 rounded"><i
                        className="icofont icofont-ui-messaging"></i>
                    Message
                </button>}
            <Modal show={adminModal} onHide={() => setAdminModal(false)} centered>
                <form onSubmit={(e) => handleAdmin(e)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {membre.is_admin ? 'Retirer' : 'Nommer'} Admin
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {membre.is_admin ? "Retirer" : "Ajouter"} {membre.get_full_name} en tant qu'Admin
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