import React, { useRef, useState } from 'react'
import axios from '../../utils/config/axiosConfig'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faUpload, faDatabase } from '@fortawesome/free-solid-svg-icons'

const DatabaseBackup = () => {
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleDownloadBackup = async () => {
    setBackupLoading(true)
    try {
      const response = await axios.get('/admin/database/backup', {
        responseType: 'blob',
      })

      // Create blob download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Extract filename from content-disposition header or create one
      const contentDisposition = response.headers['content-disposition']
      let filename = 'database_backup.sql'
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch) {
          filename = fileNameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Sauvegarde des données téléchargée avec succès')
    } catch (error) {
      console.error('Backup error:', error.response)
      toast.error(error?.response?.data?.detail || 'Impossible de télécharger la sauvegarde')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.sql')) {
      toast.warning('Veuillez sélectionner un fichier SQL')
      return
    }

    handleRestoreDatabase(file)
  }

  const handleRestoreDatabase = async (file) => {
    setRestoreLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      await axios.post('/admin/database/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Données restaurées avec succès')
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Restore error:', error)
      toast.error(error?.response?.data?.detail || 'Impossible de restaurer la base de données')
    } finally {
      setRestoreLoading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="card mb-0" style={{ minHeight: '73vh' }}>
      <div className="card-header">
        <h5 className="card-header-left">
          <FontAwesomeIcon icon={faDatabase} className="me-2" />
          Sauvegarde et Restauration de la Base de Données
        </h5>
      </div>

      <div className="card-body">
        <div className="row">
          {/* Backup Section */}
          <div className="col-md-6 mb-4">
            <div className="border rounded p-4" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="mb-3 d-flex align-items-center">
                <FontAwesomeIcon icon={faDownload} className="me-2 text-primary" />
                Sauvegarder les Données
              </h6>
              <p className="text-muted small mb-4">
                Téléchargez une sauvegarde des données de votre base de données au format SQL (INSERT statements uniquement, sans schéma).
              </p>
              <button
                onClick={handleDownloadBackup}
                disabled={backupLoading}
                className="btn btn-primary w-100"
              >
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                {backupLoading ? 'Téléchargement...' : 'Télécharger la Sauvegarde'}
              </button>
            </div>
          </div>

          {/* Restore Section */}
          <div className="col-md-6 mb-4">
            <div className="border rounded p-4" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="mb-3 d-flex align-items-center">
                <FontAwesomeIcon icon={faUpload} className="me-2 text-success" />
                Restaurer les Données
              </h6>
              <p className="text-muted small mb-4">
                Téléchargez un fichier SQL pour restaurer les données dans votre base de données (le schéma doit déjà exister).
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                onClick={triggerFileInput}
                disabled={restoreLoading}
                className="btn btn-success w-100"
              >
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                {restoreLoading ? 'Restauration...' : 'Restaurer à partir d\'un fichier'}
              </button>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="alert alert-warning mt-4" role="alert">
          <strong>⚠️ Attention :</strong>
          <ul className="mb-0 mt-2">
            <li>Les sauvegardes contiennent <strong>uniquement les données (INSERT statements)</strong>, pas le schéma.</li>
            <li>Assurez-vous que le fichier SQL provient d'une source fiable avant de le restaurer.</li>
            <li>La restauration <strong>ajoutera les données</strong> au schéma existant (ne le remplace pas).</li>
            <li>Le schéma de votre base de données doit déjà exister avant la restauration.</li>
            <li>Seuls les administrateurs super peuvent accéder à ces fonctionnalités.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DatabaseBackup
