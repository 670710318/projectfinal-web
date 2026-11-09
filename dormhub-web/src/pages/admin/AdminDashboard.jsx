import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { ErrorBox, Loading } from '../../components/StatusViews';

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    getStats(token)
      .then((s) => { if (!ignore) { setStats(s); setStatus('success'); } })
      .catch((err) => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [token, reloadKey]);

  if (status === 'loading') return <Loading rows={2} />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  const cards = [
    { label: 'คำขอรอยืนยัน', value: stats.pendingBookings, to: '/admin/bookings', highlight: stats.pendingBookings > 0 },
    { label: 'หอพักทั้งหมด', value: stats.dorms, note: `เผยแพร่ ${stats.publishedDorms} หอ`, to: '/admin/dorms' },
    { label: 'สมาชิก', value: stats.members, to: '/admin/members' },
    { label: 'รีวิว', value: stats.reviews },
    { label: 'คำขอนัดดูห้องทั้งหมด', value: stats.totalBookings, to: '/admin/bookings' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const body = (
            <>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className={`mt-1 font-display text-3xl font-semibold ${c.highlight ? 'text-sand-600' : 'text-pine-800'}`}>{c.value}</p>
              {c.note && <p className="mt-1 text-xs text-slate-400">{c.note}</p>}
            </>
          );
          return c.to
            ? <Link key={c.label} to={c.to} className="card p-5 transition hover:border-pine-300 hover:shadow-md">{body}</Link>
            : <div key={c.label} className="card p-5">{body}</div>;
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/dorms/new" className="btn-primary">+ เพิ่มหอพัก</Link>
        <Link to="/admin/bookings" className="btn-outline">ตอบคำขอนัดดูห้อง</Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
