select
i.instrument_id,
i.instrument_name
from tutor_instruments as ti
join instruments as i on i.instrument_id = ti.instrument_id where ti.tutor_id = $1;
