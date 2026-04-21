<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">✈️</span> สายการบิน (Airlines)</h1>
        <p class="page-subtitle">จัดการข้อมูลสายการบินและโลโก้สำหรับใช้ในโปรแกรมทัวร์</p>
      </div>
      <div class="header-actions">
        <button @click="fetchAirlines" class="btn btn-outline-secondary" :disabled="isLoading">
          🔄 โหลดข้อมูลใหม่
        </button>
        <button @click="toggleForm" class="btn btn-primary" :class="{ 'btn-cancel': showAddForm }">
          {{ showAddForm ? '❌ ปิดฟอร์ม' : '+ เพิ่มสายการบินใหม่' }}
        </button>
      </div>
    </header>

    <transition name="slide-fade">
      <div v-if="showAddForm" class="add-form-card shadow-sm" :class="{ 'edit-mode-card': isEditMode }">
        <h3 class="form-title">
          {{ isEditMode ? '✏️ แก้ไขข้อมูลสายการบิน' : '✨ เพิ่มสายการบินใหม่' }}
        </h3>
        <form @submit.prevent="submitAirline" class="destination-form">
          <div class="form-grid">
            <div class="form-group">
              <label>ชื่อสายการบิน (Airline Name) <span class="text-danger">*</span></label>
              <input type="text" v-model="formData.airline_name" required placeholder="เช่น Thai Airways, Emirates" class="form-control" />
            </div>
            
            <div class="form-group">
              <label>รหัสสายการบิน (Airline Code/Key) <span class="text-danger">*</span></label>
              <input type="text" v-model="formData.airline_key" required :disabled="isEditMode" placeholder="เช่น TG, EK (ระบบจะใช้อ้างอิง)" class="form-control" />
            </div>

            <div class="form-group full-width">
              <label>
                โลโก้สายการบิน (Airline Logo)
                <span class="size-hint">💡 แนะนำ: พื้นหลังโปร่งใส (PNG) ขนาดประมาณ 200 x 200 px</span>
              </label>
              
              <div class="custom-upload-box" :class="{'has-preview': previewImage}">
                <input type="file" id="logo-upload" accept="image/*" @change="onImageChange" class="hidden-input" />
                <label for="logo-upload" class="upload-label-area">
                  <template v-if="previewImage">
                    <img :src="previewImage" class="preview-full-img logo-preview-img" alt="Logo Preview" />
                    <div class="hover-overlay">
                      <span class="icon">📷</span> คลิกเพื่อเปลี่ยนโลโก้
                    </div>
                  </template>
                  <template v-else>
                    <div class="upload-placeholder">
                      <span class="upload-icon">🛫</span>
                      <span class="upload-text">คลิกเพื่ออัปโหลด หรือลากไฟล์โลโก้มาวางที่นี่</span>
                    </div>
                  </template>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="resetForm" class="btn btn-outline-secondary">ยกเลิก</button>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting">⏳ กำลังบันทึก...</span>
              <span v-else>{{ isEditMode ? '✅ อัปเดตข้อมูล' : '➕ เพิ่มสายการบิน' }}</span>
            </button>
          </div>
        </form>
      </div>
    </transition>

    <div v-if="isLoading" class="state-container mt-4">
      <span class="loading-spinner">⏳</span> กำลังดึงข้อมูลสายการบิน...
    </div>
    <div v-else-if="errorMessage" class="state-container error-text mt-4">
      ❌ {{ errorMessage }}
    </div>
    <div v-else-if="airlines.length === 0" class="state-container mt-4">
      📭 ยังไม่มีข้อมูลสายการบินในระบบ
    </div>

    <div v-else class="table-card shadow-sm mt-4">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">ลำดับ</th>
              <th width="120" class="text-center">โลโก้</th> 
              <th>ชื่อสายการบิน (Name)</th>
              <th width="150" class="text-center">รหัส (Key)</th>
              <th width="100" class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in airlines" :key="item.airline_key" :class="{ 'highlight-row': isEditMode && editId === item.airline_key }">
              <td class="text-center font-bold" data-label="ลำดับ">{{ index + 1 }}</td>
              
              <td class="text-center" data-label="โลโก้">
                <div class="table-image-wrapper airline-logo-bg">
                  <img v-if="item.airline_logo" :src="item.airline_logo" class="table-img logo-contain" />
                  <span v-else class="no-img">✈️</span>
                </div>
              </td>

              <td data-label="ชื่อสายการบิน (Name)">
                <div class="dest-name">{{ item.airline_name }}</div>
              </td>
              <td class="text-center" data-label="รหัส (Key)">
                <span class="key-badge">{{ item.airline_key }}</span>
              </td>
              <td class="text-center" data-label="จัดการ">
                <div class="action-flex">
                  <button @click="openEditForm(item)" class="btn-icon btn-edit" title="แก้ไข">✏️</button>
                  <button @click="confirmDelete(item)" class="btn-icon btn-delete" title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <small class="text-muted">ดึงข้อมูลสำเร็จทั้งหมด {{ airlines.length }} รายการ</small>
      </div>
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" class="custom-toast shadow-md" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>

    <transition name="slide-fade">
      <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal-content confirm-modal shadow-lg">
          <div class="confirm-icon-wrapper"><span class="confirm-icon">⚠️</span></div>
          <h3 class="confirm-title">ยืนยันการลบข้อมูล?</h3>
          <p class="confirm-text">
            คุณกำลังจะลบสายการบิน <br><strong>"{{ itemToDelete?.airline_name }}"</strong><br>
            <span class="text-muted text-sm">(การลบข้อมูลนี้อาจส่งผลให้รูปโลโก้สายการบินในโปรแกรมทัวร์หายไป)</span>
          </p>
          <div class="confirm-actions">
            <button @click="cancelDelete" class="btn btn-outline-secondary">ยกเลิก</button>
            <button @click="executeDelete" class="btn btn-danger" :disabled="isDeleting">
              <span v-if="isDeleting">⏳ กำลังลบ...</span>
              <span v-else>🗑️ ยืนยันการลบ</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const airlines = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const showAddForm = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const isSubmitting = ref(false)

const formData = ref({ 
  airline_name: '', 
  airline_key: '', 
  airline_logo: '',
  imageFile: null
})

// พรีวิวโลโก้ (ไฟล์ที่เลือกสดๆ หรือ URL เดิม)
const localImagePreview = ref(null)
const previewImage = computed(() => localImagePreview.value || formData.value.airline_logo || null)

const toast = ref({ show: false, message: '', type: 'success' })
const showConfirmModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)

// 🟢 แก้ไข Axios (เรียกใช้ api และต่อ route ผ่าน params)
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api.php`, 
  timeout: 120000
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchAirlines = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('', { params: { route: 'airlines' } })
    if (Array.isArray(response.data)) {
      airlines.value = response.data
    } else {
      airlines.value = []
    }
  } catch (error) {
    errorMessage.value = 'ไม่สามารถดึงข้อมูลสายการบินได้'
    showToast('ดึงข้อมูลไม่สำเร็จ', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleForm = () => {
  if (showAddForm.value) resetForm()
  else showAddForm.value = true
}

const resetForm = () => {
  formData.value = { airline_name: '', airline_key: '', airline_logo: '', imageFile: null }
  localImagePreview.value = null
  isEditMode.value = false
  editId.value = null
  showAddForm.value = false
}

const openEditForm = (item) => {
  isEditMode.value = true
  editId.value = item.airline_key
  formData.value = { ...item, imageFile: null }
  localImagePreview.value = null
  showAddForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    formData.value.imageFile = file
    localImagePreview.value = URL.createObjectURL(file)
  }
}

const submitAirline = async () => {
  if (!formData.value.airline_name || !formData.value.airline_key) return
  isSubmitting.value = true

  try {
    let finalLogoId = null

    // 1. อัปโหลดโลโก้ใหม่เข้าระบบ (ถ้ามี)
    if (formData.value.imageFile) {
      const webpLogo = await convertToWebP(formData.value.imageFile, 0.8)
      const uploadData = new FormData()
      uploadData.append('featuredImage', webpLogo) 
      
      const uploadRes = await api.post('', uploadData, {
        params: { route: 'upload-tour-assets' },
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (uploadRes.data?.featuredImage) {
        finalLogoId = uploadRes.data.featuredImage.attachment_id
      }
    }

   const payload = {
      airline_name: formData.value.airline_name,
      airline_key: formData.value.airline_key,
      airline_logo: finalLogoId
    }

    const response = await api.post('', payload, { params: { route: 'add-airline' } })

    if (response.data?.success) {
      showToast(isEditMode.value ? 'อัปเดตสายการบินสำเร็จ!' : 'เพิ่มสายการบินสำเร็จ!')
      await fetchAirlines()
      setTimeout(() => { resetForm() }, 500)
    } else {
      showToast(response.data?.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error')
    }
  } catch (error) {
    showToast('เกิดข้อผิดพลาดในการบันทึก', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  showConfirmModal.value = true
}

const cancelDelete = () => {
  showConfirmModal.value = false
  itemToDelete.value = null
}

const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') || file.type === 'image/webp' || file.type === 'image/gif') {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width; canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
            resolve(new File([blob], newFileName, { type: 'image/webp' }))
          } else {
            reject(new Error('แปลงรูปไม่สำเร็จ'))
          }
        }, 'image/webp', quality) 
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

const executeDelete = async () => {
  if (!itemToDelete.value) return
  isDeleting.value = true
  try {
    const response = await api.post('', { airline_key: itemToDelete.value.airline_key }, { params: { route: 'delete-airline' } })
    if (response.data?.success) {
      showToast('ลบสายการบินสำเร็จ!')
      await fetchAirlines()
    } else {
      showToast(response.data?.message || 'ไม่สามารถลบข้อมูลได้', 'error')
    }
  } catch (error) {
    showToast('ระบบ Backend ยังไม่รองรับฟังก์ชันการลบ โปรดเพิ่ม API /delete-airline', 'error')
  } finally {
    isDeleting.value = false
    showConfirmModal.value = false
    itemToDelete.value = null
  }
}

onMounted(() => {
  fetchAirlines()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

/* 🟢 บังคับ Box Model ให้กล่อง Input ไม่ทะลุกรอบ 100% */
*, *::before, *::after {
  box-sizing: border-box;
}

.admin-page-container {
  --color-primary: #cc0000;
  --color-secondary: #1a1a1a;
  --color-success: #16a34a;
  --color-bg: #f8fafc;
  --color-border: #e2e8f0;
  --color-text: #334155;
  font-family: 'Kanit', sans-serif;
  background-color: var(--color-bg);
  min-height: 100vh; padding: 30px; max-width: 1200px; margin: 0 auto;
}

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); margin: 0; display: flex; align-items: center; gap: 10px;}
.page-subtitle { color: #64748b; margin: 5px 0 0 0; font-weight: 300;}
.header-actions { display: flex; gap: 10px; }

.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s; border: none; font-family: 'Kanit'; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { background: var(--color-primary); color: white; box-shadow: 0 4px 6px rgba(204,0,0,0.15); }
.btn-primary:hover:not(:disabled) { background: #a30000; transform: translateY(-1px); }
.btn-cancel { background: #64748b !important; box-shadow: none; }
.btn-cancel:hover { background: #475569 !important; }
.btn-success { background: var(--color-success); color: white; }
.btn-success:hover:not(:disabled) { background: #15803d; }
.btn-danger { background: #dc2626; color: white; }
.btn-danger:hover:not(:disabled) { background: #b91c1c; }
.btn-outline-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; }
.btn-outline-secondary:hover:not(:disabled) { background: #f8fafc; border-color: #94a3b8; }

.add-form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid var(--color-border); border-top: 4px solid var(--color-primary); margin-bottom: 30px; }
.edit-mode-card { border-top-color: #3b82f6; }
.form-title { font-size: 1.2rem; font-weight: 600; color: var(--color-secondary); margin: 0 0 20px 0; }

/* 🟢 Form Grid & Spacing (ปรับระยะห่างและช่องกรอกสวยงาม) */
.form-grid { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 24px; 
}
.form-group { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  width: 100%;
  margin-bottom: 15px; 
}
.full-width { grid-column: 1 / -1; }
.form-group label { font-weight: 500; font-size: 0.95rem; color: #334155; }

/* 🟢 Form Control (ไม่ทะลุกรอบ มีเอฟเฟกต์ตอนกด) */
.form-control { 
  width: 100%; 
  padding: 12px 16px; 
  border: 1px solid #cbd5e1; 
  border-radius: 8px; 
  font-family: 'Kanit', sans-serif; 
  font-size: 0.95rem; 
  color: #1e293b;
  background-color: #f8fafc; 
  transition: all 0.25s ease-in-out; 
  outline: none;
}
.form-control:focus { 
  background-color: #ffffff; 
  border-color: var(--color-primary); 
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.15); 
}
.form-control:disabled { background-color: #e2e8f0; cursor: not-allowed; color: #64748b; }
.text-danger { color: #dc2626; }
.size-hint { font-size: 0.8rem; color: #64748b; font-weight: 300; margin-left: 8px; }

/* 🟢 Image Upload Box */
.custom-upload-box { width: 100%; position: relative; border: 2px dashed #cbd5e1; border-radius: 12px; background: #f8fafc; transition: all 0.2s; overflow: hidden; height: 180px; }
.custom-upload-box:hover { border-color: var(--color-primary); background: #fff5f5; }
.hidden-input { position: absolute; width: 0; height: 0; opacity: 0; }
.upload-label-area { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; cursor: pointer; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #64748b; }
.upload-icon { font-size: 2.5rem; opacity: 0.7; }
.upload-text { font-weight: 500; }
.logo-preview-img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }
.hover-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); color: white; display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: 0.2s; font-weight: 500; pointer-events: none; }
.custom-upload-box:hover .hover-overlay { opacity: 1; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding-top: 20px; border-top: 1px solid #e2e8f0; }

/* 🟢 State Container (Loading / Error / Empty) */
.state-container { 
  text-align: center; 
  padding: 50px; 
  background: #fff; 
  border-radius: 12px; 
  border: 1px dashed #cbd5e1; 
  color: #64748b; 
  font-size: 1.1rem; 
}
.error-text { 
  color: #cc0000; 
  border-color: #fca5a5; 
  background: #fef2f2; 
}

/* 🟢 Table Styles */
.table-card { background: white; border-radius: 12px; border: 1px solid var(--color-border); overflow: hidden; }
.table-responsive { width: 100%; overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.modern-table th { background: #f8fafc; padding: 14px; text-align: left; color: #334155; font-weight: 600; border-bottom: 2px solid #cbd5e1; font-size: 0.95rem;}
.modern-table td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #475569; }
.modern-table tbody tr:hover td { background: #f8fafc; }
.highlight-row { background-color: #fef3c7 !important; }

/* 🟢 Footer สรุปรายการ */
.card-footer { padding: 15px; border-top: 1px solid #e2e8f0; background-color: #f8fafc; }

.table-image-wrapper { width: 70px; height: 40px; border-radius: 6px; overflow: hidden; background: white; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto; padding: 5px;}
.logo-contain { max-width: 100%; max-height: 100%; object-fit: contain; }
.no-img { font-size: 1.2rem; }

.key-badge { background: #f1f5f9; padding: 4px 12px; border-radius: 6px; font-family: monospace; font-weight: bold; color: #1e293b; border: 1px solid #e2e8f0; font-size: 0.9rem;}
.dest-name { font-weight: 600; color: var(--color-secondary); font-size: 1.05rem; }

.action-flex { display: flex; gap: 8px; justify-content: center; }
.btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; }
.btn-edit:hover { background: #eff6ff; border-color: #3b82f6; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; }

/* 🟢 Toast */
.custom-toast { position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 10px; background: white; display: flex; align-items: center; gap: 10px; z-index: 1000; border-left: 5px solid; }
.custom-toast.success { border-left-color: #16a34a; color: #166534; background: #f0fdf4;}
.custom-toast.error { border-left-color: #dc2626; color: #991b1b; background: #fef2f2;}

/* 🟢 Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
.modal-content { background: white; border-radius: 15px; width: 90%; max-width: 400px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }

.confirm-modal { padding: 30px; text-align: center; border-top: 5px solid #dc2626; }
.confirm-icon-wrapper { width: 60px; height: 60px; background: #fef2f2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 30px; }
.confirm-title { margin: 0 0 10px 0; font-size: 1.3rem; color: var(--color-secondary); }
.confirm-text { color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 25px; }
.text-sm { font-size: 0.85rem; }
.confirm-actions { display: flex; justify-content: center; gap: 12px; }

/* 🟢 Transitions */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-20px); opacity: 0; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(100%); opacity: 0; }

/* 🟢 Responsive Adjustments (รองรับมือถือและแท็บเล็ต 100%) */
@media (max-width: 768px) {
  .admin-page-container { padding: 15px; }
  .form-grid { 
    grid-template-columns: 1fr; /* บังคับให้เรียง 1 คอลัมน์ ไม่ให้ซ้อนทับกัน */
    gap: 15px; 
  }
  
  /* 🟢 แปลงตารางเป็น Card บนหน้าจอมือถือ */
  .table-responsive { overflow-x: hidden; }
  .modern-table { min-width: 100%; }
  .modern-table thead { display: none; }
  .modern-table tbody tr { 
    display: block; 
    border: 1px solid var(--color-border); 
    border-radius: 8px; 
    margin-bottom: 15px; 
    background-color: #fff; 
    padding: 10px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .modern-table td { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    border-bottom: 1px solid #f1f5f9; 
    padding: 12px 5px; 
    text-align: right !important; 
  }
  .modern-table td:last-child { border-bottom: none; }
  
  /* 🟢 ดึงคำจาก data-label มาแสดงเป็นหัวข้อฝั่งซ้าย */
  .modern-table td::before { 
    content: attr(data-label); 
    font-weight: 600; 
    color: #64748b; 
    font-size: 0.9rem; 
    text-align: left; 
  }
  
  .action-flex { justify-content: flex-end; }
}

@media (max-width: 576px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .header-actions .btn { width: 100%; justify-content: center; padding: 10px; font-size: 0.9rem;}
  .form-actions { flex-direction: column-reverse; }
  .form-actions .btn { width: 100%; }
  .confirm-actions { flex-direction: column-reverse; }
  .confirm-actions .btn { width: 100%; }
}
</style>