select
t.tutor_id,
t.first_name, 
t.last_name,
c.city_name as city,
--  BEGIN AGGREGATION OF DATA THAT WOULD CAUSE DUPLICATE ROWS by using string_agg function
-- Use distinct to only collect the different types of data (not strictly necessary but good practice)

-- teacher instruments- not strictly needed as teacher instrument is 1-1 but may change in future
STRING_AGG(DISTINCT i.instrument_name, ', ' ) as instruments,

--  teaching formats
STRING_AGG(DISTINCT tf.teaching_format_name, ', ' ) as teaching_formats,

-- teaching types
STRING_AGG(DISTINCT tt.teaching_type_name, ', ' ) as teaching_types,

-- teaching levels
STRING_AGG(DISTINCT s.skill_level_name, ', ' ) as tutor_skill_levels,

-- aggregate contacts (e.g. "email: x; mobile: y")
STRING_AGG(DISTINCT ct.contact_type || ': ' || tcd.contact_info, '; ') AS contacts

from tutors as t
left join cities as c on c.city_id = t.city_id
left join tutor_instruments as ti on ti.tutor_id = t.tutor_id
left join instruments as i on i.instrument_id = ti.instrument_id
left join tutor_teaching_formats as ttf on ttf.tutor_id = t.tutor_id
left join teaching_format as tf on tf.teaching_format_id = ttf.teaching_format_id
left join tutor_teaching_types as ttt on ttt.tutor_id = t.tutor_id
left join teaching_type as tt on tt.teaching_type_id = ttt.teaching_type_id
left join tutor_teaching_levels as ttl on ttl.tutor_id = t.tutor_id
left join skill_levels as s on s.skill_level_id = ttl.skill_level_id
left join tutor_contact_details as tcd ON t.tutor_id = tcd.tutor_id
left join contact_type as ct ON tcd.contact_type_id = ct.contact_type_id
-- REMEMEMBER THE GROUP-BY FOR STRING-AGG FUNCTION TO WORK -- include every column that is NOT in an aggregate
group by
t.tutor_id, t.first_name, t.last_name, c.city_name
order by t.tutor_id;

