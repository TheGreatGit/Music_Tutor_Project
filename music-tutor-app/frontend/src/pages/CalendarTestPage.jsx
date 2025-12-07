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
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), // returns the start of the week for a given date and sets Monday as the start of week
  getDay, // returns 0-7 for days of week which is used in creating and managing calendar events
  locales, // sets the locale to British English - as per above
});

// create min and max times for Calendar component to display
const MIN_TIME = new Date(2025, 7, 28, 8, 0, 0); // 8am
const MAX_TIME = new Date(2025, 7, 28, 21, 0, 0); // 9pm

const initialEvents = [
  // event start and end times must be a JS date object
  {
    title: "Big Meeting",
    //allDay: true,
    // months are 0-indexed!
    start: new Date(2025, 11, 3),
    end: new Date(2025, 11, 3),
  },
  {
    title: "Vacation",
    start: new Date(2025, 11, 4),
    end: new Date(2025, 11, 4),
    allDay: true,
  },
  {
    title: "Conference",
    start: new Date(2025, 11, 5),
    end: new Date(2025, 11, 5),
  },
];

const CalendarTestPage = () => {
  const [draftEvent, setDraftEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);
  const [allEvents, setAllEvents] = useState(initialEvents);

  // set view style for the Calendar component's view prop by linking it to react state
  const [view, setView] = useState("week");
  // set the focus point for the calendar display by linking its date prop to react state
  const [currentDate, setCurrentDate] = useState(new Date());

  const isDraftValid = draftEvent?.title && draftEvent?.start && draftEvent?.end;

  // combine confimred events plus draft event
  const displayEvents = isDraftValid ? [... allEvents, {...draftEvent, isDraft: true}]: allEvents


  // first, you add 'selectable' as a prop to the Calendar component which allows user to click and drag on Calendar to create slots
  // then, you can get access to the 'onSelectSlot' event and create a handler like this:
  // This function creates a new event which can then be added by clicking 'add event' button
  const handleSelectSlot = (slotInfo) => {
    const oneHourAsMilliseconds = 60 * 60 * 1000;
    const duration = slotInfo.end - slotInfo.start;

    if(duration > oneHourAsMilliseconds){
      alert('Lessons can only be booked for a maximum of one hour');
      return;
    }
    console.log("slot info: ", slotInfo);

    setDraftEvent({
      title: "Lesson",
      start: slotInfo.start,
      end: slotInfo.end,
    });

    // use the lines below if appointments are selected via DatePicker component
    // setCurrentDate(slotInfo.start);
    // setView("day");
  };

  // triggers when 'Confirm booking' button is clicked
  const handleConfirmBooking = () => {
    if (!isDraftValid) {
      alert("Please select a valid timeslot.");
      return;
    }

    // only works with Date objects
    if (draftEvent.end < draftEvent.start) {
      alert("End date cannot be before start date.");
      return;
    }
    // draft event is valid therefore chnage to confirmed event
    const confirmedEvent = {...draftEvent, isDraft:false};
    // use the confirmed event to set a new event that will be added to events array
    setNewEvent(confirmedEvent)
    // add the confirmed event to the events array
    setAllEvents((prev) => [...prev, { ...confirmedEvent }]);

    // reset draft event back to default
    setDraftEvent(null);
  };

  const clearSelection = ()=>{
    setDraftEvent(null);
    setNewEvent(null);
  };

  // fires when a  confirmed Calendar event is clicked on
  const handleSelectEvent = (event) => {
    if(event.isDraft) return;

    alert(
      `Event: ${event.title} \nStart: ${event.start.toLocaleString(
        "en-GB"
      )} \nEnd: ${event.end.toLocaleString("en-GB")}`
    );
  };

  // used to create different style for lessons and non-lessons
  const eventPropGetter = (event) => {
    const eventIsLesson = event.title?.toLowerCase().includes("lesson");
    const eventIsDraft = event.isDraft;

    let backgroundColor;
    let border;

    if(eventIsDraft){
      backgroundColor= '#bfdbfe';
      border='2px dashed #1d4ed8';
    }else if(eventIsLesson){
      backgroundColor = '#3e2ce4ff'
      border='none';
    }else{
      backgroundColor='#66e291ff';
      border='none';
    }

    // return CSS
    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        border,
        padding: "2px 4px",
      },
    };
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Calendar</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Book a lesson</h2>
        <p className="mb-2 text-sm text-slate-600">Drag on the calendar to select a timeslot</p>
        <div className="flex flex-wrap items-center gap-3">
          {/* <input
            type="text"
            placeholder="Add event title..."
            className="w-[20%] min-w-[180px] border rounded-md px-2 py-1 placeholder-gray-400"
            value={newEvent.title}
            onChange={(e) =>
              // change event's title only
              setNewEvent({ ...newEvent, title: e.target.value })
            }
          /> */}

          {/* relative added to a container for DatePicker component as the component's popup is absolute
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
                  // if end is before new start, reset end to be the same as start
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
              onChange={(end) => setNewEvent((prev) => ({ ...prev, end }))} // habdleAddEVent has logic to ensure end is not before beginning
              className="border rounded-md px-2 py-1"
            />
          </div> */}

          <button
            onClick={handleConfirmBooking}
            disabled={!isDraftValid}
            className={`px-3 py-1 border rounded-md  ${isDraftValid? "hover:bg-slate-100 cursor-pointer": "opacity-50 cursor-not-allowed"}`}
          >
            Confirm booking
          </button>

          <button onClick={clearSelection} className="px-3 py-1 border rounded-md cursor-pointer hover:bg-slate-100">
            Clear selection
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600 h-[1rem]">
          {isDraftValid
            ? `Selected slot: ${draftEvent?.start.toLocaleString(
                "en-GB"
              )} - ${draftEvent?.end.toLocaleString("en-GB")}`
            : ""}
        </p>
      </section>

      <section>
        <Calendar
          localizer={localizer}
          events={displayEvents}
          startAccessor="start" // i.e. event.start proeprty
          endAccessor="end"
          // bug fixes- work by getting react to control the inner-state of the Calendar component by tying it to react state
          // view and onView relate to the month/week/day/agenda buttons
          view={view} // 'view' prop determines the current display mode of the calendar i.e. diplay on month, week, or day basis etc.
          onView={(nextView) => setView(nextView)} // onView is triggered when any of the 'week','month','day','agenda' buttons are clicked. The cb function then links the triggered 'onView' property to the 'view' prop via react useState so the view updates on clicking and changes calendar display
          // date and onNavigate work together to have the 'today','back', and 'next' buttons chnage display
          date={currentDate}
          onNavigate={(nextDate) => setCurrentDate(nextDate)}
          style={{ height: 600 }}
          // limit the time displayed on the Calendar to between min and max
          min={MIN_TIME}
          max={MAX_TIME}
          step={30} // create 30-minute steps in Calendar
          selectable // this allows the Calendar slots to be clicakble/drag mouse over and fires the 'onSelectSlot' event
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent} // fires when a confirmed event in the Calendar is clicked e.g. use to display event info
          eventPropGetter={eventPropGetter}
        />
      </section>
    </div>
  ); 
};

export default CalendarTestPage;
