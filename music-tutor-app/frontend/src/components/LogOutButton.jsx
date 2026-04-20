import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

// added new onLogout prop in order to supply the logout button a prop to close the mobile menu after logout
const LogOutButton = ({onLogout}) => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/logout", {
        credentials: "include",
      });
    } catch (error) {
    } finally {
      // clear user details
      setUser(null);
      if(typeof onLogout === 'function'){
        // closes the hamburger menue on small screens post-logout rather than user having to do it manually
        onLogout();
      }
      navigate("/about");
    }
  };

  return (
    <button
      onClick={logout}
      className='px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 transition cursor-pointer'
    >
      Log out
    </button>
  );
};

export default LogOutButton;
