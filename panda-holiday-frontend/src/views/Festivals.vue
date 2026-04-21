<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">🏮</span> เทศกาล (Festivals)</h1>
        <p class="page-subtitle">จัดการหมวดหมู่เทศกาลและฤดูกาลท่องเที่ยว พร้อมตั้งค่า SEO</p>
      </div>
      <div class="header-actions">
        <button @click="fetchFestivals" class="btn btn-outline-secondary" :disabled="isLoading">
          🔄 โหลดข้อมูลใหม่
        </button>
        <button @click="toggleForm" class="btn btn-primary" :class="{ 'btn-cancel': showAddForm }">
          {{ showAddForm ? '❌ ปิดฟอร์ม' : '+ เพิ่มเทศกาลใหม่' }}
        </button>
      </div>
    </header>

    <transition name="slide-fade">
      <div v-if="showAddForm" class="add-form-card shadow-sm" :class="{ 'edit-mode-card': isEditMode }">
        <h3 class="form-title">
          {{ isEditMode ? '✏️ แก้ไขข้อมูลเทศกาล' : '✨ เพิ่มเทศกาลใหม่' }}
        </h3>
        <form @submit.prevent="submitFestival" class="destination-form">
          <div class="form-grid">
            <div class="form-group">
              <label>ชื่อเทศกาล <span class="text-danger">*</span></label>
              <input type="text" v-model="formData.name" required placeholder="เช่น เทศกาลสงกรานต์, ใบไม้เปลี่ยนสี" class="form-control" />
            </div>
            <div class="form-group">
              <label>ชื่อภาษาอังกฤษ (EN Name)</label>
              <input type="text" v-model="formData.category_en_name" placeholder="เช่น Songkran Festival" class="form-control" />
            </div>

            <div class="form-group full-width">
              <label>Slug (URL ภาษาอังกฤษ/ไม่มีเว้นวรรค)</label>
              <input type="text" v-model="formData.slug" placeholder="เช่น songkran-festival (เว้นว่างไว้ระบบจะสร้างให้)" class="form-control" />
            </div>

            <div class="form-group full-width">
              <label>รายละเอียด (Description)</label>
              <textarea v-model="formData.description" rows="2" placeholder="อธิบายรายละเอียดเพิ่มเติมของเทศกาลนี้..." class="form-control"></textarea>
            </div>
          
            <div class="form-group full-width">
              <label>
                รูปภาพปก (Cover Image)
                <span class="size-hint">💡 แนะนำ: 1200 x 628 px</span>
              </label>
              
              <div class="custom-upload-box" :class="{'has-preview': previewImage}">
                <input type="file" id="cover-upload" accept="image/*" @change="onImageChange" class="hidden-input" />
                <label for="cover-upload" class="upload-label-area">
                  <template v-if="previewImage">
                    <img :src="previewImage" class="preview-full-img" alt="Cover Preview" />
                    <div class="hover-overlay">
                      <span class="icon">📷</span> คลิกเพื่อเปลี่ยนรูปภาพ
                    </div>
                  </template>
                  <template v-else>
                    <div class="upload-placeholder">
                      <span class="upload-icon">🖼️</span>
                      <span class="upload-text">คลิกเพื่ออัปโหลดรูปภาพเทศกาล</span>
                    </div>
                  </template>
                </label>
              </div>
            </div>
          </div>

          <div class="seo-section mt-4">
              <h4 class="seo-heading"><span class="icon">🚀</span> ตั้งค่า SEO (Rank Math)</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Focus Keyword </label>
                  <input type="text" v-model="formData.rank_math_focus_keyword" placeholder="เช่น ทัวร์สงกรานต์, เที่ยวญี่ปุ่นช่วงใบไม้เปลี่ยนสี" class="form-control" />
                </div>
                <div class="form-group">
                  <label>SEO Title</label>
                  <input type="text" v-model="formData.rank_math_title" placeholder="เว้นว่างไว้เพื่อใช้ค่าเริ่มต้น" class="form-control" />
                </div>
                <div class="form-group full-width">
                  <label>SEO Description</label>
                  <textarea v-model="formData.rank_math_description" rows="2" placeholder="คำอธิบายที่จะแสดงบนหน้า Google..." class="form-control"></textarea>
                </div>
              </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="resetForm" class="btn btn-outline-secondary">ยกเลิก</button>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting">⏳ กำลังบันทึก...</span>
              <span v-else>{{ isEditMode ? '✅ อัปเดตข้อมูล' : '➕ เพิ่มข้อมูล' }}</span>
            </button>
          </div>
        </form>
      </div>
    </transition>

    <div class="table-card shadow-sm">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">ลำดับ</th>
              <th width="100" class="text-center">รูปภาพ</th> 
              <th width="20%">ชื่อเทศกาล (Name)</th>
              <th width="30%">รายละเอียด (Description)</th>
              <th width="120" class="text-center">จำนวนทัวร์</th>
              <th width="100" class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center p-5 text-muted">⏳ กำลังโหลดข้อมูล...</td>
            </tr>
            <tr v-else-if="festivals.length === 0">
              <td colspan="6" class="text-center p-5 text-muted">📭 ยังไม่มีข้อมูลเทศกาล</td>
            </tr>
            <tr v-for="(festItem, index) in festivals" :key="festItem.id" :class="{ 'highlight-row': isEditMode && editId === festItem.id }">
              <td class="text-center font-bold">{{ index + 1 }}</td>
              
              <td class="text-center">
                <div class="table-image-wrapper">
                  <img v-if="festItem.image_url" :src="festItem.image_url" class="table-img" />
                  <span v-else class="no-img">🖼️</span>
                </div>
              </td>

              <td>
                <div class="dest-name">{{ festItem.name }}</div>
                <small class="text-muted" v-if="festItem.category_en_name">{{ festItem.category_en_name }}</small>
                <div class="seo-status mt-1">
                   <span v-if="festItem.rank_math_focus_keyword" class="seo-tag success">SEO OK</span>
                   <span v-else class="seo-tag warning">SEO Missing</span>
                </div>
              </td>
              <td class="description-cell">{{ festItem.description || '-' }}</td>
              <td class="text-center">
                <button @click="viewTours(festItem)" class="badge-count-btn" :disabled="festItem.count === 0">
                  {{ festItem.count }} ทัวร์
                </button>
              </td>
              <td class="text-center">
                <div class="action-flex">
                  <button @click="openEditForm(festItem)" class="btn-icon btn-edit" title="แก้ไข">✏️</button>
                  <button @click="confirmDelete(festItem.id, festItem.name)" class="btn-icon btn-delete" title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showToursModal" class="modal-overlay" @click.self="showToursModal = false">
        <div class="modal-content tours-modal shadow-lg">
          <div class="modal-header">
            <h3>รายการทัวร์ใน "{{ selectedFestival?.name }}"</h3>
            <button @click="showToursModal = false" class="btn-close">✕</button>
          </div>
          <div class="modal-body p-0">
            <div v-if="isFetchingTours" class="text-center p-4">⏳ กำลังโหลดรายการทัวร์...</div>
            <ul class="tour-list" v-else-if="toursInFestival.length > 0">
              <li v-for="tour in toursInFestival" :key="tour.id" class="tour-list-item">
                <span class="tour-title">{{ tour.title }}</span>
                <span class="status-badge" :class="tour.status === 'publish' ? 'publish' : 'draft'"></span>
              </li>
            </ul>
            <p v-else class="text-center p-4 text-muted">ยังไม่มีทัวร์ที่เชื่อมกับเทศกาลนี้</p>
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
          <p class="confirm-text">คุณกำลังจะลบเทศกาล <strong>"{{ itemToDelete?.name }}"</strong><br><span class="text-muted text-sm">(การกระทำนี้ไม่สามารถย้อนกลับได้)</span></p>
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

const festivals = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const showAddForm = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const isSubmitting = ref(false)

const formData = ref({ 
  name: '', slug: '', description: '', category_en_name: '', 
  rank_math_title: '', rank_math_description: '', rank_math_focus_keyword: '',
  imageFile: null, image_id: '', image_url: ''
})

const localImagePreview = ref(null)
const previewImage = computed(() => localImagePreview.value || formData.value.image_url || null)

const showToursModal = ref(false)
const selectedFestival = ref(null)
const toursInFestival = ref([])
const isFetchingTours = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })
const showConfirmModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)

// ใช้ API Endpoint สำหรับ WP
const secureApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api.php?route=`, // ✅ เปลี่ยนเป็น PHP Proxy
  timeout: 120000
})
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchFestivals = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/taxonomy-terms/festival')
    if (response.data && response.data.success) {
      festivals.value = response.data.items || []
    }
  } catch (error) {
    showToast('ไม่สามารถดึงข้อมูลได้', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleForm = () => {
  if (showAddForm.value) resetForm()
  else showAddForm.value = true
}

const resetForm = () => {
  formData.value = { 
    name: '', slug: '', description: '', category_en_name: '',
    rank_math_title: '', rank_math_description: '', rank_math_focus_keyword: '',
    imageFile: null, image_id: '', image_url: ''
  }
  localImagePreview.value = null
  isEditMode.value = false
  editId.value = null
  showAddForm.value = false
}

const openEditForm = (festItem) => {
  isEditMode.value = true
  editId.value = festItem.id
  formData.value = { ...festItem, imageFile: null }
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

const submitFestival = async () => {
  if (!formData.value.name) return
  isSubmitting.value = true

  try {
    let finalImageId = formData.value.image_id;

    if (formData.value.imageFile) {
      const uploadData = new FormData();
      uploadData.append('featuredImage', formData.value.imageFile);
      const uploadRes = await api.post('/upload-tour-assets', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (uploadRes.data && uploadRes.data.featuredImage) {
        finalImageId = uploadRes.data.featuredImage.attachment_id;
      }
    }

    const payload = {
      name: formData.value.name,
      slug: formData.value.slug.toLowerCase().replace(/\s+/g, '-'),
      description: formData.value.description,
      category_en_name: formData.value.category_en_name, 
      rank_math_title: formData.value.rank_math_title,
      rank_math_description: formData.value.rank_math_description,
      rank_math_focus_keyword: formData.value.rank_math_focus_keyword,
      category_thumbnail: finalImageId 
    }

    const endpoint = isEditMode.value ? `/taxonomy-terms/festival/${editId.value}` : '/taxonomy-terms/festival'
    const response = await api.post(endpoint, payload)

    if (response.data && response.data.success) {
      showToast(isEditMode.value ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!')
      await fetchFestivals()
      resetForm()
    }
  } catch (error) {
    showToast('เกิดข้อผิดพลาดในการบันทึก', 'error')
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
    const response = await api.delete(`/taxonomy-terms/festival/${itemToDelete.value.id}`)
    if (response.data && response.data.success) {
      showToast('ลบข้อมูลสำเร็จ!')
      fetchFestivals()
    }
  } catch (error) {
    showToast('ไม่สามารถลบข้อมูลได้', 'error')
  } finally {
    isDeleting.value = false
    showConfirmModal.value = false
  }
}

const viewTours = async (festItem) => {
  selectedFestival.value = festItem
  showToursModal.value = true
  isFetchingTours.value = true
  try {
    const response = await api.get(`/taxonomy-tours/festival/${festItem.id}`)
    if (Array.isArray(response.data)) toursInFestival.value = response.data
  } catch (error) {
    showToast('ดึงข้อมูลทัวร์ไม่สำเร็จ', 'error')
  } finally {
    isFetchingTours.value = false
  }
}

onMounted(() => {
  fetchFestivals()
})
</script>

<style scoped>
/* CSS ยกมาจากหน้า Months.vue เพื่อให้ดีไซน์เหมือนกัน 100% */
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

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
.header-actions { display: flex; gap: 10px; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); margin: 0; }

.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s; border: none; font-family: 'Kanit'; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-success { background: var(--color-success); color: white; }
.btn-danger { background: #dc2626; color: white; }
.btn-outline-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; }

.add-form-card { background: white; border-radius: 12px; padding: 25px; border: 1px solid var(--color-border); border-top: 4px solid var(--color-primary); margin-bottom: 30px; }
.edit-mode-card { border-top-color: #3b82f6; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-control { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: 'Kanit'; }

.custom-upload-box { border: 2px dashed #cbd5e1; border-radius: 12px; height: 180px; position: relative; cursor: pointer; overflow: hidden; }
.upload-label-area { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
.preview-full-img { width: 100%; height: 100%; object-fit: cover; }
.hidden-input { display: none; }

.seo-section { background: #f1f5f9; padding: 20px; border-radius: 12px; }
.seo-heading { margin-bottom: 15px; color: #2563eb; }

.modern-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.modern-table th { background: #f8fafc; padding: 14px; text-align: left; color: #334155; font-weight: 600; border-bottom: 2px solid #cbd5e1; font-size: 0.95rem;}
.modern-table td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #475569; }
.modern-table tbody tr:hover td { background: #f8fafc; }

.table-image-wrapper { width: 80px; height: 50px; border-radius: 6px; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center; }
.table-img { width: 100%; height: 100%; object-fit: cover; }

.badge-count-btn { background-color: #f0fdf4; color: #16a34a; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; border: 1px solid #bbf7d0; cursor: pointer; transition: 0.2s; }
.badge-count-btn:hover:not(:disabled) { background-color: #dcfce7; transform: scale(1.05); }
.badge-count-btn:disabled { opacity: 0.5; cursor: default; }
.seo-tag { font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.seo-tag.success { background: #dcfce7; color: #166534; }
.seo-tag.warning { background: #fef3c7; color: #92400e; }

.action-flex { display: flex; gap: 8px; }
.btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; }
.btn-edit:hover { background: #eff6ff; border-color: #3b82f6; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; }

/* Toast */
.custom-toast { position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 10px; background: white; display: flex; align-items: center; gap: 10px; z-index: 1000; border-left: 5px solid; }
.custom-toast.success { border-left-color: #16a34a; }
.custom-toast.error { border-left-color: #dc2626; }

/* Modal Styles */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
.modal-content { background: white; border-radius: 15px; width: 90%; max-width: 500px; overflow: hidden; }
.modal-header { padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }

.tour-list { list-style: none; padding: 0; }
.tour-list-item { padding: 12px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.status-badge { width: 10px; height: 10px; border-radius: 50%; }
.status-badge.publish { background: #16a34a; }
.status-badge.draft { background: #d97706; }

.confirm-modal { padding: 30px; text-align: center; }
.confirm-icon-wrapper { width: 60px; height: 60px; background: #fef2f2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 30px; }
.confirm-actions { display: flex; justify-content: center; gap: 12px; margin-top: 25px; }

/* Transitions */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-20px); opacity: 0; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.4s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(100%); opacity: 0; }
</style>