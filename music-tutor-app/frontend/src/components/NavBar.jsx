import { useContext } from "react";
import Logo from "./Logo";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import LogOutButton from "./LogOutButton";

const NavBar = () => {
  // run any hooks at top of component!

  // get user context!
  const { user } = useContext(UserContext);
  const navLinkClass = ({
    isActive,
  }) => `rounded-full px-4 py-2  font-medium transition-all duration-200
  ${isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`;

  //const navigate = useNavigate()

  return (
    <nav className="border border-b border-slate-200 items-center backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex-shrink-0">
          <Logo />
        </div>

        <ul className="flex items-center gap-2  rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm">
          {user && (
            <li className="m-2">
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
            </li>
          )}
          <li className="m-2">
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </li>
          <li className="m-2">
            <NavLink to="/findTutors" className={navLinkClass}>
              Find a tutor
            </NavLink>
          </li>
          <li className="m-2">
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </li>
        </ul>

        <div className=" flex items-center gap-3">
          {!user && (
            <NavLink
              to="/register"
              className="rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white transition hover:bg-indigo-600 shadow-sm"
            >
              Register
            </NavLink>
          )}

          {user ? (
            <LogOutButton />
          ) : (
            <NavLink
              to="/login"
              className="rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              Log in
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
