import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [sortOption, setSortOption] = useState("visitDate");
  const [showIndividualTours, setShowIndividualTours] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchEvents(token); // Fetch events if logged in
    }
  }, []);
  const openEventPage = (eventId) => {
    window.location.href = (`/events/${eventId}`)
  }
  // Fetch events from the backend
  const fetchEvents = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        setIsLoggedIn(false);
        localStorage.clear();
      } else {
        setIsLoggedIn(true);
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const sortEvents = (events, option) => {
    return [...events].sort((a, b) => {
      if (option === "applicant") {
        return a.applicant.localeCompare(b.applicant);
      } else if (option === "visitDate") {
        return new Date(a.visitDate) - new Date(b.visitDate);
      } else if (option === "requiredNumberOfGuides") {
        return b.requiredNumberOfGuides - a.requiredNumberOfGuides;
      }
      return 0;
    });
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredEvents = events.filter((event) => {
    if (showIndividualTours) {
      return event.__t === "IndividualTour";
    }
    return event.__t === "SchoolTour";
  });

  const toggleEventType = () => {
    setShowIndividualTours(!showIndividualTours);
  };

  const sortedEvents = sortEvents(filteredEvents, sortOption);

  const handleDecline = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "rejected"
          })
        }
      );

      if (response.ok) {
        window.location.reload()
        //const response2 = await response.changeStatus("rejected")
        //console.log(response2);
        
        //event.decline()
        // Remove the event from the local state
        //setEvents(events.filter((event) => event._id !== eventId));
      } else {
        console.error("Failed to decline application");
      }
    } catch (error) {
      console.error("Error declining application:", error);
    }
  };
  const handleAccept = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "accepted"
          })
        }
      );

      if (response.ok) {
        window.location.reload()
        //const response2 = await response.changeStatus("rejected")
        //console.log(response2);
        
        //event.decline()
        // Remove the event from the local state
        //setEvents(events.filter((event) => event._id !== eventId));
      } else {
        console.error("Failed to decline application");
      }
    } catch (error) {
      console.error("Error declining application:", error);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div className="event-applications">
          <h1>Current Event Applications</h1>

          <div className="filter-controls">
            <button onClick={toggleEventType} className="toggle-button">
              {showIndividualTours
                ? "Show School Tours"
                : "Show Individual Tours"}
            </button>

            <div className="sort-options">
              <label htmlFor="sort">Sort by:</label>
              <select id="sort" value={sortOption} onChange={handleSortChange}>
                <option value="visitDate">Visit Date</option>
                <option value="applicant">Applicant</option>
                <option value="requiredNumberOfGuides">Required Guides</option>
              </select>
            </div>
          </div>

          {sortedEvents.length > 0 ? (
            <table className="event-table">
              <thead>
                <tr>
                  {showIndividualTours ? (
                    <>
                      <th>High School</th>
                      <th>Student Name</th>
                    </>
                  ) : (
                    <>
                      <th>School Name</th>
                      <th>Contact Person</th>
                    </>
                  )}
                  <th>Event Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  {!showIndividualTours && <th>Student Count</th>}
                  <th>Required Guides</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((event) => {  
                  let isRejected = event.status === "rejected"
                  let isAccepted = event.status === "accepted"
                  let isPending = !isAccepted && !isRejected 

                  let className = isRejected ? "link rejected"  : "link"
                  className += isAccepted ? " accepted"  : ""
                  className += isPending? " pending" : ""
                return(
          
                  
                  <tr key={event._id} className={ className} onClick={()=>openEventPage(event._id)}>
                    
                    {showIndividualTours ? (
                      <>
                        <td>{event.studentHighSchool || "N/A"}</td>
                        <td>{event.studentName || "N/A"}</td>
                      </>
                    ) : (
                      <>
                        <td>{event.schoolName || "N/A"}</td>
                        <td>{event.contactPerson || "N/A"}</td>
                      </>
                    )}
                    <td>{event.typeStr}</td>
                    <td>{new Date(event.visitDate).toLocaleDateString()}</td>
                    <td>{new Date(event.visitDate).toLocaleTimeString()}</td>
                    <td>{event.city || event.location || "N/A"}</td>
                    {!showIndividualTours && (
                      <td>{event.studentCount || "N/A"}</td>
                    )}
                    <td>{event.requiredNumberOfGuides || 1}</td>
                    <td>{event.status.toUpperCase() || "pending"}</td>
                    <td>{event.additionalNotes || "N/A"}</td>
                    
                    <td onClick={(e) => e.stopPropagation()}>
                       { isPending && <button
                        onClick={(e) => {e.stopPropagation();    
                          handleDecline(event._id);}}
                        className="decline-button"
                      >
                        Decline
                      </button>}
                
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                       { isPending && <button
                        onClick={(e) => {e.stopPropagation();    
                          handleAccept(event._id);}}
                        className="decline-button"
                      >
                        Accept
                      </button>}
                
                    </td>



   
                  </tr>
              
                )})}
              </tbody>
            </table>
          ) : (
            <p className="no-events-message">
              No {showIndividualTours ? "individual tour" : "school tour"}{" "}
              applications found.
            </p>
          )}
        </div>
      ) : (
        <div className="home-container">
          <section className="home-welcome-section">
            <div className="home-text-container">
              <h1>Bilkent Üniversitesi Etkinlikleri</h1>
              <p>
                Kampüs ziyaretiniz boyunca etkinliklerimizden haberdar olabilir,
                üniversitenin sunduğu fırsatları ve etkinlikleri yerinde
                görebilirsiniz.
              </p>
              <Link to="/tours" className="home-cta-button">
                Etkinliklere Göz At
              </Link>
            </div>
          </section>
          <section className="home-info-section">
            <div className="home-info-container">
              <h2>Kampüs Ziyaretinizde Sizi Neler Bekliyor:</h2>
              <p>
                Kampüs ziyaretinize İktisadi, İdari ve Sosyal Bilimler Fakültesi
                önündeki tanıtımı alanında başlayacaksınız. Sizleri rehber
                öğrenciler karşılayacak. Hedeflediğiniz bölümlere ilişkin
                sorularınızı rehberlerimize yöneltebilecek, ilgi alanlarınızla
                eşleşebilecek başka eğitim programlarını da tanıma fırsatı elde
                edeceksiniz.
              </p>
              <p>
                Bu ziyaretlerin önemli bir özelliği de eğitimin yanı sıra
                üniversitenin diğer olanaklarına yönelik fikir edinebilmeniz
                olacak. Kampüsü gezmek isterseniz yine rehber öğrenciler size
                eşlik edecek. Kampüs turu öğrenci yurtlarından başlayacak ve
                yurtlar bölgesindeki spor salonuyla devam edecek. Daha sonra
                fakülte binaları ile kampüsün ana noktalarını görecek ve son
                olarak kütüphaneyi gezeceksiniz.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
