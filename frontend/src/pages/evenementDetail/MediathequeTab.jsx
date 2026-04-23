import React, { useRef, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faFileAlt, faTimes, faFile, faPlus, faEllipsisV, faDownload, faShareAlt, faPlay } from '@fortawesome/free-solid-svg-icons'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { ContentPermsWrapper } from '../../utils/permissions/permwrapper'
import axios from 'axios'
import { MyPlayer } from '../../components/videoplayer'
import { Thumbnail } from '@videojs/react'

const MAX_FILE = 500 * 1024 * 1024 // 500MB
const MAX_PHOTO = 20 * 1024 * 1024 // 20MB
const MAX_DOC = 50 * 1024 * 1024 // 50MB

const withinThreeDays = (eventDate) => {
  if (!eventDate) return false
  const ev = new Date(eventDate)
  ev.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.abs(ev.getTime() - today.getTime())
  return diff <= 3 * 24 * 60 * 60 * 1000
}


const getMode = (eventDate) => {
  if (!eventDate) return 'today'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  if (d < today) return 'past'
  if (d.getTime() === today.getTime()) return 'today'
  return 'future'
}


const bytesToSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const extMatches = (name, exts) => {
  const lower = name.toLowerCase()
  return exts.some(e => lower.endsWith(e))
}

const MediathequeTab = ({ event }) => {
  const [videoFiles, setVideoFiles] = useState([])
  const [audioFiles, setAudioFiles] = useState([])
  const [photoFiles, setPhotoFiles] = useState([])
  const [docFiles, setDocFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [tempVideoFiles, setTempVideoFiles] = useState([])
  const [tempAudioFiles, setTempAudioFiles] = useState([])
  const [tempPhotoFiles, setTempPhotoFiles] = useState([])
  const [tempDocFiles, setTempDocFiles] = useState([])
  const [tempPhotoPreviews, setTempPhotoPreviews] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [menuOpen, setMenuOpen] = useState({ zone: null, idx: null })
  const [confirmDelete, setConfirmDelete] = useState({ open: false, zone: null, idx: null })
  const [shareModal, setShareModal] = useState({ open: false, link: '' })
  const [videoPlayer, setVideoPlayer] = useState({ open: false, src: '', title: '', objectUrl: null })

  const canAdd = withinThreeDays(event.event_date) && (getMode(event.event_date) === 'past' || getMode(event.event_date) === 'today')

  const inRef = useRef({})

  // Load files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/multimedia/events/${event.id}`)
        const files = res.data.results || []
        const videos = files.filter(f => f.media_type === 'video')
        const audios = files.filter(f => f.media_type === 'audio')
        const photos = files.filter(f => f.media_type === 'image')
        const docs = files.filter(f => f.media_type === 'document')
        setVideoFiles(videos)
        setAudioFiles(audios)
        setPhotoFiles(photos)
        setDocFiles(docs)
      } catch (err) {
        console.error('Failed to load media files:', err)
      }
      finally {
        setLoading(false)
      }
    }
    if (event && event.id) loadFiles()
  }, [event])

  const validateAndAdd = (zone, files) => {
    const fArr = Array.from(files || [])
    if (zone === 'videos') {
      const accepted = ['.mp4', '.webm', '.mov', '.mkv']
      const good = fArr.filter(f => extMatches(f.name, accepted) && f.size <= MAX_FILE)
      if (good.length < fArr.length) alert('Fichiers vidéo non valides ignorés (format ou taille > 500MB).')
      const wrapped = good.map(f => ({ file: f, title: '', uid: `${Date.now()}-${Math.random().toString(36).slice(2,9)}` }))
      if (showModal) setTempVideoFiles(prev => [...prev, ...wrapped])
      else setVideoFiles(prev => [...prev, ...wrapped])
    }
    if (zone === 'audios') {
      const accepted = ['.mp3', '.wav', '.aac', '.m4a']
      const good = fArr.filter(f => extMatches(f.name, accepted) && f.size <= MAX_FILE)
      if (good.length < fArr.length) alert('Fichiers audio non valides ignorés (format ou taille > 500MB).')
      const wrapped = good.map(f => ({ file: f, title: '', uid: `${Date.now()}-${Math.random().toString(36).slice(2,9)}` }))
      if (showModal) setTempAudioFiles(prev => [...prev, ...wrapped])
      else setAudioFiles(prev => [...prev, ...wrapped])
    }
    if (zone === 'photos') {
      const accepted = ['.jpg', '.jpeg', '.png', '.webp']
      const good = fArr.filter(f => extMatches(f.name, accepted) && f.size <= MAX_PHOTO)
      if (good.length < fArr.length) alert('Certaines photos ont été ignorées (format non supporté ou > 20MB).')
      const wrapped = good.map(f => ({ file: f, title: '', uid: `${Date.now()}-${Math.random().toString(36).slice(2,9)}` }))
      if (showModal) {
        setTempPhotoFiles(prev => [...prev, ...wrapped])
        const newPreviews = good.map(f => URL.createObjectURL(f))
        setTempPhotoPreviews(prev => [...prev, ...newPreviews])
      } else setPhotoFiles(prev => [...prev, ...wrapped])
    }
    if (zone === 'docs') {
      const accepted = ['.pdf', '.docx']
      const good = fArr.filter(f => extMatches(f.name, accepted) && f.size <= MAX_DOC)
      if (good.length < fArr.length) alert('Documents ignorés (format non supporté ou > 50MB).')
      const wrapped = good.map(f => ({ file: f, title: '', uid: `${Date.now()}-${Math.random().toString(36).slice(2,9)}` }))
      if (showModal) setTempDocFiles(prev => [...prev, ...wrapped])
      else setDocFiles(prev => [...prev, ...wrapped])
    }
  }

  const handleInput = (zone, e) => {
    validateAndAdd(zone, e.target.files)
    e.target.value = null
  }

  const handleDrop = (zone, e) => {
    e.preventDefault()
    validateAndAdd(zone, e.dataTransfer.files)
  }

  const removeFile = async (zone, idxOrUid) => {
    if (showModal) {
      // support either numeric index or uid string for temp lists
      if (zone === 'videos') {
        if (typeof idxOrUid === 'string') setTempVideoFiles(prev => prev.filter(p => p.uid !== idxOrUid))
        else setTempVideoFiles(prev => prev.filter((_, i) => i !== idxOrUid))
      }
      if (zone === 'audios') {
        if (typeof idxOrUid === 'string') setTempAudioFiles(prev => prev.filter(p => p.uid !== idxOrUid))
        else setTempAudioFiles(prev => prev.filter((_, i) => i !== idxOrUid))
      }
      if (zone === 'photos') {
        if (typeof idxOrUid === 'string') {
          const uid = idxOrUid
          const idx = tempPhotoFiles.findIndex(p => p.uid === uid)
          if (idx !== -1 && tempPhotoPreviews[idx]) URL.revokeObjectURL(tempPhotoPreviews[idx])
          setTempPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
          setTempPhotoFiles(prev => prev.filter(p => p.uid !== uid))
        } else {
          if (tempPhotoPreviews[idxOrUid]) URL.revokeObjectURL(tempPhotoPreviews[idxOrUid])
          setTempPhotoPreviews(prev => prev.filter((_, i) => i !== idxOrUid))
          setTempPhotoFiles(prev => prev.filter((_, i) => i !== idxOrUid))
        }
      }
      if (zone === 'docs') {
        if (typeof idxOrUid === 'string') setTempDocFiles(prev => prev.filter(p => p.uid !== idxOrUid))
        else setTempDocFiles(prev => prev.filter((_, i) => i !== idxOrUid))
      }
    } else {
      // Delete from server
      const fileList = zone === 'videos' ? videoFiles : zone === 'audios' ? audioFiles : zone === 'photos' ? photoFiles : docFiles
      const fileToDelete = fileList[idx]
      if (fileToDelete && fileToDelete.id) {
        try {
          await axios.delete(`/multimedia/${fileToDelete.id}`)
          if (zone === 'videos') setVideoFiles(prev => prev.filter((_, i) => i !== idx))
          if (zone === 'audios') setAudioFiles(prev => prev.filter((_, i) => i !== idx))
          if (zone === 'photos') setPhotoFiles(prev => prev.filter((_, i) => i !== idx))
          if (zone === 'docs') setDocFiles(prev => prev.filter((_, i) => i !== idx))
        } catch (err) {
          console.error('Failed to delete file:', err)
          alert('Erreur lors de la suppression.')
        }
      }
    }
  }

  // revoke previews when modal closes or component unmounts
  useEffect(() => {
    if (!showModal && tempPhotoPreviews.length) {
      tempPhotoPreviews.forEach(p => URL.revokeObjectURL(p))
      setTempPhotoPreviews([])
      setTempPhotoFiles([])
    }
    return () => {
      tempPhotoPreviews.forEach(p => URL.revokeObjectURL(p))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal])

  const getFileLink = (o) => {
    if (!o) return ''
    if (o.url) return o.url
    if (o.file && o.file instanceof File) return URL.createObjectURL(o.file)
    return ''
  }

  const downloadFile = async (o) => {
    try {
      if (o.id) {
        // Server file: use API endpoint
        window.location.href = `multimedia/${o.id}/download`
      } else {
        // Local file: use object URL
        const link = getFileLink(o)
        if (!link) return
        const a = document.createElement('a')
        a.href = link
        a.download = (o.title && o.title.length) ? o.title : (o.file ? o.file.name : '')
        document.body.appendChild(a)
        a.click()
        a.remove()
        if (o.file && o.file instanceof File) URL.revokeObjectURL(link)
      }
    } catch (err) {
      console.error(err)
      alert('Impossible de télécharger le fichier.')
    }
  }

  const openModal = () => {
    setTempVideoFiles([])
    setTempAudioFiles([])
    setTempPhotoFiles([])
    setTempDocFiles([])
    setTempPhotoPreviews([])
    setShowModal(true)
  }

  const handleModalSubmit = () => {
    // Upload files to backend, then merge into main lists on success
    const upload = async () => {
      setIsUploading(true)
      try {
        const fd = new FormData()
        tempVideoFiles.forEach((o, i) => fd.append('videos', o.file))
        tempAudioFiles.forEach((o, i) => fd.append('audios', o.file))
        tempPhotoFiles.forEach((o, i) => fd.append('photos', o.file))
        tempDocFiles.forEach((o, i) => fd.append('docs', o.file))
        // append titles as JSON
        const metas = []
        tempVideoFiles.forEach(o => metas.push({ zone: 'video', name: o.file.name, title: o.title }))
        tempAudioFiles.forEach(o => metas.push({ zone: 'audio', name: o.file.name, title: o.title }))
        tempPhotoFiles.forEach(o => metas.push({ zone: 'photo', name: o.file.name, title: o.title }))
        tempDocFiles.forEach(o => metas.push({ zone: 'doc', name: o.file.name, title: o.title }))
        fd.append('metadata', JSON.stringify(metas))

        const url = event && event.id ? `/multimedia/events/${event.id}` : '/multimedia/upload'
        const res = await axios.post(url, fd)

        // Merge server response (with id and url) into main lists
        const created = res.data.created || []
        setVideoFiles(prev => [...prev, ...created.filter(f => f.media_type === 'video')])
        setAudioFiles(prev => [...prev, ...created.filter(f => f.media_type === 'audio')])
        setPhotoFiles(prev => [...prev, ...created.filter(f => f.media_type === 'image')])
        setDocFiles(prev => [...prev, ...created.filter(f => f.media_type === 'document')])

        // cleanup previews and temp arrays
        tempPhotoPreviews.forEach(p => URL.revokeObjectURL(p))
        setTempPhotoPreviews([])
        setTempVideoFiles([])
        setTempAudioFiles([])
        setTempPhotoFiles([])
        setTempDocFiles([])
        setShowModal(false)
      } catch (err) {
        console.error(err)
        alert('Une erreur est survenue lors de l\'upload. Réessayez.')
      } finally {
        setIsUploading(false)
      }
    }

    upload()
  }

  const DropZone = ({ zone, title, hint, acceptLabel, onClickChoose, onDrop, children }) => (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="fw-semibold mb-2">{title}</h6>
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          style={{ border: '1px dashed #ced4da', padding: 14, borderRadius: 6, textAlign: 'center', cursor: 'pointer' }}
          onClick={onClickChoose}
        >
          <div className="text-muted small">{hint}</div>
          <div className="mt-2"><small className="text-muted">{acceptLabel}</small></div>
        </div>
        {children}
      </div>
    </div>
  )

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h5 className="mb-">
          <FontAwesomeIcon icon={faFile} className="me-2" />
          Médiathèque de l'Événement
        </h5>
        <div>
          {canAdd && <ContentPermsWrapper requiredPerms={["ajouter_mediafile"]}>
            <button className="btn btn-sm btn-outline-primary me-2" onClick={openModal} disabled={!canAdd}><FontAwesomeIcon icon={faPlus} /> Ajouter Fichier</button>
          </ContentPermsWrapper>}
        </div>
      </div>

      <div className="card-body" style={{ minHeight: '360px' }}>
        {loading && (
          <div className="text-center my-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        )}
       {!loading && (<>
        <div className="mb-4">
          <h6 className="fw-semibold">Vidéos</h6>
          <div className="row">
            {videoFiles.length === 0 && <div className="text-muted ms-2">Aucun fichier vidéo.</div>}
            {videoFiles.map((o, i) => (
              <div key={`${o.id || o.file.name}-${i}`} className="col-6 col-md-3 mb-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column position-relative">
                    <div style={{ cursor: 'pointer' }} onClick={() => {
                      let src = ''
                      let objectUrl = null
                      if (o.url) src = o.url
                      else if (o.file && o.file instanceof File) {
                        objectUrl = URL.createObjectURL(o.file)
                        src = objectUrl
                      } else if (o.file && o.file.url) src = o.file.url
                      setVideoPlayer({ open: true, src, title: o.title || o.file_name || o.file?.name, objectUrl })
                    }}>
                      <Thumbnail time={12} />
                      <div style={{ width: '100%', height: 120, background: '#000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faPlay} style={{ color: '#fff', fontSize: 28 }} />
                      </div>
                    </div>

                    <div className="d-flex align-items-center mb-2 mt-2">
                      <FontAwesomeIcon icon={faFile} className="me-2" />
                      <div style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title || o.file_name || o.file?.name}</div>
                      <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn-sm text-muted p-0" onClick={() => setMenuOpen(menuOpen.zone === 'videos' && menuOpen.idx === i ? { zone: null, idx: null } : { zone: 'videos', idx: i })}><FontAwesomeIcon icon={faEllipsisV} /></button>
                        {menuOpen.zone === 'videos' && menuOpen.idx === i && (
                          <div className="card position-absolute" style={{ right: 8, top: 28, zIndex: 10 }}>
                            <div className="card-body p-2">
                              <button className="btn btn-sm d-block" onClick={() => { setConfirmDelete({ open: true, zone: 'videos', idx: i }); setMenuOpen({ zone: null, idx: null }) }}>Supprimer</button>
                              <button className="btn btn-sm d-block" onClick={() => { downloadFile(o); setMenuOpen({ zone: null, idx: null }) }}>Télécharger</button>
                              <button className="btn btn-sm d-block" onClick={async () => { if (o.id) { try { const res = await axios.get(`/multimedia/${o.id}/share`); setShareModal({ open: true, link: res.data.url }); } catch (e) { alert('Erreur'); } } else { const link = getFileLink(o); setShareModal({ open: true, link }); } setMenuOpen({ zone: null, idx: null }) }}>Partager</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <small className="text-muted">{bytesToSize(o.file_size)}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h6 className="fw-semibold">Audios</h6>
          <div className="row">
            {audioFiles.length === 0 && <div className="text-muted ms-2">Aucun fichier audio.</div>}
            {audioFiles.map((o, i) => (
              <div key={`${o.id || o.file.name}-${i}`} className="col-6 col-md-3 mb-3">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column position-relative">
                    <div className="d-flex align-items-center mb-2">
                      <div style={{ width: 48, height: 48, background: '#f8f9fa', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, cursor: 'pointer' }} onClick={() => {
                        let src = ''
                        let objectUrl = null
                        if (o.url) src = o.url
                        else if (o.file && o.file instanceof File) { objectUrl = URL.createObjectURL(o.file); src = objectUrl }
                        else if (o.file && o.file.url) src = o.file.url
                        setVideoPlayer({ open: true, src, title: o.title || o.file_name || o.file?.name, objectUrl })
                      }}>
                        <FontAwesomeIcon icon={faPlay} />
                      </div>
                      <div style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title || o.file_name || o.file?.name}</div>
                      <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setMenuOpen(menuOpen.zone === 'audios' && menuOpen.idx === i ? { zone: null, idx: null } : { zone: 'audios', idx: i })}><FontAwesomeIcon icon={faEllipsisV} /></button>
                        {menuOpen.zone === 'audios' && menuOpen.idx === i && (
                          <div className="card position-absolute" style={{ right: 8, top: 28, zIndex: 10 }}>
                            <div className="card-body p-2">
                              <button className="btn btn-sm d-block" onClick={() => { setConfirmDelete({ open: true, zone: 'audios', idx: i }); setMenuOpen({ zone: null, idx: null }) }}>Supprimer</button>
                              <button className="btn btn-sm d-block" onClick={() => { downloadFile(o); setMenuOpen({ zone: null, idx: null }) }}>Télécharger</button>
                              <button className="btn btn-sm d-block" onClick={async () => { if (o.id) { try { const res = await axios.get(`/multimedia/${o.id}/share`); setShareModal({ open: true, link: res.data.url }); } catch (e) { alert('Erreur'); } } else { const link = getFileLink(o); setShareModal({ open: true, link }); } setMenuOpen({ zone: null, idx: null }) }}>Partager</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <small className="text-muted">{bytesToSize(o.file_size || o.file?.size)}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h6 className="fw-semibold">Photos</h6>
          <div className="row">
            {photoFiles.length === 0 && <div className="text-muted ms-2">Aucune photo ajoutée.</div>}
            <PhotoProvider>
              {photoFiles.map((o, i) => {
                const src = o.url || (o.file && o.file.url) || ''
                return (
                  <div key={`${o.id || o.file?.name}-${i}`} className="col-6 col-md-3 mb-3">
                    <div className="card h-100">
                      <div className="card-body d-flex flex-column position-relative">
                        <div style={{ cursor: 'pointer' }}>
                          {src ? (
                            <PhotoView src={src}>
                              <img src={src} alt={o.title || o.file_name || o.file?.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8, cursor: 'pointer' }} />
                            </PhotoView>
                          ) : (
                            <div style={{ width: '100%', height: 120, background: '#f8f9fa', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                              <FontAwesomeIcon icon={faImage} />
                            </div>
                          )}

                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <FontAwesomeIcon icon={faImage} className="me-2" />
                          <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title || o.file_name || o.file?.name}</div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setMenuOpen(menuOpen.zone === 'photos' && menuOpen.idx === i ? { zone: null, idx: null } : { zone: 'photos', idx: i })}><FontAwesomeIcon icon={faEllipsisV} /></button>
                            {menuOpen.zone === 'photos' && menuOpen.idx === i && (
                              <div className="card position-absolute" style={{ right: 8, top: 28, zIndex: 10 }}>
                                <div className="card-body p-2">
                                  <button className="btn btn-sm btn-link d-block" onClick={() => { setConfirmDelete({ open: true, zone: 'photos', idx: i }); setMenuOpen({ zone: null, idx: null }) }}>Supprimer</button>
                                  <button className="btn btn-sm btn-link d-block" onClick={() => { downloadFile(o); setMenuOpen({ zone: null, idx: null }) }}>Télécharger</button>
                                  <button className="btn btn-sm btn-link d-block" onClick={async () => { if (o.id) { try { const res = await axios.get(`/multimedia/${o.id}/share`); setShareModal({ open: true, link: res.data.url }); } catch (e) { alert('Erreur'); } } else { const link = getFileLink(o); setShareModal({ open: true, link }); } setMenuOpen({ zone: null, idx: null }) }}>Partager</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <small className="text-muted">{bytesToSize(o.file_size || o.file?.size)}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </PhotoProvider>
          </div>
        </div>

        <div>
          <h6 className="fw-semibold">Documents</h6>
          <div className="row">
            {docFiles.length === 0 && <div className="text-muted ms-2">Aucun document.</div>}
            {docFiles.map((o, i) => {
              return (
                <div key={`${o.id || o.file?.name}-${i}`} className="col-6 col-md-3 mb-3">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column position-relative">
                      <div style={{ cursor: 'pointer' }} onClick={() => {
                        let link = o.url || (o.file && o.file.url) || ''
                        let objectUrl = null
                        if (!link) {
                          if (o.id) link = `/multimedia/mediafiles/${o.id}/download`
                          else if (o.file && o.file instanceof File) { objectUrl = URL.createObjectURL(o.file); link = objectUrl }
                        }
                        if (!link) return
                        window.open(link, '_blank')
                        if (objectUrl) setTimeout(() => { try { URL.revokeObjectURL(objectUrl) } catch (e) {} }, 5000)
                      }}>
                        <div style={{ width: '100%', height: 120, background: '#f8f9fa', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                          <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: 28 }} />
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-2">
                        <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title || o.file_name || o.file?.name}</div>
                        <div style={{ marginLeft: 'auto' }}>
                          <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setMenuOpen(menuOpen.zone === 'docs' && menuOpen.idx === i ? { zone: null, idx: null } : { zone: 'docs', idx: i })}><FontAwesomeIcon icon={faEllipsisV} /></button>
                          {menuOpen.zone === 'docs' && menuOpen.idx === i && (
                            <div className="card position-absolute" style={{ right: 8, top: 28, zIndex: 10 }}>
                              <div className="card-body p-2">
                                <button className="btn btn-sm btn-link d-block" onClick={() => { setConfirmDelete({ open: true, zone: 'docs', idx: i }); setMenuOpen({ zone: null, idx: null }) }}>Supprimer</button>
                                <button className="btn btn-sm btn-link d-block" onClick={() => { downloadFile(o); setMenuOpen({ zone: null, idx: null }) }}>Télécharger</button>
                                <button className="btn btn-sm btn-link d-block" onClick={async () => { if (o.id) { try { const res = await axios.get(`/multimedia/${o.id}/share`); setShareModal({ open: true, link: res.data.url }); } catch (e) { alert('Erreur'); } } else { const link = getFileLink(o); setShareModal({ open: true, link }); } setMenuOpen({ zone: null, idx: null }) }}>Partager</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <small className="text-muted">{bytesToSize(o.file_size || o.file?.size)}</small>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </>)}
      </div>

      {/* Modal for adding files (DropZones moved here) */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ajouter des fichiers</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <DropZone
                      zone="photos"
                      title={<>🖼️ Photos</>}
                      hint="Glissez-déposez des images ou cliquez pour sélectionner (plusieurs)"
                      acceptLabel=".jpg, .png, .webp — max 20MB par fichier"
                      onClickChoose={() => inRef.current.photos && inRef.current.photos.click()}
                      onDrop={(e) => handleDrop('photos', e)}
                    >
                      <input ref={el => inRef.current.photos = el} type="file" accept=".jpg,.jpeg,.png,.webp" multiple style={{ display: 'none' }} onChange={e => handleInput('photos', e)} />
                      <div className="row">
                        {tempPhotoFiles.map((o, i) => (
                          <div key={o.uid || `${o.file.name}-temp-${i}`} className="col-12 my-2">
                            <div className="card h-100">
                              <div className="card-body p-2 d-flex align-items-start">
                                {tempPhotoPreviews[i] ? (
                                  <img src={tempPhotoPreviews[i]} alt={o.file.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, marginRight: 8 }} />
                                ) : (
                                  <FontAwesomeIcon icon={faImage} className="me-2" />
                                )}
                                <div style={{ flex: 1 }}>
                                  <div className="text-truncate" style={{ maxWidth: 160 }}>{o.file.name}</div>
                                  <input className="form-control form-control-sm mt-1" placeholder="Titre / description" value={o.title} onChange={e => {
                                    const v = e.target.value
                                    setTempPhotoFiles(prev => prev.map(p => p.uid === o.uid ? { ...p, title: v } : p))
                                  }} />
                                </div>
                                <div className="ms-2 text-end">
                                  <small className="text-muted d-block">{bytesToSize(o.file.size)}</small>
                                  <button className="btn btn-sm btn-link text-danger p-0" onClick={() => removeFile('photos', o.uid)}><FontAwesomeIcon icon={faTimes} /></button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DropZone>
                  </div>

                  <div className="col-md-6">
                    <DropZone
                      zone="videos"
                      title={<>🎬 Vidéos</>}
                      hint="Glissez-déposez des vidéos ou cliquez pour sélectionner (plusieurs)"
                      acceptLabel=".mp4, .webm, .mov — jusqu'à 500MB"
                      onClickChoose={() => inRef.current.videos && inRef.current.videos.click()}
                      onDrop={(e) => handleDrop('videos', e)}
                    >
                      <input ref={el => inRef.current.videos = el} type="file" accept=".mp4,.webm,.mov,.mkv" multiple style={{ display: 'none' }} onChange={e => handleInput('videos', e)} />
                      <div className="row">
                        {tempVideoFiles.map((o, i) => (
                          <div key={o.uid || `${o.file.name}-temp-${i}`} className="col-12 my-2">
                            <div className="card h-100">
                              <div className="card-body p-2">
                                <div className="d-flex align-items-start">
                                  <FontAwesomeIcon icon={faFile} className="me-2" />
                                  <div style={{ flex: 1 }}>
                                    <div className="text-truncate" style={{ maxWidth: 180 }}>{o.file.name}</div>
                                    <input className="form-control form-control-sm mt-1" placeholder="Titre / description" value={o.title} onChange={e => {
                                      const v = e.target.value
                                      setTempVideoFiles(prev => prev.map(p => p.uid === o.uid ? { ...p, title: v } : p))
                                    }} />
                                  </div>
                                  <div className="ms-2 text-end">
                                    <small className="text-muted d-block">{bytesToSize(o.file.size)}</small>
                                    <button className="btn btn-sm btn-link text-danger p-0" onClick={() => removeFile('videos', o.uid)}><FontAwesomeIcon icon={faTimes} /></button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DropZone>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <DropZone
                      zone="audios"
                      title={<>🎧 Audios</>}
                      hint="Glissez-déposez des audios ou cliquez pour sélectionner (plusieurs)"
                      acceptLabel=".mp3, .wav, .m4a — jusqu'à 500MB"
                      onClickChoose={() => inRef.current.audios && inRef.current.audios.click()}
                      onDrop={(e) => handleDrop('audios', e)}
                    >
                      <input ref={el => inRef.current.audios = el} type="file" accept=".mp3,.wav,.m4a,.aac" multiple style={{ display: 'none' }} onChange={e => handleInput('audios', e)} />
                      <div className="row">
                        {tempAudioFiles.map((o, i) => (
                          <div key={o.uid || `${o.file.name}-temp-${i}`} className="col-12 my-2">
                            <div className="card h-100">
                              <div className="card-body p-2">
                                <div className="d-flex align-items-start">
                                  <FontAwesomeIcon icon={faFile} className="me-2" />
                                  <div style={{ flex: 1 }}>
                                    <div className="text-truncate" style={{ maxWidth: 180 }}>{o.file.name}</div>
                                    <input className="form-control form-control-sm mt-1" placeholder="Titre / description" value={o.title} onChange={e => {
                                      const v = e.target.value
                                      setTempAudioFiles(prev => prev.map(p => p.uid === o.uid ? { ...p, title: v } : p))
                                    }} />
                                  </div>
                                  <div className="ms-2 text-end">
                                    <small className="text-muted d-block">{bytesToSize(o.file.size)}</small>
                                    <button className="btn btn-sm btn-link text-danger p-0" onClick={() => removeFile('audios', o.uid)}><FontAwesomeIcon icon={faTimes} /></button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DropZone>
                  </div>

                  <div className="col-md-6">
                    <DropZone
                      zone="docs"
                      title={<>📄 Documents</>}
                      hint="Glissez-déposez des documents ou cliquez pour sélectionner (plusieurs)"
                      acceptLabel=".pdf, .docx — max 50MB"
                      onClickChoose={() => inRef.current.docs && inRef.current.docs.click()}
                      onDrop={(e) => handleDrop('docs', e)}
                    >
                      <input ref={el => inRef.current.docs = el} type="file" accept=".pdf,.docx" multiple style={{ display: 'none' }} onChange={e => handleInput('docs', e)} />
                      <div className="row">
                        {tempDocFiles.map((o, i) => (
                          <div key={o.uid || `${o.file.name}-temp-${i}`} className="col-12 mb-3">
                            <div className="card h-100">
                              <div className="card-body p-2 d-flex align-items-start">
                                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                                <div style={{ flex: 1 }}>
                                  <div className="text-truncate" style={{ maxWidth: 160 }}>{o.file.name}</div>
                                  <input className="form-control form-control-sm mt-1" placeholder="Titre / description" value={o.title} onChange={e => {
                                    const v = e.target.value
                                    setTempDocFiles(prev => prev.map(p => p.uid === o.uid ? { ...p, title: v } : p))
                                  }} />
                                </div>
                                <div className="ms-2 text-end">
                                  <small className="text-muted d-block">{bytesToSize(o.file.size)}</small>
                                  <button className="btn btn-sm btn-link text-danger p-0" onClick={() => removeFile('docs', o.uid)}><FontAwesomeIcon icon={faTimes} /></button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DropZone>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={handleModalSubmit} disabled={isUploading}>{isUploading ? 'Envoi...' : 'Ajouter'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isUploading}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm delete modal */}
      {confirmDelete.open && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmer la suppression</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setConfirmDelete({ open: false, zone: null, idx: null })} />
              </div>
              <div className="modal-body">
                <p>Voulez-vous vraiment supprimer ce fichier ? Cette action est irréversible.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmDelete({ open: false, zone: null, idx: null })}>Annuler</button>
                <button className="btn btn-danger" onClick={() => { removeFile(confirmDelete.zone, confirmDelete.idx); setConfirmDelete({ open: false, zone: null, idx: null }) }}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
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
                  <button className="btn btn-outline-secondary" onClick={async () => { try { await navigator.clipboard.writeText(shareModal.link); alert('Lien copié'); } catch (e) { alert('Impossible de copier'); } }}><FontAwesomeIcon icon={faShareAlt} /></button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShareModal({ open: false, link: '' })}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Video player modal */}
      {videoPlayer.open && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{videoPlayer.title || 'Lecture vidéo'}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => {
                  // revoke any object URL created
                  if (videoPlayer.objectUrl) try { URL.revokeObjectURL(videoPlayer.objectUrl) } catch (e) {}
                  setVideoPlayer({ open: false, src: '', title: '', objectUrl: null })
                }} />
              </div>
              <div className="modal-body p-0">
                <div style={{ width: '100%' }}>
                  <MyPlayer src={videoPlayer.src} autoPlay controls />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => {
                  if (videoPlayer.objectUrl) try { URL.revokeObjectURL(videoPlayer.objectUrl) } catch (e) {}
                  setVideoPlayer({ open: false, src: '', title: '', objectUrl: null })
                }}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediathequeTab
