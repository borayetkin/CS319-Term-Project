import React, { useState } from "react";
import "../styles/UserSearch.css";
import { useEffect } from "react";
const UserSearch = ({ userType, onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/auth/user-search?type=${userType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch initial data");
        }
        const results = await response.json();
        setSearchResults(results);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchInitialData();
  }, [userType]);
  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/auth/user-search?type=${userType}&query=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to search users");
      }
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      setError(error.message);
    }
  };
  const personIconUrl =
    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

  return (
    <div className="user-search-overlay">
      <div className="user-search-container">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <h2>Search for {userType}</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search for ${userType}`}
        />
        <button onClick={handleSearch}>Search</button>
        {error && <p className="error">{error}</p>}
        <ul>
          {searchResults.map((user) => (
            <li key={user._id} onClick={() => onSelectUser(user._id)}>
              <div className="users">
                <div className="userinf">
                  <img
                    src={personIconUrl}
                    style={{ width: "30px", height: "30px" }}
                    alt="Profile"
                  />
                  {user.name}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserSearch;
