/** เทียนวันเกิด เปลวไฟเป็นเครื่องหมายถูก (docs/branding.md) ใช้ประกอบชื่อ จึงซ่อนจาก screen reader */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden focusable="false" className={className}>
      <rect x="11" y="15" width="10" height="14" rx="2" className="fill-primary" />
      <path d="M11 19.5l10-2.5M11 24l10-2.5" className="stroke-card" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11.5 8.5l3.2 3.3L21 4.5" fill="none" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
