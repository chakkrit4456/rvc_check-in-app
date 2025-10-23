# การแก้ไขปัญหา Supabase 500 Error

## ปัญหาที่พบ:
- Error 500 จาก Supabase API
- ไม่สามารถดึงข้อมูล profiles ได้
- RLS policies ทำงานไม่ถูกต้อง

## วิธีแก้ไข:

### 1. รันไฟล์แก้ไข RLS Policies
```sql
-- รันไฟล์นี้ใน Supabase SQL Editor
\i supabase/fix_rls_policies.sql
```

### 2. ตรวจสอบการตั้งค่า Supabase

#### 2.1 ตรวจสอบ URL และ Key
```typescript
// ในไฟล์ services/supabaseClient.ts
const SUPABASE_URL = 'http://127.0.0.1:54321'  // ตรวจสอบ URL
const SUPABASE_ANON_KEY = 'your_anon_key'      // ตรวจสอบ Key
```

#### 2.2 ตรวจสอบการเชื่อมต่อ
```bash
# ตรวจสอบว่า Supabase ทำงานอยู่
curl http://127.0.0.1:54321/rest/v1/
```

### 3. แก้ไขปัญหา RLS Policies

#### 3.1 ปิด RLS ชั่วคราว (สำหรับการทดสอบ)
```sql
-- รันใน Supabase SQL Editor
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
```

#### 3.2 หรือสร้าง Policies ใหม่
```sql
-- สร้าง policies ที่ทำงานได้ดีกว่า
CREATE POLICY "Allow all for testing" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON announcements FOR ALL USING (true);
```

### 4. ตรวจสอบข้อมูลในฐานข้อมูล

#### 4.1 ตรวจสอบว่ามีข้อมูล profiles
```sql
SELECT * FROM profiles LIMIT 5;
```

#### 4.2 ตรวจสอบว่ามีข้อมูล activities
```sql
SELECT * FROM activities LIMIT 5;
```

#### 4.3 ตรวจสอบว่ามีข้อมูล classrooms
```sql
SELECT * FROM classrooms LIMIT 5;
```

### 5. การทดสอบการเชื่อมต่อ

#### 5.1 ทดสอบการดึงข้อมูล profiles
```sql
SELECT * FROM profiles WHERE student_id = 'admin';
```

#### 5.2 ทดสอบการดึงข้อมูล activities
```sql
SELECT * FROM activities WHERE status = 'active';
```

### 6. การแก้ไขปัญหาในโค้ด

#### 6.1 เพิ่ม Error Handling
```typescript
// ใน auth.ts
if (profileError) {
  console.error('Profile fetch error:', profileError);
  // แสดง error message ที่เข้าใจง่าย
  return {
    success: false,
    message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้',
  };
}
```

#### 6.2 เพิ่ม Fallback Data
```typescript
// ใน DashboardScreen.tsx
const defaultStats: DashboardStats = {
  total_activities: 0,
  active_activities: 0,
  attendance_count: 0,
  attendance_rate: 0,
  recent_activities: [],
  upcoming_activities: [],
};
setStats(defaultStats);
```

### 7. การทดสอบระบบ

#### 7.1 ทดสอบการล็อกอิน
- ใช้ข้อมูล: student_id = 'admin', national_id = '66202040013'
- ตรวจสอบ console logs
- ตรวจสอบ AsyncStorage

#### 7.2 ทดสอบการดึงข้อมูล
- ตรวจสอบ Network tab ใน DevTools
- ตรวจสอบ Supabase logs
- ตรวจสอบ RLS policies

### 8. การแก้ไขปัญหาเฉพาะ

#### 8.1 หาก Supabase ไม่ทำงาน
```bash
# รีสตาร์ท Supabase
supabase stop
supabase start
```

#### 8.2 หากมีปัญหา RLS
```sql
-- ลบ policies เก่า
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- สร้าง policies ใหม่
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true);
```

#### 8.3 หากมีปัญหา CORS
```typescript
// ตรวจสอบการตั้งค่า CORS ใน Supabase
// ไปที่ Settings > API > CORS
```

### 9. การ Debug

#### 9.1 เปิด Console Logs
```typescript
// เพิ่มใน auth.ts
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey);
```

#### 9.2 ตรวจสอบ Network Requests
- เปิด DevTools > Network
- ดู requests ไปยัง Supabase
- ตรวจสอบ status codes

#### 9.3 ตรวจสอบ Supabase Logs
- ไปที่ Supabase Dashboard > Logs
- ดู error messages
- ตรวจสอบ RLS violations

### 10. การทดสอบขั้นสุดท้าย

#### 10.1 ทดสอบการล็อกอิน
```bash
# ใช้ข้อมูลทดสอบ
Student ID: admin
National ID: 66202040013
```

#### 10.2 ทดสอบการดึงข้อมูล
- Dashboard ควรแสดงข้อมูล
- Checkin ควรแสดงกิจกรรม
- Profile ควรแสดงข้อมูลผู้ใช้

## หมายเหตุ:
- หากยังมีปัญหา ให้ตรวจสอบ Supabase logs
- ตรวจสอบการตั้งค่า RLS policies
- ตรวจสอบการเชื่อมต่อฐานข้อมูล



