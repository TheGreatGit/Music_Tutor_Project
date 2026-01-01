select
booking_id,
tutor_id,
student_id,
booking_start_time,
booking_end_time,
(tutor_id = $1) as tutor_conflict, -- boolean check which produces a column result of boolean type. This is checking if the tutor_id returned from the DB query equals the tutor_id supplied for the query; if so, then it's a conflict with at least the tutor's bookings.
(student_id = $2) as student_conflict -- these boolean checks are run after the 'where' clause
from bookings
where
booking_status = 1
and booking_start_time < $4
and booking_end_time > $3
and (tutor_id = $1 or student_id = $2)
limit 1 -- stop the query as soon as one conflicting appointment is found