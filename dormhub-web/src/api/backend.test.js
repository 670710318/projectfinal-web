import { apiFetch, getDorms, login, postReview, setUnauthorizedHandler, toQuery, getMe } from './backend';

// ทำ Response ปลอมหน้าตาเหมือนของ fetch จริง
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,          // fetch ของจริงคำนวณ ok แบบนี้
    status,
    json: () => Promise.resolve(body),         // res.json() คืน Promise เสมอ
  };
}

beforeEach(() => {
  // แทน fetch ของเบราว์เซอร์ด้วยฟังก์ชันปลอมที่เราควบคุมคำตอบได้ และจดทุกครั้งที่ถูกเรียก
  global.fetch = jest.fn();
  setUnauthorizedHandler(null);
});

test('GET ธรรมดา: ไม่มี body ไม่มี Authorization และคืน object ที่แปลงแล้ว', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [{ id: 1 }] }));

  const data = await apiFetch('/api/dorms');

  expect(data).toEqual({ items: [{ id: 1 }] });
  const [url, options] = fetch.mock.calls[0];            // อาร์กิวเมนต์ที่ apiFetch ส่งให้ fetch
  expect(url).toBe('/api/dorms');
  expect(options.method).toBe('GET');
  expect(options.body).toBeUndefined();
  expect(options.headers.Authorization).toBeUndefined();
});

test('มี token ต้องแนบ Authorization แบบ Bearer และ body ต้องเป็นข้อความ JSON', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { id: 7 }));

  await postReview(5, 4, 'สะอาดมาก เดินทางสะดวก', 'abc123');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/dorms/5/reviews');
  expect(options.method).toBe('POST');
  expect(options.headers.Authorization).toBe('Bearer abc123');
  expect(options.headers['Content-Type']).toBe('application/json');
  expect(options.body).toBe(JSON.stringify({ rating: 4, text: 'สะอาดมาก เดินทางสะดวก' }));
});

test('getDorms ต่อตัวกรองเป็น query string โดยข้ามค่าว่าง และคืน items', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [{ id: 3 }] }));

  const items = await getDorms({ zone: 'salaya', priceMin: '', priceMax: 3000, q: '' });

  expect(fetch.mock.calls[0][0]).toBe('/api/dorms?zone=salaya&priceMax=3000');
  expect(items).toEqual([{ id: 3 }]);
});

test('204 คืน null โดยไม่เรียก res.json()', async () => {
  const res = fakeResponse(204, null);
  res.json = jest.fn();                                   // ถ้าถูกเรียกแปลว่าโค้ดผิด
  fetch.mockResolvedValue(res);

  const data = await apiFetch('/api/me/favorites/1', { method: 'DELETE', token: 'abc' });

  expect(data).toBeNull();
  expect(res.json).not.toHaveBeenCalled();
});

test('error รูปแบบของ Go {error:{code,message}} ต้องได้ Error ที่มี message, status และ code', async () => {
  fetch.mockResolvedValue(fakeResponse(409, { error: { code: 'EMAIL_TAKEN', message: 'อีเมลนี้มีบัญชีอยู่แล้ว' } }));

  const err = await apiFetch('/api/auth/register', { method: 'POST', body: {} }).catch((e) => e);

  expect(err).toBeInstanceOf(Error);
  expect(err.message).toBe('อีเมลนี้มีบัญชีอยู่แล้ว');   // ไม่ใช่ "[object Object]"
  expect(err.status).toBe(409);
  expect(err.code).toBe('EMAIL_TAKEN');
});

test('server ตอบมาไม่ใช่ JSON ต้องได้ข้อความที่เข้าใจได้ ไม่ใช่ SyntaxError', async () => {
  fetch.mockResolvedValue({ ok: false, status: 502, json: () => Promise.reject(new SyntaxError('Unexpected token <')) });

  await expect(apiFetch('/api/dorms')).rejects.toThrow('server ไม่ได้ตอบเป็น JSON');
});

test('ไปไม่ถึง server เลย (fetch โยน TypeError) ต้องได้ข้อความภาษาไทย', async () => {
  fetch.mockRejectedValue(new TypeError('Failed to fetch'));

  await expect(apiFetch('/api/dorms')).rejects.toThrow('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
});

test('401 ของคำขอที่แนบตั๋ว ต้องเรียก onUnauthorized (ตั๋วหมดอายุ -> logout)', async () => {
  const onUnauthorized = jest.fn();
  setUnauthorizedHandler(onUnauthorized);
  fetch.mockResolvedValue(fakeResponse(401, { error: { code: 'BAD_TOKEN', message: 'เซสชันหมดอายุ' } }));

  await expect(getMe('old-token')).rejects.toThrow('เซสชันหมดอายุ');
  expect(onUnauthorized).toHaveBeenCalledTimes(1);
});

test('401 ตอน login ผิด (ไม่มีตั๋ว) ต้องไม่สั่ง logout', async () => {
  const onUnauthorized = jest.fn();
  setUnauthorizedHandler(onUnauthorized);
  fetch.mockResolvedValue(fakeResponse(401, { error: { code: 'BAD_CREDENTIALS', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } }));

  await expect(login('a@b.co', 'wrong')).rejects.toThrow('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  expect(onUnauthorized).not.toHaveBeenCalled();
});

test('toQuery ข้ามค่าว่าง null และ false', () => {
  expect(toQuery({ q: '', zone: 'salaya', available: false, sort: null, limit: 6 })).toBe('?zone=salaya&limit=6');
  expect(toQuery({})).toBe('');
});
