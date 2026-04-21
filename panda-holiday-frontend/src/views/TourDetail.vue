<template>
  <div class="tour-admin-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="icon">✏️</span> แก้ไขโปรแกรมทัวร์ (ID: {{ tourId }})
        </h1>
        <p class="page-subtitle">แก้ไขรายละเอียดและบันทึกเพื่ออัปเดตข้อมูลบนเว็บไซต์</p>
      </div>
      <div class="header-actions">
        <button @click="goBack" class="btn btn-outline-secondary">
          ⬅️ กลับหน้ารวมทัวร์
        </button>
      </div>
    </header>

    <div v-if="isFetching" class="state-container shadow-sm">
      <span class="loading-spinner">⏳</span> กำลังดึงข้อมูลทัวร์จากระบบ...
    </div>

    <form v-else @submit.prevent="updateTourData" class="modern-form">
      
      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">1</span> ข้อมูลทั่วไป (General Info)</h2>
        
        <div>
          <input type="hidden" v-model="formData.trip_price_display" />
          <input type="hidden" v-model="formData.trip_schedule" />
        </div>

        <div class="form-grid grid-col-2">
          <div class="form-group full-width-mobile">
            <label>ชื่อโปรแกรมทัวร์ (Title) <span class="required">*</span></label>
            <input type="text" v-model="formData.title" required class="form-control" />
          </div>

          <div class="form-group full-width-mobile">
            <label>รหัสทัวร์ (Trip Code) <span class="required">*</span></label>
            <input type="text" v-model="formData.trip_code" required class="form-control" />
          </div>

          <div class="form-group">
            <label>ระยะเวลา (วัน / คืน)</label>
            <div class="auto-calc-group">
              <input type="number" v-model="formData.trip_days" placeholder="จำนวนวัน" class="form-control text-center" min="1" />
              <span class="calc-divider">วัน</span>
              <input type="number" v-model="formData.trip_nights" placeholder="จำนวนคืน" class="form-control text-center" min="0" />
              <span class="calc-divider">คืน</span>
            </div>
          </div>

          <div class="form-group">
            <label>สถานะการแสดงผล (Status) <span class="required">*</span></label>
            <select v-model="formData.status" required class="form-control form-select status-select" :class="formData.status">
              <option value="publish">✅ เผยแพร่ (แสดงบนหน้าเว็บ)</option>
              <option value="draft">📝 ฉบับร่าง (ซ่อนจากหน้าเว็บ)</option>
            </select>
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">2</span> ข้อมูลการเดินทาง (Travel Info)</h2>
        
        <div class="form-grid grid-col-2">
          <div class="form-group">
            <label>สายการบิน (Airlines)</label>
            <select v-model="formData.tour_airlines" :disabled="loadingAirlines" class="form-control form-select">
              <option value="">-- เลือกสายการบิน --</option>
              <option v-for="airline in airlinesList" :key="airline.value" :value="airline.value">
                {{ airline.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>ระดับโรงแรม (ดาว)</label>
            <select v-model="formData.tour_hotel_rating" class="form-control form-select">
              <option value="3">3 ดาว</option>
              <option value="4">4 ดาว</option>
              <option value="5">5 ดาว</option>
              <option value="6">6 ดาว</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>จุดหมายปลายทาง (Destinations)</label>
            <Multiselect
              v-model="formData.destination_ids" :options="destinationsList" mode="tags" :searchable="true"
              valueProp="id" label="name" :disabled="loadingDestinations" class="modern-multiselect"
            />
          </div>

          <div class="form-group">
            <label>เทศกาล (Festival)</label>
            <Multiselect
              v-model="formData.festival_ids" :options="festivalsList" mode="tags" :searchable="true"
              valueProp="id" label="name" :disabled="loadingFestivals" class="modern-multiselect"
            />
          </div>

          <div class="form-group">
            <label>เดือนที่เดินทาง (Month Categories)</label>
            <Multiselect
              v-model="formData.month_ids" :options="monthsList" mode="tags" :searchable="true"
              valueProp="id" label="name" :disabled="loadingMonths" class="modern-multiselect"
            />
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm pricing-section">
        <div class="section-header-flex">
          <h2 class="section-title"><span class="number">3</span> รอบเดินทางและราคา (Pricing Rounds)</h2>
          
          <div class="pricing-header-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" @click="sortByDate" class="btn btn-outline-secondary btn-sm">📅 เรียงตามวันที่</button>
            <button type="button" @click="sortByPrice" class="btn btn-outline-secondary btn-sm">💰 เรียงตามราคา</button>
            <button type="button" @click="addPricingRound" class="btn btn-success btn-sm">➕ เพิ่มรอบเดินทาง</button>
          </div>
        </div>

        <div class="pricing-rounds-container">
          <div v-for="(round, roundIndex) in formData.trip_pricing_data" :key="roundIndex" class="pricing-round-card">
            
            <div class="round-card-header">
              <h3 class="round-number">รอบที่ {{ roundIndex + 1 }}</h3>
              <div class="action-right" style="display: flex; gap: 8px;">
                <button type="button" @click="openDuplicateModal(roundIndex)" class="btn btn-outline-primary btn-xs" title="คัดลอกรอบนี้">
                  📋 คัดลอกราคานี้
                </button>
                <button type="button" @click="removePricingRound(roundIndex)" class="btn-icon-danger" title="ลบรอบนี้">
                  ❌ ลบรอบนี้
                </button>
              </div>
            </div>

            <div class="form-grid grid-col-2">
              <div class="form-group">
                <label>วันที่ไป (Start Date)</label>
                <input type="date" v-model="round.start_date" class="form-control" @change="round.end_date = ''" />
              </div>
              <div class="form-group">
                <label>วันที่กลับ (End Date)</label>
                <input type="date" v-model="round.end_date" class="form-control" :disabled="!round.start_date" />
              </div>
              
              <div class="form-group">
                <label>จำนวนรับได้สูงสุด (Max Pax.)</label>
                <input type="number" v-model="round.max_pax" placeholder="เช่น 20 หรือ 30" class="form-control" min="1" />
              </div>
              
              <div class="form-group">
                <label>ระยะเวลา (อิงจากข้อมูลหลักด้านบน)</label>
                <input type="text" :value="`${formData.trip_days || 0} วัน ${formData.trip_nights || 0} คืน`" readonly class="form-control readonly-input" />
              </div>
            </div>

            <div class="price-tiers-list">
              <label class="inner-label">ตารางราคา</label>
              <div v-for="(price, priceIndex) in round.prices" :key="priceIndex" class="price-row-grid">
                
                <select v-model="price.category" class="form-control form-control-sm form-select" :disabled="loadingPricingCategories">
                  <option value="" disabled>-- เลือกหมวดหมู่ราคา --</option>
                  <option v-for="cat in pricingCategoriesList" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
                </select>

                <input type="text" 
                  :value="price.amount ? Number(price.amount).toLocaleString('th-TH') : ''"
                  @input="onPriceInput($event, roundIndex, priceIndex)"
                  placeholder="ราคา (เช่น 89,900)" class="form-control form-control-sm price-input" />

                <button type="button" @click="removePriceCategory(roundIndex, priceIndex)" class="btn btn-outline-danger btn-xs">ลบ</button>
              </div>
              <button type="button" @click="addPriceCategory(roundIndex)" class="btn btn-outline-success btn-xs mt-3 full-width-btn">
                ➕ เพิ่มหมวดหมู่ราคา
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm program-details-section">
        <h2 class="section-title"><span class="number">4</span> รายละเอียดโปรแกรม (Program Details)</h2>
        
        <div class="form-group full-width">
          <label>ภาพรวมโปรแกรมสั้นๆ (Overview / Excerpt)</label>
          <textarea v-model="formData.excerpt" class="form-control" rows="3" placeholder="สรุปโปรแกรมทัวร์สั้นๆ เพื่อดึงดูดลูกค้า..."></textarea>
        </div>

        <div class="form-group full-width mt-4">
          <label>Overview</label>
          <div class="quill-wrapper">
           <QuillEditor theme="snow" v-model:content="formData.overview" contentType="html" placeholder="กรอกข้อมูล Overview..." />
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>เส้นทางไฮไลท์ (Highlight)</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.tour_highlight" contentType="html" placeholder="เช่น กรุงเทพ - เฉินตู - คัชการ์..." />
          </div>
        </div>

        <div class="form-group full-width itinerary-builder mt-4">
          <div class="itinerary-header">
            <label>แผนการเดินทางแบบย่อ</label>
            <button type="button" @click="addItineraryRow" class="btn btn-success btn-xs">➕ เพิ่มวันที่</button>
          </div>
          <div class="itinerary-table-responsive">
            <table class="itinerary-table">
              <thead>
                <tr>
                  <th width="60">วันที่</th>
                  <th width="30%">กำหนดการ</th>
                  <th>เช้า</th>
                  <th>กลางวัน</th>
                  <th>ค่ำ</th>
                  <th width="20%">โรงแรม</th>
                  <th width="50"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="itineraryRows.length === 0">
                  <td colspan="7" class="text-center empty-state-row">ยังไม่มีกำหนดการ สามารถสร้างใหม่ได้</td>
                </tr>
                <tr v-for="(row, index) in itineraryRows" :key="index">
                  <td class="text-center"><span class="day-badge">{{ row.day }}</span></td>
                  <td><input type="text" v-model="row.detail" placeholder="เช่น กรุงเทพฯ - เฉิงตู" class="form-control form-control-sm" /></td>
                  <td>
                    <select v-model="row.morning" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option><option value="food">🍽️ อาหาร</option><option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="row.lunch" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option><option value="food">🍽️ อาหาร</option><option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="row.dinner" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option><option value="food">🍽️ อาหาร</option><option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td><input type="text" v-model="row.hotel" placeholder="ชื่อโรงแรม" class="form-control form-control-sm" /></td>
                  <td class="text-center">
                    <button type="button" @click="removeItineraryRow(index)" class="btn-icon-danger" title="ลบข้อมูลวันนี้">❌</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm seo-section">
        <h2 class="section-title"><span class="number" style="background-color: #2563eb;">5</span> ตั้งค่า SEO (Rank Math)</h2>
        <div class="form-grid grid-col-2">
          <div class="form-group full-width-mobile">
            <label>คีย์เวิร์ดหลัก (Focus Keyword)</label>
            <input type="text" v-model="formData.rank_math_focus_keyword" placeholder="เช่น ทัวร์จีน, ทัวร์ซินเจียง" class="form-control" />
          </div>

          <div class="form-group full-width-mobile">
            <label>ชื่อไตเติ้ล SEO (SEO Title)</label>
            <input type="text" v-model="formData.rank_math_title" placeholder="เว้นว่างไว้เพื่อใช้ค่าเริ่มต้นของระบบ" class="form-control" />
            <small style="color: #64748b; font-size: 0.8rem; margin-top: 4px;">💡 ถ้าเว้นว่าง จะดึงชื่อทัวร์ไปใช้โดยอัตโนมัติ</small>
          </div>

          <div class="form-group full-width mt-2">
            <label>
              คำอธิบาย SEO (Meta Description)
              <span class="size-hint" style="float: right; font-weight: normal; color: #64748b;">{{ formData.rank_math_description.length }} / 160 ตัวอักษร</span>
            </label>
            <textarea v-model="formData.rank_math_description" rows="3" placeholder="พิมพ์คำอธิบายดึงดูดลูกค้าที่จะแสดงบนหน้าค้นหาของ Google..." class="form-control" style="resize: vertical;"></textarea>
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm files-preview-section">
        <h2 class="section-title"><span class="number">6</span> ไฟล์แนบและรูปภาพ</h2>
        
        <div class="form-grid grid-col-2">
          <div class="form-group">
            <label>ไฟล์ PDF โปรแกรมทัวร์</label>
            <div v-if="currentPdfUrl" class="current-file-preview">
              <a :href="currentPdfUrl" target="_blank" class="btn btn-outline-danger btn-sm file-pdf-view">📄 ดูไฟล์ PDF ปัจจุบัน</a>
            </div>
            <div class="file-input-wrapper mt-2">
              <input type="file" accept="application/pdf" @change="onPdfChange" class="form-control-file" />
              <span class="file-custom-label">
                <span v-if="pdfFile">✅ เลือกไฟล์ใหม่: {{ pdfFile.name }}</span>
                <span v-else>📁 อัปโหลดไฟล์ PDF ใหม่เพื่อทับของเดิม</span>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>รูปภาพหน้าปก (Featured Image)</label>
            <div class="current-image-preview">
              <img v-if="featuredImagePreview" :src="featuredImagePreview" alt="New Featured Image" class="preview-img shadow-sm" />
              <img v-else-if="currentFeaturedImageUrl" :src="currentFeaturedImageUrl" alt="Current Featured Image" class="preview-img shadow-sm" />
            </div>
            <div class="file-input-wrapper mt-2">
              <input type="file" accept="image/*" @change="onFeaturedImageChange" class="form-control-file" />
              <span class="file-custom-label file-image-label">
                <span v-if="featuredImageFile">✅ เลือกรูปใหม่: {{ featuredImageFile.name }}</span>
                <span v-else>🖼️ อัปโหลดรูปปกใหม่เพื่อทับของเดิม</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="form-actions sticky-bottom">
        <button type="button" class="btn btn-outline-secondary btn-lg" @click="goBack">ยกเลิก</button>
        <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting">⏳ {{ uploadProgressText || 'กำลังบันทึกข้อมูล...' }}</span>
          <span v-else>💾 บันทึกการแก้ไข</span>
        </button>
      </div>
    </form>

    <transition name="fade">
      <div v-if="successMessage" class="alert alert-success shadow">
        <span class="alert-icon">✅</span> {{ successMessage }}
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMessage" class="alert alert-danger shadow">
        <span class="alert-icon">❌</span> {{ errorMessage }}
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showDuplicateModal" class="custom-modal-overlay" @click.self="closeDuplicateModal">
        <div class="custom-modal-box">
          <div class="modal-header">
            <h3>📋 คัดลอกตารางราคา</h3>
            <button type="button" class="btn-close" @click="closeDuplicateModal">✕</button>
          </div>
          <div class="modal-body">
            <p>ต้องการคัดลอกราคาของ <strong>"รอบที่ {{ currentDuplicateIndex + 1 }}"</strong> เพิ่มอีกกี่รอบ?</p>
            <div class="counter-group">
              <button type="button" class="btn-counter" @click="duplicateCount > 1 ? duplicateCount-- : null">-</button>
              <input type="number" v-model="duplicateCount" class="form-control text-center count-input" min="1" />
              <button type="button" class="btn-counter" @click="duplicateCount++">+</button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeDuplicateModal">ยกเลิก</button>
            <button type="button" class="btn btn-primary" @click="confirmDuplicate">
              ✅ ยืนยันคัดลอก ({{ duplicateCount }} รอบ)
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()
const tourId = route.params.id

// 1. API สำหรับดึงข้อมูลมาแสดงผล (วิ่งไปหา WordPress)
const publicApi = axios.create({
  baseURL: 'https://panda.co.th//wp-json/blupaper/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
})

// ตรวจสอบในไฟล์ src/views/TourList.vue และ TourDetail.vue
const secureApi = axios.create({
  // 🟢 เปลี่ยนจาก dev1.blupaperdev.com เป็น panda.co.th
  baseURL: 'https://panda.co.th/wp-json/blupaper/v1', 
  timeout: 60000
})
// ---------------------------------------------------------------------
// DEFAULT FORM
// ---------------------------------------------------------------------
const formData = ref({
  title: '', trip_code: '', trip_price_display: '', trip_days_nights: '', trip_schedule: '',
  trip_days: '', trip_nights: '',
  status: 'publish', tour_airlines: '', tour_hotel_rating: '5', excerpt: '', content: '', overview: '',wp_travel_overview: '',
  tour_highlight: '', tour_schedule_details: '',
  destination_ids: [], festival_ids: [], month_ids: [],
  tour_pdf: 0, featured_image_id: 0, gallery_image_ids: [],
  trip_pricing_data: [],
  rank_math_focus_keyword: '', rank_math_title: '', rank_math_description: ''
})

const itineraryRows = ref([])
const pdfFile = ref(null)
const featuredImageFile = ref(null)
const galleryFiles = ref([])

const featuredImagePreview = ref(null)

const isFetching = ref(true)
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const uploadProgressText = ref('')

const airlinesList = ref([]); const loadingAirlines = ref(false);
const destinationsList = ref([]); const loadingDestinations = ref(false);
const festivalsList = ref([]); const loadingFestivals = ref(false);
const monthsList = ref([]); const loadingMonths = ref(false);
const pricingCategoriesList = ref([]); const loadingPricingCategories = ref(false);

const currentFeaturedImageUrl = ref('')
const currentPdfUrl = ref('')

const goBack = () => { router.push('/') }

// ---------------------------------------------------------------------
// AUTO CALCULATE LOWEST PRICE
// ---------------------------------------------------------------------
const lowestPrice = computed(() => {
  let min = Infinity; let hasPrice = false;
  formData.value.trip_pricing_data.forEach(round => {
    round.prices.forEach(price => {
      const amount = Number(price.amount);
      if (amount > 0 && amount < min) { min = amount; hasPrice = true; }
    });
  });
  return hasPrice ? min : 0;
});

watch(lowestPrice, (newMin) => {
  if (newMin > 0) formData.value.trip_price_display = newMin.toLocaleString('th-TH');
  else formData.value.trip_price_display = '';
}, { immediate: true });

// ---------------------------------------------------------------------
// AUTO CALCULATE TRIP SCHEDULE
// ---------------------------------------------------------------------
const thaiShortMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const computedTripSchedule = computed(() => {
  const validDates = formData.value.trip_pricing_data.map(round => round.start_date).filter(date => date).map(date => new Date(date).getTime()).filter(time => !isNaN(time));
  if (validDates.length === 0) return '';
  const minDate = new Date(Math.min(...validDates)); const maxDate = new Date(Math.max(...validDates));
  const minMonth = thaiShortMonths[minDate.getMonth()]; const maxMonth = thaiShortMonths[maxDate.getMonth()];
  const minYear = minDate.getFullYear(); const maxYear = maxDate.getFullYear();
  return (minMonth === maxMonth && minYear === maxYear) ? minMonth : `${minMonth} - ${maxMonth}`;
});

watch(computedTripSchedule, (newSchedule) => {
  formData.value.trip_schedule = newSchedule;
}, { immediate: true });

// ---------------------------------------------------------------------
// ITINERARY HELPERS
// ---------------------------------------------------------------------
const addItineraryRow = () => { itineraryRows.value.push({ day: itineraryRows.value.length + 1, detail: '', morning: '-', lunch: '-', dinner: '-', hotel: '' }) }
const removeItineraryRow = (index) => { itineraryRows.value.splice(index, 1); itineraryRows.value.forEach((row, i) => { row.day = i + 1 }) }

// 🟢 ออโต้เพิ่มจำนวนแถวของตารางตามค่า "วัน" ที่กรอก
watch(() => formData.value.trip_days, (newDays) => {
  const targetDays = Number(newDays) || 0;
  const currentRows = itineraryRows.value.length;
  if (targetDays > currentRows) {
    for (let i = currentRows; i < targetDays; i++) {
      itineraryRows.value.push({ day: i + 1, detail: '', morning: '-', lunch: '-', dinner: '-', hotel: '' });
    }
  } else if (targetDays > 0 && targetDays < currentRows) {
    itineraryRows.value.splice(targetDays);
  }
});

const generateItineraryHtml = () => {
  const getIcon = (type) => {
    if (type === 'food') return '<img class="alignnone size-full wp-image-2874" src="https://panda.co.th//wp-content/uploads/2025/12/schedule-food.svg" width="20" height="20" />'
    if (type === 'plane') return '<img class="alignnone size-full wp-image-2873" src="https://panda.co.th//wp-content/uploads/2025/12/schedule-plane.svg" width="20" height="20" />'
    return '-'
  }
  let html = `<table>\n<thead>\n<tr>\n<th>วันที่</th>\n<th>กำหนดการ</th>\n<th>เช้า</th>\n<th>กลางวัน</th>\n<th>ค่ำ</th>\n<th>โรงแรม</th>\n</tr>\n</thead>\n<tbody>\n`
  itineraryRows.value.forEach(row => {
    html += `<tr><td style="text-align: center;">${row.day}</td><td>${row.detail || '-'}</td><td style="text-align: center;">${getIcon(row.morning)}</td><td style="text-align: center;">${getIcon(row.lunch)}</td><td style="text-align: center;">${getIcon(row.dinner)}</td><td>${row.hotel || '-'}</td></tr>\n`
  })
  return html + `</tbody>\n</table>`
}

const parseItineraryFromHtml = (htmlString) => {
  if (!htmlString || htmlString.trim() === '') return
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlString
  const rows = tempDiv.querySelectorAll('tbody tr')
  if (rows.length > 0) {
    itineraryRows.value = Array.from(rows).map((tr, index) => {
      const tds = tr.querySelectorAll('td')
      const checkIcon = (td) => {
        if (!td) return '-'
        const html = String(td.innerHTML || td.textContent || '').toLowerCase()
        if (html.includes('food') || html.includes('🍽️') || html.includes('อาหาร')) return 'food'
        if (html.includes('plane') || html.includes('✈️') || html.includes('บิน')) return 'plane'
        return '-'
      }
      const getCleanText = (td) => { return td ? (td.textContent ? td.textContent.replace(/\n/g, ' ').trim() : '') : '' }
      return {
        day: index + 1, detail: getCleanText(tds[1]), morning: checkIcon(tds[2]),
        lunch: checkIcon(tds[3]), dinner: checkIcon(tds[4]), hotel: getCleanText(tds[5])
      }
    })
  }
}

// ---------------------------------------------------------------------
// FETCH MASTER DATA & TOUR DATA
// ---------------------------------------------------------------------
const fetchMasterData = async () => {
  loadingAirlines.value = true; loadingDestinations.value = true; loadingFestivals.value = true; loadingMonths.value = true; loadingPricingCategories.value = true;
  try {
    const [airRes, destRes, festRes, monthRes, priceCatRes] = await Promise.all([
     publicApi.get('/airlines'), publicApi.get('/taxonomy-terms/travel_locations'),
      secureApi.get('/taxonomy-terms/festival'), secureApi.get('/taxonomy-terms/month'),
      secureApi.get('/taxonomy-terms/itinerary_pricing_category')
    ])
    if (airRes.data) airlinesList.value = airRes.data.map(item => ({ value: item.airline_key, label: item.airline_name }))
    if (destRes.data?.success) destinationsList.value = destRes.data.items
    if (festRes.data?.success) festivalsList.value = festRes.data.items
    if (monthRes.data?.success) monthsList.value = monthRes.data.items
    if (priceCatRes.data?.success) pricingCategoriesList.value = priceCatRes.data.items.map(item => ({ value: item.name, label: item.name }))
  } catch (e) { console.error(e) } finally {
    loadingAirlines.value = false; loadingDestinations.value = false; loadingFestivals.value = false; loadingMonths.value = false; loadingPricingCategories.value = false;
  }
}

const fetchTourDetail = async () => {
  isFetching.value = true; errorMessage.value = ''
  try {
   const response = await publicApi.get(`/tours/${tourId}`) 
    if (response.data && response.data.success) {
      const tour = response.data.data
      
      formData.value.title = tour.title || ''
      formData.value.trip_code = tour.trip_code || ''
      formData.value.status = tour.status || 'draft'
      formData.value.tour_airlines = tour.tour_airlines || ''
      formData.value.tour_hotel_rating = tour.tour_hotel_rating || '5'

      // 🟢 สกัดตัวเลขวัน/คืน แยกช่อง
      if (tour.trip_days_nights) {
        const match = tour.trip_days_nights.match(/(\d+)\s*วัน\s*(\d+)\s*คืน/);
        if (match) {
          formData.value.trip_days = match[1];
          formData.value.trip_nights = match[2];
        } else {
          formData.value.trip_days = tour.trip_days || '';
          formData.value.trip_nights = tour.trip_nights || '';
        }
      }

      // SEO & Content
      formData.value.excerpt = tour.excerpt || ''
      formData.value.content = tour.content || ''
      formData.value.overview = tour.overview || ''
      formData.value.wp_travel_overview = tour.overview || ''
      formData.value.tour_highlight = tour.tour_highlight || ''
      formData.value.rank_math_title = tour.rank_math_title || ''
      formData.value.rank_math_description = tour.rank_math_description || ''
      formData.value.rank_math_focus_keyword = tour.rank_math_focus_keyword || ''
      
      formData.value.destination_ids = Array.isArray(tour.destination_ids) ? tour.destination_ids : []
      formData.value.festival_ids = Array.isArray(tour.festival_ids) ? tour.festival_ids : []
      formData.value.month_ids = Array.isArray(tour.month_ids) ? tour.month_ids : []

      currentFeaturedImageUrl.value = tour.featured_image_url || ''
      currentPdfUrl.value = tour.tour_pdf_url || ''

      if (tour.trip_pricing_data) {
        const rawPricing = typeof tour.trip_pricing_data === 'string' ? JSON.parse(tour.trip_pricing_data) : tour.trip_pricing_data
        formData.value.trip_pricing_data = rawPricing.map(round => ({
          start_date: round.start_date || '', end_date: round.end_date || '',
          max_pax: round.max_pax || '', 
          prices: (round.prices && round.prices.length > 0) ? round.prices : [{ category: '', amount: '' }]
        }))
      } else {
        formData.value.trip_pricing_data = [{ start_date: '', end_date: '', max_pax: '', prices: [{ category: '', amount: '' }] }]
      }

      if (tour.tour_schedule_details) parseItineraryFromHtml(tour.tour_schedule_details)
      else itineraryRows.value = []
      
    } else {
      errorMessage.value = "ไม่พบข้อมูลทัวร์ที่ระบุ"
    }
  } catch (error) {
    console.error("ดึงข้อมูลล้มเหลว:", error)
    errorMessage.value = "ไม่สามารถโหลดข้อมูลทัวร์ได้"
  } finally {
    isFetching.value = false
  }
}

onMounted(async () => {
  await fetchMasterData()
  await fetchTourDetail()
})

// ---------------------------------------------------------------------
// PRICING HELPERS & DUPLICATE MODAL
// ---------------------------------------------------------------------
const addPricingRound = () => { formData.value.trip_pricing_data.push({ start_date: '', end_date: '', max_pax: '', prices: [{ category: '', amount: '' }] }) }
const removePricingRound = (i) => { formData.value.trip_pricing_data.splice(i, 1) }
const addPriceCategory = (ri) => { formData.value.trip_pricing_data[ri].prices.push({ category: '', amount: '' }) }
const removePriceCategory = (ri, pi) => { formData.value.trip_pricing_data[ri].prices.splice(pi, 1) }

const onPriceInput = (event, roundIndex, priceIndex) => {
  let val = event.target.value.replace(/\D/g, '');
  formData.value.trip_pricing_data[roundIndex].prices[priceIndex].amount = val ? Number(val) : '';
  event.target.value = val ? Number(val).toLocaleString('th-TH') : '';
};

// 🟢 Duplicate Modal
const showDuplicateModal = ref(false)
const duplicateCount = ref(1)
const currentDuplicateIndex = ref(null)

const openDuplicateModal = (index) => { currentDuplicateIndex.value = index; duplicateCount.value = 1; showDuplicateModal.value = true; }
const closeDuplicateModal = () => { showDuplicateModal.value = false; currentDuplicateIndex.value = null; }
const confirmDuplicate = () => {
  const index = currentDuplicateIndex.value;
  const count = duplicateCount.value;
  if (count < 1 || isNaN(count)) return alert('กรุณาระบุจำนวนรอบอย่างน้อย 1');

  const sourceRound = formData.value.trip_pricing_data[index];
  const copiedPrices = sourceRound.prices.map(price => ({ category: price.category, amount: price.amount }));

  const newRounds = [];
  for (let i = 0; i < count; i++) {
    newRounds.push({
      _id: Date.now() + Math.random() + i,
      start_date: sourceRound.start_date, end_date: sourceRound.end_date, max_pax: sourceRound.max_pax,
      prices: JSON.parse(JSON.stringify(copiedPrices))
    });
  }
  formData.value.trip_pricing_data.splice(index + 1, 0, ...newRounds);
  formData.value.trip_pricing_data = [...formData.value.trip_pricing_data];
  closeDuplicateModal();
}

// 🟢 ฟังก์ชันจัดเรียง (Sort)
const sortByDate = () => {
  formData.value.trip_pricing_data = [...formData.value.trip_pricing_data].sort((a, b) => {
    if (!a.start_date) return 1; if (!b.start_date) return -1;
    return new Date(a.start_date) - new Date(b.start_date);
  });
}
const sortByPrice = () => {
  formData.value.trip_pricing_data = [...formData.value.trip_pricing_data].sort((a, b) => {
    const priceA = a.prices[0]?.amount ? Number(a.prices[0].amount) : 9999999;
    const priceB = b.prices[0]?.amount ? Number(b.prices[0].amount) : 9999999;
    return priceA - priceB;
  });
}


// ---------------------------------------------------------------------
// FILE & SUBMIT
// ---------------------------------------------------------------------
const onPdfChange = (e) => { pdfFile.value = e.target.files?.[0] || null }
const onFeaturedImageChange = (e) => { 
  const file = e.target.files?.[0] || null
  featuredImageFile.value = file
  if (file) featuredImagePreview.value = URL.createObjectURL(file)
  else featuredImagePreview.value = null
}

// 🟢 ฟังก์ชันแปลงรูปภาพเป็น WebP
const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') || file.type === 'image/webp' || file.type === 'image/gif') return resolve(file)

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
          } else reject(new Error('แปลงรูปไม่สำเร็จ'))
        }, 'image/webp', quality) 
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

const uploadTourAssets = async () => {
  const form = new FormData()
  if (pdfFile.value) form.append('pdf', pdfFile.value)
  
  if (featuredImageFile.value) {
    uploadProgressText.value = 'กำลังแปลงรูปเป็น WebP...'
    const webpFeatured = await convertToWebP(featuredImageFile.value, 0.8)
    form.append('featuredImage', webpFeatured)
  }

  if (!pdfFile.value && !featuredImageFile.value) return null 

  uploadProgressText.value = 'กำลังอัปโหลดไฟล์...'
  const res = await secureApi.post('/upload-tour-assets', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 })
  return res.data
}

const updateTourData = async () => {
  errorMessage.value = ''; successMessage.value = ''; isSubmitting.value = true

  const payload = JSON.parse(JSON.stringify(formData.value))
  payload.tour_schedule_details = generateItineraryHtml()
  payload.overview = payload.wp_travel_overview;
  
  // นำตัวเลขประกอบกลับให้ WP
  payload.trip_days_nights = `${payload.trip_days || 0} วัน ${payload.trip_nights || 0} คืน`

  
  payload.trip_pricing_data = (payload.trip_pricing_data || [])
    .map(round => ({
      start_date: round.start_date || null, end_date: round.end_date || null, max_pax: round.max_pax || 0,
      prices: (round.prices || []).map(p => ({ category: p.category.trim(), amount: Number(p.amount) || 0 })).filter(p => p.category !== '' && p.amount > 0)
    })).filter(r => r.prices.length > 0)

  try {
    const uploaded = await uploadTourAssets()
    if (uploaded) {
      if (uploaded.pdf) payload.tour_pdf = uploaded.pdf.attachment_id
      if (uploaded.featuredImage) payload.featured_image_id = uploaded.featuredImage.attachment_id
    }

    uploadProgressText.value = 'กำลังบันทึกข้อมูลเข้าฐานข้อมูล...'
    const response = await secureApi.post(`/update-tour/${tourId}`, payload)

    if (response.data?.success) {
      successMessage.value = 'บันทึกการแก้ไขสำเร็จ!'
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => successMessage.value = '', 3000)
    } else {
      errorMessage.value = response.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต'
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = error.response?.data?.message || 'เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว'
  } finally {
    isSubmitting.value = false; uploadProgressText.value = ''
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

/* --- Global & Variables --- */
* { box-sizing: border-box; }
.tour-admin-container {
  --color-primary: #cc0000; --color-secondary: #1a1a1a; --color-success: #16a34a; --color-white: #ffffff;
  --color-bg: #f8fafc; --color-border: #e2e8f0; --color-text: #1e293b; --color-text-muted: #64748b;
  font-family: 'Kanit', sans-serif; background-color: var(--color-bg); color: var(--color-text); min-height: 100vh; padding: 30px; max-width: 1200px; margin: 0 auto;
}

/* --- Header --- */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); margin: 0; }
.page-subtitle { color: var(--color-text-muted); margin: 8px 0 0; font-weight: 300; }
.state-container { text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; color: var(--color-text-muted); font-size: 1.1rem; }

/* --- Forms & Grid --- */
.modern-form { display: flex; flex-direction: column; gap: 25px; }
.form-section { background: var(--color-white); border-radius: 12px; padding: 30px; border: 1px solid var(--color-border); }
.section-title { font-size: 1.25rem; font-weight: 600; color: var(--color-secondary); margin: 0 0 25px; display: flex; align-items: center; gap: 12px; }
.section-title .number { background: var(--color-primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; }
.section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 10px; }
.section-header-flex .section-title { margin-bottom: 0; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: 1 / -1; }
.form-group label { display: block; font-weight: 500; margin-bottom: 8px; color: var(--color-secondary); }
.required { color: var(--color-primary); }
.form-control { width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: 'Kanit', sans-serif; font-size: 1rem; transition: 0.2s; }
.form-control:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(204,0,0,0.1); }
.readonly-input { background: #f1f5f9; color: #64748b; cursor: not-allowed; }
.status-select.publish { color: #16a34a; background-color: #f0fdf4; }
.status-select.draft { color: #d97706; background-color: #fffbeb; }
.auto-calc-group { display: flex; align-items: center; gap: 12px; }
.text-center { text-align: center; }

/* --- SEO Box --- */
.seo-section { border-left: 4px solid #2563eb; background: #f8fafc; }

/* --- Quill Editor --- */
.quill-wrapper { background: white; border-radius: 8px; border: 1px solid #cbd5e1; overflow: hidden; }
.quill-wrapper :deep(.ql-container.ql-snow) { min-height: 200px; font-family: 'Kanit', sans-serif; font-size: 1.05rem; border: none; }
.quill-wrapper :deep(.ql-toolbar.ql-snow) { border-top: none; border-left: none; border-right: none; border-bottom: 1px solid #cbd5e1; background: #f8fafc; font-family: 'Kanit', sans-serif; }

/* --- Multiselect --- */
.modern-multiselect :deep(.multiselect-wrapper) { min-height: 48px; border-radius: 8px; border-color: var(--color-border); }
.modern-multiselect :deep(.multiselect-is-active) { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1); }
.modern-multiselect :deep(.multiselect-tag) { background: var(--color-primary); border-radius: 4px; font-weight: 400; }

/* --- Itinerary Builder --- */
.itinerary-builder { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.itinerary-header { background: #f8fafc; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); }
.itinerary-table-responsive { overflow-x: auto; }
.itinerary-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.itinerary-table th, .itinerary-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
.itinerary-table th { background-color: #f1f5f9; text-align: left; font-size: 0.95rem; color: var(--color-secondary); font-weight: 500; }
.day-badge { display: inline-flex; width: 32px; height: 32px; border-radius: 50%; background-color: var(--color-primary); color: #fff; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; }
.icon-select { padding-right: 20px; }

/* --- Pricing & Files --- */
.pricing-rounds-container { display: flex; flex-direction: column; gap: 20px; }
.pricing-round-card { border: 1px solid var(--color-border); border-radius: 12px; padding: 25px; background-color: #f8fafc; border-left: 4px solid var(--color-success); }
.round-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border); }
.price-tiers-list { margin-top: 20px; padding-top: 20px; border-top: 1px dashed var(--color-border); }
.price-row-grid { display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; align-items: center; margin-bottom: 12px; }

.file-input-wrapper { position: relative; overflow: hidden; display: inline-block; width: 100%; }
.form-control-file { position: absolute; font-size: 100px; opacity: 0; right: 0; top: 0; cursor: pointer; height: 100%; width: 100%; }
.file-custom-label { display: block; width: 100%; padding: 14px 15px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; color: #64748b; text-align: center; cursor: pointer; transition: all 0.2s; }
.file-custom-label:hover { border-color: var(--color-primary); color: var(--color-primary); background: #fff5f5; }
.current-file-preview, .current-image-preview { margin-bottom: 15px; padding: 15px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
.preview-img { max-width: 100%; height: auto; max-height: 200px; border-radius: 8px; object-fit: cover; }

/* --- Buttons & Actions --- */
.form-actions { display: flex; justify-content: flex-end; gap: 15px; padding: 20px 30px; background: white; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 -4px 10px rgba(0,0,0,0.02); }
.sticky-bottom { position: sticky; bottom: 20px; z-index: 100; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; font-family: 'Kanit', sans-serif; border: 1px solid transparent; transition: 0.2s; }
.btn-lg { padding: 12px 30px; font-size: 1.05rem; }
.btn-sm { padding: 8px 16px; font-size: 0.9rem; }
.btn-xs { padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; }
.submit-btn { min-width: 250px; }
.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover:not(:disabled) { background: #a30000; }
.btn-success { background: var(--color-success); color: white; }
.btn-success:hover { background: #15803d; }
.btn-outline-primary { border: 1px solid #2563eb; color: #2563eb; background: white; }
.btn-outline-primary:hover { background: #eff6ff; }
.btn-outline-secondary { border: 1px solid #cbd5e1; color: #475569; background: white; }
.btn-outline-secondary:hover { background: #f8fafc; }
.btn-outline-danger { background: #fef2f2; border-color: #fecaca; color: #ef4444; }
.btn-outline-danger:hover { background: #fee2e2; }
.btn-icon-danger { background: none; border: none; padding: 6px 12px; cursor: pointer; color: var(--color-primary); font-weight: 500; border-radius: 30px;}
.btn-icon-danger:hover { background-color: #fee2e2; }

/* --- Alerts & Modals --- */
.alert { position: fixed; top: 25px; right: 25px; padding: 16px 25px; border-radius: 8px; font-weight: 500; z-index: 1000; display: flex; align-items: center; gap: 10px; max-width: 350px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.alert-success { background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-left: 5px solid #16a34a; }
.alert-danger { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; border-left: 5px solid #ef4444; }

.custom-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.custom-modal-box { background: white; width: 90%; max-width: 400px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal-header { padding: 20px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; background: #f8fafc; }
.modal-header h3 { margin: 0; font-size: 1.15rem; color: var(--color-secondary); }
.btn-close { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
.modal-body { padding: 25px 20px; text-align: center; }
.counter-group { display: flex; align-items: center; justify-content: center; gap: 15px; margin: 10px auto; }
.btn-counter { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #cbd5e1; background: #f1f5f9; font-size: 1.2rem; cursor: pointer; }
.count-input { width: 80px; text-align: center; font-size: 1.2rem; border: none; border-bottom: 2px solid var(--color-primary); border-radius: 0; padding: 5px; }
.modal-footer { padding: 15px 20px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }

@media (max-width: 992px) { .grid-col-2 { grid-template-columns: 1fr; } }
</style>