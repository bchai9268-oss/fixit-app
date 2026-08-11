type AdminDashboardProps = {
  admin: {
    displayName: string;
    email: string;
  };
};

const jobs = [
  { id: "FX-240811", customer: "คุณกิตติพงษ์", device: "iPhone 14 Pro", issue: "เปลี่ยนหน้าจอ", status: "กำลังซ่อม", className: "progress" },
  { id: "FX-240810", customer: "คุณอรทัย", device: "MacBook Air M2", issue: "เปิดไม่ติด", status: "รอตรวจสอบ", className: "waiting" },
  { id: "FX-240809", customer: "คุณธนวัฒน์", device: "Samsung S24", issue: "พอร์ตชาร์จเสีย", status: "พร้อมรับ", className: "ready" },
  { id: "FX-240808", customer: "คุณศิริพร", device: "ASUS TUF F15", issue: "เครื่องร้อน", status: "รออะไหล่", className: "parts" },
];

function initials(name: string) {
  const cleaned = name.trim();
  return cleaned ? cleaned.slice(0, 2).toUpperCase() : "AD";
}

export default function AdminDashboard({ admin }: AdminDashboardProps) {
  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand brand-white"><span className="brand-mark">F</span><span>FixIT <b>Care</b></span></div>
        <div className="user-mini">
          <span>{initials(admin.displayName)}</span>
          <div><strong>{admin.displayName}</strong><small>{admin.email}</small></div>
        </div>
        <nav aria-label="เมนูผู้ดูแลระบบ">
          <a className="selected">⌂ ภาพรวม</a>
          <a>▣ งานซ่อมทั้งหมด <b>12</b></a>
          <a>♙ ลูกค้า</a>
          <a>▱ อะไหล่และสต็อก</a>
          <a>฿ การชำระเงิน</a>
          <a>⚙ จัดการผู้ใช้งาน</a>
        </nav>
        <form className="logout-form" action="/api/admin/logout" method="post"><button className="logout" type="submit">↪ ออกจากระบบ</button></form>
      </aside>

      <section className="dashboard-content">
        <header>
          <div><p>วันอังคารที่ 11 สิงหาคม 2569</p><h1>สวัสดี, {admin.displayName} 👋</h1></div>
          <div className="header-tools"><button aria-label="การแจ้งเตือน">♢<i></i></button><button className="button button-primary">＋ เพิ่มงานซ่อม</button></div>
        </header>

        <div className="stats-grid">
          <article><span className="stat-icon blue">▣</span><div><small>งานซ่อมทั้งหมด</small><strong>128</strong><p><b>↑ 12%</b> จากเดือนที่แล้ว</p></div></article>
          <article><span className="stat-icon amber">⌛</span><div><small>กำลังดำเนินการ</small><strong>12</strong><p>ต้องดูแลวันนี้ <b>5 งาน</b></p></div></article>
          <article><span className="stat-icon green">✓</span><div><small>เสร็จแล้วเดือนนี้</small><strong>86</strong><p><b>↑ 8%</b> จากเดือนที่แล้ว</p></div></article>
          <article><span className="stat-icon purple">฿</span><div><small>รายได้เดือนนี้</small><strong>฿124,500</strong><p><b>↑ 18%</b> จากเดือนที่แล้ว</p></div></article>
        </div>

        <section className="jobs-panel">
          <div className="panel-title"><div><h2>งานซ่อมล่าสุด</h2><p>รายการงานซ่อมที่มีการอัปเดตล่าสุด</p></div><button>ดูทั้งหมด →</button></div>
          <div className="job-table">
            <div className="table-head"><span>หมายเลขงาน</span><span>ลูกค้า / อุปกรณ์</span><span>อาการ</span><span>สถานะ</span><span>จัดการ</span></div>
            {jobs.map((job) => (
              <div className="table-row" key={job.id}>
                <strong>{job.id}</strong>
                <span><b>{job.customer}</b><small>{job.device}</small></span>
                <span>{job.issue}</span>
                <span><i className={job.className}>{job.status}</i></span>
                <button aria-label={`จัดการงาน ${job.id}`}>•••</button>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
