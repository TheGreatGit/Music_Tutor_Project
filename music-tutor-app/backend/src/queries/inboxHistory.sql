select 
cr.room_id,
cr.room_key,
cr.last_message_id,
cr.last_message_at,
cm.message_content,
-- determine other-user-id. this is necessary because the chat_rooms table stores the lowest user id of the pair in user_a_id
case
	when cr.user_a_id = $1 then cr.user_b_id 
	else cr.user_a_id 
	end as other_user_id,
--
-- use coalesce in order to get first non-null result from tutor/user/admin table joins
coalesce( 
	t.first_name || ' ' || t.last_name, 
	s.first_name || ' ' || s.last_name, 
	a.first_name || ' ' || a.last_name ) as other_display_name 
from chat_rooms as cr
-- to get other user's name, join app_users table via matching user ids
join app_users as au on au.user_id = case 
	when cr.user_a_id = $1 then cr.user_b_id 
	else cr.user_a_id end
-- then join user tables via the same user id in order to find the name by supplying the data for the coalsece above
left join tutors as t on t.user_id = au.user_id 
left join students as s on s.user_id = au.user_id 
left join admins as a on a.user_id = au.user_id
left join chat_messages as cm on cm.message_id = cr.last_message_id
where $1 in (cr.user_a_id, cr.user_b_id)
-- get newest messages first
order by cr.last_message_at desc