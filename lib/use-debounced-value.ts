"use client";

import { useEffect, useState } from "react";

/** คืนค่า value ล่าสุดหลังจากไม่เปลี่ยนครบ delay ms (ใช้กับช่องค้นหา ไม่ให้กรองทุกตัวอักษร) */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
