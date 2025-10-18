# New Profile Page

## Overview
A new profile page has been created (`NewProfilePage.jsx`) that provides a comprehensive view of the user's resume information, including personal details, master experience bank, and past curated resumes.

## Features

### Layout
The new profile page features a two-column layout:

#### Left Sidebar
- **Logo**: ResumATE branding
- **Profile Card**: 
  - Profile picture
  - Name, title, and company
  - Email and phone
  - Job status badge (e.g., "Job-hunting")
- **New Resume Button**: Quick access to create a new tailored resume
- **Search Bar**: Search through past resumes
- **Past Resumes List**: Clickable list of previously created curated resumes

#### Main Content Area
- **Top Navigation**: Tabs for "Resume Tailor" and "Profile"
- **Resume Information Header**: 
  - Last updated timestamp
  - PDF download link
- **Master Work Experience Section**: 
  - Lists all work experiences with bullet points
  - "Smart Points" button for AI-powered suggestions
  - "Add" button to create new entries
  - Edit functionality for each experience
- **Master Projects Section**: 
  - Similar to work experience (shown when projects exist)
- **Master Education Experience Section**: 
  - Lists all education entries
  - Similar functionality to work experience

## Accessing the Page

### URL
Navigate to `/new-profile` after logging in.

Example: `http://localhost:5173/new-profile` (development)

### Navigation
You can create a link or button in your app that navigates to the new profile page:
```javascript
navigate('/new-profile')
```

## Technical Details

### File Location
`/frontend/src/pages/NewProfilePage.jsx`

### Route Configuration
The route has been added to `App.jsx`:
```javascript
<Route path='/new-profile' element={
  <ProtectedRoute>
    <NewProfilePage />
  </ProtectedRoute>
} />
```

### Data Sources
The page fetches data from:
- **Auth Store**: User profile information
- **Resume Items API**: Work experiences and projects
- **Education API**: Education entries
- **Curated Resumes API**: Past tailored resumes

### Dependencies
- React Router for navigation
- Zustand for state management (auth store)
- Lucide React for icons
- Shadcn UI components (Button, Card, Input)

## Key Differences from Original Profile Page

1. **Layout**: Two-column layout vs. single column
2. **Sidebar**: Integrated navigation and past resumes list
3. **Visual Design**: Modern card-based design with more spacing
4. **Work Experience Display**: Inline bullet points with copy functionality
5. **Navigation**: Built-in tabs for Resume Tailor and Profile views
6. **Quick Actions**: Smart Points feature buttons for each section

## Original Profile Page
The original profile page (`ProfilePage.jsx`) remains untouched and accessible at `/profile`.

## Future Enhancements
Potential improvements:
- Add inline editing for experiences without navigating away
- Implement Smart Points AI functionality
- Add PDF generation and download
- Enable drag-and-drop reordering of experiences
- Add filtering and sorting options for experiences
- Profile picture upload functionality

