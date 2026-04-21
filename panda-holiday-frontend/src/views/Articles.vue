<template>
  <div class="tour-admin-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="icon">📝</span> จัดการบทความ (Articles)
        </h1>
        <p class="page-subtitle">เพิ่ม แก้ไข บทความ และจัดการหมวดหมู่พร้อม SEO</p>
      </div>
      <div class="header-actions">
        <button type="button" class="btn btn-outline-primary" @click="openCategoryModal">
          📁 จัดการหมวดหมู่
        </button>
        <button type="button" class="btn btn-success" @click="goToAddArticle">
          ➕ เพิ่มบทความใหม่
        </button>
      </div>
    </header>

    <div class="form-section shadow-sm">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">ID</th>
              <th width="120" class="text-center">รูปปก</th>
              <th>หัวข้อบทความ (Title)</th>
              <th width="150" class="text-center">หมวดหมู่</th>
              <th width="120" class="text-center">สถานะ</th>
              <th width="120" class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center py-4 empty-state-text">⏳ กำลังโหลดข้อมูล...</td>
            </tr>
            <tr v-else-if="articles.length === 0">
              <td colspan="6" class="text-center py-4 empty-state-text">ไม่มีบทความในระบบ</td>
            </tr>
            <tr v-for="article in articles" :key="article.id" v-else>
              <td class="text-center fw-500">{{ article.id }}</td>
              <td class="text-center">
                <img :src="article.featured_image_url || 'https://panda.co.th/wp-content/uploads/2025/10/logo-panda-holiday.webp'" class="img-thumbnail" alt="cover"/>
              </td>
              <td>
                <strong class="title-text">{{ article.title }}</strong>
                <div class="excerpt-text">{{ article.excerpt || '-' }}</div>
              </td>
              <td class="text-center">
                <span class="category-badge">{{ article.category_name || 'ทั่วไป' }}</span>
              </td>
              <td class="text-center">
                <span :class="['status-badge', article.status === 'publish' ? 'status-publish' : 'status-draft']">
                  {{ article.status === 'publish' ? 'ออนไลน์' : 'ฉบับร่าง' }}
                </span>
              </td>
              <td class="text-center action-buttons">
                <button class="btn-icon btn-edit" @click="goToEditArticle(article.id)" title="แก้ไข">✏️</button>
                <button class="btn-icon btn-delete" @click="confirmDelete(article.id)" title="ลบ">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showCategoryModal" class="custom-modal-overlay" @click.self="closeCategoryModal">
        <div class="custom-modal-box modal-xl">
          
          <div class="modal-header-premium">
            <h3>📁 จัดการหมวดหมู่บทความ & SEO</h3>
            <button type="button" class="btn-close-white" @click="closeCategoryModal">✕</button>
          </div>

          <div class="modal-body-premium category-manager-grid">
            
            <div class="category-form-card">
              <h4 class="card-subtitle">{{ isEditingCat ? '✏️ แก้ไขหมวดหมู่' : '➕ เพิ่มหมวดหมู่ใหม่' }}</h4>
              
              <div class="form-group mb-3">
                <label>ชื่อหมวดหมู่ (TH) <span class="required">*</span></label>
                <input type="text" v-model="catForm.name" class="form-control" placeholder="เช่น รีวิวท่องเที่ยว">
              </div>

              <div class="form-group mb-3">
                <label>Slug (URL ภาษาอังกฤษ)</label>
                <input type="text" v-model="catForm.slug" class="form-control" placeholder="เช่น travel-review">
              </div>

              <div class="seo-section-box mt-4">
                <h5 class="seo-title">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" class="mr-1">
                    <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                  </svg>
                  ตั้งค่า SEO (Rank Math)
                </h5>
                <div class="form-group mb-3">
                  <label>Focus Keyword</label>
                  <input type="text" v-model="catForm.rank_math_focus_keyword" class="form-control form-control-sm" placeholder="คีย์เวิร์ดหลัก">
                </div>
                <div class="form-group mb-3">
                  <label>SEO Title</label>
                  <input type="text" v-model="catForm.rank_math_title" class="form-control form-control-sm" placeholder="หัวข้อสำหรับ Google">
                </div>
                <div class="form-group">
                  <label>SEO Description</label>
                  <textarea v-model="catForm.rank_math_description" class="form-control form-control-sm" rows="3" placeholder="คำอธิบายสั้นๆ ดึงดูดคนคลิก"></textarea>
                </div>
              </div>

              <div class="modal-footer-actions mt-4">
                <button v-if="isEditingCat" type="button" class="btn btn-outline-secondary" @click="resetCatForm">ยกเลิก</button>
                <button type="button" class="btn btn-success full-width" @click="saveCategory" :disabled="isSavingCat">
                  {{ isSavingCat ? '⏳ กำลังบันทึก...' : (isEditingCat ? '✅ อัปเดตข้อมูล' : '➕ บันทึกหมวดหมู่') }}
                </button>
              </div>
            </div>

            <div class="category-list-card">
              <h4 class="card-subtitle">📋 รายการหมวดหมู่ทั้งหมด</h4>
              <div class="table-mini-wrapper">
                <table class="modern-table mini-table">
                  <thead>
                    <tr>
                      <th>ชื่อหมวดหมู่ / Slug</th>
                      <th width="100" class="text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cat in categories" :key="cat.id">
                      <td>
                        <strong class="cat-name-text">{{ cat.name }}</strong>
                        <div class="cat-slug-text">URL: /{{ cat.slug }}</div>
                      </td>
                      <td class="text-center action-buttons">
                        <button class="btn-icon btn-edit-sm" @click="editCategory(cat)" title="แก้ไข">✏️</button>
                        <button class="btn-icon btn-delete-sm" @click="deleteCategory(cat.id)" title="ลบ">🗑️</button>
                      </td>
                    </tr>
                    <tr v-if="categories.length === 0">
                      <td colspan="2" class="text-center py-4 empty-state-text">ยังไม่มีหมวดหมู่</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 🟢 เปลี่ยนเป็น URL เว็บ WordPress ของคุณ
// ✅ เปลี่ยนมาใช้ Proxy ผ่านไฟล์ api.php
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api.php?route=`,
  timeout: 60000
})
const router = useRouter()
const articles = ref([])
const categories = ref([])
const isLoading = ref(false)

// Category States
const showCategoryModal = ref(false)
const isSavingCat = ref(false)
const isEditingCat = ref(false)
const catForm = ref({
  id: null,
  name: '',
  slug: '',
  rank_math_title: '',
  rank_math_description: '',
  rank_math_focus_keyword: ''
})

onMounted(() => {
  fetchArticles()
  fetchCategories()
})

const fetchArticles = async () => {
  isLoading.value = true
  try {
    const response = await secureApi.get('/articles')
    if (response.data.success) articles.value = response.data.items || []
  } catch (error) { console.error(error) }
  finally { isLoading.value = false }
}

const fetchCategories = async () => {
  try {
    const response = await secureApi.get('/taxonomy-terms/category')
    if (response.data.success) categories.value = response.data.items || []
  } catch (error) { console.error(error) }
}

const openCategoryModal = () => { showCategoryModal.value = true }
const closeCategoryModal = () => { 
  showCategoryModal.value = false 
  resetCatForm()
}

const resetCatForm = () => {
  isEditingCat.value = false
  catForm.value = { id: null, name: '', slug: '', rank_math_title: '', rank_math_description: '', rank_math_focus_keyword: '' }
}

const editCategory = (cat) => {
  isEditingCat.value = true
  catForm.value = { ...cat }
}

const saveCategory = async () => {
  if (!catForm.value.name) return alert('กรุณาระบุชื่อหมวดหมู่')
  isSavingCat.value = true
  try {
    let response;
    if (isEditingCat.value) {
      response = await secureApi.post(`/taxonomy-terms/category/${catForm.value.id}`, catForm.value)
    } else {
      response = await secureApi.post('/taxonomy-terms/category', catForm.value)
    }
    if (response.data.success) {
      fetchCategories()
      resetCatForm()
    }
  } catch (error) { alert('ไม่สามารถบันทึกข้อมูลได้') }
  finally { isSavingCat.value = false }
}

const deleteCategory = async (id) => {
  if (!confirm('ยืนยันการลบหมวดหมู่?')) return
  try {
    await secureApi.delete(`/taxonomy-terms/category/${id}`)
    fetchCategories()
  } catch (error) { alert('ลบไม่สำเร็จ') }
}

const goToAddArticle = () => router.push('/add-article')
const goToEditArticle = (id) => router.push(`/edit-article/${id}`)

const confirmDelete = async (id) => {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?')) {
    try {
      const response = await secureApi.delete(`/articles/${id}`)
      if (response.data.success) {
        articles.value = articles.value.filter(a => a.id !== id)
      }
    } catch (error) { alert('ลบข้อมูลไม่สำเร็จ') }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

/* -----------------------------------
   🟢 1. GLOBAL & CONTAINER
----------------------------------- */
* { box-sizing: border-box; }

.tour-admin-container {
  --color-primary: #cc0000;
  --color-secondary: #1a1a1a;
  --color-success: #16a34a;
  --color-white: #ffffff;
  --color-bg: #f8fafc;
  --color-border: #e2e8f0;
  --color-text: #1e293b;
  font-family: 'Kanit', sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* -----------------------------------
   🟢 2. HEADERS
----------------------------------- */
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 30px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px;
}
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); margin: 0; }
.page-subtitle { color: #64748b; margin: 8px 0 0; font-weight: 300; }
.header-actions { display: flex; gap: 12px; }

/* -----------------------------------
   🟢 3. TABLE SECTIONS
----------------------------------- */
.form-section {
  background: var(--color-white); border-radius: 12px; padding: 25px; 
  border: 1px solid var(--color-border); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}
.modern-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.95rem; }
.modern-table th { 
  background: #f8fafc; padding: 14px; text-align: left; color: #334155; 
  font-weight: 600; border-bottom: 2px solid #cbd5e1; 
}
.modern-table td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.modern-table tbody tr:hover td { background: #f8fafc; }

.text-center { text-align: center !important; }
.fw-500 { font-weight: 500; }
.empty-state-text { color: #94a3b8; font-weight: 300; }

.img-thumbnail { width: 100px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.title-text { font-size: 1.05rem; color: var(--color-secondary); }
.excerpt-text { font-size: 0.85rem; color: #64748b; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Badges */
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.status-publish { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.status-draft { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.category-badge { background: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; border: 1px solid #bfdbfe; }

/* Buttons */
.btn {
  padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; 
  font-family: 'Kanit', sans-serif; border: 1px solid transparent; transition: all 0.2s;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-success { background: var(--color-success); color: white; }
.btn-success:hover:not(:disabled) { background: #15803d; }
.btn-outline-primary { border-color: #2563eb; color: #2563eb; background: white; }
.btn-outline-primary:hover { background: #eff6ff; }
.btn-outline-secondary { border-color: #cbd5e1; color: #475569; background: white; }
.btn-outline-secondary:hover { background: #f8fafc; color: var(--color-secondary); border-color: #94a3b8; }
.full-width { width: 100%; flex: 1; }

.action-buttons { display: flex; gap: 8px; justify-content: center; }
.btn-icon { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; cursor: pointer; transition: all 0.2s; }
.btn-edit:hover { background: #eff6ff; border-color: #3b82f6; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; }


/* ===================================================================
   💎 PREMIUM MODAL (เหมือนหน้า Preview ของ TourList)
=================================================================== */
.custom-modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999;
}

.custom-modal-box {
  background: white; border-radius: 16px; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.modal-xl { max-width: 1000px !important; width: 95% !important; }

.modal-header-premium {
  background: var(--color-secondary, #1a1a1a); color: white;
  padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 4px solid var(--color-primary, #cc0000); 
}
.modal-header-premium h3 { margin: 0; font-size: 1.25rem; font-weight: 500; color: #f8fafc; }

.btn-close-white {
  background: rgba(255, 255, 255, 0.1); border: none; color: white;
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s ease;
}
.btn-close-white:hover { background: var(--color-primary); transform: rotate(90deg); }

.modal-body-premium { padding: 0; background: #f8fafc; max-height: 75vh; overflow-y: auto; }

/* Grid ภายใน Popup */
.category-manager-grid { display: grid; grid-template-columns: 400px 1fr; gap: 0; }

.category-form-card { padding: 30px; background: white; border-right: 1px solid #e2e8f0; }
.category-list-card { padding: 30px; background: #f8fafc; }

.card-subtitle {
  color: var(--color-secondary); font-weight: 600; font-size: 1.1rem;
  border-left: 4px solid var(--color-primary); padding-left: 12px;
  margin-top: 0; margin-bottom: 20px; display: flex; align-items: center;
}

/* Form ภายใน Popup */
.form-group label { display: block; font-weight: 500; margin-bottom: 6px; color: var(--color-secondary); font-size: 0.95rem; }
.required { color: var(--color-primary); }
.form-control {
  width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px;
  font-family: 'Kanit', sans-serif; font-size: 0.95rem; transition: 0.2s;
}
.form-control:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(204,0,0,0.1); }
.form-control-sm { padding: 8px 12px; font-size: 0.9rem; }
.mb-3 { margin-bottom: 15px; }
.mt-4 { margin-top: 25px; }
.mr-1 { margin-right: 5px; }

/* SEO Box */
.seo-section-box { background: #fff5f5; padding: 18px; border-radius: 12px; border: 1px solid #fecaca; border-left: 4px solid var(--color-primary); }
.seo-title { font-size: 0.95rem; font-weight: 600; color: var(--color-primary); margin: 0 0 15px 0; display: flex; align-items: center; }

.modal-footer-actions { display: flex; gap: 10px; }

/* Mini Table */
.table-mini-wrapper { max-height: 450px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: white; }
.mini-table th { padding: 12px !important; font-size: 0.9rem; background: #f1f5f9; position: sticky; top: 0; z-index: 10;}
.mini-table td { padding: 12px !important; font-size: 0.95rem; }
.cat-name-text { color: var(--color-secondary); font-weight: 500; }
.cat-slug-text { font-size: 0.8rem; color: #64748b; margin-top: 2px; }

.btn-edit-sm, .btn-delete-sm { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; font-size: 0.85rem; cursor: pointer; }
.btn-edit-sm:hover { background: #eff6ff; border-color: #3b82f6; }
.btn-delete-sm:hover { background: #fef2f2; border-color: #ef4444; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* Responsive */
@media (max-width: 992px) {
  .category-manager-grid { grid-template-columns: 1fr; }
  .category-form-card { border-right: none; border-bottom: 1px solid #e2e8f0; }
}
@media (max-width: 767px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; }
  .header-actions .btn { flex: 1; }
}
</style>