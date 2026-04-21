// import { createRouter, createWebHistory } from 'vue-router'
// import TourOverview from '../views/TourOverview.vue' 
// import TourList from '../views/TourList.vue'
// import Airlines from '../views/Airlines.vue'
// import Destinations from '../views/Destinations.vue'
// import Festivals from '../views/Festivals.vue'
// import Months from '../views/Months.vue'
// import PricingCategories from '../views/PricingCategories.vue'
// import Login from '../views/Login.vue'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/login',
//       name: 'login',
//       component: Login,
//       meta: { requiresAuth: false } 
//     },
//     {
//       path: '/',
//       name: 'home',
//       component: TourOverview 
//     },
//     {
//       path: '/add-tour',
//       name: 'add-tour',
//       component: TourList 
//     },
//     {
//     path: '/airlines',
//     name: 'Airlines',
//     component: Airlines
//   },
//   {
//     path: '/destinations',
//     name: 'Destinations',
//     component: Destinations
//   },
//   {
//     path: '/festivals',
//     name: 'Festivals',
//     component: Festivals
//   },
//   {
//     path: '/months',
//     name: 'Months',
//     component: Months
//   },

//   {
//     path: '/pricing-categories',
//     name: 'PricingCategories',
//     component: PricingCategories
//   },
//     {
//       // หน้าแสดงรายละเอียดทัวร์
//       path: '/tour/:id',
//       name: 'tour-detail',
//       component: () => import('../views/TourDetail.vue') 
//     },
//     {
//       // หน้าแก้ไขทัวร์ (อาจจะใช้ไฟล์ TourList.vue ตัวเดิมมาทำเป็นหน้า Edit ในอนาคตได้)
//       path: '/edit-tour/:id',
//       name: 'edit-tour',
//       component: () => import('../views/TourList.vue') 
//     },
//       {
//       path: '/articles',
//       name: 'articles',
//       component: () => import('../views/Articles.vue') // ใช้ Lazy Load แบบนี้ได้เลย
//     },
//     {
//       path: '/add-article',
//       name: 'add-article',
//       component: () => import('../views/ArticleEditor.vue') 
//     },
//     {
//       path: '/edit-article/:id',
//       name: 'edit-article',
//       component: () => import('../views/ArticleEditor.vue') 
//     },
//   ]
// })

// export default router



import { createRouter, createWebHistory } from 'vue-router'

// นำเข้าหน้าต่างๆ
import Login from '../views/Login.vue'
import Destinations from '../views/Destinations.vue'
import Festivals from '../views/Festivals.vue'
import Months from '../views/Months.vue'
import PricingCategories from '../views/PricingCategories.vue'
import Airlines from '../views/Airlines.vue'
import TourOverview from '../views/TourOverview.vue' 
import TourList from '../views/TourList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: TourOverview, // คลิกหน้าแรกจะวิ่งไปที่นี่
      meta: { requiresAuth: true }
    },
    {
      path: '/destinations',
      name: 'destinations',
      component: Destinations,
      meta: { requiresAuth: true }
    },
    // 🟢 เพิ่มส่วนนี้เพื่อให้เมนู "เพิ่มโปรแกรมทัวร์" ใช้งานได้
    {
      path: '/add-tour',
      name: 'add-tour',
      component: TourList, // เปลี่ยนเป็นชื่อ Component ที่คุณใช้สร้างทัวร์
      meta: { requiresAuth: true }
    },
    {
      path: '/festivals',
      name: 'festivals',
      component: Festivals,
      meta: { requiresAuth: true }
    },
    {
      path: '/months',
      name: 'months',
      component: Months,
      meta: { requiresAuth: true }
    },
    {
      path: '/pricing-categories',
      name: 'pricing-categories',
      component: PricingCategories,
      meta: { requiresAuth: true }
    },
    {
      path: '/airlines',
      name: 'airlines',
      component: Airlines,
      meta: { requiresAuth: true }
    },
    // ดักจับหน้าอื่นๆ ให้กลับไปหน้าแรก
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// ระบบป้องกันการเข้าถึงโดยไม่ Login
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('admin_token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router