<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">📍</span> จุดหมายปลายทาง (Destinations)</h1>
        <p class="page-subtitle">จัดการหมวดหมู่สถานที่ท่องเที่ยว (Travel Locations)</p>
      </div>
      <div class="header-actions">
        <button @click="fetchDestinations" class="btn btn-outline-secondary" :disabled="isLoading">
          🔄 โหลดข้อมูลใหม่
        </button>
        <button @click="toggleForm" class="btn btn-primary" :class="{ 'btn-cancel': showAddForm }">
          {{ showAddForm ? '❌ ปิดฟอร์ม' : '+ เพิ่มจุดหมายปลายทาง' }}
        </button>
      </div>
    </header>

    <transition name="slide-fade">
      <div v-if="showAddForm" class="add-form-card shadow-sm" :class="{ 'edit-mode-card': isEditMode }">
        <h3 class="form-title">
          {{ isEditMode ? '✏️ แก้ไขจุดหมายปลายทาง' : '✨ เพิ่มจุดหมายปลายทางใหม่' }}
        </h3>
        <form @submit.prevent="submitDestination" class="destination-form">
          <div class="form-grid">
            <div class="form-group">
              <label>ชื่อจุดหมายปลายทาง <span class="text-danger">*</span></label>
              <input type="text" v-model="formData.name" required placeholder="เช่น ญี่ปุ่น, โตเกียว" class="form-control" />
            </div>
            <div class="form-group">
              <label>ชื่อภาษาอังกฤษ (EN Name)</label>
              <input type="text" v-model="formData.category_en_name" placeholder="เช่น Japan, Tokyo" class="form-control" />
            </div>

            <div class="form-group full-width">
              <label>Slug (URL ภาษาอังกฤษ/ไม่มีเว้นวรรค)</label>
              <input type="text" v-model="formData.slug" placeholder="เช่น japan, tokyo (เว้นว่างไว้ระบบจะสร้างให้)" class="form-control" />
            </div>
            
            <div class="form-group full-width">
              <label>รายละเอียด (Description)</label>
              <textarea v-model="formData.description" rows="2" placeholder="อธิบายเกี่ยวกับสถานที่นี้สั้นๆ..." class="form-control"></textarea>
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
                    <img :src="previewImage" class="preview-full-img" alt="Cover Preview" @error="$event.target.src='https://dev1.blupaperdev.com/wp-content/uploads/2026/03/tour-panda-defalt.webp'" />
                    <div class="hover-overlay">
                      <span class="icon">📷</span> คลิกเพื่อเปลี่ยนรูปภาพ
                    </div>
                  </template>
                  <template v-else>
                    <div class="upload-placeholder">
                      <span class="upload-icon">🖼️</span>
                      <span class="upload-text">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่</span>
                      <span class="upload-subtext">รองรับ JPG, PNG, WEBP (สูงสุด 2MB)</span>
                    </div>
                  </template>
                </label>
              </div>
            </div>
          </div>

          <div class="seo-section mt-4">
            <h4 class="seo-title"><span class="icon">🔍</span> ตั้งค่า SEO (Rank Math)</h4>
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Focus Keyword</label>
                <input type="text" v-model="formData.rank_math_focus_keyword" placeholder="เช่น ทัวร์ญี่ปุ่น, เที่ยวญี่ปุ่น" class="form-control form-control-sm" />
              </div>
              <div class="form-group full-width">
                <label>SEO Title <span class="text-muted">(แนะนำไม่เกิน 60 ตัวอักษร)</span></label>
                <input type="text" v-model="formData.rank_math_title" placeholder="เว้นว่างไว้เพื่อใช้ค่าอัตโนมัติ" class="form-control form-control-sm" />
              </div>
              <div class="form-group full-width">
                <label>SEO Description <span class="text-muted">(แนะนำไม่เกิน 160 ตัวอักษร)</span></label>
                <textarea v-model="formData.rank_math_description" rows="2" placeholder="คำอธิบายที่จะโชว์บน Google..." class="form-control form-control-sm"></textarea>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="resetForm" class="btn btn-outline-secondary">ยกเลิก</button>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting">⏳ กำลังบันทึก...</span>
              <span v-else>{{ isEditMode ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มข้อมูล' }}</span>
            </button>
          </div>
        </form>
      </div>
    </transition>

    <div class="table-card shadow-sm mt-4">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">รูปปก</th>
              <th>ชื่อจุดหมายปลายทาง (Name)</th>
              <th width="150" class="text-center">SEO Status</th>
              <th width="120" class="text-center">จำนวนทัวร์</th>
              <th width="120" class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="text-center p-4 text-muted">⏳ กำลังโหลดข้อมูล...</td>
            </tr>
            <tr v-else-if="destinations.length === 0">
              <td colspan="5" class="text-center p-4 text-muted">📭 ยังไม่มีข้อมูลจุดหมายปลายทาง</td>
            </tr>
            <tr v-for="dest in destinations" :key="dest.id" v-else>
              <td class="text-center">
                <div class="thumbnail-wrapper">
                  <img v-if="dest.image_url" :src="dest.image_url" alt="cover" class="img-thumbnail" @error="$event.target.src='https://dev1.blupaperdev.com/wp-content/uploads/2026/03/tour-panda-defalt.webp'" />
                  <div v-else class="img-placeholder">ไม่มีรูป</div>
                </div>
              </td>
              <td>
                <div class="item-name">{{ dest.name }}</div>
                <div class="item-slug">/travel_locations/{{ dest.slug }}</div>
                <div class="item-en-name" v-if="dest.category_en_name">EN: {{ dest.category_en_name }}</div>
              </td>
              <td class="text-center">
                <span class="seo-badge" :class="dest.rank_math_focus_keyword ? 'good' : 'poor'" :title="dest.rank_math_focus_keyword ? 'มี Focus Keyword' : 'ยังไม่ตั้ง Focus Keyword'">
                  {{ dest.rank_math_focus_keyword ? '✅ ตั้งค่าแล้ว' : '⚠️ ยังไม่ตั้ง' }}
                </span>
              </td>
              <td class="text-center">
                <button class="btn-count" @click="viewTours(dest)" :class="{'empty': dest.count === 0}">
                  {{ dest.count }} รายการ
                </button>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button class="btn-icon btn-edit" @click="openEditForm(dest)" title="แก้ไข">✏️</button>
                  <button class="btn-icon btn-delete" @click="confirmDelete(dest.id, dest.name)" title="ลบ">🗑️</button>
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
            <h3>ทัวร์ในปลายทาง "{{ selectedDest?.name }}"</h3>
            <button @click="showToursModal = false" class="btn-close">✕</button>
          </div>
          <div class="modal-body p-0">
            <div v-if="isFetchingTours" class="text-center p-4">⏳ กำลังโหลดรายการทัวร์...</div>
            <ul class="tour-list" v-else-if="toursInDest.length > 0">
              <li v-for="tour in toursInDest" :key="tour.id" class="tour-list-item">
                <span class="tour-title">{{ tour.title }}</span>
                <span class="status-badge" :class="(tour.status === 'publish' ? 'publish' : 'draft')"></span>
              </li>
            </ul>
            <p v-else class="text-center p-4 text-muted">ไม่มีทัวร์ในจุดหมายปลายทางนี้</p>
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
            คุณกำลังจะลบจุดหมายปลายทาง <br><strong>"{{ itemToDelete?.name }}"</strong><br>
            <span class="text-muted text-sm">(ทัวร์ที่เชื่อมกับหมวดหมู่นี้จะไม่ถูกลบ แต่จะหลุดออกจากหมวดหมู่)</span>
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

const destinations = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const showAddForm = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const isSubmitting = ref(false)

const formData = ref({ 
  name: '', 
  slug: '', 
  description: '', 
  category_en_name: '', 
  rank_math_title: '', 
  rank_math_description: '', 
  rank_math_focus_keyword: '',
  imageFile: null, 
  image_id: '', 
  image_url: ''
})

const localImagePreview = ref(null)

const previewImage = computed(() => {
  if (localImagePreview.value) return localImagePreview.value
  if (formData.value.image_url) return formData.value.image_url
  return null
})

const showToursModal = ref(false)
const selectedDest = ref(null)
const toursInDest = ref([])
const isFetchingTours = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })
const showConfirmModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)

// 🟢 ใช้ API เส้นหลักของระบบ
const api = axios.create({
  baseURL: 'https://dev1.blupaperdev.com/wp-json/blupaper/v1',
  timeout: 60000
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchDestinations = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/taxonomy-terms/travel_locations')
    if (response.data && response.data.success) {
      destinations.value = response.data.items || []
    } else {
      destinations.value = []
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

const openEditForm = (destItem) => {
  isEditMode.value = true
  editId.value = destItem.id
  formData.value = { 
    name: destItem.name, 
    slug: destItem.slug,
    description: destItem.description || '',
    category_en_name: destItem.category_en_name || '',
    rank_math_title: destItem.rank_math_title || '',
    rank_math_description: destItem.rank_math_description || '',
    rank_math_focus_keyword: destItem.rank_math_focus_keyword || '',
    image_id: destItem.image_id || '',
    image_url: destItem.image_url || '',
    imageFile: null 
  }
  localImagePreview.value = null 
  showAddForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    formData.value.imageFile = file
    localImagePreview.value = URL.createObjectURL(file) 
  } else {
    formData.value.imageFile = null
    localImagePreview.value = null
  }
}

const submitDestination = async () => {
  if (!formData.value.name) return
  isSubmitting.value = true

  try {
    let finalImageId = formData.value.image_id;

    // ถ้ารูปมีการอัปโหลดใหม่
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

    let response
    if (isEditMode.value) {
      response = await api.post(`/taxonomy-terms/travel_locations/${editId.value}`, payload)
    } else {
      response = await api.post('/taxonomy-terms/travel_locations', payload)
    }

    if (response.data && response.data.success) {
      showToast(isEditMode.value ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!', 'success')
      await fetchDestinations()
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
    const response = await api.delete(`/taxonomy-terms/travel_locations/${itemToDelete.value.id}`)
    if (response.data && response.data.success) {
      showToast('ลบข้อมูลสำเร็จ!', 'success')
      fetchDestinations()
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

const viewTours = async (destItem) => {
  if (destItem.count === 0) return
  selectedDest.value = destItem
  showToursModal.value = true
  isFetchingTours.value = true
  toursInDest.value = []

  try {
    const response = await api.get(`/taxonomy-tours/travel_locations/${destItem.id}`)
    if (Array.isArray(response.data)) {
      toursInDest.value = response.data
    }
  } catch (error) {
    console.error("Fetch tours error:", error)
    showToast('ไม่สามารถดึงข้อมูลทัวร์ได้', 'error')
  } finally {
    isFetchingTours.value = false
  }
}

onMounted(() => {
  fetchDestinations()
})
</script>

<style scoped>
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
  min-height: 100vh;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 25px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px;
}
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); margin: 0; display: flex; align-items: center; gap: 10px;}
.page-subtitle { color: #64748b; margin: 5px 0 0 0; font-weight: 300;}
.header-actions { display: flex; gap: 10px; }

/* Buttons */
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

/* Form Card */
.add-form-card { background: white; border-radius: 12px; padding: 30px; border: 1px solid var(--color-border); border-top: 4px solid var(--color-primary); margin-bottom: 25px; }
.edit-mode-card { border-top-color: #3b82f6; }
.form-title { font-size: 1.2rem; font-weight: 600; color: var(--color-secondary); margin: 0 0 20px 0; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.full-width { grid-column: 1 / -1; }
.form-group label { font-weight: 500; font-size: 0.95rem; color: var(--color-secondary); }
.form-control { width: 100%; padding: 10px 15px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: 'Kanit', sans-serif; font-size: 0.95rem; transition: 0.2s; }
.form-control:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(204,0,0,0.1); }
.form-control-sm { padding: 8px 12px; font-size: 0.9rem; }
.text-danger { color: #dc2626; }
.text-muted { color: #64748b; font-weight: 300; }
.size-hint { font-size: 0.8rem; color: #64748b; font-weight: 300; margin-left: 8px; }

/* Image Upload */
.custom-upload-box { width: 100%; position: relative; border: 2px dashed #cbd5e1; border-radius: 12px; background: #f8fafc; transition: all 0.2s; overflow: hidden; min-height: 150px;}
.custom-upload-box:hover { border-color: var(--color-primary); background: #fff5f5; }
.hidden-input { position: absolute; width: 0; height: 0; opacity: 0; }
.upload-label-area { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 150px; cursor: pointer; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #64748b; pointer-events: none;}
.upload-icon { font-size: 2.5rem; opacity: 0.7; }
.upload-text { font-weight: 500; }
.upload-subtext { font-size: 0.8rem; }
.preview-full-img { width: 100%; height: 100%; max-height: 300px; object-fit: contain; display: block; }
.hover-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); color: white; display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: 0.2s; font-weight: 500; pointer-events: none;}
.custom-upload-box:hover .hover-overlay { opacity: 1; }

/* SEO Section */
.seo-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
.seo-title { font-size: 1rem; font-weight: 600; color: #2563eb; margin: 0 0 15px 0; display: flex; align-items: center; gap: 6px;}

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; }

/* Table */
.table-card { background: white; border-radius: 12px; border: 1px solid var(--color-border); overflow: hidden; }
.table-responsive { width: 100%; overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.modern-table th { background: #f8fafc; padding: 14px; text-align: left; color: #334155; font-weight: 600; border-bottom: 2px solid #cbd5e1; font-size: 0.95rem;}
.modern-table td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #475569; }
.modern-table tbody tr:hover td { background: #f8fafc; }

.thumbnail-wrapper { width: 60px; height: 40px; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; margin: 0 auto; background: #f1f5f9; display: flex; align-items: center; justify-content: center;}
.img-thumbnail { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { font-size: 0.7rem; color: #94a3b8; }

.item-name { font-weight: 600; color: var(--color-secondary); font-size: 1.05rem; }
.item-slug { font-size: 0.85rem; color: #64748b; }
.item-en-name { font-size: 0.8rem; color: #3b82f6; background: #eff6ff; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;}

.seo-badge { font-size: 0.8rem; padding: 4px 8px; border-radius: 20px; font-weight: 500; cursor: help; }
.seo-badge.good { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.seo-badge.poor { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

.btn-count { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: 0.2s; font-family: 'Kanit', sans-serif;}
.btn-count:hover { background: #dbeafe; }
.btn-count.empty { background: #f1f5f9; color: #64748b; border-color: #cbd5e1; cursor: default; }

.action-buttons { display: flex; gap: 8px; justify-content: center; }
.text-center { text-align: center; }

/* Modals & Overlays */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-content { background: white; border-radius: 12px; width: 90%; max-width: 500px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }

/* Tours Modal */
.tours-modal .modal-header { padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.tours-modal h3 { margin: 0; font-size: 1.1rem; color: var(--color-secondary); }
.btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; }
.tour-list { list-style: none; padding: 0; margin: 0; max-height: 300px; overflow-y: auto; }
.tour-list-item { padding: 12px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem; }
.status-badge { width: 10px; height: 10px; border-radius: 50%; }
.status-badge.publish { background: #16a34a; box-shadow: 0 0 0 3px #dcfce7; }
.status-badge.draft { background: #d97706; box-shadow: 0 0 0 3px #fef3c7; }

/* Confirm Delete Modal */
.confirm-modal { max-width: 400px; padding: 30px; text-align: center; border-top: 5px solid #dc2626; }
.confirm-icon-wrapper { width: 60px; height: 60px; background: #fef2f2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }
.confirm-icon { font-size: 1.8rem; }
.confirm-title { margin: 0 0 10px 0; font-size: 1.3rem; color: var(--color-secondary); }
.confirm-text { color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 25px; }
.text-sm { font-size: 0.85rem; }
.confirm-actions { display: flex; justify-content: center; gap: 10px; }

/* Toast */
.custom-toast { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px; background: white; display: flex; align-items: center; gap: 10px; z-index: 1000; font-weight: 500; border-left: 4px solid; }
.custom-toast.success { border-left-color: #16a34a; color: #166534; background: #f0fdf4;}
.custom-toast.error { border-left-color: #dc2626; color: #991b1b; background: #fef2f2;}
.toast-icon { font-size: 1.2rem; }

/* Transitions */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-20px); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(50px); }

/* Responsive Adjustments */
@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; gap: 15px; }
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
@media (max-width: 576px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .header-actions .btn { width: 100%; justify-content: center; padding: 10px; font-size: 0.9rem;}
  
  .confirm-actions { flex-direction: column-reverse; }
  .confirm-actions .btn { width: 100%; }
}
</style>