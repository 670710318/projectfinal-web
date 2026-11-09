# DormHub นครปฐม: Frontend (React)

หน้าเว็บแนะนำหอพักในนครปฐม ทำด้วย React (Create React App) + React Router + Tailwind
คุยกับ Backend Go ด้วย `fetch` ผ่านไฟล์เดียวคือ `src/api/backend.js` และ deploy บน Vercel

## โครงสร้างโปรเจกต์

```
src/
├── constants.js           ค่าคงที่ทั้งแอป (ชื่อ key, กติกาฟอร์ม, ข้อความสถานะ, สิ่งอำนวยความสะดวก)
├── api/backend.js         ฟังก์ชันเรียก API ทุกตัว (ที่เดียวที่เรียก fetch) + เทสต์
├── auth/AuthContext.jsx   สถานะ login ของทั้งแอป: token, member, isAdmin, login, logout
├── utils/format.js        จัดรูปแบบราคา วันที่ (พ.ศ.) + เทสต์
├── components/            ชิ้นส่วนที่ใช้ซ้ำ: Navbar, DormCard, DormGrid, ReviewForm, BookingForm,
│                          ProtectedRoute, StatusViews (Loading / Empty / Error)
└── pages/
    ├── Home, Dorms, DormDetail, Login, Register, NotFound      Guest
    ├── Profile, Favorites, MyBookings                          Member
    └── admin/ AdminLayout, AdminDashboard, AdminDorms,         Admin
               AdminDormForm, AdminBookings, AdminMembers
```

## ใครเห็นอะไร

| | Guest | Member | Admin |
|---|---|---|---|
| ค้นหา/กรองหอ ดูรายละเอียด อ่านรีวิว | ✓ | ✓ | ✓ |
| สมัคร / เข้าสู่ระบบ | ✓ | | |
| โปรไฟล์ แก้ชื่อ/เบอร์ เปลี่ยนรหัสผ่าน ออกจากระบบ | | ✓ | ✓ |
| บันทึกรายการโปรด เขียน/ลบรีวิวของตัวเอง | | ✓ | ✓ |
| ส่งคำขอนัดดูห้อง ดูสถานะ ยกเลิก | | ✓ | ✓ |
| เพิ่ม/แก้/ลบ/ซ่อนหอ และประเภทห้อง | | | ✓ |
| อนุมัติ/ปฏิเสธคำขอนัดดูห้อง ลบรีวิวใดก็ได้ ตั้ง/ถอด Admin | | | ✓ |

หน้า Member ครอบด้วย `<ProtectedRoute>` และหน้า Admin ครอบด้วย `<ProtectedRoute role="admin">`
ตัวนี้แค่กันหน้าเว็บ การกันสิทธิ์จริงอยู่ที่ Go (`mw.RequireAuth` / `mw.RequireAdmin`)

## รันในเครื่อง

```bash
npm install
npm start                      # http://localhost:3000  (ต้องรัน Go ที่ :8080 ไว้ด้วย CRA จะ proxy /api ไปให้)
npm test -- --watchAll=false   # รันเทสต์ครั้งเดียว
```

ไม่มี mock server แล้ว ทุกหน้ายิงไปที่ Go จริง (Fetch -> Go -> Supabase)

## เทสต์ (React Unit Test)

| ไฟล์ | ตรวจอะไร |
|---|---|
| `api/backend.test.js` | แนบ Bearer token, ต่อ query string, 204, อ่าน error ของ Go, เน็ตหลุด, 401 แล้ว logout |
| `components/ProtectedRoute.test.jsx` | Guest ถูกพาไป Login, Member เข้าหน้า Admin ไม่ได้, Admin เข้าได้ |
| `components/ReviewForm.test.jsx` | ปุ่มกดไม่ได้ก่อนกรอก, ส่งคะแนน+ข้อความถูก, ข้อความสั้นไม่ส่ง, แสดง error จาก server |
| `pages/Dorms.test.jsx` | Loading -> การ์ด, ตัวกรองใน URL ส่งถึง backend, เลือกย่านแล้วโหลดใหม่, Empty, Error + ลองใหม่ |
| `utils/format.test.js` | ราคา, วันที่ พ.ศ., เวลาไทย, แปลงฟอร์มหอเป็น JSON ที่ Go รับ |

GitHub Actions (`.github/workflows/test.yml`) รันเทสต์ + build ทุกครั้งที่ push

## Deploy บน Vercel
1. push ขึ้น GitHub แล้ว Vercel > **Add New Project** > เลือก repo นี้ (Framework: Create React App)
2. **Environment Variables**: `REACT_APP_API_URL` = URL ของ Render เช่น `https://dormhub-api.onrender.com` (ไม่มี `/` ท้าย)
3. Deploy แล้วเอาโดเมน Vercel ไปใส่ `ALLOWED_ORIGINS` บน Render
4. แก้ env บน Vercel แล้วต้อง **Redeploy** เพราะ CRA ฝังค่าไว้ตอน build

`vercel.json` ส่งทุก path กลับไปที่ `index.html` เพื่อให้กด refresh ที่ `/dorms/3` แล้วไม่ขึ้น 404

Vercel ตั้ง `CI=true` ทำให้ warning ของ ESLint กลายเป็น error ตอน build ถ้าแก้โค้ดแล้ว build พัง ให้ดู warning ใน log
(ที่เจอบ่อยคือตัวแปรที่ไม่ได้ใช้ และ dependency ของ `useEffect` ไม่ครบ)

`package.json` ยังมี `express` กับ `cors` ค้างใน devDependencies จาก lab เดิม (ไม่ได้ใช้แล้ว)
เก็บไว้เพื่อให้ `package-lock.json` ตรงกับ `npm ci` ถ้าจะลบให้ `npm uninstall express cors` แล้ว commit lock ใหม่
