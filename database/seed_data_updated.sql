-- ===================================
-- เพิ่มคอลัมน์ year_level ให้ classrooms table
-- ===================================

-- ตรวจสอบว่ามีคอลัมน์นี้หรือไม่ ถ้าไม่มีก็เพิ่ม
ALTER TABLE public.classrooms
ADD COLUMN IF NOT EXISTS year_level integer;

-- ===================================
-- เพิ่มข้อมูล departments
-- ===================================

INSERT INTO public.departments (name) VALUES
  ('แผนกคหกรรมศาสตร์'),
  ('แฟชั่นและสิ่งทอ'),
  ('อาหารและโภชนาการ'),
  ('วิจิตรศิลป์'),
  ('ออกแบบ'),
  ('คอมพิวเตอร์กราฟฟิก'),
  ('การบัญชี'),
  ('การตลาด'),
  ('การจัดการโลจิสติกส์'),
  ('เทคโนโลยีธุรกิจดิจิทัล'),
  ('การโรงแรม'),
  ('การท่องเที่ยว'),
  ('เทคโนโลยีสารสนเทศ')
ON CONFLICT DO NOTHING;

-- ===================================
-- เพิ่มข้อมูล classrooms สำหรับแต่ละ department
-- ===================================

WITH department_ids AS (
  SELECT id, name FROM public.departments
),
levels_and_years AS (
  SELECT 'ปวช.' AS level, 1 AS year_num, 1 AS year_level_int UNION ALL
  SELECT 'ปวช.' AS level, 2 AS year_num, 2 AS year_level_int UNION ALL
  SELECT 'ปวช.' AS level, 3 AS year_num, 3 AS year_level_int UNION ALL
  SELECT 'ปวส.' AS level, 1 AS year_num, 4 AS year_level_int UNION ALL
  SELECT 'ปวส.' AS level, 2 AS year_num, 5 AS year_level_int
),
rooms AS (
  SELECT generate_series(1, 3) AS room_num
)
INSERT INTO public.classrooms (name, department_id, year_level)
SELECT
  d.name || ' ' || ly.level || ly.year_num || '/' || r.room_num AS classroom_name,
  d.id AS department_id,
  ly.year_level_int AS year_level
FROM
  department_ids d
CROSS JOIN
  levels_and_years ly
CROSS JOIN
  rooms r
ON CONFLICT DO NOTHING
ORDER BY 
  d.name, ly.level, ly.year_num, r.room_num;
