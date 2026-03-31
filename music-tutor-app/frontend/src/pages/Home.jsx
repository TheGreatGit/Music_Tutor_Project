import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import TutorHomeSection from "../components/TutorHomeSection";
import StudentHomeSection from "../components/StudentHomeSection";

const Home = () => {
  // grab user context and authLoading state
  // user has  user_id, tutor/student_id, role, first_name. last_name, display_name and email
  const { user, authLoading } = useContext(UserContext);

  if (authLoading) {
    return <p>Loading user...</p>;
  }
  if (!user) {
    // maybe put another component in here later to give a basic landing page
    return <p>Not logged in</p>;
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Home</h1>
        <p className="text-slate-800">
          Hello, {user?.role} {user?.display_name}
        </p>
      </div>

      {/* these components are just wrappers for the TutorCrud and StudentCrud components. */}
      {user?.role === "tutor" && <TutorHomeSection user={user} />}
      {user?.role === "student" && <StudentHomeSection user={user} />}
    </div>
  );
};

export default Home;
