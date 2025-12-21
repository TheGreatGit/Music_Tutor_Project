// thisfunction takes an array of bbokoing objects from the database and shapes them so the Calendar component can display them
// to display events, the Calednar needs them to have a title, a start time, and an end time. The DB objects have this but need reformatted
export const bookingShaper = (bookings) => {
  return bookings.map((booking) => {
    return {
      ...booking,
      //set new start date by usimg DB date in to Date() constructor
      start: new Date(booking?.booking_start_time),
      end: new Date(booking?.booking_end_time),
      title: "Lesson",
      isDraft: false,
    };
  });
};
