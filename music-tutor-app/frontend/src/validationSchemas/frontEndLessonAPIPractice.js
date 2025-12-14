// booking object form:
const today = new Date();

// const booking = {
//   booking_id: null,
//   tutor_id: null,
//   student_id: null,
//   instrument_name: null,
//   teaching_format: null,
//   teaching_type: null,
//   booking_status: null,
//   start: null,
//   end: null,
//   title: null,
// };

let bookingRefSeed = 3;

let bookings = [
  {
    booking_id: 1,
    tutor_id: 1,
    student_id: 1,
    instrument_name: "electric guitar",
    teaching_format: "online",
    teaching_type: "individual",
    booking_status: "confirmed",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      11,
      0,
      0,
      0
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0,
      0
    ),
    title: "lesson"
  },
  {
    booking_id: 2,
    tutor_id: 2,
    student_id: 1,
    instrument_name: "piano",
    teaching_format: "online",
    teaching_type: "individual",
    booking_status: "confirmed",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0,
      0
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      13,
      0,
      0,
      0
    ),
    title: "lesson"
  },
];

export const getTutorEvents = async (tutorId) => {
  // simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  // get all of a particular tutor's bookings- regardless of student etc.
  // REMEMEBR TO CAST tutorId TO NUMBER AS FRONTEND SOURCE WILL HAVE IT AS STRING BUT JSON REPSONSE FROM DB WILL PRESERVE  NUMBER-TYPE FOR ANY NUMERIC DATA!
  return bookings.filter((booking) => Number(tutorId) === booking.tutor_id);
};

export const createBooking = async ({
  tutor_id,
  student_id,
  instrument_name,
  teaching_format,
  teaching_type,
  booking_status = "confirmed",
  start,
  end,
}) => {
  // simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newBooking = {
    booking_id: bookingRefSeed++,
    tutor_id,
    student_id,
    instrument_name,
    teaching_format,
    teaching_type,
    booking_status,
    start,
    end,
    title: "lesson"
  };

  bookings = [...bookings, newBooking];
  // return new booking for UI update
  return newBooking;
};

export const cancelBooking = async (bookingId) => {
  // simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const beforeCancelled = bookings.length;
  bookings = bookings.filter((booking) => booking.booking_id !== bookingId);
  // check for length -1 as surrogate for success
  return { success: bookings.length < beforeCancelled };
};
