import React from 'react'
import Modal from 'react-bootstrap/Modal'


export const DesactiverModal = ({ membre, modal, handleSubmit, handleClose }) => {
    return (
        <Modal show={modal === 'statut'} onHide={() => handleClose()} centered>
            <form onSubmit={(e) => handleSubmit(e)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {membre.is_active ? "Desactivation" : "Activation"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {membre.is_active ? "Desactivation" : "Activation"} du Profil {membre.get_full_name}
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse rounded btn-sm`} onClick={() => handleClose()}>
                        Fermer
                    </button>
                    <button type="submit" className={`btn btn-primary hor-grd btn-grd-primary btn-sm waves-effect waves-light rounded`}>
                        Ok
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}


export const SupprimerModal = ({ membre, modal, handleSubmit, handleClose }) => {
    return (
        <Modal show={modal === 'supprimer'} onHide={() => handleClose()} centered>
            <form onSubmit={(e) => handleSubmit(e)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Supprimer {membre.get_full_name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Voulez vous supprimer ce profil: {membre.get_full_name}
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className={`btn btn-inverse btn-outline-inverse rounded btn-sm`} onClick={() => handleClose()}>
                        Fermer
                    </button>
                    <button type="submit" className={`btn btn-primary hor-grd btn-grd-primary btn-sm waves-effect waves-light rounded`}>
                        Ok
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}