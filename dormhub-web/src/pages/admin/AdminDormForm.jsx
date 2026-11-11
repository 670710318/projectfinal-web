import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminCreateDorm, adminGetDorm, adminUpdateDorm, getZones } from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { ErrorBox, FormMessage, Loading } from '../../components/StatusViews';
import { FACILITIES, GENDER_LABELS, MAX_IMAGES } from '../../constants';

const EMPTY = {
  name: '', zoneId: '', gender: 'mixed', address: '', nearby: '', description: '',
  facilities: [], images: [], phone: '', lineId: '', waterRate: '', electricRate: '', deposit: '',
  isPublished: true, rooms: [],
};

// แปลงข้อมูลหอจาก API (ค่า null) ให้เป็นค่าในฟอร์ม (ช่องว่าง '')
function toForm(d, nextKey) {
  return {
    name: d.name, zoneId: String(d.zone.id), gender: d.gender, address: d.address,
    nearby: d.nearby ?? '', description: d.description ?? '', facilities: d.facilities ?? [],
    images: (d.images ?? []).map((im) => ({ key: nextKey(), url: im.url, caption: im.caption ?? '' })),
    phone: d.phone ?? '', lineId: d.lineId ?? '',
    waterRate: d.waterRate ?? '', electricRate: d.electricRate ?? '', deposit: d.deposit ?? '',
    isPublished: d.isPublished,
    rooms: d.rooms.map((r) => ({
      key: nextKey(), id: r.id, name: r.name, sizeSqm: r.sizeSqm ?? '', priceMonth: String(r.priceMonth), available: String(r.available),
    })),
  };
}

// แปลงค่าในฟอร์มกลับเป็น JSON ที่ Go รับ (ชื่อ field ต้องตรงกับ store.DormInput เป๊ะ เพราะ Go ไม่รับ field แปลก)
export function toPayload(f) {
  return {
    name: f.name.trim(), zoneId: Number(f.zoneId), gender: f.gender, address: f.address.trim(),
    nearby: f.nearby.trim(), description: f.description.trim(), facilities: f.facilities,
    phone: f.phone.trim(), lineId: f.lineId.trim(),
    waterRate: f.waterRate.trim(), electricRate: f.electricRate.trim(), deposit: f.deposit.trim(),
    isPublished: f.isPublished,
    rooms: f.rooms.map((r) => ({
      id: r.id ?? 0,                                   // 0 = ห้องใหม่
      name: r.name.trim(),
      sizeSqm: r.sizeSqm === '' ? null : Number(r.sizeSqm),
      priceMonth: Number(r.priceMonth),
      available: Number(r.available || 0),
    })),
    // ลำดับใน array = ลำดับที่แสดง (รูปแรก = รูปปก) แถวที่ยังไม่ใส่ลิงก์ไม่ต้องส่ง
    images: f.images
      .map((im) => ({ url: im.url.trim(), caption: im.caption.trim() }))
      .filter((im) => im.url !== ''),
  };
}

// รูปตัวอย่างเล็ก ๆ ในฟอร์ม ใส่ key={url} ตอนเรียกใช้ เปลี่ยนลิงก์แล้วจะเริ่มเช็กใหม่
function Thumb({ url }) {
  const [broken, setBroken] = useState(false);
  if (!url.trim()) return <div className="grid h-16 w-24 place-items-center rounded-lg bg-slate-200 text-xs text-slate-400">ยังไม่มีรูป</div>;
  if (broken) return <div className="grid h-16 w-24 place-items-center rounded-lg bg-red-50 text-center text-xs text-red-600">โหลดรูป<br />ไม่ได้</div>;
  return <img src={url} alt="" onError={() => setBroken(true)} className="h-16 w-24 rounded-lg object-cover" />;
}

// ฟอร์มเพิ่ม/แก้ไขหอ ใช้หน้าเดียวกัน: มี :id ใน URL = แก้ไข, ไม่มี = เพิ่มใหม่
function AdminDormForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const keyRef = useRef(0);
  const nextKey = () => { keyRef.current += 1; return keyRef.current; };

  const [form, setForm] = useState(EMPTY);
  const [zones, setZones] = useState([]);
  const [status, setStatus] = useState('loading');   // 'loading' | 'ready' | 'error'
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [extra, setExtra] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const [zoneList, dorm] = await Promise.all([
          getZones(),
          isEdit ? adminGetDorm(id, token) : Promise.resolve(null),
        ]);
        if (ignore) return;
        setZones(zoneList);
        if (dorm) {
          let k = 0;   // key ของแถวห้องรอบแรก (นับต่อด้วย keyRef ตอนกดเพิ่มห้อง)
          setForm(toForm(dorm, () => { k += 1; return k; }));
          keyRef.current = k;   // แถวที่เพิ่มทีหลัง (ห้อง/รูป) จะได้ key ต่อจากนี้ ไม่ชนของเดิม
        } else {
          setForm(EMPTY);   // จากหน้าแก้ไขกด "เพิ่มหอพัก" component เดิมถูกใช้ซ้ำ ต้องล้างฟอร์มเอง
        }
        setStatus('ready');
      } catch (err) {
        if (!ignore) { setLoadError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, isEdit, token, reloadKey]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function toggleFacility(name) {
    setForm((f) => ({
      ...f,
      facilities: f.facilities.includes(name) ? f.facilities.filter((x) => x !== name) : [...f.facilities, name],
    }));
  }

  function addExtraFacility() {
    const name = extra.trim();
    if (name && !form.facilities.includes(name)) setForm((f) => ({ ...f, facilities: [...f.facilities, name] }));
    setExtra('');
  }

  function setRoom(key, field, value) {
    setForm((f) => ({ ...f, rooms: f.rooms.map((r) => (r.key === key ? { ...r, [field]: value } : r)) }));
  }
  function addRoom() {
    setForm((f) => ({ ...f, rooms: [...f.rooms, { key: nextKey(), name: '', sizeSqm: '', priceMonth: '', available: '0' }] }));
  }
  function removeRoom(key) {
    setForm((f) => ({ ...f, rooms: f.rooms.filter((r) => r.key !== key) }));
  }

  function setImage(key, field, value) {
    setForm((f) => ({ ...f, images: f.images.map((im) => (im.key === key ? { ...im, [field]: value } : im)) }));
  }
  function addImage() {
    setForm((f) => ({ ...f, images: [...f.images, { key: nextKey(), url: '', caption: '' }] }));
  }
  function removeImage(key) {
    setForm((f) => ({ ...f, images: f.images.filter((im) => im.key !== key) }));
  }
  // สลับตำแหน่งกับรูปข้าง ๆ (dir = -1 ขึ้น, +1 ลง)
  function moveImage(index, dir) {
    setForm((f) => {
      const images = [...f.images];
      const j = index + dir;
      if (j < 0 || j >= images.length) return f;
      [images[index], images[j]] = [images[j], images[index]];
      return { ...f, images };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const payload = toPayload(form);
      const saved = isEdit ? await adminUpdateDorm(id, payload, token) : await adminCreateDorm(payload, token);
      // เผยแพร่ = ไปดูหน้าจริงที่ Guest เห็น, ซ่อนอยู่ = กลับไปรายการหอ (หน้าสาธารณะจะตอบว่าไม่พบ)
      navigate(saved.isPublished ? `/dorms/${saved.id}` : '/admin/dorms');
    } catch (err) {
      setSaveError(err);                           // ข้อความ 400 จาก Go เช่น "กรุณาเลือกย่าน"
      setSaving(false);
    }
  }

  if (status === 'loading') return <Loading rows={4} label="กำลังโหลดฟอร์ม..." />;
  if (status === 'error') return <ErrorBox error={loadError} onRetry={() => setReloadKey((k) => k + 1)} />;

  const extraFacilities = form.facilities.filter((f) => !FACILITIES.some((x) => x.name === f));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-slate-900">{isEdit ? `แก้ไข: ${form.name}` : 'เพิ่มหอพักใหม่'}</h2>
        <Link to="/admin/dorms" className="text-sm text-slate-500 hover:text-pine-700">← กลับไปรายการหอ</Link>
      </div>

      {/* ---------- ข้อมูลหลัก ---------- */}
      <fieldset className="card grid gap-4 p-6 md:grid-cols-2">
        <legend className="sr-only">ข้อมูลหลัก</legend>
        <div className="md:col-span-2">
          <label htmlFor="f-name" className="label">ชื่อหอพัก *</label>
          <input id="f-name" required value={form.name} onChange={set('name')} className="input" />
        </div>
        <div>
          <label htmlFor="f-zone" className="label">ย่าน *</label>
          <select id="f-zone" required value={form.zoneId} onChange={set('zoneId')} className="input">
            <option value="">เลือกย่าน</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-gender" className="label">ประเภทหอ *</label>
          <select id="f-gender" value={form.gender} onChange={set('gender')} className="input">
            {Object.entries(GENDER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="f-address" className="label">ที่อยู่ *</label>
          <input id="f-address" required value={form.address} onChange={set('address')} className="input" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="f-nearby" className="label">จุดเด่นด้านทำเล</label>
          <input id="f-nearby" value={form.nearby} onChange={set('nearby')} placeholder="เช่น เดิน 5 นาทีถึง ม.ศิลปากร" className="input" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="f-desc" className="label">รายละเอียด</label>
          <textarea id="f-desc" rows={4} value={form.description} onChange={set('description')} className="input" />
        </div>
      </fieldset>

      {/* ---------- รูปภาพ ---------- */}
      <fieldset className="card p-6">
        <legend className="px-1 font-medium text-slate-900">รูปภาพ ({form.images.length}/{MAX_IMAGES})</legend>
        <p className="mt-1 text-sm text-slate-500">
          วางลิงก์ที่ขึ้นต้นด้วย https:// หรือชื่อไฟล์ที่อยู่ใน public/photos ของหน้าเว็บ เช่น /photos/d01-front.jpg
          รูปแรกคือรูปปกที่แสดงบนการ์ด ใช้ลูกศรเพื่อเรียงลำดับ (ใช้รูปที่ทีมถ่าย/สร้างเอง หรือรูปที่ได้รับอนุญาต)
        </p>
        <div className="mt-3 space-y-3">
          {form.images.map((im, i) => (
            <div key={im.key} className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="relative">
                <Thumb key={im.url} url={im.url} />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-sand-100 px-1.5 text-[10px] font-medium text-sand-700">รูปปก</span>}
              </div>
              <div className="grid min-w-[14rem] flex-1 gap-2 sm:grid-cols-[2fr_1fr]">
                <input type="text" inputMode="url" value={im.url} onChange={(e) => setImage(im.key, 'url', e.target.value)}
                       placeholder="https://... หรือ /photos/ชื่อไฟล์.jpg" aria-label={`ลิงก์รูปที่ ${i + 1}`} className="input" />
                <input value={im.caption} maxLength={100} onChange={(e) => setImage(im.key, 'caption', e.target.value)}
                       placeholder="คำอธิบาย เช่น ล็อบบี้" aria-label={`คำอธิบายรูปที่ ${i + 1}`} className="input" />
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label={`เลื่อนรูปที่ ${i + 1} ขึ้น`} className="btn-outline px-2 py-1">↑</button>
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label={`เลื่อนรูปที่ ${i + 1} ลง`} className="btn-outline px-2 py-1">↓</button>
                <button type="button" onClick={() => removeImage(im.key)} aria-label={`ลบรูปที่ ${i + 1}`} className="btn-danger px-2 py-1">ลบ</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addImage} disabled={form.images.length >= MAX_IMAGES} className="btn-outline mt-3">+ เพิ่มรูป</button>
      </fieldset>

      {/* ---------- สิ่งอำนวยความสะดวก ---------- */}
      <fieldset className="card p-6">
        <legend className="px-1 font-medium text-slate-900">สิ่งอำนวยความสะดวก</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {FACILITIES.map((f) => (
            <label key={f.name} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={form.facilities.includes(f.name)} onChange={() => toggleFacility(f.name)}
                     className="h-4 w-4 rounded border-slate-300 text-pine-700" />
              {f.icon} {f.name}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {extraFacilities.map((f) => (
            <button key={f} type="button" onClick={() => toggleFacility(f)} className="rounded-full bg-pine-50 px-3 py-1 text-sm text-pine-800">
              {f} ✕
            </button>
          ))}
          <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="เพิ่มอย่างอื่น..." aria-label="เพิ่มสิ่งอำนวยความสะดวกอื่น"
                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExtraFacility(); } }}
                 className="input w-48 py-1.5" />
          <button type="button" onClick={addExtraFacility} className="btn-outline py-1.5">เพิ่ม</button>
        </div>
      </fieldset>

      {/* ---------- ประเภทห้อง ---------- */}
      <fieldset className="card p-6">
        <legend className="px-1 font-medium text-slate-900">ประเภทห้อง</legend>
        {form.rooms.length === 0 && <p className="mt-2 text-sm text-slate-500">ยังไม่มีประเภทห้อง หอที่ไม่มีห้องจะแสดงว่า "ยังไม่ระบุราคา"</p>}
        <div className="mt-2 space-y-3">
          {form.rooms.map((r, i) => (
            <div key={r.key} className="grid items-end gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_100px_130px_100px_auto]">
              <div>
                <label htmlFor={`r-name-${r.key}`} className="label text-xs">ชื่อห้อง #{i + 1}</label>
                <input id={`r-name-${r.key}`} required value={r.name} onChange={(e) => setRoom(r.key, 'name', e.target.value)} className="input" />
              </div>
              <div>
                <label htmlFor={`r-size-${r.key}`} className="label text-xs">ขนาด (ตร.ม.)</label>
                <input id={`r-size-${r.key}`} type="number" min="1" step="0.5" value={r.sizeSqm} onChange={(e) => setRoom(r.key, 'sizeSqm', e.target.value)} className="input" />
              </div>
              <div>
                <label htmlFor={`r-price-${r.key}`} className="label text-xs">ราคา/เดือน *</label>
                <input id={`r-price-${r.key}`} type="number" min="1" required value={r.priceMonth} onChange={(e) => setRoom(r.key, 'priceMonth', e.target.value)} className="input" />
              </div>
              <div>
                <label htmlFor={`r-avail-${r.key}`} className="label text-xs">ห้องว่าง</label>
                <input id={`r-avail-${r.key}`} type="number" min="0" value={r.available} onChange={(e) => setRoom(r.key, 'available', e.target.value)} className="input" />
              </div>
              <button type="button" onClick={() => removeRoom(r.key)} className="btn-danger" aria-label={`ลบห้อง #${i + 1}`}>ลบ</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRoom} className="btn-outline mt-3">+ เพิ่มประเภทห้อง</button>
      </fieldset>

      {/* ---------- ค่าใช้จ่ายและติดต่อ ---------- */}
      <fieldset className="card grid gap-4 p-6 md:grid-cols-3">
        <legend className="px-1 font-medium text-slate-900">ค่าใช้จ่ายและการติดต่อ</legend>
        <div><label htmlFor="f-water" className="label">ค่าน้ำ</label><input id="f-water" value={form.waterRate} onChange={set('waterRate')} placeholder="100 บาท/คน/เดือน" className="input" /></div>
        <div><label htmlFor="f-elec" className="label">ค่าไฟ</label><input id="f-elec" value={form.electricRate} onChange={set('electricRate')} placeholder="7 บาท/หน่วย" className="input" /></div>
        <div><label htmlFor="f-deposit" className="label">เงินมัดจำ / ประกัน</label><input id="f-deposit" value={form.deposit} onChange={set('deposit')} className="input" /></div>
        <div><label htmlFor="f-phone" className="label">เบอร์โทร</label><input id="f-phone" type="tel" value={form.phone} onChange={set('phone')} className="input" /></div>
        <div><label htmlFor="f-line" className="label">LINE ID</label><input id="f-line" value={form.lineId} onChange={set('lineId')} className="input" /></div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} className="h-4 w-4 rounded border-slate-300 text-pine-700" />
          เผยแพร่ให้ Guest และ Member เห็น
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary px-6">{saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหอพัก'}</button>
        <Link to="/admin/dorms" className="btn-outline">ยกเลิก</Link>
        <FormMessage error={saveError} />
      </div>
    </form>
  );
}

export default AdminDormForm;
