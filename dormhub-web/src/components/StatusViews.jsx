// 3 สถานะที่ทุกหน้าที่โหลดข้อมูลต้องมี: กำลังโหลด / ไม่มีข้อมูล / โหลดไม่สำเร็จ
// รวมไว้ไฟล์เดียว ทุกหน้าจะได้หน้าตาเหมือนกัน

export function Loading({ label = 'กำลังโหลด...', rows = 3 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 py-4">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
      ))}
      <p className="text-center text-sm text-slate-400" aria-hidden="true">{label}</p>
    </div>
  );
}

export function ErrorBox({ error, onRetry, title = 'โหลดข้อมูลไม่สำเร็จ' }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="font-medium text-red-700">{title}</p>
      {error?.message && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-danger mt-4">
          ลองใหม่
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '🏠', title, hint, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <div className="text-4xl" aria-hidden="true">{icon}</div>
      <p className="mt-3 font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

// ข้อความแจ้งผลสั้น ๆ ใต้ฟอร์ม
export function FormMessage({ error, success }) {
  if (error) return <p role="alert" className="text-sm text-red-600">{error.message || String(error)}</p>;
  if (success) return <p role="status" className="text-sm text-pine-700">{success}</p>;
  return null;
}
