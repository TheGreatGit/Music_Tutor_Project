update bookings
set
booking_status = 3,
updated_at = NOW()
where booking_id = $1 AND booking_status = 1
returning booking_id, booking_status