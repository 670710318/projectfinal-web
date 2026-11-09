// ฟังก์ชันจัดรูปแบบข้อความ แยกจาก component เพื่อให้เทสต์ง่าย (ดู format.test.js)

const baht = new Intl.NumberFormat('th-TH');

// 4200 -> "4,200"
export function formatNumber(n) {
  return n == null ? '-' : baht.format(n);
}

// ช่วงราคาบนการ์ด: ไม่มีห้อง / ราคาเดียว / ช่วงราคา
export function priceText(min, max) {
  if (min == null) return 'ยังไม่ระบุราคา';
  if (max == null || min === max) return `${formatNumber(min)} บาท/เดือน`;
  return `${formatNumber(min)} - ${formatNumber(max)} บาท/เดือน`;
}

// "2026-11-20" หรือ ISO timestamp -> "20 พ.ย. 2569"
export function formatDate(value) {
  if (!value) return '-';
  // วันที่ล้วน (YYYY-MM-DD) ต้องตีความเป็นวันของไทย ไม่ใช่เที่ยงคืน UTC
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+07:00`) : new Date(value);
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' });
}

// วันที่วันนี้ตามเวลาไทยในรูปแบบ YYYY-MM-DD (ใช้เป็นค่า min ของช่องเลือกวัน)
export function todayISO(now = new Date()) {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// บวกวันจากวันที่แบบ YYYY-MM-DD
export function addDaysISO(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// อักษรตัวแรกของชื่อ ใช้ทำรูปแทนเมื่อหอไม่มีรูป
export function initial(name) {
  return (name || '?').trim().charAt(0) || '?';
}
