<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">🏷️</span> หมวดหมู่ราคา (Pricing Categories)</h1>
        <p class="page-subtitle">จัดการประเภทราคาสำหรับปลั๊กอิน WP Travel (เช่น ผู้ใหญ่, เด็ก, พักเดี่ยว)</p>
      </div>
      <div class="header-actions">
        <button @click="fetchCategories" class="btn btn-outline-secondary" :disabled="isLoading">
          🔄 โหลดข้อมูลใหม่
        </button>
        <button @click="toggleForm" class="btn btn-primary" :class="{ 'btn-cancel': showAddForm }">
          {{ showAddForm ? '❌ ปิดฟอร์ม' : '+ เพิ่มหมวดหมู่ราคา' }}
        </button>
      </div>
    </header>

    <transition name="slide-fade">
      <div v-if="showAddForm" class="add-form-card shadow-sm" :class="{ 'edit-mode-card': isEditMode }">
        <h3 class="form-title">
          {{ isEditMode ? '✏️ แก้ไขหมวดหมู่ราคา' : '✨ เพิ่มหมวดหมู่ราคาใหม่' }}
        </h3>
        <form @submit.prevent="submitCategory" class="destination-form">
          <div class="form-grid">
            <div class="form-group">
              <label>ชื่อหมวดหมู่ราคา <span class="text-danger">*</span></label>
              <input type="text" v-model="formData.name" required placeholder="เช่น ผู้ใหญ่, เด็กเสริมเตียง" class="form-control" />
            </div>
            <div class="form-group">
              <label>Slug (URL ภาษาอังกฤษ/ไม่มีเว้นวรรค)</label>
              <input type="text" v-model="formData.slug" placeholder="เช่น adult, child-bed (เว้นว่างไว้ระบบจะสร้างให้)" class="form-control" />
            </div>
            
            <div class="form-group full-width">
              <label>รายละเอียด (Description)</label>
              <textarea v-model="formData.description" class="form-control" rows="3" placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับเงื่อนไขราคานี้..."></textarea>
            </div>
          </div>
          
          <div class="form-actions mt-4">
            <button type="button" @click="resetForm" class="btn btn-outline-secondary">ยกเลิก</button>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting">⏳ กำลังบันทึก...</span>
              <span v-else>{{ isEditMode ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มข้อมูล' }}</span>
            </button>
          </div>
        </form>
      </div>
    </transition>

    <div v-if="isLoading" class="state-container mt-4">
      <span class="loading-spinner">⏳</span> กำลังดึงข้อมูลหมวดหมู่ราคา...
    </div>
    <div v-else-if="errorMessage" class="state-container error-text mt-4">
      ❌ {{ errorMessage }}
    </div>
    <div v-else-if="categories.length === 0" class="state-container mt-4">
      📭 ยังไม่มีข้อมูลหมวดหมู่ราคาในระบบ
    </div>

    <div v-else class="table-card shadow-sm mt-4">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">ลำดับ</th>
              <th width="25%">ชื่อหมวดหมู่ราคา (Name)</th>
              <th width="35%">รายละเอียด (Description)</th>
              <th width="120" class="text-center">จำนวนทัวร์</th>
              <th width="100" class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cat, index) in categories" :key="cat.id" :class="{ 'highlight-row': isEditMode && editId === cat.id }">
              <td class="text-center font-bold" data-label="ลำดับ">{{ index + 1 }}</td>
              
              <td class="dest-name" data-label="ชื่อหมวดหมู่ราคา">{{ cat.name }}</td>
              <td data-label="รายละเอียด" class="description-cell">{{ cat.description || '-' }}</td>
              
              <td class="text-center" data-label="จำนวนทัวร์">
                <button @click="viewTours(cat)" class="badge-count-btn" :disabled="cat.count === 0">
                  {{ cat.count }} ทัวร์
                </button>
              </td>
              <td class="text-center" data-label="จัดการ">
                <div class="action-flex">
                  <button @click="openEditForm(cat)" class="btn-icon btn-edit" title="แก้ไข">✏️</button>
                  <button @click="confirmDelete(cat.id, cat.name)" class="btn-icon btn-delete" title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <small class="text-muted">ดึงข้อมูลสำเร็จทั้งหมด {{ categories.length }} รายการ</small>
      </div>
    </div>

    <transition name="slide-fade">
      <div v-if="showToursModal" class="modal-overlay" @click.self="showToursModal = false">
        <div class="modal-content shadow-lg">
          <header class="modal-header">
            <h3>ทัวร์ที่ใช้ราคา: {{ selectedCategory?.name }}</h3>
            <button @click="showToursModal = false" class="close-btn">&times;</button>
          </header>
          <div class="modal-body">
            <div v-if="isFetchingTours" class="text-center p-4">⏳ กำลังโหลดรายการทัวร์...</div>
            <ul v-else-if="toursInCategory.length > 0" class="tour-list">
              <li v-for="tour in toursInCategory" :key="tour.id" class="tour-item">
                <span class="tour-code">{{ tour.code || 'NO-CODE' }}</span>
                <span class="tour-title">{{ tour.title }}</span>
                <span :class="'status-dot ' + (tour.status === 'publish' ? 'publish' : 'draft')"></span>
              </li>
            </ul>
            <p v-else class="text-center p-4 text-muted">ไม่มีทัวร์ที่ใช้ราคานี้</p>
          </div>
        </div>
      </div>
    </transition>

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
            คุณกำลังจะลบหมวดหมู่ <br><strong>"{{ itemToDelete?.name }}"</strong><br>
            <span class="text-muted text-sm">(การกระทำนี้ไม่สามารถย้อนกลับได้)</span>
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
import { ref, onMounted } from 'vue'
import axios from 'axios'

const categories = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const showAddForm = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const isSubmitting = ref(false)

const formData = ref({ 
  name: '', 
  slug: '', 
  description: ''
})

const showToursModal = ref(false)
const selectedCategory = ref(null)
const toursInCategory = ref([])
const isFetchingTours = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })
const showConfirmModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)

// 🟢 แก้ไข API Configuration (ลบ ?route= ออก และใช้ผ่าน params)
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api.php`, 
  timeout: 120000
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchCategories = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    // 🟢 ส่ง route ผ่าน params
    const response = await api.get('', { 
      params: { route: 'taxonomy-terms/itinerary_pricing_category' } 
    })
    if (response.data && response.data.success) {
      categories.value = response.data.items || []
    } else {
      categories.value = []
    }
  } catch (error) {
    errorMessage.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
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
  formData.value = { name: '', slug: '', description: '' }
  isEditMode.value = false
  editId.value = null
  showAddForm.value = false
}

const openEditForm = (cat) => {
  isEditMode.value = true
  editId.value = cat.id
  formData.value = { 
    name: cat.name, 
    slug: cat.slug,
    description: cat.description || ''
  }
  showAddForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const submitCategory = async () => {
  if (!formData.value.name) return
  isSubmitting.value = true

  try {
    const payload = {
      name: formData.value.name,
      slug: formData.value.slug.toLowerCase().replace(/\s+/g, '-'),
      description: formData.value.description
    }

    let response
    if (isEditMode.value) {
      // 🟢 ส่ง route ผ่าน params (กรณีแก้ไข)
      response = await api.post('', payload, { 
        params: { route: `taxonomy-terms/itinerary_pricing_category/${editId.value}` } 
      })
    } else {
      // 🟢 ส่ง route ผ่าน params (กรณีเพิ่มใหม่)
      response = await api.post('', payload, { 
        params: { route: 'taxonomy-terms/itinerary_pricing_category' } 
      })
    }

    if (response.data && response.data.success) {
      showToast(isEditMode.value ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!', 'success')
      await fetchCategories()
      resetForm()
    } else {
      showToast(response.data.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error')
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (id, name) => {
  itemToDelete.value = { id, name }
  showConfirmModal.value = true
}

const cancelDelete = () => {
  showConfirmModal.value = false
  itemToDelete.value = null
}

const executeDelete = async () => {
  if (!itemToDelete.value) return
  isDeleting.value = true

  try {
    // 🟢 ส่ง route ผ่าน params (กรณีลบ)
    const response = await api.delete('', { 
      params: { route: `taxonomy-terms/itinerary_pricing_category/${itemToDelete.value.id}` } 
    })
    
    if (response.data && response.data.success) {
      showToast('ลบข้อมูลสำเร็จ!', 'success')
      fetchCategories()
    } else {
       showToast(response.data.message || 'ไม่สามารถลบข้อมูลได้', 'error')
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error')
  } finally {
    isDeleting.value = false
    showConfirmModal.value = false
    itemToDelete.value = null
  }
}

const viewTours = async (cat) => {
  if (cat.count === 0) return
  selectedCategory.value = cat
  showToursModal.value = true
  isFetchingTours.value = true
  toursInCategory.value = []

  try {
    // 🟢 ส่ง route ผ่าน params (ดึงข้อมูลทัวร์)
    const response = await api.get('', { 
      params: { route: `taxonomy-tours/itinerary_pricing_category/${cat.id}` } 
    })
    if (Array.isArray(response.data)) {
      toursInCategory.value = response.data
    }
  } catch (error) {
    console.error("Fetch tours error:", error)
    showToast('ไม่สามารถดึงข้อมูลทัวร์ได้', 'error')
  } finally {
    isFetchingTours.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

/* 🟢 บังคับ Box Model ให้ช่องกรอกไม่ล้นกรอบ 100% */
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
  min-height: 100vh;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 🟢 Header */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); margin: 0; display: flex; align-items: center; gap: 10px;}
.page-subtitle { color: #64748b; margin: 5px 0 0 0; font-weight: 300;}
.header-actions { display: flex; gap: 10px; }

/* 🟢 Buttons */
.btn { font-family: 'Kanit', sans-serif; border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s; font-weight: 500; padding: 10px 20px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
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
.btn-icon { background: white; border: 1px solid #cbd5e1; width: 34px; height: 34px; padding: 0; border-radius: 8px; }
.btn-edit:hover { background: #f0fdf4; border-color: #16a34a; color: #16a34a;}
.btn-delete:hover { background: #fef2f2; border-color: #dc2626; color: #dc2626;}

/* 🟢 Form Card */
.add-form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid var(--color-border); border-top: 4px solid var(--color-primary); margin-bottom: 25px; }
.edit-mode-card { border-top-color: #3b82f6; }
.form-title { font-size: 1.2rem; font-weight: 600; color: var(--color-secondary); margin: 0 0 20px 0; }

/* 🟢 Form Grid & Control (จัดระเบียบไม่ให้ทับซ้อน) */
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
.form-control:focus { background-color: #ffffff; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.15); }
textarea.form-control { resize: vertical; min-height: 80px; }
.text-danger { color: #dc2626; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding-top: 20px; border-top: 1px solid #e2e8f0; }

/* 🟢 State Container (Loading / Error / Empty) */
.state-container { text-align: center; padding: 50px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b; font-size: 1.1rem; }
.error-text { color: #cc0000; border-color: #fca5a5; background: #fef2f2; }

/* 🟢 Table Styles */
.table-card { background: white; border-radius: 12px; border: 1px solid var(--color-border); overflow: hidden; }
.table-responsive { width: 100%; overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.modern-table th { background: #f8fafc; padding: 14px; text-align: left; color: #334155; font-weight: 600; border-bottom: 2px solid #cbd5e1; font-size: 0.95rem;}
.modern-table td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #475569; }
.modern-table tbody tr:hover td { background: #f8fafc; }
.highlight-row { background-color: #fef3c7 !important; }
.card-footer { padding: 15px; border-top: 1px solid #e2e8f0; background-color: #f8fafc; }

.dest-name { font-weight: 600; color: var(--color-secondary); font-size: 1.05rem; }
.description-cell { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.9rem;}

.badge-count-btn { background-color: #f0fdf4; color: #16a34a; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; border: 1px solid #bbf7d0; cursor: pointer; transition: 0.2s; font-family: 'Kanit';}
.badge-count-btn:hover:not(:disabled) { background-color: #dcfce7; transform: scale(1.05); }
.badge-count-btn:disabled { background: #f1f5f9; color: #64748b; border-color: #cbd5e1; cursor: default; transform: none;}
.action-flex { display: flex; gap: 8px; justify-content: center; }

/* 🟢 Modal ดูรายการทัวร์ */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-content { background: white; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; margin: 0; }
.modal-header h3 { margin: 0; font-size: 1.1rem; color: var(--color-secondary); font-weight: 600; }
.modal-body { padding: 20px; overflow-y: auto; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; transition: 0.2s; }
.close-btn:hover { color: #cc0000; }
.tour-list { list-style: none; padding: 0; margin: 0; }
.tour-item { padding: 12px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
.tour-code { background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
.tour-title { flex: 1; font-size: 0.95rem; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-left: auto;}
.status-dot.publish { background: #22c55e; box-shadow: 0 0 5px #22c55e; }
.status-dot.draft { background: #cbd5e1; }

/* 🟢 Confirm Delete Modal */
.confirm-modal { max-width: 400px; padding: 30px; text-align: center; border-top: 5px solid #dc2626; border-radius: 12px;}
.confirm-icon-wrapper { width: 60px; height: 60px; background: #fef2f2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }
.confirm-icon { font-size: 1.8rem; }
.confirm-title { margin: 0 0 10px 0; font-size: 1.3rem; color: var(--color-secondary); }
.confirm-text { color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 25px; }
.text-sm { font-size: 0.85rem; }
.confirm-actions { display: flex; justify-content: center; gap: 10px; }

/* 🟢 Toast */
.custom-toast { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px; background: white; display: flex; align-items: center; gap: 10px; z-index: 1000; font-weight: 500; border-left: 4px solid; }
.custom-toast.success { border-left-color: #16a34a; color: #166534; background: #f0fdf4;}
.custom-toast.error { border-left-color: #dc2626; color: #991b1b; background: #fef2f2;}
.toast-icon { font-size: 1.2rem; }

/* 🟢 Transitions */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-20px); opacity: 0; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(50px); }

/* 🟢 Responsive Adjustments (รองรับมือถือและแท็บเล็ต) */
@media (max-width: 768px) {
  .admin-page-container { padding: 15px; }
  .form-grid { 
    grid-template-columns: 1fr; /* บังคับเหลือ 1 คอลัมน์บนมือถือ */
    gap: 15px; 
  }
  
  /* 🟢 แปลงตารางเป็น Card บนหน้าจอมือถือ */
  .table-responsive { overflow-x: hidden; }
  .modern-table { min-width: 100%; }
  .modern-table thead { display: none; }
  .modern-table tbody tr { display: block; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 15px; background-color: #fff; padding: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);}
  .modern-table td { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding: 12px 5px; text-align: right !important; }
  .modern-table td:last-child { border-bottom: none; }
  
  /* ดึงคำจาก data-label มาแสดงฝั่งซ้าย */
  .modern-table td::before { content: attr(data-label); font-weight: 600; color: #64748b; font-size: 0.9rem; text-align: left; }
  .description-cell { max-width: none; white-space: normal; text-align: right; }
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