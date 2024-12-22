import React, { useState, useEffect } from 'react';
import '../../../styles/CoordinatorPages/DashboardHome.css';
import { 
  BarChart,
  PieChart
} from '@mui/x-charts';
import TurkeyMap from 'turkey-map-react';

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
  const [recentActivity, setRecentActivity] = useState([]);
  const [cityData, setCityData] = useState({
    "ISTANBUL": 150,
    "ANKARA": 120,
    "IZMIR": 80,
    "BURSA": 45,
    "ANTALYA": 60,
    "ADANA": 30,
    // Add more cities as needed
  });

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
      await fetchRecentActivity(token);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async (token) => {
    try {
      const response = await fetch('http://localhost:3000/api/events/completed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const completedEvents = await response.json();
      
      // Sort by completion date and take the 5 most recent
      const sortedEvents = completedEvents
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 5);
      
      setRecentActivity(sortedEvents);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const processData = (schools, events, users) => {
    // Update main stats
    setStats({
      totalEvents: events.length || 0,
      pendingApplications: events.filter(event => event.status === 'pending').length || 0,
      activeGuides: users.filter(user => user.role === 'guide' && user.status === 'active').length || 0,
      completedTours: events.filter(event => event.status === 'completed-verified').length || 0
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
      { name: 'Completed', value: events.filter(e => e.status === 'completed-verified').length || 0 },
      { name: 'Rejected', value: events.filter(e => e.status === 'rejected').length || 0 }
    ];

    // Process city data for the map - convert to Title Case to match map data
    const cityApplications = {};
    events.forEach(event => {
      const city = event.city?.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      if (city) {
        cityApplications[city] = (cityApplications[city] || 0) + 1;
      }
    });
    setCityData(cityApplications);

    setVisualData({
      schoolPriorities,
      userRoles,
      applicationStatus
    });
  };

  const handleCityHover = ({ plateNumber, name }) => {
    const count = cityData[name] || 0;
    const total = Object.values(cityData).reduce((a, b) => a + b, 0);
    const percentage = total ? ((count / total) * 100).toFixed(1) : 0;
    
    return `${count}: ${count} applications (${percentage}% of total)`;
  };

  const handleHover = ({ name }) => {
    // Convert city names to match our data format
    const cityName = name.toUpperCase()
      .replace('İ', 'I')
      .replace('Ğ', 'G')
      .replace('Ü', 'U')
      .replace('Ş', 'S')
      .replace('Ç', 'C')
      .replace('Ö', 'O');
    
    const count = cityData[cityName] || 0;
    const total = Object.values(cityData).reduce((a, b) => a + b, 0);
    const percentage = total ? ((count / total) * 100).toFixed(1) : 0;
    
    return `${name}: ${count} başvuru (${percentage}%)`;
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

  // Transform data for MUI X Charts
  const pieChartData = visualData.schoolPriorities.map(item => ({
    id: item.name,
    value: item.value,
    label: item.name,
  }));

  const barChartUserRoles = {
    xAxis: [{ 
      data: visualData.userRoles.map(item => item.name),
      scaleType: 'band',
    }],
    series: [{
      data: visualData.userRoles.map(item => item.value),
      color: '#8884d8'
    }]
  };

  const barChartApplicationStatus = {
    xAxis: [{ 
      data: visualData.applicationStatus.map(item => item.name),
      scaleType: 'band',
    }],
    series: [{
      data: visualData.applicationStatus.map(item => item.value),
      color: '#82ca9d'
    }]
  };

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
        <div className="chart-card">
          <h3>School Priority Distribution</h3>
          <PieChart
            series={[{
              data: pieChartData,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30 },
            }]}
            height={300}
          />
        </div>

        <div className="chart-card">
          <h3>User Role Distribution</h3>
          <BarChart
            xAxis={barChartUserRoles.xAxis}
            series={barChartUserRoles.series}
            height={300}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </div>

        <div className="chart-card">
          <h3>Application Status Distribution</h3>
          <BarChart
            xAxis={barChartApplicationStatus.xAxis}
            series={barChartApplicationStatus.series}
            height={300}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </div>

        <div className="chart-card map-container">
          <h3>Application Distribution by City</h3>
          <TurkeyMap 
            hoverable={true}
            showTooltip={true}
            onHover={handleHover}
            customStyle={{
              idleColor: "#e0e0e0",
              hoverColor: "#5a67b3",
              hoverBorderColor: "#5a67b3"
            }}
          />
        </div>

        <div className="chart-card">
          <h3>Applications by City (Total: {Object.values(cityData).reduce((a, b) => a + b, 0)})</h3>
          <BarChart
            xAxis={[{
              data: Object.keys(cityData).sort((a, b) => cityData[b] - cityData[a]),
              scaleType: 'band',
            }]}
            series={[{
              data: Object.keys(cityData)
                .sort((a, b) => cityData[b] - cityData[a])
                .map(city => cityData[city]),
              color: '#82ca9d'
            }]}
            height={300}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((event) => (
              <div key={event._id} className="activity-item">
                <div className="activity-header">
                  <h3>{event.applicant?.name || "Unnamed Event"}</h3>
                  <span className="activity-date">
                    {new Date(event.visitDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="activity-details">
                  <p>
                    <strong>Location:</strong> {event.city}
                  </p>
                  <p>
                    <strong>Guide:</strong> {event.assignedUsers.map(user => user.name).join(', ')}
                  </p>
                  <p>
                    <strong>Rating:</strong> {event.rating ? 
                      <span className="rating">{'★'.repeat(Math.round(event.rating))}</span> 
                      : 'Not rated'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent activities</p>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;