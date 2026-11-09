import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

function Footer() {
  return (
    <footer className="mt-16 bg-pine-950 text-pine-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-lg font-semibold text-white">{APP_NAME}</p>
          <p className="mt-2 text-sm text-pine-200/80">
            รวมหอพักใกล้มหาวิทยาลัยในนครปฐม ดูราคา ห้องว่าง รีวิวจากผู้เช่า และนัดดูห้องได้ในที่เดียว
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium text-white">เมนู</p>
          <ul className="mt-2 space-y-1 text-pine-200/80">
            <li><Link to="/dorms" className="hover:text-white">ค้นหาหอพัก</Link></li>
            <li><Link to="/register" className="hover:text-white">สมัครสมาชิก</Link></li>
            <li><Link to="/me/bookings" className="hover:text-white">นัดดูห้องของฉัน</Link></li>
          </ul>
        </div>
        <div className="text-sm text-pine-200/80">
          <p className="font-medium text-white">หมายเหตุ</p>
          <p className="mt-2">
            เว็บนี้เป็นโปรเจกต์ในรายวิชา ข้อมูลหอพัก ราคา และเบอร์ติดต่อเป็นข้อมูลตัวอย่างที่สมมติขึ้น
          </p>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-pine-300/70">
        © {new Date().getFullYear()} {APP_NAME} · Term Project BE-FE
      </p>
    </footer>
  );
}

export default Footer;
