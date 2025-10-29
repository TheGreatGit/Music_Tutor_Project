-- 1) Tutors
CREATE TABLE IF NOT EXISTS tutors (
  tutor_id    SERIAL PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Contact types
CREATE TABLE IF NOT EXISTS contact_type (
  contact_type_id SMALLSERIAL PRIMARY KEY,
  contact_type    TEXT NOT NULL UNIQUE
);

INSERT INTO contact_type (contact_type)
VALUES ('mobile'), ('email'), ('landline')
ON CONFLICT DO NOTHING;

-- 3) Tutor contact details
CREATE TABLE IF NOT EXISTS tutor_contact_details (
  tutor_contact_id SERIAL PRIMARY KEY,
  tutor_id         INTEGER  NOT NULL REFERENCES tutors(tutor_id) ON DELETE CASCADE,
  contact_type_id  SMALLINT NOT NULL REFERENCES contact_type(contact_type_id),
  contact_info     TEXT     NOT NULL,
  CONSTRAINT uniq_tutor_contact UNIQUE (tutor_id, contact_type_id, contact_info)
);

-- 4) Skill levels
CREATE TABLE IF NOT EXISTS skill_levels (
  skill_level_id   SMALLSERIAL PRIMARY KEY,
  skill_level_name TEXT NOT NULL UNIQUE
);

INSERT INTO skill_levels (skill_level_name)
VALUES 
  ('Beginner'),
  ('Intermediate'),
  ('Advanced'),
  ('Professional')
ON CONFLICT DO NOTHING;


-- 5) Tutor-teaching levels
CREATE TABLE IF NOT EXISTS tutor_teaching_levels (
  tutor_teaching_level_id SERIAL PRIMARY KEY,
  tutor_id        INTEGER  NOT NULL REFERENCES tutors(tutor_id) ON DELETE CASCADE,
  skill_level_id  SMALLINT NOT NULL REFERENCES skill_levels(skill_level_id),
  CONSTRAINT uniq_tutor_skill_level UNIQUE (tutor_id, skill_level_id)
);

-- 6) Teaching format (online / in_person)
CREATE TABLE IF NOT EXISTS teaching_format (
  teaching_format_id   SMALLSERIAL PRIMARY KEY,
  teaching_format_name TEXT NOT NULL UNIQUE
);

INSERT INTO teaching_format (teaching_format_name)
VALUES ('online'), ('in_person')
ON CONFLICT DO NOTHING;

-- Tutor-teaching format (online/in_person)
CREATE TABLE IF NOT EXISTS tutor_teaching_formats (
  tutor_teaching_format_id SERIAL PRIMARY KEY,
  tutor_id            INTEGER  NOT NULL REFERENCES tutors(tutor_id) ON DELETE CASCADE,
  teaching_format_id  SMALLINT NOT NULL REFERENCES teaching_format(teaching_format_id),
  CONSTRAINT uniq_tutor_format UNIQUE (tutor_id, teaching_format_id)
);

-- 7) Teaching type (individual / group)
CREATE TABLE IF NOT EXISTS teaching_type (
  teaching_type_id   SMALLSERIAL PRIMARY KEY,
  teaching_type_name TEXT NOT NULL UNIQUE
);

INSERT INTO teaching_type (teaching_type_name)
VALUES ('individual'), ('group')
ON CONFLICT DO NOTHING;

-- Tutor- teaching type (individual/group)
CREATE TABLE IF NOT EXISTS tutor_teaching_types (
  tutor_teaching_type_id SERIAL PRIMARY KEY,
  tutor_id          INTEGER  NOT NULL REFERENCES tutors(tutor_id) ON DELETE CASCADE,
  teaching_type_id  SMALLINT NOT NULL REFERENCES teaching_type(teaching_type_id),
  CONSTRAINT uniq_tutor_type UNIQUE (tutor_id, teaching_type_id)
);

-- Instruments table
CREATE TABLE IF NOT EXISTS instruments (
  instrument_id   SERIAL PRIMARY KEY,
  instrument_name TEXT NOT NULL UNIQUE
);

INSERT INTO instruments (instrument_name)
VALUES
  ('electric guitar'),
  ('classical guitar'),
  ('acoustic guitar'),
  ('bass guitar'),
  ('flamenco guitar'),
  ('slide guitar'),
  ('piano'),
  ('classical piano'),
  ('jazz piano'),
  ('keyboard'),
  ('drums'),
  ('steel drums'),
  ('voice'),
  ('accordion'),
  ('flute'),
  ('violin'),
  ('viola'),
  ('cello'),
  ('double-bass'),
  ('fiddle'),
  ('harpsichord'),
  ('organ'),
  ('trombone'),
  ('saxophone'),
  ('banjo'),
  ('didgeridoo'),
  ('mandolin'),
  ('synthesiser'),
  ('trumpet'),
  ('ukulele'),
  ('oboe'),
  ('bassoon'),
  ('harmonica'),
  ('xylophone'),
  ('sitar'),
  ('tuba'),
  ('bagpipes'),
  ('clarinet')
ON CONFLICT DO NOTHING;


-- Tutor--instruments
CREATE TABLE IF NOT EXISTS tutor_instruments (
  tutor_instrument_id SERIAL PRIMARY KEY,
  tutor_id      INTEGER NOT NULL REFERENCES tutors(tutor_id) ON DELETE CASCADE,
  instrument_id INTEGER NOT NULL REFERENCES instruments(instrument_id),
  CONSTRAINT uniq_tutor_instrument UNIQUE (tutor_id, instrument_id)
);


