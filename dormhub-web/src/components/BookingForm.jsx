import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MAX_BOOKING_DAYS, MAX_NOTE_LENGTH } from '../constants';
import { addDaysISO, formatNumber, todayISO } from '../utils/format';
import { FormMessage } from './StatusViews';

// ฟอร์มนัดดูห้อง (เฉพาะ Member) รับ onSubmit(booking) จากแม่ เหมือน ReviewForm
function BookingForm({ rooms, defaultPhone = '', onSubmit }) {
  const today = todayISO();
  const [roomId, setRoomId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [contactPhone, setContactPhone] = useState(defaultPhone);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('typing');   // 'typing' | 'submitting' | 'success'
  const [error, setError] = useState(null);

  if (status === 'success') {
    return (
      <div role="status" className="rounded-xl bg-pine-50 p-4 text-sm text-pine-800">
        <p className="font-medium">ส่งคำขอนัดดูห้องแล้ว</p>
        <p className="mt-1">หอพักจะยืนยันนัดให้ ติดตามสถานะได้ที่ <Link to="/me/bookings" className="underline">นัดดูห้องของฉัน</Link></p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit({
        roomId: roomId ? Number(roomId) : null,    // ไม่เลือก = ส่ง null (Go รับเป็น *int64)
        visitDate,
        contactPhone: contactPhone.trim(),
        note: note.trim(),
      });
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);
    }
  }

  const busy = status === 'submitting';
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {rooms.length > 0 && (
        <div>
          <label htmlFor="bk-room" className="label">ประเภทห้องที่สนใจ</label>
          <select id="bk-room" value={roomId} onChange={(e) => setRoomId(e.target.value)} disabled={busy} className="input">
            <option value="">ยังไม่แน่ใจ / ดูหลายแบบ</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {formatNumber(r.priceMonth)} บาท{r.available === 0 ? ' (เต็ม)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="bk-date" className="label">วันที่สะดวกเข้าดู</label>
        <input id="bk-date" type="date" required value={visitDate} onChange={(e) => setVisitDate(e.target.value)}
               min={today} max={addDaysISO(today, MAX_BOOKING_DAYS)} disabled={busy} className="input" />
      </div>
      <div>
        <label htmlFor="bk-phone" className="label">เบอร์ติดต่อกลับ</label>
        <input id="bk-phone" type="tel" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
               placeholder="08x-xxx-xxxx" disabled={busy} className="input" />
      </div>
      <div>
        <label htmlFor="bk-note" className="label">ข้อความถึงหอพัก (ไม่บังคับ)</label>
        <textarea id="bk-note" rows={2} maxLength={MAX_NOTE_LENGTH} value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น สะดวกช่วงบ่าย, มาดู 2 คน" disabled={busy} className="input" />
      </div>
      <button type="submit" disabled={busy || !visitDate || !contactPhone.trim()} className="btn-primary w-full">
        {busy ? 'กำลังส่ง...' : 'ส่งคำขอนัดดูห้อง'}
      </button>
      <FormMessage error={error} />
    </form>
  );
}

export default BookingForm;
