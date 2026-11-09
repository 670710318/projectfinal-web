import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FormMessage } from '../components/StatusViews';
import { ROLE_ADMIN } from '../constants';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');             // 'typing' | 'submitting'
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;                          // ProtectedRoute ส่งมาบอกว่าเดิมจะไปไหน

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      const member = await login(email, password);           // POST /api/auth/login + จำตั๋ว
      navigate(from || (member.role === ROLE_ADMIN ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(err);                                         // ข้อความ 401 จาก server
      setStatus('typing');
    }
  }

  return (
    <AuthCard title="เข้าสู่ระบบ" subtitle="ยินดีต้อนรับกลับมา">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="label">อีเมล</label>
          <input id="login-email" type="email" autoComplete="email" required value={email}
                 onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label htmlFor="login-password" className="label">รหัสผ่าน</label>
          <input id="login-password" type="password" autoComplete="current-password" required value={password}
                 onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
          {status === 'submitting' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        <FormMessage error={error} />
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        ยังไม่มีบัญชี? <Link to="/register" state={location.state} className="font-medium text-pine-700 hover:underline">สมัครสมาชิก</Link>
      </p>
    </AuthCard>
  );
}

// กรอบหน้าตาเดียวกันของหน้า Login / Register
export function AuthCard({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default Login;
