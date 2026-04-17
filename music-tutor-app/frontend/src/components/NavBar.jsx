import { useContext, useState } from "react";
import Logo from "./Logo";
import { NavLink } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import LogOutButton from "./LogOutButton";

const NavBar = () => {
  // run any hooks at top of component!

  // get user context!
  const { user } = useContext(UserContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({
    isActive,
  }) => `rounded-full px-4 py-2  font-medium transition duration-200
  ${isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`;

  const mobileNavLinkClass = ({ isActive }) =>
    `text-center block rounded-xl px-4 py-3  font-medium transition duration-200 ${isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`;

  return (
    <nav>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex-shrink-0">
          <Logo />
        </div>

        <ul className="hidden md:flex items-center gap-2  rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm">
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

        <div className=" hidden md:flex items-center gap-3">
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

        {/* mobile menu for small screens */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="md:hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 transition "
        >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
        
       
        </button>
      </div>

      {mobileMenuOpen && (
        <div className=" border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {user && (
              <NavLink
                to="/"
                className={mobileNavLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
            )}

            <NavLink
              to="/about"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </NavLink>

            <NavLink
              to="/findTutors"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find a tutor
            </NavLink>

            <NavLink
              to="/contact"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </NavLink>

            <div className="mt-3 flex flex-col gap-2">
              {!user && (
                <>
                  <NavLink
                    to="/register"
                    className=" text-center rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white transition hover:bg-indigo-600 shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </NavLink>
                  <NavLink
                    to="/login"
                    className=" text-center rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </NavLink>
                </>
              )}

              {user && (
                <LogOutButton onLogout={() => setMobileMenuOpen(false)} />
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
