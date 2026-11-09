import { useEffect, useState } from 'react';
import { adminGetMembers, adminSetRole } from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState, ErrorBox, Loading } from '../../components/StatusViews';
import { ROLE_ADMIN, ROLE_MEMBER } from '../../constants';
import { formatDate } from '../../utils/format';

// รายชื่อสมาชิก + เปลี่ยนบทบาท (ตั้ง/ถอด Admin)
function AdminMembers() {
  const { token, member: me } = useAuth();
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    adminGetMembers(token)
      .then((items) => { if (!ignore) { setMembers(items); setStatus('success'); } })
      .catch((err) => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function changeRole(m, role) {
    const action = role === ROLE_ADMIN ? 'ตั้งเป็นผู้ดูแลระบบ' : 'ถอดสิทธิ์ผู้ดูแลระบบ';
    if (!window.confirm(`${action}: ${m.displayName} ใช่ไหม\n(มีผลหลังเจ้าตัวเข้าสู่ระบบใหม่)`)) return;
    setBusyId(m.id);
    try {
      const updated = await adminSetRole(m.id, role, token);
      setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, role: updated.role } : x)));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  if (members.length === 0) return <EmptyState icon="👥" title="ยังไม่มีสมาชิก" />;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">สมาชิก</th>
            <th className="px-4 py-3 font-medium">สมัครเมื่อ</th>
            <th className="px-4 py-3 font-medium">รีวิว</th>
            <th className="px-4 py-3 font-medium">นัดดูห้อง</th>
            <th className="px-4 py-3 font-medium">บทบาท</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.map((m) => {
            const self = m.id === me?.id;
            return (
              <tr key={m.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{m.displayName}{self && <span className="ml-1 text-xs text-slate-400">(คุณ)</span>}</p>
                  <p className="text-xs text-slate-400">{m.email}{m.phone && ` · ${m.phone}`}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(m.createdAt)}</td>
                <td className="px-4 py-3 text-slate-600">{m.reviewCount}</td>
                <td className="px-4 py-3 text-slate-600">{m.bookingCount}</td>
                <td className="px-4 py-3">
                  <select value={m.role} disabled={self || busyId === m.id} onChange={(e) => changeRole(m, e.target.value)}
                          aria-label={`บทบาทของ ${m.displayName}`} className="input w-auto py-1">
                    <option value={ROLE_MEMBER}>สมาชิก</option>
                    <option value={ROLE_ADMIN}>ผู้ดูแลระบบ</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminMembers;
