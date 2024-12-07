import React, { useState, useEffect } from 'react';
import '../../../styles/CoordinatorPages/DashboardHome.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  ResponsiveContainer 
} from 'recharts';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    pendingApplications: 0,
    activeGuides: 0,
    completedTours: 0
  });

  const [visualData, setVisualData] = useState({
    schoolPriorities: [],
    userRoles: [],
    applicationStatus: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch events
      const eventsResponse = await fetch('http://localhost:3000/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const events = await eventsResponse.json();

      // Fetch users
      const usersResponse = await fetch('http://localhost:3000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const users = await usersResponse.json();

      // Fetch schools
      const schoolsResponse = await fetch('http://localhost:3000/api/high-schools', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const schools = await schoolsResponse.json();

      // Process the data
      processData(schools, events, users);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const processData = (schools, events, users) => {
    // Update main stats
    setStats({
      totalEvents: events.length || 0,
      pendingApplications: events.filter(event => event.status === 'pending').length || 0,
      activeGuides: users.filter(user => user.role === 'guide' && user.status === 'active').length || 0,
      completedTours: events.filter(event => event.status === 'completed').length || 0
    });

    // Process school priorities
    const schoolPriorities = [
      { name: 'High Priority', value: schools.filter(s => s.Priority === 'High').length || 0 },
      { name: 'Medium Priority', value: schools.filter(s => s.Priority === 'Medium').length || 0 },
      { name: 'General', value: schools.filter(s => s.Priority === 'General').length || 0 }
    ];

    // Process user roles
    const userRoles = [
      { name: 'Guides', value: users.filter(u => u.role === 'guide').length || 0 },
      { name: 'Advisors', value: users.filter(u => u.role === 'advisor').length || 0 },
      { name: 'Coordinators', value: users.filter(u => u.role === 'coordinator').length || 0 }
    ];

    // Process application status
    const applicationStatus = [
      { name: 'Pending', value: events.filter(e => e.status === 'pending').length || 0 },
      { name: 'Accepted', value: events.filter(e => e.status === 'accepted').length || 0 },
      { name: 'Completed', value: events.filter(e => e.status === 'completed').length || 0 },
      { name: 'Rejected', value: events.filter(e => e.status === 'rejected').length || 0 }
    ];

    setVisualData({
      schoolPriorities,
      userRoles,
      applicationStatus
    });
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-home">Error: {error}</div>;
  }

  return (
    <div className="dashboard-home">
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p>{stats.totalEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Applications</h3>
          <p>{stats.pendingApplications}</p>
        </div>
        <div className="stat-card">
          <h3>Active Guides</h3>
          <p>{stats.activeGuides}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Tours</h3>
          <p>{stats.completedTours}</p>
        </div>
      </div>

      <div className="visualizations-grid">
        {/* School Priority Distribution */}
        <div className="chart-card">
          <h3>School Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visualData.schoolPriorities}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {visualData.schoolPriorities.map((entry, index) => (
                  <Cell key={index} fill={['#0088FE', '#00C49F', '#FFBB28'][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Role Distribution */}
        <div className="chart-card">
          <h3>User Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visualData.userRoles}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Status Distribution */}
        <div className="chart-card">
          <h3>Application Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visualData.applicationStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {/* Add your recent activity list here */}
        <p>Coming soon...</p>
      </div>
    </div>
  );
};

export default DashboardHome;