select 
au.user_id,
r.role_name as role,
-- t.tutor_id,
t.first_name,
t.last_name,
au.email,
c.city_name,

-- begin aggreating results that mught give multiple columns
-- some currently only have 1 result, but schema might change so use string_agg
STRING_AGG(DISTINCT ucd.contact_info, ',') AS contacts,
STRING_AGG(DISTINCT i.instrument_name, ',') as instruments,
STRING_AGG(DISTINCT sl.skill_level_name, ',') as skill_levels,
STRING_AGG(DISTINCT tf.teaching_format_name, ',') as teaching_formats,
STRING_AGG(DISTINCT tt.teaching_type_name, ',') as teaching_types

from tutors as t
left join app_users as au on au.user_id = t.user_id
left join cities as c on c.city_id = t.city_id
left join user_contact_details as ucd on ucd.user_id = au.user_id
left join roles as r on r.role_id = au.role_id
left join tutor_instruments as ti on ti.tutor_id = t.tutor_id
left join instruments as i on i.instrument_id = ti.instrument_id
left join tutor_teaching_levels as ttl on ttl.tutor_id = t.tutor_id
left join skill_levels as sl on sl.skill_level_id = ttl.skill_level_id
left join tutor_teaching_formats as ttf on ttf.tutor_id = t.tutor_id
left join teaching_format as tf on tf.teaching_format_id = ttf.teaching_format_id
left join tutor_teaching_types as ttt on ttt.tutor_id = t.tutor_id
left join teaching_type as tt on tt.teaching_type_id = ttt.teaching_type_id
group by
au.user_id,
r.role_name,
t.first_name,
t.last_name,
au.email,
c.city_name
order by au.user_id
