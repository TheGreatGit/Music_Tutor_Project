SELECT
    s.student_id,
    s.first_name,
    s.last_name,
    au.email,
    r.role_name,
    c.city_name,
    co.country_name,
    ucd.contact_info AS contact_info,
    ct.contact_type

FROM students s
LEFT JOIN app_users au
  ON s.user_id = au.user_id
LEFT JOIN roles r
  ON au.role_id = r.role_id
LEFT JOIN cities c
  ON s.city_id = c.city_id
LEFT JOIN countries co
  ON c.country_id = co.country_id
LEFT JOIN user_contact_details ucd
  ON au.user_id = ucd.user_id
LEFT JOIN contact_type ct
  ON ucd.contact_type_id = ct.contact_type_id

ORDER BY s.student_id;
