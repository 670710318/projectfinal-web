// ชั้นกลางสำหรับคุยกับ Backend Go ของทีม
// ทุกหน้าเรียกฟังก์ชันในไฟล์นี้ ไม่มีหน้าไหนเรียก fetch เอง (จะเปลี่ยนที่อยู่ API หรือรูปแบบ error แก้ที่นี่ที่เดียว)
import { API_URL } from '../constants';

// เมื่อ server ตอบ 401 กับคำขอที่แนบตั๋วไป แปลว่าตั๋วหมดอายุ ให้ AuthContext สั่ง logout
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// ฟังก์ชันเดียวที่ fetch จริง ทุกฟังก์ชันด้านล่างเรียกผ่านตัวนี้
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };   // 1) บอก server ว่า body เป็น JSON
  if (token) headers.Authorization = `Bearer ${token}`;      //    และแนบตั๋วถ้ามี

  let res;
  try {
    res = await fetch(API_URL + path, {                      // 2) ยิงจริง
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch โยน error เมื่อไปไม่ถึง server เลย (เน็ตหลุด, CORS, Render กำลังตื่น)
    throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้งในอีกสักครู่');
  }

  if (res.status === 204) return null;                       // 3) สำเร็จแต่ไม่มี body ให้อ่าน

  const data = await res.json()                              //    อ่านคำตอบเป็น JSON
    .catch(() => ({ error: { message: 'server ไม่ได้ตอบเป็น JSON' } }));

  if (!res.ok) {                                             // 4) 400 / 401 / 403 / 404 / 409 / 500
    // Go ตอบ {"error":{"code","message"}} ดึง message มาแสดง
    const message = data?.error?.message
      || (typeof data?.error === 'string' ? data.error : null)
      || `server ตอบกลับ ${res.status}`;
    const err = new Error(message);
    err.status = res.status;                                 //    แนบเลขไว้ให้หน้าเว็บใช้ต่อ
    err.code = data?.error?.code;
    if (res.status === 401 && token && onUnauthorized) onUnauthorized();
    throw err;
  }
  return data;
}

// แปลง object เป็น query string โดยข้ามค่าว่าง  { zone: 'salaya', q: '' } -> "?zone=salaya"
export function toQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v != null && v !== false) sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ---------- สมาชิก ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } }); // ได้ { token, member }
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });                 // ได้ { token, member }
}
export function getMe(token) {
  return apiFetch('/api/me', { token });
}
export function updateMe(profile, token) {
  return apiFetch('/api/me', { method: 'PUT', body: profile, token });                               // { displayName, phone }
}
export function changePassword(currentPassword, newPassword, token) {
  return apiFetch('/api/me/password', { method: 'PUT', body: { currentPassword, newPassword }, token });
}

// ---------- หอพัก (Guest ดูได้) ----------
export async function getZones() {
  const data = await apiFetch('/api/zones');
  return data.items;
}
export async function getDorms(filters = {}) {
  const data = await apiFetch('/api/dorms' + toQuery(filters));
  return data.items;
}
export function getDorm(id) {
  return apiFetch(`/api/dorms/${id}`);
}

// ---------- รีวิว ----------
export async function getReviews(dormId) {
  const data = await apiFetch(`/api/dorms/${dormId}/reviews`);
  return data.items;
}
export function postReview(dormId, rating, text, token) {
  return apiFetch(`/api/dorms/${dormId}/reviews`, { method: 'POST', body: { rating, text }, token });
}
export function deleteReview(reviewId, token) {
  return apiFetch(`/api/reviews/${reviewId}`, { method: 'DELETE', token });
}

// ---------- รายการโปรด ----------
export async function getFavorites(token) {
  const data = await apiFetch('/api/me/favorites', { token });
  return data.items;
}
export function addFavorite(dormId, token) {
  return apiFetch(`/api/me/favorites/${dormId}`, { method: 'PUT', token });
}
export function removeFavorite(dormId, token) {
  return apiFetch(`/api/me/favorites/${dormId}`, { method: 'DELETE', token });
}

// ---------- นัดดูห้อง ----------
export function createBooking(dormId, booking, token) {
  return apiFetch(`/api/dorms/${dormId}/bookings`, { method: 'POST', body: booking, token }); // { roomId, visitDate, contactPhone, note }
}
export async function getMyBookings(token) {
  const data = await apiFetch('/api/me/bookings', { token });
  return data.items;
}
export function cancelBooking(bookingId, token) {
  return apiFetch(`/api/me/bookings/${bookingId}/cancel`, { method: 'POST', token });
}

// ---------- Admin ----------
export function getStats(token) {
  return apiFetch('/api/admin/stats', { token });
}
export async function adminGetDorms(token) {
  const data = await apiFetch('/api/admin/dorms', { token });
  return data.items;
}
export function adminGetDorm(id, token) {
  return apiFetch(`/api/admin/dorms/${id}`, { token });
}
export function adminCreateDorm(dorm, token) {
  return apiFetch('/api/admin/dorms', { method: 'POST', body: dorm, token });
}
export function adminUpdateDorm(id, dorm, token) {
  return apiFetch(`/api/admin/dorms/${id}`, { method: 'PUT', body: dorm, token });
}
export function adminDeleteDorm(id, token) {
  return apiFetch(`/api/admin/dorms/${id}`, { method: 'DELETE', token });
}
export async function adminGetBookings(status, token) {
  const data = await apiFetch('/api/admin/bookings' + toQuery({ status }), { token });
  return data.items;
}
export function adminDecideBooking(id, status, adminNote, token) {
  return apiFetch(`/api/admin/bookings/${id}`, { method: 'PUT', body: { status, adminNote }, token });
}
export async function adminGetMembers(token) {
  const data = await apiFetch('/api/admin/members', { token });
  return data.items;
}
export function adminSetRole(id, role, token) {
  return apiFetch(`/api/admin/members/${id}/role`, { method: 'PUT', body: { role }, token });
}
