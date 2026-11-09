import { NavLink, Outlet } from 'react-router-dom';

const tabClass = ({ isActive }) =>
  'whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ' +
  (isActive ? 'bg-pine-700 font-medium text-white' : 'text-slate-600 hover:bg-white hover:text-pine-700');

// โครงหน้า Admin: แถบเมนูด้านบน + หน้าย่อยแสดงใน <Outlet />
// ทั้งก้อนนี้ครอบด้วย <ProtectedRoute role="admin"> ใน App.jsx
function AdminLayout() {
  return (
    <div className="page">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-sand-700">Admin</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">จัดการระบบ</h1>
        </div>
      </div>
      <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" aria-label="เมนูผู้ดูแลระบบ">
        <NavLink to="/admin" end className={tabClass}>ภาพรวม</NavLink>
        <NavLink to="/admin/dorms" className={tabClass}>หอพัก</NavLink>
        <NavLink to="/admin/bookings" className={tabClass}>คำขอนัดดูห้อง</NavLink>
        <NavLink to="/admin/members" className={tabClass}>สมาชิก</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

export default AdminLayout;
