select
tf.teaching_format_id,
tf.teaching_format_name
from tutor_teaching_formats as ttf
left join teaching_format as tf on tf.teaching_format_id = ttf.teaching_format_id
where ttf.tutor_id = $1