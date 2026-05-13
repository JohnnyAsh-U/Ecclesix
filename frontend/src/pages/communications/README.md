# Communications Module Documentation

## Overview

The Communications module is a comprehensive system for managing multi-channel communication campaigns within the Church Management System. It includes:

- **Campaigns**: View and manage all communication campaigns
- **Create Campaign**: Wizard-based campaign creation with 5-step process
- **Channels**: Connect and manage communication providers (Email, WhatsApp)
- **Analytics**: Track delivery metrics and campaign performance

## File Structure

```
pages/communications/
├── index.jsx                    # Main Communications page with tabs
├── campaigns.jsx                # Campaigns dashboard
├── create.jsx                   # Create campaign wizard
├── channels.jsx                 # Provider/Channel management
└── analytics.jsx                # Analytics and metrics dashboard

components/communications/
└── CampaignDetail.jsx           # Campaign detail view with timeline
```

## Component Descriptions

### 1. Main Communications Page (`index.jsx`)

**Purpose**: Entry point for the communications module with tab navigation

**Key Features**:
- 4 main tabs: Campaigns, Create Campaign, Channels, Analytics
- Manages refresh state for data synchronization
- Breadcrumb navigation

**Props**:
- None (uses AppContext for permissions)

**State**:
- `refreshCampaigns`: Triggers refresh when new campaign created
- `refreshChannels`: Triggers refresh when new channel connected

### 2. Campaigns Dashboard (`campaigns.jsx`)

**Purpose**: Display all communication campaigns with filtering and search

**Key Features**:
- Table view of campaigns with key metrics
- Filter by channel (Email/WhatsApp), status (Completed/Sending/Scheduled)
- Search by campaign name
- View detailed campaign stats
- Clickable rows for detailed view
- Status badges with icons
- Delivery metrics (Sent, Delivered, Failed)

**Props**:
- `refresh`: Trigger to refresh campaign list

**State**:
- `selectedCampaign`: Currently selected campaign for detail view
- `channelFilter`: Filter campaigns by communication channel
- `statusFilter`: Filter campaigns by delivery status
- `search`: Search term for campaign name

**Mock Data**: 5 sample campaigns with various channels and statuses

### 3. Create Campaign Wizard (`create.jsx`)

**Purpose**: 5-step wizard for creating new communication campaigns

**Steps**:
1. **Channel Selection**: Choose between Email or WhatsApp
2. **Audience Selection**: Select target audience (All Members, Branch, Ministry, etc.)
3. **Compose Message**: Write email with subject or WhatsApp with template variables
4. **Schedule**: Choose send now or schedule for later with date/time/timezone
5. **Review**: Final summary before sending

**Key Features**:
- Visual progress bar showing current step
- Step validation before proceeding
- Channel-specific composition (Email has subject, WhatsApp has templates)
- Template variable support for WhatsApp
- Toast notifications for user feedback
- Form reset after successful submission

**Props**:
- `onCampaignCreated`: Callback function triggered when campaign created

**State**:
- `step`: Current wizard step (1-5)
- `formData`: Campaign configuration data

### 4. Channels Management (`channels.jsx`)

**Purpose**: Connect and manage communication providers

**Features**:
- Display connected channels (Email, WhatsApp)
- Show connection status with badges
- Provider-specific setup wizards
- API key management
- Test connection functionality
- Mock data: Resend (Email), 360dialog/Twilio (WhatsApp)

**Setup Flow**:
1. Select provider from available options
2. Enter API credentials
3. Test connection
4. Confirm and save

**Props**:
- `refresh`: Trigger to refresh channel list

**State**:
- `channels`: Array of connected/available channels
- `showConnectModal`: Show/hide connection modal
- `selectedChannel`: Channel being configured
- `selectedProvider`: Selected provider for setup
- `setupStep`: Current setup step
- `apiKey`: Entered API key
- `domain`: Domain for email providers

### 5. Analytics Dashboard (`analytics.jsx`)

**Purpose**: Display communication metrics and campaign performance

**Key Metrics**:
- Emails Sent This Month: 12,430
- WhatsApp Messages Sent: 4,200
- Delivery Rate: 97%
- Failure Rate: 2%

**Charts & Visualizations**:
- Delivery Trends (line chart placeholder)
- Channel Usage (pie chart placeholder)
- Message Success Rates by Channel (table)
- Recent Campaign Performance (table)

**Note**: Chart containers include placeholders for integration with Chart.js, Recharts, or similar libraries

**State**: None (displays mock data)

### 6. Campaign Detail Component (`components/communications/CampaignDetail.jsx`)

**Purpose**: Display detailed information about a single campaign

**Features**:
- Campaign header with status badge
- Progress bar for in-progress campaigns
- Delivery statistics grid
- Campaign configuration details
- Delivery summary
- Timeline showing campaign progression
- Failed delivery information with retry options

**Props**:
- `campaign`: Campaign object with full details
- `onBack`: Callback to return to campaigns list

**State**: None (displays passed campaign data)

## Integration Guide

### Adding to Router

Add this to your main router configuration:

```jsx
import CommunicationsPage from './pages/communications'

// In your route configuration:
{
  path: '/communications',
  element: <CommunicationsPage />
}
```

### API Integration Points

Replace mock data with actual API calls in:

**Campaigns.jsx**:
```jsx
// Replace mockCampaigns array with:
const { data: campaigns } = await axios.get('/communications/campaigns')
```

**Create.jsx**:
```jsx
// In handleSubmit():
const { data } = await axios.post('/communications/campaigns/create', formData)
```

**Channels.jsx**:
```jsx
// For connecting providers:
const { data } = await axios.post('/communications/channels/connect', {
  channel: selectedChannel.name,
  provider: selectedProvider,
  credentials: { apiKey, domain }
})
```

**Analytics.jsx**:
```jsx
// Fetch analytics data:
const { data: stats } = await axios.get('/communications/analytics')
```

## CSS Classes Used

The module uses Bootstrap 5 CSS classes from the existing project:

- `.card`, `.card-header`, `.card-body`, `.card-title`
- `.btn`, `.btn-primary`, `.btn-outline-primary`, `.btn-success`, etc.
- `.badge`, `.badge-success`, `.badge-danger`, `.badge-info`
- `.table`, `.table-hover`, `.table-striped`, `.table-responsive`
- `.form-control`, `.form-select`, `.form-check`, `.form-label`
- `.progress`, `.progress-bar`
- `.d-flex`, `.justify-content-between`, `.align-items-center`, `.gap-2`, etc.
- `.text-success`, `.text-danger`, `.text-info`, `.text-warning`, `.text-muted`
- `.fw-bold`, `.fw-light`
- `.mb-3`, `.mt-3`, `.ms-2`, `.me-2`, `.p-2`

## Features Already Implemented

✅ Responsive design (desktop & tablet friendly)
✅ Mock data for all sections
✅ Form validation
✅ Status filtering and search
✅ Channel-specific UIs
✅ Tab navigation
✅ Progress tracking
✅ Toast notifications
✅ Timeline visualization
✅ Campaign detail view

## Features for Future Enhancement

- Chart.js/Recharts integration for analytics
- Real API integration
- Batch campaign operations
- Campaign templates library
- Delivery schedule optimization
- A/B testing interface
- Campaign clone functionality
- Scheduled campaign management
- Detailed error logs and retry management
- Audience segmentation builder
- Campaign performance comparison

## Icons Used

The module uses FontAwesome icons:
- `faEnvelope`: Email
- `faWhatsapp`: WhatsApp
- `faClock`: Sending/scheduled status
- `faCheckCircle`: Completed status
- `faExclamationCircle`: Errors/failures
- `faPlus`: Add/create actions
- `faCog`: Settings/manage
- `faArrowLeft`, `faArrowRight`: Navigation
- `faCheck`: Confirmation/success
- `faTimes`: Close/failure

## Styling Notes

- Uses CSS-in-JS for dynamic styling in some components
- Inline styles for hover effects and dynamic state
- Bootstrap utilities for layout and spacing
- Custom timeline CSS included in CampaignDetail component

## Testing

To test the module:

1. Navigate to the communications tab
2. View mock campaigns in the Campaigns tab
3. Create a test campaign using the Create Campaign wizard
4. View provider setup flow in Channels tab
5. Check analytics metrics and charts in Analytics tab
6. Click on campaigns to view detailed statistics

## Dependencies

- React 18+
- axios (for API calls)
- react-toastify (for notifications)
- @fortawesome/react-fontawesome (for icons)
- Bootstrap 5 CSS
- AppContext hook (for user/permission data)
