import React, { useEffect, useState } from "react";
import StudentCrudForm from "./StudentCrudForm";

const StudentHomeSection = ({ user }) => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  //use effect to get all the user's profile info as the user object is not detailed enough
  useEffect(() => {
    if (!user) {
      setStudentProfile(null);
      return;
    }
    const controller = new AbortController();

    const getStudentProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);

      try {
        const res = await fetch("http://localhost:3000/api/students/me", {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Student profile not fetched :(");
        }
        setStudentProfile(data);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Student profile fetch aborted");
        } else {
          setProfileError(error?.message || "Error in loading profile");
          setStudentProfile(null);
        }
      } finally {
        setProfileLoading(false);
      }
    };
    getStudentProfile();
    return () => controller.abort();
  }, [user?.user_id]);

  if(profileLoading){
    return <p>Loading student profile... </p>
  }
  if(profileError){
    return <p className="text-red-600">{profileError}</p>
  }

  if(!studentProfile){
    <p>No student profile found</p>
  }
  return <StudentCrudForm studentProfile={studentProfile}/>;
};

export default StudentHomeSection;
