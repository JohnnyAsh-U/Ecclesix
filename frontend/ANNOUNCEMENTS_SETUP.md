# Announcements Setup

## Installation

Install the required marquee package:

```bash
npm install react-fast-marquee
```

## Frontend Implementation

The announcement system is now integrated into `HeaderMenu.jsx` and will automatically:

1. **Fetch announcements** from the backend API (`/api/communication/announcements/`)
2. **Display active announcements** using a scrolling marquee effect
3. **Allow users to dismiss** announcements (stored in localStorage)
4. **Filter expired announcements** automatically

### Announcement Component Features

- Fetches tenant-level announcements for the user's church
- Displays with smooth scrolling marquee animation
- Pause on hover functionality
- Persistent dismissal (localStorage)
- Error handling and loading states

## API Endpoints

### Tenant Announcements
- `GET /api/communication/announcements/` - List published announcements
- `POST /api/communication/announcements/` - Create announcement (requires `envoyer_communication` or `envoyer_toutes_communications`)
- `PATCH /api/communication/announcements/{id}/` - Update announcement
- `DELETE /api/communication/announcements/{id}/` - Delete announcement

### Public Announcements (SaaS-level)
- `GET /api/announcements/` - List published public announcements
- `POST /api/announcements/` - Create public announcement (superadmin only)
- `PATCH /api/announcements/{id}/` - Update public announcement (superadmin only)
- `DELETE /api/announcements/{id}/` - Delete public announcement (superadmin only)

## Permissions

### Tenant Announcements
- **`envoyer_toutes_communications`**: Can create announcements for all churches
- **`envoyer_communication`**: Can create announcements only for their church

### Public Announcements
- **`superadmin`**: Can create/edit/delete public announcements

## Usage in Other Components

To display announcements in other locations (e.g., dashboard, login page):

```jsx
import Announcement from '../Announcement/Announcement'

function MyComponent() {
  return (
    <>
      <Announcement />
      {/* rest of component */}
    </>
  )
}
```

## Dismissal Behavior

- Users can dismiss announcements by clicking the × button
- Dismissal is saved in localStorage under `app:announcement:dismissed`
- Dismissed announcements won't show again unless cleared from localStorage
- Each dismissal is tracked by announcement ID
