import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

import { motion } from "framer-motion";
import { FaCommentsDollar } from "react-icons/fa";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    studentCount: "15,000+",
    facultyCount: "1,000+",
    researchCount: "500+",
    internationalStudents: "2,000+",
    globalRanking: "Top 500",
    researchPublications: "1,200+"
  });

  const navigate = useNavigate();

  const pageTransition = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: -20
    }
  };

  const handleNavigation = (path, e) => {
    e.preventDefault();
    
    // First animate the button
    const button = e.currentTarget;
    button.classList.add('button-clicked');
    
    // Then animate the page transition
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkLoggedin(token); // Fetch events if logged in
    }
  }, []);
  const openEvents = (user) => {

    
    if (user.role === "coordinator") return window.location.href = (`/applications`)
    window.location.href = (`/events`)
  }
  // Fetch events from the backend
  const checkLoggedin = async (token) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = await response.json();
      if (response.status === 401) {
        setIsLoggedIn(false);
        localStorage.clear();
        window.location.reload();
      } else {
        openEvents(user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };


  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="main-wrapper"
    >
      {
        <>
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-title-container">
                <h1 
                  className="hero-title"
                  data-text="Bilkent Üniversitesi'ne Hoş Geldiniz"
                >
                  Bilkent Üniversitesi'ne Hoş Geldiniz
                </h1>
              </div>
              <p className="hero-subtitle">Geleceğinizi Şekillendirin</p>
              <div className="hero-buttons">
                <Link to="/admissions" className="hero-cta">Başvuru Yap</Link>
                <Link to="/virtual-tour" className="hero-secondary">Sanal Tur</Link>
              </div>
            </div>
          </section>

          <section className="action-cards-section">
            <div className="action-cards-container">
              <div className="action-card">
                <h2>Kampüs Ziyareti</h2>
                <p>
                  Kampüs ziyaretiniz boyunca etkinliklerimizden haberdar olabilir,
                  üniversitenin sunduğu fırsatları ve etkinlikleri yerinde
                  görebilirsiniz.
                </p>
               
                  <button 
                    className="action-button primary"
                    onClick={(e) => handleNavigation('/apply', e)}
                  >
                    <span className="button-text">Ziyaret Başvurusu</span>
                    <span className="button-icon">→</span>
                  </button>
          
              </div>

              <div className="action-card">
                <h2>Kariyer Fuarı</h2>
                <p>
                  Bilkent Kariyer Fuarı'nda şirketlerle tanışın, staj ve iş 
                  fırsatlarını keşfedin. Başvurunuzu hemen yapın!
                </p>
                <button 
                  className="action-button primary"
                  onClick={(e) => handleNavigation('/invite', e)}
                >
                  <span className="button-text">Fuar Başvurusu</span>
                  <span className="button-icon">→</span>
                </button>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <div className="stats-container">
              {Object.entries(stats).map(([key, value]) => (
                <div className="stat-card" key={key}>
                  <span className="stat-number">{value}</span>
                  <span className="stat-label">
                    {key === "studentCount" && "Öğrenci"}
                    {key === "facultyCount" && "Akademik Personel"}
                    {key === "researchCount" && "Araştırma Projesi"}
                    {key === "internationalStudents" && "Uluslararası Öğrenci"}
                    {key === "globalRanking" && "Dünya Sıralaması"}
                    {key === "researchPublications" && "Yıllık Yayın"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="featured-section">
            <div className="featured-container">
              <div className="featured-card">
                <h2>Akademik Mükemmeliyet</h2>
                <p>Türkiye'nin en iyi üniversitelerinden biri olarak, öğrencilerimize dünya standartlarında eğitim sunuyoruz.</p>
                <Link to="/academics" className="featured-link">Programları Keşfet →</Link>
              </div>
              <div className="featured-card">
                <h2>Araştırma ve İnovasyon</h2>
                <p>Cutting-edge araştırmalarımız ve inovasyon merkezlerimizle geleceği şekillendiriyoruz.</p>
                <Link to="/research" className="featured-link">Araştırmalarımız →</Link>
              </div>
              <div className="featured-card">
                <h2>Uluslararası İşbirlikleri</h2>
                <p>Dünya çapında 100+ üniversite ile değişim programları ve işbirlikleri.</p>
                <Link to="/international" className="featured-link">Detaylı Bilgi →</Link>
              </div>
            </div>
          </section>

          <section className="events-section">
            <div className="section-header">
              <h2>Yaklaşan Etkinlikler</h2>
              <Link to="/events" className="view-all">Tüm Etkinlikler →</Link>
            </div>
            <div className="events-grid">
              <div className="event-card">
                <div className="event-date">
                  <span className="day">15</span>
                  <span className="month">MAR</span>
                </div>
                <div className="event-content">
                  <h3>Bilkent TTO Teknoloji Günleri</h3>
                  <p>Yenilikçi projelerin sergilendiği teknoloji günleri başlıyor.</p>
                  <Link to="/events/tech-days" className="event-link">Detaylar →</Link>
                </div>
              </div>
              {/* Add more event cards */}
            </div>
          </section>

          <section className="news-section">
            <div className="section-header">
              <h2>Haberler ve Duyurular</h2>
              <Link to="/news" className="view-all">Tüm Haberler →</Link>
            </div>
            <div className="news-grid">
              <article className="news-card">
                <img src="/images/news1.jpg" alt="News" className="news-image" />
                <div className="news-content">
                  <span className="news-date">15 Mart 2024</span>
                  <h3>Bilkent Üniversitesi'nden Yeni Araştırma Merkezi</h3>
                  <p>Yapay Zeka ve Robotik alanında yeni araştırma merkezi açıldı.</p>
                  <Link to="/news/1" className="news-link">Devamını Oku →</Link>
                </div>
              </article>
              {/* Add more news cards */}
            </div>
          </section>

          <section className="campus-life-section">
            <div className="section-header">
              <h2>Kampüs Yaşamı</h2>
            </div>
            <div className="campus-grid">
              <Link to="/student-clubs" className="campus-card">
                <i className="fas fa-users"></i>
                <h3>Öğrenci Kulüpleri</h3>
                <p>100+ aktif öğrenci kulübü</p>
              </Link>
              <Link to="/sports" className="campus-card">
                <i className="fas fa-running"></i>
                <h3>Spor Tesisleri</h3>
                <p>Modern spor kompleksleri</p>
              </Link>
              <Link to="/accommodation" className="campus-card">
                <i className="fas fa-home"></i>
                <h3>Yurt Olanakları</h3>
                <p>Konforlu yaşam alanları</p>
              </Link>
              <Link to="/culture-arts" className="campus-card">
                <i className="fas fa-theater-masks"></i>
                <h3>Kültür & Sanat</h3>
                <p>Etkinlik ve gösteriler</p>
              </Link>
            </div>
          </section>

          <section className="work-with-us-section">
            <div className="work-with-us-container">
              <h2>Want to work with us?</h2>
              <p>Join our team and contribute to our mission of excellence in education and research.</p>
              <button 
                className="action-button primary"
                onClick={(e) => handleNavigation('/traineeship-application', e)}
              >
                <span className="button-text">Apply Now</span>
                <span className="button-icon">→</span>
              </button>
            </div>
          </section>
        </>
      }
    </motion.div>
  );
};

export default Home;
