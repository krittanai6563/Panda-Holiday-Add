<template>
  <div class="tour-admin-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="icon">✈️</span> บันทึกข้อมูลโปรแกรมทัวร์ใหม่
        </h1>
        <p class="page-subtitle">กรุณากรอกรายละเอียดให้ครบถ้วนเพื่อแสดงผลบนหน้าเว็บไซต์</p>
      </div>
      <div class="header-actions" style="display: flex; gap: 10px; align-items: center;">
        <input type="file" ref="csvFileInput" accept=".csv" style="display: none;" @change="handleCsvImport" />
        
        <button type="button" class="btn btn-outline-success" @click="$refs.csvFileInput.click()" :disabled="isImporting">
          <span v-if="isImporting">⏳ {{ importProgress }}</span>
          <span v-else>📥 นำเข้าทัวร์ (CSV)</span>
        </button>

        <router-link to="/" class="btn btn-outline-secondary">
          ⬅️ ย้อนกลับ
        </router-link>
      </div>
    </header>

    <form @submit.prevent="submitTourData" class="modern-form">

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">1</span> ข้อมูลทั่วไปและรูปภาพ (General Info & Media)</h2>

     <div>
          <input type="hidden" v-model="formData.trip_price_display" />
          <input type="hidden" v-model="formData.trip_schedule" />
          <input type="hidden" v-model="formData.trip_days_nights" />
        </div>

        <div class="form-grid grid-col-2">
          
          <div class="left-panel" style="display: flex; flex-direction: column; gap: 20px;">
            <div class="form-group">
              <label>ชื่อโปรแกรมทัวร์ (Title) <span class="required">*</span></label>
              <input type="text" v-model="formData.title" required placeholder="เช่น TG ซินเจียง คัชการ์ 9วัน8คืน..."
                class="form-control" />
            </div>

            <div class="form-group">
              <label>รหัสทัวร์ (Trip Code) <span class="required">*</span></label>
              <input type="text" v-model="formData.trip_code" required placeholder="เช่น KHG260509TG"
                class="form-control" />
            </div>

            <div class="form-group">
  <label>ระยะเวลา (วัน / คืน) <span class="required">*</span></label>
  <div class="auto-calc-group" style="display: flex; gap: 10px; align-items: center;">
    <input type="number" v-model="formData.trip_days" placeholder="ระบุวัน" class="form-control text-center" min="1" required />
    <span>วัน</span>
    <input type="number" v-model="formData.trip_nights" placeholder="ระบุคืน" class="form-control text-center" min="0" required />
    <span>คืน</span>
  </div>
</div>

            <div class="form-group">
              <label>สถานะการแสดงผล (Status) <span class="required">*</span></label>
              <select v-model="formData.status" class="form-control form-select status-select" :class="formData.status">
                <option value="publish">เผยแพร่ (Publish)</option>
                <option value="draft">ซ่อนไว้ก่อน (Draft)</option>
              </select>
            </div>
          </div>

          <div class="right-panel" style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 2px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; gap: 20px;">
            
            <div class="form-group" style="width: 100%; text-align: center;">
              <label style="margin-bottom: 10px; display: block;">
                รูปภาพปก (Featured Image)
                <span class="size-hint" style="display: block; font-weight: normal; color: #64748b; font-size: 0.85rem;">💡 แนะนำ: 1:1 (เช่น 1200x1200 px)</span>
              </label>
              
              <div class="file-input-wrapper image-input-wrapper" :class="{ 'has-preview': featuredImagePreview }">
                <input type="file" accept="image/*" @change="onFeaturedImageChange" class="form-control-file" />
                <div class="file-custom-label">
                  <template v-if="featuredImagePreview">
                    <img :src="featuredImagePreview" class="preview-img-full" />
                    <div class="hover-overlay">📷 คลิกเพื่อเปลี่ยนรูป</div>
                  </template>
                  <template v-else>
                    <div class="text-center" style="color: #64748b;">
                      <div style="font-size: 2.5rem; margin-bottom: 5px; opacity: 0.7;">🖼️</div>
                      <span>คลิกเพื่อเลือกรูปปก</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div style="width: 100%; height: 1px; background: #e2e8f0;"></div> <div class="form-group" style="width: 100%; text-align: center;">
              <label style="margin-bottom: 10px; display: block;">อัปโหลดไฟล์ PDF (โปรแกรมทัวร์)</label>
              <div class="file-input-wrapper" :class="{ 'has-file': pdfFile }">
                <input type="file" accept="application/pdf" @change="onPdfChange" class="form-control-file" />
                <div class="file-custom-label" style="min-height: auto; padding: 15px;">
                  <template v-if="pdfFile">
                    <div class="file-preview-info">
                      <span class="file-icon" style="font-size: 1.5rem;">📄</span>
                      <span class="file-name" style="margin-top: 5px;">{{ pdfFile.name }}</span>
                      <small class="file-size" style="color: #16a34a;">(${(pdfFile.size / 1024).toFixed(2)} KB)</small>
                    </div>
                  </template>
                  <template v-else>
                    <div style="color: #64748b;">
                      <span style="font-size: 1.5rem; margin-right: 5px; vertical-align: middle;">📁</span> 
                      <span>คลิกเพื่อเลือกไฟล์ PDF</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>

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
            <small v-if="loadingAirlines" class="loading-text">⏳ กำลังดึงข้อมูลสายการบิน...</small>
          </div>

          <div class="form-group">
            <label>ระดับโรงแรม (ดาว)</label>
            <select v-model="formData.tour_hotel_rating" class="form-control form-select">
              <option value="3">3 ดาว</option>
              <option value="4">4 ดาว</option>
              <option value="5">5 ดาว</option>

            </select>
          </div>

          <div class="form-group full-width">
            <label>จุดหมายปลายทาง (Destinations)</label>
            <Multiselect v-model="formData.destination_ids" :options="destinationsList" mode="tags" :searchable="true"
              valueProp="id" label="name" placeholder="พิมพ์เพื่อค้นหาจุดหมายปลายทาง..." :disabled="loadingDestinations"
              class="modern-multiselect" />
          </div>

          <div class="form-group">
            <label>เทศกาล (Festival)</label>
            <Multiselect v-model="formData.festival_ids" :options="festivalsList" mode="tags" :searchable="true"
              valueProp="id" label="name" placeholder="พิมพ์เพื่อค้นหาเทศกาล..." :disabled="loadingFestivals"
              class="modern-multiselect" />
          </div>

         <div class="form-group">
  <label>เดือนที่เดินทาง (Month Categories) <span style="color: #d97706; font-size: 0.85rem;">(เลือกอัตโนมัติ)</span></label>
  <Multiselect v-model="formData.month_ids" :options="monthsList" mode="tags" :searchable="false"
    valueProp="id" label="name" placeholder="ระบบจะคำนวณให้อัตโนมัติตามวันที่เดินทาง..." :disabled="true"
    class="modern-multiselect" />
</div>
        </div>
      </section>

      <section class="form-section shadow-sm pricing-section">
  <div class="section-header-flex">
    <h2 class="section-title"><span class="number">3</span> รอบเดินทางและราคา (Pricing Rounds)</h2>
    
    <div class="pricing-header-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
      <button type="button" @click="sortByDate" class="btn btn-outline-secondary btn-sm" title="เรียงจากวันที่ใกล้สุดไปไกลสุด">
        📅 เรียงตามวันที่
      </button>
      <button type="button" @click="sortByPrice" class="btn btn-outline-secondary btn-sm" title="เรียงจากราคาถูกสุดไปแพงสุด">
        💰 เรียงตามราคา
      </button>
      <button type="button" @click="addPricingRound" class="btn btn-success btn-sm">
        + เพิ่มรอบเดินทาง
      </button>
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
    <input type="date" v-model="round.start_date" :min="today" class="form-control"
      @change="autoCalculateEndDate(roundIndex)" />
  </div>
  
  <div class="form-group">
    <label>วันที่กลับ (End Date)</label>
    <input type="date" v-model="round.end_date" class="form-control readonly-input" 
      readonly placeholder="คำนวณอัตโนมัติ" />
  </div>

  <div class="form-group">
    <label>จำนวนรับได้สูงสุด (Max Pax.)</label>
    <input type="number" v-model="round.max_pax" placeholder="เช่น 20 หรือ 30" class="form-control" min="1" />
  </div>

  <div class="form-group">
    <label>ระยะเวลา (อิงจากข้อมูลหลัก)</label>
    <input type="text" 
      :value="formData.trip_days ? `${formData.trip_days} วัน ${formData.trip_nights} คืน` : '-'" 
      readonly class="form-control readonly-input" />
  </div>
</div>

      <div class="price-tiers-list">
        <label class="inner-label">ตารางราคา</label>
        <div v-for="(price, priceIndex) in round.prices" :key="priceIndex" class="price-row-grid">

          <select v-model="price.category" class="form-control form-control-sm form-select"
            :disabled="loadingPricingCategories">
            <option value="" disabled>-- เลือกหมวดหมู่ราคา --</option>
            <option v-for="cat in pricingCategoriesList" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>

          <input type="text" 
  :value="price.amount ? Number(price.amount).toLocaleString('th-TH') : ''"
  @input="onPriceInput($event, roundIndex, priceIndex)"
  placeholder="ราคา (เช่น 89,900)"
  class="form-control form-control-sm price-input" />

          <button type="button" @click="removePriceCategory(roundIndex, priceIndex)"
            class="btn btn-outline-danger btn-xs">
            ลบ
          </button>
        </div>

        <button type="button" @click="addPriceCategory(roundIndex)"
          class="btn btn-outline-success btn-xs mt-3 full-width-btn">
          + เพิ่มหมวดหมู่ราคา
        </button>
      </div>
    </div>
  </div>
</section>

      <section class="form-section shadow-sm program-details-section">
        <h2 class="section-title"><span class="number">4</span> รายละเอียดโปรแกรม (Program Details)</h2>

        <div class="form-group full-width">
          <label>ภาพรวมโปรแกรมสั้นๆ (Overview / Excerpt)</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.excerpt" contentType="html"
              placeholder="กรอกข้อความเกริ่นนำหรือภาพรวมสั้นๆ..." />
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>Overview</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.overview" contentType="html"
              placeholder="กรอกข้อมูล Overview..." />
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>เส้นทางไฮไลท์ (Highlight)</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.tour_highlight" contentType="html"
              placeholder="เช่น กรุงเทพ - เฉินตู - คัชการ์..." />
          </div>
        </div>

        <div class="form-group full-width itinerary-builder mt-4">
          <div class="itinerary-header">
            <label>แผนการเดินทางแบบย่อ (อิงตามวันที่เลือกจากด้านบน)</label>
            <button type="button" @click="addItineraryRow" class="btn btn-success btn-xs">
              + เพิ่มวันที่
            </button>
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
                  <td colspan="7" class="text-center empty-state-row">กรุณาเลือก "วันที่ไป-วันที่กลับ" ในขั้นตอนที่ 3
                    เพื่อสร้างตารางอัตโนมัติ</td>
                </tr>
                <tr v-for="(row, index) in itineraryRows" :key="index">
                  <td class="text-center font-bold">{{ row.day }}</td>
                  <td>
                    <input type="text" v-model="row.detail" placeholder="เช่น กรุงเทพฯ - เฉิงตู"
                      class="form-control form-control-sm" />
                  </td>
                  <td>
                    <select v-model="row.morning" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option>
                      <option value="food">🍽️ อาหาร</option>
                      <option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="row.lunch" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option>
                      <option value="food">🍽️ อาหาร</option>
                      <option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="row.dinner" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option>
                      <option value="food">🍽️ อาหาร</option>
                      <option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" v-model="row.hotel" placeholder="ชื่อโรงแรม"
                      class="form-control form-control-sm" />
                  </td>
                  <td class="text-center">
                    <button type="button" @click="removeItineraryRow(index)" class="btn-icon-danger"
                      title="ลบข้อมูลวันนี้">
                      ❌
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- <div class="form-group full-width mt-4">
          <label>รายละเอียดเพิ่มเติมทั้งหมด (Full Content)</label>
          <div class="quill-wrapper content-quill">
            <QuillEditor theme="snow" v-model:content="formData.content" contentType="html"
              placeholder="กรอกรายละเอียดเงื่อนไขต่างๆ แบบจัดเต็ม..." />
          </div>
        </div> -->
      </section>

    

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">6</span> ตั้งค่า SEO (Rank Math)</h2>

        <div class="form-grid grid-col-2">
          <div class="form-group full-width-mobile">
            <label>คีย์เวิร์ดหลัก (Focus Keyword)</label>
            <input type="text" v-model="formData.rank_math_focus_keyword" placeholder="เช่น ทัวร์จีน, ทัวร์ซินเจียง" class="form-control" />
          </div>

          <div class="form-group full-width-mobile">
            <label>
              ชื่อไตเติ้ล SEO (SEO Title)
            </label>
            <input type="text" v-model="formData.rank_math_title" placeholder="เว้นว่างไว้เพื่อใช้ค่าเริ่มต้นของระบบ" class="form-control" />
            <small style="color: #64748b; font-size: 0.8rem; margin-top: 4px;">💡 ถ้าเว้นว่าง Rank Math จะดึงชื่อทัวร์ไปใช้โดยอัตโนมัติ</small>
          </div>

          <div class="form-group full-width mt-3">
            <label>
              คำอธิบาย SEO (Meta Description)
              <span class="size-hint" style="float: right; font-weight: normal; color: #64748b;">{{ formData.rank_math_description.length }} / 160 ตัวอักษร</span>
            </label>
            <textarea v-model="formData.rank_math_description" rows="3" placeholder="พิมพ์คำอธิบายดึงดูดลูกค้าที่จะแสดงบนหน้าค้นหาของ Google..." class="form-control" style="resize: vertical;"></textarea>
          </div>
        </div>
      </section>

     <div class="form-actions sticky-bottom">
  <button type="button" @click="resetForm" class="btn btn-outline-secondary btn-lg">ล้างข้อมูล</button>
  
  <button type="submit" class="btn btn-lg submit-btn" 
    :class="isFormComplete ? 'btn-primary' : 'btn-warning'" 
    :disabled="isSubmitting">
    
    <span v-if="isSubmitting">⏳ {{ uploadProgressText || 'กำลังบันทึก...' }}</span>
    <template v-else>
      <span v-if="isFormComplete">💾 บันทึกโปรแกรมทัวร์</span>
      <span v-else>📝 บันทึกแบบร่าง</span>
    </template>
  </button>
</div>

      <!-- <footer class="form-actions">
        <button type="button" @click="resetForm" class="btn btn-secondary" :disabled="isSubmitting">
          ล้างข้อมูล
        </button>
        <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting">⏳ {{ uploadProgressText || 'กำลังบันทึก...' }}</span>
          <span v-else>💾 บันทึกโปรแกรมทัวร์</span>
        </button>
      </footer> -->
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
      <div v-if="showPreviewModal" class="custom-modal-overlay" @click.self="cancelImport">
        <div class="custom-modal-box preview-modal-large shadow-lg">
          
          <div class="modal-header-premium">
            <div class="header-content">
              <span class="batch-count">รายการที่ {{ currentPreviewIndex + 1 }} / {{ parsedTours.length }}</span>
              <h3>ตรวจสอบรายละเอียดโปรแกรมทัวร์</h3>
            </div>
            <button type="button" class="btn-close-white" @click="cancelImport">✕</button>
          </div>
          
          <div class="modal-body-premium" v-if="currentPreviewTour">
            
            <div class="preview-card main-info-card">
              <div class="trip-badge">TRIP CODE: {{ currentPreviewTour.trip_code }}</div>
              <h2 class="preview-title">{{ currentPreviewTour.title }}</h2>
            </div>

            <div class="preview-grid-container">
              <div class="preview-col-media">
                <div class="media-card">
                  <div class="image-container">
                    <img 
                      :src="getDirectDriveLink(currentPreviewTour.featured_image_url)" 
                      class="img-preview-main"
                      @error="$event.target.src='https://panda.co.th//wp-content/uploads/2026/03/tour-panda-defalt.webp'" 
                    />
                  </div>
                  <div class="pdf-link-container">
                    <a v-if="currentPreviewTour.tour_pdf_url" :href="currentPreviewTour.tour_pdf_url" target="_blank" class="btn-pdf-preview">
                      <i class="icon-file">📄</i> ดูไฟล์โปรแกรมทัวร์ (PDF)
                    </a>
                    <div v-else class="no-file-badge">ไม่มีไฟล์ PDF</div>
                  </div>
                </div>
              </div>

              <div class="preview-col-specs">
                <div class="specs-card">
                  <div class="spec-item">
                    <span class="spec-label">📅 ระยะเวลา</span>
                    <span class="spec-value">{{ currentPreviewTour.trip_days }} วัน {{ currentPreviewTour.trip_nights }} คืน</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">⭐️ โรงแรม</span>
                    <span class="spec-value">{{ currentPreviewTour.tour_hotel_rating }} ดาว</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">✈️ สายการบิน</span>
                    <span class="spec-value">{{ currentPreviewTour.tour_airlines || '-' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">📍 เส้นทาง</span>
                    <span class="spec-value">{{ currentPreviewTour.destinations_text || '-' }}</span>
                  </div>
                  <div class="spec-item highlight-spec">
                    <span class="spec-label">🎉 เทศกาล</span>
                    <span class="spec-value">{{ currentPreviewTour.festivals_text || '-' }}</span>
                  </div>
                  <div class="spec-item highlight-spec">
                    <span class="spec-label">🗓️ เดือนที่เดินทาง</span>
                    <span class="spec-value">{{ currentPreviewTour.months_text || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="preview-text-grid">
              <div class="text-card">
                <h4 class="card-subtitle">📝 ภาพรวมโปรแกรม (Excerpt)</h4>
                <p class="text-content-small">{{ currentPreviewTour.excerpt || '-' }}</p>
              </div>
              <div class="text-card">
                <h4 class="card-subtitle">🌟 ไฮไลท์โปรแกรม (Highlight)</h4>
                <div class="text-content-html" v-html="currentPreviewTour.tour_highlight || '-'"></div>
              </div>
            </div>

            <div class="preview-card mt-3">
              <h4 class="card-subtitle">📖 ข้อมูลภาพรวม (Overview)</h4>
              <div class="text-content-html-large" v-html="currentPreviewTour.overview || '-'"></div>
            </div>

            <div class="preview-card mt-4">
              <h4 class="card-subtitle mb-3">📍 ตารางกำหนดการเดินทาง</h4>
              <div class="table-responsive">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th width="60" class="text-center">วันที่</th>
                      <th>รายการโปรแกรม</th>
                      <th width="70" class="text-center">เช้า</th>
                      <th width="70" class="text-center">กลางวัน</th>
                      <th width="70" class="text-center">ค่ำ</th>
                      <th width="200">โรงแรมที่พัก</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in currentPreviewTour.itineraryRows" :key="idx">
                      <td class="text-center"><strong>{{ row.day }}</strong></td>
                      <td>{{ row.detail }}</td>
                      <td class="text-center meal-icon-cell" v-html="getMealIconHtml(row.morning)"></td>
                      <td class="text-center meal-icon-cell" v-html="getMealIconHtml(row.lunch)"></td>
                      <td class="text-center meal-icon-cell" v-html="getMealIconHtml(row.dinner)"></td>
                      <td class="hotel-cell">{{ row.hotel }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="preview-card pricing-preview-card mt-4">
              <h4 class="card-subtitle mb-3">💰 รอบวันเดินทางและราคา</h4>
              <div class="table-responsive">
                <table class="modern-table pricing-table">
                  <thead>
                    <tr>
                      <th>วันเดินทาง (ไป - กลับ)</th>
                      <th width="120" class="text-center">ระยะเวลา</th> <th width="110" class="text-center">จำนวนที่รับ</th>
                      <th>ราคาเริ่มต้น / ท่าน</th>
                    </tr>
                  </thead>
                <tbody>
                    <tr v-for="(round, idx) in currentPreviewTour.trip_pricing_data" :key="idx">
                      <td><strong>{{ round.start_date }}</strong> ถึง <strong>{{ round.end_date }}</strong></td>
                      
                      <td class="text-center" style="color: #475569; font-weight: 500;">
                        {{ currentPreviewTour.trip_days }} วัน 
                        {{ currentPreviewTour.trip_nights }} คืน
                      </td>
                      
                      <td class="text-center">{{ round.max_pax }} ที่นั่ง</td>
                      <td class="price-cell">
                        <div v-for="(p, pIdx) in round.prices" :key="pIdx" class="price-row">
                          <span class="p-cat">{{ p.category }}:</span>
                          <span class="p-val">{{ Number(p.amount).toLocaleString('th-TH') }} ฿</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div class="modal-footer-premium">
            <div class="nav-buttons">
              <button type="button" class="btn-nav" @click="prevPreview" :disabled="currentPreviewIndex === 0">⬅️ ย้อนกลับ</button>
              <button type="button" class="btn-nav" @click="nextPreview" :disabled="currentPreviewIndex === parsedTours.length - 1">ถัดไป ➡️</button>
            </div>
            <div class="action-buttons">
              <button type="button" class="btn-cancel-import" @click="cancelImport">ยกเลิกทั้งหมด</button>
              <button type="button" class="btn-confirm-import" @click="confirmImport">✅ ยืนยันนำเข้าทัวร์ทั้งหมด</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isImporting" class="custom-modal-overlay import-progress-overlay">
        <div class="custom-modal-box progress-modal-box shadow-lg">
          <div class="modal-body text-center">
            
            <template v-if="!isImportComplete">
              <div class="spinner-container">
                <div class="cloud-upload-icon">☁️</div>
                <div class="loading-ring"></div>
              </div>
              
              <h3 class="progress-title mt-4">กำลังนำเข้าข้อมูลทัวร์...</h3>
              <p class="progress-status-text">{{ importProgress }}</p>

              <div class="progress-bar-container">
                <div class="progress-bar-fill" :style="{ width: importPercentage + '%' }"></div>
              </div>
              
              <div class="progress-percentage">
                <strong>{{ importPercentage }}%</strong>
              </div>

              <div class="warning-box mt-4" style="background: #fffbeb; padding: 12px; border-radius: 8px; color: #d97706; text-align: left; font-size: 0.85rem; border-left: 4px solid #f59e0b;">
                <span class="alert-icon" style="margin-right: 5px;">⚠️</span> 
                <small>กรุณาอย่าปิดหน้าต่างนี้ หรือรีเฟรชหน้าเว็บจนกว่าระบบจะทำงานเสร็จสิ้น เพื่อป้องกันข้อมูลสูญหายระหว่างทาง</small>
              </div>
            </template>

            <template v-else>
              <div class="warning-icon-large" style="background: #f0fdf4; color: #16a34a; box-shadow: 0 0 0 8px rgba(22, 163, 74, 0.1);">
                <span style="font-size: 2.5rem;">✅</span>
              </div>
              <h3 class="progress-title mt-4" style="color: #166534;">นำเข้าข้อมูลเสร็จสิ้น!</h3>
              <p class="progress-status-text" style="font-size: 1.1rem; color: #475569; margin-bottom: 25px;">
                {{ importSummaryText }}
              </p>
              
              <button type="button" class="btn btn-success btn-lg" style="width: 100%;" @click="closeImportProgressModal">
                ตกลง
              </button>
            </template>

          </div>
        </div>
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

    <transition name="fade">
  <div v-if="showDateAlert" class="modern-alert-banner">
    <div class="alert-icon">⚠️</div>
    <div class="alert-text">
      <strong>ไม่สามารถคำนวณวันกลับได้!</strong> <br/>
      กรุณาระบุ "ระยะเวลา (วัน/คืน)" ในส่วนข้อมูลทั่วไป (ข้อ 1) ให้เรียบร้อยก่อนเลือกวันเดินทาง
    </div>
    <button @click="showDateAlert = false" class="close-alert-btn">✕</button>
  </div>
</transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import Papa from 'papaparse';


// ---------------------------------------------------------------------
// DEFAULT FORM
// ---------------------------------------------------------------------
const createDefaultFormData = () => ({
  title: '',
  trip_code: '',
  trip_price_display: '',
  trip_days_nights: '',
  trip_days: '',   // เพิ่มตัวเก็บจำนวนวัน
  trip_nights: '', // เพิ่มตัวเก็บจำนวนคืน
  trip_schedule: '',
  tour_airlines: '',
  tour_hotel_rating: '5',
  excerpt: '',
  content: '',
  overview: '',
  trip_outline: '',
  tour_highlight: '',
  tour_schedule_details: '',
  status: 'publish',

  rank_math_focus_keyword: '',
  rank_math_title: '',
  rank_math_description: '',

  destination_ids: [],
  festival_ids: [],
  month_ids: [],

  tour_pdf: 0,
  featured_image_id: 0,
  gallery_image_ids: [],


  trip_pricing_data: [
    {
      _id: Date.now(),
      start_date: '',
      end_date: '',
      max_pax: '',
      prices: [
        { category: 'ผู้ใหญ่ (พักเดี่ยว)', amount: '' },
        { category: 'ผู้ใหญ่ (พักคู่)', amount: '' }
      ]
    }
  ]
})

const formData = ref(createDefaultFormData())
const today = new Date().toISOString().split('T')[0]
const showDateAlert = ref(false);

// ---------------------------------------------------------------------
// ITINERARY BUILDER STATE
// ---------------------------------------------------------------------
const itineraryRows = ref([])
const featuredImagePreview = ref(null)
const galleryPreviews = ref([])

const addItineraryRow = () => {
  itineraryRows.value.push({
    day: itineraryRows.value.length + 1,
    detail: '', morning: '-', lunch: '-', dinner: '-', hotel: ''
  })
}

const removeItineraryRow = (index) => {
  itineraryRows.value.splice(index, 1)
  itineraryRows.value.forEach((row, i) => { row.day = i + 1 })
}

const getNextDay = (dateString) => {
  if (!dateString) return today
  const date = new Date(dateString)
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}


const showDuplicateModal = ref(false)
const duplicateCount = ref(1)
const currentDuplicateIndex = ref(null)

const openDuplicateModal = (index) => { 
  currentDuplicateIndex.value = index; 
  duplicateCount.value = 1; 
  showDuplicateModal.value = true; 
}

const closeDuplicateModal = () => { 
  showDuplicateModal.value = false; 
  currentDuplicateIndex.value = null; 
}


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
      start_date: sourceRound.start_date, 
      end_date: sourceRound.end_date, 
      max_pax: sourceRound.max_pax,
      prices: JSON.parse(JSON.stringify(copiedPrices))
    });
  }
  
  // แทรกข้อมูลที่ก็อปปี้ต่อท้ายรอบที่เลือกไว้
  formData.value.trip_pricing_data.splice(index + 1, 0, ...newRounds);
  formData.value.trip_pricing_data = [...formData.value.trip_pricing_data];
  
  closeDuplicateModal(); // ปิดหน้าต่าง
}



// 🟢 1. ฟังก์ชันคำนวณวันที่กลับอัตโนมัติ
const autoCalculateEndDate = (roundIndex) => {
  const round = formData.value.trip_pricing_data[roundIndex];
  const days = parseInt(formData.value.trip_days);

  if (!round.start_date) {
    round.end_date = '';
    return;
  }

  // ตรวจสอบว่าได้กรอกจำนวนวันในส่วนที่ 1 หรือยัง
  if (!days || days <= 0) {
    // 🟢 เปิดการแสดงผลแจ้งเตือน
    showDateAlert.value = true;
    round.start_date = '';
    
    // ตั้งเวลาให้แจ้งเตือนหายไปเองใน 5 วินาที
    setTimeout(() => {
      showDateAlert.value = false;
    }, 5000);
    
    return;
  }
  showDateAlert.value = false;

  // 🟢 หั่น String YYYY-MM-DD ออกมาสร้าง Date ตรงๆ เพื่อป้องกัน Timezone Bug
  const [yearStr, monthStr, dayStr] = round.start_date.split('-');
  const start = new Date(yearStr, monthStr - 1, dayStr); 
  
  // บวกจำนวนวัน (ลบ 1 เพราะนับวันเริ่มต้นเป็นวันที่ 1 ด้วย)
  start.setDate(start.getDate() + (days - 1));
  
  // จัดรูปแบบกลับเป็น YYYY-MM-DD ให้ Input
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  
  round.end_date = `${year}-${month}-${day}`;
};

// 🟢 2. Watcher คอยดูการเปลี่ยนแปลงของ "จำนวนวัน (trip_days)"
watch(() => formData.value.trip_days, (newDays) => {
  const targetDays = Number(newDays) || 0;
  
  // 2.1 จัดการเพิ่ม/ลด แถวตารางแผนการเดินทาง (Itinerary)
  const currentRows = itineraryRows.value.length;
  if (targetDays > currentRows) {
    for (let i = currentRows; i < targetDays; i++) {
      itineraryRows.value.push({ day: i + 1, detail: '', morning: '-', lunch: '-', dinner: '-', hotel: '' });
    }
  } else if (targetDays >= 0 && targetDays < currentRows) {
    itineraryRows.value.splice(targetDays);
  }

  // 2.2 อัปเดตวันที่กลับให้ทุกรอบเดินทางที่มีการเลือก "วันที่ไป" ไว้แล้ว
  if (formData.value.trip_pricing_data?.length > 0) {
    formData.value.trip_pricing_data.forEach((round, index) => {
      if (round.start_date) {
        autoCalculateEndDate(index);
      }
    });
  }
});

// 🟢 ฟังก์ชันเลือก "เดือนที่เดินทาง" อัตโนมัติตามวันที่ในตารางราคา
const autoSelectMonths = () => {
  // 1. ตรวจสอบก่อนว่าดึงข้อมูล Master Data ของเดือนมาหรือยัง
  if (!monthsList.value.length) return;

  // 2. ดึงลำดับเดือน (0-11) ที่ไม่ซ้ำกันจากทุกรอบเดินทาง
  const selectedMonthIndices = new Set();
  formData.value.trip_pricing_data.forEach(round => {
    if (round.start_date) {
      const date = new Date(round.start_date);
      if (!isNaN(date.getTime())) {
        selectedMonthIndices.add(date.getMonth()); // จะได้เลข 0-11
      }
    }
  });

  // รายชื่อเดือนภาษาไทย (แบบเต็ม) เพื่อใช้ค้นหาใน monthsList
  const fullThaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const matchedIds = [];

  // 3. วนลูปเดือนที่พบ เพื่อไปหา ID ใน monthsList
  selectedMonthIndices.forEach(monthIdx => {
    const targetMonthName = fullThaiMonths[monthIdx];
    
    // ค้นหาใน monthsList ว่ามีชื่อเดือนที่ตรงกันไหม (เช็คทั้งแบบเต็มและแบบย่อ)
    const foundMonth = monthsList.value.find(m => 
      m.name.includes(targetMonthName) || targetMonthName.includes(m.name)
    );

    if (foundMonth) {
      matchedIds.push(foundMonth.id);
    }
  });

  // 4. อัปเดตค่าลงใน month_ids ของฟอร์ม
  formData.value.month_ids = matchedIds;
};

// 🟢 สั่งให้ทำงานทุกครั้งที่มีการเปลี่ยนวันที่ในตารางราคา (ใช้ Deep Watch)
watch(() => formData.value.trip_pricing_data, () => {
  autoSelectMonths();
}, { deep: true });

const generateItineraryHtml = () => {
  const getIconHtml = (type) => {
    if (type === 'food') return '<img class="alignnone size-full wp-image-2874" src="https://panda.co.th//wp-content/uploads/2025/12/schedule-food.svg" alt="" width="20" height="20" />'
    if (type === 'plane') return '<img class="alignnone size-full wp-image-2873" src="https://panda.co.th//wp-content/uploads/2025/12/schedule-plane.svg" alt="" width="20" height="20" />'
    return '-'
  }

  let html = `<table>\n<thead>\n<tr>\n<th>วันที่</th>\n<th>กำหนดการ</th>\n<th>เช้า</th>\n<th>กลางวัน</th>\n<th>ค่ำ</th>\n<th>โรงแรม</th>\n</tr>\n</thead>\n<tbody>\n`

  itineraryRows.value.forEach(row => {
    html += `<tr>\n`
    html += `<td style="text-align: center;">${row.day}</td>\n`
    html += `<td style="text-align: left;">${row.detail || '-'}</td>\n`
    html += `<td style="text-align: center;">${getIconHtml(row.morning)}</td>\n`
    html += `<td style="text-align: center;">${getIconHtml(row.lunch)}</td>\n`
    html += `<td style="text-align: center;">${getIconHtml(row.dinner)}</td>\n`
    html += `<td>${row.hotel || '-'}</td>\n`
    html += `</tr>\n`
  })

  html += `</tbody>\n</table>`
  return html
}

// ---------------------------------------------------------------------
// FILE STATE & FORM STATE
// ---------------------------------------------------------------------
const pdfFile = ref(null)
const featuredImageFile = ref(null)
const galleryFiles = ref([])

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const uploadProgressText = ref('')

const airlinesList = ref([])
const loadingAirlines = ref(false)
const destinationsList = ref([])
const loadingDestinations = ref(false)
const festivalsList = ref([])
const loadingFestivals = ref(false)
const monthsList = ref([])
const loadingMonths = ref(false)

const pricingCategoriesList = ref([])
const loadingPricingCategories = ref(false)

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------
const publicApi = axios.create({
  baseURL: 'https://panda.co.th/wp-json/blupaper/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
})
// ตรวจสอบในไฟล์ src/views/TourList.vue และ TourDetail.vue
const secureApi = axios.create({
  // 🟢 เปลี่ยนจาก dev1.blupaperdev.com เป็น panda.co.th
  baseURL: 'https://panda.co.th/wp-json/blupaper/v1', 
  timeout: 60000
})
// 🟢 1. ฟังก์ชันคัดลอกรอบเดินทาง (ดึงมาแค่ราคา ไม่ดึงวันที่)
// 🟢 ฟังก์ชันคัดลอกรอบเดินทาง (แบบระบุจำนวนได้)
const duplicatePricingRound = (index) => {
  // 1. ถามผู้ใช้ว่าต้องการคัดลอกกี่รอบ (ค่าเริ่มต้นคือ 1 รอบ)
  const countStr = window.prompt('ต้องการคัดลอกราคารอบนี้กี่รอบ? (ระบุตัวเลข)', '1');
  
  // ถ้ากดยกเลิก (Cancel) ให้หยุดการทำงาน
  if (countStr === null) return; 

  // แปลงค่าที่กรอกเป็นตัวเลข
  const count = parseInt(countStr, 10);
  
  // ดักจับ Error กรณีไม่ได้กรอกตัวเลข หรือกรอกค่าน้อยกว่า 1
  if (isNaN(count) || count <= 0) {
    alert('❌ กรุณากรอกตัวเลขจำนวนรอบที่ถูกต้อง (เช่น 1, 2, 5)');
    return;
  }

  const sourceRound = formData.value.trip_pricing_data[index];
  
  // 2. คัดลอกหมวดหมู่และราคาต้นฉบับ
  const copiedPrices = sourceRound.prices.map(price => ({
    category: price.category,
    amount: price.amount
  }));

  // 3. เตรียม Array สำหรับเก็บรอบใหม่ตามจำนวนที่ระบุ
  const newRounds = [];
  for (let i = 0; i < count; i++) {
    newRounds.push({
      _id: Date.now() + Math.random() + i, // 🟢 สร้าง ID จำลองไม่ให้ซ้ำกัน
      start_date: sourceRound.start_date,  // ก๊อปปี้วันที่ต้นฉบับมาให้ดูเป็นตัวอย่าง
      end_date: sourceRound.end_date,
      // ต้อง Deep Copy ราคาอีกรอบ เพื่อไม่ให้กล่องใหม่ทุกกล่องเชื่อมโยงข้อมูลกันเอง
      prices: JSON.parse(JSON.stringify(copiedPrices)) 
    });
  }

  // 4. แทรกรอบใหม่ทั้งหมดเข้าไปต่อท้ายกล่องที่กดคัดลอก (ใช้ Spread Operator ...)
  formData.value.trip_pricing_data.splice(index + 1, 0, ...newRounds);
  
  // 5. บังคับให้ Vue รีเฟรชหน้าจอใหม่ทั้งหมด
  formData.value.trip_pricing_data = [...formData.value.trip_pricing_data];
}

const sortByDate = () => {
  const sorted = [...formData.value.trip_pricing_data].sort((a, b) => {
    if (!a.start_date) return 1; 
    if (!b.start_date) return -1;
    return new Date(a.start_date) - new Date(b.start_date);
  });
  // นำค่าที่เรียงเสร็จแล้วยัดกลับไป เพื่อบังคับหน้าจอรีเฟรช
  formData.value.trip_pricing_data = sorted;
}

// 🟢 4. ฟังก์ชันจัดเรียงตาม "ราคา"
const sortByPrice = () => {
  const sorted = [...formData.value.trip_pricing_data].sort((a, b) => {
    const priceA = a.prices[0]?.amount ? Number(a.prices[0].amount) : 9999999;
    const priceB = b.prices[0]?.amount ? Number(b.prices[0].amount) : 9999999;
    return priceA - priceB;
  });
  // นำค่าที่เรียงเสร็จแล้วยัดกลับไป เพื่อบังคับหน้าจอรีเฟรช
  formData.value.trip_pricing_data = sorted;
}

const makeDirectLinkForBackend = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([^/?#]+)|id=([^&?#]+)/);
    if (match) {
      const fileId = match[1] || match[2];
      // ส่งเป็น export=download เพื่อให้ API หลังบ้านโหลดเข้า Media Library ได้ง่าย
      return `https://drive.google.com/uc?id=${fileId}&export=download`; 
    }
  }
  return url;
};

// 1.2 ฟังก์ชันคำนวณวัน-คืน (ป้องกันการบวกสะสม)
const calculateDaysAndNights = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return { days: 0, nights: 0 };
  
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { days: 0, nights: 0 };
  
  const timeDiff = end.getTime() - start.getTime();
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (diffDays >= 0) {
    return {
      days: diffDays + 1,
      nights: diffDays
    };
  }
  return { days: 0, nights: 0 };
};

const mainRoundDuration = computed(() => {
  const firstRound = formData.value.trip_pricing_data?.[0]
  if (!firstRound) return { days: 0, nights: 0 }
  return calculateDaysAndNights(firstRound.start_date, firstRound.end_date)
})

watch(mainRoundDuration, (duration) => {
  if (duration.days > 0) {
    formData.value.trip_days_nights = `${duration.days} วัน ${duration.nights} คืน`

    const targetDays = duration.days;
    const currentRows = itineraryRows.value.length;

    if (targetDays > currentRows) {
      for (let i = currentRows; i < targetDays; i++) {
        itineraryRows.value.push({ day: i + 1, detail: '', morning: '-', lunch: '-', dinner: '-', hotel: '' })
      }
    } else if (targetDays < currentRows) {
      itineraryRows.value.splice(targetDays);
    }
  } else {
    formData.value.trip_days_nights = ''
    itineraryRows.value = []
  }
}, { immediate: true })

// ---------------------------------------------------------------------
// FILE INPUT HANDLERS & FETCH DATA
// ---------------------------------------------------------------------
const onPdfChange = (event) => {
  pdfFile.value = event.target.files?.[0] || null
}
const onFeaturedImageChange = (event) => {
  const file = event.target.files?.[0] || null
  featuredImageFile.value = file
  if (file) {
    featuredImagePreview.value = URL.createObjectURL(file) // สร้าง URL พรีวิว
  } else {
    featuredImagePreview.value = null
  }
}
const onGalleryImagesChange = (event) => {
  const files = Array.from(event.target.files || [])
  galleryFiles.value = files
  galleryPreviews.value = files.map(file => URL.createObjectURL(file))
}

const fetchAirlines = async () => {
  loadingAirlines.value = true
  try {
    const res = await publicApi.get('/airlines')
    if (res.data && Array.isArray(res.data)) airlinesList.value = res.data.map(item => ({ value: item.airline_key, label: item.airline_name }))
  } catch (err) { console.error(err) } finally { loadingAirlines.value = false }
}

const fetchDestinations = async () => {
  loadingDestinations.value = true
  try {
    const res = await publicApi.get('/taxonomy-terms/travel_locations')
    if (res.data?.success) destinationsList.value = res.data.items
  } catch (err) { console.error(err) } finally { loadingDestinations.value = false }
}

const fetchFestivals = async () => {
  loadingFestivals.value = true
  try {
    const res = await publicApi.get('/taxonomy-terms/festival')
    if (res.data?.success) festivalsList.value = res.data.items
  } catch (err) { console.error(err) } finally { loadingFestivals.value = false }
}

// const fetchMonths = async () => {
//   loadingMonths.value = true
//   try {
//     const res = await publicApi.get('/taxonomy-terms/month')
//     if (res.data?.success) monthsList.value = res.data.items
//   } catch (err) { console.error(err) } finally { loadingMonths.value = false }
// }

const fetchMonths = async () => {
  loadingMonths.value = true
  try {
    const res = await publicApi.get('/taxonomy-terms/month')
    if (res.data?.success) {
      // 🟢 วนลูปเช็คชื่อเดือน ถ้าเจอ "เมษายน" ให้เพิ่ม disabled: true เข้าไป
      monthsList.value = res.data.items.map(month => {
        if (month.name.includes('เมษายน')) {
          return { ...month, disabled: true } // บล็อกไม่ให้ User แก้ไขตัวนี้
        }
        return month;
      });
      
      autoSelectMonths(); 
    }
  } catch (err) { 
    console.error(err) 
  } finally { 
    loadingMonths.value = false 
  }
}
const fetchPricingCategories = async () => {
  loadingPricingCategories.value = true
  try {
    const res = await publicApi.get('/taxonomy-terms/itinerary_pricing_category')
    if (res.data?.success) {
      pricingCategoriesList.value = res.data.items.map(item => ({
        value: item.name,
        label: item.name
      }))
    }
  } catch (err) {
    console.error(err)
  } finally {
    loadingPricingCategories.value = false
  }
}

onMounted(() => {
  fetchAirlines();
  fetchDestinations();
  fetchFestivals();
  fetchMonths();
  fetchPricingCategories();
})

// ---------------------------------------------------------------------
// FORM HELPERS & SUBMIT
// ---------------------------------------------------------------------
const addPricingRound = () => {
  formData.value.trip_pricing_data.push({
    _id: Date.now() + Math.random(),
    start_date: '',
    end_date: '',
    max_pax: '',
    prices: [
      { category: 'ผู้ใหญ่ (พักเดี่ยว)', amount: '' },
      { category: 'ผู้ใหญ่ (พักคู่)', amount: '' }
    ]
  })
}
const removePricingRound = (index) => { formData.value.trip_pricing_data.splice(index, 1) }
const addPriceCategory = (roundIndex) => { formData.value.trip_pricing_data[roundIndex].prices.push({ category: '', amount: '' }) }
const removePriceCategory = (roundIndex, priceIndex) => { formData.value.trip_pricing_data[roundIndex].prices.splice(priceIndex, 1) }

const resetForm = () => {
  formData.value = createDefaultFormData()
  itineraryRows.value = []
  pdfFile.value = null
  featuredImageFile.value = null
  galleryFiles.value = []
  featuredImagePreview.value = null // ล้างรูปปก
  galleryPreviews.value = []        // ล้างรูปแกลเลอรี
  uploadProgressText.value = ''
}


const validateFiles = () => {
  if (pdfFile.value && pdfFile.value.type !== 'application/pdf') return 'ไฟล์ PDF ต้องเป็น .pdf เท่านั้น'
  if (featuredImageFile.value && !featuredImageFile.value.type.startsWith('image/')) return 'รูปปกต้องเป็นไฟล์รูปภาพ'
  if (galleryFiles.value.find(file => !file.type.startsWith('image/'))) return 'รูปใน Gallery ต้องเป็นไฟล์รูปภาพทั้งหมด'
  return ''
}

const uploadTourAssets = async () => {
  const form = new FormData()
  
  // 1. แนบไฟล์ PDF (ไม่มีการแปลง)
  if (pdfFile.value) {
    form.append('pdf', pdfFile.value)
  }
  
  // 2. แปลงรูปปกเป็น WebP ก่อนแนบ
  if (featuredImageFile.value) {
    uploadProgressText.value = 'กำลังแปลงรูปปกเป็น WebP...'
    const webpFeatured = await convertToWebP(featuredImageFile.value, 0.8)
    form.append('featuredImage', webpFeatured)
  }
  
  // 3. แปลงรูป Gallery เป็น WebP ก่อนแนบ (ถ้ามี)
  if (galleryFiles.value && galleryFiles.value.length > 0) {
    uploadProgressText.value = 'กำลังแปลงรูป Gallery เป็น WebP...'
    for (const file of galleryFiles.value) {
      const webpGallery = await convertToWebP(file, 0.8)
      form.append('galleryImages', webpGallery)
    }
  }

  uploadProgressText.value = 'กำลังอัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์...'
  const response = await secureApi.post('/upload-tour-assets', form, { 
    headers: { 'Content-Type': 'multipart/form-data' }, 
    timeout: 120000 
  })
  
  return response.data
}

const buildPayload = () => {
  const payload = JSON.parse(JSON.stringify(formData.value))
  payload.tour_schedule_details = generateItineraryHtml()

  // if (!isFormComplete.value) {
  //   payload.status = 'draft'
  // } else {
  //   payload.status = formData.value.status || 'publish'
  // }
  // 🟢 บังคับสถานะก่อนบันทึก: ครบ = publish, ไม่ครบ = draft แบบเด็ดขาด
  payload.status = isFormComplete.value ? 'publish' : 'draft';

  if (payload.excerpt) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = payload.excerpt;
    payload.excerpt = tempDiv.textContent || tempDiv.innerText || "";
  }

  payload.title = String(payload.title || '').trim()
  payload.trip_code = String(payload.trip_code || '').trim()

  payload.trip_pricing_data = (payload.trip_pricing_data || [])
    .map(round => ({
      start_date: round.start_date || null, 
      end_date: round.end_date || null,
      max_pax: round.max_pax ? Number(round.max_pax) : 0, 
      prices: (round.prices || []).map(price => ({ category: String(price.category || '').trim(), amount: Number(price.amount) || 0 })).filter(price => price.category !== '' && price.amount > 0)
    })).filter(round => round.prices.length > 0)

  // 🟢 จุดสำคัญ: บังคับให้ Payload ใช้จำนวนวันตามที่แอดมินกรอกในฟอร์มเท่านั้น
  payload.trip_days = Number(formData.value.trip_days) || 0;
  payload.trip_nights = Number(formData.value.trip_nights) || 0;
  payload.trip_days_nights = payload.trip_days ? `${payload.trip_days} วัน ${payload.trip_nights} คืน` : '';
  
  return payload
}
const submitTourData = async () => {
  successMessage.value = ''; errorMessage.value = ''; uploadProgressText.value = ''
  if (!formData.value.title.trim() || !formData.value.trip_code.trim()) return errorMessage.value = 'กรุณากรอกชื่อทัวร์และรหัสทัวร์'
  const fileError = validateFiles(); if (fileError) return errorMessage.value = fileError

  const payload = buildPayload()
  if (!payload.trip_pricing_data.length) return errorMessage.value = 'กรุณาเพิ่มรอบเดินทางที่มีราคาอย่างน้อย 1 รายการ'

  isSubmitting.value = true
  try {
    uploadProgressText.value = 'กำลังอัปโหลดไฟล์...'
    const uploaded = await uploadTourAssets()

    payload.tour_pdf = uploaded?.pdf?.attachment_id || 0
    payload.featured_image_id = uploaded?.featuredImage?.attachment_id || 0
    payload.gallery_image_ids = (uploaded?.galleryImages || []).map(item => item.attachment_id)

    uploadProgressText.value = 'กำลังบันทึกข้อมูลเข้าฐานข้อมูล...'
    const response = await secureApi.post('/add-tour', payload, { headers: { 'Content-Type': 'application/json' } })

    if (response.data?.success) {
      successMessage.value = `บันทึกทัวร์สำเร็จ! (Post ID: ${response.data.post_id})`
      resetForm(); await fetchAirlines()
    } else errorMessage.value = response.data?.message || 'ไม่สามารถบันทึกข้อมูลได้'
  } catch (error) { errorMessage.value = error.response?.data?.message || error.message || 'เชื่อมต่อ Server ล้มเหลว' }
  finally { isSubmitting.value = false; uploadProgressText.value = '' }
}

// ---------------------------------------------------------------------
// AUTO CALCULATE LOWEST PRICE
// ---------------------------------------------------------------------
// 🟢 1. สร้าง Computed หาค่าราคาที่น้อยที่สุดจากทุกรอบ
const lowestPrice = computed(() => {
  let min = Infinity;
  let hasPrice = false;

  // วนลูปดูทุกรอบเดินทาง
  formData.value.trip_pricing_data.forEach(round => {
    // วนลูปดูทุกหมวดหมู่ราคาในรอบนั้นๆ
    round.prices.forEach(price => {
      const amount = Number(price.amount);
      // ถ้าราคามีค่ามากกว่า 0 และน้อยกว่าค่า min ปัจจุบัน ให้จำค่านี้ไว้
      if (amount > 0 && amount < min) {
        min = amount;
        hasPrice = true;
      }
    });
  });

  return hasPrice ? min : 0;
});

// 🟢 2. สั่ง Watch คอยดูว่าถ้า lowestPrice เปลี่ยน ให้เอาไปอัปเดตในฟอร์มทันที
watch(lowestPrice, (newMin) => {
  if (newMin > 0) {
    // นำตัวเลขไปแปลงใส่ลูกน้ำ (เช่น 89900 -> "89,900")
    formData.value.trip_price_display = newMin.toLocaleString('th-TH');
  } else {
    // ถ้ายังไม่ได้กรอกราคาเลย ให้ล้างค่าทิ้ง
    formData.value.trip_price_display = '';
  }
}, { immediate: true }); // immediate: true เพื่อให้คำนวณทันทีที่โหลดหน้าจอ


const thaiShortMonths = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

// 🟢 2. สร้าง Computed เพื่อดึงเดือนแรกและเดือนสุดท้าย
const computedTripSchedule = computed(() => {
  // ดึงวันที่ทั้งหมดจากทุกรอบเดินทาง
  const validDates = formData.value.trip_pricing_data
    .map(round => round.start_date)
    .filter(date => date) // กรองเอาเฉพาะที่กรอกวันที่แล้ว
    .map(date => new Date(date).getTime()) // แปลงเป็นตัวเลข Timestamp
    .filter(time => !isNaN(time)); // ป้องกันค่า Error

  // ถ้ายังไม่ได้เลือกวันที่เลย ให้คืนค่าว่าง
  if (validDates.length === 0) return '';

  // หาวันที่น้อยที่สุด (เดือนแรกสุด) และ วันที่มากที่สุด (เดือนท้ายสุด)
  const minDate = new Date(Math.min(...validDates));
  const maxDate = new Date(Math.max(...validDates));

  const minMonth = thaiShortMonths[minDate.getMonth()];
  const maxMonth = thaiShortMonths[maxDate.getMonth()];
  
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();

  // ถ้าเดินทางอยู่ในเดือนและปีเดียวกัน ให้แสดงแค่เดือนเดียว (เช่น "มี.ค.")
  if (minMonth === maxMonth && minYear === maxYear) {
    return minMonth;
  } else {
    // ถ้าข้ามเดือน ให้แสดงแบบช่วง (เช่น "ม.ค. - มี.ค.")
    return `${minMonth} - ${maxMonth}`;
  }
});

// 🟢 3. สั่ง Watch ให้คอยอัปเดตลงฟอร์มทันทีที่ข้อมูลเปลี่ยน
watch(computedTripSchedule, (newSchedule) => {
  formData.value.trip_schedule = newSchedule;
}, { immediate: true });


// ---------------------------------------------------------------------
// 🟢 ฟังก์ชันแปลงข้อความอาหารเป็น Icon สำหรับหน้าพรีวิว
// ---------------------------------------------------------------------
const getMealIconHtml = (type) => {
  if (!type || type.trim() === '' || type === '-') {
    return '<span style="color: #cbd5e1; font-weight: 300;">-</span>';
  }
  if (type.includes('อาหาร') || type === 'food') {
    return '<span title="อาหาร" style="font-size: 1.25rem;">🍽️</span>';
  }
  if (type.includes('บิน') || type === 'plane') {
    return '<span title="บิน" style="font-size: 1.25rem;">✈️</span>';
  }
  // ถ้าเป็นข้อความอื่นๆ ให้แสดงเป็นตัวหนังสือปกติ
  return `<span style="font-size: 0.85rem; color: #475569;">${type}</span>`;
};

// ---------------------------------------------------------------------
// PRICE FORMATTING (COMMA)
// ---------------------------------------------------------------------
const onPriceInput = (event, roundIndex, priceIndex) => {
  // 1. ดึงค่าที่แอดมินพิมพ์มา ตัดตัวอักษรอื่นๆ และลูกน้ำออกให้เหลือแค่ "ตัวเลข"
  let rawValue = event.target.value.replace(/\D/g, '');

  // 2. บันทึกค่าตัวเลขล้วนๆ กลับเข้าไปใน Model (เพื่อส่ง API และคำนวณ)
  formData.value.trip_pricing_data[roundIndex].prices[priceIndex].amount = rawValue ? Number(rawValue) : '';

  // 3. บังคับให้ช่อง Input แสดงผลเป็นแบบมีลูกน้ำทันทีที่พิมพ์
  if (rawValue) {
    event.target.value = Number(rawValue).toLocaleString('th-TH');
  } else {
    event.target.value = '';
  }
}

// ---------------------------------------------------------------------
// 🟢 แปลงรูปภาพเป็น WebP (คุณภาพสูงสุด 100% ขนาดใหญ่สุด)
// ---------------------------------------------------------------------
const convertToWebP = (file, quality = 1.0) => { // 🟢 ปรับเป็น 1.0 ตรงนี้
  return new Promise((resolve, reject) => {
    // ถ้าไม่ใช่ไฟล์รูป หรือเป็น WebP/GIF อยู่แล้ว ให้คืนค่าไฟล์เดิมกลับไปเลย
    if (!file.type.startsWith('image/') || file.type === 'image/webp' || file.type === 'image/gif') {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        // สร้าง Canvas จำลองขึ้นมาเพื่อวาดรูป (ขนาดเท่าต้นฉบับ 100%)
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        
        // แปลง Canvas เป็นไฟล์ WebP
        canvas.toBlob((blob) => {
          if (blob) {
            // เปลี่ยนนามสกุลไฟล์เดิมเป็น .webp
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
            const webpFile = new File([blob], newFileName, { type: 'image/webp' })
            resolve(webpFile)
          } else {
            reject(new Error('ไม่สามารถแปลงรูปภาพได้'))
          }
        }, 'image/webp', quality) 
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}



const csvFileInput = ref(null);
const isImporting = ref(false);

const isImportComplete = ref(false);
const importSummaryText = ref('');
const closeImportProgressModal = () => {
  isImporting.value = false;
  isImportComplete.value = false;
  successMessage.value = importSummaryText.value; // โชว์แจ้งเตือนสีเขียวมุมขวา
  setTimeout(() => successMessage.value = '', 4000); // ซ่อนอัตโนมัติใน 4 วิ
};

const importProgress = ref('');
const parsedTours = ref([]);
const showPreviewModal = ref(false);
const currentPreviewIndex = ref(0);
const importPercentage = ref(0);

const showImportSuccessModal = ref(false);
const importSummary = ref({ success: 0, total: 0 });

const closeImportSuccessModal = () => {
  showImportSuccessModal.value = false;
};

// คำนวณเพื่อดึงทัวร์ตัวปัจจุบันมาโชว์บนหน้าจอ
const currentPreviewTour = computed(() => {
  if (parsedTours.value.length === 0) return null;
  return parsedTours.value[currentPreviewIndex.value];
});

// ฟังก์ชันเลื่อนดูทัวร์ "ก่อนหน้า"
const prevPreview = () => {
  if (currentPreviewIndex.value > 0) currentPreviewIndex.value--;
};

// ฟังก์ชันเลื่อนดูทัวร์ "ถัดไป"
const nextPreview = () => {
  if (currentPreviewIndex.value < parsedTours.value.length - 1) currentPreviewIndex.value++;
};

// ฟังก์ชันกดยกเลิกการนำเข้า
const cancelImport = () => {
  showPreviewModal.value = false;
  parsedTours.value = [];
  currentPreviewIndex.value = 0;
  if (csvFileInput.value) csvFileInput.value.value = ''; // รีเซ็ตช่องเลือกไฟล์
};

// ฟังก์ชันกดยืนยัน (ส่งข้อมูลทั้งหมดไป API)
const confirmImport = () => {
  showPreviewModal.value = false; // ปิดหน้าต่างพรีวิว
  processImportTours(parsedTours.value); // เริ่มกระบวนการ Import ของจริง!
};

// ฟังก์ชันแปลงวันที่ (กรณี Excel ใส่มาเป็น 1/1/2025 ให้เป็น 2025-01-01)
const convertDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  return dateStr;
};

const getDirectDriveLink = (url) => {
 if (!url) return 'https://panda.co.th//wp-content/uploads/2026/03/tour-panda-defalt.webp';
  
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([^/?#]+)|id=([^&?#]+)/);
    if (match) {
      const fileId = match[1] || match[2];
      const driveDirectLink = `https://drive.google.com/uc?id=${fileId}&export=view`;
      
      // ดึงผ่านตัวกลางชั่วคราว เพื่อให้โชว์ใน Modal พรีวิวของแอดมินได้โดยไม่ติด Error
      return `https://wsrv.nl/?url=${encodeURIComponent(driveDirectLink)}`;
    }
  }
  return url;
};
// ---------------------------------------------------------------------
// 🟢 ฟังก์ชันแปลงข้อความเป็นย่อหน้า (Paragraph) สำหรับ Overview (ใหม่!)
// ---------------------------------------------------------------------
const formatAsParagraph = (text) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text; // ถ้ามี HTML อยู่แล้วให้ข้าม
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return '';

  let html = '';
  // หุ้มแต่ละบรรทัดด้วยแท็ก <p> เพื่อให้ QuillEditor แสดงผลได้อย่างถูกต้อง
  lines.forEach(line => { html += `<p>${line}</p>`; });
  return html;
};

// ---------------------------------------------------------------------
// 🟢 ฟังก์ชันแปลงข้อความเป็นลิสต์วงกลม (Bullet Points) สำหรับ Highlight
// ---------------------------------------------------------------------
const formatAsBulletedList = (text) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  
  const lines = text.split('\n').map(line => line.replace(/^[-*•\s]+/, '').trim()).filter(line => line.length > 0);
  if (lines.length === 0) return '';
  
  // ลบ \n ออกจาก <ul> เพื่อไม่ให้ QuillEditor มีปัญหา
  let html = '<ul>';
  lines.forEach(line => { html += `<li>${line}</li>`; });
  html += '</ul>';
  
  return html;
};

// ฟังก์ชันจำลองการสร้างตาราง HTML จาก Array (ใช้ตอน Import)
const generateHtmlForImport = (rows) => {
  if (!rows || rows.length === 0) return '';
  let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">';
  html += '<thead style="background: #f1f5f9;"><tr><th style="border: 1px solid #e2e8f0; padding: 8px;">วันที่</th><th style="border: 1px solid #e2e8f0; padding: 8px;">รายการโปรแกรม</th><th style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">เช้า</th><th style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">กลางวัน</th><th style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">ค่ำ</th><th style="border: 1px solid #e2e8f0; padding: 8px;">โรงแรม</th></tr></thead><tbody>';
  
  rows.forEach(r => {
    html += `<tr>
      <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;"><strong>${r.day}</strong></td>
      <td style="border: 1px solid #e2e8f0; padding: 8px;">${r.detail}</td>
      <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">${getMealIconOnly(r.morning)}</td>
      <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">${getMealIconOnly(r.lunch)}</td>
      <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">${getMealIconOnly(r.dinner)}</td>
      <td style="border: 1px solid #e2e8f0; padding: 8px;">${r.hotel}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
};

// ---------------------------------------------------------------------
// 🟢 อ่านไฟล์และดึงข้อมูลให้ตรงกับโครงสร้าง CSV ใหม่
// ---------------------------------------------------------------------
const handleCsvImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data;
      const toursToImport = [];
      let currentTour = null;
      let itineraryRows = [];
      let pricingRounds = [];

      for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        
        // 🆔 รหัสทัวร์อยู่ที่คอลัมน์ B (Index 1)
        const tripCode = row[1] ? row[1].trim() : '';

        if (tripCode !== '') {
          if (currentTour) {
            currentTour.itineraryRows = itineraryRows;
            currentTour.trip_pricing_data = pricingRounds;
            toursToImport.push(currentTour);
          }

         currentTour = {
            trip_code: tripCode,        // Index 1 (คอลัมน์ B)
            destinations_text: row[2] || '', // Index 2 (คอลัมน์ C)
            months_text: row[3] || '',    // Index 3 (คอลัมน์ D)
            festivals_text: row[4] || '',  // Index 4 (คอลัมน์ E)
            tour_pdf_url: row[5] || '',   // Index 5 (คอลัมน์ F)
            featured_image_url: row[6] || '', // Index 6 (คอลัมน์ G) 👈 รูปปกอยู่ตรงนี้
            title: row[7] || '',          // Index 7 (คอลัมน์ H)
            excerpt: row[8] || '',        // Index 8 (คอลัมน์ I) 👈 Excerpt อยู่ตรงนี้
            overview: formatAsParagraph(row[9] || ''),
            tour_highlight: formatAsBulletedList(row[10] || ''), // Index 10 (คอลัมน์ K)
            
            tour_hotel_rating: row[17] || '5', // Index 17 (คอลัมน์ R)
            tour_airlines: row[18] || '',      // Index 18 (คอลัมน์ S)
            trip_days: Number(row[20]) || 0,   // Index 20 (คอลัมน์ U)
            trip_nights: Number(row[21]) || 0, // Index 21 (คอลัมน์ V)
            status: 'draft',
            destination_ids: [], festival_ids: [], month_ids: []
          };
          itineraryRows = [];
          pricingRounds = [];
        }

        if (!currentTour) continue;

        // ดึงแผนการเดินทาง (เริ่ม Index 11)
        if (row[11] && row[11].trim() !== '') {
          itineraryRows.push({
            day: row[11], detail: row[12], morning: row[13], lunch: row[14], dinner: row[15], hotel: row[16]
          });
        }

        // ดึงราคา (เริ่ม Index 22)
        if (row[22] && row[22].trim() !== '') {
          const roundsPrices = [];
          if (Number(row[25]) > 0) roundsPrices.push({ category: 'ผู้ใหญ่ (พักคู่)', amount: Number(row[25]) });
          if (Number(row[26]) > 0) roundsPrices.push({ category: 'ผู้ใหญ่ (พักเดี่ยว)', amount: Number(row[26]) });

          pricingRounds.push({
            start_date: convertDate(row[22]),
            end_date: convertDate(row[23]),
            max_pax: Number(row[24]) || 20,
            prices: roundsPrices
          });
        }
      }

      if (currentTour) {
        currentTour.itineraryRows = itineraryRows;
        currentTour.trip_pricing_data = pricingRounds;
        toursToImport.push(currentTour);
      }

      if (toursToImport.length > 0) {
        parsedTours.value = toursToImport;
        currentPreviewIndex.value = 0;
        showPreviewModal.value = true;
      }
      event.target.value = '';
    }
  });
};


// 🟢 ตรวจสอบว่ากรอกข้อมูลครบทุกช่องที่สำคัญหรือไม่
// const isFormComplete = computed(() => {
//   const fd = formData.value;
  
//   // 1. ข้อมูลทั่วไป
//   const hasGeneral = fd.title && fd.trip_code && fd.trip_days && fd.trip_nights;
  
//   // 2. ข้อมูลการเดินทาง (เช็กว่าเลือกจุดหมายอย่างน้อย 1 ที่)
//   const hasTravel = fd.tour_airlines && fd.destination_ids?.length > 0;
  
//   // 3. รอบเดินทาง (ต้องมีอย่างน้อย 1 รอบ และในรอบนั้นต้องมีราคา)
//   const hasPricing = fd.trip_pricing_data?.length > 0 && 
//                      fd.trip_pricing_data.every(round => 
//                         round.start_date && round.prices?.some(p => p.amount > 0)
//                      );
  
//   // 4. รายละเอียดเนื้อหา
//   const hasContent = fd.excerpt && fd.overview && fd.tour_highlight && itineraryRows.value.length > 0;
  
//   // 5. ไฟล์แนบ (ถ้าหน้าเพิ่มต้องมีไฟล์ใหม่ ถ้าหน้าแก้ไขมีของเดิมหรือของใหม่ก็ได้)
//   const hasImage = featuredImageFile.value || (typeof currentFeaturedImageUrl !== 'undefined' && currentFeaturedImageUrl.value);
//   const hasPdf = pdfFile.value || (typeof currentPdfUrl !== 'undefined' && currentPdfUrl.value);

//   return hasGeneral && hasTravel && hasPricing && hasContent && hasImage && hasPdf;
// });
// 🟢 โค้ดเดิมที่มีอยู่แล้ว (เอาไว้ดูเป็นจุดอ้างอิง)
const isFormComplete = computed(() => {
  const fd = formData.value;
  const hasGeneral = fd.title && fd.trip_code && fd.trip_days && fd.trip_nights;
  const hasTravel = fd.tour_airlines && fd.destination_ids?.length > 0;
  const hasPricing = fd.trip_pricing_data?.length > 0 && 
                     fd.trip_pricing_data.every(round => 
                        round.start_date && round.prices?.some(p => p.amount > 0)
                     );
  const hasContent = fd.excerpt && fd.overview && fd.tour_highlight && itineraryRows.value.length > 0;
  const hasImage = featuredImageFile.value || (typeof currentFeaturedImageUrl !== 'undefined' && currentFeaturedImageUrl.value);
  const hasPdf = pdfFile.value || (typeof currentPdfUrl !== 'undefined' && currentPdfUrl.value);

  return hasGeneral && hasTravel && hasPricing && hasContent && hasImage && hasPdf;
});

// --------------------------------------------------
// 🟢 ส่วนที่ต้อง ก๊อปปี้ไปวางเพิ่ม ตรงนี้ครับ 👇
// --------------------------------------------------
watch(isFormComplete, (isComplete) => {
  if (isComplete) {
    formData.value.status = 'publish'; // ถ้าข้อมูลบังคับครบแล้ว ให้ปรับช่องเป็น เผยแพร่
  } else {
    formData.value.status = 'draft';   // ถ้ายังไม่ครบ ให้ปรับช่องเป็น ซ่อนไว้ก่อน
  }
}, { immediate: true });
// --------------------------------------------------



// ---------------------------------------------------------------------
// 🟢 1. ฟังก์ชันตัวช่วยสำหรับกระบวนการ Import (วางไว้ก่อน processImportTours)
// ---------------------------------------------------------------------

const mapTextToIds = (textStr, optionsList) => {
  if (!textStr || !optionsList.length) return [];
  const textArray = textStr.split(',').map(t => t.trim().toLowerCase());
  return optionsList
    .filter(opt => {
      const optName = String(opt.name || opt.label || '').trim().toLowerCase();
      return textArray.some(t => optName.includes(t) || t.includes(optName));
    })
    .map(opt => opt.id || opt.value);
};

// 1.4 หา "ช่วงเดือนเดินทางรวม" (Schedule) โดยดูจาก Start และ End Date ของทุกรอบ
const calculateTripScheduleForImport = (pricingData) => {
  if (!pricingData || pricingData.length === 0) return '';
  
  let allDates = [];
  pricingData.forEach(r => {
    if (r.start_date) allDates.push(new Date(r.start_date).getTime());
    if (r.end_date) allDates.push(new Date(r.end_date).getTime());
  });
  
  allDates = allDates.filter(t => !isNaN(t));
  if (allDates.length === 0) return '';

  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));

  const thaiShortMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const minMonth = thaiShortMonths[minDate.getMonth()];
  const maxMonth = thaiShortMonths[maxDate.getMonth()];
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();

  return (minMonth === maxMonth && minYear === maxYear) ? minMonth : `${minMonth} - ${maxMonth}`;
};

const getMealIconOnly = (type) => {
  if (!type || type.trim() === '' || type === '-') return '-';
  if (type.includes('อาหาร') || type === 'food') return '🍽️';
  if (type.includes('บิน') || type === 'plane') return '✈️';
  return type; 
};

// ---------------------------------------------------------------------
// 🟢 2. อัปเดตฟังก์ชัน processImportTours (ก๊อปปี้ทับอันเดิม)
// ---------------------------------------------------------------------

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
        // 🟢 เพิ่มการดักจับ Emoji และคำภาษาไทย
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
// ฟังก์ชันจัดการนำเข้าทัวร์หลายรายการจาก CSV (TourList.vue)
// ฟังก์ชันจัดการนำเข้าทัวร์หลายรายการจาก CSV (TourList.vue)
const processImportTours = async (tours) => {
  isImporting.value = true;
  importPercentage.value = 0; // 🟢 เซ็ตค่าเริ่มต้นเป็น 0%
  let successCount = 0;

  for (let i = 0; i < tours.length; i++) {
    const t = tours[i];
    
    // 🟢 อัปเดตข้อความให้แอดมินเห็นว่ากำลังทำรายการไหน
    importProgress.value = `กำลังนำเข้าข้อมูล: ${t.trip_code} (${i + 1}/${tours.length})`;
    importPercentage.value = Math.round((i / tours.length) * 100);

    const cleanedPricingData = (t.trip_pricing_data || [])
      .map(round => ({
        start_date: round.start_date || null, end_date: round.end_date || null, max_pax: round.max_pax ? Number(round.max_pax) : 0,
        prices: (round.prices || []).map(price => ({ category: String(price.category || '').trim(), amount: Number(price.amount) || 0 })).filter(price => price.category !== '' && price.amount > 0)
      })).filter(round => round.prices.length > 0);

    const finalDays = Number(t.trip_days) || 0;
    const finalNights = Number(t.trip_nights) || 0;

    const mappedDestinations = mapTextToIds(t.destinations_text, destinationsList.value);
    const mappedMonths = mapTextToIds(t.months_text, monthsList.value);
    const mappedFestivals = mapTextToIds(t.festivals_text, festivalsList.value);
    
    const mappedAirline = airlinesList.value.find(a => {
      const label = String(a.label || '').toLowerCase();
      const csvAir = String(t.tour_airlines || '').toLowerCase();
      return label.includes(csvAir) || csvAir.includes(label);
    })?.value || '';

    const hotelRatingNum = String(t.tour_hotel_rating || '5').replace(/\D/g, '') || '5';

    let cleanExcerpt = t.excerpt || '';
    if (cleanExcerpt) {
      const tempDiv = document.createElement("div"); tempDiv.innerHTML = cleanExcerpt; cleanExcerpt = tempDiv.textContent || tempDiv.innerText || "";
    }

    const payload = {
      ...t, 
      destination_ids: mappedDestinations, month_ids: mappedMonths, festival_ids: mappedFestivals,
      tour_airlines: mappedAirline, tour_hotel_rating: hotelRatingNum,
      trip_pricing_data: cleanedPricingData,
      
      trip_days: finalDays,             
      trip_nights: finalNights,         
      trip_days_nights: finalDays ? `${finalDays} วัน ${finalNights} คืน` : '',
      
      trip_schedule: calculateTripScheduleForImport(cleanedPricingData), 
      trip_price_display: cleanedPricingData.length > 0 && cleanedPricingData[0].prices.length > 0 
        ? Number(cleanedPricingData[0].prices[0].amount).toLocaleString('th-TH') 
        : '',

      excerpt: cleanExcerpt,
      overview: t.overview || '',         
      tour_highlight: t.tour_highlight || '',
      tour_schedule_details: generateHtmlForImport(t.itineraryRows), 
      
      featured_image_url: t.featured_image_url || '',
      tour_pdf_url: t.tour_pdf_url || '',
      
      status: 'publish' 
    };

    delete payload.destinations_text; delete payload.months_text; delete payload.festivals_text; delete payload.itineraryRows;

    try {
      const response = await secureApi.post('/add-tour', payload, { headers: { 'Content-Type': 'application/json' } });
      if (response.data?.success) successCount++;
    } catch (error) {
      console.error(`ล้มเหลวในการนำเข้า ${t.trip_code}:`, error);
    }
    
    // 🟢 อัปเดตเปอร์เซ็นต์เมื่อจบรอบบันทึกแต่ละอัน
    importPercentage.value = Math.round(((i + 1) / tours.length) * 100);
  }

 setTimeout(() => {
    importSummaryText.value = `นำเข้าสำเร็จ ${successCount} จาก ${tours.length} รายการ`;
    isImportComplete.value = true;
    
    // (เอาโค้ด isImporting.value = false และ alert() ของเดิมออกไปเลยครับ)
    
  }, 500);
};

</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

/* -----------------------------------
   🟢 1. GLOBAL & CONTAINER
----------------------------------- */
* {
  box-sizing: border-box;
}

.tour-admin-container {
  --color-primary: #cc0000;
  --color-secondary: #1a1a1a;
  --color-success: #16a34a;
  --color-white: #ffffff;
  --color-bg: #f8fafc;
  --color-border: #e2e8f0;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 10px 20px rgba(0, 0, 0, 0.06);
  --border-radius: 12px;
  --font-family: 'Kanit', sans-serif;

  font-family: var(--font-family);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 15px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.page-subtitle {
  color: var(--color-text-muted);
  margin: 8px 0 0;
  font-weight: 300;
}

/* -----------------------------------
   🟢 3. FORM SECTIONS
----------------------------------- */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-section {
  background: var(--color-white);
  border-radius: var(--border-radius);
  padding: 30px;
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.form-section:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 25px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title .number {
  background: var(--color-primary);
  color: var(--color-white);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 600;
}

.btn-warning {
  background-color: #f59e0b; /* สีส้มอมเหลือง */
  color: white;
  min-width: 250px;
  box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);
}

.btn-warning:hover:not(:disabled) {
  background-color: #d97706;
  transform: translateY(-1px);
}

.section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 10px;
}

.section-header-flex .section-title {
  margin-bottom: 0;
}

/* -----------------------------------
   🟢 4. GRID & INPUTS
----------------------------------- */
.form-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(2, 1fr);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--color-secondary);
  margin-bottom: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.form-control {
  width: 100%;
  font-family: var(--font-family);
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  color: var(--color-text);
  background-color: var(--color-white);
  font-weight: 400;
}

/* -----------------------------------
   🟢 บังคับฟอนต์ปุ่มให้เป็น Kanit และตกแต่งตาราง 
----------------------------------- */
.btn-nav, 
.btn-cancel-import, 
.btn-confirm-import {
  font-family: var(--font-family, 'Kanit', sans-serif) !important;
}

.meal-icon-cell {
  vertical-align: middle !important;
}

.modern-table th.text-center {
  text-align: center;
}

.modern-table td.text-center {
  text-align: center;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

.form-control::placeholder {
  color: #94a3b8;
  opacity: 1;
  font-weight: 300;
}

.readonly-input {
  background: #f1f5f9;
  color: var(--color-text-muted);
  cursor: not-allowed;
  border-color: var(--color-border);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
  padding-right: 40px;
}

.form-control-sm {
  padding: 8px 12px;
  font-size: 0.95rem;
  border-radius: 6px;
}

.price-input {
  text-align: right;
  font-weight: 600;
  color: var(--color-success);
}

.price-display-input {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-primary);
}

.required {
  color: var(--color-primary);
  font-weight: bold;
}

.auto-calc-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calc-divider {
  font-weight: 500;
  color: var(--color-text-muted);
}

.text-center {
  text-align: center;
}

.mt-3 {
  margin-top: 15px;
}

.mt-4 {
  margin-top: 25px;
}

/* -----------------------------------
   🟢 5. STATUS SELECT
----------------------------------- */
.status-select.publish {
  color: #16a34a;
  background-color: #f0fdf4;
  border-color: #bbf7d0;
}

.status-select.draft {
  color: #d97706;
  background-color: #fffbeb;
  border-color: #fde68a;
}

/* -----------------------------------
   🟢 6. MULTISELECT & QUILL EDITOR
----------------------------------- */
.modern-multiselect :deep(.multiselect-wrapper) {
  min-height: 48px;
  border-radius: 8px;
  border-color: #cbd5e1;
}

.modern-multiselect :deep(.multiselect-is-active) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

.modern-multiselect :deep(.multiselect-tags-search) {
  font-family: var(--font-family);
  font-weight: 300;
}

.modern-multiselect :deep(.multiselect-tag) {
  background: #e2e8f0;
  color: var(--color-secondary);
  border-radius: 4px;
  font-weight: 500;
}

.modern-multiselect :deep(.multiselect-tag-remove) {
  color: #64748b;
  margin-left: 4px;
}

.modern-multiselect :deep(.multiselect-tag-remove:hover) {
  background: #cbd5e1;
}

.modern-multiselect :deep(.multiselect-placeholder) {
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 300;
}

.quill-wrapper {
  background-color: var(--color-white);
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  overflow: hidden;
  transition: all 0.2s ease;
}

.quill-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

.quill-wrapper :deep(.ql-container.ql-snow) {
  min-height: 120px;
  border: none;
  font-family: var(--font-family);
  font-size: 1rem;
}

.content-quill :deep(.ql-container.ql-snow) {
  min-height: 250px;
}

.quill-wrapper :deep(.ql-toolbar.ql-snow) {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid #cbd5e1;
  background-color: #f8fafc;
  font-family: var(--font-family);
}

.quill-wrapper :deep(.ql-editor.ql-blank::before) {
  color: #94a3b8;
  font-style: normal;
  font-weight: 300;
}

/* -----------------------------------
   🟢 7. ITINERARY BUILDER
----------------------------------- */
.itinerary-builder {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
}

.itinerary-header {
  background: #f8fafc;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #cbd5e1;
}

.itinerary-header label {
  margin: 0;
  color: var(--color-secondary);
  font-weight: 600;
}

.itinerary-table-responsive {
  width: 100%;
  overflow-x: auto;
}

.itinerary-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.itinerary-table th,
.itinerary-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.itinerary-table th {
  background-color: #f1f5f9;
  text-align: left;
  font-size: 0.95rem;
  color: var(--color-secondary);
  font-weight: 600;
}

.itinerary-table td {
  background-color: var(--color-white);
}

.font-bold {
  font-weight: 600;
  color: var(--color-text-muted);
}

.icon-select {
  padding-left: 5px;
  padding-right: 25px;
}

.empty-state-row {
  padding: 30px !important;
  color: #94a3b8;
  font-weight: 300;
}

/* -----------------------------------
   🟢 8. FILE & IMAGE UPLOADS
----------------------------------- */
.file-input-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
  width: 100%;
}

.form-control-file {
  position: absolute;
  font-size: 100px;
  opacity: 0;
  right: 0;
  top: 0;
  cursor: pointer;
  height: 100%;
  width: 100%;
}

.file-custom-label {
  display: block;
  width: 100%;
  padding: 14px 15px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: var(--color-text-muted);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 400;
}

.file-input-wrapper:hover .file-custom-label {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: #fff5f5;
}

.image-input-wrapper .file-custom-label {
  width: 100%;
  max-width: 100%;
  min-height: 120px; 
  aspect-ratio: auto;
  padding: 20px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.2s;
}

.image-input-wrapper.has-preview .file-custom-label {
  padding: 0;
  aspect-ratio: 1 / 1;
}

.preview-img-full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.file-input-wrapper:not(.image-input-wrapper) .file-custom-label {
  aspect-ratio: auto;
  min-height: 120px;
  border: 2px dashed #cbd5e1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.file-preview-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.file-icon {
  font-size: 2rem;
}

.file-name {
  font-size: 0.9rem;
  color: var(--color-secondary);
  font-weight: 500;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: 0.2s;
  border-radius: 8px;
}

.file-input-wrapper:hover .hover-overlay {
  opacity: 1;
}

/* -----------------------------------
   🟢 9. PRICING ROUNDS
----------------------------------- */
.pricing-rounds-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pricing-round-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 25px;
  background-color: #f8fafc;
  border-left: 4px solid var(--color-success);
  transition: box-shadow 0.2s ease;
}

.pricing-round-card:hover {
  box-shadow: var(--shadow-sm);
}

.round-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.round-number {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0;
}

.price-tiers-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed var(--color-border);
}

.inner-label {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin-bottom: 12px;
  display: block;
  font-weight: 600;
}

.price-row-grid {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

/* -----------------------------------
   🟢 10. BUTTONS & GENERAL STYLES
----------------------------------- */
.btn {
  font-family: var(--font-family);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  border: 1px solid transparent;
  padding: 10px 20px;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 8px;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-lg {
  padding: 12px 30px;
  font-size: 1.05rem;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.btn-xs {
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 6px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background-color: #a30000;
}

.btn-success {
  background-color: var(--color-success);
  color: var(--color-white);
}

.btn-success:hover:not(:disabled) {
  background-color: #15803d;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: var(--color-text);
  border-color: #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #cbd5e1;
}

.btn-outline-secondary {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-outline-secondary:hover:not(:disabled) {
  background: #f1f5f9;
}

.btn-outline-success {
  border: 1px dashed var(--color-success);
  color: var(--color-success);
  background: transparent;
}

.btn-outline-success:hover:not(:disabled) {
  background-color: #f0fdf4;
}

.btn-outline-danger {
  border: 1px solid #fecaca;
  color: var(--color-primary);
  background: #fef2f2;
}

.btn-outline-danger:hover:not(:disabled) {
  background-color: #fecaca;
}

.btn-outline-primary {
  border: 1px solid #3b82f6;
  color: #2563eb;
  background: #eff6ff;
}

.btn-outline-primary:hover:not(:disabled) {
  background-color: #dbeafe;
}

.btn-icon-danger {
  background: none;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--color-primary);
  font-family: var(--font-family);
  font-weight: 500;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-icon-danger:hover {
  background: #fee2e2;
}

.full-width-btn {
  width: 100%;
}


/* -----------------------------------
   🟢 11. FORM ACTIONS & ALERTS
----------------------------------- */
/* ---------------------------------------------------
   ส่วนจัดการปุ่มบันทึก (ล็อกติดขอบจอด้านล่าง)
--------------------------------------------------- */
.form-actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 15px; 
  padding: 20px 30px; 
  background: white; 
  border-radius: 12px; 
  border: 1px solid var(--color-border); 
  /* เพิ่มเงาบางๆ ด้านบน เพื่อให้ดูรู้ว่ากล่องนี้ลอยอยู่เหนือเนื้อหา */
  box-shadow: 0 -4px 15px rgba(0,0,0,0.05); 
}

/* 🟢 คลาสพระเอกที่ทำให้ล็อกตำแหน่ง */
.sticky-bottom { 
  position: sticky; 
  bottom: 20px; /* เว้นระยะห่างจากขอบจอด้านล่าง 20px */
  z-index: 100; /* ให้อยู่ด้านหน้าสุด ไม่โดนฟอร์มอื่นบัง */
}

.submit-btn {
  min-width: 250px;
}

/* 🟢 ตกแต่งแถบแจ้งเตือน */
.modern-alert-banner {
  display: flex;
  align-items: center;
  background-color: #fffbeb;
  border-left: 4px solid #f59e0b;
  color: #92400e;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.alert-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.alert-text {
  flex-grow: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.close-alert-btn {
  background: none;
  border: none;
  color: #92400e;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 8px;
  opacity: 0.7;
}

.close-alert-btn:hover {
  opacity: 1;
}

/* เอฟเฟกต์ตอนแจ้งเตือนปรากฏ/หายไป */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.alert {
  position: fixed;
  top: 30px;
  right: 30px;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 500;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  font-family: var(--font-family);
  box-shadow: var(--shadow-md);
  border-left: 5px solid;
}

.alert-success {
  background-color: #ffffff;
  color: #15803d;
  border-color: #e2e8f0;
  border-left-color: #16a34a;
}

.alert-danger {
  background-color: #ffffff;
  color: var(--color-primary);
  border-color: #e2e8f0;
  border-left-color: var(--color-primary);
}

.alert-icon {
  font-size: 1.3rem;
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


/* -----------------------------------
   🟢 CUSTOM MODAL (Popup ระบุจำนวน - ส่วนหน้าเว็บหลัก)
----------------------------------- */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6); 
  backdrop-filter: blur(4px); 
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.custom-modal-box {
  background: var(--color-white);
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  font-family: var(--font-family);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-secondary);
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover {
  color: var(--color-primary);
}

.modal-body {
  padding: 25px 20px;
  text-align: center;
}

.modal-body p {
  margin: 0 0 20px 0;
  color: var(--color-text-muted);
  font-size: 1rem;
}

.counter-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  max-width: 200px;
  margin: 0 auto;
}

.btn-counter {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  background: #f1f5f9;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-counter:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.btn-counter:active {
  transform: scale(0.95);
}

.count-input {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  border: none;
  border-bottom: 2px solid var(--color-primary);
  border-radius: 0;
  padding: 5px;
  box-shadow: none !important;
  background: transparent;
  width: 80px;
}


/* --- Modals for Duplicate --- */
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

/* -----------------------------------
   🟢 IMPORT PROGRESS MODAL STYLES
----------------------------------- */
.import-progress-overlay {
  z-index: 10000; /* ให้อยู่บนสุดทับทุกอย่าง */
  backdrop-filter: blur(8px);
}

.progress-modal-box {
  width: 90%;
  max-width: 450px;
  padding: 20px;
  background: white;
  border-top: 5px solid var(--color-primary, #cc0000);
}

.progress-title {
  color: var(--color-secondary);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.progress-status-text {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 20px;
  min-height: 22px;
}

/* แถบ Progress Bar */
.progress-bar-container {
  width: 100%;
  height: 14px;
  background-color: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4d4d 0%, var(--color-primary, #cc0000) 100%);
  border-radius: 10px;
  transition: width 0.4s ease-in-out;
  position: relative;
}

/* ทำให้ Progress Bar มีแสงวิ่งๆ ดูมีมิติ */
.progress-bar-fill::after {
  content: "";
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% { background-position: 1rem 0; }
  100% { background-position: 0 0; }
}

.progress-percentage {
  font-size: 1.6rem;
  color: var(--color-primary, #cc0000);
}

/* ไอคอน Spinner หมุนๆ */
.spinner-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cloud-upload-icon {
  font-size: 2.5rem;
  z-index: 2;
  animation: bounce 2s infinite ease-in-out;
}

.loading-ring {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  border: 4px solid #f8fafc;
  border-top-color: var(--color-primary, #cc0000);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f8fafc;
}

.modal-footer .btn {
  padding: 10px 20px;
}


/* -----------------------------------
   💎 Premium Preview Modal Styles (Red/Dark Theme)
----------------------------------- */
.preview-modal-large {
  max-width: 1000px !important;
  width: 95% !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header-premium {
  background: var(--color-secondary, #1a1a1a); 
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid var(--color-primary, #cc0000); 
}

.modal-header-premium h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: #f8fafc;
}

.batch-count {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 8px;
  display: inline-block;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-close-white {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-white:hover {
  background: var(--color-primary, #cc0000);
  transform: rotate(90deg);
}

.modal-body-premium {
  padding: 30px;
  background: #f8fafc;
  max-height: 70vh;
  overflow-y: auto;
}

.preview-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
  border: 1px solid var(--color-border);
}

.main-info-card {
  border-left: 6px solid var(--color-primary, #cc0000);
}

.trip-badge {
  background: var(--color-primary, #cc0000);
  color: white;
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.preview-title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--color-secondary, #1a1a1a);
  font-weight: 600;
  line-height: 1.4;
}

.preview-grid-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

.img-preview-main {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-pdf-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f1f5f9;
  color: var(--color-secondary);
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 15px;
  border: 1px solid #cbd5e1;
  transition: all 0.2s;
}

.btn-pdf-preview:hover {
  background: var(--color-primary, #cc0000);
  color: white;
  border-color: var(--color-primary, #cc0000);
}

.no-file-badge {
  text-align: center;
  padding: 10px;
  background: #f1f5f9;
  color: #94a3b8;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 0.9rem;
}

.specs-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  border: 1px solid var(--color-border);
}

.spec-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 10px;
}

.spec-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 4px;
}

.spec-value {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.95rem;
}

.highlight-spec {
  background: #fff5f5; 
  padding: 10px 12px;
  border-radius: 8px;
  border-bottom: none;
  border-left: 3px solid var(--color-primary, #cc0000);
}

.preview-text-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

.text-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.card-subtitle {
  color: var(--color-secondary, #1a1a1a);
  font-weight: 600;
  font-size: 1.1rem;
  border-left: 4px solid var(--color-primary, #cc0000);
  padding-left: 12px;
  margin-bottom: 15px;
  margin-top: 0;
  display: flex;
  align-items: center;
}

.text-content-small {
  color: #475569;
  line-height: 1.6;
  font-size: 0.95rem;
}

.text-content-html, .text-content-html-large {
  text-align: left; 
  display: block;
  width: 100%;
}

.text-content-html ul, .text-content-html-large ul {
  padding-left: 20px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 0;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.95rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.modern-table th {
  background: #f8fafc;
  padding: 14px;
  text-align: left;
  color: #334155;
  font-weight: 600;
  border-bottom: 2px solid #cbd5e1;
}

.modern-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  vertical-align: top;
}

.modern-table tbody tr:hover td {
  background: #f8fafc;
}

.meal-cell {
  font-weight: 500;
  color: #0f172a;
}

.hotel-cell {
  font-style: italic;
  color: #64748b;
}

.pricing-preview-card {
  border: 2px solid var(--color-success, #16a34a);
  padding: 0;
  overflow: hidden;
}

.pricing-preview-card .card-subtitle {
  background: var(--color-success, #16a34a);
  color: white;
  margin: 0;
  padding: 15px 20px;
  border-left: none;
}

.pricing-table th {
  background: #f0fdf4;
  color: #166534;
  border-bottom-color: #bbf7d0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e2e8f0;
}

.price-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.p-cat {
  color: #475569;
}

.p-val {
  color: var(--color-success, #16a34a);
  font-weight: 600;
  font-size: 1.05rem;
}

.modal-footer-premium {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-buttons {
  display: flex;
  gap: 10px;
}

.btn-nav {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-nav:hover:not(:disabled) {
  background: #f8fafc;
  color: var(--color-secondary);
  border-color: #94a3b8;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.btn-cancel-import {
  background: white;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-import:hover {
  background: #fef2f2;
}

.btn-confirm-import {
  background: var(--color-success, #16a34a);
  color: white;
  padding: 10px 25px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.2);
  transition: all 0.2s;
}

.btn-confirm-import:hover {
  background: #15803d;
  transform: translateY(-1px);
}


/* -----------------------------------
   🟢 12. RESPONSIVE BREAKPOINTS
----------------------------------- */

/* Tablet (รวมสำหรับหน้าฟอร์มหลักและหน้าพรีวิว) */
@media (max-width: 992px) {
  .tour-admin-container {
    padding: 20px;
  }

  .form-section {
    padding: 20px;
  }
}

/* Tablet ขนาดเล็กลงมา (เฉพาะหน้า Preview Modal) */
@media (max-width: 768px) {
  .preview-grid-container {
    grid-template-columns: 1fr;
  }
  .preview-text-grid {
    grid-template-columns: 1fr;
  }
  .modal-footer-premium {
    flex-direction: column;
    gap: 15px;
  }
  .action-buttons, .nav-buttons {
    width: 100%;
    justify-content: space-between;
  }
  .action-buttons {
    flex-direction: column-reverse;
  }
}

/* Mobile (หน้าฟอร์มหลัก) */
@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions,
  .header-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr !important;
    gap: 15px;
  }

  .full-width-mobile {
    grid-column: 1 / -1 !important;
  }

  .auto-calc-group {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto;
    align-items: center;
    gap: 8px;
  }

  .itinerary-table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }
}

/* Small Mobile */
@media (max-width: 576px) {
  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 12px;
    padding: 20px;
  }

  .btn {
    width: 100%;
  }

  .price-row-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .price-row-grid .btn-outline-danger {
    grid-column: 1 / -1;
  }
}
</style>