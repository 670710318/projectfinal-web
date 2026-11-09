import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from './ReviewForm';

test('ยังไม่เลือกดาวและยังไม่พิมพ์ ปุ่มส่งต้องกดไม่ได้', () => {
  render(<ReviewForm dormName="หอทดสอบ" onSubmit={jest.fn()} />);

  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeDisabled();
});

test('เลือก 4 ดาว พิมพ์แล้วกดส่ง ต้องเรียก onSubmit(4, ข้อความ) แล้วขึ้นข้อความขอบคุณ', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockResolvedValue();          // แม่ปลอม: รับแล้วบอกว่าสำเร็จ
  render(<ReviewForm dormName="หอทดสอบ" onSubmit={onSubmit} />);

  await user.click(screen.getByRole('button', { name: '4 ดาว' }));
  await user.type(screen.getByLabelText('ข้อความรีวิว'), 'ห้องสะอาด เจ้าของใจดีมาก');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(onSubmit).toHaveBeenCalledWith(4, 'ห้องสะอาด เจ้าของใจดีมาก');
  expect(await screen.findByText(/ขอบคุณสำหรับรีวิว หอทดสอบ/)).toBeInTheDocument();
});

test('ข้อความสั้นกว่า 10 ตัวอักษร ต้องเตือนทันทีโดยไม่ส่งไป server', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  render(<ReviewForm dormName="หอทดสอบ" onSubmit={onSubmit} />);

  await user.click(screen.getByRole('button', { name: '5 ดาว' }));
  await user.type(screen.getByLabelText('ข้อความรีวิว'), 'ดีมาก');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(screen.getByRole('alert')).toHaveTextContent('อย่างน้อย 10 ตัวอักษร');
  expect(onSubmit).not.toHaveBeenCalled();
});

test('ถ้า onSubmit โยน Error (เช่น 409 รีวิวซ้ำ) ต้องโชว์ข้อความนั้น และฟอร์มยังอยู่ให้แก้ต่อ', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockRejectedValue(new Error('คุณรีวิวหอนี้ไปแล้ว'));   // แม่ปลอม: server ตอบ 409
  render(<ReviewForm dormName="หอทดสอบ" onSubmit={onSubmit} />);

  await user.click(screen.getByRole('button', { name: '3 ดาว' }));
  await user.type(screen.getByLabelText('ข้อความรีวิว'), 'พออยู่ได้ แต่เสียงดังนิดหน่อย');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(await screen.findByText('คุณรีวิวหอนี้ไปแล้ว')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeInTheDocument();   // ไม่ได้ไปหน้าขอบคุณ
  expect(screen.queryByText(/ขอบคุณสำหรับรีวิว/)).not.toBeInTheDocument();
});
