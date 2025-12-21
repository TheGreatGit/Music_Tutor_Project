// adapted from https://www.youtube.com/watch?v=lyRP_D0qCfk

//SEE THE 'CALENDARTESTPAGE' page for extra explanatory notes of the functions and Calendar component configuration
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enGB from "date-fns/locale/en-GB";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
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

const BookingCalendar = ({tutor, user, calendarEvents , handleConfirmBooking, handleCancelBooking}) => {

  console.log("passed in ", tutor, user);
  const clientIdRef = useRef(1); // for generating a tempiray id so frontend can do checks prior to booking appoitments

  // set up the Calendar's default view setting and the date it defaults to focusing on
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // set up draft event state for obtaining the details of and checking validity of user's attempts at bookings
  // the draft event is filled-in in the handleSelectSlot event handler below
  const [draftEvent, setDraftEvent] = useState(null);
  
  // for triggering differential rendering in eventsPropGetter(), for displaying lesson details panel, and for cancelling events
  const [selectedEvent, setSelectedEvent] = useState(null);

  // draftEVent wont exist on inital render or after certain functions run so use ?. to rpevent crashes
  const isDraftValid =
    draftEvent?.client_id &&
    draftEvent?.title &&
    draftEvent?.tutor_id &&
    draftEvent?.student_id &&
    draftEvent?.instrument &&
    draftEvent?.start &&
    draftEvent?.end;

  // combine calendar events plus draft event so the draft event is displayed on the calendar
  const displayEvents = isDraftValid ? [...calendarEvents,  draftEvent ] : calendarEvents;

  // first, you add 'selectable' as a prop to the Calendar component which allows user to click and drag on Calendar; this info can be used to create draft event
  // then, you can get access to the 'onSelectSlot' event and create a handler like this:
  const handleSelectSlot = (slotInfo) => {
    // create a dummy booking  id so frontend can do booking validity checks
    const client_id = clientIdRef.current;
    clientIdRef.current += 1;

    setDraftEvent({
      client_id,
      title: "Lesson",
      tutor_id: tutor.tutor_id,
      student_id: user.student_id,
      instrument: tutor.instruments,
      start: slotInfo.start,
      end: slotInfo.end,
      isDraft: true,
    });
    // clear selected event to remove previous/current selection so you can create a new event/lesson after confirming this one
    setSelectedEvent(null);
  };

  // fires when a  confirmed Calendar event is clicked. It receives the event object as it is defined in the calendar (different to normal event handler event i.e. doesn't have .target property etc.)
  const handleSelectEvent = (event) => {
    console.log(event);
    if (event.isDraft) return;
    // used when clicking on a calendar event to toggle the event to being the selectedEvent or not- this triggers differential rendering via eventPropsGetter function below.
    setSelectedEvent((current) => (isSameEvent(current, event) ? null : event));
  };

  // PRE-BOOKING CHECKS HAVE BEEN REFACTORED IN TO THIS SEPARATE FUNCTION THAT WILL RUN PRIOR TO ATTEMPTING TO BOOK VIA BACKEND ROUTE
  const preBookingChecks = (draftEvent) => {
    if(!draftEvent){
      alert('Please select a valid timeslot');
      return false;
    }

    const now = new Date();
    const oneHourAsMilliseconds = 60 * 60 * 1000;
    const duration = draftEvent?.end - draftEvent?.start;

    if (draftEvent.start < now) {
      alert("You cannot book events in the past");
      return false;
    }
    // maybe refactor to comply with DRY principle
    if (duration > oneHourAsMilliseconds) {
      alert("Lessons can only be booked for a maximum of one hour");
      return false;
    }
    if (!isDraftValid) {
      alert("Please select a valid timeslot.");
      return false;
    }

    // only works with Date objects
    if (draftEvent.end < draftEvent.start) {
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

  const confirmDraftBooking = async()=>{
    if(!preBookingChecks(draftEvent)) return;

    try {
      await handleConfirmBooking(draftEvent);
      clearSelection()
    } catch (bookingError) {
      alert(bookingError.message || 'Booking failed');
    }
  };

  const clearSelection = () => {
    setDraftEvent(null);
    setSelectedEvent(null);
  };

  const isSameEvent = (a, b) => {
    if (!a || !b) return false;

    if (a?.booking_id !== null && b?.booking_id !== null) {
      return a.booking_id === b.booking_id;
    }

    if (a?.client_id !== null && b?.client_id !== null) {
      return a.client_id === b.client_id;
    }

    return false;
  };

  const isOverlapping = (a, b) => {
    if (!a || !b) return false;
    return a.start < b.end && a.end > b.start;
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

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
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
        startAccessor="start"
        endAccessor="end"
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
        disabled={!isDraftValid}
        className={`px-3 py-1 border rounded-md  ${
          isDraftValid
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
      <div className="mt-4 md:mt-0">
        {selectedEvent ? (
          <div className="border rounded-xl p-4 bg-white shadow-sm text-sm text-slate-700">
            <h2 className="text-lg font-medium mb-2">Event details</h2>

            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold text-slate-900">Lesson</span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Tutor: </span>
                <span className="font-medium text-slate-500">
                  {tutor?.first_name && tutor?.last_name
                    ? `${tutor.first_name} ${tutor.last_name}`
                    : "-"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Student: </span>
                <span className="font-medium text-slate-500">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : "-"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  Instrument:{" "}
                </span>
                <span className="font-medium text-slate-500">
                  {tutor?.instruments || "-"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Date: </span>
                <span className="font-medium text-slate-500">
                  {selectedEvent?.start ? formatDate(selectedEvent.start) : "-"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Start: </span>
                <span className="font-medium text-slate-500">
                  {selectedEvent?.start ? formatTime(selectedEvent.start) : "-"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">End: </span>
                <span className="font-medium text-slate-500">
                  {selectedEvent?.end ? formatTime(selectedEvent.end) : "-"}
                </span>
              </p>
            </div>

            {/* show cancel button for confirmed events only */}
            {!selectedEvent.isDraft && (
              <button
                onClick={()=>handleCancelBooking(selectedEvent)}
                className="mt-4 px-3 py-1 border rounded-md cursor-pointer hover:bg-red-50 text-red-700 border-red-300 text-xs"
              >
                Cancel booking
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Click an event in the calendar to see its details here
          </p>
        )}
      </div>
    </>
  );
};

export default BookingCalendar;
