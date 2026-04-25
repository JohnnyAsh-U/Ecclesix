import axios from 'axios'
import React, { useState, useEffect } from 'react'
import Marquee from 'react-fast-marquee'

export default function Announcement({ storageKey = 'app:announcement:dismissed' }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visible, setVisible] = useState(true)
  const [dismissedIds, setDismissedIds] = useState(new Set())

  useEffect(() => {
    // Load dismissed announcements from localStorage
    try {
      const dismissed = localStorage.getItem(storageKey)
      if (dismissed) {
        setDismissedIds(new Set(JSON.parse(dismissed)))
      }
    } catch (e) {
      console.error('Error loading dismissed announcements:', e)
    }
  }, [storageKey])

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      // Fetch tenant announcements
      const response = await fetch('/api/communication/announcements/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      })

      const res = await axios.get('/tenant/announcements')
      console.log("Tenant announcements response:", res.data) // Debugging line to check the response

      if (response.ok) {
        const data = await response.json()
        setAnnouncements(Array.isArray(data) ? data : [])
        setError(null)
      } else if (response.status !== 401) {
        setError('Failed to load announcements')
      }
    } catch (err) {
      console.error('Error fetching announcements:', err)
      setError(null) // Don't show error to user
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (announcementId) => {
    const newDismissed = new Set(dismissedIds)
    newDismissed.add(announcementId)
    setDismissedIds(newDismissed)
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newDismissed)))
    } catch (e) {
      console.error('Error saving dismissed announcements:', e)
    }
  }

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    ann => !dismissedIds.has(ann.id) && ann.status === 'published'
  )

  if (!visible || visibleAnnouncements.length === 0 || loading) {
    return null
  }

  const currentAnnouncement = visibleAnnouncements[0]

  return (
    <div className="alert alert-info" role="region" aria-label="Annonce">
      <div className="alert-icon">
        <i className="ti-announcement" />
      </div>
      <div className="container d-flex justify-content-between align-items-center">
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Marquee gradient={false} speed={50} pauseOnHover={true}>
            <p className="mb-0 me-5">
              <strong>{currentAnnouncement.title}</strong> — {currentAnnouncement.content}
            </p>
          </Marquee>
        </div>
        <button
          aria-label="Fermer annonce"
          className="btn-close ms-3"
          onClick={() => {
            handleDismiss(currentAnnouncement.id)
            setVisible(false)
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
