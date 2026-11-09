import { addDaysISO, formatDate, formatNumber, priceText, todayISO } from './format';
import { toPayload } from '../pages/admin/AdminDormForm';

describe('ข้อความราคา', () => {
  test('ใส่ลูกน้ำหลักพัน', () => {
    expect(formatNumber(4200)).toBe('4,200');
    expect(formatNumber(null)).toBe('-');
  });

  test('ไม่มีห้อง / ราคาเดียว / ช่วงราคา', () => {
    expect(priceText(null, null)).toBe('ยังไม่ระบุราคา');
    expect(priceText(3500, 3500)).toBe('3,500 บาท/เดือน');
    expect(priceText(3000, 4500)).toBe('3,000 - 4,500 บาท/เดือน');
  });
});

describe('วันที่ (ยึดเวลาไทย)', () => {
  test('แสดงเป็นปี พ.ศ.', () => {
    expect(formatDate('2026-11-20')).toBe('20 พ.ย. 2569');
  });

  test('ตี 1 ของไทย (18:00 UTC เมื่อวาน) ต้องนับเป็นวันใหม่แล้ว', () => {
    expect(todayISO(new Date('2026-11-08T18:00:00Z'))).toBe('2026-11-09');
  });

  test('บวกวันข้ามเดือนได้', () => {
    expect(addDaysISO('2026-11-30', 1)).toBe('2026-12-01');
  });
});

describe('แปลงฟอร์มหอพักเป็น JSON ที่ Go รับ', () => {
  test('ตัวเลขต้องเป็น number และห้องใหม่ต้องมี id = 0', () => {
    const payload = toPayload({
      name: ' หอใหม่ ', zoneId: '2', gender: 'female', address: 'นครปฐม', nearby: '', description: '',
      facilities: ['แอร์'], imageUrl: '', phone: '', lineId: '', waterRate: '', electricRate: '', deposit: '',
      isPublished: true,
      rooms: [
        { key: 1, id: 10, name: 'ห้องเดิม', sizeSqm: 24, priceMonth: '3500', available: '2' },
        { key: 2, name: 'ห้องใหม่', sizeSqm: '', priceMonth: '4000', available: '' },
      ],
    });

    expect(payload.name).toBe('หอใหม่');
    expect(payload.zoneId).toBe(2);
    expect(payload.rooms).toEqual([
      { id: 10, name: 'ห้องเดิม', sizeSqm: 24, priceMonth: 3500, available: 2 },
      { id: 0, name: 'ห้องใหม่', sizeSqm: null, priceMonth: 4000, available: 0 },
    ]);
    expect(payload).not.toHaveProperty('rooms.0.key');   // key ใช้แค่ใน React ห้ามส่งไป Go (Go ไม่รับ field แปลก)
  });
});
