import React, { useState } from 'react'
import { timeFormat } from '../../utils/datetime/formattime'
import { AppGlobalContext } from '../../hooks/AppContext'
import { toast } from 'react-toastify'
import Modal from 'react-bootstrap/Modal'
import axios from 'axios'

const LastLogin = ({ lastLogin, membre, superAdmin }) => {
    const { admin, permissions } = AppGlobalContext()
    const [modal, setModal] = useState(false)


    const NommersuperAdmin = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post(`/admin/superadmin`, { id: membre.id });
            setModal(false)
            toast.success('Success')
            window.location.reload()
        } catch (err) {
            toast.error('Echec')
        }
    }

    return (
        <div className="card-body ps-0">
            <ul className='list-group list-group-flush'>
                <li className='list-group-item d-flex justify-content-between align-items-center flex-wrap'>
                    <div>En Ligne</div>
                    <div>{timeFormat(lastLogin)}</div>
                </li>
            </ul>
            <hr />
            {permissions.superAdmin && admin.id == 1 && membre.id != 1 && lastLogin &&
                <button className='btn btn-default btn-outline-success p-1 float-end rounded' onClick={() => setModal(true)}>
                    {superAdmin ? 'Retirer SuperAdmin' : 'Nommer SuperAdmin'}
                </button>
            }

            <Modal show={modal} onHide={() => setModal(false)} centered>
                <form onSubmit={(e) => NommersuperAdmin(e)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {superAdmin ? 'Retirer' : 'Ajouter'} SuperAdmin
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {superAdmin? "Retirer": "Ajouter"} {membre.nom} {membre.prenom} en tant que SuperAdmin
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className={`btn btn-inverse btn-outline-inverse rounded btn-sm`} onClick={() => setModal(false)}>
                            Fermer
                        </button>
                        <button type="submit" className={`btn btn-primary hor-grd btn-grd-primary btn-sm waves-effect waves-light rounded`}>
                            Ok
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    )
}

export default LastLogin