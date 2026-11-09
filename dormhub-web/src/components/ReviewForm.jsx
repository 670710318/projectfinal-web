import { useState } from 'react';
import { MIN_REVIEW_LENGTH } from '../constants';

// ฟอร์มรีวิว: เลือกดาว + เขียนข้อความ
// ฟอร์มไม่รู้ว่าจะส่งไปที่ไหน รับฟังก์ชัน onSubmit(rating, text) จากแม่ (แม่เป็นคนยิง POST จริง)
// แยกแบบนี้ทำให้เทสต์ฟอร์มได้โดยไม่ต้องมี server (ดู ReviewForm.test.jsx)
function ReviewForm({ dormName, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');   // 'typing' | 'submitting' | 'success'

  if (status === 'success') {
    return <p role="status" className="rounded-xl bg-pine-50 p-4 text-pine-800">ขอบคุณสำหรับรีวิว {dormName} 🎉</p>;
  }

  const length = text.trim().length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (length < MIN_REVIEW_LENGTH) {               // ตรวจก่อนส่ง ไม่ต้องเสียเวลารอ server
      setError(new Error(`รีวิวต้องยาวอย่างน้อย ${MIN_REVIEW_LENGTH} ตัวอักษร`));
      return;
    }
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit(rating, text.trim());
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);                                // ข้อความ 400 / 401 / 409 จาก server
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-5">
      <h3 className="font-medium text-slate-900">เขียนรีวิว {dormName}</h3>

      <fieldset>
        <legend className="mb-1 text-sm text-slate-600">ให้คะแนน</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} disabled={status === 'submitting'}
                    aria-label={`${n} ดาว`} aria-pressed={rating === n}
                    className={`text-3xl leading-none transition ${n <= rating ? 'text-sand-500' : 'text-slate-300 hover:text-sand-300'}`}>
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={status === 'submitting'} rows={3}
                placeholder="อยู่แล้วเป็นอย่างไร ความสะอาด ความปลอดภัย การเดินทาง (อย่างน้อย 10 ตัวอักษร)"
                aria-label="ข้อความรีวิว" className="input" />

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={rating === 0 || length === 0 || status === 'submitting'} className="btn-primary">
          {status === 'submitting' ? 'กำลังส่ง...' : 'ส่งรีวิว'}
        </button>
        <span className="text-xs text-slate-400">{length}/{MIN_REVIEW_LENGTH}+ ตัวอักษร</span>
        {error && <p role="alert" className="text-sm text-red-600">{error.message}</p>}
      </div>
    </form>
  );
}

export default ReviewForm;
