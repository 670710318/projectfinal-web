import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// เปลี่ยนหน้าแล้วเลื่อนขึ้นบนสุด (React Router ไม่ทำให้เอง)
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default ScrollToTop;
