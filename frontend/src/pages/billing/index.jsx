import React, { useMemo, useState } from 'react'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { AppGlobalContext } from '../../hooks/AppContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faFileInvoiceDollar, faUpload, faWallet } from '@fortawesome/free-solid-svg-icons'
import { LoadingPage } from '../../components/Loading/loading'
import useFetch from '../../hooks/fetchHook'
import axios from '../../utils/config/axiosConfig'
import { toast } from 'react-toastify'

const fallbackFeatures = [
  'Utilisateurs illimités',
  'Multi-églises',
  'Rapports avancés',
  'Support prioritaire',
]

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR')
}

const Abonnement = () => {
  const { admin } = AppGlobalContext()
  const { data, loading, error, reload } = useFetch('/tenant/billing', 'get')
  const [logoFile, setLogoFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const billing = data || {}
  const plan = billing.plan

  const payments = billing.payment_history || []
  const tenant = billing.tenant || {}
  const providerInfo = billing.provider_info || {}

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error('Veuillez sélectionner un logo')
      return
    }

    const formData = new FormData()
    formData.append('logo', logoFile)
    setUploading(true)

    try {
      await axios.patch('/tenant/branding', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Logo mis à jour avec succès')
      setLogoFile(null)
      reload()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Impossible de mettre à jour le logo')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    toast.error('Impossible de charger les données de facturation')
    return null
  }

  return (
    <>
      <BreadCrumb title={'Abonnement'} icon={<FontAwesomeIcon icon={faCreditCard} />} />

      <div className="row">
        <div className="col-xl-8 col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <h4 className="mb-1">Plan {plan?.code}</h4>
                  <p className="text-muted mb-2">{plan?.name}</p>
                  <h2 className="mb-0">{Number(plan?.price).toLocaleString('fr-FR')} {plan?.currency}<span className="fs-6 text-muted"> / Mois</span></h2>
                </div>
                <span className={`badge ${tenant.is_active ? 'bg-success' : 'bg-danger'}`}>{tenant.is_active ? 'Actif' : 'Inactif'}</span>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-6">
                  <p><strong>Responsable :</strong> {admin?.username || 'Super Admin'}</p>
                  <p><strong>Eglise :</strong> {tenant.church_name || '-'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Domaine :</strong> {tenant.domain || '-'}</p>
                  <p><strong>Tenant ID :</strong> {tenant.tenant_id || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                Historique des paiements
              </h5>

              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Facture</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Méthode</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length ? payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.invoice_number}</td>
                        <td>{formatDate(payment.paid_at || payment.created_at)}</td>
                        <td>{Number(payment.amount).toLocaleString('fr-FR')} {payment.currency} </td>
                        <td>{payment.payment_method || '-'}</td>
                        <td><span className={`badge ${payment.status === 'paid' ? 'bg-success' : 'bg-warning'}`}>{payment.status}</span></td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">Aucun paiement enregistré</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

         

        <div className="col-xl-4 col-md-12">
              <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Contact du fournisseur SaaS</h5>
              <p className="mb-1"><strong>Entreprise :</strong> {providerInfo?.provider_name}</p>
              <p className="mb-1"><strong>Email :</strong> {providerInfo?.provider_email }</p>
              <p className="mb-1"><strong>Téléphone :</strong> {providerInfo?.provider_phone}</p>
              <p className="mb-1"><strong>Adresse :</strong> {providerInfo?.provider_address }</p>
              <p className="mb-0 text-muted">Pour toute question liée à l’abonnement ou aux paiements.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Logo de l'église</h5>
              {tenant.custom_logo && tenant.logo_url ? (
                <img src={tenant.logo_url} alt="Church logo" className="img-fluid rounded mb-3 border" style={{ maxHeight: '160px', objectFit: 'contain' }} />
              ) : (
                <p className="text-muted">Aucun logo personnalisé activé pour le moment.</p>
              )}
              <input type="file" className="form-control mb-3" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              <button type="button" className="btn btn-primary btn-sm" disabled={uploading} onClick={handleLogoUpload}>
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                {uploading ? 'Envoi...' : 'Téléverser le logo'}
              </button>
            </div>
          </div>

        
        </div>
      </div>
    </>
  )
}

export default Abonnement
