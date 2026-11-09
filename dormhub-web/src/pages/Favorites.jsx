import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import DormGrid from '../components/DormGrid';
import { EmptyState } from '../components/StatusViews';

// หอที่สมาชิกกดบันทึกไว้ (เส้นทาง /me/favorites ครอบด้วย ProtectedRoute แล้ว)
function Favorites() {
  const { member, token } = useAuth();
  const [dorms, setDorms] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    getFavorites(token)
      .then((items) => { if (!ignore) { setDorms(items); setStatus('success'); } })
      .catch((err) => { if (!ignore) { setError(err); setStatus('error'); } });
    return () => { ignore = true; };
  }, [token, reloadKey]);

  return (
    <div className="page">
      <h1 className="font-display text-3xl font-semibold text-slate-900">รายการโปรดของ {member?.displayName}</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">กด ♡ ในหน้าหอพักเพื่อบันทึกไว้เทียบทีหลัง</p>
      <DormGrid dorms={dorms} status={status} error={error} onRetry={() => setReloadKey((k) => k + 1)}
                empty={
                  <EmptyState icon="♡" title="ยังไม่มีหอในรายการโปรด" hint="ลองค้นหาหอแล้วกดบันทึกดูนะ">
                    <Link to="/dorms" className="btn-primary">ค้นหาหอพัก</Link>
                  </EmptyState>
                } />
    </div>
  );
}

export default Favorites;
