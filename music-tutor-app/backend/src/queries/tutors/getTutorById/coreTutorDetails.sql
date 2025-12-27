select
au.user_id,
t.tutor_id,
r.role_name as role,
t.first_name,
t.last_name,
au.email,
c.city_name
from tutors as t
left join app_users as au on au.user_id = t.user_id
left join roles as r on r.role_id = au.role_id
left join cities as c on c.city_id = t.city_id
where t.tutor_id = $1
