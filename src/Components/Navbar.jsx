import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { FaUserCheck, FaUserMd } from "react-icons/fa";
import "./Navbar/Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // State for admin
  const nav = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Check Firestore for user role
        const doctorDoc = await getDoc(doc(db, "doctors", user.uid));
        if (doctorDoc.exists()) {
          setRole("doctor");
        } else {
          setRole("user");
        }

        // Check if the user is admin
        if (user.email === "doctorthankyou2006@gmail.com") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setDropdown(false);
      nav("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="logo-name">Dr THANKYOU</span>
          </Link>
        </div>

        <div className="navbar-middle">
          <Link to="/" className="navbar-link">
            HOME
          </Link>
          <Link to="/alldoctors" className="navbar-link">
            DOCTORS
          </Link>
          <Link to="/about" className="navbar-link">
            ABOUT
          </Link>
          <Link to="/contact" className="navbar-link">
            CONTACT
          </Link>
          {role === "doctor" && (
            <Link to="/doctordashboard" className="navbar-link">
              Dashboard
            </Link>
          )}
          {role === "user" && (
            <Link to="/myappointments" className="navbar-link">
              My Appointments
            </Link>
          )}
          {isAdmin && (
            <Link to="/adminpannel" className="navbar-link">
              Admin Panel
            </Link>
          )}
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="navbar-dropdown">
              {role === "doctor" ? (
                <FaUserMd size={35} onClick={() => setDropdown(!dropdown)} />
              ) : (
                <FaUserCheck size={35} onClick={() => setDropdown(!dropdown)} />
              )}

              {dropdown && (
                <div className="dropdown-menu">
                  <Link
                    to={role === "doctor" ? "/profiledoctor" : "/profile"}
                    className="dropdown-item"
                  >
                    My Profile
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signup" className="navbar-button">
              Create Account
            </Link>
          )}
        </div>
      </nav>
      <hr />
    </>
  );
};

export default Navbar;
