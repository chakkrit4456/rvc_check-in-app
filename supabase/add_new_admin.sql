Add new admin user
Email: chakkritnb1123@gmail.com
Password: 66202040013

-- First, create the auth user (this should be done through Supabase Auth UI)
-- For now, we'll create a profile entry that can be linked to an auth user

-- Insert new admin profile
INSERT INTO profiles (
    id,
    student_id,
    national_id,
    first_name,
    last_name,
    gender,
    email,
    phone,
    role,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000002', -- New UUID for new admin
    'admin2',
    '66202040013',
    'Chakkrit',
    'Admin',
    'male',
    'chakkritnb1123@gmail.com',
    '0000000000',
    'admin',
    true
);

-- Create admin user entry
INSERT INTO admin_users (
    profile_id,
    admin_level,
    permissions,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'super',
    '{"all": true, "users": true, "activities": true, "reports": true}',
    true
);

-- Update existing admin user
UPDATE profiles 
SET 
    student_id = 'admin1',
    email = 'admin@school.com'
WHERE student_id = 'admin';

-- Ensure we have sample data for testing
INSERT INTO activities (title, description, activity_type, location, start_time, end_time, status, requires_photo, target_classrooms, target_departments, target_year_levels) VALUES 
('เข้าแถวเช้า', 'การเข้าแถวประจำวัน', 'morning_assembly', 'สนามโรงเรียน', 
 CURRENT_DATE + INTERVAL '1 day' + TIME '07:30:00', 
 CURRENT_DATE + INTERVAL '1 day' + TIME '08:00:00', 
 'active', true, 
 '{}', 
 '{}', 
 ARRAY[1, 2, 3, 4, 5]),

('กิจกรรมกีฬาสี', 'การแข่งขันกีฬาสีประจำปี', 'sports', 'สนามกีฬา', 
 CURRENT_DATE + INTERVAL '2 days' + TIME '08:00:00', 
 CURRENT_DATE + INTERVAL '2 days' + TIME '16:00:00', 
 'active', true, 
 '{}', 
 '{}', 
 ARRAY[1, 2, 3, 4, 5]),

('ประชุมนักเรียน', 'การประชุมประจำสัปดาห์', 'meeting', 'หอประชุม', 
 CURRENT_DATE + INTERVAL '3 days' + TIME '13:00:00', 
 CURRENT_DATE + INTERVAL '3 days' + TIME '15:00:00', 
 'active', false, 
 '{}', 
 '{}', 
 ARRAY[4, 5])
ON CONFLICT DO NOTHING;

-- Insert sample announcements
INSERT INTO announcements (title, content, announcement_type, priority, target_audience, is_published, published_at) VALUES 
('ประกาศหยุดเรียน', 'วันจันทร์ที่ 25 ตุลาคม 2567 โรงเรียนหยุดเรียนเนื่องจากการประชุมครู', 'general', 'high', 'all', true, NOW()),

('กิจกรรมใหม่', 'ขอเชิญนักเรียนเข้าร่วมกิจกรรมกีฬาสีที่จะจัดขึ้นในสัปดาห์หน้า', 'activity', 'normal', 'students', true, NOW()),

('การสอบกลางภาค', 'การสอบกลางภาคจะเริ่มในวันที่ 1 พฤศจิกายน 2567', 'general', 'normal', 'all', true, NOW())
ON CONFLICT DO NOTHING;



