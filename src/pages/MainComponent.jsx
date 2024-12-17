import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function MainComponent() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("Guest"); // Default username to "Guest"
  const [userData, setUserData] = useState(null); // State to hold user details
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("jwt"); // Retrieve JWT
    console.log("token", token);
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode the token
        setUsername(decoded.username || "User"); // Set the username or fallback to "User"
      } catch (error) {
        console.error("Error decoding JWT:", error);
        setUsername("Guest"); // Fallback if the JWT is invalid
      }

      // Fetch user details using the token
      const fetchUserDetails = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/auth/me`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            if (response.status === 401) {
              // Handle 401 - Unauthorized
              setMessage({
                type: "danger",
                text: "Session expired or unauthorized. Redirecting...",
              });
              // Redirect to home page ("/")
              navigate("/");
            } else {
              const errorData = await response.json();
              setMessage({
                type: "danger",
                text: errorData.message || "Failed to fetch user data.",
              });
            }
            return;
          }

          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setMessage({
            type: "danger",
            text: "Something went wrong while fetching user data.",
          });
        }
      };

      fetchUserDetails();
    } else {
      console.warn("No JWT found in localStorage.");
    }
  }, []);

  return (
    <>
      <nav>
        <p>Welcome, {userData?.username}</p>
      </nav>
      <main>
        {/* Display user details */}
        {userData ? (
          <div>
            <p>Email: {userData.email}</p>
            <p>City: {userData.city}</p>
            <p>Age: {userData.age}</p>
            {/* Add other user details as needed */}
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
        <p>Recommendations and matches will appear here.</p>
      </main>
    </>
  );
}

export default MainComponent;
