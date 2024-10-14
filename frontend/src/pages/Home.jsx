// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <main>
        <section className="welcome-section">
          <h1>Welcome to Bilkent Tours!</h1>
          <p>Book and explore guided tours for high schools.</p>
          <Link to="/tours" className="cta-button">
            Book a Tour
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Home;
