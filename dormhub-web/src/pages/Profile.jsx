import { useState } from 'react';
import { changePassword, updateMe } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { FormMessage } from '../components/StatusViews';
import { MIN_PASSWORD_LENGTH, ROLE_ADMIN } from '../constants';
import { formatDate } from '../utils/format';

// หน้าโปรไฟล์: ดูข้อมูลตัวเอง / แก้ชื่อและเบอร์โทร / เปลี่ยนรหัสผ่าน
function Profile() {
  const { member } = useAuth();
  return (
    <div className="page max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-slate-900">โปรไฟล์ของฉัน</h1>
      <div className="mt-6 grid gap-6">
        <div className="card flex flex-wrap items-center gap-4 p-6">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pine-700 font-display text-2xl text-white" aria-hidden="true">
            {member?.displayName?.charAt(0)}
          </span>
          <div>
            <p className="text-lg font-medium text-slate-900">{member?.displayName}</p>
            <p className="text-sm text-slate-500">{member?.email}</p>
            <p className="mt-1 text-xs text-slate-400">
              {member?.role === ROLE_ADMIN ? 'ผู้ดูแลระบบ' : 'สมาชิก'} · สมัครเมื่อ {formatDate(member?.createdAt)}
            </p>
          </div>
        </div>
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}

function ProfileForm() {
  const { member, token, updateMember } = useAuth();
  const [displayName, setDisplayName] = useState(member?.displayName ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [status, setStatus] = useState('idle');   // 'idle' | 'saving' | 'saved'
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      const updated = await updateMe({ displayName: displayName.trim(), phone: phone.trim() }, token);
      updateMember(updated);                       // ชื่อบน Navbar เปลี่ยนทันที
      setStatus('saved');
    } catch (err) {
      setError(err);
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-medium text-slate-900">ข้อมูลส่วนตัว</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className="label">ชื่อที่แสดง</label>
          <input id="pf-name" required maxLength={50} value={displayName}
                 onChange={(e) => { setDisplayName(e.target.value); setStatus('idle'); }} className="input" />
        </div>
        <div>
          <label htmlFor="pf-phone" className="label">เบอร์โทรศัพท์</label>
          <input id="pf-phone" type="tel" value={phone} placeholder="08x-xxx-xxxx"
                 onChange={(e) => { setPhone(e.target.value); setStatus('idle'); }} className="input" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === 'saving'} className="btn-primary">
          {status === 'saving' ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <FormMessage error={error} success={status === 'saved' && 'บันทึกแล้ว'} />
      </div>
    </form>
  );
}

function PasswordForm() {
  const { token } = useAuth();
  const empty = { current: '', next: '', confirm: '' };
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setStatus('idle'); };

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.next.length < MIN_PASSWORD_LENGTH) {
      setError(new Error(`รหัสผ่านใหม่ต้องยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`));
      return;
    }
    if (form.next !== form.confirm) {
      setError(new Error('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน'));
      return;
    }
    setStatus('saving');
    setError(null);
    try {
      await changePassword(form.current, form.next, token);   // Go ตอบ 204
      setForm(empty);
      setStatus('saved');
    } catch (err) {
      setError(err);                                         // เช่น รหัสผ่านเดิมไม่ถูกต้อง
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-medium text-slate-900">เปลี่ยนรหัสผ่าน</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pw-current" className="label">รหัสผ่านเดิม</label>
          <input id="pw-current" type="password" autoComplete="current-password" required value={form.current} onChange={set('current')} className="input" />
        </div>
        <div>
          <label htmlFor="pw-next" className="label">รหัสผ่านใหม่</label>
          <input id="pw-next" type="password" autoComplete="new-password" required value={form.next} onChange={set('next')} className="input" />
        </div>
        <div>
          <label htmlFor="pw-confirm" className="label">ยืนยันรหัสผ่านใหม่</label>
          <input id="pw-confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} className="input" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === 'saving'} className="btn-primary">
          {status === 'saving' ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
        </button>
        <FormMessage error={error} success={status === 'saved' && 'เปลี่ยนรหัสผ่านแล้ว ครั้งหน้าใช้รหัสใหม่เข้าสู่ระบบ'} />
      </div>
    </form>
  );
}

export default Profile;
