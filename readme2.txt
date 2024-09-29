1. Project Overview

This project is a comprehensive web-based system designed to manage campus tours for high schools visiting Bilkent University. It supports the full lifecycle of tour management, including high school tour applications, guide assignment, tour prioritization, and performance evaluations. The system also handles work hour logging (puantaj) for guides, collects feedback for performance reviews, and manages multiple types of events such as university fairs and summer tours.

Tech Stack: MERN (MongoDB, Express.js, React.js, Node.js).

2. Project Features

2.1 User Roles and Privileges

	•	User Roles:
	•	Admin: Full access to all aspects of the system.
	•	Coordinator: Manages all aspects of tours, including assigning guides, event planning, and accessing data reports.
	•	Advisor: Manages tour details for their assigned days and schedules guides accordingly.
	•	Guide: Student guides who lead campus tours. They can see and claim available tours.
	•	Trainee: A beginner guide who may assist on tours, gaining experience.
	•	Authentication:
	•	JWT-based authentication for secure login and role-based access control.
	•	Different levels of access are provided based on user roles (e.g., coordinators can access all data, guides only see their assigned tours).
	•	User Registration/Login:
	•	Users register with their email and a password (hashed using bcryptjs).
	•	Upon registration, users are assigned a role that determines their access level.

2.2 Tour Management

	•	Tour Application:
	•	High schools apply for tours by selecting preferred dates, entering student counts, and specifying special needs.
	•	Schools agree to terms and conditions before submitting their application.
	•	A calendar interface is provided, showing session availability and busyness.
	•	Tour Prioritization:
	•	The system prioritizes tours based on:
	1.	Star / Loyal / Nurturing High Schools
	2.	Out-of-Town High Schools
	3.	First-Come, First-Served for other applications.
	•	Priority is determined using YÖK Atlas data and the school’s relationship with Bilkent.
	•	Appointment Algorithm:
	•	High schools select available sessions from a calendar. If a day is marked busy, they can still apply, but approval is not guaranteed.
	•	Schools can apply 2+ weeks in advance. They will have a better chance of approval if they choose less busy sessions.
	•	Upon application, schools are assigned a “most probable” approval date, which may be adjusted based on priority shifts.
	•	Sessions are locked 1 week before the scheduled tour, and the high school is contacted by advisor.
	•	Coordinators can override the scheduling algorithm if needed, with affected schools notified and rearranged automatically.

2.3 Guide Management

	•	Guide Availability:
	•	Guides can upload their course schedules as screenshots or manually select the days and hours they are available.
	•	Advisors and coordinators can view guide schedules to assign tours accordingly.
	•	Guide Assignment:
	•	Guides are assigned 1 guide per 60 students. Backup guides may be assigned as needed.
	•	Guides can claim tours or be manually assigned by coordinators.
	•	Guide assignments can be based on their academic major (e.g., science high schools are assigned engineering students).
	•	An optional Pre-registration System allows guides to pre-register for tours they wish to participate in.
	•	Guide Performance Review:
	•	High schools can review guides after each tour. Performance is evaluated based on feedback.
	•	Guides with high ratings are prioritized for higher-priority schools in future tours.
	•	Intern Guide Assignment:
	•	Intern guides (trainees) are automatically assigned by the system to gain experience.
	•	Guide Classification:
	•	Guides are categorized into Trainee, Junior, and Senior roles.
	•	The system tracks guide attributes such as the high school they graduated from and their academic major, which can be used to match them to appropriate tours.

2.4 Puantaj (Work Hours Logging)

	•	Guide Logging:
	•	Guides log their work hours for each tour, which are recorded in the system and linked to their assigned tours.
	•	Monthly Data:
	•	Puantaj data is refreshed monthly, and reports are generated for payroll processing.
	•	This data is only accessible to coordinators and higher-level users.

2.5 Individual Tours

	•	Student-Specific Tours:
	•	Individual students (not part of a high school group) can request tours through a separate page. The system matches them with guides based on their academic interests.
	•	These tours may focus on specific departments, with guides assigned accordingly.

2.6 Data Management, Analysis, and Graphing

	•	Data Collected:
	•	Information about high school counselors and their contact details.
	•	Student and parent contact data for those who have contacted Bilkent.
	•	YÖK Atlas data, which is used for analysis and prioritization.
	•	Analysis and Graphs:
	•	The system tracks:
	•	How many students from each high school have visited Bilkent.
	•	Schools categorized as Star, Loyal, or Nurturing based on their engagement with Bilkent.
	•	Trends showing whether a school’s interest in Bilkent is increasing or decreasing.
	•	Data on which universities attract the most students from top-performing high schools.
	•	Graphing and Reporting:
	•	Coordinators can view custom reports and graphs detailing the percentage of Bilkent’s student attraction from different schools and other key performance indicators (KPIs).
	•	The system supports the extraction and uploading of data via Excel files for easier reporting.

2.7 Coordinator Functions

	•	Tour Appointment System Management:
	•	Coordinators have full control over the tour scheduling system, with the ability to override or modify assignments.
	•	Access to All Data:
	•	Coordinators can access all guide information, school data, and performance reviews.
	•	Event Planning:
	•	Coordinators manage various types of events (e.g., university fairs, special visits, summer tours).
	•	Separate tabs for different events allow for easy organization and assignment of guides.
	•	Data & Analysis Dashboard:
	•	A centralized dashboard where coordinators can access all tour-related data, including high school success rates, percentage of Bilkent student shares, advisor and guide ratings, and more.

2.8 Advisor Functions

	•	Conference Room Arrangements:
	•	Advisors handle the scheduling and booking of conference rooms for each tour.
	•	Guide Assignments:
	•	Advisors assign guides to tours based on availability, performance reviews, and qualifications. They can only see tours and guides for their assigned days.
	•	Custom Guide Filters:
	•	Advisors can use custom filters to search for guides based on their academic major, school of graduation, and experience level (trainee, junior, senior).
	•	When selecting guides for tours, only those available on the specified day are shown.

2.9 Event ID and Feedback

	•	Event ID:
	•	High schools and individual applicants are assigned an Event ID. This allows them to check their application status before and after tour approval.
	•	High schools can also rate their trip after the event without registering for an account.
	•	Vital Campus Information:
	•	The event page provides schools with essential information about the campus, including tour details and facilities they can visit.
	•	Feedback and Performance Reviews:
	•	A feedback form is sent to high schools after their visit, allowing them to rate their guide and the overall experience.
	•	This feedback is used to evaluate guide performance and inform future guide assignments.

2.10 Excel Automation

	•	Excel File Handling:
	•	The system can automatically transfer data between Excel files and the database.
	•	Tour requests and confirmed tours are tracked in separate tables. Once a tour is approved, it is automatically moved to the confirmed tours table.
	•	High schools can also upload participant information in Excel format, simplifying data entry for large groups.

3. Project Structure

Backend (Node.js + Express)

	•	User Authentication: JWT-based authentication for secure login and authorization.
	•	API Routes:
	•	/api/auth/register: Register users (High School, Guide, Advisor, Coordinator).
	•	/api/auth/login: Login users and provide JWT tokens.
	•	/api/tours: Manage tour applications and assignments.
	•	/api/guides: Manage guide availability and tour claims.
	•	/api/puantaj: Log guide work hours and generate monthly reports.
	•	Models (MongoDB):
	•	User: Stores user information (name, email, role, password).
	•	TourApplication: Stores details of each tour request, including school, preferred dates, and status.
	•	Guide: Tracks guide availability, assigned tours, and performance reviews.
	•	Puantaj: Logs work hours for each guide, linked to their assigned tours for payroll purposes.

Frontend (React.js)

	•	React Components:
	•	Authentication Pages: Registration and login forms.
	•	Tour Dashboard: Displays and manages tour requests, tracks guide assignments, and shows the status of appointments.
	•	Guide Pages: Allows guides to claim tours, view schedules, and log work hours (puantaj).
	•	Coordinator Dashboard: View statistics, assign guides, and access all tour and performance data.
	•	State Management: Handled using Redux to store global application state, including user authentication, tour data, and guide availability.

4. Corner Cases

	1.	Duplicate Applications: The system flags and notifies the advisor when duplicate applications are submitted for the same date.
	2.	Overbooked Days: The system limits the number of tours per day and suggests alternative dates to schools if their chosen date is full.
	3.	Guide No-Shows: If a guide fails to claim a tour within a set timeframe, the system alerts the coordinator to manually assign a replacement guide.
	4.	Tour Cancellations/Rescheduling: Schools can cancel or reschedule their tours, with notifications sent to the assigned guides and advisors.
	5.	Data Integrity: All user actions (e.g., tour applications, guide assignments) are validated to ensure correctness.
	6.	Guide Assignment Conflicts: The system prevents guides from being assigned to overlapping tours on the same day.
	7.	Performance-Based Assignment: Guides with better reviews are automatically prioritized for future tours, ensuring high-quality tours for important high schools.

5. Advanced Features

	1.	Excel Automation: Automate the transfer of data between Excel sheets and the database, making it easy to handle large volumes of tour data.
	2.	Custom Filters for Advisors: Advisors can use filters to assign guides based on availability, academic major, or past performance.
	3.	Pre-registration for Guides: Guides can pre-register for tours, similar to course registration, reducing the manual assignment workload for coordinators.
	4.	Automated Notifications: Automatic notifications are sent for upcoming tours, guide assignments, and any changes in scheduling.
	5.	Guide Performance Review: High schools can submit feedback on guides, which affects their future tour assignments.