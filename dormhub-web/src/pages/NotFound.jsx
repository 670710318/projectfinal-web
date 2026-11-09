import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="page text-center">
      <p className="font-display text-6xl font-semibold text-pine-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-slate-900">ไม่พบหน้านี้</h1>
      <p className="mt-2 text-slate-500">ลิงก์อาจพิมพ์ผิด หรือหน้านี้ถูกย้ายไปแล้ว</p>
      <Link to="/" className="btn-primary mt-6">กลับหน้าแรก</Link>
    </div>
  );
}

export default NotFound;
