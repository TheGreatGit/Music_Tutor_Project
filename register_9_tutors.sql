DO $$
DECLARE
  -- Fixed lookups (done once)
  v_fmt_online        SMALLINT;
  v_fmt_inperson      SMALLINT;
  v_type_individual   SMALLINT;
  v_type_group        SMALLINT;
  v_level_beginner    SMALLINT;
  v_level_intermed    SMALLINT;
  v_level_advanced    SMALLINT;
  v_level_prof        SMALLINT;
  v_contact_email     SMALLINT;
  v_contact_mobile    SMALLINT;

  -- Per-iteration values
  v_city_id           INTEGER;
  v_instr_id          INTEGER;
  v_tutor_id          INTEGER;

  -- Mobile counter to generate unique dummy numbers (11 digits)
  v_mobile_counter    INTEGER := 1;

  rec RECORD;
BEGIN
  -- One-time exact-name lookups
  SELECT teaching_format_id INTO v_fmt_online   FROM teaching_format WHERE teaching_format_name = 'online';
  SELECT teaching_format_id INTO v_fmt_inperson FROM teaching_format WHERE teaching_format_name = 'in_person';

  SELECT teaching_type_id  INTO v_type_individual FROM teaching_type WHERE teaching_type_name = 'individual';
  SELECT teaching_type_id  INTO v_type_group      FROM teaching_type WHERE teaching_type_name = 'group';

  SELECT skill_level_id INTO v_level_beginner FROM skill_levels WHERE skill_level_name = 'Beginner';
  SELECT skill_level_id INTO v_level_intermed FROM skill_levels WHERE skill_level_name = 'Intermediate';
  SELECT skill_level_id INTO v_level_advanced FROM skill_levels WHERE skill_level_name = 'Advanced';
  SELECT skill_level_id INTO v_level_prof     FROM skill_levels WHERE skill_level_name = 'Professional';

  SELECT contact_type_id INTO v_contact_email  FROM contact_type WHERE contact_type = 'email';
  SELECT contact_type_id INTO v_contact_mobile FROM contact_type WHERE contact_type = 'mobile';

  -- Safety checks
  IF v_fmt_online IS NULL OR v_fmt_inperson IS NULL THEN RAISE EXCEPTION 'Teaching formats missing'; END IF;
  IF v_type_individual IS NULL OR v_type_group IS NULL THEN RAISE EXCEPTION 'Teaching types missing'; END IF;
  IF v_level_beginner IS NULL OR v_level_intermed IS NULL OR v_level_advanced IS NULL OR v_level_prof IS NULL
    THEN RAISE EXCEPTION 'Skill levels missing'; END IF;
  IF v_contact_email IS NULL OR v_contact_mobile IS NULL THEN RAISE EXCEPTION 'Contact types missing'; END IF;

  -- Iterate over 9 tutors (city & instrument names are exact-case to match your tables)
  FOR rec IN
    SELECT *
    FROM (VALUES
      -- first_name , last_name ,   city       ,   instrument       , solo_only , include_prof
      ('Olivia'   , 'Brown'    , 'London'     , 'piano'            , false     , true ),
      ('Noah'     , 'Clarke'   , 'Manchester' , 'electric guitar'  , false     , false),
      ('Ava'      , 'Patel'    , 'London'     , 'voice'            , false     , false),
      ('Leo'      , 'Johnson'  , 'Manchester' , 'piano'            , false     , true ),
      ('Sophie'   , 'Ahmed'    , 'London'     , 'electric guitar'  , false     , false),
      ('Ethan'    , 'Lewis'    , 'Manchester' , 'voice'            , true      , false), -- solo-only
      ('Mia'      , 'Turner'   , 'London'     , 'piano'            , false     , false),
      ('Max'      , 'Thompson' , 'Manchester' , 'electric guitar'  , true      , false), -- solo-only
      ('Zoe'      , 'Martin'   , 'London'     , 'voice'            , false     , true )
    ) AS t(first_name, last_name, city_name, instrument_name, solo_only, include_prof)
  LOOP
    -- Look up city (Capitalised) and instrument (lowercase)
    SELECT city_id INTO v_city_id FROM cities WHERE city_name = rec.city_name;
    IF v_city_id IS NULL THEN RAISE EXCEPTION 'City "%" not found', rec.city_name; END IF;

    SELECT instrument_id INTO v_instr_id FROM instruments WHERE instrument_name = rec.instrument_name;
    IF v_instr_id IS NULL THEN RAISE EXCEPTION 'Instrument "%" not found', rec.instrument_name; END IF;

    -- Insert tutor
    INSERT INTO tutors (first_name, last_name, city_id)
    VALUES (rec.first_name, rec.last_name, v_city_id)
    RETURNING tutor_id INTO v_tutor_id;

    -- Contacts: email + unique dummy mobile
    INSERT INTO tutor_contact_details (tutor_id, contact_type_id, contact_info)
    VALUES
      (v_tutor_id, v_contact_email,  LOWER(rec.first_name || rec.last_name) || '@email.com'),
      (v_tutor_id, v_contact_mobile, '0770091' || LPAD(v_mobile_counter::text, 4, '0'));
    v_mobile_counter := v_mobile_counter + 1;

    -- Instrument
    INSERT INTO tutor_instruments (tutor_id, instrument_id)
    VALUES (v_tutor_id, v_instr_id);

    -- Formats: most should have both — here, all 9 have both (toggle here if you want fewer)
    INSERT INTO tutor_teaching_formats (tutor_id, teaching_format_id)
    VALUES (v_tutor_id, v_fmt_online), (v_tutor_id, v_fmt_inperson);

    -- Types: 7 with individual+group; 2 solo-only (individual only)
    IF rec.solo_only THEN
      INSERT INTO tutor_teaching_types (tutor_id, teaching_type_id)
      VALUES (v_tutor_id, v_type_individual);
    ELSE
      INSERT INTO tutor_teaching_types (tutor_id, teaching_type_id)
      VALUES (v_tutor_id, v_type_individual), (v_tutor_id, v_type_group);
    END IF;

    -- Levels: include Professional for 3; others up to Advanced
    IF rec.include_prof THEN
      INSERT INTO tutor_teaching_levels (tutor_id, skill_level_id)
      VALUES (v_tutor_id, v_level_beginner),
             (v_tutor_id, v_level_intermed),
             (v_tutor_id, v_level_advanced),
             (v_tutor_id, v_level_prof);
    ELSE
      INSERT INTO tutor_teaching_levels (tutor_id, skill_level_id)
      VALUES (v_tutor_id, v_level_beginner),
             (v_tutor_id, v_level_intermed),
             (v_tutor_id, v_level_advanced);
    END IF;
  END LOOP;
END $$;

-- DELETE FROM tutors
-- WHERE (first_name, last_name) IN (
--   ('Olivia','Brown'), ('Noah','Clarke'), ('Ava','Patel'),
--   ('Leo','Johnson'), ('Sophie','Ahmed'), ('Ethan','Lewis'),
--   ('Mia','Turner'), ('Max','Thompson'), ('Zoe','Martin')
-- );

-- DELETE FROM tutors
-- WHERE first_name = 'Adam' AND last_name = 'Smith';