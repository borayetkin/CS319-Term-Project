import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import "../styles/UsersPage.css"

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkLoggedin(token); // Fetch events if logged in
    }
  }, []);
  const openEvents = () => {
    window.location.href = (`/events`)
  }
  // Fetch events from the backend
  const checkLoggedin = async (token) => {
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
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };


  return (
    <div>
      {isLoggedIn ? (
          
          
          openEvents()
     
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
              <Link to="/apply" className="home-cta-button">
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
