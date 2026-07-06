<template>
  <div class="modern-login-layout">
    
    <div class="login-left">
      <div class="glass-decoration shape-1"></div>
      <div class="glass-decoration shape-2"></div>
      
      <div class="brand-content">
        <img 
          src="https://panda.co.th/wp-content/uploads/2025/10/logo-panda-holiday.webp" 
          alt="Panda Holiday" 
          class="hero-logo"
        />
        <h1>ยินดีต้อนรับสู่<br/>Panda Admin</h1>
        <p>ระบบจัดการเว็บไซต์และโปรแกรมทัวร์แบบครบวงจร</p>
      </div>
    </div>

    <div class="login-right">
      <div class="login-form-container">
        
        <div class="mobile-logo">
          <img 
            src="https://panda.co.th/wp-content/uploads/2025/10/logo-panda-holiday.webp" 
            alt="Panda Holiday"
          />
        </div>

        <div class="form-header">
          <h2>Sign In</h2>
          <p>เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <form @submit.prevent="handleLogin" class="modern-form">
          
          <div class="input-group">
            <label>ชื่อผู้ใช้งาน (Username)</label>
            <div class="input-wrapper" :class="{ 'is-focused': focusField === 'username' }">
              <span class="icon">👤</span>
              <input 
                type="text" 
                v-model="username" 
                required 
                placeholder="กรอกชื่อผู้ใช้งาน" 
                @focus="focusField = 'username'"
                @blur="focusField = null"
              />
            </div>
          </div>
          
          <div class="input-group">
            <label>รหัสผ่าน (Password)</label>
            <div class="input-wrapper" :class="{ 'is-focused': focusField === 'password' }">
              <span class="icon">🔒</span>
              <input 
                type="password" 
                v-model="password" 
                required 
                placeholder="••••••••" 
                @focus="focusField = 'password'"
                @blur="focusField = null"
              />
            </div>
          </div>

          <transition name="fade">
            <div v-if="errorMessage" class="error-alert">
              <span class="error-icon">⚠️</span> {{ errorMessage }}
            </div>
          </transition>

          <button type="submit" class="btn-login" :disabled="isLoading">
            <span v-if="isLoading" class="loader"></span>
            <span v-else>เข้าสู่ระบบ <span class="arrow">→</span></span>
          </button>

        </form>
        
        <div class="form-footer">
          <p>Panda Holiday Co., Ltd. © 2026</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const focusField = ref(null) // สำหรับทำเอฟเฟกต์ตอนคลิกช่องกรอก

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // 🟢 สร้างตัวแปรเก็บข้อมูล User & Password ทั้ง 2 คน
    const validUsers = {
      'aummarawadee01': 'it7dVLaU^Es0LPUd8e)dN%wX',
      'nongnum05': 'yvYr$FzmfEA(^#GGrmCl&TG&' 
    }

    // 🟢 เช็คว่ามี username ที่พิมพ์มาในระบบไหม และ password ตรงกันหรือไม่
    if (validUsers[username.value] && validUsers[username.value] === password.value) {
      
      // ล็อกอินผ่าน: เก็บ Token เพื่อเข้าสู่ระบบตามปกติ
      localStorage.setItem('admin_token', 'logged_in_token_xyz')
      
      // หน่วงเวลาเล็กน้อยให้ดูมีมิติการโหลด
      setTimeout(() => {
        router.push('/') 
      }, 600)
      
    } else {
      errorMessage.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!'
    }
  } catch (error) {
    errorMessage.value = 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 600)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

/* 🟢 Layout หลัก (แบ่งซ้าย-ขวา) */
.modern-login-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  font-family: 'Kanit', sans-serif;
  background-color: #ffffff;
  overflow: hidden;
}

/* -----------------------------------
   🟢 ฝั่งซ้าย (แบนเนอร์ / กราฟิก)
----------------------------------- */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #8b0000 0%, #cc0000 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}

/* ลูกเล่นกราฟิกวงกลมกระจกฝ้า (Glassmorphism) */
.glass-decoration {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.shape-1 {
  width: 400px; height: 400px;
  top: -100px; left: -100px;
}
.shape-2 {
  width: 300px; height: 300px;
  bottom: -50px; right: -50px;
  background: rgba(255, 255, 255, 0.05);
}

.brand-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
  animation: fadeUp 1s ease-out;
}

.hero-logo {
  max-width: 280px;
  margin-bottom: 30px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
  background-color: white;
  padding: 15px 25px;
  border-radius: 16px;
}

.brand-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 15px 0;
}

.brand-content p {
  font-size: 1.1rem;
  font-weight: 300;
  opacity: 0.9;
  margin: 0;
}

/* -----------------------------------
   🟢 ฝั่งขวา (ฟอร์ม Login)
----------------------------------- */
.login-right {
  width: 100%;
  max-width: 550px; /* จำกัดความกว้างฝั่งฟอร์ม */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  position: relative;
}

.login-form-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  animation: fadeIn 0.8s ease-out;
}

/* โลโก้ที่จะโชว์เฉพาะตอนจอเล็ก */
.mobile-logo {
  display: none;
  text-align: center;
  margin-bottom: 30px;
}
.mobile-logo img {
  max-width: 200px;
}

.form-header {
  margin-bottom: 35px;
}

.form-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.form-header p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

/* -----------------------------------
   🟢 ฟอร์มและ Input (สไตล์มินิมอล)
----------------------------------- */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

/* เอฟเฟกต์ตอนพิมพ์ */
.input-wrapper.is-focused {
  background: #ffffff;
  border-color: #cc0000;
  box-shadow: 0 0 0 4px rgba(204, 0, 0, 0.1);
}

.input-wrapper .icon {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-right: 12px;
  transition: color 0.3s;
}

.input-wrapper.is-focused .icon {
  color: #cc0000;
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 0;
  font-size: 1rem;
  font-family: 'Kanit', sans-serif;
  color: #1e293b;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

/* แจ้งเตือน Error */
.error-alert {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #fecaca;
}

/* 🟢 ปุ่ม Login */
.btn-login {
  margin-top: 10px;
  background: linear-gradient(135deg, #cc0000 0%, #a30000 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 14px rgba(204, 0, 0, 0.25);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(204, 0, 0, 0.35);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.arrow {
  margin-left: 8px;
  transition: transform 0.3s;
}

.btn-login:hover .arrow {
  transform: translateX(5px);
}

/* Footer เล็กๆ ด้านล่าง */
.form-footer {
  margin-top: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
}

/* 🟢 อนิเมชันโหลด */
.loader {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* -----------------------------------
   🟢 Responsive (สำหรับหน้าจอมือถือ/แท็บเล็ต)
----------------------------------- */
@media (max-width: 991px) {
  /* ซ่อนฝั่งซ้ายไปเลยเมื่อจอเล็ก */
  .login-left {
    display: none; 
  }
  
  .login-right {
    max-width: 100%;
    background-color: #f8fafc; /* เปลี่ยนพื้นหลังมือถือให้เป็นสีเทาอ่อน */
  }
  
  .login-form-container {
    background: white;
    border-radius: 20px;
    padding: 40px 30px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    margin: 20px;
  }

  /* โชว์โลโก้ในแบบฟอร์มแทน */
  .mobile-logo {
    display: block;
  }
}
</style>