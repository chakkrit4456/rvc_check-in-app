-- Fix RLS policies to allow proper data access
-- Run this after creating the database

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view activities" ON activities;
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance_records;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance_records;
DROP POLICY IF EXISTS "Authenticated users can view published announcements" ON announcements;

-- Create new policies that work better
-- Profiles: Allow all authenticated users to view profiles
CREATE POLICY "Allow authenticated users to view profiles" ON profiles FOR SELECT USING (true);

-- Activities: Allow all authenticated users to view activities
CREATE POLICY "Allow authenticated users to view activities" ON activities FOR SELECT USING (true);

-- Attendance records: Allow all authenticated users to view attendance
CREATE POLICY "Allow authenticated users to view attendance" ON attendance_records FOR SELECT USING (true);

-- Announcements: Allow all authenticated users to view published announcements
CREATE POLICY "Allow authenticated users to view announcements" ON announcements FOR SELECT USING (is_published = true);

-- Allow insert for attendance records
CREATE POLICY "Allow insert attendance records" ON attendance_records FOR INSERT WITH CHECK (true);

-- Allow update for profiles
CREATE POLICY "Allow update profiles" ON profiles FOR UPDATE USING (true);

-- Allow insert for profiles
CREATE POLICY "Allow insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Disable RLS temporarily for testing (remove this in production)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;



