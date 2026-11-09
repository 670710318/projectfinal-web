import { BOOKING_STATUS } from '../constants';

// ป้ายสถานะคำขอนัดดูห้อง ใช้ทั้งหน้า Member และหน้า Admin
function StatusBadge({ status }) {
  const s = BOOKING_STATUS[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 ring-slate-200' };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.className}`}>
      {s.label}
    </span>
  );
}

export default StatusBadge;
