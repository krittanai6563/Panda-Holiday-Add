<template>
  <div id="app-layout">
    <TopMenu v-if="$route.name !== 'login'" />
    <Sidebar v-if="$route.name !== 'login'" />

    <main :class="$route.name === 'login' ? 'login-content' : 'admin-content'">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 🟢 นำเข้า Component หลักของระบบ
import TopMenu from './components/TopMenu.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

/* -----------------------------------
   🟢 โครงสร้างพื้นฐานของ Layout 
----------------------------------- */
#app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Kanit', sans-serif;
}

/* -----------------------------------
   🟢 หน้าแอดมินทั่วไป (แก้ไขการทับซ้อน)
----------------------------------- */
.admin-content {
  flex-grow: 1;
  /* 👈 ดันเนื้อหาไปทางขวาหลบ Sidebar (Sidebar ของคุณกว้าง 280px) */
  margin-left: 280px; 
  /* 👈 ป้องกันไม่ให้เนื้อหากว้างเกินจอจนเกิด Scroll แนวนอน */
  width: calc(100% - 280px); 
  transition: all 0.3s ease;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* -----------------------------------
   🟢 หน้า Login (แสดงผลเต็มหน้าจอ)
----------------------------------- */
.login-content {
  width: 100vw;
  min-height: 100vh;
  margin: 0 !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
}

/* -----------------------------------
   🟢 Global CSS (บังคับ Box Model)
----------------------------------- */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Kanit', sans-serif;
  overflow-x: hidden; /* ซ่อนแถบเลื่อนแนวนอนของหน้าเว็บหลัก */
  background-color: #f8fafc;
}

/* -----------------------------------
   🟢 Responsive (มือถือและแท็บเล็ต)
----------------------------------- */
@media (max-width: 991px) {
  .admin-content {
    /* บนมือถือ Sidebar ถูกซ่อนไปแล้ว จึงไม่ต้องเว้นระยะด้านซ้าย */
    margin-left: 0; 
    width: 100%;
    /* 👈 ดันเนื้อหาลงมาหลบแถบ Topbar ด้านบน (ความสูง Topbar คือ 70px) */
    padding-top: 70px; 
  }
}
</style>