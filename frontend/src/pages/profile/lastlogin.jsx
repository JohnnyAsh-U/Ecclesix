import React, { useState } from 'react'
import { timeFormat } from '../../utils/datetime/formattime'
import { AppGlobalContext } from '../../hooks/AppContext'
import { toast } from 'react-toastify'
import Modal from 'react-bootstrap/Modal'
import axios from '../../utils/config/axiosConfig'

const LastLogin = ({ membre }) => {
    const { admin, permissions } = AppGlobalContext()
    const [modal, setModal] = useState(false)


    const NommersuperAdmin = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.patch(`/admin/${membre.id}/su`);
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
                    <div>{timeFormat(membre.last_login)}</div>
                </li>
            </ul>
            <hr />
            {permissions.superAdmin && admin.id == 1 && membre.id != 1 &&
                <button className='btn btn-default btn-outline-success p-1 float-end rounded' onClick={() => setModal(true)}>
                    {membre.is_superuser ? 'Retirer SuperAdmin' : 'Nommer SuperAdmin'}
                </button>
            }

            <Modal show={modal} onHide={() => setModal(false)} centered>
                <form onSubmit={(e) => NommersuperAdmin(e)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {membre.is_superuser ? 'Retirer' : 'Ajouter'} SuperAdmin
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {membre.is_superuser ? "Retirer": "Ajouter"} {membre.get_full_name} en tant que SuperAdmin
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