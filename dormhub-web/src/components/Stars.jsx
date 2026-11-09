// แสดงดาว 1-5 ดวง (อ่านอย่างเดียว) ใช้บนการ์ดและรายการรีวิว
function Stars({ value = 0, size = 'text-base' }) {
  const full = Math.round(value);
  return (
    <span className={`${size} tracking-tight`} aria-label={`${value} จาก 5 ดาว`} title={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" className={n <= full ? 'text-sand-500' : 'text-slate-300'}>★</span>
      ))}
    </span>
  );
}

export default Stars;
