import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDorms, getZones, toQuery } from '../api/backend';
import DormGrid from '../components/DormGrid';
import { ErrorBox } from '../components/StatusViews';

// หน้าแรก: hero + ช่องค้นหา, ย่านยอดนิยม, หอแนะนำ
function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [zone, setZone] = useState('');

  const [zones, setZones] = useState([]);
  const [zoneStatus, setZoneStatus] = useState('loading');   // 'loading' | 'success' | 'error'
  const [zoneError, setZoneError] = useState(null);

  const [dorms, setDorms] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;                     // ธงกันคำตอบเก่ามาทับคำตอบใหม่
    setZoneStatus('loading');
    setStatus('loading');

    getZones()
      .then((items) => { if (!ignore) { setZones(items); setZoneStatus('success'); } })
      .catch((err) => { if (!ignore) { setZoneError(err); setZoneStatus('error'); } });

    getDorms({ sort: 'recommended', limit: 6 })
      .then((items) => { if (!ignore) { setDorms(items); setStatus('success'); } })
      .catch((err) => { if (!ignore) { setError(err); setStatus('error'); } });

    return () => { ignore = true; };
  }, [reloadKey]);

  function handleSearch(e) {
    e.preventDefault();
    navigate('/dorms' + toQuery({ q: q.trim(), zone }));
  }

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-pine-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(222,195,133,0.25),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(85,156,136,0.4),transparent_40%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 md:px-6 md:pt-24">
          <p className="text-sm uppercase tracking-[0.25em] text-sand-300">Nakhon Pathom Dormitory Guide</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight md:text-5xl">
            หาหอพักในนครปฐม<br />ใกล้มหาวิทยาลัย ในงบที่ใช่
          </h1>
          <p className="mt-4 max-w-xl text-pine-100/90">
            เทียบราคา ดูห้องว่าง อ่านรีวิวจากผู้เช่าจริง แล้วนัดดูห้องออนไลน์ได้ทันที
          </p>

          <form onSubmit={handleSearch}
                className="mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl md:flex-row">
            <label className="sr-only" htmlFor="home-q">คำค้นหา</label>
            <input id="home-q" value={q} onChange={(e) => setQ(e.target.value)}
                   placeholder="ชื่อหอ หรือสถานที่ เช่น มหิดล, ศิลปากร"
                   className="flex-1 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none" />
            <label className="sr-only" htmlFor="home-zone">ย่าน</label>
            <select id="home-zone" value={zone} onChange={(e) => setZone(e.target.value)}
                    className="rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-700 focus:outline-none md:w-56">
              <option value="">ทุกย่านในนครปฐม</option>
              {zones.map((z) => <option key={z.slug} value={z.slug}>{z.name}</option>)}
            </select>
            <button type="submit" className="rounded-xl bg-sand-500 px-6 py-3 font-medium text-pine-950 hover:bg-sand-400">
              ค้นหาหอพัก
            </button>
          </form>
        </div>
      </section>

      {/* ---------- ย่าน ---------- */}
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 md:px-6">
        {zoneStatus === 'error' ? (
          <ErrorBox error={zoneError} title="โหลดรายชื่อย่านไม่สำเร็จ" onRetry={() => setReloadKey((k) => k + 1)} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {zoneStatus === 'loading'
              ? Array.from({ length: 5 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />)
              : zones.map((z) => (
                  <Link key={z.slug} to={`/dorms?zone=${z.slug}`}
                        className="card group p-4 transition hover:-translate-y-0.5 hover:border-pine-300 hover:shadow-md">
                    <p className="font-display text-lg font-semibold text-pine-800 group-hover:text-pine-600">{z.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{z.landmark}</p>
                    <p className="mt-3 text-sm font-medium text-sand-700">{z.dormCount} หอพัก →</p>
                  </Link>
                ))}
          </div>
        )}
      </section>

      {/* ---------- หอแนะนำ ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-sand-700">Recommended</p>
            <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">หอพักแนะนำ</h2>
          </div>
          <Link to="/dorms" className="text-sm font-medium text-pine-700 hover:underline">ดูทั้งหมด →</Link>
        </div>
        <DormGrid dorms={dorms} status={status} error={error} onRetry={() => setReloadKey((k) => k + 1)} />
      </section>

      {/* ---------- จุดเด่น ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6">
        <div className="grid gap-4 rounded-3xl bg-pine-50 p-6 md:grid-cols-3 md:p-10">
          {[
            ['🔎', 'ค้นหาตามย่านและงบ', 'กรองตามมหาวิทยาลัยใกล้เคียง ราคา ประเภทหอ และห้องว่าง'],
            ['⭐', 'รีวิวจากสมาชิก', 'สมาชิกให้คะแนนและเขียนรีวิวได้หอละ 1 ครั้ง'],
            ['📅', 'นัดดูห้องออนไลน์', 'ส่งคำขอนัดดูห้อง แล้วติดตามสถานะได้ในหน้าของฉัน'],
          ].map(([icon, title, text]) => (
            <div key={title}>
              <p className="text-3xl" aria-hidden="true">{icon}</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-pine-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
