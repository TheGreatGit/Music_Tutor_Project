-- start a postgres 'do' block as it can store variables and handle conditional logic which is required for tutor insertion
DO $$
-- declare placeholder variables that will hold required IDs from different tables
DECLARE
  v_tutor_id         INTEGER;

  v_city_id          INTEGER;
  v_instr_id         INTEGER;

  v_fmt_online_id    SMALLINT;
  v_fmt_inperson_id  SMALLINT;

  v_type_indiv_id    SMALLINT;

  v_level_beginner   SMALLINT;
  v_level_intermed   SMALLINT;
  v_level_advanced   SMALLINT;

  v_email_type_id    SMALLINT;
  v_mobile_type_id   SMALLINT;

-- NOT a tranaaction beginning, but the beginning of procedural code in the 'do' block
BEGIN
  -- Get the required variable info from tables with data defined prior to any tutor insert
  SELECT city_id INTO v_city_id
  FROM cities
  WHERE city_name = 'London';

  SELECT instrument_id INTO v_instr_id
  FROM instruments
  WHERE instrument_name = 'electric guitar';

  SELECT teaching_format_id INTO v_fmt_online_id
  FROM teaching_format
  WHERE teaching_format_name = 'online';

  SELECT teaching_format_id INTO v_fmt_inperson_id
  FROM teaching_format
  WHERE teaching_format_name = 'in_person';

  SELECT teaching_type_id INTO v_type_indiv_id
  FROM teaching_type
  WHERE teaching_type_name = 'individual';

  SELECT contact_type_id INTO v_email_type_id
  FROM contact_type
  WHERE contact_type = 'email';

  SELECT contact_type_id INTO v_mobile_type_id
  FROM contact_type
  WHERE contact_type = 'mobile';

  SELECT skill_level_id INTO v_level_beginner
  FROM skill_levels
  WHERE skill_level_name = 'Beginner';

  SELECT skill_level_id INTO v_level_intermed
  FROM skill_levels
  WHERE skill_level_name = 'Intermediate';

  SELECT skill_level_id INTO v_level_advanced
  FROM skill_levels
  WHERE skill_level_name = 'Advanced';

  -- Fail fast if something is missing
  IF v_city_id IS NULL THEN RAISE EXCEPTION 'City "London" not found'; END IF;
  IF v_instr_id IS NULL THEN RAISE EXCEPTION 'Instrument "electric guitar" not found'; END IF;
  IF v_fmt_online_id IS NULL OR v_fmt_inperson_id IS NULL THEN RAISE EXCEPTION 'Teaching formats missing'; END IF;
  IF v_type_indiv_id IS NULL THEN RAISE EXCEPTION 'Teaching type "individual" missing'; END IF;
  IF v_email_type_id IS NULL OR v_mobile_type_id IS NULL THEN RAISE EXCEPTION 'Contact types missing'; END IF;
  IF v_level_beginner IS NULL OR v_level_intermed IS NULL OR v_level_advanced IS NULL THEN RAISE EXCEPTION 'One or more levels missing'; END IF;

-- now that all the required data is gathered, begin inserting tutor data
  -- Insert tutor (+ city)
  INSERT INTO tutors (first_name, last_name, city_id)
  VALUES ('Adam', 'Smith', v_city_id)
  RETURNING tutor_id INTO v_tutor_id; -- essential to return the tutor ID and store in a local variable as other tables will need  this

  -- Contacts
  INSERT INTO tutor_contact_details (tutor_id, contact_type_id, contact_info)
  VALUES
    (v_tutor_id, v_email_type_id,  'adamsmith@email.com'),
    (v_tutor_id, v_mobile_type_id, '07123456789');

  -- Instrument
  INSERT INTO tutor_instruments (tutor_id, instrument_id)
  VALUES (v_tutor_id, v_instr_id);

  -- Teaching formats (online + in_person)
  INSERT INTO tutor_teaching_formats (tutor_id, teaching_format_id)
  VALUES
    (v_tutor_id, v_fmt_online_id),
    (v_tutor_id, v_fmt_inperson_id);

  -- Teaching type (individual)
  INSERT INTO tutor_teaching_types (tutor_id, teaching_type_id)
  VALUES (v_tutor_id, v_type_indiv_id);

  -- Teaching levels (Beginner, Intermediate, Advanced)
  INSERT INTO tutor_teaching_levels (tutor_id, skill_level_id)
  VALUES
    (v_tutor_id, v_level_beginner),
    (v_tutor_id, v_level_intermed),
    (v_tutor_id, v_level_advanced);

  RAISE NOTICE 'Inserted tutor_id=%', v_tutor_id;
END $$;
