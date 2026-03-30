<template>
  <div class="tour-admin-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="icon">{{ isEditMode ? '✏️' : '✨' }}</span> 
          {{ isEditMode ? 'แก้ไขบทความ' : 'เขียนบทความใหม่' }}
        </h1>
        <p class="page-subtitle">จัดการเนื้อหา รูปภาพ และตั้งค่า SEO สำหรับบทความ</p>
      </div>
      <div class="header-actions" style="display: flex; gap: 10px; align-items: center;">
        
        <input type="file" ref="csvFileInput" accept=".csv" style="display: none;" @change="handleCsvImport" />
        
        <button v-if="!isEditMode" type="button" class="btn btn-outline-success" @click="triggerCsvUpload" :disabled="isSaving || isImportingData">
          <span v-if="isImportingData">⏳ กำลังอ่านไฟล์...</span>
          <span v-else>📥 นำเข้าบทความ (CSV)</span>
        </button>

        <button type="button" class="btn btn-outline-secondary" @click="goBack">⬅️ ย้อนกลับ</button>
      </div>
    </header>

    <form @submit.prevent="saveArticle" class="modern-form">
      
      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">1</span> ข้อมูลพื้นฐาน (Basic Info)</h2>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>หัวข้อบทความ (Title) <span class="required">*</span></label>
            <input type="text" v-model="formData.title" class="form-control form-control-lg" required placeholder="พิมพ์หัวข้อบทความที่น่าสนใจที่นี่..." />
          </div>

          <div class="form-group full-width">
            <label>อ้างอิงไฟล์ต้นฉบับ (Source URL / ชื่อไฟล์) <span class="text-muted" style="font-weight: normal;">*ใช้อ้างอิงตอนก๊อปปี้เนื้อหา</span></label>
            <div style="display: flex; gap: 10px;">
              <input type="text" v-model="formData.source_doc_url" class="form-control" placeholder="เช่น ลิงก์จาก Google Docs หรือชื่อโฟลเดอร์..." />
              
              <a v-if="formData.source_doc_url && formData.source_doc_url.startsWith('http')" 
                 :href="formData.source_doc_url" target="_blank" class="btn btn-outline-primary" style="white-space: nowrap; text-decoration: none; display: flex; align-items: center;">
                🔗 เปิดไฟล์ต้นฉบับ
              </a>
            </div>
          </div>

          <div class="form-group">
            <label>หมวดหมู่ (Category)</label>
            <select v-model="formData.category_id" class="form-control form-select">
              <option value="">-- เลือกหมวดหมู่ --</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>สถานะ (Status)</label>
            <select v-model="formData.status" class="form-control form-select status-select" :class="formData.status">
              <option value="publish">✅ เผยแพร่ (Publish)</option>
              <option value="draft">📝 ฉบับร่าง (Draft)</option>
            </select>
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">2</span> เนื้อหาบทความ (Content)</h2>
        
        <div class="form-group mb-4">
          <label>คำโปรยสั้นๆ (Excerpt) - จะไปโชว์ที่การ์ดหน้าแรกและแชร์โซเชียล</label>
          <textarea v-model="formData.excerpt" class="form-control" rows="2" placeholder="สรุปเนื้อหาสั้นๆ เพื่อดึงดูดให้อ่านต่อ..."></textarea>
        </div>

        <div class="form-group">
          <label style="display: flex; justify-content: space-between; align-items: center;">
            <span>เนื้อหาแบบจัดเต็ม (Rich Text Content)</span>
            
            <button 
              v-if="formData.source_doc_url && formData.source_doc_url.includes('docs.google.com')" 
              type="button" 
              class="btn btn-outline-primary btn-sm" 
              @click="pullContentFromDoc" 
              :disabled="isPullingContent"
            >
              <span v-if="isPullingContent">⏳ กำลังดาวน์โหลดรูปภาพและเนื้อหา...</span>
              <span v-else>⬇️ ดูดเนื้อหา+รูปภาพ จากไฟล์อ้างอิงอัตโนมัติ</span>
            </button>

          </label>
          
          <div class="quill-wrapper content-quill">
            <QuillEditor 
              v-model:content="formData.content" 
              contentType="html" 
              :options="editorOptions" 
              theme="snow"
              placeholder="เริ่มต้นเขียนเรื่องราวของคุณที่นี่..."
            />
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">3</span> รูปภาพหน้าปก (Featured Image)</h2>
        <div class="form-group">
          <label>อัปโหลดจากคอมพิวเตอร์</label>
          <input type="file" accept="image/*" @change="onFeaturedImageChange" class="form-control" />
        </div>
        
        <div class="image-preview-box mt-3" v-if="featuredImagePreview || formData.featured_image_url">
          <img :src="featuredImagePreview || getPreviewImage(formData.featured_image_url)" alt="Preview" class="preview-img" @error="$event.target.src='https://dev1.blupaperdev.com/wp-content/uploads/2026/03/tour-panda-defalt.webp'" />
        </div>
      </section>

      <section class="form-section shadow-sm seo-section">
        <h2 class="section-title">
          <span class="number" style="background-color: #2563eb;">4</span> 
          ตั้งค่า SEO (Rank Math)
        </h2>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Slug URL (ลิงก์ภาษาอังกฤษ)</label>
            <input type="text" v-model="formData.slug" class="form-control" placeholder="เช่น new-7-wonders-of-the-world" />
          </div>

          <div class="form-group full-width">
            <label>Focus Keyword (คีย์เวิร์ดเป้าหมาย)</label>
            <input type="text" v-model="formData.rank_math_focus_keyword" class="form-control" placeholder="เช่น ทัวร์ญี่ปุ่น, เที่ยวยุโรปด้วยตัวเอง" />
            <small class="text-muted mt-1 block">คีย์เวิร์ดหลักที่คุณต้องการให้คนค้นหาเจอใน Google (คั่นด้วยลูกน้ำได้)</small>
          </div>

          <div class="form-group full-width">
            <label>SEO Title (หัวข้อที่จะแสดงบน Google)</label>
            <input type="text" v-model="formData.rank_math_title" class="form-control" placeholder="หากเว้นว่าง จะใช้ชื่อบทความ + ชื่อเว็บไซต์" />
            <small class="text-muted mt-1 block">
              ความยาวที่แนะนำ: <span :class="{'text-danger': (formData.rank_math_title || '').length > 60}">{{ (formData.rank_math_title || '').length }}</span> / 60 ตัวอักษร
            </small>
          </div>

          <div class="form-group full-width">
            <label>SEO Description (คำอธิบายสำหรับ Google)</label>
            <textarea v-model="formData.rank_math_description" class="form-control" rows="3" placeholder="เขียนคำอธิบายสั้นๆ ที่ดึงดูดให้คนคลิกอ่าน..."></textarea>
            <small class="text-muted mt-1 block">
              ความยาวที่แนะนำ: <span :class="{'text-danger': (formData.rank_math_description || '').length > 160}">{{ (formData.rank_math_description || '').length }}</span> / 160 ตัวอักษร
            </small>
          </div>
        </div>
      </section>

      <div class="form-actions sticky-bottom">
        <button type="button" class="btn btn-outline-secondary btn-lg" @click="goBack">ยกเลิก</button>
        <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="isSaving">
          <span v-if="isSaving">⏳ กำลังบันทึกข้อมูล...</span>
          <span v-else>💾 บันทึกบทความ</span>
        </button>
      </div>
    </form>

    <transition name="fade">
      <div v-if="showPreviewModal" class="custom-modal-overlay" @click.self="cancelImport">
        <div class="custom-modal-box preview-modal-large shadow-lg">
          <div class="modal-header-premium">
            <div class="header-content">
              <span class="batch-count">บทความที่ {{ currentPreviewIndex + 1 }} / {{ parsedArticles.length }}</span>
              <h3>ตรวจสอบโครงร่างบทความก่อนนำเข้า</h3>
            </div>
            <button type="button" class="btn-close-white" @click="cancelImport">✕</button>
          </div>
          
          <div class="modal-body-premium" v-if="currentPreviewArticle">
            
            <div class="preview-card main-info-card">
              <div class="trip-badge" style="background: #2563eb;">BLOG MIGRATION</div>
              <h2 class="preview-title">{{ currentPreviewArticle.title }}</h2>
              <div class="mt-3">
                <span class="spec-label">🔗 Slug URL: </span> <span class="spec-value text-primary">/{{ currentPreviewArticle.slug }}</span>
              </div>
              <div class="mt-2">
                <span class="spec-label">📁 หมวดหมู่ (อ้างอิง): </span> <span class="spec-value">{{ currentPreviewArticle.category_text || 'ไม่มีหมวดหมู่' }}</span>
              </div>
            </div>

            <div class="preview-text-grid" style="grid-template-columns: 1fr; margin-bottom: 20px;">
              <div class="text-card">
                <h4 class="card-subtitle" style="border-left-color: #2563eb;">📝 คำโปรย / สรุปเนื้อหา (Excerpt)</h4>
                <p class="text-content-small" style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 15px;">
                  {{ currentPreviewArticle.excerpt || currentPreviewArticle.rank_math_description || 'ไม่มีข้อมูลสรุปใน CSV' }}
                </p>
              </div>

              <div class="text-card mt-3" style="border-left-color: #8b5cf6; padding: 0; overflow: hidden;">
                <div style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0; background: #faf5ff;">
                  <h4 class="card-subtitle" style="border-left-color: #8b5cf6; margin: 0;">📄 เนื้อหาบทความ (จากไฟล์ต้นฉบับ)</h4>
                </div>
                
                <div v-if="currentPreviewArticle.source_doc_url && currentPreviewArticle.source_doc_url.startsWith('http')" style="height: 400px; width: 100%; background: #f8fafc;">
                  <iframe 
                    :src="getGoogleDocsEmbedUrl(currentPreviewArticle.source_doc_url)" 
                    width="100%" 
                    height="100%" 
                    frameborder="0"
                    style="border: none;"
                  ></iframe>
                </div>
                
                <div v-else-if="currentPreviewArticle.source_doc_url" style="background: white; padding: 30px 20px; text-align: center;">
                  <span style="font-size: 2.5rem; display: block; margin-bottom: 10px;">📁</span>
                  <span style="color: #64748b; font-size: 0.9rem;">ชื่อไฟล์/โฟลเดอร์อ้างอิง:</span><br>
                  <strong style="color: #1e293b; font-size: 1.2rem;">{{ currentPreviewArticle.source_doc_url }}</strong>
                  <p style="color: #475569; font-size: 0.9rem; margin-top: 15px; margin-bottom: 0;">
                    ระบบไม่สามารถแสดงเนื้อหาได้เนื่องจากข้อมูลไม่ใช่ลิงก์ URL
                  </p>
                </div>
                
                <div v-else style="background: #f1f5f9; padding: 30px 20px; text-align: center;">
                  <span style="font-size: 2.5rem; display: block; margin-bottom: 10px;">✍️</span>
                  <p style="color: #475569; margin: 0; font-weight: 500;">ยังไม่มีเนื้อหา</p>
                  <span class="text-muted" style="font-size: 0.85rem;">ระบบจะเว้นว่างไว้ให้คุณพิมพ์เพิ่มเติมภายหลัง</span>
                </div>
              </div>
            </div>

            <div class="preview-card pricing-preview-card mt-4" style="border-color: #16a34a;">
              <h4 class="card-subtitle mb-3" style="background: #16a34a; color: white; padding: 15px;">🔍 ข้อมูล SEO (Rank Math)</h4>
              <div style="padding: 0 20px 20px 20px;">
                <div style="margin-bottom: 15px;">
                  <strong>🎯 Focus Keyword:</strong> <br>
                  <span style="color: #16a34a; font-weight: 600; font-size: 1.1rem;">{{ currentPreviewArticle.rank_math_focus_keyword || '-' }}</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong>📑 SEO Title:</strong> <br>
                  <span style="color: #1a1a1a;">{{ currentPreviewArticle.rank_math_title || '-' }}</span>
                </div>
                <div>
                  <strong>📝 SEO Description:</strong> <br>
                  <span style="color: #475569; font-size: 0.95rem; display: block; line-height: 1.5;">{{ currentPreviewArticle.rank_math_description || '-' }}</span>
                </div>
              </div>
            </div>

          </div>

          <div class="modal-footer-premium">
            <div class="nav-buttons">
              <button type="button" class="btn-nav" @click="prevPreview" :disabled="currentPreviewIndex === 0">⬅️ ย้อนกลับ</button>
              <button type="button" class="btn-nav" @click="nextPreview" :disabled="currentPreviewIndex === parsedArticles.length - 1">ถัดไป ➡️</button>
            </div>
            <div class="action-buttons">
              <button type="button" class="btn-cancel-import" @click="cancelImport">ยกเลิกทั้งหมด</button>
              <button type="button" class="btn-confirm-import" @click="confirmImport">✅ ยืนยันนำเข้าเป็น "ฉบับร่าง"</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isImportingData" class="custom-modal-overlay">
        <div class="custom-modal-box progress-modal-box shadow-lg text-center" style="padding: 30px;">
          <div class="spinner-container">
            <div class="cloud-upload-icon">☁️</div>
            <div class="loading-ring" style="border-top-color: #2563eb;"></div>
          </div>
          <h3 class="progress-title mt-4">กำลังนำเข้าโครงร่างบทความ...</h3>
          <p class="progress-status-text">{{ importProgressText }}</p>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" :style="{ width: importPercentage + '%', background: 'linear-gradient(90deg, #60a5fa, #2563eb)' }"></div>
          </div>
          <div class="progress-percentage" style="color: #2563eb;"><strong>{{ importPercentage }}%</strong></div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import Papa from 'papaparse'
import axios from 'axios'

const secureApi = axios.create({
  baseURL: 'https://dev1.blupaperdev.com/wp-json/blupaper/v1', 
  timeout: 120000
})
const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => !!route.params.id)
const isSaving = ref(false)
const isLoading = ref(false)
const featuredImageFile = ref(null)
const featuredImagePreview = ref(null)

const categories = ref([])

const formData = ref({
  title: '',
  slug: '',
  category_id: '',
  excerpt: '',
  content: '',
  source_doc_url: '', 
  featured_image_url: '',
  status: 'draft', // เริ่มต้นเป็น draft
  rank_math_focus_keyword: '',
  rank_math_title: '',
  rank_math_description: ''
})

// ---------------------------------------------------------------------
// 🟢 Variables for CSV Import
// ---------------------------------------------------------------------
const csvFileInput = ref(null)
const showPreviewModal = ref(false) // ตัวแปรที่หายไป
const parsedArticles = ref([])
const currentPreviewIndex = ref(0)
const isImportingData = ref(false)
const importProgressText = ref('')
const importPercentage = ref(0)

const currentPreviewArticle = computed(() => {
  if (parsedArticles.value.length === 0) return null;
  return parsedArticles.value[currentPreviewIndex.value];
});

const editorOptions = {
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }], 
      ['bold', 'italic', 'underline', 'strike'], 
      [{ 'color': [] }, { 'background': [] }], 
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], 
      [{ 'align': [] }], 
      ['blockquote', 'code-block'], 
      ['link', 'image', 'video'], 
      ['clean'] 
    ]
  }
}

onMounted(async () => {
  await fetchCategories()
  if (isEditMode.value) {
    loadArticleData(route.params.id)
  }
})

const fetchCategories = async () => {
  try {
    const response = await secureApi.get('/taxonomy-terms/category')
    if (response.data.success) {
      categories.value = response.data.items || []
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// ฟังก์ชันแปลงลิงก์ Google Docs ให้แสดงใน Iframe ได้สวยงาม
const getGoogleDocsEmbedUrl = (url) => {
  if (!url || !url.startsWith('http')) return '';
  if (url.includes('docs.google.com/document/d/')) {
    // เปลี่ยน /edit ให้กลายเป็น /preview
    return url.replace(/\/edit.*$/, '/preview');
  }
  return url;
};

const loadArticleData = async (id) => {
  isLoading.value = true
  try {
    const response = await secureApi.get(`/articles/${id}`)
    if (response.data.success) {
      const data = response.data.data
      formData.value = {
        title: data.title || '',
        slug: data.slug || '',
        category_id: data.category_id || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        source_doc_url: data.source_doc_url || '',
        featured_image_url: data.featured_image_url || '',
        status: data.status || 'publish',
        rank_math_focus_keyword: data.rank_math_focus_keyword || '',
        rank_math_title: data.rank_math_title || '',
        rank_math_description: data.rank_math_description || ''
      }
    }
  } catch (error) {
    console.error('Error loading article:', error)
  } finally {
    isLoading.value = false
  }
}

const onFeaturedImageChange = (e) => {
  const file = e.target.files?.[0] || null
  featuredImageFile.value = file
  if (file) {
    featuredImagePreview.value = URL.createObjectURL(file)
  } else {
    featuredImagePreview.value = null
  }
}

const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/webp' || file.type === 'image/gif') return resolve(file);
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image(); img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => { resolve(blob ? new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' }) : file); }, 'image/webp', quality);
      }
    }
  })
}

// 🟢 ฟังก์ชันบันทึกบทความ
const saveArticle = async () => {
  if (!formData.value.title.trim()) return alert('❌ กรุณากรอกหัวข้อบทความ')
  
  isSaving.value = true
  try {
    let finalImgId = 0;
    if (featuredImageFile.value) {
      const form = new FormData();
      const webp = await convertToWebP(featuredImageFile.value);
      form.append('featuredImage', webp);
      const uploadRes = await secureApi.post('/upload-tour-assets', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      finalImgId = uploadRes.data?.featuredImage?.attachment_id || 0;
    }

    const payload = {
      ...formData.value,
      featured_image_id: finalImgId,
      featured_image_url: finalImgId ? '' : formData.value.featured_image_url
    }

    let response;
    if (isEditMode.value) response = await secureApi.post(`/update-article/${route.params.id}`, payload)
    else response = await secureApi.post('/add-article', payload)

    if (response.data.success) {
      alert(isEditMode.value ? '✅ อัปเดตบทความเรียบร้อย' : '✅ สร้างบทความใหม่เรียบร้อย')
      router.push('/articles')
    } else {
      alert('บันทึกไม่สำเร็จ: ' + (response.data.message || 'Error'))
    }
  } catch (error) {
    console.error('Error saving article:', error)
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
  } finally {
    isSaving.value = false
  }
}

// ---------------------------------------------------------------------
// 🟢 ฟังก์ชันอัปโหลดและจัดการ CSV 
// ---------------------------------------------------------------------
const triggerCsvUpload = () => {
  if (csvFileInput.value) {
    csvFileInput.value.value = ''; 
    csvFileInput.value.click();
  }
};

const handleCsvImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isImportingData.value = true;
  importProgressText.value = 'กำลังวิเคราะห์ไฟล์ CSV...';
  importPercentage.value = 10;

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    complete: (results) => {
      try {
        const rows = results.data;
        const articlesMap = new Map();
        let lastMainKey = null; 

        // ข้ามหัวตาราง 3 บรรทัดแรก (เริ่ม Index 3)
        for (let i = 3; i < rows.length; i++) {
          const row = rows[i];
          
          const articleId = row[0] ? String(row[0]).trim() : ''; 
          const blogName = row[15] ? String(row[15]).trim() : ''; 

          let mainKey = articleId || blogName;
          
          if (!mainKey) {
            if (lastMainKey) {
              mainKey = lastMainKey; 
            } else {
              continue; 
            }
          } else {
            lastMainKey = mainKey;
          }

          const primaryKw = row[7] ? String(row[7]).trim() : ''; 
          const secondaryKw = row[10] ? String(row[10]).trim() : ''; 

          if (!articlesMap.has(mainKey)) {
            const seoTitle = row[17] ? String(row[17]).replace(/\n/g, ' ').trim() : blogName;
            const seoDesc = row[19] ? String(row[19]).trim() : '';
            const slug = row[16] ? String(row[16]).trim() : '';
            const sourceUrl = row[13] ? String(row[13]).trim() : '';
            const categoryText = [row[4], row[5]].filter(Boolean).join(', ');
            const allKeywords = [primaryKw, secondaryKw].filter(Boolean).join(', ');

            articlesMap.set(mainKey, {
              title: seoTitle,
              slug: slug, 
              category_text: categoryText, 
              source_doc_url: sourceUrl, 
              excerpt: seoDesc, 
              rank_math_title: seoTitle, 
              rank_math_description: seoDesc, 
              rank_math_focus_keyword: allKeywords, 
              status: 'draft' 
            });
          } else {
            const existing = articlesMap.get(mainKey);
            if (secondaryKw) {
              existing.rank_math_focus_keyword += existing.rank_math_focus_keyword ? `, ${secondaryKw}` : secondaryKw;
            }
            if (primaryKw && !existing.rank_math_focus_keyword.includes(primaryKw)) {
              existing.rank_math_focus_keyword = primaryKw + (existing.rank_math_focus_keyword ? `, ${existing.rank_math_focus_keyword}` : '');
            }
          }
        }

        parsedArticles.value = Array.from(articlesMap.values());
        isImportingData.value = false;

        if (parsedArticles.value.length > 0) {
          currentPreviewIndex.value = 0;
          showPreviewModal.value = true; 
        } else {
          alert("ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV");
        }

      } catch (err) {
        console.error("CSV Parse Error:", err);
        isImportingData.value = false;
        alert("เกิดข้อผิดพลาดในการประมวลผล: " + err.message);
      }
      
      if (csvFileInput.value) csvFileInput.value.value = '';
    },
    error: (err) => {
      isImportingData.value = false;
      alert("ไม่สามารถอ่านไฟล์ CSV ได้: " + err.message);
    }
  });
};

const prevPreview = () => { if (currentPreviewIndex.value > 0) currentPreviewIndex.value--; };
const nextPreview = () => { if (currentPreviewIndex.value < parsedArticles.value.length - 1) currentPreviewIndex.value++; };

const cancelImport = () => {
  showPreviewModal.value = false;
  parsedArticles.value = [];
};


const isPullingContent = ref(false);

// ฟังก์ชันสั่งดูดเนื้อหาและรูปภาพ
const pullContentFromDoc = async () => {
  if (!formData.value.source_doc_url) return;
  
  if (!confirm('ระบบกำลังจะดาวน์โหลดเนื้อหาและรูปภาพทั้งหมดจาก Google Docs มาใส่ในช่องนี้ (ข้อมูลเก่าในช่องนี้จะถูกเขียนทับ) คุณต้องการดำเนินการต่อหรือไม่?')) return;

  isPullingContent.value = true;
  try {
    const res = await secureApi.post('/import-gdoc', { 
      url: formData.value.source_doc_url 
    });
    
    if (res.data.success) {
      // นำ HTML ที่ได้ (ซึ่งเปลี่ยนลิงก์รูปเป็นรูปในเซิร์ฟเวอร์เราแล้ว) มาใส่ใน Quill
      formData.value.content = res.data.html;
      alert('✅ ดึงเนื้อหาและดาวน์โหลดรูปภาพเข้าเซิร์ฟเวอร์สำเร็จ!');
    } else {
      alert('❌ ดึงข้อมูลไม่สำเร็จ: ' + (res.data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error pulling doc:', error);
    alert('❌ ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบว่าเปิดแชร์ลิงก์ Google Docs เป็น "Anyone with the link (ทุกคนที่มีลิงก์)" หรือยัง');
  } finally {
    isPullingContent.value = false;
  }
};

const confirmImport = async () => {
  showPreviewModal.value = false;
  isImportingData.value = true;
  let successCount = 0;

  for (let i = 0; i < parsedArticles.value.length; i++) {
    importProgressText.value = `กำลังสร้างโครงร่าง: ${parsedArticles.value[i].title} (${i + 1}/${parsedArticles.value.length})`;
    importPercentage.value = Math.round(((i + 1) / parsedArticles.value.length) * 100);

    try {
      const catText = parsedArticles.value[i].category_text.toLowerCase();
      const matchedCat = categories.value.find(c => catText.includes(c.name.toLowerCase()));
      
      const payload = {
        ...parsedArticles.value[i],
        category_id: matchedCat ? matchedCat.id : ''
      };
      
      const res = await secureApi.post('/add-article', payload);
      if (res.data.success) successCount++;
    } catch (e) {
      console.error('Error importing:', e);
    }
  }

  setTimeout(() => {
    isImportingData.value = false;
    alert(`✅ นำเข้าสำเร็จ ${successCount} จาก ${parsedArticles.value.length} บทความ (บันทึกเป็นฉบับร่างแล้ว)`);
    router.push('/articles'); 
  }, 800);
};

const goBack = () => { router.push('/articles') }
const getPreviewImage = (url) => { return url; }

// ตัวอย่างการเรียกใช้ใน Vue
const fetchContentFromDoc = async (url) => {
  try {
    const res = await secureApi.post('/fetch-doc', { url: url });
    if(res.data.success) {
       return res.data.html; // ได้เนื้อหาบทความมาใส่ Quill Editor เลย!
    }
  } catch(e) {
    console.error("ดึงข้อมูลไม่สำเร็จ: อาจจะไม่ได้เปิดแชร์ Public");
  }
  return "";
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
* { box-sizing: border-box; }
.tour-admin-container {
  --color-primary: #cc0000; --color-secondary: #1a1a1a; --color-success: #16a34a; --color-white: #ffffff;
  --color-bg: #f8fafc; --color-border: #e2e8f0; --color-text: #1e293b; font-family: 'Kanit', sans-serif;
  background-color: var(--color-bg); color: var(--color-text); min-height: 100vh; padding: 30px; max-width: 1200px; margin: 0 auto;
}
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); margin: 0; }
.page-subtitle { color: #64748b; margin: 8px 0 0; font-weight: 300; }
.modern-form { display: flex; flex-direction: column; gap: 25px; }
.form-section { background: var(--color-white); border-radius: 12px; padding: 30px; border: 1px solid var(--color-border); transition: 0.2s ease;}
.form-section:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.05); transform: translateY(-2px); }
.section-title { font-size: 1.25rem; font-weight: 600; color: var(--color-secondary); margin: 0 0 25px; display: flex; align-items: center; gap: 12px; }
.section-title .number { background: var(--color-primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: 1 / -1; }
.form-group label { display: block; font-weight: 500; margin-bottom: 8px; color: var(--color-secondary); }
.required { color: var(--color-primary); margin-left: 3px;}
.form-control { width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: 'Kanit', sans-serif; font-size: 1rem; transition: 0.2s; }
.form-control:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-control-lg { font-size: 1.15rem; font-weight: 500; padding: 14px 16px; }
.status-select.publish { color: #16a34a; background-color: #f0fdf4; }
.status-select.draft { color: #d97706; background-color: #fffbeb; }
.mb-4 { margin-bottom: 1.5rem; }
.mt-3 { margin-top: 1rem; }
.text-muted { color: #64748b; font-size: 0.85rem; }
.block { display: block; }
.text-danger { color: #ef4444; font-weight: bold; }
.text-primary { color: #2563eb; font-weight: 600;}

/* 🟢 ดีไซน์พิเศษสำหรับ Section SEO */
.seo-section { border-left: 4px solid #2563eb; background: #f8fafc; }
.quill-wrapper { background: white; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden; }
.content-quill :deep(.ql-container.ql-snow) { min-height: 400px; font-family: 'Kanit', sans-serif; font-size: 1.05rem; }
.content-quill :deep(.ql-toolbar.ql-snow) { border-top: none; border-left: none; border-right: none; border-bottom: 1px solid #cbd5e1; background: #f8fafc; font-family: 'Kanit', sans-serif; }

.image-preview-box { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 10px; max-width: 400px; background: #f8fafc; text-align: center; }
.preview-img { max-width: 100%; height: auto; max-height: 250px; border-radius: 8px; object-fit: cover; }

.form-actions { display: flex; justify-content: flex-end; gap: 15px; padding: 20px 30px; background: white; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 -4px 10px rgba(0,0,0,0.02); }
.sticky-bottom { position: sticky; bottom: 20px; z-index: 100; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; font-family: 'Kanit', sans-serif; border: 1px solid transparent; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px;}
.btn-lg { padding: 12px 30px; font-size: 1.05rem; }
.submit-btn { min-width: 250px; }
.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-success { background: var(--color-success); color: white; }
.btn-success:hover { background: #15803d; }
.btn-outline-secondary { background: white; border-color: #cbd5e1; color: #475569; }
.btn-outline-secondary:hover { background: #f8fafc; }
.btn-outline-success { background: transparent; border-color: var(--color-success); color: var(--color-success); border-style: dashed;}
.btn-outline-success:hover:not(:disabled) { background: #f0fdf4; }
.btn-outline-primary { border: 1px solid #2563eb; color: #2563eb; background: transparent;}
.btn-outline-primary:hover { background: #eff6ff;}

/* -----------------------------------
   💎 Premium Preview Modal Styles
----------------------------------- */
.custom-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.custom-modal-box { background: white; width: 90%; max-width: 450px; border-radius: 16px; overflow: hidden; font-family: 'Kanit'; }
.preview-modal-large { max-width: 1000px !important; width: 95% !important; border-radius: 16px !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
.modal-header-premium { background: var(--color-secondary, #1a1a1a); color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #2563eb; }
.modal-header-premium h3 { margin: 0; font-size: 1.25rem; font-weight: 500; color: #f8fafc; }
.batch-count { font-size: 0.75rem; background: rgba(255, 255, 255, 0.1); padding: 4px 12px; border-radius: 20px; margin-bottom: 8px; display: inline-block; color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.2); }
.btn-close-white { background: rgba(255, 255, 255, 0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
.btn-close-white:hover { background: #2563eb; transform: rotate(90deg); }
.modal-body-premium { padding: 30px; background: #f8fafc; max-height: 70vh; overflow-y: auto; }
.preview-card { background: white; padding: 25px; border-radius: 12px; box-shadow: var(--shadow-sm); margin-bottom: 20px; border: 1px solid var(--color-border); }
.main-info-card { border-left: 6px solid #2563eb; }
.trip-badge { background: #2563eb; color: white; display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; margin-bottom: 12px; letter-spacing: 0.5px; }
.preview-title { margin: 0; font-size: 1.4rem; color: var(--color-secondary); font-weight: 600; line-height: 1.4; }
.preview-text-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px; }
.text-card { background: white; padding: 25px; border-radius: 12px; border: 1px solid var(--color-border); border-left: 4px solid #2563eb;}
.card-subtitle { color: var(--color-secondary); font-weight: 600; font-size: 1.1rem; margin: 0; display: block;}
.text-content-small { color: #475569; line-height: 1.6; font-size: 0.95rem; }
.modal-footer-premium { padding: 20px 30px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.nav-buttons { display: flex; gap: 10px; }
.btn-nav { padding: 10px 20px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; color: #475569; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-nav:hover:not(:disabled) { background: #f8fafc; color: var(--color-secondary); border-color: #94a3b8; }
.action-buttons { display: flex; gap: 15px; }
.btn-cancel-import { background: white; border: 1px solid #ef4444; color: #ef4444; padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-cancel-import:hover { background: #fef2f2; }
.btn-confirm-import { background: #2563eb; color: white; padding: 10px 25px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
.btn-confirm-import:hover { background: #1d4ed8; transform: translateY(-1px); }

/* Progress Modal */
.progress-modal-box { border-top: 5px solid #2563eb; }
.spinner-container { position: relative; width: 80px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
.cloud-upload-icon { font-size: 2.5rem; animation: bounce 2s infinite ease-in-out; }
.loading-ring { position: absolute; inset: 0; border: 4px solid #f8fafc; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }
.progress-bar-container { width: 100%; height: 14px; background-color: #f1f5f9; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
.progress-bar-fill { height: 100%; transition: width 0.4s ease-in-out; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Mobile Responsive */
@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .modal-footer-premium { flex-direction: column; gap: 15px; }
  .action-buttons, .nav-buttons { width: 100%; justify-content: space-between; }
  .action-buttons { flex-direction: column-reverse; }
}
</style>