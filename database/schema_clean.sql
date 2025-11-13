-- =================================================================================
-- Full setup script (รวมการแก้ไขตามขอ: extensions, drop, create, constraints,
-- insert departments/classrooms, triggers, RLS policies, updated_at trigger)
-- =================================================================================

BEGIN;

-- -------------------------
-- 0. เตรียม extensions ที่จำเป็น
-- -------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------
-- 1. ลบ trigger/func เก่า (ถ้ามี) เพื่อเตรียมสร้างใหม่
-- -------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- -------------------------
-- 2. ลบตารางทั้งหมด (ถ้าต้องการรีเซ็ต) - ระวังข้อมูลหาย (backup ก่อน)
-- -------------------------
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.classrooms CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- ===================================
-- ขั้นตอนที่ 3: สร้างตารางใหม่
-- ===================================

-- ตารางแผนกวิชา
CREATE TABLE public.departments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT departments_pkey PRIMARY KEY (id)
);

-- unique constraint สำหรับชื่อแผนก (ป้องกันการใส่ซ้ำ)
ALTER TABLE public.departments
  ADD CONSTRAINT departments_name_key UNIQUE (name);

-- ตารางห้องเรียน (มี year_level)
CREATE TABLE public.classrooms (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    department_id uuid,
    year_level integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT classrooms_pkey PRIMARY KEY (id),
    CONSTRAINT classrooms_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL
);

-- ป้องกันชื่อห้องเรียนซ้ำ
ALTER TABLE public.classrooms
  ADD CONSTRAINT classrooms_name_key UNIQUE (name);

-- ตารางข้อมูลผู้ใช้
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    first_name text,
    last_name text,
    student_id text UNIQUE,
    national_id text,
    gender text,
    email text UNIQUE,
    phone text,
    role text DEFAULT 'student'::text,
    is_active boolean DEFAULT true,
    profile_picture_url text,
    year_level integer,
    classroom_id uuid,
    department_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT profiles_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id) ON DELETE SET NULL,
    CONSTRAINT profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL
);

-- ตารางกิจกรรม
CREATE TABLE public.activities (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    activity_type text,
    location text,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status text,
    requires_photo boolean DEFAULT false,
    creator_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT activities_pkey PRIMARY KEY (id),
    CONSTRAINT activities_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ตารางประกาศ
CREATE TABLE public.announcements (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    content text,
    announcement_type text,
    priority text DEFAULT 'normal'::text,
    is_published boolean DEFAULT false,
    published_at timestamptz,
    expires_at timestamptz,
    creator_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT announcements_pkey PRIMARY KEY (id),
    CONSTRAINT announcements_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ตารางประวัติการเช็คชื่อ
CREATE TABLE public.attendance (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    student_id uuid NOT NULL,
    activity_id uuid NOT NULL,
    check_in_time timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT attendance_pkey PRIMARY KEY (id),
    CONSTRAINT attendance_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE,
    CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Trigger function เพื่ออัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ===================================
-- ขั้นตอนที่ 4: สร้าง Function handle_new_user() และ trigger
-- ===================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- สร้าง profile เบื้องต้นจาก raw_user_meta_data ของ auth.users
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    student_id,
    national_id,
    gender,
    phone,
    department_id,
    classroom_id,
    year_level,
    profile_picture_url,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'student_id', NULL), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'national_id', NULL), ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'other'),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'phone', NULL), ''),
    CASE WHEN NEW.raw_user_meta_data->>'department_id' IS NOT NULL AND NEW.raw_user_meta_data->>'department_id' != '' 
         THEN (NEW.raw_user_meta_data->>'department_id')::uuid 
         ELSE NULL 
    END,
    CASE WHEN NEW.raw_user_meta_data->>'classroom_id' IS NOT NULL AND NEW.raw_user_meta_data->>'classroom_id' != '' 
         THEN (NEW.raw_user_meta_data->>'classroom_id')::uuid 
         ELSE NULL 
    END,
    CASE WHEN NEW.raw_user_meta_data->>'year_level' IS NOT NULL AND NEW.raw_user_meta_data->>'year_level' != '' 
         THEN (NEW.raw_user_meta_data->>'year_level')::integer 
         ELSE NULL 
    END,
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'profile_picture_url', NULL), ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -------------------------
-- 5. ใส่ข้อมูลเริ่มต้น: departments
-- -------------------------
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
ON CONFLICT (name) DO NOTHING;

-- -------------------------
-- 6. ใส่ข้อมูล classrooms อัตโนมัติ (ทุกแผนก × ระดับ × ห้องย่อย)
-- -------------------------
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
  TRIM(d.name || ' ' || ly.level || ly.year_num || '/' || r.room_num) AS classroom_name,
  d.id AS department_id,
  ly.year_level_int AS year_level
FROM
  department_ids d
CROSS JOIN
  levels_and_years ly
CROSS JOIN
  rooms r
ORDER BY 
  d.name, ly.level, ly.year_num, r.room_num
ON CONFLICT (name) DO NOTHING;

-- ===================================
-- ขั้นตอนที่ 7: เปิด RLS และสร้าง Policies (ชัดเจนและปลอดภัย)
-- ===================================

-- Profiles: enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- เฉพาะผู้ใช้ที่ล็อกอิน (authenticated) สามารถเลือกดู profile ที่ is_active = true (public)
CREATE POLICY "Authenticated can read public profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_active = true);

-- ผู้ใช้แต่ละคนสามารถดู/แก้ไข profile ของตัวเอง
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Departments: enable RLS + allow authenticated to read
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read departments"
ON public.departments FOR SELECT
TO authenticated
USING (true);

-- Allow unauthenticated/public reads (for registration form to list departments)
CREATE POLICY "Public can read departments"
ON public.departments FOR SELECT
USING (true);

-- Classrooms: enable RLS + allow authenticated to read
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read classrooms"
ON public.classrooms FOR SELECT
TO authenticated
USING (true);

-- Allow unauthenticated/public reads (for registration form to list classrooms)
CREATE POLICY "Public can read classrooms"
ON public.classrooms FOR SELECT
USING (true);

-- Activities: enable RLS + allow authenticated to read
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read activities"
ON public.activities FOR SELECT
TO authenticated
USING (true);

-- Announcements: enable RLS + allow authenticated to read
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (true);

-- Attendance: enable RLS + allow authenticated to read (คุณอาจต้องเพิ่ม policy ที่เข้มขึ้นสำหรับการเขียน/สร้าง/ดูเฉพาะของตน)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (true);

-- หมายเหตุ: ถ้าต้องการให้การสร้าง/แก้ไขตารางอื่น ๆ ถูกจำกัด (เช่น activities.create by admin/creator only),
-- ให้เพิ่ม policies สำหรับ INSERT/UPDATE/DELETE ตามต้องการ.

COMMIT;
