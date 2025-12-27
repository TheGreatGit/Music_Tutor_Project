select
b.booking_id,
b.tutor_id,
b.student_id,
b.instrument_id,
b.booking_start_time,
b.booking_end_time,
b.booking_status,
b.teaching_format_id,
b.teaching_type_id,
b.skill_level_id
from bookings as b
where b.tutor_id = $1;