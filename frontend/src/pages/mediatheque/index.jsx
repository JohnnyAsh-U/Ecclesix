import React, { useMemo, useState, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTh, faThList, faDownload, faEye, faTrash, faPlus, faFile, faTimesCircle, faBuilding, faShareAlt, faPlay } from '@fortawesome/free-solid-svg-icons'
import api from '../../utils/config/axiosConfig'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppGlobalContext } from '../../hooks/AppContext'
import BreadCrumb from '../../components/breadcrumbs/breadcrumb'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import { NavLink } from 'react-router-dom'
import Search from '../../components/Inputbox/Search'
import { FormSelect } from '../../components/Inputbox/form-select'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { MyPlayer } from '../../components/videoplayer'


const sizeToBytes = (s = '') => {
  const parts = String(s).trim().split(' ')
  if (parts.length !== 2) return 0
  const n = parseFloat(parts[0].replace(',', '.')) || 0
  const unit = parts[1].toUpperCase()
  if (unit.startsWith('GB')) return n * 1024 * 1024 * 1024
  if (unit.startsWith('MB')) return n * 1024 * 1024
  if (unit.startsWith('KB')) return n * 1024
  return n
}


export default function Mediatheque() {
  const { admin, permissions, eglises } = AppGlobalContext()

  const [loading, setLoading] = useState(false)
  const isSuper = permissions && permissions.superAdmin

  const defaultChurch = admin && admin.church_id

  const [selectedChurch, setSelectedChurch] = useState(defaultChurch)
  const [typeFilter, setTypeFilter] = useState('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
  const [grid, setGrid] = useState(true)

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState({ total: 0, videos: 0, audios: 0, photos: 0, documents: 0, total_size: 0 })

  const bytesToSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes + 1) / Math.log(1024))
    const val = (bytes / Math.pow(1024, i))
    return `${val.toFixed(1)} ${sizes[i] || 'B'}`
  }

  const filtered = items
  const visibleCount = totalCount || filtered.length

  const totalPages = Math.max(1, Math.ceil((totalCount || filtered.length) / pageSize))
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalCount || filtered.length)

  const goToPage = (p) => {
    if (p < 1) p = 1
    if (p > totalPages) p = totalPages
    setPage(p)
  }

  const [videoPlayer, setVideoPlayer] = useState({ open: false, src: '', title: '', objectUrl: null })
  const [confirmDelete, setConfirmDelete] = useState({ open: false, item: null })
  const [addModal, setAddModal] = useState({ open: false, file: null, title: '', uploading: false, progress: 0 })

  const onPreview = (item) => {
    if (item.media_type === 'video') {
      // play via modal player
      const src = item.file
      setVideoPlayer({ open: true, src, title: item.name, objectUrl: null })
      return
    }
    if (item.media_type === 'photo') {
      // handled by PhotoView click
      return
    }
    // audio: play in modal player; documents: download/open
    if (item.media_type === 'audio') {
      const src = item.file
      setVideoPlayer({ open: true, src, title: item.name, objectUrl: null })
      return
    }
    window.open(`/multimedia/${item.id}/download`, '_blank')
  }

  const onDownload = async (item) => {
   try {
         // Local file: use object URL
         const { data } = await api.get(`/multimedia/${item.id}/download`, { responseType: 'blob' })
         const link = URL.createObjectURL(data)
         const a = document.createElement('a')
         a.href = link
         a.download = item.file_name || `file-${item.id}`
         document.body.appendChild(a)
         a.click()
         a.remove()
       } catch (err) {
         console.error(err)
         alert('Impossible de télécharger le fichier.')
       }
  }

  // removed simple alert; deletion uses confirm modal below

  const [shareModal, setShareModal] = useState({ open: false, link: '' })

  const handleCardClick = async (item) => {
    if (item.media_type === 'video') return onPreview(item)
    if (item.media_type === 'image') return // PhotoView handles image click
    if (item.media_type === 'audio') return onPreview(item)
    if (item.media_type === 'document') {
      const { data: blob } = await api.get(`/multimedia/${item.id}/download`, { responseType: 'blob' })
      const objectUrl = URL.createObjectURL(blob)
      window.open(objectUrl, '_blank')
      // revoke after a delay to allow the new tab to load
      setTimeout(() => { try { URL.revokeObjectURL(objectUrl) } catch (e) { } }, 5000)
      return
    }
    // documents: download/open
  }

  const deleteItem = async (item) => {
    if (!item || !item.id) return alert('Impossible de supprimer: id manquant')
    setConfirmDelete({ open: true, item })
  }

  const performDelete = async (item) => {
    if (!item || !item.id) return
    try {
      await api.delete(`/multimedia/${item.id}`)
      setConfirmDelete({ open: false, item: null })
      fetchData()
      toast.success('Fichier supprimé')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression')
    }
  }

  const shareItem = async (item) => {
    if (!item.id) return alert('Impossible de partager: id manquant')
    try {
      const { data } = await api.get(`/multimedia/${item.id}/share`)
      setShareModal({ open: true, link: data.url || '' })
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la récupération du lien de partage')
    }
  }

  const handleFileChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setAddModal(prev => ({ ...prev, file: files }))
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!addModal.file || addModal.file.length === 0) return alert('Veuillez sélectionner au moins un fichier.')
    try {
      setAddModal(prev => ({ ...prev, uploading: true, progress: 0 }))
      let successCount = 0

      for (let i = 0; i < addModal.file.length; i++) {
        const file = addModal.file[i]
        
        try {
          // Step 1: Request presigned URL from backend
          const createFormData = new FormData()
          createFormData.append('filename', file.name)
          createFormData.append('filesize', file.size)
          createFormData.append('mimetype', file.type)
          if (isSuper && selectedChurch) createFormData.append('church_id', selectedChurch)
          if (addModal.title) createFormData.append('title', addModal.title)
          if (isSuper && selectedChurch) createFormData.append('church', selectedChurch)

          const { data: uploadData } = await api.post('/multimedia/create', createFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })

          const { upload_url, upload_id } = uploadData

          // Step 2: Upload file directly to S3 with progress tracking
          await axios.put(upload_url, file, {
            headers: {
              'Content-Type': file.type || 'application/octet-stream'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              const overallProgress = Math.round(((i * 100 + percentCompleted) / addModal.file.length))
              setAddModal(prev => ({ ...prev, progress: overallProgress }))
            }
          })

          // Step 3: Notify backend that upload is complete
          await api.post(`/multimedia/${upload_id}/complete`, {})
          
          successCount++
        } catch (fileErr) {
          console.error(`Error uploading ${file.name}:`, fileErr.response)
          toast.error(`Erreur lors de l'upload de ${file.name}`)
        }

        // Update progress for completed files
        const overallProgress = Math.round(((i + 1) * 100) / addModal.file.length)
        setAddModal(prev => ({ ...prev, progress: overallProgress }))
      }

      if (successCount === addModal.file.length) {
        toast.success(`${successCount} fichier(s) ajouté(s)`)
      } else if (successCount > 0) {
        toast.info(`${successCount}/${addModal.file.length} fichier(s) ajouté(s)`)
      }

      setAddModal({ open: false, file: null, title: '', uploading: false, progress: 0 })
      fetchData()
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l\'initialisation de l\'upload')
      setAddModal(prev => ({ ...prev, uploading: false, progress: 0 }))
    }
  }

  // Fetch from API when filters change
  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        page_size: pageSize,
      }
      if (q) params.q = q
      if (typeFilter && typeFilter !== 'all') {
        const m = { video: 'video', audio: 'audio', photo: 'image', doc: 'document' }[typeFilter]
        if (m) params.type = m
      }
      if (sort) {
        const smap = { name: 'a-z', largest: 'size', newest: 'newest', oldest: 'oldest' }
        params.sort = smap[sort] || sort
      }
      if (isSuper && selectedChurch) params.church = selectedChurch

      const { data } = await api.get('/multimedia/all', { params })
      // drf pagination returns {count, next, previous, results}
      const results = data.results || data
      setTotalCount(data.count || results.length)
      setItems(results)
      if (data.stats) setStats(data.stats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch, typeFilter, q, sort, page, pageSize])

  return (
    <div >
      <BreadCrumb icon={<FontAwesomeIcon icon={faFile} />} title={"Médiathèque"} >
        <>
          <ContentPermsWrapper requiredPerms={['ajouter_mediafile']}>
            <button className="btn btn-primary btn-round btn-sm" onClick={() => setAddModal({ open: true, file: null, title: '', uploading: false, progress: 0 })}><FontAwesomeIcon icon={faPlus} />&nbsp; Ajouter un fichier</button>
          </ContentPermsWrapper>
        </>
      </BreadCrumb>


      {/* Stats row */}
      <div className="row g-3">
        <div className="col-6 col-md-2">
          <div className="card p-3">
            <div className="small text-muted">Fichiers totaux</div>
            <div className="h4">{stats.total}</div>
            <div className="progress" style={{ height: 6 }}><div className="progress-bar" style={{ width: `${stats.total ? Math.round((stats.total || 0) ? 30 : 0) : 30}%` }} /></div>
          </div>
          {videoPlayer.open && (
            <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.7)' }}>
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{videoPlayer.title || 'Lecture vidéo'}</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => { if (videoPlayer.objectUrl) URL.revokeObjectURL(videoPlayer.objectUrl); setVideoPlayer({ open: false, src: '', title: '', objectUrl: null }) }} />
                  </div>
                  <div className="modal-body p-0">
                    <div style={{ width: '100%' }}>
                      <MyPlayer src={videoPlayer.src} autoPlay controls />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => { if (videoPlayer.objectUrl) URL.revokeObjectURL(videoPlayer.objectUrl); setVideoPlayer({ open: false, src: '', title: '', objectUrl: null }) }}>Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {shareModal.open && (
            <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Partager le lien</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setShareModal({ open: false, link: '' })} />
                  </div>
                  <div className="modal-body">
                    <div className="input-group">
                      <input className="form-control" readOnly value={shareModal.link} />
                      <button className="btn btn-outline-secondary" onClick={async () => { try { await navigator.clipboard.writeText(shareModal.link); } catch (e) { console.error(e) } }}><FontAwesomeIcon icon={faShareAlt} /></button>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShareModal({ open: false, link: '' })}>Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {addModal.open && (
            <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog" role="document">
                <form className="modal-content" onSubmit={handleAddSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Ajouter un fichier</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setAddModal({ open: false, file: null, title: '', uploading: false, progress: 0 })} />
                  </div>
                  <div className="modal-body">
                    <div className="mb-2">
                      <label className="form-label">Titre (optionnel)</label>
                      <input className="form-control" value={addModal.title} onChange={e => setAddModal(prev => ({ ...prev, title: e.target.value }))} />
                    </div>
                    {isSuper && (
                      <div className="mb-2">
                        <label className="form-label">Église</label>
                        <FormSelect value={selectedChurch} onChange={e => setSelectedChurch(e.target.value)} name="eglise_upload">
                          <option value="">Sélectionner une église</option>
                          {eglises.map(c => <option key={c.id} value={c.id}>{c.church_name}</option>)}
                        </FormSelect>
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="form-label">Fichier</label>
                      <input type="file" className="form-control" onChange={handleFileChange} accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple disabled={addModal.uploading} />
                      {addModal.file && addModal.file.length > 0 && (
                        <div className="small text-muted mt-1">Sélectionné: {addModal.file.length} fichier(s){addModal.file.length <= 5 ? (': ' + addModal.file.map(f => f.name).join(', ')) : ''}</div>
                      )}
                    </div>
                    {addModal.uploading && (
                      <div className="mb-2">
                        <div className="small text-muted mb-1">Progression: {addModal.progress}%</div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div className="progress-bar" style={{ width: `${addModal.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setAddModal({ open: false, file: null, title: '', uploading: false, progress: 0 })} disabled={addModal.uploading}>Annuler</button>
                    <button type="submit" className="btn btn-primary" disabled={addModal.uploading}>{addModal.uploading ? `Téléversement... ${addModal.progress}%` : 'Ajouter'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {confirmDelete.open && (
            <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirmer la suppression</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setConfirmDelete({ open: false, item: null })} />
                  </div>
                  <div className="modal-body">
                    <p>Voulez-vous vraiment supprimer ce fichier ? Cette action est irréversible.</p>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setConfirmDelete({ open: false, item: null })}>Annuler</button>
                    <button className="btn btn-danger" onClick={() => performDelete(confirmDelete.item)}>Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-2">
          <div className="card p-3">
            <div className="small text-muted">Vidéos</div>
            <div className="h4">{stats.videos}</div>
            <div className="progress" style={{ height: 6 }}><div className="progress-bar bg-danger" style={{ width: `${stats.total ? Math.round((stats.videos / stats.total) * 100) : 60}%` }} /></div>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card p-3">
            <div className="small text-muted">Enregistrements audio</div>
            <div className="h4">{stats.audios}</div>
            <div className="progress" style={{ height: 6 }}><div className="progress-bar bg-info" style={{ width: `${stats.total ? Math.round((stats.audio / stats.total) * 100) : 45}%` }} /></div>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card p-3">
            <div className="small text-muted">Photos</div>
            <div className="h4">{stats.photos}</div>
            <div className="progress" style={{ height: 6 }}><div className="progress-bar bg-warning" style={{ width: `${stats.total ? Math.round((stats.photos / stats.total) * 100) : 25}%` }} /></div>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card p-3">
            <div className="small text-muted">Documents</div>
            <div className="h4">{stats.documents}</div>
            <div className="progress" style={{ height: 6 }}><div className="progress-bar bg-secondary" style={{ width: `${stats.total ? Math.round((stats.documents / stats.total) * 100) : 15}%` }} /></div>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card p-3">
            <div className="small text-muted">Taille totale</div>
            <div className="h4">{bytesToSize(stats.total_size || 0)}</div>
            <div className="progress" style={{ height: 6 }}><div className="progress-bar bg-primary" style={{ width: `100%` }} /></div>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="card mb-3 pb-2">
        {/* <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="icofont icofont-filter m-r-5"></i>Filtrer les fichiers
          </h5>
        </div> */}

        <div className="card-body pb-1">
          <div className="row align-items-center">
            <div className="col-xl-4 col-md-6 mt-3">
              <Search
                name="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par nom de fichier"
              />
            </div>

            <div className="col-xl-2 col-md-6">
              <FormSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)} name="type">
                <option value="all">Tous</option>
                <option value="video">Vidéos</option>
                <option value="audio">Audio</option>
                <option value="photo">Photos</option>
                <option value="doc">Documents</option>
              </FormSelect>
            </div>

            <div className="col-xl-2 col-md-6">
              <FormSelect value={sort} onChange={e => setSort(e.target.value)} name="sort">
                <option value="newest">Les plus récents</option>
                <option value="oldest">Les plus anciens</option>
                <option value="name">Nom A–Z</option>
                <option value="largest">Plus volumineux</option>
              </FormSelect>
            </div>

            {isSuper && (
              <div className="col-xl-3 col-md-6">
                <FormSelect value={selectedChurch} onChange={e => setSelectedChurch(e.target.value)} name="eglise">
                  <option value="">Toutes les églises</option>
                  {eglises.map(c => <option key={c.id} value={c.id}>{c.church_name}</option>)}
                </FormSelect>
              </div>
            )}

            <div className="col-xl-1 col-md-6 ms-auto d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setQ(''); setTypeFilter('all'); setSort('newest'); setSelectedChurch(defaultChurch); setGrid(true); }} title="Réinitialiser les filtres"><FontAwesomeIcon icon={faTimesCircle} /></button>
            </div>
          </div>


        </div>
      </div>

      {/* (section label moved into filter card) */}

      {/* Media grid or empty state */}
      <div className="card border-0 shadow-sm">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            {(eglises.find(c => c.id === selectedChurch)?.church_name || 'Toutes les églises')} &nbsp;— &nbsp; {visibleCount} {visibleCount > 1 ? 'fichiers' : 'fichier'}
          </h5>

        </div>

        <div className="card-body" style={{ minHeight: '360px' }}>
          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          )}
          {!loading && visibleCount === 0 ? (
            <div className="p-5 text-center">Aucun média trouvé pour ces filtres.</div>
          ) : (
            <div className="row g-3">
              <PhotoProvider>
                {filtered.map(item => (
                  <div key={item.id} className="col-6 col-md-3">
                    <div className="card h-100">
                      <div className="card-body d-flex flex-column">
                        <div style={{ cursor: 'pointer' }} onClick={() => handleCardClick(item)}>
                          {item.media_type === 'image' ? (
                            <PhotoView src={item.file}>
                              <img src={item.file} alt={item.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8, cursor: 'pointer' }} />
                            </PhotoView>
                          ) : (
                            <div style={{ height: 120, borderRadius: 6, background: (item.media_type === 'video' || item.media_type === 'audio') ? '#000' : '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, cursor: 'pointer' }}>
                              <FontAwesomeIcon icon={(item.media_type === 'video' || item.media_type === 'audio') ? faPlay : faFile} style={{ fontSize: 28, color: (item.media_type === 'video' || item.media_type === 'audio') ? '#fff' : '#333' }} />
                            </div>
                          )}
                        </div>

                        <div className="mt-2 d-flex flex-column" style={{ minHeight: 72 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.title}>{item.title || item.file_name}</div>
                            <div className="small text-muted">{item.file_name ? item.file_name.split('.').pop().toUpperCase() : ''} · {item.file_size ? bytesToSize(item.file_size) : ''}</div>
                            <div className="small mt-1"><span className="badge" style={{ background: '#f0f0f0', color: '#333' }}>{item.church_name}</span></div>
                          </div>

                          <div className="mt-2 d-flex gap-2 justify-content-end flex-nowrap" style={{ minWidth: 0 }}>
                            <button
                              className="btn btn-sm btn-light p-1"
                              style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Télécharger"
                              aria-label="Télécharger"
                              onClick={(e) => { e.stopPropagation(); onDownload(item) }}
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>

                            <button
                              className="btn btn-sm btn-light text-danger p-1"
                              style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Supprimer"
                              aria-label="Supprimer"
                              onClick={(e) => { e.stopPropagation(); deleteItem(item) }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>

                            <button
                              className="btn btn-sm btn-light p-1"
                              style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Partager"
                              aria-label="Partager"
                              onClick={(e) => { e.stopPropagation(); shareItem(item) }}
                            >
                              <FontAwesomeIcon icon={faShareAlt} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </PhotoProvider>
            </div>
          )}
        </div>
        {/* Pagination controls */}
        <div className="card-footer d-flex align-items-center justify-content-between">
          <div className="small text-muted">Affichage {rangeStart}-{rangeEnd} sur {totalCount || filtered.length}</div>

          <div className="d-flex align-items-center gap-2">
            {/* <div className="input-group input-group-sm me-2">
              <label className="input-group-text">Par page</label>
              <select className="form-select form-select-sm" value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div> */}

            <nav aria-label="pagination">
              <ul className="pagination pagination-sm mb-0 d-flex align-items-center gap-2 flex-nowrap">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => goToPage(page - 1)}>Préc</button></li>
                <li className="page-item disabled"><span className="page-link" style={{ whiteSpace: 'nowrap' }}>{page} / {totalPages}</span></li>
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => goToPage(page + 1)}>Suiv</button></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

    </div>
  )
}