import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TutorCard from "../components/TutorCard";

const TutorProfilePage = () => {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

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
        console.log(tutor);
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

  if (loading) return <p classname="p-6">Loading tutor...</p>;
  if (err) return <p classname="p-6 text-red-600">{err}</p>;
  if (!tutor) return <p classname="p-6">Tutor not found</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-full max-w-xl">
            <TutorCard tutor={tutor} />
          </div>

          <section className="w-full max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Availability and booking
            </h2>

            <div className="text-sm text-slate-500">
              Calendar here
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TutorProfilePage;
