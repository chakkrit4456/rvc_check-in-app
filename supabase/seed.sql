-- Sample data for testing
-- Insert sample departments based on the provided image
INSERT INTO departments (name, description) VALUES 
('คหกรรม', 'แผนกคหกรรม'),
('บริหารธุรกิจ', 'แผนกบริหารธุรกิจ'),
('เทคโนโลยีสารสนเทศฯ', 'แผนกเทคโนโลยีสารสนเทศและการสื่อสาร'),
('เทคโนโลยีบัณฑิต', 'แผนกเทคโนโลยีบัณฑิต'),
('ศิลปกรรม', 'แผนกศิลปกรรม'),
('อุตสาหกรรมการท่องเที่ยว', 'แผนกอุตสาหกรรมการท่องเที่ยว'),
('สามัญสัมพันธ์', 'แผนกสามัญสัมพันธ์');

-- Insert sample classrooms for each department and year level
-- ปวช.1-3 and ปวส.1-2, each with 3 rooms (1/1-1/3)
INSERT INTO classrooms (name, department_id, year_level) VALUES 
-- คหกรรม department
('ปวช.1/1', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 1),
('ปวช.1/2', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 1),
('ปวช.1/3', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 1),
('ปวช.2/1', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 2),
('ปวช.2/2', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 2),
('ปวช.2/3', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 2),
('ปวช.3/1', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 3),
('ปวช.3/2', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 3),
('ปวช.3/3', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 3),
('ปวส.1/1', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 4),
('ปวส.1/2', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 4),
('ปวส.1/3', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 4),
('ปวส.2/1', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 5),
('ปวส.2/2', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 5),
('ปวส.2/3', (SELECT id FROM departments WHERE name = 'คหกรรม' LIMIT 1), 5),

-- บริหารธุรกิจ department
('ปวช.1/1', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 1),
('ปวช.1/2', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 1),
('ปวช.1/3', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 1),
('ปวช.2/1', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 2),
('ปวช.2/2', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 2),
('ปวช.2/3', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 2),
('ปวช.3/1', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 3),
('ปวช.3/2', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 3),
('ปวช.3/3', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 3),
('ปวส.1/1', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 4),
('ปวส.1/2', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 4),
('ปวส.1/3', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 4),
('ปวส.2/1', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 5),
('ปวส.2/2', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 5),
('ปวส.2/3', (SELECT id FROM departments WHERE name = 'บริหารธุรกิจ' LIMIT 1), 5),

-- เทคโนโลยีสารสนเทศฯ department
('ปวช.1/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 1),
('ปวช.1/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 1),
('ปวช.1/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 1),
('ปวช.2/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 2),
('ปวช.2/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 2),
('ปวช.2/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 2),
('ปวช.3/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 3),
('ปวช.3/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 3),
('ปวช.3/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 3),
('ปวส.1/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 4),
('ปวส.1/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 4),
('ปวส.1/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 4),
('ปวส.2/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 5),
('ปวส.2/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 5),
('ปวส.2/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศฯ' LIMIT 1), 5),

-- เทคโนโลยีบัณฑิต department
('ปวช.1/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 1),
('ปวช.1/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 1),
('ปวช.1/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 1),
('ปวช.2/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 2),
('ปวช.2/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 2),
('ปวช.2/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 2),
('ปวช.3/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 3),
('ปวช.3/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 3),
('ปวช.3/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 3),
('ปวส.1/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 4),
('ปวส.1/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 4),
('ปวส.1/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 4),
('ปวส.2/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 5),
('ปวส.2/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 5),
('ปวส.2/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีบัณฑิต' LIMIT 1), 5),

-- ศิลปกรรม department
('ปวช.1/1', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 1),
('ปวช.1/2', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 1),
('ปวช.1/3', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 1),
('ปวช.2/1', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 2),
('ปวช.2/2', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 2),
('ปวช.2/3', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 2),
('ปวช.3/1', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 3),
('ปวช.3/2', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 3),
('ปวช.3/3', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 3),
('ปวส.1/1', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 4),
('ปวส.1/2', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 4),
('ปวส.1/3', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 4),
('ปวส.2/1', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 5),
('ปวส.2/2', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 5),
('ปวส.2/3', (SELECT id FROM departments WHERE name = 'ศิลปกรรม' LIMIT 1), 5),

-- อุตสาหกรรมการท่องเที่ยว department
('ปวช.1/1', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 1),
('ปวช.1/2', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 1),
('ปวช.1/3', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 1),
('ปวช.2/1', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 2),
('ปวช.2/2', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 2),
('ปวช.2/3', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 2),
('ปวช.3/1', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 3),
('ปวช.3/2', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 3),
('ปวช.3/3', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 3),
('ปวส.1/1', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 4),
('ปวส.1/2', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 4),
('ปวส.1/3', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 4),
('ปวส.2/1', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 5),
('ปวส.2/2', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 5),
('ปวส.2/3', (SELECT id FROM departments WHERE name = 'อุตสาหกรรมการท่องเที่ยว' LIMIT 1), 5),

-- สามัญสัมพันธ์ department
('ปวช.1/1', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 1),
('ปวช.1/2', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 1),
('ปวช.1/3', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 1),
('ปวช.2/1', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 2),
('ปวช.2/2', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 2),
('ปวช.2/3', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 2),
('ปวช.3/1', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 3),
('ปวช.3/2', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 3),
('ปวช.3/3', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 3),
('ปวส.1/1', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 4),
('ปวส.1/2', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 4),
('ปวส.1/3', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 4),
('ปวส.2/1', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 5),
('ปวส.2/2', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 5),
('ปวส.2/3', (SELECT id FROM departments WHERE name = 'สามัญสัมพันธ์' LIMIT 1), 5);

-- Insert sample activities
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
 ARRAY[4, 5]);

-- Insert sample announcements
INSERT INTO announcements (title, content, announcement_type, priority, target_audience, is_published, published_at) VALUES 
('ประกาศหยุดเรียน', 'วันจันทร์ที่ 25 ตุลาคม 2567 โรงเรียนหยุดเรียนเนื่องจากการประชุมครู', 'general', 'high', 'all', true, NOW()),

('กิจกรรมใหม่', 'ขอเชิญนักเรียนเข้าร่วมกิจกรรมกีฬาสีที่จะจัดขึ้นในสัปดาห์หน้า', 'activity', 'normal', 'students', true, NOW()),

('การสอบกลางภาค', 'การสอบกลางภาคจะเริ่มในวันที่ 1 พฤศจิกายน 2567', 'general', 'normal', 'all', true, NOW());