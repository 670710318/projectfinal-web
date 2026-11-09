import { useState } from 'react';
import { initial } from '../utils/format';

// สีพื้นของรูปแทน เลือกตาม id หอ หอเดิมจะได้สีเดิมทุกครั้ง
const TONES = [
  'from-pine-700 to-pine-900',
  'from-sand-500 to-sand-700',
  'from-pine-500 to-pine-700',
  'from-slate-600 to-slate-800',
  'from-sand-400 to-pine-700',
];

// รูปหอ: ถ้ามีลิงก์รูปใช้รูปจริง ถ้าไม่มีหรือโหลดไม่ขึ้น แสดงกล่องสีพร้อมอักษรแรกของชื่อหอ
function DormImage({ dorm, className = 'aspect-[4/3]', large = false }) {
  const [broken, setBroken] = useState(false);
  const tone = TONES[(dorm?.id ?? 0) % TONES.length];

  if (dorm?.imageUrl && !broken) {
    return (
      <img src={dorm.imageUrl} alt={`รูปหอพัก ${dorm.name}`} loading="lazy"
           onError={() => setBroken(true)}
           className={`${className} w-full object-cover`} />
    );
  }
  return (
    <div className={`${className} relative grid w-full place-items-center overflow-hidden bg-gradient-to-br ${tone}`}
         role="img" aria-label={`ยังไม่มีรูปของ ${dorm?.name ?? 'หอพัก'}`}>
      {/* ลายเส้นอาคารจาง ๆ */}
      <svg viewBox="0 0 120 80" className="absolute bottom-0 w-full text-white/10" fill="currentColor" aria-hidden="true">
        <rect x="8" y="30" width="26" height="50" /><rect x="40" y="14" width="34" height="66" /><rect x="80" y="38" width="32" height="42" />
      </svg>
      <span className={`relative font-display font-semibold text-white/90 ${large ? 'text-7xl' : 'text-5xl'}`}>
        {initial(dorm?.name)}
      </span>
    </div>
  );
}

export default DormImage;
