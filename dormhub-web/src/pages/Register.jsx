import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FormMessage } from '../components/StatusViews';
import { MIN_PASSWORD_LENGTH } from '../constants';
import { AuthCard } from './Login';

function Register() {
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    // ตรวจเบื้องต้นในเบราว์เซอร์ก่อน (Go ตรวจซ้ำอีกรอบเสมอ)
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(new Error(`รหัสผ่านต้องยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`));
      return;
    }
    if (form.password !== form.confirm) {
      setError(new Error('รหัสผ่านทั้งสองช่องไม่ตรงกัน'));
      return;
    }
    setStatus('submitting');
    setError(null);
    try {
      await register(form.email, form.password, form.displayName.trim());   // สมัครเสร็จ login ให้เลย
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err);                                                        // เช่น 409 อีเมลซ้ำ
      setStatus('typing');
    }
  }

  const busy = status === 'submitting';
  return (
    <AuthCard title="สมัครสมาชิก" subtitle="บันทึกหอที่ชอบ เขียนรีวิว และนัดดูห้องได้">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="label">ชื่อที่แสดง</label>
          <input id="reg-name" required maxLength={50} value={form.displayName} onChange={set('displayName')} className="input" />
        </div>
        <div>
          <label htmlFor="reg-email" className="label">อีเมล</label>
          <input id="reg-email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} className="input" />
        </div>
        <div>
          <label htmlFor="reg-password" className="label">รหัสผ่าน (อย่างน้อย {MIN_PASSWORD_LENGTH} ตัวอักษร)</label>
          <input id="reg-password" type="password" autoComplete="new-password" required value={form.password} onChange={set('password')} className="input" />
        </div>
        <div>
          <label htmlFor="reg-confirm" className="label">ยืนยันรหัสผ่าน</label>
          <input id="reg-confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} className="input" />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
        <FormMessage error={error} />
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        มีบัญชีแล้ว? <Link to="/login" state={location.state} className="font-medium text-pine-700 hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </AuthCard>
  );
}

export default Register;
