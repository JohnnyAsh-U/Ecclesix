import React, { useState, useEffect } from 'react'
import axios from '../../utils/config/axiosConfig'
import { Marquee } from '@devnomic/marquee'
import { Theme1, Theme2, Theme3 } from '../../utils/theme/color'


export default function Announcement({ storageKey = 'app:announcement:dismissed' }) {

  const [tenantAnnouncements, setTenantAnnouncements] = useState([])
  const [platformAnnouncements, setPlatformAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      // Fetch tenant announcements
      const tenantRes = await axios.get('/communication/announcements/ongoing')
      setTenantAnnouncements(Array.isArray(tenantRes.data) ? tenantRes.data : [])
      
      // Fetch platform announcements
      const platformRes = await axios.get('/tenant/announcements')
      setPlatformAnnouncements(Array.isArray(platformRes.data) ? platformRes.data : [])
      setError(null)
    } catch (err) {
      console.error('Error fetching announcements:', err)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading || (tenantAnnouncements.length === 0 && platformAnnouncements.length === 0)) {
    return null
  }

  const tenantItems = tenantAnnouncements.map(ann => ({ text: `${ann.title}: ${ann.content}`, type: 'tenant' })).filter(item => item.text)
  const platformItems = platformAnnouncements.map(ann => ({ title: ann.title, content: ann.content, type: 'platform' })).filter(item => item.title || item.content)
  
  const allItems = [...platformItems, ...tenantItems]

  return (
    <div className="overflow-hidden" style={{ maxWidth: '600px' }}>
      {allItems.length > 0 && (
        <Marquee 
          className="gap-3" 
          innerClassName="gap-3"
          speed={100}
          fade={true}
          style={{ '--gap': '1rem', '--duration': '15s', backgroundColor: '#fff', padding: '8px 0' }}
        >
          {allItems.map((item, idx) => (
            <div
              key={idx}
              className="d-flex align-items-center gap-2 px-3"
              style={{ minWidth: 200, whiteSpace: 'nowrap', backgroundColor: '#f8f9fa', borderRadius: '4px', fontWeight: 'bold' }}
            >
              <span>{item.type === 'platform' ? '🔔' : '📢'}</span>
              {item.type === 'platform' ? (
                <span>
                  <span style={{ color: Theme2 }}>{item.title}</span>
                  <span style={{ color: Theme3 }}>: {item.content}</span>
                </span>
              ) : (
                <span style={{ color: '#212529' }}>
                  {item.text}
                </span>
              )}
            </div>
          ))}
        </Marquee>
      )}
    </div>
  )
}
