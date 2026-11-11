import { useEffect, useState } from 'react';

// รูปเดียว ถ้าลิงก์เสียให้โชว์กล่องแทน (ไม่ปล่อยไอคอนรูปแตก)
function Photo({ image, className, alt }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return <div className={`${className} grid place-items-center bg-slate-200 text-sm text-slate-500`}>โหลดรูปไม่ได้</div>;
  }
  return <img src={image.url} alt={alt} loading="lazy" onError={() => setBroken(true)} className={`${className} object-cover`} />;
}

// จัดขนาดช่องตามจำนวนรูป (จอเล็กโชว์แค่รูปแรก + ปุ่มดูทั้งหมด)
function tileClass(i, n) {
  if (i > 0 && n > 1) {
    const small = 'hidden sm:block';
    if (n === 2) return small;
    if (n === 3 || (n === 4 && i === 1)) return `${small} sm:col-span-2`;
    return small;
  }
  return n >= 3 ? 'sm:col-span-2 sm:row-span-2' : '';
}

// แกลเลอรีรูปหอ: รูปใหญ่ 1 + รูปเล็ก 4 กดรูปไหนก็เปิดดูเต็มจอ เลื่อนซ้าย/ขวาได้ (ปุ่มหรือคีย์บอร์ด) กด Esc ปิด
function Gallery({ images, dormName }) {
  const [openAt, setOpenAt] = useState(null);   // null = ปิดอยู่, ตัวเลข = กำลังดูรูปที่เท่าไร
  const count = images.length;
  const isOpen = openAt !== null;

  // ตอนเปิดดูเต็มจอ ให้กดคีย์บอร์ดได้
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setOpenAt(null);
      if (e.key === 'ArrowRight') setOpenAt((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setOpenAt((i) => (i - 1 + count) % count);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);   // ปิดแล้วต้องเลิกฟัง ไม่งั้นค้าง
  }, [isOpen, count]);

  if (count === 0) return null;

  const shown = images.slice(0, 5);
  const extra = count - shown.length;
  const alt = (im, i) => im.caption || `รูปที่ ${i + 1} ของ ${dormName}`;

  return (
    <>
      <div className={`grid h-72 gap-2 sm:h-96 ${count === 2 ? 'sm:grid-cols-2' : count >= 3 ? 'sm:grid-cols-4 sm:grid-rows-2' : ''}`}>
        {shown.map((im, i) => (
          <button key={im.id ?? im.url} type="button" onClick={() => setOpenAt(i)}
                  aria-label={`ดูรูปขนาดใหญ่: ${alt(im, i)}`}
                  className={`group relative overflow-hidden rounded-xl bg-slate-100 ${tileClass(i, count)}`}>
            <Photo image={im} alt={alt(im, i)} className="h-full w-full transition duration-300 group-hover:scale-105" />
            {i === shown.length - 1 && extra > 0 && (
              <span className="absolute inset-0 grid place-items-center bg-pine-950/60 text-lg font-medium text-white">+{extra} รูป</span>
            )}
          </button>
        ))}
      </div>
      {count > 1 && (
        <button type="button" onClick={() => setOpenAt(0)} className="btn-outline mt-3 sm:hidden">ดูรูปทั้งหมด ({count})</button>
      )}

      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label={`รูปของ ${dormName}`}
             className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4 text-white"
             onClick={(e) => { if (e.target === e.currentTarget) setOpenAt(null); }}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">{openAt + 1} / {count}</p>
            <button type="button" onClick={() => setOpenAt(null)} className="rounded-lg px-3 py-1 text-sm hover:bg-white/10">ปิด ✕</button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
            <Photo key={images[openAt].url} image={images[openAt]} alt={alt(images[openAt], openAt)}
                   className="max-h-full max-w-full rounded-lg !object-contain" />
            {count > 1 && (
              <>
                <button type="button" aria-label="รูปก่อนหน้า" onClick={() => setOpenAt((i) => (i - 1 + count) % count)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-xl hover:bg-white/20">‹</button>
                <button type="button" aria-label="รูปถัดไป" onClick={() => setOpenAt((i) => (i + 1) % count)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-xl hover:bg-white/20">›</button>
              </>
            )}
          </div>
          {images[openAt].caption && <p className="text-center text-sm text-white/80">{images[openAt].caption}</p>}
        </div>
      )}
    </>
  );
}

export default Gallery;
