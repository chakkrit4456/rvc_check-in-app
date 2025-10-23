-- Simple fix for RLS policies
-- This will allow all operations for testing

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;

-- Or create simple policies that allow everything
-- Uncomment the following if you want to keep RLS enabled:

-- DROP POLICY IF EXISTS "Allow all profiles" ON profiles;
-- CREATE POLICY "Allow all profiles" ON profiles FOR ALL USING (true);

-- DROP POLICY IF EXISTS "Allow all activities" ON activities;
-- CREATE POLICY "Allow all activities" ON activities FOR ALL USING (true);

-- DROP POLICY IF EXISTS "Allow all attendance" ON attendance_records;
-- CREATE POLICY "Allow all attendance" ON attendance_records FOR ALL USING (true);

-- DROP POLICY IF EXISTS "Allow all announcements" ON announcements;
-- CREATE POLICY "Allow all announcements" ON announcements FOR ALL USING (true);

-- DROP POLICY IF EXISTS "Allow all classrooms" ON classrooms;
-- CREATE POLICY "Allow all classrooms" ON classrooms FOR ALL USING (true);

-- DROP POLICY IF EXISTS "Allow all departments" ON departments;
-- CREATE POLICY "Allow all departments" ON departments FOR ALL USING (true);



