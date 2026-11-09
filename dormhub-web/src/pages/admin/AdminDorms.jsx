import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDeleteDorm, adminGetDorms } from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState, ErrorBox, Loading } from '../../components/StatusViews';
import { GENDER_LABELS } from '../../constants';
import { priceText } from '../../utils/format';

// รายการหอทั้งหมด (รวมหอที่ยังไม่เผยแพร่) + ปุ่มแก้ไข/ลบ
function AdminDorms() {
  const { token } = useAuth();
  const [dorms, setDorms] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    adminGetDorms(token)
      .then((items) => { if (!ignore) { setDorms(items); setStatus('success'); } })
      .catch((err) => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function handleDelete(d) {
    if (!window.confirm(`ลบ "${d.name}" ใช่ไหม\nรีวิว รายการโปรด และคำขอนัดดูห้องของหอนี้จะถูกลบด้วย`)) return;
    setBusyId(d.id);
    try {
      await adminDeleteDorm(d.id, token);
      setDorms((list) => list.filter((x) => x.id !== d.id));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const q = filter.trim().toLowerCase();
  const shown = dorms.filter((d) => q === '' || d.name.toLowerCase().includes(q) || d.zone.name.includes(q));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="กรองชื่อหอหรือย่าน..."
               aria-label="กรองรายการหอ" className="input max-w-xs" />
        <Link to="/admin/dorms/new" className="btn-primary">+ เพิ่มหอพัก</Link>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {status === 'success' && shown.length === 0 && (
        <EmptyState title={dorms.length === 0 ? 'ยังไม่มีหอพักในระบบ' : 'ไม่พบหอที่ตรงกับคำกรอง'} />
      )}
      {status === 'success' && shown.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">หอพัก</th>
                <th className="px-4 py-3 font-medium">ย่าน</th>
                <th className="px-4 py-3 font-medium">ราคา</th>
                <th className="px-4 py-3 font-medium">ว่าง</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <Link to={d.isPublished ? `/dorms/${d.id}` : `/admin/dorms/${d.id}/edit`} className="font-medium text-slate-900 hover:text-pine-700">{d.name}</Link>
                    <p className="text-xs text-slate-400">{GENDER_LABELS[d.gender]} · {d.reviewCount} รีวิว</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{d.zone.name}</td>
                  <td className="px-4 py-3 text-slate-600">{priceText(d.priceMin, d.priceMax)}</td>
                  <td className="px-4 py-3 text-slate-600">{d.available}</td>
                  <td className="px-4 py-3">
                    {d.isPublished
                      ? <span className="rounded-full bg-pine-50 px-2 py-0.5 text-xs text-pine-700">เผยแพร่</span>
                      : <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">ซ่อนอยู่</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link to={`/admin/dorms/${d.id}/edit`} className="btn-outline py-1 text-xs">แก้ไข</Link>{' '}
                    <button type="button" onClick={() => handleDelete(d)} disabled={busyId === d.id} className="btn-danger py-1 text-xs">
                      {busyId === d.id ? 'กำลังลบ...' : 'ลบ'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDorms;
