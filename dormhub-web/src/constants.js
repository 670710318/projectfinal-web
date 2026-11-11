// ค่าคงที่ของทั้งแอป รวมไว้ที่เดียว จะเปลี่ยนข้อความหรือกติกาแก้ที่นี่ไฟล์เดียว
// กติกาตัวเลข (รหัสผ่าน รีวิว) ต้องตรงกับ config/config.go ฝั่ง Go

export const APP_NAME = 'DormHub นครปฐม';

// ---------- ที่อยู่ Backend ----------
// '' = origin เดียวกับหน้าเว็บ ตอนรันในเครื่อง CRA จะ proxy /api ไปที่ Go (localhost:8080)
export const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

// ---------- localStorage ----------
export const TOKEN_KEY = 'dormhub.token';
export const MEMBER_KEY = 'dormhub.member';

// ---------- บทบาท ----------
export const ROLE_ADMIN = 'admin';
export const ROLE_MEMBER = 'member';

// ---------- กติกาฟอร์ม ----------
export const MIN_PASSWORD_LENGTH = 8;
export const MIN_REVIEW_LENGTH = 10;
export const MAX_NOTE_LENGTH = 300;
export const MAX_BOOKING_DAYS = 90;
export const MAX_IMAGES = 10;   // รูปต่อหอ ต้องตรงกับ config.MaxImages

// ---------- ข้อความแสดงผล ----------
export const GENDER_LABELS = {
  mixed: 'หอรวม',
  female: 'หอหญิง',
  male: 'หอชาย',
};

export const BOOKING_STATUS = {
  pending: { label: 'รอยืนยัน', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  approved: { label: 'ยืนยันแล้ว', className: 'bg-pine-50 text-pine-700 ring-pine-200' },
  rejected: { label: 'ไม่สะดวก', className: 'bg-red-50 text-red-700 ring-red-200' },
  cancelled: { label: 'ยกเลิกแล้ว', className: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

// สิ่งอำนวยความสะดวกที่ Admin เลือกได้ (ชื่อต้องตรงกับที่เก็บใน dorms.facilities)
export const FACILITIES = [
  { name: 'แอร์', icon: '❄️' },
  { name: 'พัดลม', icon: '🌀' },
  { name: 'เครื่องทำน้ำอุ่น', icon: '🚿' },
  { name: 'เฟอร์นิเจอร์', icon: '🛏️' },
  { name: 'ตู้เย็น', icon: '🧊' },
  { name: 'Wi-Fi', icon: '📶' },
  { name: 'ที่จอดรถ', icon: '🅿️' },
  { name: 'คีย์การ์ด', icon: '💳' },
  { name: 'กล้องวงจรปิด', icon: '📹' },
  { name: 'รปภ. 24 ชม.', icon: '👮' },
  { name: 'ลิฟต์', icon: '🛗' },
  { name: 'เครื่องซักผ้า', icon: '🧺' },
  { name: 'ร้านสะดวกซื้อ', icon: '🏪' },
  { name: 'ฟิตเนส', icon: '🏋️' },
  { name: 'เลี้ยงสัตว์ได้', icon: '🐾' },
];

export const FACILITY_ICON = Object.fromEntries(FACILITIES.map((f) => [f.name, f.icon]));

// ช่วงงบประมาณในหน้าค้นหา (บาท/เดือน) value ใช้เป็น key ใน URL
export const PRICE_RANGES = [
  { value: '', label: 'ทุกช่วงราคา', min: '', max: '' },
  { value: 'u3000', label: 'ไม่เกิน 3,000', min: '', max: 3000 },
  { value: '3000-4500', label: '3,000 - 4,500', min: 3000, max: 4500 },
  { value: '4500-6000', label: '4,500 - 6,000', min: 4500, max: 6000 },
  { value: 'o6000', label: '6,000 ขึ้นไป', min: 6000, max: '' },
];

// การเรียง ต้องตรงกับ dormSorts ใน store/dorms.go
export const SORT_OPTIONS = [
  { value: 'recommended', label: 'แนะนำ' },
  { value: 'price_asc', label: 'ราคาต่ำไปสูง' },
  { value: 'price_desc', label: 'ราคาสูงไปต่ำ' },
  { value: 'rating', label: 'คะแนนรีวิว' },
  { value: 'newest', label: 'เพิ่มล่าสุด' },
];
