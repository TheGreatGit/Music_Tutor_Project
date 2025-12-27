insert into bookings 
(tutor_id, 
student_id, 
instrument_id, 
booking_start_time,
booking_end_time,
booking_status,
teaching_format_id, 
teaching_type_id, 
skill_level_id)
values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
returning booking_id, tutor_id, student_id, instrument_id, booking_start_time, booking_end_time,teaching_format_id, teaching_type_id, skill_level_id, booking_status