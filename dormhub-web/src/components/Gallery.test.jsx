import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Gallery from './Gallery';

const IMAGES = [
  { id: 1, url: 'https://img.example.com/1.jpg', caption: 'ด้านหน้าอาคาร' },
  { id: 2, url: 'https://img.example.com/2.jpg', caption: 'ห้องแอร์มาตรฐาน' },
  { id: 3, url: 'https://img.example.com/3.jpg', caption: null },
];

test('ไม่มีรูป ต้องไม่วาดอะไรเลย', () => {
  const { container } = render(<Gallery images={[]} dormName="หอทดสอบ" />);
  expect(container).toBeEmptyDOMElement();
});

test('แสดงรูปทุกรูปพร้อมคำอธิบายเป็น alt (รูปที่ไม่มีคำอธิบายใช้ชื่อหอแทน)', () => {
  render(<Gallery images={IMAGES} dormName="หอทดสอบ" />);

  expect(screen.getByAltText('ด้านหน้าอาคาร')).toHaveAttribute('src', 'https://img.example.com/1.jpg');
  expect(screen.getByAltText('ห้องแอร์มาตรฐาน')).toBeInTheDocument();
  expect(screen.getByAltText('รูปที่ 3 ของ หอทดสอบ')).toBeInTheDocument();
});

test('กดรูปแล้วเปิดดูเต็มจอ เลื่อนถัดไป/ก่อนหน้าได้ และกด Esc ปิด', async () => {
  const user = userEvent.setup();
  render(<Gallery images={IMAGES} dormName="หอทดสอบ" />);

  await user.click(screen.getByRole('button', { name: 'ดูรูปขนาดใหญ่: ห้องแอร์มาตรฐาน' }));
  const dialog = screen.getByRole('dialog', { name: 'รูปของ หอทดสอบ' });
  expect(dialog).toHaveTextContent('2 / 3');

  await user.click(screen.getByRole('button', { name: 'รูปถัดไป' }));
  expect(dialog).toHaveTextContent('3 / 3');

  await user.click(screen.getByRole('button', { name: 'รูปถัดไป' }));      // รูปสุดท้าย -> วนกลับรูปแรก
  expect(dialog).toHaveTextContent('1 / 3');
  expect(dialog).toHaveTextContent('ด้านหน้าอาคาร');

  await user.keyboard('{ArrowLeft}');                                        // คีย์บอร์ดก็ได้
  expect(dialog).toHaveTextContent('3 / 3');

  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('ลิงก์รูปเสีย ต้องขึ้นข้อความแทนรูปแตก', () => {
  render(<Gallery images={[IMAGES[0]]} dormName="หอทดสอบ" />);

  fireEvent.error(screen.getByAltText('ด้านหน้าอาคาร'));   // จำลองว่าโหลดรูปไม่สำเร็จ

  expect(screen.getByText('โหลดรูปไม่ได้')).toBeInTheDocument();
  expect(screen.queryByAltText('ด้านหน้าอาคาร')).not.toBeInTheDocument();
});
