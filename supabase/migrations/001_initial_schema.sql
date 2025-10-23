-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE activity_status AS ENUM ('active', 'inactive', 'completed', 'cancelled');

-- Create departments table
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classrooms table
CREATE TABLE classrooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    year_level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE, -- รหัสนักศึกษา
    national_id VARCHAR(13) UNIQUE, -- เลขบัตรประชาชน
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    year_level INTEGER,
    role user_role DEFAULT 'student',
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50) NOT NULL, -- เช่น 'morning_assembly', 'event', 'meeting'
    location VARCHAR(200),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status activity_status DEFAULT 'active',
    requires_photo BOOLEAN DEFAULT true,
    target_classrooms UUID[] DEFAULT '{}', -- Array of classroom IDs
    target_departments UUID[] DEFAULT '{}', -- Array of department IDs
    target_year_levels INTEGER[] DEFAULT '{}', -- Array of year levels
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table
CREATE TABLE attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'present',
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    photo_url TEXT, -- URL to photo in Supabase Storage
    photo_metadata JSONB, -- Store photo metadata like location, device info
    notes TEXT,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, activity_id) -- Prevent duplicate check-ins
);

-- Create announcements table
CREATE TABLE announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(50) DEFAULT 'general', -- 'general', 'activity', 'emergency'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'students', 'staff', 'specific_class'
    target_classrooms UUID[] DEFAULT '{}',
    target_departments UUID[] DEFAULT '{}',
    target_year_levels INTEGER[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table (for additional admin management)
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    admin_level VARCHAR(20) DEFAULT 'standard', -- 'standard', 'super'
    permissions JSONB DEFAULT '{}', -- Store specific permissions
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_student_id ON profiles(student_id);
CREATE INDEX idx_profiles_national_id ON profiles(national_id);
CREATE INDEX idx_profiles_classroom_id ON profiles(classroom_id);
CREATE INDEX idx_profiles_department_id ON profiles(department_id);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE INDEX idx_activities_start_time ON activities(start_time);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_created_by ON activities(created_by);

CREATE INDEX idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_activity_id ON attendance_records(activity_id);
CREATE INDEX idx_attendance_records_check_in_time ON attendance_records(check_in_time);

CREATE INDEX idx_announcements_published ON announcements(is_published);
CREATE INDEX idx_announcements_expires_at ON announcements(expires_at);
CREATE INDEX idx_announcements_created_by ON announcements(created_by);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Activities: All authenticated users can view active activities
CREATE POLICY "Authenticated users can view activities" ON activities FOR SELECT USING (auth.role() = 'authenticated');

-- Attendance records: Users can view their own records, admins can view all
CREATE POLICY "Users can view own attendance" ON attendance_records FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all attendance" ON attendance_records FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Announcements: All authenticated users can view published announcements
CREATE POLICY "Authenticated users can view published announcements" ON announcements FOR SELECT USING (is_published = true);

-- Insert sample data
INSERT INTO departments (name, description) VALUES 
('เทคโนโลยีสารสนเทศ', 'แผนกเทคโนโลยีสารสนเทศและการสื่อสาร'),
('บริหารธุรกิจ', 'แผนกบริหารธุรกิจและการจัดการ'),
('วิศวกรรมศาสตร์', 'แผนกวิศวกรรมศาสตร์และเทคโนโลยี');

INSERT INTO classrooms (name, department_id, year_level) VALUES 
('ม.5/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศ'), 5),
('ม.5/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศ'), 5),
('ม.6/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศ'), 6),
('ม.6/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศ'), 6),
('1/1', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศ'), 1),
('1/2', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศ'), 1),
('1/3', (SELECT id FROM departments WHERE name = 'เทคโนโลยีสารสนเทศ'), 1);

