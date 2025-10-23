-- Emergency fix for all database issues
-- This will completely reset and fix the database

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Allow all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all activities" ON activities;
DROP POLICY IF EXISTS "Allow all attendance" ON attendance_records;
DROP POLICY IF EXISTS "Allow all announcements" ON announcements;
DROP POLICY IF EXISTS "Allow all classrooms" ON classrooms;
DROP POLICY IF EXISTS "Allow all departments" ON departments;
DROP POLICY IF EXISTS "Allow all admin_users" ON admin_users;

-- 2. Disable RLS completely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 3. Clear all data
DELETE FROM admin_users;
DELETE FROM attendance_records;
DELETE FROM activities;
DELETE FROM announcements;
DELETE FROM profiles;
DELETE FROM classrooms;
DELETE FROM departments;

-- 4. Insert departments with fixed IDs
INSERT INTO departments (id, name, description) VALUES 
('dept-001', 'คหกรรม', 'แผนกคหกรรม'),
('dept-002', 'บริหารธุรกิจ', 'แผนกบริหารธุรกิจ'),
('dept-003', 'เทคโนโลยีสารสนเทศฯ', 'แผนกเทคโนโลยีสารสนเทศและการสื่อสาร'),
('dept-004', 'เทคโนโลยีบัณฑิต', 'แผนกเทคโนโลยีบัณฑิต'),
('dept-005', 'ศิลปกรรม', 'แผนกศิลปกรรม'),
('dept-006', 'อุตสาหกรรมการท่องเที่ยว', 'แผนกอุตสาหกรรมการท่องเที่ยว'),
('dept-007', 'สามัญสัมพันธ์', 'แผนกสามัญสัมพันธ์');

-- 5. Insert classrooms for each department and year level
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
('class-045', 'ปวส.2/3', 'dept-003', 5),

-- เทคโนโลยีบัณฑิต department
('class-046', 'ปวช.1/1', 'dept-004', 1),
('class-047', 'ปวช.1/2', 'dept-004', 1),
('class-048', 'ปวช.1/3', 'dept-004', 1),
('class-049', 'ปวช.2/1', 'dept-004', 2),
('class-050', 'ปวช.2/2', 'dept-004', 2),
('class-051', 'ปวช.2/3', 'dept-004', 2),
('class-052', 'ปวช.3/1', 'dept-004', 3),
('class-053', 'ปวช.3/2', 'dept-004', 3),
('class-054', 'ปวช.3/3', 'dept-004', 3),
('class-055', 'ปวส.1/1', 'dept-004', 4),
('class-056', 'ปวส.1/2', 'dept-004', 4),
('class-057', 'ปวส.1/3', 'dept-004', 4),
('class-058', 'ปวส.2/1', 'dept-004', 5),
('class-059', 'ปวส.2/2', 'dept-004', 5),
('class-060', 'ปวส.2/3', 'dept-004', 5),

-- ศิลปกรรม department
('class-061', 'ปวช.1/1', 'dept-005', 1),
('class-062', 'ปวช.1/2', 'dept-005', 1),
('class-063', 'ปวช.1/3', 'dept-005', 1),
('class-064', 'ปวช.2/1', 'dept-005', 2),
('class-065', 'ปวช.2/2', 'dept-005', 2),
('class-066', 'ปวช.2/3', 'dept-005', 2),
('class-067', 'ปวช.3/1', 'dept-005', 3),
('class-068', 'ปวช.3/2', 'dept-005', 3),
('class-069', 'ปวช.3/3', 'dept-005', 3),
('class-070', 'ปวส.1/1', 'dept-005', 4),
('class-071', 'ปวส.1/2', 'dept-005', 4),
('class-072', 'ปวส.1/3', 'dept-005', 4),
('class-073', 'ปวส.2/1', 'dept-005', 5),
('class-074', 'ปวส.2/2', 'dept-005', 5),
('class-075', 'ปวส.2/3', 'dept-005', 5),

-- อุตสาหกรรมการท่องเที่ยว department
('class-076', 'ปวช.1/1', 'dept-006', 1),
('class-077', 'ปวช.1/2', 'dept-006', 1),
('class-078', 'ปวช.1/3', 'dept-006', 1),
('class-079', 'ปวช.2/1', 'dept-006', 2),
('class-080', 'ปวช.2/2', 'dept-006', 2),
('class-081', 'ปวช.2/3', 'dept-006', 2),
('class-082', 'ปวช.3/1', 'dept-006', 3),
('class-083', 'ปวช.3/2', 'dept-006', 3),
('class-084', 'ปวช.3/3', 'dept-006', 3),
('class-085', 'ปวส.1/1', 'dept-006', 4),
('class-086', 'ปวส.1/2', 'dept-006', 4),
('class-087', 'ปวส.1/3', 'dept-006', 4),
('class-088', 'ปวส.2/1', 'dept-006', 5),
('class-089', 'ปวส.2/2', 'dept-006', 5),
('class-090', 'ปวส.2/3', 'dept-006', 5),

-- สามัญสัมพันธ์ department
('class-091', 'ปวช.1/1', 'dept-007', 1),
('class-092', 'ปวช.1/2', 'dept-007', 1),
('class-093', 'ปวช.1/3', 'dept-007', 1),
('class-094', 'ปวช.2/1', 'dept-007', 2),
('class-095', 'ปวช.2/2', 'dept-007', 2),
('class-096', 'ปวช.2/3', 'dept-007', 2),
('class-097', 'ปวช.3/1', 'dept-007', 3),
('class-098', 'ปวช.3/2', 'dept-007', 3),
('class-099', 'ปวช.3/3', 'dept-007', 3),
('class-100', 'ปวส.1/1', 'dept-007', 4),
('class-101', 'ปวส.1/2', 'dept-007', 4),
('class-102', 'ปวส.1/3', 'dept-007', 4),
('class-103', 'ปวส.2/1', 'dept-007', 5),
('class-104', 'ปวส.2/2', 'dept-007', 5),
('class-105', 'ปวส.2/3', 'dept-007', 5);

-- 6. Insert admin profiles
INSERT INTO profiles (id, student_id, national_id, first_name, last_name, gender, email, phone, role, is_active) VALUES 
('admin-001', 'admin1', '66202040013', 'Admin', 'User', 'male', 'admin@school.com', '0000000000', 'admin', true),
('admin-002', 'admin2', '66202040013', 'Chakkrit', 'Admin', 'male', 'chakkritnb1123@gmail.com', '0000000000', 'admin', true);

-- 7. Insert admin users
INSERT INTO admin_users (id, profile_id, admin_level, permissions, is_active) VALUES 
('admin-user-001', 'admin-001', 'super', '{"all": true, "users": true, "activities": true, "reports": true}', true),
('admin-user-002', 'admin-002', 'super', '{"all": true, "users": true, "activities": true, "reports": true}', true);

-- 8. Insert sample activities
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

-- 9. Insert sample announcements
INSERT INTO announcements (id, title, content, announcement_type, priority, target_audience, is_published, published_at) VALUES 
('announcement-001', 'ประกาศหยุดเรียน', 'วันจันทร์ที่ 25 ตุลาคม 2567 โรงเรียนหยุดเรียนเนื่องจากการประชุมครู', 'general', 'high', 'all', true, NOW()),

('announcement-002', 'กิจกรรมใหม่', 'ขอเชิญนักเรียนเข้าร่วมกิจกรรมกีฬาสีที่จะจัดขึ้นในสัปดาห์หน้า', 'activity', 'normal', 'students', true, NOW()),

('announcement-003', 'การสอบกลางภาค', 'การสอบกลางภาคจะเริ่มในวันที่ 1 พฤศจิกายน 2567', 'general', 'normal', 'all', true, NOW());



