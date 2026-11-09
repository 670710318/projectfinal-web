import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import * as api from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import BookingForm from '../components/BookingForm';
import DormImage from '../components/DormImage';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import Stars from '../components/Stars';
import { EmptyState, ErrorBox, Loading } from '../components/StatusViews';
import { FACILITY_ICON, GENDER_LABELS } from '../constants';
import { formatNumber, priceText } from '../utils/format';

// หน้ารายละเอียดหอ (Guest ดูได้ทั้งหมด, Member กดบันทึก/นัดดูห้อง/รีวิวได้, Admin ลบรีวิวได้)
function DormDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { token, member, isLoggedIn, isAdmin } = useAuth();

  const [dorm, setDorm] = useState(null);
  const [status, setStatus] = useState('loading');     // 'loading' | 'success' | 'notfound' | 'error'
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [reviewStatus, setReviewStatus] = useState('loading');
  const [reviewError, setReviewError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [favError, setFavError] = useState(null);

  // 1) ข้อมูลหอ
  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    api.getDorm(id)
      .then((d) => { if (!ignore) { setDorm(d); setStatus('success'); } })
      .catch((err) => {
        if (ignore) return;
        setError(err);
        setStatus(err.status === 404 || err.status === 400 ? 'notfound' : 'error');
      });
    return () => { ignore = true; };
  }, [id, reloadKey]);

  // 2) รีวิว (โหลดแยก ถ้ารีวิวพังหน้าหอก็ยังแสดงได้)
  useEffect(() => {
    let ignore = false;
    setReviewStatus('loading');
    api.getReviews(id)
      .then((items) => { if (!ignore) { setReviews(items); setReviewStatus('success'); } })
      .catch((err) => { if (!ignore) { setReviewError(err); setReviewStatus('error'); } });
    return () => { ignore = true; };
  }, [id, reloadKey]);

  // 3) หอนี้อยู่ในรายการโปรดของเราหรือยัง (เฉพาะคนที่ login)
  useEffect(() => {
    if (!token) {
      setIsFavorite(false);
      return;
    }
    let ignore = false;
    api.getFavorites(token)
      .then((items) => { if (!ignore) setIsFavorite(items.some((d) => String(d.id) === String(id))); })
      .catch(() => {});
    return () => { ignore = true; };
  }, [id, token]);

  async function toggleFavorite() {
    setFavBusy(true);
    setFavError(null);
    try {
      if (isFavorite) await api.removeFavorite(id, token);
      else await api.addFavorite(id, token);
      setIsFavorite(!isFavorite);
    } catch (err) {
      setFavError(err);
    } finally {
      setFavBusy(false);
    }
  }

  async function submitReview(rating, text) {
    const created = await api.postReview(id, rating, text, token);   // พังจะ throw ให้ ReviewForm แสดง
    setReviews((list) => [created, ...list]);
    setDorm((d) => {
      const count = d.reviewCount + 1;
      const avg = ((d.rating ?? 0) * d.reviewCount + rating) / count;
      return { ...d, reviewCount: count, rating: Math.round(avg * 10) / 10 };
    });
  }

  async function removeReview(review) {
    if (!window.confirm('ต้องการลบรีวิวนี้ใช่ไหม')) return;
    setDeletingId(review.id);
    try {
      await api.deleteReview(review.id, token);
      setReloadKey((k) => k + 1);                 // โหลดหอ+รีวิวใหม่ ให้คะแนนเฉลี่ยตรงกับ server
    } catch (err) {
      window.alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (status === 'loading') return <div className="page"><Loading rows={4} label="กำลังโหลดข้อมูลหอพัก..." /></div>;
  if (status === 'notfound') {
    return (
      <div className="page">
        <EmptyState icon="🏚️" title="ไม่พบหอพักนี้" hint="หอพักอาจถูกลบหรือยังไม่เปิดให้ดู">
          <Link to="/dorms" className="btn-outline">กลับไปค้นหาหอพัก</Link>
        </EmptyState>
      </div>
    );
  }
  if (status === 'error') return <div className="page"><ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} /></div>;

  const alreadyReviewed = reviews.some((r) => r.member.id === member?.id);
  const fees = [
    ['ค่าน้ำ', dorm.waterRate],
    ['ค่าไฟ', dorm.electricRate],
    ['เงินมัดจำ / ประกัน', dorm.deposit],
  ].filter(([, v]) => v);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative">
        <DormImage dorm={dorm} large className="h-64 md:h-96" />
        <div className="absolute inset-0 bg-gradient-to-t from-pine-950/85 via-pine-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-4 pb-8 text-white md:px-6">
            <nav className="text-sm text-white/70" aria-label="breadcrumb">
              <Link to="/dorms" className="hover:text-white">หอพัก</Link> /{' '}
              <Link to={`/dorms?zone=${dorm.zone.slug}`} className="hover:text-white">{dorm.zone.name}</Link>
            </nav>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-5xl">{dorm.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">{GENDER_LABELS[dorm.gender]}</span>
              {dorm.rating != null
                ? <span><Stars value={dorm.rating} /> {dorm.rating} · {dorm.reviewCount} รีวิว</span>
                : <span className="text-white/70">ยังไม่มีรีวิว</span>}
              {!dorm.isPublished && <span className="rounded-full bg-amber-400 px-3 py-1 text-amber-950">ยังไม่เผยแพร่</span>}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          {/* ---------- ภาพรวม ---------- */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-slate-900">ภาพรวม</h2>
            {dorm.nearby && <p className="mt-2 font-medium text-sand-700">📍 {dorm.nearby}</p>}
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{dorm.description || 'ยังไม่มีรายละเอียด'}</p>
          </section>

          {/* ---------- สิ่งอำนวยความสะดวก ---------- */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-slate-900">สิ่งอำนวยความสะดวก</h2>
            {dorm.facilities.length === 0 ? (
              <p className="mt-3 text-slate-500">ยังไม่ได้ระบุ</p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {dorm.facilities.map((f) => (
                  <li key={f} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <span className="text-xl" aria-hidden="true">{FACILITY_ICON[f] ?? '✔️'}</span>{f}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ---------- ประเภทห้อง ---------- */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-slate-900">ประเภทห้องและราคา</h2>
            {dorm.rooms.length === 0 ? (
              <p className="mt-3 text-slate-500">ยังไม่มีข้อมูลห้อง</p>
            ) : (
              <div className="card mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-pine-50 text-pine-900">
                    <tr><th className="px-4 py-3">ประเภทห้อง</th><th className="px-4 py-3">ขนาด</th><th className="px-4 py-3">ค่าเช่า/เดือน</th><th className="px-4 py-3">ห้องว่าง</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dorm.rooms.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.sizeSqm ? `${r.sizeSqm} ตร.ม.` : '-'}</td>
                        <td className="px-4 py-3 text-slate-800">{formatNumber(r.priceMonth)} บาท</td>
                        <td className="px-4 py-3">
                          {r.available > 0
                            ? <span className="text-pine-700">{r.available} ห้อง</span>
                            : <span className="text-slate-400">เต็ม</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {fees.length > 0 && (
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {fees.map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-sand-100/60 px-4 py-3">
                    <dt className="text-xs text-sand-700">{k}</dt>
                    <dd className="text-sm font-medium text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          {/* ---------- ที่ตั้งและติดต่อ ---------- */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-slate-900">ที่ตั้งและการติดต่อ</h2>
            <div className="card mt-4 space-y-2 p-5 text-sm text-slate-700">
              <p>🏠 {dorm.address}</p>
              <p>🗺️ ย่าน{dorm.zone.name}</p>
              {dorm.phone && <p>📞 <a href={`tel:${dorm.phone}`} className="text-pine-700 hover:underline">{dorm.phone}</a></p>}
              {dorm.lineId && <p>💬 LINE: {dorm.lineId}</p>}
            </div>
          </section>

          {/* ---------- รีวิว ---------- */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              รีวิวจากสมาชิก {reviewStatus === 'success' && <span className="text-base font-normal text-slate-400">({reviews.length})</span>}
            </h2>
            <div className="mt-4 space-y-4">
              {!isLoggedIn && (
                <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                  <Link to="/login" state={{ from: location.pathname }} className="font-medium text-pine-700 hover:underline">เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว
                </p>
              )}
              {isLoggedIn && reviewStatus === 'success' && !alreadyReviewed && (
                <ReviewForm dormName={dorm.name} onSubmit={submitReview} />
              )}
              {reviewStatus === 'loading' && <Loading rows={2} label="กำลังโหลดรีวิว..." />}
              {reviewStatus === 'error' && <ErrorBox error={reviewError} title="โหลดรีวิวไม่สำเร็จ" onRetry={() => setReloadKey((k) => k + 1)} />}
              {reviewStatus === 'success' && (
                <ReviewList reviews={reviews} deletingId={deletingId} onDelete={removeReview}
                            canDelete={(r) => isAdmin || r.member.id === member?.id} />
              )}
            </div>
          </section>
        </div>

        {/* ---------- กล่องด้านขวา: ราคา + บันทึก + นัดดูห้อง ---------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-xs text-slate-400">ค่าเช่า</p>
            <p className="font-display text-2xl font-semibold text-pine-800">{priceText(dorm.priceMin, dorm.priceMax)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {dorm.available > 0 ? `ว่าง ${dorm.available} ห้อง` : 'ขณะนี้ห้องเต็ม (นัดดูเผื่อรอคิวได้)'}
            </p>

            {isLoggedIn ? (
              <>
                <button type="button" onClick={toggleFavorite} disabled={favBusy} aria-pressed={isFavorite}
                        className={`${isFavorite ? 'btn bg-sand-100 text-sand-700 hover:bg-sand-200' : 'btn-outline'} mt-4 w-full`}>
                  {isFavorite ? '♥ อยู่ในรายการโปรดแล้ว' : '♡ บันทึกเป็นรายการโปรด'}
                </button>
                {favError && <p className="mt-2 text-sm text-red-600">{favError.message}</p>}
                <hr className="my-5 border-slate-100" />
                <h2 className="mb-3 font-medium text-slate-900">นัดดูห้อง</h2>
                <BookingForm rooms={dorm.rooms} defaultPhone={member?.phone ?? ''}
                             onSubmit={(booking) => api.createBooking(id, booking, token)} />
              </>
            ) : (
              <div className="mt-5 rounded-xl bg-pine-50 p-4 text-sm text-pine-900">
                <p>สมัครสมาชิกฟรี เพื่อบันทึกหอที่ชอบและนัดดูห้องออนไลน์</p>
                <div className="mt-3 flex gap-2">
                  <Link to="/login" state={{ from: location.pathname }} className="btn-primary flex-1">เข้าสู่ระบบ</Link>
                  <Link to="/register" className="btn-outline flex-1">สมัคร</Link>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

export default DormDetail;
