import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TutorCard from "../components/TutorCard";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
import { Link } from "react-router-dom";
import BookingCalendar from "../components/BookingCalendar";

const TutorProfilePage = () => {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // fetch tutor
  useEffect(() => {
    const controller = new AbortController();

    const getTutor = async () => {
      setLoading(true);
      // clear any previous error state
      setErr(null);

      try {
        const res = await fetch(`http://localhost:3000/api/tutors/${tutorId}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch tutor");
        }

        const tutor = await res.json();
        console.log("tutor is", tutor);
        setTutor(tutor);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErr(error.message || "Unknown error");
          setTutor(null);
        }
      } finally {
        setLoading(false);
      }
    };
    getTutor();
    return () => controller.abort();
  }, [tutorId]);
  console.log("student is", user);

  if (loading) return <p className="p-6">Loading tutor...</p>;
  if (err) return <p className="p-6 text-red-600">{err}</p>;
  if (!tutor) return <p className="p-6">Tutor not found</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-full max-w-xl">
            <TutorCard tutor={tutor} />
          </div>

          <section className="w-full max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Availability and booking
            </h2>
            {user?.role==='student' ? (
              <>
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2" onClick={()=>setShowCalendar((current)=> !current)}>{showCalendar ? 'Close calendar' : 'Show calendar'}</button>
              <div className={`overflow-hidden transition-all duration-700 ease-in-out 
                ${showCalendar ? 'max-h-[1200px] opacity-100 mt-4':'max-h-0 opacity-0 mt-0'}`}>
                  <BookingCalendar tutor={tutor} user={user}/>
              </div>
              </>
            ) : (
              <p>
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 
                 hover:text-indigo-800 transition"
                >
                  Log in
                </Link>{" "}
                to book a lesson
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TutorProfilePage;
