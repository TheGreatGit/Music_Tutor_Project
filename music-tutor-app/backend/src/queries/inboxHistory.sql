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
-- to get other user's name, join app_users table via matching other-user's id
join app_users as au on au.user_id = case 
	when cr.user_a_id = $1 then cr.user_b_id 
	else cr.user_a_id end
-- then join user tables via the same other-user id in order to find the other-user's name by supplying the data for the coalsece above
-- in  order to avoid looking at role id and role name tables, just join all tables with user data and use the coalesce above to find the other user
left join tutors as t on t.user_id = au.user_id 
left join students as s on s.user_id = au.user_id 
left join admins as a on a.user_id = au.user_id
left join chat_messages as cm on cm.message_id = cr.last_message_id -- join this in order to get the chat's most recent message content
where $1 in (cr.user_a_id, cr.user_b_id) -- isolates the search to rows in the chat_rooms table where the logged-in user was involved
-- get newest messages first
order by cr.last_message_at desc