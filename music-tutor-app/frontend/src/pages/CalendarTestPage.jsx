// adapted from https://www.youtube.com/watch?v=lyRP_D0qCfk
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enGB from "date-fns/locale/en-GB";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";

// set the date presentation to UK format rather then US
const locales = {
  "en-GB": enGB,
};

// format the datepicker's popup to GB date format
registerLocale("en-GB", enGB);

// need to create a localizer from  the calander's datefnslocaliser and the date-fns package to integrate with the calendar to actually make it display and process dates properly
// the localizer is, effectively, a date-engine for react big calendar to use
// the calendar component will now use the functions in its localiser that were supplied from date-fns
// the datefnslocaliser is glue to put Calendar and date fns together for a functioning calendar
const localizer = dateFnsLocalizer({
  format, // formats dates from JS date object in to a formatted string to be displayed on screen
  parse, // turns formatted date string back in to a Date object i.e. opposite of format
  // ensure week starts on Monday for the current culture (en-GB)
  startOfWeek: (date)=>startOfWeek(date, {weekStartsOn: 1}), // returns the start of the week for a given date and sets Monday as the start of week
  getDay, // returns 0-7 for days of week which is used in creating and managing calendar events
  locales, // sets the locale to British English - as per above
});

const initialEvents = [
  {
    title: "Big Meeting",
    allDay: true,
    // months are 0-indexed!
    start: new Date(2025, 11, 3),
    end: new Date(2025, 11, 3),
  },
  {
    title: "Vacation",
    start: new Date(2025, 11, 4),
    end: new Date(2025, 11, 4),
  },
  {
    title: "Conference",
    start: new Date(2025, 11, 5),
    end: new Date(2025, 11, 5),
  },
];

const CalendarTestPage = () => {
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: null,
    end: null,
  });
  const [allEvents, setAllEvents] = useState(initialEvents);
  // set view for the Calendar component
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      alert("Please provide a title, start date, and end date.");
      return;
    }

    if (newEvent.end < newEvent.start) {
      alert("End date cannot be before start date.");
      return;
    }

    
    setAllEvents((prev) => [...prev, { ...newEvent}]);

    // reset newEvent back to default
    setNewEvent({ title: "", start: null, end: null });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Calendar</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Add new event</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Add event title..."
            className="w-[20%] min-w-[180px] border rounded-md px-2 py-1"
            value={newEvent.title}
            onChange={(e) =>
              // change event's title only
              setNewEvent({ ...newEvent, title: e.target.value })
            }
          />

          {/* relative added to a container for DatePicker component as the component's popup is absolute */}
          <div className="relative inline-block">
            <DatePicker
              placeholderText="Start date"
              dateFormat={"dd/MM/yyyy"}
              locale="en-GB"
              selected={newEvent.start}
              onChange={(start) =>
                setNewEvent((prev) => ({
                  ...prev,
                  start,
                  // if end is before new start, reset end
                  end: prev.end && prev.end < start ? start : prev.end,
                }))
              }
              className="border rounded-md px-2 py-1"
            />
          </div>

          <div className="relative inline-block">
            <DatePicker
              placeholderText="End date"
              dateFormat={"dd/MM/yyyy"}
              locale="en-GB"
              selected={newEvent.end}
              onChange={(end) => setNewEvent((prev) => ({ ...prev, end }))}
              className="border rounded-md px-2 py-1"
            />
          </div>

          <button
            onClick={handleAddEvent}
            className="px-3 py-1 border rounded-md cursor-pointer hover:bg-slate-100"
          >
            Add event
          </button>
        </div>
      </section>

      <section>
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          // bug fixes- work by getting react to control the inner-state of the Calendar component by tying it to react state
          // view and onView relate to the month/week/day/agenda buttons
          view={view} // 'view' prop determines the current mode of the calendar i.e. diplay on month, week, or day basis etc. 
          onView={(nextView) => setView(nextView)} // 'onView' prop supplies the 'nextView' value via the ()=> portion of arrow function and expects coder to supply the remainder of the function  so that the state that React is supplying viw the 'view' prop is updated
          date={currentDate}
          onNavigate={(nextDate)=> setCurrentDate(nextDate)}
          style={{ height: 600 }}
        />
      </section>
    </div>
  );
};

export default CalendarTestPage;
