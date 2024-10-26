import { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await axios.get('/api/courses');
      setCourses(res.data);
    };
    fetchCourses();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {courses.map(course => (
          <li key={course._id}>{course.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;