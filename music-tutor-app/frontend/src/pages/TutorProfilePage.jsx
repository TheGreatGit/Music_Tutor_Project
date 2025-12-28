import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
import { Link } from "react-router-dom";
import FocusedTutorCard from "../components/FocusedTutorCard";
import BookingCalendar from "../components/BookingCalendar";
import { bookingShaper } from "../utils/bookingShaper.mjs";


const TutorProfilePage = () => {
  const { tutorId } = useParams();

  // a new function to parse tutorId param to see if it's valid before allowing any fetches based on it
  const parseTutorId = (id)=>{
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <1) return null;
    return parsedId;
  };

  const tutorIdParsed = parseTutorId(tutorId);

  const [tutor, setTutor] = useState(null);
  const { user, setUser } = useContext(UserContext);

  const [tutorBookings, setTutorBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  // new, uplifted booking-state object whose properties will be updated across this component and child components
  const [draftBooking, setDraftBooking] = useState({
    tutor_id: tutorIdParsed,
    student_id: user?.student_id,
    instrument_id: null, // will be set in the FocusedtutorCard component
    booking_start_time: null, // will be set in BookingCalendar component
    booking_end_time: null, // will be set in BookingCalendar component
    title: "Lesson",
    teaching_format_id: null, // will be set in the FocusedtutorCard component
    teaching_type_id: null, // will be set in the FocusedtutorCard component
    skill_level_id: null,// will be set in the FocusedtutorCard component
    isDraft: true // will be set to false in backend after appointment added to DB
  })

  // create a parent-component-level state mutator for the draftBooking that child components will use
  // the way this is coded means that children components will not accidentally erase the parts of the draft booking they don't change ( e.g. due to code mistake)
  // i.e. by using ..current, it guarantees that the other properties are kept unchanged and ...current meand only the relevant part is changed in a given mutator ( a button in the FocusedTutorCard component)
  // essemntially, this restricts the change they can make to the minimum necessary
  const updateDraftBooking = (update) =>{
    setDraftBooking((current)=> ({...current, ...update}))
  };
  
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null); // BREAK THIS IN TO SEPARATE ERRORS FOR THE DIFFERENT USE-EFFECTS? OR 1 SUPER-ERRPR OBJECT THAT HAS 3 PROPETITESFOR THE 3 FETCH ERROR POSSIBILITIES
  const [showCalendar, setShowCalendar] = useState(false);

  // a new use-effect to keep tutor id and student id always in-sync with the latest values. Not stricly needed now, but will be needed when I add user rehydration to preserve login after refrshing pages in browser
  useEffect(()=>{
    setDraftBooking((current)=>({
      ...current,
      tutor_id: tutorIdParsed || null,
      student_id: user?.student_id || null
    }));
  }, [tutorIdParsed, user?.student_id]);


  // fetch tutor info
  useEffect(() => {
    // prevent pointless fetch if :tutorId param is not a valid number
    if(!tutorIdParsed) return;

    const controller = new AbortController();

    const getTutor = async () => {
      setLoading(true);
      // clear any previous error state
      setErr(null);

      try {
        const res = await fetch(`http://localhost:3000/api/tutors/${tutorIdParsed}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch tutor");
        }

        const tutor = await res.json();
        //console.log("tutor is", tutor);
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
  }, [tutorIdParsed]);

  console.log("student is", user);

  // feth tutor's bookings
  useEffect(() => {
    if(!tutorIdParsed) return;
    const controller = new AbortController();

    const getTutorBookings = async () => {
      setLoading(true)
      setErr(null);
      try {
        const res = await fetch(`http://localhost:3000/api/bookings/tutors/${tutorIdParsed}`,{ credentials: "include", signal: controller.signal });
        if(!res.ok){
          throw new Error("Failed to fetch tutor's bookings");
        }
        const bookings = await res.json();
        setTutorBookings(bookings);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log('error in fetching tutor bookings');
          setErr(error.message || "Unknown error");
          setTutorBookings([]);
        }        
      } finally {
        setLoading(false)
      }
    };
    getTutorBookings();
    return ()=> controller.abort();
  }, [tutorIdParsed]);

  // useEffect for student/user bookiongs (WILL LIEKELY NEED AMENDED IN ORDER TO ALLOW TUTORS TO BOOK LESSONS WITH OTHER STUDENTS)
    useEffect(() => {
      if(!user || user.role !== "student" || !user.student_id || !user.user_id) return;

    const controller = new AbortController();

    const getUserBookings = async () => {
      setLoading(true)
      setErr(null);
      try {
        const res = await fetch(`http://localhost:3000/api/bookings/students/${user.student_id}`,{ credentials: "include", signal: controller.signal });
        if(!res.ok){
          throw new Error("Failed to fetch student's bookings");
        }
        const bookings = await res.json();
        setUserBookings(bookings);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log('error in fetching student bookings');
          setErr(error.message || "Unknown error");
          setUserBookings([]);
        }        
      } finally {
        setLoading(false)
      }
    };
    getUserBookings();
    return ()=> controller.abort();
    // using user.user_id as dependency as i might have a tutor logging in in future but as a student to book lessons with other tutors (would need DB refactor)
  }, [user?.user_id]);

  // this is passed doen to Calendar component as a prop
  // it will receive the draftEvent in the scope of the Calendar component where it is called
  const handleConfirmBooking = async(draftEvent) => {
    console.log('handleConfirmBooking draftEvent is', draftEvent);
    try {
          const res = await fetch('http://localhost:3000/api/bookings/makeBooking', {method: 'POST', credentials:'include', headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify(
      {
        ...draftBooking,
        // safety check with student id to ensure it's always the most recent one
        student_id: user?.student_id || null,
        // safety check with tutor id
        tutor_id: tutorIdParsed || draftBooking.tutor_id,
        // use built-in 'toISOstring' method to convert date object to string for sending to DB
        booking_start_time: draftEvent.booking_start_time.toISOString(),
        booking_end_time: draftEvent.booking_end_time.toISOString()
      }
    )});

    if(!res.ok){
       throw new Error('Error in booking');
    }
    const dbBooking = await res.json();
    // update the tutor bookings for the calendar in order to update display to include the newly booked appointment
    // the new booking doesn't need to be altred to have date objects for start and end time here as the bookingShaper() function does that later
    setTutorBookings((current)=> [...current, dbBooking]);
    } catch (error) {
      console.error('handleConfirmBooking error', error);
      // this will be caught by caller in BookingCalendar
      throw error;
    }

  };

const handleCancelBooking = async(selectedEvent) => {
    // if (!selectedEvent) return;

    // // don't allow cancellation of draft bookings
    // if (selectedEvent.isDraft) return;

    // const ok = window.confirm(
    //   `${selectedEvent.title || "Lesson"}\n` +
    //     `Date: ${formatDate(selectedEvent.start)}\n` +
    //     `Start: ${formatTime(selectedEvent.start)}\n` +
    //     `End: ${formatTime(selectedEvent.end)}\n` +
    //     `Are you sure you want to cancel this booking?`
    // );
    // if (!ok) return;
  };

  if (loading) return <p className="p-6">Loading tutor...</p>;
  if (err) return <p className="p-6 text-red-600">{err}</p>;
  if (!tutor) return <p className="p-6">Tutor not found</p>;

  // TRANSFORM TUTOR BOOKINGS INTO EVENT SHAPE THAT THE CALENDAR CAN DISPLAY AND PASS THE TRANSFORMED BOOKINGS AS A PROP
  const transformedBookings = bookingShaper(tutorBookings);
  // create bundled prop for the tutor and calendar child components
  const draftBookingBundle = {draftBooking, updateDraftBooking}

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-full max-w-xl">
            <FocusedTutorCard tutor={tutor} draftBookingBundle={draftBookingBundle}/>
          </div>

          <section className="w-full max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Availability and booking
            </h2>
            {user?.role === "student" ? (
              <>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2"
                  onClick={() => setShowCalendar((current) => !current)}
                >
                  {showCalendar ? "Close calendar" : "Show calendar"}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-700 ease-in-out 
                ${
                  showCalendar
                    ? "max-h-[1200px] opacity-100 mt-4"
                    : "max-h-0 opacity-0 mt-0"
                }`}
                >
                  <BookingCalendar
                    tutor={tutor}
                    user={user}
                    calendarEvents = {transformedBookings}
                    handleConfirmBooking = {handleConfirmBooking}
                    handleCancelBooking = {handleCancelBooking}
                    draftBookingBundle={draftBookingBundle}
                  />
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
