import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dorms from './Dorms';
import { getDorms, getZones } from '../api/backend';

// แทนทั้งไฟล์ backend.js ด้วยของปลอม: ทุกฟังก์ชันกลายเป็น jest.fn() ที่เรากำหนดคำตอบได้
jest.mock('../api/backend');

const ZONES = [
  { id: 1, slug: 'salaya', name: 'ศาลายา', dormCount: 2 },
  { id: 2, slug: 'sanamchan', name: 'สนามจันทร์', dormCount: 1 },
];

function dorm(id, name, extra = {}) {
  return {
    id, name, zone: { id: 1, slug: 'salaya', name: 'ศาลายา' }, gender: 'mixed', nearby: null, imageUrl: null,
    facilities: ['แอร์'], priceMin: 3500, priceMax: 4200, available: 2, reviewCount: 0, rating: null, isPublished: true,
    ...extra,
  };
}

const FAKE_DORMS = [dorm(1, 'บ้านสวนทดสอบ'), dorm(2, 'หอเต็มแล้ว', { available: 0 })];

function renderAt(url = '/dorms') {
  return render(<MemoryRouter initialEntries={[url]}><Dorms /></MemoryRouter>);   // มี Link และ useSearchParams ต้องมี Router ครอบ
}

beforeEach(() => {
  getZones.mockResolvedValue(ZONES);
});

test('ระหว่างโหลดต้องเห็นสถานะกำลังโหลด แล้วเห็นการ์ดครบเมื่อโหลดเสร็จ', async () => {
  getDorms.mockResolvedValue(FAKE_DORMS);
  renderAt();

  expect(screen.getByRole('status', { name: 'กำลังโหลดหอพัก' })).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'บ้านสวนทดสอบ' })).toBeInTheDocument();   // findBy = รอจน useEffect โหลดเสร็จ
  expect(screen.getByRole('heading', { name: 'หอเต็มแล้ว' })).toBeInTheDocument();
  expect(screen.getByText('พบ 2 หอพัก')).toBeInTheDocument();
  expect(screen.getByText('เต็ม')).toBeInTheDocument();                // ป้ายของหอที่ available = 0
});

test('ตัวกรองใน URL ต้องถูกส่งไปให้ backend', async () => {
  getDorms.mockResolvedValue([]);
  renderAt('/dorms?zone=salaya&price=u3000&available=1&gender=female');

  await waitFor(() => expect(getDorms).toHaveBeenCalled());
  expect(getDorms).toHaveBeenLastCalledWith(
    expect.objectContaining({ zone: 'salaya', priceMax: 3000, available: 1, gender: 'female' }),
  );
});

test('เลือกย่านแล้วต้องโหลดใหม่ด้วยย่านนั้น', async () => {
  const user = userEvent.setup();
  getDorms.mockResolvedValue(FAKE_DORMS);
  renderAt();
  await screen.findByRole('option', { name: 'สนามจันทร์ (1)' });         // รอรายชื่อย่านโหลดเสร็จ

  await user.selectOptions(screen.getByLabelText('ย่าน / ทำเล'), 'sanamchan');

  await waitFor(() => expect(getDorms).toHaveBeenLastCalledWith(expect.objectContaining({ zone: 'sanamchan' })));
  expect(screen.getByRole('heading', { name: 'หอพักย่านสนามจันทร์' })).toBeInTheDocument();
});

test('ไม่มีผลลัพธ์ ต้องเห็นข้อความว่าไม่พบ (Empty state)', async () => {
  getDorms.mockResolvedValue([]);
  renderAt('/dorms?q=ไม่มีหอนี้');

  expect(await screen.findByText('ไม่พบหอพักที่ตรงกับเงื่อนไข')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ล้างตัวกรอง' })).toBeInTheDocument();
});

test('backend ล่ม ต้องเห็นข้อความ error และปุ่มลองใหม่ที่โหลดอีกครั้งได้', async () => {
  const user = userEvent.setup();
  getDorms
    .mockRejectedValueOnce(new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'))   // ครั้งแรกพัง
    .mockResolvedValueOnce(FAKE_DORMS);                                 // ครั้งที่สองสำเร็จ
  renderAt();

  expect(await screen.findByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument();
  expect(screen.getByText('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));

  expect(await screen.findByRole('heading', { name: 'บ้านสวนทดสอบ' })).toBeInTheDocument();
  expect(getDorms).toHaveBeenCalledTimes(2);
});
