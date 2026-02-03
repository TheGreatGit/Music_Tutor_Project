SELECT
au.user_id,
au.email,
r.role_name,
s.student_id,
t.tutor_id,
ad.admin_id,
au.password_hash,
t.first_name as tutor_first_name,
t.last_name as tutor_last_name,
s.first_name as student_first_name,
s.last_name as student_last_name,
ad.first_name as admin_first_name,
ad.last_name as admin_last_name
FROM app_users as au
left join admins as ad on ad.user_id = au.user_id
left join tutors as t on t.user_id = au.user_id
left join students as s on s.user_id = au.user_id
left join roles as r on r.role_id = au.role_id
WHERE au.user_id = $1
