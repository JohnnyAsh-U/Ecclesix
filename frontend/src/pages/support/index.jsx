import React, { useMemo, useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { AppGlobalContext } from '../../hooks/AppContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadset, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'
import axios from '../../utils/config/axiosConfig'

const Support = () => {
    const { admin, eglises } = AppGlobalContext()

    const [sending, setSending] = useState(false)
    const [formData, setFormData] = useState({
        phone: '',
        email: admin?.email,
        title: '',
        message: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title || !formData.message) {
            toast.error('Veuillez renseigner le titre et le message')
            return
        }

        setSending(true)
        try {
            await axios.post('/admin/support-email', formData)
            toast.success('Votre message a été envoyé au support')
            setFormData((prev) => ({ ...prev, title: '', message: '' }))
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Impossible d’envoyer le message au support')
        } finally {
            setSending(false)
        }
    }

    return (
        <>
            <BreadCrumb title={'Support & Feedback'} icon={<FontAwesomeIcon icon={faHeadset} />} />

            <div className="row justify-content-center">
                <div className="col-xl-8 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="mb-2">Contacter le support</h4>
                            <p className="text-muted mb-4">
                                Envoyez un ticket ou un retour à l’équipe support.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Numéro Tel</label>
                                        <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Titre</label>
                                        <input type="text" className="form-control" name="title" placeholder="Ex: Problème de connexion ou demande d’assistance" value={formData.title} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Message</label>
                                        <textarea className="form-control" rows="6" name="message" placeholder="Décrivez votre problème, votre question ou votre retour..." value={formData.message} onChange={handleChange}></textarea>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={sending}>
                                    <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                    {sending ? 'Envoi...' : 'Envoyer au support'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Support
