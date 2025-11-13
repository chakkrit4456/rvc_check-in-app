create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Creates a trigger that fires the handle_new_user function
-- after a new user is inserted into auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ขั้นตอนที่ 2: ลบตารางทั้งหมดโดยใช้ CASCADE เพื่อจัดการ dependency อัตโนมัติ
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.classrooms CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- ขั้นตอนที่ 3: สร้างตารางทั้งหมดขึ้นมาใหม่

-- ตารางแผนกวิชา
CREATE TABLE public.departments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT departments_pkey PRIMARY KEY (id)
);

-- ตารางห้องเรียน
CREATE TABLE public.classrooms (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    department_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT classrooms_pkey PRIMARY KEY (id),
    CONSTRAINT classrooms_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL
);

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

-- ตารางประวัติการเช็คชื่อ (ใช้ชื่อ attendance ตาม error)
CREATE TABLE public.attendance (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    student_id uuid NOT NULL,
    activity_id uuid NOT NULL,
    check_in_time timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT attendance_pkey PRIMARY KEY (id),
    CONSTRAINT attendance_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE,
    CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- ขั้นตอนที่ 4: สร้างฟังก์ชันและทริกเกอร์สำหรับสร้างโปรไฟล์อัตโนมัติ
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
