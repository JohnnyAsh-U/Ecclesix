import React, { useEffect, useState } from 'react'
import axios from '../../utils/config/axiosConfig'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPaperPlane, faSave } from '@fortawesome/free-solid-svg-icons'

const defaultConfig = {
  smtp_host: '',
  smtp_port: '587',
  smtp_username: '',
  smtp_password: '',
}

const EmailConfig = () => {
  const [formData, setFormData] = useState(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    axios.get('/admin/email-config')
      .then(({ data }) => {
        setFormData({ ...defaultConfig, ...(data || {}) })
      })
      .catch(() => {
        toast.error('Impossible de charger la configuration email')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await axios.patch('/admin/email-config', formData)
      toast.success('Configuration email enregistrée avec succès')
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Impossible d’enregistrer la configuration email')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setTesting(true)
    try {
      await axios.post('/admin/email-config/test', formData)
      toast.success('Email de test envoyé avec succès')
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Impossible d’envoyer l’email de test')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="card mb-0" style={{ minHeight: '73vh' }}>
      <div className="card-header">
        <h5 className="card-header-left">
          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
          Configuration Email
        </h5>
      </div>

      <div className="card-body">
        {loading ? (
          <p className="text-muted mb-0">Chargement de la configuration...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">SMTP Host</label>
                <input className="form-control" name="smtp_host" placeholder="smtp.gmail.com" value={formData.smtp_host} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Port</label>
                <input className="form-control" name="smtp_port" value={formData.smtp_port} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Username (email)</label>
                <input className="form-control" type="email" name="smtp_username" value={formData.smtp_username} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" name="smtp_password" value={formData.smtp_password} onChange={handleChange} />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <small className="text-muted">
                Cette configuration sera utilisée pour envoyer les emails système et les messages du support.
              </small>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-primary" disabled={testing} onClick={handleTestEmail}>
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  {testing ? 'Envoi test...' : 'Envoyer test'}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EmailConfig
