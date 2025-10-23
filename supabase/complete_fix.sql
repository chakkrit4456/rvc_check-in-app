-- Complete fix for all database issues
-- Run this to fix all problems

-- 1. Disable RLS for all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 2. Clear existing data and insert fresh data
DELETE FROM admin_users;
DELETE FROM attendance_records;
DELETE FROM activities;
DELETE FROM announcements;
DELETE FROM profiles;
DELETE FROM classrooms;
DELETE FROM departments;

-- 3. Insert departments
INSERT INTO departments (id, name, description) VALUES 
('dept-001', 'คหกรรม', 'แผนกคหกรรม'),
('dept-002', 'บริหารธุรกิจ', 'แผนกบริหารธุรกิจ'),
('dept-003', 'เทคโนโลยีสารสนเทศฯ', 'แผนกเทคโนโลยีสารสนเทศและการสื่อสาร'),
('dept-004', 'เทคโนโลยีบัณฑิต', 'แผนกเทคโนโลยีบัณฑิต'),
('dept-005', 'ศิลปกรรม', 'แผนกศิลปกรรม'),
('dept-006', 'อุตสาหกรรมการท่องเที่ยว', 'แผนกอุตสาหกรรมการท่องเที่ยว'),
('dept-007', 'สามัญสัมพันธ์', 'แผนกสามัญสัมพันธ์');

-- 4. Insert classrooms for each department
INSERT INTO classrooms (id, name, department_id, year_level) VALUES 
-- คหกรรม department
('class-001', 'ปวช.1/1', 'dept-001', 1),
('class-002', 'ปวช.1/2', 'dept-001', 1),
('class-003', 'ปวช.1/3', 'dept-001', 1),
('class-004', 'ปวช.2/1', 'dept-001', 2),
('class-005', 'ปวช.2/2', 'dept-001', 2),
('class-006', 'ปวช.2/3', 'dept-001', 2),
('class-007', 'ปวช.3/1', 'dept-001', 3),
('class-008', 'ปวช.3/2', 'dept-001', 3),
('class-009', 'ปวช.3/3', 'dept-001', 3),
('class-010', 'ปวส.1/1', 'dept-001', 4),
('class-011', 'ปวส.1/2', 'dept-001', 4),
('class-012', 'ปวส.1/3', 'dept-001', 4),
('class-013', 'ปวส.2/1', 'dept-001', 5),
('class-014', 'ปวส.2/2', 'dept-001', 5),
('class-015', 'ปวส.2/3', 'dept-001', 5),

-- บริหารธุรกิจ department
('class-016', 'ปวช.1/1', 'dept-002', 1),
('class-017', 'ปวช.1/2', 'dept-002', 1),
('class-018', 'ปวช.1/3', 'dept-002', 1),
('class-019', 'ปวช.2/1', 'dept-002', 2),
('class-020', 'ปวช.2/2', 'dept-002', 2),
('class-021', 'ปวช.2/3', 'dept-002', 2),
('class-022', 'ปวช.3/1', 'dept-002', 3),
('class-023', 'ปวช.3/2', 'dept-002', 3),
('class-024', 'ปวช.3/3', 'dept-002', 3),
('class-025', 'ปวส.1/1', 'dept-002', 4),
('class-026', 'ปวส.1/2', 'dept-002', 4),
('class-027', 'ปวส.1/3', 'dept-002', 4),
('class-028', 'ปวส.2/1', 'dept-002', 5),
('class-029', 'ปวส.2/2', 'dept-002', 5),
('class-030', 'ปวส.2/3', 'dept-002', 5),

-- เทคโนโลยีสารสนเทศฯ department
('class-031', 'ปวช.1/1', 'dept-003', 1),
('class-032', 'ปวช.1/2', 'dept-003', 1),
('class-033', 'ปวช.1/3', 'dept-003', 1),
('class-034', 'ปวช.2/1', 'dept-003', 2),
('class-035', 'ปวช.2/2', 'dept-003', 2),
('class-036', 'ปวช.2/3', 'dept-003', 2),
('class-037', 'ปวช.3/1', 'dept-003', 3),
('class-038', 'ปวช.3/2', 'dept-003', 3),
('class-039', 'ปวช.3/3', 'dept-003', 3),
('class-040', 'ปวส.1/1', 'dept-003', 4),
('class-041', 'ปวส.1/2', 'dept-003', 4),
('class-042', 'ปวส.1/3', 'dept-003', 4),
('class-043', 'ปวส.2/1', 'dept-003', 5),
('class-044', 'ปวส.2/2', 'dept-003', 5),
('class-045', 'ปวส.2/3', 'dept-003', 5);

-- 5. Insert admin profiles
INSERT INTO profiles (id, student_id, national_id, first_name, last_name, gender, email, phone, role, is_active) VALUES 
('admin-001', 'admin1', '66202040013', 'Admin', 'User', 'male', 'admin@school.com', '0000000000', 'admin', true),
('admin-002', 'admin2', '66202040013', 'Chakkrit', 'Admin', 'male', 'chakkritnb1123@gmail.com', '0000000000', 'admin', true);

-- 6. Insert admin users
INSERT INTO admin_users (id, profile_id, admin_level, permissions, is_active) VALUES 
('admin-user-001', 'admin-001', 'super', '{"all": true, "users": true, "activities": true, "reports": true}', true),
('admin-user-002', 'admin-002', 'super', '{"all": true, "users": true, "activities": true, "reports": true}', true);

-- 7. Insert sample activities
INSERT INTO activities (id, title, description, activity_type, location, start_time, end_time, status, requires_photo, target_classrooms, target_departments, target_year_levels) VALUES 
('activity-001', 'เข้าแถวเช้า', 'การเข้าแถวประจำวัน', 'morning_assembly', 'สนามโรงเรียน', 
 CURRENT_DATE + INTERVAL '1 day' + TIME '07:30:00', 
 CURRENT_DATE + INTERVAL '1 day' + TIME '08:00:00', 
 'active', true, 
 '{}', 
 '{}', 
 ARRAY[1, 2, 3, 4, 5]),

('activity-002', 'กิจกรรมกีฬาสี', 'การแข่งขันกีฬาสีประจำปี', 'sports', 'สนามกีฬา', 
 CURRENT_DATE + INTERVAL '2 days' + TIME '08:00:00', 
 CURRENT_DATE + INTERVAL '2 days' + TIME '16:00:00', 
 'active', true, 
 '{}', 
 '{}', 
 ARRAY[1, 2, 3, 4, 5]),

('activity-003', 'ประชุมนักเรียน', 'การประชุมประจำสัปดาห์', 'meeting', 'หอประชุม', 
 CURRENT_DATE + INTERVAL '3 days' + TIME '13:00:00', 
 CURRENT_DATE + INTERVAL '3 days' + TIME '15:00:00', 
 'active', false, 
 '{}', 
 '{}', 
 ARRAY[4, 5]);

-- 8. Insert sample announcements
INSERT INTO announcements (id, title, content, announcement_type, priority, target_audience, is_published, published_at) VALUES 
('announcement-001', 'ประกาศหยุดเรียน', 'วันจันทร์ที่ 25 ตุลาคม 2567 โรงเรียนหยุดเรียนเนื่องจากการประชุมครู', 'general', 'high', 'all', true, NOW()),

('announcement-002', 'กิจกรรมใหม่', 'ขอเชิญนักเรียนเข้าร่วมกิจกรรมกีฬาสีที่จะจัดขึ้นในสัปดาห์หน้า', 'activity', 'normal', 'students', true, NOW()),

('announcement-003', 'การสอบกลางภาค', 'การสอบกลางภาคจะเริ่มในวันที่ 1 พฤศจิกายน 2567', 'general', 'normal', 'all', true, NOW());



