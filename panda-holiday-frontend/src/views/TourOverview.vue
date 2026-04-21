<template>
  <div class="tour-overview-container">
    
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">🌍</span> รายการโปรแกรมทัวร์ทั้งหมด</h1>
        <p class="page-subtitle">จัดการ ค้นหา และดูรายการโปรแกรมทัวร์ที่มีอยู่ในระบบ</p>
      </div>
      <router-link to="/add-tour" class="btn btn-primary">
        ➕ สร้างทัวร์ใหม่
      </router-link>
    </header>

    <div class="filter-bar shadow-sm">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="ค้นหาด้วยรหัสทัวร์ หรือ ชื่อโปรแกรม..." 
          class="form-control" 
        />
      </div>

      <div class="filter-actions">
        <select v-model="filterStatus" class="form-control form-select filter-select">
          <option value="all">สถานะทั้งหมด</option>
          <option value="publish">✅ เฉพาะที่เผยแพร่</option>
          <option value="draft">📝 เฉพาะฉบับร่าง</option>
        </select>

        <div class="view-toggle">
          <button type="button" class="btn-view" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="มุมมองแบบการ์ด">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </button>
          <button type="button" class="btn-view" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="มุมมองแบบตาราง">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="state-container shadow-sm">
      <div class="spinner"></div> กำลังโหลดข้อมูลโปรแกรมทัวร์...
    </div>

    <div v-else-if="errorMessage" class="state-container error-text shadow-sm">
      ❌ {{ errorMessage }}
    </div>

    <div v-else-if="filteredTours.length === 0" class="state-container shadow-sm">
      📭 ไม่พบโปรแกรมทัวร์ที่ค้นหา
    </div>

    <div v-else :class="['tour-display-area', viewMode === 'grid' ? 'grid-mode' : 'list-mode']">
      
      <div v-for="tour in filteredTours" :key="tour.id" class="tour-card shadow-sm">
        
        <div class="card-image">
          <img class="tour-card-image" :src="tour.featured_image_url || 'https://dev1.blupaperdev.com/wp-content/uploads/2026/03/tour-panda-defalt.webp'" alt="Tour Image" @error="$event.target.src='https://dev1.blupaperdev.com/wp-content/uploads/2026/03/tour-panda-defalt.webp'" />
          <div class="badge-price">
            <small>เริ่มต้น</small> <br> {{ tour.trip_price_display ? Number(tour.trip_price_display.replace(/,/g, '')).toLocaleString('th-TH') : 'N/A' }} ฿
          </div>
          <!-- <div class="badge-status" :class="tour.status">
            {{ tour.status === 'publish' ? 'ออนไลน์' : 'ฉบับร่าง' }}
          </div> -->
        </div>

        <div class="card-content">
          <div class="card-meta-top">
            <span class="trip-code">🏷️ {{ tour.trip_code || 'ไม่มีรหัส' }}</span>
            <span class="trip-duration">⏱️ {{ tour.trip_days_nights || '-' }}</span>
          </div>
          
          <h3 class="tour-title" :title="tour.title">{{ tour.title || 'ไม่มีชื่อโปรแกรมทัวร์' }}</h3>
          
          <div class="tour-specs">
            <div class="spec-item" v-if="tour.tour_airlines">
              <span class="icon">✈️</span> <span class="text">{{ getAirlineName(tour.tour_airlines) }}</span>
            </div>
            <div class="spec-item" v-if="tour.tour_hotel_rating">
              <span class="icon">⭐️</span> <span class="text">พัก {{ tour.tour_hotel_rating }} ดาว</span>
            </div>
            <div class="spec-item full-spec" v-if="tour.destination_ids && tour.destination_ids.length > 0">
              <span class="icon">📍</span> <span class="text category-text">{{ getDestinationNames(tour.destination_ids) }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
         <select 
  :value="tour.status" 
  @change="promptStatusChange(tour, $event)"
  class="btn-sm status-dropdown"
  :class="tour.status === 'publish' ? 'status-publish' : 'status-draft'"
  :disabled="tour.isUpdating"
>
  <option value="publish">✅ ออนไลน์</option>
  <option value="draft">📝 ซ่อนไว้ (ฉบับร่าง)</option>
</select>

          <div class="action-right">
            <router-link :to="`/tour/${tour.id}`" class="btn btn-icon btn-edit" title="แก้ไขโปรแกรมนี้">
              ✏️
            </router-link>
            <button @click="openDeleteModal(tour.id)" class="btn btn-icon btn-delete" title="ลบทิ้ง" :disabled="tour.isUpdating">
              🗑️
            </button>
          </div>
        </div>

      </div>
    </div>

    <transition name="fade">
      <div v-if="showDeleteModal" class="custom-modal-overlay" @click.self="closeDeleteModal">
        <div class="custom-modal-box delete-modal-box shadow-lg text-center">
          
          <div class="warning-icon-large">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          
          <h3 class="modal-title mt-3">ยืนยันการลบข้อมูล?</h3>
          <p class="modal-desc mt-2">
            คุณแน่ใจหรือไม่ว่าต้องการลบโปรแกรมทัวร์นี้? <br>
            <strong style="color: #dc2626;">ข้อมูลจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้</strong>
          </p>
          
          <div class="modal-actions-center mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal" :disabled="isDeleting">
              ยกเลิก
            </button>
            <button type="button" class="btn btn-danger" @click="executeDelete" :disabled="isDeleting">
              <span v-if="isDeleting">⏳ กำลังลบ...</span>
              <span v-else>🗑️ ยืนยันการลบ</span>
            </button>
          </div>
          
        </div>
      </div>
    </transition>

   <transition name="fade">
      <div v-if="showStatusModal" class="custom-modal-overlay" @click.self="cancelStatusChange">
        <div class="custom-modal-box status-modal-box shadow-lg text-center">
          
          <div class="warning-icon-large" style="background: #eff6ff; color: #3b82f6; box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);">
            <span style="font-size: 2rem;">❓</span>
          </div>
          
          <h3 class="modal-title mt-3">ยืนยันการเปลี่ยนสถานะ?</h3>
          <p class="modal-desc mt-2">
            คุณต้องการเปลี่ยนสถานะโปรแกรมทัวร์นี้เป็น <br>
            <strong :style="{ color: pendingNewStatus === 'publish' ? '#16a34a' : '#d97706', fontSize: '1.1rem' }">
              {{ pendingNewStatus === 'publish' ? '✅ ออนไลน์ (แสดงบนเว็บ)' : '📝 ฉบับร่าง (ซ่อนจากเว็บ)' }}
            </strong> 
            ใช่หรือไม่?
          </p>
          
          <div class="modal-actions-center mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="cancelStatusChange" :disabled="isStatusUpdating">
              ยกเลิก
            </button>
            <button type="button" class="btn btn-primary" @click="confirmStatusChange" :disabled="isStatusUpdating">
              <span v-if="isStatusUpdating">⏳ กำลังบันทึก...</span>
              <span v-else>ยืนยันการเปลี่ยนแปลง</span>
            </button>
          </div>
          
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="toastMessage" class="alert shadow" :class="toastType === 'success' ? 'alert-success' : 'alert-danger'">
        {{ toastMessage }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const tours = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const searchQuery = ref('')
const filterStatus = ref('all')
const viewMode = ref('grid')

const airlinesList = ref([])
const destinationsList = ref([])

const showDeleteModal = ref(false)
const tourIdToDelete = ref(null)
const isDeleting = ref(false)


// 🟢 ตัวแปรสำหรับควบคุม Modal เปลี่ยนสถานะ
const showStatusModal = ref(false)
const pendingStatusTour = ref(null)
const pendingNewStatus = ref('')
const isStatusUpdating = ref(false)

// 🟢 โค้ดที่ขาดหายไป (เพิ่มส่วนนี้เข้าไปครับ)
const toastMessage = ref('')
const toastType = ref('success')

const showToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  // ปิดแจ้งเตือนอัตโนมัติใน 3 วินาที
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}


// 🟢 ฟังก์ชันเมื่อผู้ใช้กดเลือก Dropdown (จะยังไม่เปลี่ยนค่าจริง แต่โชว์ Modal ก่อน)
const promptStatusChange = (tour, event) => {
  pendingStatusTour.value = tour
  pendingNewStatus.value = event.target.value
  showStatusModal.value = true
  
  // บังคับให้ Dropdown กลับไปแสดงค่าเดิมก่อน (จนกว่าจะกดยืนยัน)
  event.target.value = tour.status 
}

// 🟢 ฟังก์ชันเมื่อกดยกเลิก
const cancelStatusChange = () => {
  showStatusModal.value = false
  pendingStatusTour.value = null
  pendingNewStatus.value = ''
}

// 🟢 ฟังก์ชันเมื่อกดยืนยันการเปลี่ยนสถานะ
const confirmStatusChange = async () => {
  if (!pendingStatusTour.value) return
  
  const tour = pendingStatusTour.value
  const newStatus = pendingNewStatus.value
  
  isStatusUpdating.value = true
  tour.isUpdating = true

  try {
    const res = await secureApi.post(`/update-tour-status/${tour.id}`, { status: newStatus })
    if(res.data && res.data.success) {
      // ✅ เมื่อ API สำเร็จ ค่อยอัปเดตค่า status บนหน้าจอให้เปลี่ยนตาม
      tour.status = newStatus
      showToast(newStatus === 'publish' ? '✅ เปิดออนไลน์สำเร็จ!' : '📝 ซ่อนเป็นฉบับร่างสำเร็จ!', 'success')
      cancelStatusChange() // ปิด Modal
    } else {
      throw new Error("Update Failed")
    }
  } catch (error) {
    console.error('Error updating status:', error)
    showToast('❌ เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนสถานะได้', 'error')
    cancelStatusChange()
    await fetchTours() 
  } finally {
    tour.isUpdating = false
    isStatusUpdating.value = false
  }
}


const openDeleteModal = (id) => {
  tourIdToDelete.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  tourIdToDelete.value = null
}

const executeDelete = async () => {
  if (!tourIdToDelete.value) return
  
  isDeleting.value = true
  const targetTour = tours.value.find(t => t.id === tourIdToDelete.value)
  if (targetTour) targetTour.isUpdating = true

  try {
    const res = await secureApi.delete(`/tours/${tourIdToDelete.value}`)
    if (res.data && res.data.success) {
      tours.value = tours.value.filter(t => t.id !== tourIdToDelete.value) 
      closeDeleteModal()
      showToast('🗑️ ลบโปรแกรมทัวร์สำเร็จ!', 'success') // <--- เพิ่มตรงนี้
    } else {
      throw new Error("Delete Failed")
    }
  } catch (error) {
    console.error(error)
    showToast('❌ เกิดข้อผิดพลาดในการลบข้อมูล', 'error') // <--- เปลี่ยนจาก alert เป็น Toast
    if (targetTour) targetTour.isUpdating = false
  } finally {
    isDeleting.value = false
  }
}

const secureApi = axios.create({
  baseURL: 'https://dev1.blupaperdev.com/wp-json/blupaper/v1', 
  timeout: 60000
})

const fetchMasterData = async () => {
  try {
    const [airRes, destRes] = await Promise.all([
      secureApi.get('/airlines'),
      secureApi.get('/taxonomy-terms/travel_locations')
    ])
    if (airRes.data) airlinesList.value = airRes.data
    if (destRes.data?.success) destinationsList.value = destRes.data.items
  } catch (error) {
    console.error('Error fetching master data:', error)
  }
}

const getAirlineName = (airlineKey) => {
  if (!airlineKey || airlineKey === '') return 'ไม่ระบุ';
  const keyStr = Array.isArray(airlineKey) ? airlineKey[0] : airlineKey;
  const found = airlinesList.value.find(a => String(a.airline_key).trim() === String(keyStr).trim());
  return found ? found.airline_name : keyStr;
}

const getDestinationNames = (idsArray) => {
  if (!idsArray || idsArray.length === 0) return 'ไม่ระบุ';
  const names = idsArray.map(id => {
    const found = destinationsList.value.find(d => d.id == id);
    return found ? found.name : '';
  }).filter(n => n !== '');
  return names.length > 0 ? names.join(', ') : 'ไม่ระบุ';
}

const fetchTours = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await secureApi.get('/tours') 
    if (response.data && response.data.success) {
      tours.value = (response.data.items || []).map(t => ({ ...t, isUpdating: false }))
    } else {
      tours.value = []
    }
  } catch (error) {
    console.error('Error fetching tours:', error)
    errorMessage.value = 'ไม่สามารถดึงข้อมูลทัวร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
  } finally {
    isLoading.value = false
  }
}

const filteredTours = computed(() => {
  let result = tours.value
  if (filterStatus.value !== 'all') result = result.filter(t => t.status === filterStatus.value)

  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(t => {
      const titleMatch = (t.title || '').toLowerCase().includes(q)
      const codeMatch = (t.trip_code || '').toLowerCase().includes(q)
      const destMatch = getDestinationNames(t.destination_ids).toLowerCase().includes(q)
      return titleMatch || codeMatch || destMatch
    })
  }
  return result
})

const updateTourStatus = async (id, newStatus) => {
  const targetTour = tours.value.find(t => t.id === id)
  if (targetTour) targetTour.isUpdating = true

  try {
    const res = await secureApi.post(`/update-tour-status/${id}`, { status: newStatus })
    if(res.data && res.data.success) {
      // ✅ ถ้าสำเร็จ ให้โชว์ Toast สีเขียว
      showToast(newStatus === 'publish' ? '✅ เปิดออนไลน์สำเร็จ!' : '📝 ซ่อนเป็นฉบับร่างสำเร็จ!', 'success')
    } else {
      throw new Error("Update Failed")
    }
  } catch (error) {
    console.error('Error updating status:', error)
    // ❌ ถ้าพัง ให้โชว์ Toast สีแดง
    showToast('❌ เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนสถานะได้', 'error')
    await fetchTours() // ดึงข้อมูลกลับคืน
  } finally {
    if (targetTour) targetTour.isUpdating = false
  }
}
onMounted(async () => {
  await fetchMasterData()
  await fetchTours()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.tour-overview-container {
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
  max-width: 1300px;
  margin: 0 auto;
}

/* ---------------------------------------------------
   HEADER SECTION
--------------------------------------------------- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 15px;
}
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); margin: 0; }
.page-subtitle { color: #64748b; margin: 5px 0 0 0; font-weight: 300;}


/* -----------------------------------
   🟢 TOAST NOTIFICATION STYLES
----------------------------------- */
.alert {
  position: fixed;
  top: 30px;
  right: 30px;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 500;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  font-family: var(--font-family, 'Kanit', sans-serif);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-left: 5px solid;
  font-size: 1rem;
}

.alert-success {
  background-color: #ffffff;
  color: #15803d;
  border-color: #e2e8f0;
  border-left-color: #16a34a;
}

.alert-danger {
  background-color: #ffffff;
  color: #dc2626;
  border-color: #e2e8f0;
  border-left-color: #dc2626;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) translateX(20px);
}

.status-modal-box {
  width: 90%;
  max-width: 400px;
  padding: 30px;
  background: white;
  
  /* 🟢 ส่วนที่เพิ่มเข้ามาเพื่อจัดกึ่งกลาง */
  text-align: center; 
  display: flex;
  flex-direction: column;
  align-items: center;

  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalPop 0.3s ease-out forwards;
}

/* ---------------------------------------------------
   FILTER BAR
--------------------------------------------------- */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid var(--color-border);
  gap: 20px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.search-box .form-control {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border-radius: 30px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-family: 'Kanit', sans-serif;
  transition: all 0.2s;
}
.search-box .form-control:focus {
  background: white;
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(204,0,0,0.1);
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-select {
  padding: 10px 35px 10px 15px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-family: 'Kanit', sans-serif;
  background-color: white;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #e2e8f0;
}
.btn-view {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-view.active {
  background: white;
  color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* ---------------------------------------------------
   STATES
--------------------------------------------------- */
.state-container {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.error-text { color: #dc2626; border-color: #fca5a5; background: #fef2f2; }

.tour-card-image {
  width: 100%;             /* บังคับความกว้างให้เต็มกรอบของการ์ด */
  aspect-ratio: 1 / 1;     /* บังคับสัดส่วนให้เป็นสี่เหลี่ยมจัตุรัส 1:1 เสมอ */
  object-fit: cover;       /* ตัดส่วนเกินทิ้งโดยไม่ให้รูปยืดหรือเบี้ยว */
  object-position: center; /* จัดตำแหน่งให้โชว์ตรงกลางของภาพ */
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* ---------------------------------------------------
   TOUR DISPLAY AREA (Grid & List Support)
--------------------------------------------------- */
.tour-display-area {
  display: grid;
  gap: 25px;
}

.tour-display-area.grid-mode {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.tour-display-area.list-mode {
  grid-template-columns: 1fr;
}
.tour-display-area.list-mode .tour-card {
  flex-direction: row;
  height: 160px;
}
.tour-display-area.list-mode .card-image {
  width: 160px; /* ปรับให้พอดีกับความสูง 160px ของการ์ด เพื่อให้เป็นสี่เหลี่ยมจัตุรัส */
  height: 100%;
}

.tour-display-area.list-mode .tour-card-image {
  height: 100%; /* บังคับให้รูปใน List Mode เต็มกรอบ 160x160 พอดี */
}

.tour-display-area.list-mode .card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid #f1f5f9;
}
.tour-display-area.list-mode .card-actions {
  flex-direction: column;
  justify-content: center;
  border-top: none;
  width: 180px;
  background: white;
}

/* ---------------------------------------------------
   TOUR CARDS
--------------------------------------------------- */
.tour-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.tour-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.06);
  border-color: #cbd5e1;
}

/* 1. ลบความสูง height: 210px; ทิ้งไป เพื่อให้กล่องยืดหยุ่นตามสัดส่วนภาพ */
.card-image { 
  position: relative; 
  background: #f1f5f9; 
  border-right: 1px solid #f1f5f9;
  overflow: hidden; /* เพิ่มตัวนี้เพื่อป้องกันภาพล้นออกนอกกรอบ */
}

/* 2. จัดการรูปภาพให้เป็น 1:1 แบบไม่บังข้อความ */
.tour-card-image { 
  width: 100%;            
  aspect-ratio: 1 / 1;    
  object-fit: cover;      
  object-position: center; 
  display: block; /* เพิ่มตัวนี้เพื่อลบช่องว่างสีขาวใต้รูปภาพ */
}

.card-image img {  width: 100%;             /* บังคับความกว้างให้เต็มกรอบของการ์ด */
  aspect-ratio: 1 / 1;     /* บังคับสัดส่วนให้เป็นสี่เหลี่ยมจัตุรัส 1:1 เสมอ */
  object-fit: cover;       /* ตัดส่วนเกินทิ้งโดยไม่ให้รูปยืดหรือเบี้ยว */
  object-position: center; /* จัดตำแหน่งให้โชว์ตรงกลางของภาพ */}

.badge-price {
  position: absolute; top: 15px; left: 15px;
  background: rgba(26, 26, 26, 0.85); color: white;
  padding: 6px 12px; border-radius: 8px;
  font-weight: 600; font-size: 1.0rem; text-align: left;
  line-height: 1.1; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1);
}
.badge-price small { font-size: 0.75rem; font-weight: 400; opacity: 0.8; }

.badge-status {
  position: absolute; top: 15px; left: 15px;
  padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
  backdrop-filter: blur(4px); text-transform: uppercase; letter-spacing: 0.5px;
}
.badge-status.publish { background: rgba(22, 163, 74, 0.9); color: white; border: 1px solid #4ade80;}
.badge-status.draft { background: rgba(245, 158, 11, 0.9); color: white; border: 1px solid #fcd34d;}

.card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.card-meta-top { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 12px; }
.trip-code { color: var(--color-primary); font-weight: 600; background: #fff5f5; padding: 2px 8px; border-radius: 4px;}
.trip-duration { color: #64748b; font-weight: 500; }

.tour-title {
  font-size: 1.1rem; font-weight: 600; color: var(--color-secondary);
  margin: 0 0 15px 0; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.tour-specs {
  display: flex; flex-wrap: wrap; gap: 10px; margin-top: auto;
}
.spec-item {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f8fafc; padding: 4px 10px; border-radius: 6px;
  font-size: 0.85rem; color: #475569; border: 1px solid #e2e8f0;
}
.full-spec { width: 100%; }
.category-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}

/* ---------------------------------------------------
   ACTIONS
--------------------------------------------------- */
.card-actions {
  padding: 15px 20px; border-top: 1px solid #f1f5f9; background: #fdfdfd;
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
}
.action-right { display: flex; gap: 8px; }

.status-dropdown {
  border: 1px solid #cbd5e1; border-radius: 20px; padding: 6px 12px;
  font-family: var(--font-family); font-size: 0.85rem; font-weight: 600;
  cursor: pointer; outline: none; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3 5 6 8 9 5'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px;
}
.status-publish { background-color: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.status-draft { background-color: #fffbeb; color: #d97706; border-color: #fde68a; }

.btn { font-family: 'Kanit', sans-serif; border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; }
.btn-primary { background: var(--color-primary); color: #fff; box-shadow: 0 4px 6px rgba(204,0,0,0.2); }
.btn-primary:hover { background: #a30000; transform: translateY(-1px); box-shadow: 0 6px 12px rgba(204,0,0,0.3); }

.btn-icon { background: white; border: 1px solid #cbd5e1; width: 36px; height: 36px; padding: 0; border-radius: 8px; }
.btn-edit:hover { background: #f0fdf4; border-color: #16a34a; color: #16a34a; }
.btn-delete:hover:not(:disabled) { background: #fef2f2; border-color: #dc2626; color: #dc2626;}
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed;}

/* -----------------------------------
   🟢 1. CUSTOM MODAL OVERLAY (เพิ่มเพื่อแก้ปัญหา Popup ไม่ขึ้น)
----------------------------------- */
.custom-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* -----------------------------------
   🟢 2. DELETE MODAL STYLES
----------------------------------- */
.delete-modal-box {
  width: 90%;
  max-width: 400px;
  padding: 30px;
  background: white;
  border-top: 5px solid #dc2626; 
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalPop 0.3s ease-out forwards;
}

@keyframes modalPop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.warning-icon-large {
  width: 80px;
  height: 80px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 0 0 8px rgba(220, 38, 38, 0.1);
  animation: shakeWarning 0.5s ease-in-out;
}

@keyframes shakeWarning {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-5deg); }
  75% { transform: translateX(5px) rotate(5deg); }
}

.modal-title {
  font-size: 1.4rem;
  color: var(--color-secondary);
  font-weight: 600;
  margin-bottom: 8px;
}

.modal-desc {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal-actions-center {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 25px;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: translateY(-1px);
}

/* ---------------------------------------------------
   🟢 3. RESPONSIVE SUPPORT (รองรับมือถือ & แท็บเล็ต)
--------------------------------------------------- */
@media (max-width: 992px) {
  /* แท็บเล็ต: ปรับช่องว่าง */
  .tour-overview-container { padding: 20px; }
  .tour-display-area.list-mode .tour-card { height: auto; align-items: center; }
}

@media (max-width: 768px) {
  /* มือถือแนวนอน & แท็บเล็ตแนวตั้ง: ซ้อน Filter Bar เป็นแนวตั้ง */
  .filter-bar { flex-direction: column; align-items: stretch; gap: 15px; }
  .search-box { max-width: 100%; }
  .filter-actions { justify-content: space-between; width: 100%; }
  
  /* บังคับ List Mode ให้การ์ดพับลงมาในจอเล็ก */
  .tour-display-area.list-mode .tour-card { flex-direction: column; height: auto; }
  .tour-display-area.list-mode .card-image { width: 100%; border-right: none; border-bottom: 1px solid #f1f5f9; height: 200px; }
  .tour-display-area.list-mode .card-actions { width: 100%; flex-direction: row; justify-content: space-between; border-top: 1px solid #f1f5f9; }
}

@media (max-width: 576px) {
  /* มือถือแนวตั้ง: เรียง Header ใหม่ */
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .page-header .btn { width: 100%; justify-content: center; }
  
  /* ตัวกรองซ้อนกันลงมา */
  .filter-actions { flex-direction: column; align-items: stretch; }
  .view-toggle { justify-content: center; }
  
  /* จัดการปุ่ม Modal ให้กดย้ายง่ายขึ้น */
  .modal-actions-center { flex-direction: column-reverse; }
  .modal-actions-center .btn { width: 100%; padding: 12px; }
}
</style>