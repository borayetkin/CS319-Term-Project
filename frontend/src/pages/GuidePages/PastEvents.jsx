import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../../styles/GuidePages/Events.css'
const AssignedEvents = () => {
    const [completedEvents, setCompletedEvents] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchCompletedEvents(token);
        }
    }, []);
    const fetchCompletedEvents = async (token) => {
        try {
           
            const response = await fetch(
                "http://localhost:3000/api/events/user",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.ok) {
                
                const data = await response.json();

                const pastEvents = data.filter(event => new Date(event.visitDate) < new Date());

                setCompletedEvents(pastEvents);
            } else {
                setMessage('Failed to fetch completed events.');
            }
        } catch (error) {
            setMessage('Error fetching completed events: ' + error.message);
        }
    };
    const handleMarkCompleted = async (eventId) => {
      const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:3000/api/events/${eventId}/complete`, {
                method: 'POST', headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                setCompletedEvents(prevEvents => prevEvents.map(event =>
                    event._id === eventId ? { ...event, status: 'completed-non-verified' } : event
                ));
            } else {
                setMessage('Failed to mark event as completed.');
            }
        } catch (error) {
            setMessage('Error marking event as completed: ' + error.message);
        }
    };
    const handleMarkCanceled = async (eventId) => {
      const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:3000/api/events/${eventId}/cancel`, {
                method: 'POST', headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                setCompletedEvents(prevEvents => prevEvents.map(event =>
                    event._id === eventId ? { ...event, status: 'canceled-non-verified' } : event
                ));
            } else {
                setMessage('Failed to mark event as canceled.');
            }
        } catch (error) {
            setMessage('Error marking event as canceled: ' + error.message);
        }
    };
    const takeBackAction = async (eventId) => {
      const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:3000/api/events/${eventId}/take-back`, {
                method: 'POST', headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                setCompletedEvents(prevEvents => prevEvents.map(event =>
                    event._id === eventId ? { ...event, status: 'accepted' } : event
                ));
            } else {
                setMessage('Failed to mark event as canceled.');
            }
        } catch (error) {
            setMessage('Error marking event as canceled: ' + error.message);
        }
    };

    return (
        <div className="events-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Assigned Past Events</h1>
                <Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/assigned-events`} className="view-details">
                    <button style={{ width: 'auto' }}>
                        View Assigned Events
                    </button>
                </Link>
            </div>

            {message && <p>{message}</p>}
            {completedEvents.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {completedEvents.map((event) => (
                            <tr key={event._id}>
                                <td>{event.applicant.name || "N/A"}</td>
                                <td>{new Date(event.visitDate).toLocaleDateString()}</td>
                                <td>{new Date(event.visitDate).toLocaleTimeString()}</td>

                                <td>{event.status.replace(/-/g, ' ')}</td>


                                <td>
                                    { (event.status === 'accepted') ? ( <>
                                        <button onClick={() => handleMarkCompleted(event._id)}>Mark Completed</button>
                                        <button onClick={() => handleMarkCanceled(event._id)}>Mark Canceled</button>
                                        </>
                                    ) : (
                                        <button onClick={() => takeBackAction(event._id)}>Cancel Mark</button>
                                       )
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No events assigned yet.</p>
            )}
        </div>
    );
};

export default AssignedEvents;
