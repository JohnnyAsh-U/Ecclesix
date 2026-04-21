import React, { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faImage, faFileAlt, faTimes } from '@fortawesome/free-solid-svg-icons'

const MAX_PREDICATION = 500 * 1024 * 1024 // 500MB
const MAX_PHOTO = 20 * 1024 * 1024 // 20MB
const MAX_DOC = 50 * 1024 * 1024 // 50MB

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
  const [predicationFiles, setPredicationFiles] = useState([])
  const [photoFiles, setPhotoFiles] = useState([])
  const [docFiles, setDocFiles] = useState([])

  const inRef = useRef({ pred: null, photos: null, docs: null })

  const validateAndAdd = (zone, files) => {
    const fArr = Array.from(files || [])
    if (zone === 'pred') {
      const accepted = ['.mp3', '.mp4', '.wav']
      const good = fArr.filter(f => extMatches(f.name, accepted) && f.size <= MAX_PREDICATION)
      if (good.length < fArr.length) alert('Fichiers non valides ignorés (format ou taille > 500MB).')
      setPredicationFiles(prev => [...prev, ...good])
    }
    if (zone === 'photos') {
      const accepted = ['.jpg', '.jpeg', '.png', '.webp']
      const good = fArr.filter(f => extMatches(f.name, accepted) && f.size <= MAX_PHOTO)
      if (good.length < fArr.length) alert('Certaines photos ont été ignorées (format non supporté ou > 20MB).')
      setPhotoFiles(prev => [...prev, ...good])
    }
    if (zone === 'docs') {
      const accepted = ['.pdf', '.docx']
      const good = fArr.filter(f => extMatches(f.name, accepted) && f.size <= MAX_DOC)
      if (good.length < fArr.length) alert('Documents ignorés (format non supporté ou > 50MB).')
      setDocFiles(prev => [...prev, ...good])
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

  const removeFile = (zone, idx) => {
    if (zone === 'pred') setPredicationFiles(prev => prev.filter((_, i) => i !== idx))
    if (zone === 'photos') setPhotoFiles(prev => prev.filter((_, i) => i !== idx))
    if (zone === 'docs') setDocFiles(prev => prev.filter((_, i) => i !== idx))
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
      <div className="card-header" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
        <h5 className="mb-0" style={{ color: '#39adb5', fontSize: '16px', fontWeight: '600' }}>
          Médiathèque de l'Événement
        </h5>
      </div>
      <div className="card-body" style={{ minHeight: '360px' }}>
        <div className="row">
          <div className="col-md-4">
            <DropZone
              zone="pred"
              title={<>🎤 Prédication</>}
              hint="Glissez-déposez un fichier audio/vidéo ou cliquez pour choisir"
              acceptLabel=".mp3, .mp4, .wav — jusqu'à 500MB"
              onClickChoose={() => inRef.current.pred && inRef.current.pred.click()}
              onDrop={(e) => handleDrop('pred', e)}
            >
              <input ref={el => inRef.current.pred = el} type="file" accept=".mp3,.mp4,.wav" style={{ display: 'none' }} onChange={e => handleInput('pred', e)} />
              <div className="mt-2">
                {predicationFiles.map((f, i) => (
                  <span key={`${f.name}-${i}`} className="badge bg-light text-dark me-2 mb-2" style={{ padding: '8px 10px', display: 'inline-flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                    <div style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                    <small className="text-muted ms-2">{bytesToSize(f.size)}</small>
                    <button className="btn btn-sm btn-link text-danger ms-2 p-0" onClick={() => removeFile('pred', i)}><FontAwesomeIcon icon={faTimes} /></button>
                  </span>
                ))}
              </div>
            </DropZone>
          </div>

          <div className="col-md-4">
            <DropZone
              zone="photos"
              title={<>🖼️ Photos</>}
              hint="Glissez-déposez des images ou cliquez pour sélectionner (plusieurs)"
              acceptLabel=".jpg, .png, .webp — max 20MB par fichier"
              onClickChoose={() => inRef.current.photos && inRef.current.photos.click()}
              onDrop={(e) => handleDrop('photos', e)}
            >
              <input ref={el => inRef.current.photos = el} type="file" accept=".jpg,.jpeg,.png,.webp" multiple style={{ display: 'none' }} onChange={e => handleInput('photos', e)} />
              <div className="mt-2 d-flex flex-wrap">
                {photoFiles.map((f, i) => (
                  <span key={`${f.name}-${i}`} className="badge bg-light text-dark me-2 mb-2" style={{ padding: '8px 10px', display: 'inline-flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    <div style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                    <small className="text-muted ms-2">{bytesToSize(f.size)}</small>
                    <button className="btn btn-sm btn-link text-danger ms-2 p-0" onClick={() => removeFile('photos', i)}><FontAwesomeIcon icon={faTimes} /></button>
                  </span>
                ))}
              </div>
            </DropZone>
          </div>

          <div className="col-md-4">
            <DropZone
              zone="docs"
              title={<>📄 Documents</>}
              hint="Glissez-déposez des documents ou cliquez pour sélectionner"
              acceptLabel=".pdf, .docx — max 50MB"
              onClickChoose={() => inRef.current.docs && inRef.current.docs.click()}
              onDrop={(e) => handleDrop('docs', e)}
            >
              <input ref={el => inRef.current.docs = el} type="file" accept=".pdf,.docx" multiple style={{ display: 'none' }} onChange={e => handleInput('docs', e)} />
              <div className="mt-2 d-flex flex-wrap">
                {docFiles.map((f, i) => (
                  <span key={`${f.name}-${i}`} className="badge bg-light text-dark me-2 mb-2" style={{ padding: '8px 10px', display: 'inline-flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    <div style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                    <small className="text-muted ms-2">{bytesToSize(f.size)}</small>
                    <button className="btn btn-sm btn-link text-danger ms-2 p-0" onClick={() => removeFile('docs', i)}><FontAwesomeIcon icon={faTimes} /></button>
                  </span>
                ))}
              </div>
            </DropZone>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediathequeTab
