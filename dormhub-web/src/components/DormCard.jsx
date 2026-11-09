import { Link } from 'react-router-dom';
import DormImage from './DormImage';
import { FACILITY_ICON, GENDER_LABELS } from '../constants';
import { priceText } from '../utils/format';

// การ์ดหอ 1 ใบ รับ object รูปร่างเดียวกับ DormCard ใน store/dorms.go
function DormCard({ dorm }) {
  const full = dorm.available === 0;
  return (
    <Link to={`/dorms/${dorm.id}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-pine-300 hover:shadow-lg">
      <div className="relative">
        <DormImage dorm={dorm} />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-pine-800 shadow-sm">
          {GENDER_LABELS[dorm.gender] ?? dorm.gender}
        </span>
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm ${
          full ? 'bg-slate-800/80 text-white' : 'bg-pine-700 text-white'}`}>
          {full ? 'เต็ม' : `ว่าง ${dorm.available} ห้อง`}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-sand-700">{dorm.zone?.name}</p>
        <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug text-slate-900 group-hover:text-pine-700">
          {dorm.name}
        </h3>
        {dorm.nearby && <p className="mt-1 line-clamp-1 text-sm text-slate-500">📍 {dorm.nearby}</p>}

        {dorm.facilities?.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {dorm.facilities.slice(0, 4).map((f) => (
              <li key={f} className="rounded-md bg-pine-50 px-2 py-0.5 text-xs text-pine-800">
                {FACILITY_ICON[f] ?? '•'} {f}
              </li>
            ))}
            {dorm.facilities.length > 4 && (
              <li className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">+{dorm.facilities.length - 4}</li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-xs text-slate-400">ราคาเริ่มต้น</p>
            <p className="font-semibold text-pine-800">{priceText(dorm.priceMin, null)}</p>
          </div>
          <p className="text-right text-sm text-slate-500">
            {dorm.rating != null
              ? <><span className="text-sand-500">★</span> {dorm.rating} <span className="text-xs">({dorm.reviewCount})</span></>
              : <span className="text-xs">ยังไม่มีรีวิว</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default DormCard;
