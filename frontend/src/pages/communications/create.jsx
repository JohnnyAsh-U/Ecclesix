import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faMessage, faArrowRight, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

const CreateCampaign = ({ onCampaignCreated }) => {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        channel: null,
        audience: 'all',
        audienceFilter: null,
        subject: '',
        message: '',
        template: null,
        variables: {},
        sendNow: true,
        scheduledDate: '',
        scheduledTime: '',
        timezone: 'UTC'
    })

    const handleChannelSelect = (channel) => {
        setFormData({ ...formData, channel })
        setStep(2)
    }

    const handleAudienceSelect = (audience) => {
        setFormData({ ...formData, audience })
        setStep(3)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleScheduleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSendNowChange = (e) => {
        setFormData({ ...formData, sendNow: e.target.value === 'now' })
    }

    const handleVariableChange = (key, value) => {
        setFormData({
            ...formData,
            variables: { ...formData.variables, [key]: value }
        })
    }

    const handleSubmit = () => {
        // Validate form
        if (!formData.channel) {
            toast.error('Please select a channel')
            return
        }
        if (!formData.message.trim()) {
            toast.error('Please add a message')
            return
        }
        if (formData.channel === 'email' && !formData.subject.trim()) {
            toast.error('Please add a subject for email')
            return
        }
        if (!formData.sendNow && !formData.scheduledDate) {
            toast.error('Please select a scheduled date')
            return
        }

        // Simulate API call
        toast.success('Campaign created successfully!')
        onCampaignCreated()
        // Reset form
        setFormData({
            channel: null,
            audience: 'all',
            audienceFilter: null,
            subject: '',
            message: '',
            template: null,
            variables: {},
            sendNow: true,
            scheduledDate: '',
            scheduledTime: '',
            timezone: 'UTC'
        })
        setStep(1)
    }

    return (
        <div>
            {/* Progress Bar */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className="d-flex align-items-center flex-grow-1">
                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center fw-bold`}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: step >= s ? '#0d6efd' : '#e9ecef',
                                        color: step >= s ? 'white' : '#666',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => step > s && setStep(s)}
                                >
                                    {step > s ? <FontAwesomeIcon icon={faCheck} /> : s}
                                </div>
                                {s < 5 && <div className="flex-grow-1 mx-2" style={{ height: '2px', backgroundColor: step > s ? '#0d6efd' : '#e9ecef' }}></div>}
                            </div>
                        ))}
                    </div>
                    <div className="d-flex justify-content-between mt-3 small text-muted">
                        <span>Channel</span>
                        <span>Audience</span>
                        <span>Compose</span>
                        <span>Schedule</span>
                        <span>Review</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Channel Selection */}
            {step === 1 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Step 1: Choose Channel</h5>
                        <div className="row g-4">
                            {/* Email Card */}
                            <div className="col-md-6">
                                <div
                                    className="card border-2 cursor-pointer transition"
                                    style={{
                                        borderColor: formData.channel === 'email' ? '#0d6efd' : '#dee2e6',
                                        backgroundColor: formData.channel === 'email' ? '#f0f7ff' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => handleChannelSelect('email')}
                                >
                                    <div className="card-body text-center">
                                        <FontAwesomeIcon icon={faEnvelope} size="3x" className="text-primary mb-3" />
                                        <h5 className="card-title">Email</h5>
                                        <p className="card-text text-muted">Send newsletters and announcements</p>
                                        <button className="btn btn-sm btn-primary">Select</button>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp Card */}
                            <div className="col-md-6">
                                <div
                                    className="card border-2 cursor-pointer transition"
                                    style={{
                                        borderColor: formData.channel === 'whatsapp' ? '#0d6efd' : '#dee2e6',
                                        backgroundColor: formData.channel === 'whatsapp' ? '#f0f7ff' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => handleChannelSelect('whatsapp')}
                                >
                                    <div className="card-body text-center">
                                        <FontAwesomeIcon icon={faMessage} size="3x" className="text-success mb-3" />
                                        <h5 className="card-title">WhatsApp</h5>
                                        <p className="card-text text-muted">Instant member notifications</p>
                                        <button className="btn btn-sm btn-success">Select</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Audience Selection */}
            {step === 2 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Step 2: Select Audience</h5>
                        <div className="form-group">
                            <label className="form-label">Send to:</label>
                            <div className="space-y-2">
                                {['all', 'branch', 'ministry', 'attendance', 'custom'].map((option) => (
                                    <div key={option} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="audience"
                                            id={`audience_${option}`}
                                            value={option}
                                            checked={formData.audience === option}
                                            onChange={handleAudienceSelect}
                                        />
                                        <label className="form-check-label" htmlFor={`audience_${option}`}>
                                            {option === 'all' && 'All Members'}
                                            {option === 'branch' && 'Specific Branch'}
                                            {option === 'ministry' && 'Ministry'}
                                            {option === 'attendance' && 'Attendance Segment'}
                                            {option === 'custom' && 'Custom Selection'}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {formData.audience === 'branch' && (
                            <div className="mt-3">
                                <label className="form-label">Branch:</label>
                                <select className="form-select form-select-sm">
                                    <option>Select Branch</option>
                                    <option>Main Branch</option>
                                    <option>Downtown Branch</option>
                                    <option>North Branch</option>
                                </select>
                            </div>
                        )}

                        <div className="mt-4 d-flex gap-2 justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
                            </button>
                            <button className="btn btn-primary" onClick={() => setStep(3)}>
                                Next <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Compose Message */}
            {step === 3 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">
                            Step 3: Compose {formData.channel === 'email' ? 'Email' : 'WhatsApp Message'}
                        </h5>

                        {formData.channel === 'email' ? (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Subject:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="Email subject"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Message:</label>
                                    <textarea
                                        className="form-control"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="8"
                                        placeholder="Write your email message here..."
                                    ></textarea>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Template:</label>
                                    <select
                                        className="form-select"
                                        name="template"
                                        onChange={handleInputChange}
                                    >
                                        <option>Select Template</option>
                                        <option value="sunday_reminder">Sunday Reminder</option>
                                        <option value="prayer_meeting">Prayer Meeting</option>
                                        <option value="offering_reminder">Offering Reminder</option>
                                    </select>
                                </div>

                                {formData.template && (
                                    <div className="mb-3">
                                        <label className="form-label">Variables:</label>
                                        <div className="mb-2">
                                            <label className="form-label small">Service Time:</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={formData.variables.serviceTime || ''}
                                                onChange={(e) => handleVariableChange('serviceTime', e.target.value)}
                                                placeholder="e.g., 8:00 AM"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label small">Location:</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={formData.variables.location || ''}
                                                onChange={(e) => handleVariableChange('location', e.target.value)}
                                                placeholder="e.g., Main Hall"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">Message:</label>
                                    <textarea
                                        className="form-control"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="6"
                                        placeholder="Write your WhatsApp message here..."
                                    ></textarea>
                                </div>
                            </>
                        )}

                        <div className="mt-4 d-flex gap-2 justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
                            </button>
                            <button className="btn btn-primary" onClick={() => setStep(4)}>
                                Next <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Schedule */}
            {step === 4 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Step 4: Schedule Campaign</h5>

                        <div className="mb-3">
                            <label className="form-label">When to send:</label>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sendOption"
                                    id="sendNow"
                                    value="now"
                                    checked={formData.sendNow}
                                    onChange={handleSendNowChange}
                                />
                                <label className="form-check-label" htmlFor="sendNow">
                                    Send Now
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sendOption"
                                    id="scheduleLater"
                                    value="later"
                                    checked={!formData.sendNow}
                                    onChange={handleSendNowChange}
                                />
                                <label className="form-check-label" htmlFor="scheduleLater">
                                    Schedule for Later
                                </label>
                            </div>
                        </div>

                        {!formData.sendNow && (
                            <>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date:</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="scheduledDate"
                                            value={formData.scheduledDate}
                                            onChange={handleScheduleChange}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Time:</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="scheduledTime"
                                            value={formData.scheduledTime}
                                            onChange={handleScheduleChange}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Timezone:</label>
                                    <select
                                        className="form-select"
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleScheduleChange}
                                    >
                                        <option>UTC</option>
                                        <option>EST</option>
                                        <option>CST</option>
                                        <option>MST</option>
                                        <option>PST</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="mt-4 d-flex gap-2 justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(3)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
                            </button>
                            <button className="btn btn-primary" onClick={() => setStep(5)}>
                                Next <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Step 5: Review Campaign</h5>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Channel:</label>
                                    <p className="fw-bold">{formData.channel.charAt(0).toUpperCase() + formData.channel.slice(1)}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Audience:</label>
                                    <p className="fw-bold">{formData.audience === 'all' ? 'All Members' : formData.audience}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Recipients:</label>
                                    <p className="fw-bold">1,240</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Provider:</label>
                                    <p className="fw-bold">{formData.channel === 'email' ? 'Resend' : '360dialog'}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Scheduled:</label>
                                    <p className="fw-bold">
                                        {formData.sendNow ? 'Immediate' : `${formData.scheduledDate} ${formData.scheduledTime}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {formData.channel === 'email' && (
                            <div className="mb-3">
                                <label className="form-label small text-muted">Subject:</label>
                                <p>{formData.subject}</p>
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label small text-muted">Message:</label>
                            <p style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                                {formData.message}
                            </p>
                        </div>

                        <div className="mt-4 d-flex gap-2 justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={() => setStep(4)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back
                            </button>
                            <button className="btn btn-success btn-lg" onClick={handleSubmit}>
                                <FontAwesomeIcon icon={faCheck} className="me-2" /> Send Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateCampaign
