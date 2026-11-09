import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_ADMIN } from '../constants';

// ครอบหน้าที่ต้อง login
//   <ProtectedRoute>            = Member ขึ้นไป
//   <ProtectedRoute role="admin"> = Admin เท่านั้น
// ยังไม่ login -> ส่งไปหน้า /login แล้วจำไว้ว่ามาจากไหน
// login แล้วแต่ไม่ใช่ Admin -> แสดงหน้า "ไม่มีสิทธิ์" (ถึงจะแอบเข้า URL ได้ Go ก็ตอบ 403 อยู่ดี)
function ProtectedRoute({ children, role }) {
  const { isLoggedIn, member } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role === ROLE_ADMIN && member?.role !== ROLE_ADMIN) {
    return (
      <div className="page text-center">
        <p className="text-5xl" aria-hidden="true">🔒</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-slate-900">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="mt-2 text-slate-500">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
        <Link to="/" className="btn-outline mt-6">กลับหน้าแรก</Link>
      </div>
    );
  }
  return children;
}

export default ProtectedRoute;
