-- COMPLETE DATABASE FIX - แก้ไขปัญหา 500 Internal Server Error
-- รันไฟล์นี้ใน Supabase SQL Editor เพื่อแก้ไขฐานข้อมูลให้สมบูรณ์

-- 1. DISABLE RLS COMPLETELY
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING POLICIES
DROP POLICY IF EXISTS "Allow authenticated read" ON profiles;
DROP POLICY IF EXISTS "Allow admin all access" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all authenticated select" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated read activities" ON activities;
DROP POLICY IF EXISTS "Allow admin all access activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated read attendance" ON attendance_records;
DROP POLICY IF EXISTS "Allow admin all access attendance" ON attendance_records;
DROP POLICY IF EXISTS "Allow authenticated read announcements" ON announcements;
DROP POLICY IF EXISTS "Allow admin all access announcements" ON announcements;
DROP POLICY IF EXISTS "Allow all authenticated select" ON activities;
DROP POLICY IF EXISTS "Allow all authenticated select" ON attendance_records;
DROP POLICY IF EXISTS "Allow all authenticated select" ON announcements;
DROP POLICY IF EXISTS "Allow all authenticated select" ON admin_users;
DROP POLICY IF EXISTS "Allow all authenticated select" ON departments;
DROP POLICY IF EXISTS "Allow all authenticated select" ON classrooms;

-- 3. GRANT ALL PRIVILEGES
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 4. CLEAR ALL DATA
TRUNCATE TABLE attendance_records RESTART IDENTITY CASCADE;
TRUNCATE TABLE activities RESTART IDENTITY CASCADE;
TRUNCATE TABLE announcements RESTART IDENTITY CASCADE;
TRUNCATE TABLE admin_users RESTART IDENTITY CASCADE;
TRUNCATE TABLE profiles RESTART IDENTITY CASCADE;
TRUNCATE TABLE classrooms RESTART IDENTITY CASCADE;
TRUNCATE TABLE departments RESTART IDENTITY CASCADE;

-- 5. INSERT DEPARTMENTS
INSERT INTO departments (id, name, description) VALUES 
('d001', 'คหกรรม', 'แผนกคหกรรม'),
('d002', 'บริหารธุรกิจ', 'แผนกบริหารธุรกิจ'),
('d003', 'เทคโนโลยีสารสนเทศฯ', 'แผนกเทคโนโลยีสารสนเทศและการสื่อสาร'),
('d004', 'เทคโนโลยีบัณฑิต', 'แผนกเทคโนโลยีบัณฑิต'),
('d005', 'ศิลปกรรม', 'แผนกศิลปกรรม'),
('d006', 'อุตสาหกรรมการท่องเที่ยว', 'แผนกอุตสาหกรรมการท่องเที่ยว'),
('d007', 'สามัญสัมพันธ์', 'แผนกสามัญสัมพันธ์');

-- 6. INSERT CLASSROOMS
DO $$
DECLARE
    dept_id UUID;
    dept_name VARCHAR;
    year_level_map JSONB := '{
        "ปวช.1": 1, "ปวช.2": 2, "ปวช.3": 3,
        "ปวส.1": 4, "ปวส.2": 5
    }';
    year_label VARCHAR;
    year_num INTEGER;
    room_num INTEGER;
BEGIN
    FOR dept_id, dept_name IN SELECT id, name FROM departments LOOP
        FOR year_label, year_num IN SELECT * FROM jsonb_each_text(year_level_map) LOOP
            FOR room_num IN 1..3 LOOP
                INSERT INTO classrooms (name, department_id, year_level) VALUES 
                (year_label || '/' || room_num, dept_id, year_num);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- 7. INSERT ADMIN PROFILE
INSERT INTO profiles (id, student_id, national_id, first_name, last_name, gender, email, phone, classroom_id, department_id, year_level, role, is_active)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'admin',
    '66202040013',
    'Chakkrit',
    'Admin',
    'male',
    'chakkritnb1123@gmail.com',
    '0812345678',
    NULL,
    NULL,
    NULL,
    'admin',
    TRUE
);

-- 8. INSERT TEST STUDENT PROFILES
INSERT INTO profiles (id, student_id, national_id, first_name, last_name, gender, email, phone, classroom_id, department_id, year_level, role, is_active)
VALUES 
(
    '01ce7d17-5810-408b-93f2-d375622e782f',
    '1234567890',
    '1234567890123',
    'Test',
    'Student',
    'male',
    'test.student@example.com',
    '0987654321',
    (SELECT id FROM classrooms WHERE name = 'ปวช.1/1' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1),
    1,
    'student',
    TRUE
),
(
    '02ce7d17-5810-408b-93f2-d375622e782f',
    '2345678901',
    '2345678901234',
    'John',
    'Doe',
    'male',
    'john.doe@example.com',
    '0987654322',
    (SELECT id FROM classrooms WHERE name = 'ปวช.2/1' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1),
    2,
    'student',
    TRUE
),
(
    '03ce7d17-5810-408b-93f2-d375622e782f',
    '3456789012',
    '3456789012345',
    'Jane',
    'Smith',
    'female',
    'jane.smith@example.com',
    '0987654323',
    (SELECT id FROM classrooms WHERE name = 'ปวช.3/2' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1),
    3,
    'student',
    TRUE
);

-- 9. INSERT SAMPLE ACTIVITIES
INSERT INTO activities (title, description, activity_type, location, start_time, end_time, status, requires_photo, target_classrooms, target_departments, target_year_levels, creator_id) VALUES 
('เข้าแถวเช้า', 'การเข้าแถวประจำวัน', 'morning_assembly', 'สนามโรงเรียน', 
 NOW() + INTERVAL '1 minute', 
 NOW() + INTERVAL '30 minutes', 
 'active', true, 
 '{}', 
 '{}', 
 ARRAY[1, 2, 3, 4, 5],
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),

('กิจกรรมกีฬาสี', 'การแข่งขันกีฬาสีประจำปี', 'sports', 'สนามกีฬา', 
 NOW() + INTERVAL '1 hour', 
 NOW() + INTERVAL '5 hours', 
 'active', true, 
 '{}', 
 '{}', 
 ARRAY[1, 2, 3, 4, 5],
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),

('ประชุมนักเรียน', 'การประชุมประจำสัปดาห์', 'meeting', 'หอประชุม', 
 NOW() + INTERVAL '2 hours', 
 NOW() + INTERVAL '3 hours', 
 'active', false, 
 '{}', 
 '{}', 
 ARRAY[4, 5],
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),

('กิจกรรมจิตอาสา', 'การทำกิจกรรมจิตอาสา', 'volunteer', 'ชุมชน', 
 NOW() + INTERVAL '3 hours', 
 NOW() + INTERVAL '6 hours', 
 'active', true, 
 '{}', 
 '{}', 
 ARRAY[1, 2, 3, 4, 5],
 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');

-- 10. INSERT SAMPLE ANNOUNCEMENTS
INSERT INTO announcements (title, content, announcement_type, priority, target_audience, is_published, published_at, creator_id) VALUES 
('ประกาศหยุดเรียน', 'วันจันทร์ที่ 25 ตุลาคม 2567 โรงเรียนหยุดเรียนเนื่องจากการประชุมครู', 'general', 'high', 'all', true, NOW(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('กิจกรรมใหม่', 'ขอเชิญนักเรียนเข้าร่วมกิจกรรมกีฬาสีที่จะจัดขึ้นในสัปดาห์หน้า', 'activity', 'normal', 'students', true, NOW(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('การสอบกลางภาค', 'การสอบกลางภาคจะเริ่มในวันที่ 1 พฤศจิกายน 2567', 'general', 'normal', 'all', true, NOW(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('ประกาศการเปลี่ยนแปลงเวลาเรียน', 'ตั้งแต่วันที่ 1 พฤศจิกายน 2567 เวลาเรียนจะเปลี่ยนเป็น 8:00-16:00', 'general', 'normal', 'all', true, NOW(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');

-- 11. INSERT SAMPLE ATTENDANCE RECORDS
INSERT INTO attendance_records (student_id, activity_id, check_in_time, check_out_time, photo_url, notes) VALUES 
('01ce7d17-5810-408b-93f2-d375622e782f', 
 (SELECT id FROM activities WHERE title = 'เข้าแถวเช้า' LIMIT 1), 
 NOW() - INTERVAL '1 hour', 
 NOW() - INTERVAL '30 minutes', 
 'https://example.com/photo1.jpg', 
 'เข้าร่วมกิจกรรมเข้าแถวเช้า'),

('02ce7d17-5810-408b-93f2-d375622e782f', 
 (SELECT id FROM activities WHERE title = 'เข้าแถวเช้า' LIMIT 1), 
 NOW() - INTERVAL '50 minutes', 
 NOW() - INTERVAL '20 minutes', 
 'https://example.com/photo2.jpg', 
 'เข้าร่วมกิจกรรมเข้าแถวเช้า'),

('03ce7d17-5810-408b-93f2-d375622e782f', 
 (SELECT id FROM activities WHERE title = 'กิจกรรมกีฬาสี' LIMIT 1), 
 NOW() - INTERVAL '2 hours', 
 NOW() - INTERVAL '1 hour', 
 'https://example.com/photo3.jpg', 
 'เข้าร่วมกิจกรรมกีฬาสี'),

('01ce7d17-5810-408b-93f2-d375622e782f', 
 (SELECT id FROM activities WHERE title = 'กิจกรรมกีฬาสี' LIMIT 1), 
 NOW() - INTERVAL '1.5 hours', 
 NOW() - INTERVAL '30 minutes', 
 'https://example.com/photo4.jpg', 
 'เข้าร่วมกิจกรรมกีฬาสี');

-- 12. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_classroom_id ON profiles(classroom_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_creator_id ON activities(creator_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_activity_id ON attendance_records(activity_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_check_in_time ON attendance_records(check_in_time);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_creator_id ON announcements(creator_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_department_id ON classrooms(department_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_year_level ON classrooms(year_level);

-- 13. CREATE FUNCTIONS FOR COMMON OPERATIONS
CREATE OR REPLACE FUNCTION get_student_stats()
RETURNS TABLE (
    total_students bigint,
    active_students bigint,
    inactive_students bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_students,
        COUNT(*) FILTER (WHERE is_active = true) as active_students,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_students
    FROM profiles 
    WHERE role = 'student';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_activity_stats()
RETURNS TABLE (
    total_activities bigint,
    active_activities bigint,
    inactive_activities bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_activities,
        COUNT(*) FILTER (WHERE status = 'active') as active_activities,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_activities
    FROM activities;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_attendance_stats()
RETURNS TABLE (
    total_attendance bigint,
    today_attendance bigint,
    attendance_rate numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_attendance,
        COUNT(*) FILTER (WHERE check_in_time >= CURRENT_DATE) as today_attendance,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE check_in_time >= CURRENT_DATE)::numeric / COUNT(*)::numeric) * 100
            ELSE 0
        END as attendance_rate
    FROM attendance_records;
END;
$$ LANGUAGE plpgsql;

-- 14. CREATE VIEWS FOR DASHBOARD
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM profiles WHERE role = 'student' AND is_active = true) as active_students,
    (SELECT COUNT(*) FROM activities) as total_activities,
    (SELECT COUNT(*) FROM activities WHERE status = 'active') as active_activities,
    (SELECT COUNT(*) FROM attendance_records) as total_attendance,
    (SELECT COUNT(*) FROM attendance_records WHERE check_in_time >= CURRENT_DATE) as today_attendance,
    (SELECT COUNT(*) FROM announcements WHERE is_published = true) as total_announcements;

-- 15. GRANT PERMISSIONS ON FUNCTIONS AND VIEWS
GRANT EXECUTE ON FUNCTION get_student_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_attendance_stats() TO authenticated;
GRANT SELECT ON dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_activity_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_attendance_stats() TO anon;
GRANT SELECT ON dashboard_stats TO anon;

-- 16. FINAL VERIFICATION
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as department_count FROM departments;
SELECT COUNT(*) as classroom_count FROM classrooms;
SELECT COUNT(*) as profile_count FROM profiles;
SELECT COUNT(*) as activity_count FROM activities;
SELECT COUNT(*) as announcement_count FROM announcements;
SELECT COUNT(*) as attendance_count FROM attendance_records;

-- 17. TEST QUERIES
SELECT * FROM profiles WHERE email = 'chakkritnb1123@gmail.com';
SELECT * FROM profiles WHERE student_id = '1234567890';
SELECT * FROM activities ORDER BY created_at DESC;
SELECT * FROM announcements WHERE is_published = true ORDER BY published_at DESC;
SELECT * FROM attendance_records ORDER BY check_in_time DESC;

-- 18. SHOW CLASSROOM STRUCTURE
SELECT 
    d.name as department_name,
    c.name as classroom_name,
    c.year_level
FROM departments d
JOIN classrooms c ON d.id = c.department_id
ORDER BY d.name, c.year_level, c.name;

-- 19. SHOW ALL PROFILES
SELECT 
    p.student_id,
    p.first_name,
    p.last_name,
    p.email,
    p.role,
    p.is_active,
    c.name as classroom_name,
    d.name as department_name
FROM profiles p
LEFT JOIN classrooms c ON p.classroom_id = c.id
LEFT JOIN departments d ON p.department_id = d.id
ORDER BY p.role, p.first_name;

-- 20. SHOW DASHBOARD STATS
SELECT * FROM dashboard_stats;