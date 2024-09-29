# CS319-Term-Project

## 1. Project Overview
This project is a comprehensive web-based system designed to manage campus tours for high schools visiting Bilkent University. It supports the full lifecycle of tour management, including tour applications, guide assignment, prioritization, and performance evaluations. Additionally, it manages work hour logging (puantaj) for guides, collects feedback, and handles various event types like university fairs and summer tours.

**Tech Stack**: MERN (MongoDB, Express.js, React.js, Node.js).

## 2. Project Features

### 2.1 User Roles and Privileges
- **Admin**: Full access to all system features.
- **Coordinator**: Manages tours, assigns guides, and accesses reports.
- **Advisor**: Schedules guides for their assigned days.
- **Guide**: Student guides can see and claim available tours.
- **Trainee**: Beginner guides who assist in tours to gain experience.

- **Authentication**: JWT-based authentication for secure login with role-based access control.
- **User Registration**: Role-based access determined upon registration.

### 2.2 Tour Management
- **Tour Application**: Schools apply for tours, select dates, and agree to terms via a calendar interface.
- **Tour Prioritization**: Priority given to loyal schools, out-of-town applicants, and based on first-come, first-served.
- **Appointment Algorithm**: Uses YÖK Atlas data to prioritize and finalize tour dates.

### 2.3 Guide Management
- **Guide Availability**: Guides upload their schedules or manually select availability.
- **Guide Assignment**: Based on guide-to-student ratio, academic major, and performance.
- **Guide Performance Review**: High schools review guides, which affects future assignments.

### 2.4 Puantaj (Work Hours Logging)
- Guides log their work hours for each tour, and coordinators access monthly reports for payroll processing.

### 2.5 Individual Tours
- Individual students can request department-specific tours, matched to guides based on academic interests.

### 2.6 Data Management, Analysis, and Graphing
- Data on high schools, students, YÖK Atlas, and school engagement with Bilkent is tracked, analyzed, and visualized.

### 2.7 Coordinator Functions
- **Event Planning**: Manage and organize different types of events, assign guides, and access all tour-related data.

### 2.8 Advisor Functions
- **Conference Room Arrangements**: Schedule and book rooms for tours and assign guides based on availability and performance.

### 2.9 Event ID and Feedback
- Schools receive an event ID to check tour status and provide feedback, which is used to evaluate guide performance.

### 2.10 Excel Automation
- Automates data transfer between Excel and the system’s database, simplifying data entry for schools and guides.

## 3. Project Structure

### Backend (Node.js + Express)
- **JWT-based Authentication**
- **API Routes**: `/api/auth/register`, `/api/auth/login`, `/api/tours`, `/api/guides`, `/api/puantaj`.
- **Models**: User, TourApplication, Guide, Puantaj.

### Frontend (React.js)
- **React Components**: Authentication, Tour Dashboard, Guide Pages, Coordinator Dashboard.
- **State Management**: Redux for global application state.

## 4. Corner Cases
1. Duplicate Applications
2. Overbooked Days
3. Guide No-Shows
4. Tour Cancellations/Rescheduling
5. Data Integrity
6. Guide Assignment Conflicts
7. Performance-Based Assignment

## 5. Advanced Features
1. Excel Automation
2. Custom Filters for Advisors
3. Pre-registration for Guides
4. Automated Notifications
5. Guide Performance Review
