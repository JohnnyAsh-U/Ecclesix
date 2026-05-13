# Communications Module - Setup & Integration Guide

## ✅ Integration Status

The Communications module has been **fully integrated** into your ChMS application. All components, routes, and navigation are already configured.

## Files Created

### Main Pages
- ✅ `/frontend/src/pages/communications/index.jsx` - Main Communications hub with tabs
- ✅ `/frontend/src/pages/communications/campaigns.jsx` - Campaigns dashboard
- ✅ `/frontend/src/pages/communications/create.jsx` - Create campaign wizard (5 steps)
- ✅ `/frontend/src/pages/communications/channels.jsx` - Provider/channel management
- ✅ `/frontend/src/pages/communications/analytics.jsx` - Analytics & metrics dashboard

### Components
- ✅ `/frontend/src/components/communications/CampaignDetail.jsx` - Campaign detail view

### Documentation
- ✅ `/frontend/src/pages/communications/README.md` - Comprehensive module documentation

## How to Access

1. **Navigate to Communications**: Click "Communication" in the sidebar
2. **Available Routes**:
   - `/communication` - Main communications hub (NEW)
   - `/communication/send` - Still available for backward compatibility
   - `/communication/announcements` - Announcements page

## Module Features

### 1. Campaigns Tab
- View all campaigns in table format
- Filter by channel (Email/WhatsApp)
- Filter by status (Completed/Sending/Scheduled)
- Search by campaign name
- Click rows to view detailed campaign analytics
- See delivery metrics (Sent, Delivered, Failed, Pending)

### 2. Create Campaign Tab
- 5-step wizard-based interface
- **Step 1**: Channel selection (Email or WhatsApp)
- **Step 2**: Audience selection (All Members, Branch, Ministry, etc.)
- **Step 3**: Compose message (Email with subject, WhatsApp with templates)
- **Step 4**: Schedule (Send now or schedule for later)
- **Step 5**: Review and send
- Form validation and error handling
- Toast notifications for user feedback

### 3. Channels Tab
- View connected providers (Email, WhatsApp)
- Connection status indicators
- Provider-specific setup wizards
- API key management
- Test connection functionality
- Support for:
  - **Email**: Resend, SMTP
  - **WhatsApp**: 360dialog, Twilio

### 4. Analytics Tab
- Key metrics cards (Emails sent, WhatsApp messages, Delivery rate, Failures)
- Delivery trends visualization (placeholder for charts)
- Channel usage breakdown
- Success rates by channel
- Recent campaign performance table

## Data Integration Points

The module includes mock data but is ready for real API integration:

### Replace Mock Data

**In `campaigns.jsx`** - Replace `mockCampaigns`:
```javascript
// Fetch campaigns from API
useEffect(() => {
  const fetchCampaigns = async () => {
    const { data } = await axios.get('/communications/campaigns')
    setFilteredCampaigns(data)
  }
  fetchCampaigns()
}, [refresh])
```

**In `create.jsx`** - Replace `handleSubmit`:
```javascript
const handleSubmit = async () => {
  const { data } = await axios.post('/communications/campaigns/create', formData)
  toast.success('Campaign created successfully!')
  onCampaignCreated()
}
```

**In `channels.jsx`** - Add API integration:
```javascript
useEffect(() => {
  const fetchChannels = async () => {
    const { data } = await axios.get('/communications/channels')
    setChannels(data)
  }
  fetchChannels()
}, [refresh])
```

**In `analytics.jsx`** - Fetch analytics data:
```javascript
useEffect(() => {
  const fetchAnalytics = async () => {
    const { data } = await axios.get('/communications/analytics')
    // Update state with real data
  }
  fetchAnalytics()
}, [])
```

## Permissions Required

Users need these permissions to access communications:
- `envoyer_communication` - Send communications
- `envoyer_toutes_communications` - Send all communications

The permissions are already checked via `PagePermsWrapper` in the routes.

## Styling

All components use:
- ✅ Bootstrap 5 CSS classes (already in your project)
- ✅ FontAwesome icons (already installed)
- ✅ Existing project color scheme
- ✅ Responsive design (works on desktop and mobile)

## Navigation Flow

```
/communication (main hub)
├── Campaigns tab
│   └── Click campaign → Detail view
├── Create Campaign tab
│   └── 5-step wizard
├── Channels tab
│   └── Connect providers
└── Analytics tab
    └── View metrics
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Performance Notes

- Uses lazy loading for images and components
- Tab switching doesn't reload unnecessary data
- Mock data is loaded once and filtered client-side
- Ready for server-side pagination when integrated with API

## Next Steps for Backend Integration

1. **Create API endpoints**:
   - `GET /communications/campaigns` - List campaigns
   - `POST /communications/campaigns/create` - Create campaign
   - `GET /communications/campaigns/{id}` - Campaign details
   - `GET /communications/channels` - List connected channels
   - `POST /communications/channels/connect` - Connect provider
   - `GET /communications/analytics` - Get analytics data

2. **Enable Chart Integration** (optional but recommended):
   - Install: `npm install recharts` or `chart.js`
   - Replace placeholder divs in `analytics.jsx` with real charts
   - Use mock data structure as reference

3. **Add Validation**:
   - Email validation for recipients
   - Phone number validation for WhatsApp
   - API key format validation for providers

4. **Test Coverage**:
   - Test campaign creation flow
   - Test provider connection
   - Test filtering and search
   - Test responsive design

## Troubleshooting

**Issue**: Communications tab not appearing
- **Solution**: Check permissions are set correctly in AppContext
- Verify user has `envoyer_communication` permission

**Issue**: Forms not submitting
- **Solution**: Check browser console for errors
- Verify axios is configured correctly
- Check API endpoints are correct

**Issue**: Mock data not showing
- **Solution**: Check browser console for any import errors
- Verify file paths are correct
- Clear browser cache

## Support

For detailed component documentation, see:
- `/frontend/src/pages/communications/README.md`

## Future Enhancements

- [ ] Integrate with Chart.js for analytics
- [ ] Add batch campaign operations
- [ ] Create campaign templates library
- [ ] Add A/B testing interface
- [ ] Implement delivery schedule optimization
- [ ] Add campaign cloning
- [ ] Create audience segment builder
- [ ] Add campaign performance comparison

---

**Status**: ✅ Ready for API integration and testing
**Last Updated**: May 12, 2024
