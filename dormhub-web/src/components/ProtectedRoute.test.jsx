import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { MEMBER_KEY, TOKEN_KEY } from '../constants';
import ProtectedRoute from './ProtectedRoute';

// หน้าปลอม พอให้รู้ว่าตอนนี้อยู่หน้าไหน
function MemberPage() { return <h1>หน้าของสมาชิก</h1>; }
function AdminPage() { return <h1>หน้าผู้ดูแล</h1>; }
function LoginPage() { return <h1>หน้า Login</h1>; }

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/me/favorites" element={<ProtectedRoute><MemberPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

function loginAs(role) {
  localStorage.setItem(TOKEN_KEY, 'test-token');
  localStorage.setItem(MEMBER_KEY, JSON.stringify({ id: 1, displayName: 'ทดสอบ', role }));
}

beforeEach(() => {
  localStorage.clear();   // AuthProvider อ่านตั๋วจาก localStorage ตอนเริ่ม ต้องล้างทุกเทสต์
  // AuthProvider จะถาม /api/me เมื่อมีตั๋ว ให้ fetch ค้างไว้เฉย ๆ ไม่ต้องตอบ (เทสต์นี้สนใจแค่การพาไปหน้าไหน)
  global.fetch = jest.fn(() => new Promise(() => {}));
});

test('Guest เข้าหน้าสมาชิก ต้องถูกพาไปหน้า Login', () => {
  renderAt('/me/favorites');

  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
  expect(screen.queryByText('หน้าของสมาชิก')).not.toBeInTheDocument();
});

test('Guest เข้าหน้า Admin ก็ต้องถูกพาไปหน้า Login', () => {
  renderAt('/admin');

  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
});

test('Member ที่ login แล้ว เข้าหน้าสมาชิกได้', () => {
  loginAs('member');
  renderAt('/me/favorites');

  expect(screen.getByRole('heading', { name: 'หน้าของสมาชิก' })).toBeInTheDocument();
});

test('Member เข้าหน้า Admin ต้องเห็น "ไม่มีสิทธิ์เข้าถึง" และไม่เห็นเนื้อหา Admin', () => {
  loginAs('member');
  renderAt('/admin');

  expect(screen.getByRole('heading', { name: 'ไม่มีสิทธิ์เข้าถึง' })).toBeInTheDocument();
  expect(screen.queryByText('หน้าผู้ดูแล')).not.toBeInTheDocument();
});

test('Admin เข้าหน้า Admin ได้', () => {
  loginAs('admin');
  renderAt('/admin');

  expect(screen.getByRole('heading', { name: 'หน้าผู้ดูแล' })).toBeInTheDocument();
});
