import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelBooking, getMyBookings } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorBox, Loading } from '../components/StatusViews';
import { formatDate } from '../utils/format';

// คำขอนัดดูห้องของฉัน: ดูสถานะที่ Admin ตอบกลับ และยกเลิกคำขอที่ยังรอได้
function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    getMyBookings(token)
      .then((items) => { if (!ignore) { setBookings(items); setStatus('success'); } })
      .catch((err) => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function handleCancel(b) {
    if (!window.confirm(`ยกเลิกนัดดูห้องที่ ${b.dormName} ใช่ไหม`)) return;
    setBusyId(b.id);
    try {
      const updated = await cancelBooking(b.id, token);
      setBookings((list) => list.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page max-w-4xl">
      <h1 className="font-display text-3xl font-semibold text-slate-900">นัดดูห้องของฉัน</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">ส่งคำขอได้จากหน้ารายละเอียดหอพัก หอจะยืนยันนัดผ่านระบบนี้</p>

      {status === 'loading' && <Loading label="กำลังโหลดคำขอ..." />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {status === 'success' && bookings.length === 0 && (
        <EmptyState icon="📅" title="ยังไม่มีคำขอนัดดูห้อง" hint="เลือกหอที่สนใจแล้วกดส่งคำขอนัดดูห้อง">
          <Link to="/dorms" className="btn-primary">ค้นหาหอพัก</Link>
        </EmptyState>
      )}
      {status === 'success' && bookings.length > 0 && (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/dorms/${b.dormId}`} className="font-display text-lg font-semibold text-slate-900 hover:text-pine-700">
                    {b.dormName}
                  </Link>
                  <p className="text-sm text-slate-500">
                    วันที่นัด {formatDate(b.visitDate)}{b.roomName && ` · ${b.roomName}`} · โทร {b.contactPhone}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              {b.note && <p className="mt-3 text-sm text-slate-600">ข้อความของฉัน: {b.note}</p>}
              {b.adminNote && <p className="mt-2 rounded-lg bg-sand-100/70 px-3 py-2 text-sm text-slate-700">ตอบกลับจากหอพัก: {b.adminNote}</p>}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>ส่งเมื่อ {formatDate(b.createdAt)}</span>
                {b.status === 'pending' && (
                  <button type="button" onClick={() => handleCancel(b)} disabled={busyId === b.id} className="btn-danger py-1 text-xs">
                    {busyId === b.id ? 'กำลังยกเลิก...' : 'ยกเลิกคำขอ'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyBookings;
