select * 
from app_users
where LOWER(email) = LOWER($1);