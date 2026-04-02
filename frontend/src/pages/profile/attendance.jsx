import React, { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Modal from 'react-bootstrap/Modal'
import QRCode from 'qrcode'
import AppLogo from '../../assets/images/logo.png'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const attendanceByMonth = [
  { month: 'Nov 2025', totalEvents: 10, attendedEvents: 7 },
  { month: 'Dec 2025', totalEvents: 9, attendedEvents: 8 },
  { month: 'Jan 2026', totalEvents: 11, attendedEvents: 9 },
  { month: 'Feb 2026', totalEvents: 8, attendedEvents: 6 },
  { month: 'Mar 2026', totalEvents: 12, attendedEvents: 10 },
  { month: 'Apr 2026', totalEvents: 10, attendedEvents: 8 },
]

const chartData = {
  labels: attendanceByMonth.map((row) => row.month),
  datasets: [
    {
      label: 'Evenements Totals',
      data: attendanceByMonth.map((row) => row.totalEvents),
      backgroundColor: 'rgba(70, 128, 255, 0.35)',
      borderColor: '#4680ff',
      borderWidth: 1,
      borderRadius: 4,
    },
    {
      label: 'Evenements Assistes',
      data: attendanceByMonth.map((row) => row.attendedEvents),
      backgroundColor: 'rgba(22, 196, 127, 0.35)',
      borderColor: '#16c47f',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
}

const staticMemberAttendanceQr = {
  member_id: 'MBR-00041',
  name: 'Membre Demo',
  attendance_token: 'ATTENDANCE-DEMO-2026-04',
  valid_for: 'Sunday Service',
}

const MemberAttendance = ({membre}) => {
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrImageData, setQrImageData] = useState('')
  const [qrLoading, setQrLoading] = useState(false)

  const totalEvents = attendanceByMonth.reduce((sum, row) => sum + row.totalEvents, 0)
  const totalAttended = attendanceByMonth.reduce((sum, row) => sum + row.attendedEvents, 0)
  const attendanceRate = totalEvents > 0 ? Math.round((totalAttended / totalEvents) * 100) : 0
  const qrValue = useMemo(() => JSON.stringify(staticMemberAttendanceQr), [])

  const createQrImage = async () => {
    try {
      setQrLoading(true)
      const dataUrl = await QRCode.toDataURL(membre.qr_code, {
        width: 340,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#111827',
          light: '#ffffff',
        },
      })
      setQrImageData(dataUrl)
    } finally {
      setQrLoading(false)
    }
  }

  const openQrModal = async () => {
    setShowQrModal(true)
    if (!qrImageData) {
      await createQrImage()
    }
  }

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = src
    })

  const downloadQrWithLogo = async () => {
    const qrSource = qrImageData || (await QRCode.toDataURL(qrValue, { width: 340, margin: 2, errorCorrectionLevel: 'H' }))
    const [qrImg, logoImg] = await Promise.all([loadImage(qrSource), loadImage(AppLogo)])

    const canvas = document.createElement('canvas')
    canvas.width = qrImg.width
    canvas.height = qrImg.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(qrImg, 0, 0)

    const logoSize = Math.round(canvas.width * 0.2)
    const logoX = (canvas.width - logoSize) / 2
    const logoY = (canvas.height - logoSize) / 2

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(logoX - 6, logoY - 6, logoSize + 12, logoSize + 12)
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)

    const finalDataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = finalDataUrl
    link.download = 'attendance-qrcode.png'
    link.click()
  }

  return (
    <div className='card'>
      <div className='card-header'>
        <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
          <h5 className='mb-0'>Presence Aux Evenements (6 Derniers Mois)</h5>
          <button type='button' className='btn btn-primary btn-sm' onClick={openQrModal}>
            Voir QR Code Presence
          </button>
        </div>
      </div>

      <div className='card-body'>
        <div className='row mb-3'>
          <div className='col-md-4 mb-2'>
            <div className='p-3 border rounded bg-light'>
              <small className='text-muted d-block'>Total Evenements</small>
              <h4 className='mb-0'>{totalEvents}</h4>
            </div>
          </div>
          <div className='col-md-4 mb-2'>
            <div className='p-3 border rounded bg-light'>
              <small className='text-muted d-block'>Evenements Assistes</small>
              <h4 className='mb-0'>{totalAttended}</h4>
            </div>
          </div>
          <div className='col-md-4 mb-2'>
            <div className='p-3 border rounded bg-light'>
              <small className='text-muted d-block'>Taux De Presence</small>
              <h4 className='mb-0'>{attendanceRate}%</h4>
            </div>
          </div>
        </div>

        <div className='mb-4' style={{ height: '320px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className='table-responsive'>
          <table className='table table-hover table-striped table-bordered mb-0'>
            <thead className='bg-inverse'>
              <tr>
                <th>Mois</th>
                <th>Total Evenements</th>
                <th>Evenements Assistes</th>
                <th>Taux</th>
              </tr>
            </thead>
            <tbody>
              {attendanceByMonth.map((row) => {
                const monthlyRate = row.totalEvents > 0
                  ? Math.round((row.attendedEvents / row.totalEvents) * 100)
                  : 0

                return (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{row.totalEvents}</td>
                    <td>{row.attendedEvents}</td>
                    <td>{monthlyRate}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className='fs-5'>QR Code De Presence</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='mb-2 text-muted'>
            QR statique de demonstration pour le marquage de presence.
          </p>

          <div className='d-flex justify-content-center mb-3'>
            <div style={{ position: 'relative', width: '280px', height: '280px' }}>
              {qrLoading && (
                <div className='d-flex justify-content-center align-items-center h-100 border rounded'>
                  Generation du QR code...
                </div>
              )}

              {!qrLoading && qrImageData && (
                <>
                  <img
                    src={qrImageData}
                    alt='QR code presence'
                    className='img-fluid border rounded'
                    style={{ width: '280px', height: '280px' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: '#fff',
                      padding: '6px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                    }}
                  >
                    <img src={AppLogo} alt='App logo' style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='small text-muted'>
            <div>ID: {staticMemberAttendanceQr.member_id}</div>
            <div>Nom: {staticMemberAttendanceQr.name}</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type='button' className='btn btn-danger btn-sm' onClick={() => setShowQrModal(false)}>
            Fermer
          </button>
          <button type='button' className='btn btn-success btn-sm' onClick={downloadQrWithLogo} disabled={qrLoading}>
            Telecharger
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default MemberAttendance
