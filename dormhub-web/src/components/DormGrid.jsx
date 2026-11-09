import DormCard from './DormCard';
import { EmptyState, ErrorBox } from './StatusViews';

// วาดรายการหอตาม "สถานะ" 3 แบบ: loading | error | success (สำเร็จแต่ว่างเปล่าก็เป็น success แต่โชว์ EmptyState)
function DormGrid({ dorms, status, error, onRetry, empty }) {
  if (status === 'loading') {
    return (
      <div role="status" aria-label="กำลังโหลดหอพัก" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[4/3] bg-slate-100" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/4 rounded bg-slate-100" />
              <div className="h-5 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorBox error={error} onRetry={onRetry} />;
  }

  if (!dorms || dorms.length === 0) {
    return empty ?? <EmptyState title="ไม่พบหอพัก" hint="ลองเปลี่ยนคำค้นหรือตัวกรองดู" />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {dorms.map((d) => <DormCard key={d.id} dorm={d} />)}
    </div>
  );
}

export default DormGrid;
