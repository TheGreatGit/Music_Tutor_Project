import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import TutorHomeSection from "../components/TutorHomeSection";
import StudentHomeSection from "../components/StudentHomeSection";
import ChangePasswordPanel from "../components/ChangePasswordPanel";
import TutorUpcomingLessonsPanel from "../components/TutorUpcomingLessonsPanel";
import StudentUpcomingLessonsPanel from "../components/StudentUpcomingLessonsPanel";

const Home = () => {
  // grab user context and authLoading state
  // user has  user_id, tutor/student_id, role, first_name. last_name, display_name and email
  const { user, authLoading } = useContext(UserContext);
  const [activeSection, setActiveSection] = useState("edit-details");

  if (authLoading) {
    return <p>Loading user...</p>;
  }
  if (!user) {
    // maybe put another component in here later to give a basic landing page on first visit?
    return <p>Not logged in</p>;
  }

  const renderTutorPanel = () => {
    if (activeSection === "edit-details") {
      return <TutorHomeSection user={user} />;
    }

    if (activeSection === "change-password") {
      return <ChangePasswordPanel />;
    }

    if (activeSection === "upcoming-lessons") {
      return <TutorUpcomingLessonsPanel user={user}/>;
    }

    return null;
  };

  const renderStudentPanel = () => {
    if (activeSection === "edit-details") {
      return <StudentHomeSection user={user} />;
    }

    if (activeSection === "change-password") {
      return <ChangePasswordPanel />;
    }

    if (activeSection === "upcoming-lessons") {
      return <StudentUpcomingLessonsPanel user={user}/>
    }

    return null;
  };

  return (
    <div className="mx-auto max-w-6xl py-6">

      {/* top header */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl text-slate-400">
            <img
              src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {user?.display_name}
            </h1>
            <p className="text-sm capitalize text-slate-600">{user?.role}</p>
            <p className="text-sm  text-slate-500">{user?.email}</p>
          </div>

        </div>
      </div>

      {/* side section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <div className="rounded-2xl bg-white p-3 shadow-lg">
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveSection("edit-details")}
              className={`rounded-lg px-4 py-3 text-left text-sm font-medium ${activeSection === "edit-details" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Edit details
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("change-password")}
              className={`rounded-lg px-4 py-3 text-left text-sm font-medium ${activeSection === "change-password" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Change Password
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("upcoming-lessons")}
              className={`rounded-lg px-4 py-3 text-left text-sm font-medium ${activeSection === "upcoming-lessons" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Upcoming lessons
            </button>
          </nav>
        </div>

      {/* presentation section */}
        <main className="rounded-2xl bg-white p-6 shadow-lg">
          {user?.role === "tutor" && renderTutorPanel()}
          {user?.role === "student" && renderStudentPanel()}
        </main>
      </div>
    </div>
  );
};


export default Home;
