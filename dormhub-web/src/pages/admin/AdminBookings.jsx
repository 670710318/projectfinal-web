import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDecideBooking, adminGetBookings } from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { EmptyState, ErrorBox, Loading } from '../../components/StatusViews';
import { BOOKING_STATUS } from '../../constants';
import { formatDate } from '../../utils/format';

const TABS = [['pending', 'รอยืนยัน'], ['', 'ทั้งหมด'], ['approved', 'ยืนยันแล้ว'], ['rejected', 'ไม่สะดวก'], ['cancelled', 'ยกเลิก']];

// Admin ตอบคำขอนัดดูห้อง: อนุมัติ / ปฏิเสธ พร้อมข้อความถึงสมาชิก
function AdminBookings() {
  const { token } = useAuth();
  const [tab, setTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    adminGetBookings(tab, token)
      .then((items) => { if (!ignore) { setBookings(items); setStatus('success'); } })
      .catch((err) => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [tab, token, reloadKey]);

  function replace(updated) {
    setBookings((list) =>
      tab === '' ? list.map((b) => (b.id === updated.id ? updated : b)) : list.filter((b) => b.id !== updated.id),
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="สถานะคำขอ">
        {TABS.map(([value, label]) => (
          <button key={value || 'all'} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}
                  className={`rounded-full border px-3 py-1 text-sm ${tab === value ? 'border-pine-700 bg-pine-700 text-white' : 'border-slate-300 bg-white text-slate-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {status === 'success' && bookings.length === 0 && (
        <EmptyState icon="📭" title={tab ? `ไม่มีคำขอสถานะ "${BOOKING_STATUS[tab].label}"` : 'ยังไม่มีคำขอนัดดูห้อง'} />
      )}
      {status === 'success' && bookings.length > 0 && (
        <ul className="space-y-3">
          {bookings.map((b) => <BookingRow key={b.id} booking={b} token={token} onChanged={replace} />)}
        </ul>
      )}
    </div>
  );
}

function BookingRow({ booking: b, token, onChanged }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(null);     // 'approved' | 'rejected' | null
  const [error, setError] = useState(null);

  async function decide(status) {
    setBusy(status);
    setError(null);
    try {
      onChanged(await adminDecideBooking(b.id, status, note.trim(), token));
    } catch (err) {
      setError(err);                          // เช่น 409 สมาชิกยกเลิกไปก่อนแล้ว
      setBusy(null);
    }
  }

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={`/dorms/${b.dormId}`} className="font-display text-lg font-semibold text-slate-900 hover:text-pine-700">{b.dormName}</Link>
          <p className="text-sm text-slate-600">
            {b.member?.displayName} · {b.memberEmail} · โทร {b.contactPhone}
          </p>
          <p className="text-sm text-slate-500">
            วันที่นัด <span className="font-medium text-slate-800">{formatDate(b.visitDate)}</span>
            {b.roomName && ` · ${b.roomName}`} · ส่งเมื่อ {formatDate(b.createdAt)}
          </p>
        </div>
        <StatusBadge status={b.status} />
      </div>
      {b.note && <p className="mt-3 text-sm text-slate-700">ข้อความจากสมาชิก: {b.note}</p>}
      {b.adminNote && <p className="mt-2 text-sm text-slate-500">หมายเหตุที่ตอบไป: {b.adminNote}</p>}

      {b.status === 'pending' && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300}
                 placeholder="ข้อความถึงสมาชิก (ไม่บังคับ) เช่น เจอกันที่ล็อบบี้ 14.00 น." aria-label="ข้อความถึงสมาชิก"
                 className="input min-w-[16rem] flex-1" />
          <button type="button" onClick={() => decide('approved')} disabled={busy !== null} className="btn-primary">
            {busy === 'approved' ? 'กำลังบันทึก...' : 'ยืนยันนัด'}
          </button>
          <button type="button" onClick={() => decide('rejected')} disabled={busy !== null} className="btn-danger">
            {busy === 'rejected' ? 'กำลังบันทึก...' : 'ไม่สะดวก'}
          </button>
          {error && <p role="alert" className="w-full text-sm text-red-600">{error.message}</p>}
        </div>
      )}
    </li>
  );
}

export default AdminBookings;
