# CS319-Term-Project

## 1. Project Overview
This project is a comprehensive web-based system designed to manage Bilkent University Promotion Department and its various activities. It supports the full lifecycle of tour management, including tour applications, guide assignment, prioritization, and performance evaluations. Additionally, it manages work hour logging (puantaj) for guides, collects feedback, and handles various event types like university fairs and summer tours.

**Tech Stack**: MERN (MongoDB, Express.js, React.js, Node.js).

## 2. Project Features

### 2.1 User Roles and Privileges
- **Admin**: Full access to all system features.
- **Coordinator**: Manages tours, assigns guides, and accesses reports.
- **Advisor**: Schedules guides for their assigned days.
- **Guide**: Student guides can see and claim available tours.
- **Trainee**: Beginner guides who assist in tours to gain experience.

- **Authentication**: JWT-based authentication for secure login with role-based access control. Different levels of access are provided based on user roles (e.g., coordinators can access all data, guides only see their assigned tours).
- **User Registration**: Users register with their email and a password (hashed using bcryptjs). 

### 2.2 Tour Management
- **Tour Application**: High schools apply for tours by selecting preferred dates, entering student counts, and specifying special needs.
- **A calendar interface** is provided, showing session availability and busyness.
- **Tour Prioritization**: The system prioritizes tours based on:
	-	Top-tier / Loyal / New High Schools
	-	Out-of-Town High Schools
	-	First-Come, First-Served for other applications.
- **Appointment Algorithm**: High schools select available sessions from a calendar. If a day is marked busy, they can still apply, but approval is not guaranteed. Schools can apply 2+ weeks in advance.
- **Upon application** schools are assigned a “most probable” approval date, which may be adjusted based on priority shifts.

### 2.3 Guide Management
- **Guide Availability**:Guides can upload their course schedules as screenshots or manually select the days and hours they are available. The system tracks guide attributes such as the high school they graduated from and their academic major, which can be used to match them to appropriate tours.
- **Guide Assignment**: Guides can claim tours or be manually assigned by coordinators. Advisors and coordinators can view guide schedules to assign tours accordingly. Intern guides (trainees) are automatically assigned by the system to gain experience.
- **Guide Performance Review**: High schools can review guides after each tour. Performance is evaluated based on feedback.

### 2.4 Puantaj (Work Hours Logging)
- Guides log their work hours for each tour, and coordinators access monthly reports for payroll processing.Puantaj data is refreshed monthly, and reports are generated for payroll processing. This data is only accessible to coordinators and higher-level users.

### 2.5 Individual Tours
- Individual students can request department-specific tours, matched to guides based on academic interests.

### 2.6 Data Management, Analysis, and Graphing
- Information about high school counselors and their contact details, and student and parent contact data are collected.
- The system tracks how many students from each high school have visited Bilkent and illustrates trends showing whether a school’s interest in Bilkent is increasing or decreasing.
- Which universities attract the most students from top-performing high schools, and other key performance indicators are also visualized.

### 2.7 Coordinator Functions
- **Event Planning**: Manage and organize different types of events, assign guides, and access all tour-related data with full control.
- **Data & Analysis Dashboard:** A centralized dashboard where coordinators can access all tour-related data, including high school success rates, percentage of Bilkent student shares, advisor and guide ratings, and more.

### 2.8 Advisor Functions
- **Conference Room Arrangements**: Schedule and book rooms for tours and assign guides based on availability and performance.
- Advisors assign guides to tours based on availability, performance reviews, and qualifications. They can only see tours and guides for their assigned days.
- Advisors can use custom filters to search for guides based on their academic major, school of graduation, and experience level (trainee, junior, senior).
### 2.9 Event ID and Feedback
- Applicant schools receive an event ID to check tour status and provide feedback, which is used to evaluate guide performance.
- Event page also contains important information when visiting Bilkent: roads, rules etc.

### 2.10 Excel Automation
- Automates data transfer between Excel and the system’s database, simplifying data entry for schools and guides.
- High schools can upload participant information in Excel format, simplifying data entry for large groups.
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
