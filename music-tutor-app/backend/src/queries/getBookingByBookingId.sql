select 
b.booking_id,
-- b.tutor_id,
CONCAT(t.first_name, ' ', t.last_name) as tutor,
-- b.student_id,
CONCAT(s.first_name, ' ', s.last_name) as student,
-- b.instrument_id,
i.instrument_name,
b.booking_start_time,
b.booking_end_time,
-- b.booking_status,
-- b.teaching_format_id,
tf.teaching_format_name,
-- b.teaching_type_id,
tt.teaching_type_name,
-- b.skill_level_id,
sl.skill_level_name
from bookings as b
join tutors as t on t.tutor_id = b.tutor_id
join students as s on s.student_id = b.student_id
join instruments as i on i.instrument_id = b.instrument_id
join teaching_format as tf on tf.teaching_format_id = b.teaching_format_id
join teaching_type as tt on tt.teaching_type_id = b.teaching_type_id
join skill_levels as sl on sl.skill_level_id = b.skill_level_id
where b.booking_id = $1 AND b.booking_status = 1;