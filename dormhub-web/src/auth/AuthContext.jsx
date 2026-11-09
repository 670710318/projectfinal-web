import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api/backend';
import { MEMBER_KEY, ROLE_ADMIN, TOKEN_KEY } from '../constants';

// Context = "กล่องกลาง" ที่ component ไหนในแอปก็เอื้อมมาหยิบได้
// เก็บสถานะ login ไว้ในนี้ เพราะ Navbar, หน้าหอพัก, หน้า Admin ต้องรู้เหมือนกันหมดว่าใครล็อกอินอยู่
const AuthContext = createContext(null);

function readMember() {
  try {
    return JSON.parse(localStorage.getItem(MEMBER_KEY) || 'null');
  } catch {
    return null;   // ข้อมูลใน localStorage เสีย ถือว่ายังไม่ login
  }
}

export function AuthProvider({ children }) {
  // อ่านค่าเดิมจาก localStorage จะได้ไม่หลุด login ตอน refresh
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [member, setMember] = useState(readMember);

  const saveMember = useCallback((m) => {
    setMember(m);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(m));
  }, []);

  function remember(data) {
    setToken(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    saveMember(data.member);
  }

  const logout = useCallback(() => {
    setToken(null);
    setMember(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
  }, []);

  // ตั๋วหมดอายุ (server ตอบ 401) -> backend.js เรียก logout ให้อัตโนมัติ
  useEffect(() => {
    api.setUnauthorizedHandler(logout);
    return () => api.setUnauthorizedHandler(null);
  }, [logout]);

  // ทุกครั้งที่เปิดเว็บ ถาม server ว่าตั๋วยังใช้ได้ไหม และดึงชื่อ/บทบาทล่าสุด (เผื่อ Admin เปลี่ยน role ให้)
  useEffect(() => {
    if (!token) return;
    let ignore = false;
    api.getMe(token)
      .then((m) => { if (!ignore && m) saveMember(m); })
      .catch(() => {});   // 401 ถูกจัดการโดย logout ด้านบนแล้ว error อื่น (เช่น เน็ตหลุด) ใช้ข้อมูลเดิมไปก่อน
    return () => { ignore = true; };
  }, [token, saveMember]);

  async function login(email, password) {
    const data = await api.login(email, password);      // ถ้าผิด backend.js จะ throw
    remember(data);
    return data.member;
  }

  async function register(email, password, displayName) {
    const data = await api.register(email, password, displayName);   // Go ตอบตั๋วมาเลย ไม่ต้อง login ซ้ำ
    remember(data);
    return data.member;
  }

  const value = {
    token,
    member,
    isLoggedIn: Boolean(token),
    isAdmin: Boolean(token) && member?.role === ROLE_ADMIN,
    login,
    register,
    logout,
    updateMember: saveMember,   // หลังแก้โปรไฟล์ อัปเดตชื่อบน Navbar ทันที
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// hook สั้น ๆ ให้ทุกหน้าเรียก useAuth() แทนที่จะต้อง import Context เอง
export function useAuth() {
  return useContext(AuthContext);
}
