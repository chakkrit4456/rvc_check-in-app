// utils/validation.ts

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class Validator {
  private rules: Record<string, ValidationRule> = {};

  addRule(field: string, rule: ValidationRule): Validator {
    this.rules[field] = rule;
    return this;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(this.rules)) {
      const value = data[field];
      const error = this.validateField(value, rule, field);
      
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private validateField(value: any, rule: ValidationRule, field: string): string | null {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${this.getFieldLabel(field)} จำเป็นต้องกรอก`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return `${this.getFieldLabel(field)} ต้องมีอย่างน้อย ${rule.minLength} ตัวอักษร`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return `${this.getFieldLabel(field)} ต้องมีไม่เกิน ${rule.maxLength} ตัวอักษร`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${this.getFieldLabel(field)} รูปแบบไม่ถูกต้อง`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      email: 'อีเมล',
      password: 'รหัสผ่าน',
      confirm_password: 'ยืนยันรหัสผ่าน',
      first_name: 'ชื่อ',
      last_name: 'นามสกุล',
      student_id: 'รหัสนักศึกษา',
      national_id: 'เลขบัตรประชาชน',
      phone: 'เบอร์โทรศัพท์',
      classroom_id: 'ห้องเรียน',
      year_level: 'ชั้นปี',
      gender: 'เพศ',
      title: 'หัวข้อ',
      content: 'เนื้อหา',
      description: 'คำอธิบาย',
      location: 'สถานที่',
      start_time: 'เวลาเริ่ม',
      end_time: 'เวลาสิ้นสุด',
    };

    return labels[field] || field;
  }
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10}$/,
  nationalId: /^[0-9]{13}$/,
  studentId: /^[A-Z0-9]{6,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
};

// Validation functions
export const validateEmail = (email: string): string | null => {
  if (!email) return 'กรุณากรอกอีเมล';
  if (!patterns.email.test(email)) return 'รูปแบบอีเมลไม่ถูกต้อง';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'กรุณากรอกรหัสผ่าน';
  if (password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  if (password.length > 50) return 'รหัสผ่านต้องมีไม่เกิน 50 ตัวอักษร';
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'กรุณายืนยันรหัสผ่าน';
  if (password !== confirmPassword) return 'รหัสผ่านไม่ตรงกัน';
  return null;
};

export const validateNationalId = (nationalId: string): string | null => {
  if (!nationalId) return 'กรุณากรอกเลขบัตรประชาชน';
  if (!patterns.nationalId.test(nationalId)) return 'เลขบัตรประชาชนต้องมี 13 หลัก';
  
  // Validate Thai National ID checksum
  if (!validateThaiNationalId(nationalId)) {
    return 'เลขบัตรประชาชนไม่ถูกต้อง';
  }
  
  return null;
};

export const validateStudentId = (studentId: string): string | null => {
  if (!studentId) return 'กรุณากรอกรหัสนักศึกษา';
  if (!patterns.studentId.test(studentId)) return 'รูปแบบรหัสนักศึกษาไม่ถูกต้อง';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Phone is optional
  if (!patterns.phone.test(phone)) return 'เบอร์โทรศัพท์ต้องมี 10 หลัก';
  return null;
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `กรุณากรอก${fieldName}`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.length < minLength) {
    return `${fieldName} ต้องมีอย่างน้อย ${minLength} ตัวอักษร`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.length > maxLength) {
    return `${fieldName} ต้องมีไม่เกิน ${maxLength} ตัวอักษร`;
  }
  return null;
};

// Thai National ID validation
function validateThaiNationalId(nationalId: string): boolean {
  if (nationalId.length !== 13) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(nationalId[i]) * (13 - i);
  }
  
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(nationalId[12]);
}

// Form validation helpers
export const validateLoginForm = (data: { email: string; password: string }): ValidationResult => {
  const validator = new Validator()
    .addRule('email', { required: true, custom: validateEmail })
    .addRule('password', { required: true, custom: validatePassword });

  return validator.validate(data);
};

export const validateRegisterForm = (data: any): ValidationResult => {
  const validator = new Validator()
    .addRule('student_id', { required: true, custom: validateStudentId })
    .addRule('national_id', { required: true, custom: validateNationalId })
    .addRule('first_name', { required: true, minLength: 2, maxLength: 50 })
    .addRule('last_name', { required: true, minLength: 2, maxLength: 50 })
    .addRule('email', { required: true, custom: validateEmail })
    .addRule('phone', { custom: validatePhone })
    .addRule('classroom_id', { required: true })
    .addRule('year_level', { required: true })
    .addRule('password', { required: true, custom: validatePassword })
    .addRule('confirm_password', { 
      required: true, 
      custom: (value) => validateConfirmPassword(data.password, value)
    });

  return validator.validate(data);
};

export const validateActivityForm = (data: any): ValidationResult => {
  const validator = new Validator()
    .addRule('title', { required: true, minLength: 5, maxLength: 200 })
    .addRule('description', { maxLength: 1000 })
    .addRule('activity_type', { required: true })
    .addRule('start_time', { required: true })
    .addRule('end_time', { required: true })
    .addRule('location', { maxLength: 200 });

  return validator.validate(data);
};

export const validateAnnouncementForm = (data: any): ValidationResult => {
  const validator = new Validator()
    .addRule('title', { required: true, minLength: 5, maxLength: 200 })
    .addRule('content', { required: true, minLength: 10, maxLength: 2000 });

  return validator.validate(data);
};

// Date validation
export const validateDateRange = (startDate: string, endDate: string): string | null => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม';
  }
  
  return null;
};

export const validateFutureDate = (date: string): string | null => {
  const inputDate = new Date(date);
  const now = new Date();
  
  if (inputDate <= now) {
    return 'วันที่ต้องเป็นอนาคต';
  }
  
  return null;
};

// File validation
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return 'ไฟล์ต้องเป็นรูปภาพ (JPG, PNG, GIF)';
  }
  
  if (file.size > maxSize) {
    return 'ขนาดไฟล์ต้องไม่เกิน 5MB';
  }
  
  return null;
};

// Utility functions
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join('\n');
};

export const hasValidationErrors = (result: ValidationResult): boolean => {
  return !result.isValid;
};

export const getFirstError = (result: ValidationResult): string | null => {
  const errors = Object.values(result.errors);
  return errors.length > 0 ? errors[0] : null;
};
