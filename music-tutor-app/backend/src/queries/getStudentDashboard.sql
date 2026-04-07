select
s.user_id,
s.student_id,
r.role_name,
s.first_name,
s.last_name,
c.city_name,
au.email
from students as s
join  cities as c on c.city_id = s.city_id
join app_users au on au.user_id = s.user_id
join roles as r on r.role_id = au.role_id
where s.user_id = $1