update app_users
set password_hash = $1,
updated_at = now()
where user_id = $2;