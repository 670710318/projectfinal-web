import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDorms, getZones } from '../api/backend';
import DormGrid from '../components/DormGrid';
import { EmptyState } from '../components/StatusViews';
import { GENDER_LABELS, PRICE_RANGES, SORT_OPTIONS } from '../constants';

// แปลงค่าใน URL เป็นตัวกรองที่ส่งให้ Go  (?zone=salaya&price=u3000 -> { zone: 'salaya', priceMax: 3000 })
export function filtersFromParams(params) {
  const range = PRICE_RANGES.find((r) => r.value === (params.get('price') ?? '')) ?? PRICE_RANGES[0];
  return {
    q: params.get('q') ?? '',
    zone: params.get('zone') ?? '',
    gender: params.get('gender') ?? '',
    priceMin: range.min,
    priceMax: range.max,
    available: params.get('available') === '1' ? 1 : '',
    sort: params.get('sort') ?? '',
  };
}

// หน้าค้นหาหอพัก: ตัวกรองเก็บไว้ใน URL (กด back ได้ แชร์ลิงก์ผลค้นหาได้) แล้วให้ Go กรองจากฐานข้อมูล
function Dorms() {
  const [params, setParams] = useSearchParams();
  const paramKey = params.toString();          // ใช้เป็น dependency ของ useEffect (string เทียบง่ายกว่า object)

  const [text, setText] = useState(params.get('q') ?? '');   // ช่องพิมพ์ค้นหา กด Enter/ปุ่มถึงจะค้น
  const [zones, setZones] = useState([]);

  const [dorms, setDorms] = useState([]);
  const [status, setStatus] = useState('loading');           // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // รายชื่อย่านโหลดครั้งเดียว ถ้าพลาดก็ยังค้นหาได้ (แค่ไม่มีตัวเลือกย่าน)
  useEffect(() => {
    getZones().then(setZones).catch(() => setZones([]));
  }, []);

  // URL เปลี่ยน (เช่น กดล้างตัวกรอง หรือกด back) ให้ช่องค้นหาตรงกับ URL
  useEffect(() => {
    setText(new URLSearchParams(paramKey).get('q') ?? '');
  }, [paramKey]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      setError(null);
      try {
        const items = await getDorms(filtersFromParams(new URLSearchParams(paramKey)));
        if (!ignore) {
          setDorms(items);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }
    load();
    return () => { ignore = true; };           // cleanup: ผลของรอบเก่าห้ามมาทับรอบใหม่
  }, [paramKey, reloadKey]);

  function update(name, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  }

  function handleSearch(e) {
    e.preventDefault();
    update('q', text.trim());
  }

  function clearAll() {
    setText('');
    setParams({}, { replace: true });
  }

  const hasFilter = [...params.keys()].some((k) => k !== 'sort');
  const zoneName = zones.find((z) => z.slug === params.get('zone'))?.name;

  return (
    <div className="page">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-sand-700">Find your dorm</p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          หอพัก{zoneName ? `ย่าน${zoneName}` : 'ในนครปฐม'}
        </h1>
      </header>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        {/* ---------- ตัวกรอง ---------- */}
        <aside className="space-y-5 md:sticky md:top-24 md:self-start">
          <form onSubmit={handleSearch} role="search">
            <label htmlFor="dorm-q" className="label">ค้นหา</label>
            <div className="flex gap-2">
              <input id="dorm-q" value={text} onChange={(e) => setText(e.target.value)}
                     placeholder="ชื่อหอ ถนน หรือมหาวิทยาลัย" className="input" />
              <button type="submit" className="btn-primary px-3">ค้นหา</button>
            </div>
          </form>

          <div>
            <label htmlFor="dorm-zone" className="label">ย่าน / ทำเล</label>
            <select id="dorm-zone" value={params.get('zone') ?? ''} onChange={(e) => update('zone', e.target.value)} className="input">
              <option value="">ทุกย่าน</option>
              {zones.map((z) => <option key={z.slug} value={z.slug}>{z.name} ({z.dormCount})</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="dorm-price" className="label">งบต่อเดือน (บาท)</label>
            <select id="dorm-price" value={params.get('price') ?? ''} onChange={(e) => update('price', e.target.value)} className="input">
              {PRICE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <fieldset>
            <legend className="label">ประเภทหอ</legend>
            <div className="flex flex-wrap gap-2">
              {[['', 'ทั้งหมด'], ...Object.entries(GENDER_LABELS)].map(([value, label]) => {
                const active = (params.get('gender') ?? '') === value;
                return (
                  <button key={value || 'all'} type="button" onClick={() => update('gender', value)} aria-pressed={active}
                          className={`rounded-full border px-3 py-1 text-sm transition ${
                            active ? 'border-pine-700 bg-pine-700 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-pine-400'}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={params.get('available') === '1'}
                   onChange={(e) => update('available', e.target.checked ? '1' : '')}
                   className="h-4 w-4 rounded border-slate-300 text-pine-700 focus:ring-pine-500" />
            เฉพาะหอที่มีห้องว่าง
          </label>

          {hasFilter && (
            <button type="button" onClick={clearAll} className="text-sm text-pine-700 hover:underline">
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </aside>

        {/* ---------- ผลลัพธ์ ---------- */}
        <section aria-label="ผลการค้นหา">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500" aria-live="polite">
              {status === 'success' ? `พบ ${dorms.length} หอพัก` : status === 'loading' ? 'กำลังค้นหา...' : ''}
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              เรียงตาม
              <select value={params.get('sort') ?? 'recommended'} onChange={(e) => update('sort', e.target.value)}
                      className="input w-auto py-1.5">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>

          <DormGrid dorms={dorms} status={status} error={error}
                    onRetry={() => setReloadKey((k) => k + 1)}
                    empty={
                      <EmptyState icon="🔍" title="ไม่พบหอพักที่ตรงกับเงื่อนไข" hint="ลองขยายงบ เปลี่ยนย่าน หรือล้างตัวกรอง">
                        {hasFilter && <button type="button" onClick={clearAll} className="btn-outline">ล้างตัวกรอง</button>}
                      </EmptyState>
                    } />
        </section>
      </div>
    </div>
  );
}

export default Dorms;
