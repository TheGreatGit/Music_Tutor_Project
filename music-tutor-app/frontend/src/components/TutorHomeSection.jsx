import { useEffect, useState } from "react";
import TutorCrudForm from "./TutorCrudForm";

// this component really just acts as a wrapper that gets the tutor's details (just like FocusedTutorCard) 
// and feeds them in to the TutorCrudForm component
const TutorHomeSection = ({ user }) => {
  const [tutorProfile, setTutorProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // fetch tutor profile data
  useEffect(() => {
    // changed to user from user.tutor_id as the id is not being used anymore
    if (!user) {
      setTutorProfile(null);
      return;
    }
    const controller = new AbortController();

    const getTutorProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);

      try {
        // changed to the new '/me' site so that the frontend data is not being used for ids; it will use the authenticated user via token
        const res = await fetch(
          `http://localhost:3000/api/tutors/me`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch tutor profile");
        }
      
        setTutorProfile(data);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Tutor fetch aborted");
        } else {
          console.log("Tutor profile fetch error", error);
          setProfileError(error?.message);
          setTutorProfile(null);
        }
      } finally {
        setProfileLoading(false);
      }
    };

    getTutorProfile();

    return () => controller.abort();
  }, [user?.user_id]);

  // selectively render depending on result of tutor fetch
  if (profileLoading) {
    return <p>Loading tutor profile...</p>;
  }

  if (profileError) {
    return <p className="text-red-600">{profileError}</p>;
  }

  if (!tutorProfile) {
    return <p>No tutor profile found</p>;
  }

  return <TutorCrudForm tutorProfile={tutorProfile} />;
};

export default TutorHomeSection;
