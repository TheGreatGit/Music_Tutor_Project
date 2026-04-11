update bookings
set
    booking_status = 3,
    updated_at = NOW()
where 
    booking_id = $1
    AND (tutor_id = $2 OR student_id = $2)
    AND booking_status = 1
    AND booking_start_time > (NOW() + interval '24 hours')
returning booking_id, booking_status,  updated_at;