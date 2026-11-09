import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { APP_NAME } from '../constants';

const linkClass = ({ isActive }) =>
  'rounded-lg px-3 py-2 text-sm transition ' +
  (isActive ? 'bg-pine-50 font-medium text-pine-800' : 'text-slate-600 hover:bg-slate-50 hover:text-pine-700');

// เมนูเปลี่ยนตามบทบาท: Guest เห็นแค่หน้าสาธารณะ, Member เห็นเมนูของฉัน, Admin เห็นเมนูจัดการระบบเพิ่ม
// (การซ่อนเมนูเป็นแค่ความสะดวก การกันสิทธิ์จริงอยู่ที่ ProtectedRoute และ middleware ฝั่ง Go)
function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" onClick={close} className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          <span className="font-display text-lg font-semibold text-pine-800">{APP_NAME}</span>
        </Link>

        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="เปิดเมนู"
                className="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 md:hidden">
          {open ? 'ปิด' : 'เมนู'}
        </button>

        <div className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-slate-200 bg-white p-4 shadow-md
                         md:static md:ml-6 md:flex md:flex-1 md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          <NavLink to="/" end className={linkClass} onClick={close}>หน้าแรก</NavLink>
          <NavLink to="/dorms" className={linkClass} onClick={close}>ค้นหาหอพัก</NavLink>
          {isLoggedIn && <NavLink to="/me/favorites" className={linkClass} onClick={close}>รายการโปรด</NavLink>}
          {isLoggedIn && <NavLink to="/me/bookings" className={linkClass} onClick={close}>นัดดูห้องของฉัน</NavLink>}
          {isAdmin && <NavLink to="/admin" className={linkClass} onClick={close}>จัดการระบบ</NavLink>}

          <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-3 md:ml-auto md:mt-0 md:border-0 md:pt-0">
            {isLoggedIn ? (
              <>
                <NavLink to="/me/profile" className={linkClass} onClick={close}>
                  👤 {member?.displayName}{isAdmin && <span className="ml-1 rounded bg-sand-100 px-1.5 text-xs text-sand-700">Admin</span>}
                </NavLink>
                <button type="button" onClick={handleLogout} className="btn-outline py-1.5">ออกจากระบบ</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={close} className="btn-outline py-1.5">เข้าสู่ระบบ</Link>
                <Link to="/register" onClick={close} className="btn-primary py-1.5">สมัครสมาชิก</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
