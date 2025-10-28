import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LogOutButton = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
    } finally {
      // clear user details
      setUser(null);
      navigate("/");
    }
  };

  return (
    <button
      onClick={logout}
      className="text-white px-3  rounded-3xl bg-black  hover:bg-sky-600"
    >
      Log out
    </button>
  );
};

export default LogOutButton;
