import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";

const Logo = () => {
  const { user } = useContext(UserContext);

  return (
    <Link
      to={user ? "/" : "/about"}
      className="group inline-flex items-center gap-3  transition-transform duration-200 hover:scale-[1.03] "
    >
      {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path
            fillRule="evenodd"
            d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z"
            clipRule="evenodd"
          />
        </svg> */}
      <img
        src="/player.png"
        className=" w-14 h-14 object-contain drop-shadow-sm  rounded-full"
      />
      <div className="leading-tight">
        <span className="italic text-xl font-semibold text-slate-900 tracking-tight">
          Music tutor app
        </span>
      </div>
    </Link>
  );
};

export default Logo;
