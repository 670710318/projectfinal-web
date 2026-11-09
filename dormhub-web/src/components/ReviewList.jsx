import Stars from './Stars';
import { EmptyState } from './StatusViews';
import { formatDate } from '../utils/format';

// รายการรีวิว canDelete(review) บอกว่าปุ่มลบควรโชว์ไหม (เจ้าของรีวิว หรือ Admin)
// ถึงจะโชว์ปุ่มผิดคน Go ก็ตรวจสิทธิ์ซ้ำอีกชั้นตอนลบ
function ReviewList({ reviews, canDelete, onDelete, deletingId }) {
  if (reviews.length === 0) {
    return <EmptyState icon="💬" title="ยังไม่มีรีวิว" hint="เป็นคนแรกที่รีวิวหอนี้" />;
  }
  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-pine-100 font-medium text-pine-800" aria-hidden="true">
                {r.member.displayName.charAt(0)}
              </span>
              <div>
                <p className="font-medium text-slate-900">{r.member.displayName}</p>
                <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
              </div>
            </div>
            <Stars value={r.rating} />
          </div>
          <p className="mt-3 whitespace-pre-line text-slate-700">{r.text}</p>
          {canDelete?.(r) && (
            <button type="button" onClick={() => onDelete(r)} disabled={deletingId === r.id}
                    className="mt-3 text-xs text-red-600 hover:underline disabled:opacity-50">
              {deletingId === r.id ? 'กำลังลบ...' : 'ลบรีวิว'}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
