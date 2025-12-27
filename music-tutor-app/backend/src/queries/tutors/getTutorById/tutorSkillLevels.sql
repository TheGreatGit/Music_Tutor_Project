select
sl.skill_level_id,
sl.skill_level_name
from tutor_teaching_levels as ttl
join skill_levels as sl on sl.skill_level_id = ttl.skill_level_id
where ttl.tutor_id = $1