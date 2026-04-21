<template>
  <aside class="panda-sidebar shadow-sm">
    <div class="sidebar-brand">
      <router-link to="/" class="brand-link">
        <img
          src="https://panda.co.th/wp-content/uploads/2025/10/logo-panda-holiday.webp"
          alt="Panda Holiday"
          class="brand-logo"
        />
      </router-link>
    </div>

    <div class="sidebar-scroll-area">
      <ul class="sidebar-menu">
        <li class="menu-label">MAIN MENU</li>
        
        <li>
          <router-link to="/" class="nav-link">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.99 8.24a.75.75 0 11-1.02 1.1l-1.75-1.6v8.17a1.5 1.5 0 01-1.5 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-2.25a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75h-4.5a1.5 1.5 0 01-1.5-1.5v-8.17l-1.75 1.6a.75.75 0 11-1.02-1.1l8.99-8.24z" />
              </svg>
            </span>
            <span class="menu-text">หน้าแรก (Overview)</span>
          </router-link>
        </li>

        <li>
          <router-link to="/add-tour" class="nav-link">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">เพิ่มโปรแกรมทัวร์</span>
          </router-link>
        </li>

        <li class="menu-label mt-4">DATA MANAGEMENT</li>

        <li>
          <router-link to="/destinations" class="nav-link">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">จุดหมายปลายทาง</span>
          </router-link>
        </li>

        <li>
          <router-link to="/festivals" class="nav-link">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">เทศกาล</span>
          </router-link>
        </li>

        <li>
          <router-link to="/months" class="nav-link">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">เดือนที่เดินทาง</span>
          </router-link>
        </li>

        <li>
          <router-link to="/pricing-categories" class="nav-link">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">หมวดหมู่ราคา</span>
          </router-link>
        </li>

        <li>
          <router-link to="/airlines" class="nav-link">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </span>
            <span class="menu-text">สายการบิน</span>
          </router-link>
        </li>

        <li class="menu-label mt-4">ACCOUNT</li>
        <li>
          <a href="#" class="nav-link logout-link" @click.prevent="logout">
            <span class="menu-icon-box logout-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </span>
            <span class="menu-text">ออกจากระบบ</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    localStorage.removeItem('admin_token')
    router.push('/login')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.panda-sidebar {
  width: 280px; /* ขยับความกว้างให้ตรงกับ App.vue */
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #f1f5f9;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  z-index: 1000; /* ให้อยู่เหนือเนื้อหาอื่นๆ */
  font-family: 'Kanit', sans-serif;
  transition: all 0.3s ease;
}

.sidebar-brand {
  padding: 30px 24px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #f8fafc;
}

.brand-logo {
  height: 45px;
  width: auto;
  display: block;
}

.sidebar-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

/* ซ่อน Scrollbar ให้ดูสะอาดตา */
.sidebar-scroll-area::-webkit-scrollbar { width: 4px; }
.sidebar-scroll-area::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

.sidebar-menu {
  list-style: none;
  margin: 0;
  padding: 0 15px;
}

.menu-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  padding: 10px 15px 5px;
  letter-spacing: 1px;
}

.mt-4 { margin-top: 1.5rem; }

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-radius: 12px;
  text-decoration: none;
  color: #64748b;
  transition: all 0.2s ease-in-out;
  margin-bottom: 4px;
  position: relative;
}

/* 🟢 ICON BOX */
.menu-icon-box {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  color: #94a3b8;
  border-radius: 10px;
  transition: all 0.2s;
}

.menu-icon-box svg { width: 18px; height: 18px; }

.menu-text { font-size: 1rem; font-weight: 400; }

/* 🟢 HOVER STATE */
.nav-link:hover {
  background-color: #f1f5f9;
  color: #1e293b;
  transform: translateX(5px);
}

.nav-link:hover .menu-icon-box {
  background-color: #ffffff;
  color: #cc0000;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

/* 🟢 ACTIVE STATE (ตอนนี้อยู่ที่หน้าไหน) */
.nav-link.router-link-active {
  background-color: #fef2f2; /* พื้นหลังแดงอ่อน CI */
  color: #cc0000; /* ตัวอักษรแดง CI */
  font-weight: 600;
}

.nav-link.router-link-active .menu-icon-box {
  background-color: #cc0000;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(204, 0, 0, 0.2);
}

/* ขีดแดงด้านข้างบอกตำแหน่งปัจจุบัน */
.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  left: -15px;
  top: 20%;
  height: 60%;
  width: 4px;
  background-color: #cc0000;
  border-radius: 0 4px 4px 0;
}

/* 🟢 LOGOUT STYLE */
.logout-link { color: #ef4444; margin-top: 10px; }
.logout-link .logout-icon { background-color: #fff1f2; color: #ef4444; }
.logout-link:hover { background-color: #fff1f2; }
.logout-link:hover .logout-icon { background-color: #fecaca; }

/* ซ่อน Sidebar เมื่ออยู่บนมือถือ (ให้ใช้ TopMenu.vue แทน) */
@media (max-width: 991px) {
  .panda-sidebar {
    display: none;
  }
}
</style>