// adapted from https://www.youtube.com/watch?v=lyRP_D0qCfk

//SEE THE 'CALENDARTESTPAGE' page for extra explanatory notes of the functions and Calendar component configuration
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enGB from "date-fns/locale/en-GB";
import "react-big-calendar/lib/css/react-big-calendar.css";
// import "react-datepicker/dist/react-datepicker.css";
import { useState, useRef } from "react";

// set the date presentation to UK format rather then US
const locales = {
  "en-GB": enGB,
};

// create the localsisr / date engoine for the Calendar component to work
const localizer = dateFnsLocalizer({
  format,
  parse,
  getDay,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  locales,
});

// create min and max times for Calendar component to display- the actual date is irrelevant.
const MIN_TIME = new Date(2025, 7, 28, 8, 0, 0); // 8am
const MAX_TIME = new Date(2025, 7, 28, 21, 0, 0); // 9pm

const BookingCalendar = ({
  tutor,
  user,
  calendarEvents,
  handleConfirmBooking,
  handleCancelBooking,
  draftBookingBundle,
}) => {
  console.log("passed in ", tutor, user);
  const clientIdRef = useRef(1); // for generating a tempiray id so frontend can do checks prior to booking appoitments

  // set up the Calendar's default view setting and the date it defaults to focusing on
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // unbundle/deconstruct the draft event state from props
  // the draft event is filled-in in the handleSelectSlot event handler below
  const { draftBooking, updateDraftBooking } = draftBookingBundle;

  // for triggering differential rendering in eventsPropGetter(), for displaying lesson details panel, and for cancelling events
  const [selectedEvent, setSelectedEvent] = useState(null);

  // state for getting lesson details when clicking on the lesson in calendar, displaying loading status, displaying error status
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);
  const [bookingDetailsError, setBookingDetailsError] = useState(null);

  // check draft validity for rendering it in calandar
  // the client id is only a temporary field to allow frontend booking logic checks
  const canDisplayDraft =
    draftBooking?.isDraft &&
    draftBooking?.client_id &&
    draftBooking?.booking_start_time &&
    draftBooking?.booking_end_time;

  const canConfirmDraft =
    canDisplayDraft &&
    draftBooking?.tutor_id &&
    draftBooking?.student_id &&
    draftBooking?.instrument_id &&
    draftBooking?.teaching_format_id &&
    draftBooking?.teaching_type_id &&
    draftBooking?.skill_level_id &&
    draftBooking?.title

  // combine calendar events plus draft event so the draft event is displayed on the calendar
  const displayEvents = canDisplayDraft ? [...calendarEvents, draftBooking] : calendarEvents;

  // first, you add 'selectable' as a prop to the Calendar component which allows user to click and drag on Calendar; this info can be used to create draft event
  // then, you can get access to the 'onSelectSlot' event and create a handler like this:
  const handleSelectSlot = (slotInfo) => {
    // create a dummy booking  id so frontend can do booking validity checks
    const client_id = clientIdRef.current;
    clientIdRef.current += 1;
    updateDraftBooking({
      client_id,
      booking_start_time: slotInfo.start,
      booking_end_time: slotInfo.end,
      isDraft: true
    });
    // clear selected event to remove previous/current selection so you can create a new event/lesson after confirming this one
    setSelectedEvent(null);
    // clear newly added state to cler UI
    setSelectedBookingDetails(null);
    setBookingDetailsError(null);
    setBookingDetailsLoading(false);
  };

  // fires when a  confirmed Calendar event is clicked. It receives the event object as it is defined in the calendar (different to normal event handler event i.e. doesn't have .target property etc.)
  const handleSelectEvent = async(clickedEvent) => {
    console.log('clciked event in handleSelectEvent is', clickedEvent);
    if(clickedEvent.isDraft) return; // i.e. don't attempt fetch for draft event
    if(!clickedEvent?.booking_id) return;

    // this checks whether the event the handleSelectEvent receives is the same as the event held in 'selectedEvent' state; if it is, it clears selectedEvent state i.e. de-deselects the event
    // this code section basically allows users to 'toggle' an event on consecutive clicks
    if(isSameEvent(clickedEvent, selectedEvent)){
      setSelectedEvent(null); // for differnetial rendering in calendar
      setSelectedBookingDetails(null); 
      setBookingDetailsError(null);
      setBookingDetailsLoading(false);
      return;
    }

    setSelectedEvent(clickedEvent); // for diffeential rendering in calendar
    setBookingDetailsLoading(true); 
    setBookingDetailsError(null);
    setSelectedBookingDetails(null);

    try {
      const res = await fetch(`http://localhost:3000/api/bookings/getBookings/${clickedEvent.booking_id}`, {credentials: "include"});
      // trialling new codee pattern after fetches where the resposne is processed with .json() and, if it was a backend error response (!res.ok), the backend error message is accessed via data.message
      const data = await res.json();

      if(!res.ok){
        throw new Error(data?.message || 'Failed to fetch lesson details');
      }

      setSelectedBookingDetails(data);
      console.log('handleSelectEvent event details from DB are:', data);
      
    } catch (error) {
      setBookingDetailsError(error.message || 'Unknown error');
    }finally{
      setBookingDetailsLoading(false);
    }
  };

  // PRE-BOOKING CHECKS HAVE BEEN REFACTORED IN TO THIS SEPARATE FUNCTION THAT WILL RUN PRIOR TO ATTEMPTING TO BOOK VIA BACKEND ROUTE
  const preBookingChecks = (draftEvent) => {
    if (!draftEvent) {
      alert("Please select a valid timeslot");
      return false;
    }

    const now = new Date();
    const oneHourAsMilliseconds = 60 * 60 * 1000;
    const duration = draftEvent?.booking_end_time - draftEvent?.booking_start_time;

    if (draftEvent.booking_start_time < now) {
      alert("You cannot book appointments in the past");
      return false;
    }
    // maybe refactor to comply with DRY principle
    if (duration > oneHourAsMilliseconds) {
      alert("Lessons can only be booked for a maximum of one hour");
      return false;
    }
    if (!canDisplayDraft) {
      alert("Please select a valid timeslot.");
      return false;
    }

    // only works with Date objects
    if (draftEvent.booking_end_time < draftEvent.booking_start_time) {
      alert("End date cannot be before start date.");
      return false;
    }
    // hasOverlap() refactored to use calendarEvents (which only contains confirmed events) rather than displayEvents which will contain a draft event
    // this refactor means I don't have to skip over draftEvents with if(event.isDraft) return false
    const hasOverlap = calendarEvents.some((event) => {
      // .some() stops as soon as a true (according to the criteria being assessed) is found
      return isOverlapping(draftEvent, event);
    });

    if (hasOverlap) {
      alert("This timeslot overlaps an existing booking. Choose another time");
      return false;
    }

    return true;
  };

  const confirmDraftBooking = async () => {
    if (!preBookingChecks(draftBooking)) return;

    try {
      await handleConfirmBooking(draftBooking);
      clearSelection();
    } catch (bookingError) {
      alert(bookingError.message || "Booking failed");
    }
  };

  const confirmCancelBooking = async()=>{
    if(!selectedEvent || selectedEvent.isDraft) return;

    try {
      await handleCancelBooking(selectedEvent);
      // reset relevant state so that the event profile panel and info don't continue to show the cancelled booking's data
      setSelectedEvent(null);
      setSelectedBookingDetails(null);
      setBookingDetailsError(null);
      setBookingDetailsLoading(false);
    } catch (error) {
      setBookingDetailsError(error.message || 'Cancellation failed');
    }
  }

  const clearSelection = () => {
    updateDraftBooking({
    client_id: null,
    instrument_id: null, 
    booking_start_time: null,
    booking_end_time: null,
    title: "Lesson",
    teaching_format_id: null,
    teaching_type_id: null,
    skill_level_id: null,
    isDraft: true
    });
    setSelectedEvent(null);
    // clear new state too
    setSelectedBookingDetails(null);
    setBookingDetailsError(null);
    setBookingDetailsLoading(false);
  };

  const isSameEvent = (a, b) => {
    if (!a || !b) return false;

    // checks confirmed bookings
    if (a?.booking_id != null && b?.booking_id != null) {
      return a.booking_id === b.booking_id;
    }

    // checks draft bookings as they are being created on the frontend
    if (a?.client_id != null && b?.client_id != null) {
      return a.client_id === b.client_id;
    }

    return false;
  };

  const isOverlapping = (a, b) => {
    if (!a || !b) return false;
    return a.booking_start_time < b.booking_end_time && a.booking_end_time > b.booking_start_time;
  };

  // used to create different style for lessons and non-lessons
  // Calendar runs this function for each event in the Calendar as it's rendered
  const eventStyler = (event) => {
    const eventIsLesson = event.title?.toLowerCase().includes("lesson");
    const eventIsDraft = event.isDraft;
    const isSelected = isSameEvent(selectedEvent, event);

    let backgroundColor;
    let border;
    let boxShadow = "none";

    if (eventIsDraft) {
      backgroundColor = "#bfdbfe";
      border = "2px dashed #1d4ed8";
    } else if (eventIsLesson) {
      backgroundColor = "#3e2ce4ff";
      border = "none";
    } else {
      backgroundColor = "#66e291ff";
      border = "none";
    }

    if (isSelected) {
      boxShadow = "0 0 0 2px rgba(15,23,42,0.4)";
      backgroundColor = "#23197cff";
    }

    // return CSS
    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        border,
        padding: "2px 4px",
        boxShadow,
      },
    };
  };

  const formatDate = (value) => {
    // convert paramter to date
    const date = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(date.getTime())) return '_';

    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (value) => {
    // convert paramter to date
    const date = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(date.getTime())) return '_';

    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // helper function to get 0-hour of a given date in order to do comparisons in Calendar functions for styling
  const startOfGivenDay = (date) => {
    // take in a date object and recreate it by using its constituents in constructor  (the hours etc. default to 0 to create the day starting at midnight)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const dayStyler = (date) => {
    // as whole days are being styled here, comparisons are done on a date-midnight basis as we are wanting to know if a particular date is before midnight of today rather than before any particluar moment of today
    const todayStart = startOfGivenDay(new Date()); // today at midnight
    const calendarDayStart = startOfGivenDay(date); // a given calendar day at mnidnight-- not strictly necessary to convert to midnight-date but useful safety

    if (calendarDayStart < todayStart) {
      return {
        style: {
          backgroundColor: "#f8fafc",
          color: "#9ca3af",
        },
      };
    }
    // return empty object to tell dayPropGetter prop to use default styles
    return {};
  };

  const slotStyler = (date) => {
    // as actual hourly slots of the current day are being styled, the comparison is to check if a given slot in today is before the current time of today
    const now = new Date();
    if (date < now) {
      return {
        style: {
          backgroundColor: "#f1f5f9",
          color: "#9ca3af",
        },
      };
    }

    // return empty object to tell Calendar's slotPropGetter prop to use default style for slots in future
    return {};
  };
  return (
    <>
      <Calendar
        localizer={localizer}
        events={displayEvents}
        startAccessor="booking_start_time"
        endAccessor="booking_end_time"
        view={view}
        onView={(nextView) => setView(nextView)}
        date={currentDate}
        onNavigate={(nextDate) => setCurrentDate(nextDate)}
        style={{ height: 600 }}
        min={MIN_TIME}
        max={MAX_TIME}
        step={30}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyler}
        dayPropGetter={dayStyler}
        slotPropGetter={slotStyler}
      />
      <button
        onClick={confirmDraftBooking}
        disabled={!canConfirmDraft}
        className={`px-3 py-1 border rounded-md  ${
          canConfirmDraft
            ? "hover:bg-slate-100 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        Confirm booking
      </button>

      <button
        onClick={clearSelection}
        className="px-3 py-1 border rounded-md cursor-pointer hover:bg-slate-100"
      >
        Clear selection
      </button>

      {/* event details panel */}
      <div className="mt-6">
        <div className="border rounded-xl p-4 bg-white shadow-sm text-sm text-slate-700">
          <h2 className="text-xl font-medium mb-2">Lesson details</h2>

          {bookingDetailsLoading && (
            <p className="text-slate-500 mt-2">Loading booking details...</p>
          )}

          {bookingDetailsError && (
            <p className="text-red-600 mt-2">{bookingDetailsError}</p>
          )}

          {selectedBookingDetails ? (
            <>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold text-slate-900">Tutor: </span><span className="font-medium text-slate-500">{selectedBookingDetails?.tutor || "_"}</span></p>
                <p><span className="font-semibold text-slate-900">Student: </span><span className="font-medium text-slate-500">{selectedBookingDetails?.student || "_"}</span></p>
                <p><span className="font-semibold text-slate-900">Instrument: </span><span className="font-medium text-slate-500">{selectedBookingDetails?.instrument_name || "_"}</span></p>
                <p><span className="font-semibold text-slate-900">Teaching format: </span><span className="font-medium text-slate-500">{selectedBookingDetails?.teaching_format_name || "_"}</span></p>
                <p><span className="font-semibold text-slate-900">Teaching type: </span><span className="font-medium text-slate-500">{selectedBookingDetails?.teaching_type_name || ""}</span></p>
                <p><span className="font-semibold text-slate-900">Skill level: </span><span className="font-medium text-slate-500">{selectedBookingDetails?.skill_level_name || "_"}</span></p>
                <p><span className="font-semibold text-slate-900">Date: </span><span className="font-medium text-slate-500">{formatDate(selectedBookingDetails?.booking_start_time)}</span></p>
                <p><span className="font-semibold text-slate-900">Start: </span><span className="font-medium text-slate-500">{formatTime(selectedBookingDetails?.booking_start_time)}</span></p>
                <p><span className="font-semibold text-slate-900">End: </span><span className="font-medium text-slate-500">{formatTime(selectedBookingDetails?.booking_end_time)}</span></p>
              </div>

              {/* render cancel button only if event selected and isn't draft */}
              {selectedEvent && !selectedEvent.isDraft && (
                <button onClick={confirmCancelBooking} className="mt-3 px-3 py-1 border rounded-md cursor-pointer hover:bg-red-50 text-red-700 border-red-300 text-xs">
                  Cancel booking
                </button>
              )}
            </>
          ):(
            !bookingDetailsLoading && !bookingDetailsError && (
              <p className="text-sm text-slate-500">
                Click an event in the calendar to see its details here
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default BookingCalendar;
