select distinct
tt.teaching_type_id,
tt.teaching_type_name
from tutor_teaching_types as ttt
join teaching_type as tt on tt.teaching_type_id = tt.teaching_type_id
where ttt.tutor_id = $1
order by tt.teaching_type_id
