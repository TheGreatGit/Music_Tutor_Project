import React from "react";
import { useEffect, useState } from "react";
import TutorCard from "../components/TutorCard";

const FindTutors = () => {
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const getTutors = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/tutors", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch tutors");
        }
        const data = await res.json();
        console.log(data);
        setTutors(data);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("fetch aborted");
        } else {
          console.log(error);
        }
      }
    };
    getTutors();
    return () => controller.abort();
  }, []);

  return (
    <div className="p-6">
      {tutors.length === 0 ? (
        <p>Loading tutors...</p>
      ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
         {tutors.map((tutor) => <TutorCard tutor={tutor} key={tutor.tutor_id} />)}
       </div>
      )}
    </div>
  );
};

export default FindTutors;
