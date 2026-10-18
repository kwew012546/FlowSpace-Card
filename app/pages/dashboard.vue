<!-- app/pages/dashboard.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] dark:from-[#070b14] dark:via-[#0b1120] dark:to-[#0f172a] text-stone-800 dark:text-slate-100 flex flex-col relative overflow-x-hidden bg-grid transition-colors duration-300">
    
    <!-- Ambient Aurora Mesh Glow -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="hidden sm:block absolute top-[-10%] left-[-10%] w-[480px] h-[480px] bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl"></div>
      <div class="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[480px] h-[480px] bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Top Navigation Bar -->
    <header class="sticky top-0 z-30 bg-[#fdfaf5]/90 dark:bg-slate-900/85 backdrop-blur-xl border-b border-amber-200/80 dark:border-slate-800 px-4 py-3 shadow-xs">
      <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
        <!-- Brand Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" aria-hidden="true">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg sm:text-xl font-black tracking-tight text-stone-900 dark:text-white leading-none">
                FlowSpace
              </h1>
              <span class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-100/90 text-amber-900 border border-amber-200/80">
                Workspaces
              </span>
            </div>
            <p class="text-[11px] text-stone-400 font-semibold mt-0.5 hidden sm:block">
              ระบบบริหารจัดการงานและกระดานคัมบังอัจฉริยะ
            </p>
          </div>
        </div>

        <!-- Navigation & User Controls -->
        <div class="flex items-center flex-wrap gap-2 sm:gap-2.5">
          <!-- Dark / Light Mode Toggle -->
          <ThemeToggle :showLabel="true" />

          <!-- Notification Bell Dropdown -->
          <div class="relative">
            <button @click="isNotificationsOpen = !isNotificationsOpen" class="min-h-[42px] min-w-[42px] bg-white border border-amber-200 text-stone-600 hover:text-amber-800 hover:bg-amber-50/50 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center relative focus:outline-none cursor-pointer" aria-label="การแจ้งเตือน">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span v-if="notifications.filter(n => !n.isRead).length > 0" class="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-white tabular-nums">
                {{ notifications.filter(n => !n.isRead).length }}
              </span>
            </button>
            
            <!-- Click-outside backdrop for notification dropdown -->
            <div v-if="isNotificationsOpen" @click="isNotificationsOpen = false" class="fixed inset-0 z-[140]"></div>

            <div v-if="isNotificationsOpen" class="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white border border-stone-200 rounded-xl shadow-2xl z-[150] p-4 text-left max-h-96 overflow-y-auto">
              <div class="flex justify-between items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                <h3 class="font-black text-stone-800 text-sm flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  <span>การแจ้งเตือนล่าสุด</span>
                </h3>
                <div class="flex items-center gap-2.5">
                  <button v-if="notifications.filter(n => !n.isRead).length > 0" @click="markAllNotificationsRead" class="text-xs font-bold text-amber-600 hover:underline cursor-pointer">อ่านทั้งหมด</button>
                  <button v-if="notifications.length > 0" @click="clearAllNotifications" class="text-xs font-bold text-stone-400 hover:text-rose-600 transition-colors cursor-pointer">ล้างทั้งหมด</button>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="text-center py-6 text-stone-400 text-xs">ไม่มีการแจ้งเตือนใด ๆ</div>
              <div v-else class="space-y-2">
                <div v-for="n in notifications" :key="n.id" @click="markNotificationRead(n.id)" :class="n.isRead ? 'bg-stone-50/50' : 'bg-amber-50/60 border-l-2 border-amber-500'" class="p-2.5 rounded-lg border border-stone-100/80 transition-all cursor-pointer group">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-xs font-bold text-stone-800 flex items-center gap-1.5 flex-1 min-w-0">
                      <span class="truncate">{{ n.title }}</span>
                      <span v-if="!n.isRead" class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    </h4>
                    <button
                      type="button"
                      @click.stop="deleteNotification(n.id)"
                      class="text-stone-300 hover:text-rose-600 text-[11px] font-bold px-1 rounded transition-colors shrink-0 cursor-pointer"
                      title="ลบการแจ้งเตือนนี้"
                    >
                      ✕
                    </button>
                  </div>
                  <p class="text-[11px] text-stone-500 mt-0.5 break-words">{{ n.message }}</p>
                  <p class="text-[9px] text-stone-400 mt-1 tabular-nums">{{ new Date(n.createdAt).toLocaleDateString('th-TH', { hour: 'numeric', minute: 'numeric' }) }}</p>
                </div>
              </div>
            </div>
          </div>

          <a 
            href="/manual.html" 
            target="_blank" 
            class="min-h-[42px] bg-white hover:bg-stone-50 text-stone-700 hover:text-amber-900 font-bold px-3.5 py-2 rounded-xl border border-amber-200/90 transition-all text-xs sm:text-sm inline-flex items-center gap-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            title="เปิดอ่านคู่มือการใช้งานระบบ FlowSpace"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span class="hidden sm:inline">คู่มือใช้งาน</span>
          </a>

          <NuxtLink 
            v-if="currentUser?.role === 'ADMIN'"
            to="/admin" 
            class="min-h-[42px] bg-amber-100/90 hover:bg-amber-200/90 text-amber-950 font-bold px-3.5 py-2 rounded-xl border border-amber-300 transition-all text-xs sm:text-sm inline-flex items-center gap-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            title="เปิดแผงควบคุมระบบ (Admin Portal)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            <span class="hidden sm:inline">แผงควบคุม Admin</span>
          </NuxtLink>

          <!-- User Profile Chip -->
          <div class="min-h-[42px] text-xs sm:text-sm font-bold text-stone-700 bg-[#f5ecdc] px-3 py-1.5 rounded-xl border border-amber-200/90 flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-black flex items-center justify-center uppercase shrink-0 shadow-xs" aria-hidden="true">
              {{ (currentUser?.username || 'U').charAt(0) }}
            </div>
            <span class="max-w-[110px] sm:max-w-[150px] truncate">{{ currentUser?.username || 'User' }}</span>
            <span v-if="currentUser?.role === 'ADMIN'" class="text-[10px] bg-amber-600 text-white font-extrabold px-1.5 py-0.5 rounded-md tracking-wide">
              ADMIN
            </span>
          </div>

          <!-- Logout Button -->
          <button 
            type="button"
            @click="handleLogout" 
            class="min-h-[42px] bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 font-bold px-3.5 py-2 rounded-xl transition-all border border-stone-200/90 hover:border-rose-200 text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            title="ออกจากระบบ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 shrink-0" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span class="hidden md:inline">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-3.5 sm:py-5 relative z-10">
      
      <!-- Hero Banner & Action Toolbar -->
      <div class="rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-amber-200/80 dark:border-slate-800 p-4 sm:p-5 mb-3.5 sm:mb-4.5 shadow-lg shadow-amber-950/5 dark:shadow-black/30 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-500" aria-hidden="true"></div>
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-800 text-[11px] font-extrabold mb-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Workspace Command Center</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              สวัสดี, {{ currentUser?.username || 'สมาชิก' }}
            </h2>
            <p class="text-stone-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-0.5">
              เลือกบอร์ดเวิร์กสเปซของคุณ หรือนำรหัสเชิญ 6 หลักมาเข้าร่วมทีมเพื่อลุยงานต่อทันที
            </p>
          </div>
          
          <!-- Law 2: Single Primary Action — Only render toolbar CTAs when projects exist -->
          <div v-if="!isLoading && projects.length > 0" class="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
            <button 
              type="button"
              @click="openJoinModal"
              class="w-full sm:w-auto min-h-[44px] bg-stone-50 hover:bg-stone-100 text-amber-950 font-bold px-4 py-2.5 rounded-xl transition-all border border-amber-300/90 shadow-2xs text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-600" aria-hidden="true">
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m21 2-9.6 9.6" />
                <path d="m15.5 7.5 3 3L22 7l-3-3" />
              </svg>
              <span>กรอกรหัสเข้าร่วม</span>
            </button>
            <button 
              type="button"
              @click="openCreateProjectModal"
              class="w-full sm:w-auto min-h-[44px] bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/25 active:scale-[0.99] text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              <span>สร้างโปรเจกต์ใหม่</span>
            </button>
          </div>
        </div>

        <!-- 3-Card Bento KPI Overview Strip (Shown when user has projects) -->
        <div v-if="!isLoading && projects.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-3.5 pt-3.5 border-t border-stone-200/70 dark:border-slate-800">
          <!-- KPI 1: Total Workspaces -->
          <div class="rounded-2xl bg-stone-50/90 border border-stone-200/80 p-3 sm:p-3.5 flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">เวิร์กสเปซทั้งหมด</p>
              <p class="text-xl sm:text-2xl font-black text-stone-800 tabular-nums mt-0.5">{{ projects.length }}</p>
              <p class="text-[11px] font-semibold text-stone-500 mt-0.5">โปรเจกต์ที่คุณเข้าถึงได้</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </div>
          </div>

          <!-- KPI 2: Owned Workspaces -->
          <div class="rounded-2xl bg-stone-50/90 border border-stone-200/80 p-3 sm:p-3.5 flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">คุณเป็นเจ้าของ (Owner)</p>
              <p class="text-xl sm:text-2xl font-black text-amber-700 tabular-nums mt-0.5">{{ ownedCount }}</p>
              <p class="text-[11px] font-semibold text-stone-500 mt-0.5">สิทธิ์จัดการบอร์ดเต็มรูปแบบ</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-400/30 text-orange-500 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </div>
          </div>

          <!-- KPI 3: Team Collaborations -->
          <div class="rounded-2xl bg-stone-50/90 border border-stone-200/80 p-3 sm:p-3.5 flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">ร่วมทีม (Member)</p>
              <p class="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums mt-0.5">{{ memberCount }}</p>
              <p class="text-[11px] font-semibold text-stone-500 mt-0.5">โปรเจกต์ที่เข้าร่วมกับทีม</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-500 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar (Shown when user has projects) -->
      <div v-if="!isLoading && projects.length > 0" class="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-amber-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 mb-3.5 sm:mb-4.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1">
          <label for="workspace-search" class="sr-only">ค้นหาโปรเจกต์</label>
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            id="workspace-search"
            v-model="searchQuery"
            type="search"
            placeholder="ค้นหาชื่อโปรเจกต์ รายละเอียด หรือชื่อเจ้าของ..."
            class="w-full min-h-[44px] bg-stone-50/80 border border-stone-200/90 rounded-xl pl-10 pr-9 py-2 text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            aria-label="ล้างคำค้นหา"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Role Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0" role="group" aria-label="กรองตามบทบาทในโปรเจกต์">
          <button
            type="button"
            @click="roleFilter = 'ALL'"
            :aria-pressed="roleFilter === 'ALL'"
            :class="roleFilter === 'ALL' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-stone-600 border-amber-200/80 hover:bg-amber-50/60'"
            class="min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>ทั้งหมด</span>
            <span :class="roleFilter === 'ALL' ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600'" class="px-1.5 py-0.5 rounded-md text-[11px] font-extrabold tabular-nums">
              {{ projects.length }}
            </span>
          </button>

          <button
            type="button"
            @click="roleFilter = 'OWNER'"
            :aria-pressed="roleFilter === 'OWNER'"
            :class="roleFilter === 'OWNER' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-stone-600 border-amber-200/80 hover:bg-amber-50/60'"
            class="min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>เจ้าของบอร์ด</span>
            <span :class="roleFilter === 'OWNER' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'" class="px-1.5 py-0.5 rounded-md text-[11px] font-extrabold tabular-nums">
              {{ ownedCount }}
            </span>
          </button>

          <button
            type="button"
            @click="roleFilter = 'MEMBER'"
            :aria-pressed="roleFilter === 'MEMBER'"
            :class="roleFilter === 'MEMBER' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-stone-600 border-amber-200/80 hover:bg-amber-50/60'"
            class="min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>สมาชิกทีม</span>
            <span :class="roleFilter === 'MEMBER' ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600'" class="px-1.5 py-0.5 rounded-md text-[11px] font-extrabold tabular-nums">
              {{ memberCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Progressive Skeleton Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="status" aria-label="กำลังโหลดเวิร์กสเปซ">
        <div v-for="n in 3" :key="n" class="bg-white/90 border border-amber-200/60 rounded-2xl p-5 shadow-xs animate-pulse flex flex-col justify-between h-52">
          <div>
            <div class="flex justify-between items-center gap-3 mb-3">
              <div class="h-5 bg-amber-200/60 rounded-lg w-2/3"></div>
              <div class="h-5 bg-amber-100 rounded-full w-16"></div>
            </div>
            <div class="h-3.5 bg-stone-200/70 rounded w-full mb-2"></div>
            <div class="h-3.5 bg-stone-200/50 rounded w-4/5"></div>
          </div>
          <div class="pt-4 border-t border-amber-100/80 flex justify-between items-center">
            <div class="h-4 bg-stone-200/60 rounded w-24"></div>
            <div class="h-9 bg-amber-200/50 rounded-xl w-24"></div>
          </div>
        </div>
      </div>

      <!-- Empty State Hero Card (Law 2: Single Primary CTA when no projects exist) -->
      <div v-else-if="projects.length === 0" class="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-200/80 rounded-3xl p-6 sm:p-10 text-center max-w-xl mx-auto shadow-2xl shadow-amber-950/5 mt-4 sm:mt-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" aria-hidden="true"></div>

        <div class="w-16 h-16 rounded-2xl bg-amber-100/90 text-amber-800 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8" aria-hidden="true">
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            <line x1="12" x2="12" y1="10" y2="16" />
            <line x1="9" x2="15" y1="13" y2="13" />
          </svg>
        </div>

        <h3 class="text-lg sm:text-xl font-extrabold text-stone-800 mb-2">
          คุณยังไม่มีเวิร์กสเปซในขณะนี้
        </h3>
        <p class="text-stone-500 text-xs sm:text-sm font-medium mb-6 max-w-md mx-auto leading-relaxed">
          เริ่มต้นสร้างบอร์ดใหม่เพื่อจัดระเบียบงานของคุณ หรือนำรหัสเชิญ 6 หลักจากเพื่อนร่วมทีมมากรอกเพื่อเริ่มทำงานร่วมกันได้ทันที
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button 
            type="button"
            @click="openCreateProjectModal"
            class="w-full sm:w-auto min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/20 text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            <span>สร้างโปรเจกต์ใหม่</span>
          </button>
          <button 
            type="button"
            @click="openJoinModal"
            class="w-full sm:w-auto min-h-[44px] bg-white hover:bg-stone-50 text-amber-950 font-bold px-5 py-2.5 rounded-xl transition-all border border-amber-300 text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-700" aria-hidden="true">
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="m21 2-9.6 9.6" />
              <path d="m15.5 7.5 3 3L22 7l-3-3" />
            </svg>
            <span>กรอกรหัสเข้าร่วม</span>
          </button>
        </div>

        <!-- Banner แนะนำคู่มือการใช้งานสำหรับสมาชิกใหม่ -->
        <div class="mt-8 pt-6 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-left bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <h4 class="text-xs font-black text-amber-950 uppercase tracking-wider">เพิ่งเริ่มต้นใช้งาน FlowSpace?</h4>
              <p class="text-xs text-stone-600 font-medium mt-0.5">ศึกษาวิธีสร้างบอร์ด มอบหมายงาน และตั้งค่าระบบยศได้ในคู่มือ</p>
            </div>
          </div>
          <div class="flex gap-2 w-full sm:w-auto shrink-0 justify-center">
            <a 
              href="/manual.html" 
              target="_blank" 
              class="w-full sm:w-auto min-h-[44px] text-xs bg-white hover:bg-stone-50 text-amber-950 font-bold px-3.5 py-2 rounded-xl border border-amber-300 transition-all inline-flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>เปิดอ่านคู่มือ</span>
            </a>
            <a 
              href="/FlowSpace_User_Manual.pdf" 
              download="FlowSpace_User_Manual.pdf" 
              class="w-full sm:w-auto min-h-[44px] text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs inline-flex items-center justify-center gap-1.5"
            >
              <span>โหลด PDF</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Empty Filter Result Recovery -->
      <div v-else-if="filteredProjects.length === 0" class="bg-white/90 border border-amber-200/80 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm my-4">
        <div class="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3 class="text-base sm:text-lg font-extrabold text-stone-800 mb-1">ไม่พบโปรเจกต์ที่ตรงกับเงื่อนไข</h3>
        <p class="text-xs sm:text-sm text-stone-500 font-medium mb-4">
          ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองเพื่อแสดงโปรเจกต์ทั้งหมดของคุณ
        </p>
        <button
          type="button"
          @click="searchQuery = ''; roleFilter = 'ALL'"
          class="min-h-[44px] px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs sm:text-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>ล้างตัวกรองทั้งหมด</span>
        </button>
      </div>

      <!-- Workspace Bento Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
        <article 
          v-for="project in filteredProjects" 
          :key="project.id" 
          role="button"
          tabindex="0"
          @click="goToProject(project)"
          @keydown.enter="goToProject(project)"
          class="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl hover:bg-white border border-stone-200/90 dark:border-slate-800 hover:border-amber-400/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <!-- Permanent Color-Coded Top Accent Strip -->
          <div
            class="absolute top-0 left-0 right-0 h-1.5 transition-all"
            :class="project.isOwner ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500'"
            aria-hidden="true"
          ></div>

          <div>
            <!-- Card Header: Icon + Name + Role Badge -->
            <div class="flex justify-between items-start gap-3 mb-2.5 mt-0.5">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-xs"
                  :class="project.isOwner
                    ? 'bg-amber-500/15 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                    : 'bg-emerald-500/15 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white'"
                  aria-hidden="true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 :title="project.name" class="text-base sm:text-lg font-extrabold text-stone-900 dark:text-white group-hover:text-amber-600 transition-colors break-words leading-snug">
                    {{ project.name }}
                  </h3>
                  <p class="text-[11px] font-semibold text-stone-400 mt-0.5">
                    {{ project.isOwner ? 'เวิร์กสเปซของคุณ' : 'เวิร์กสเปซทีมร่วมงาน' }}
                  </p>
                </div>
              </div>

              <span 
                :class="project.isOwner ? 'bg-amber-100 text-amber-900 border-amber-300/80' : 'bg-emerald-50 text-emerald-700 border-emerald-200'" 
                class="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 inline-flex items-center gap-1"
              >
                <svg v-if="project.isOwner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-amber-700" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{{ project.isOwner ? 'Owner' : 'Member' }}</span>
              </span>
            </div>

            <!-- Description -->
            <p class="text-stone-500 dark:text-slate-400 text-xs sm:text-sm font-medium line-clamp-2 mb-3.5 break-words leading-relaxed">
              {{ project.description || 'ไม่มีคำอธิบายรายละเอียดโปรเจกต์...' }}
            </p>
          </div>

          <!-- Card Footer: Owner Info & Actions (44x44px touch targets) -->
          <div class="pt-2.5 border-t border-stone-100 dark:border-slate-800 flex justify-between items-center gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 rounded-full bg-stone-200 text-stone-700 text-xs font-black flex items-center justify-center uppercase shrink-0" aria-hidden="true">
                {{ (project.ownerName || 'O').charAt(0) }}
              </div>
              <span class="text-xs text-stone-500 font-semibold truncate">
                โดย <span class="text-stone-800 font-bold">{{ project.ownerName }}</span>
              </span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button 
                v-if="project.isOwner" 
                type="button"
                @click.stop="openEditProjectModal(project)" 
                class="min-h-[42px] min-w-[42px] bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 font-bold text-xs px-3 py-2 rounded-xl border border-stone-200/90 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                title="แก้ไขชื่อและรายละเอียดโปรเจกต์"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" aria-hidden="true">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                <span>แก้ไข</span>
              </button>
              <span class="min-h-[42px] bg-amber-500/15 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 text-amber-900 group-hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-amber-300/60 group-hover:border-transparent transition-all inline-flex items-center gap-1.5 shadow-2xs">
                <span>เปิดบอร์ด</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Modal สำหรับ สร้าง/แก้ไข โปรเจกต์ -->
    <div 
      v-if="isModalOpen" 
      @click.self="closeModal"
      class="fixed inset-0 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" aria-hidden="true"></div>

        <div class="flex items-center justify-between gap-2 mt-1 mb-4">
          <h2 id="modal-project-title" class="text-lg sm:text-xl font-extrabold text-stone-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-amber-600" aria-hidden="true">
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            </svg>
            <span>{{ isEditProjectMode ? 'แก้ไขรายละเอียดโปรเจกต์' : 'สร้างโปรเจกต์ใหม่' }}</span>
          </h2>
          <button
            type="button"
            @click="closeModal"
            aria-label="ปิดหน้าต่าง"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="isEditProjectMode ? handleUpdateProject() : handleCreateProject()" class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label for="project-name-input" class="block text-xs sm:text-sm font-bold text-stone-700">ชื่อโปรเจกต์</label>
              <span class="text-[11px] font-mono tabular-nums" :class="projectName.length >= 50 ? 'text-rose-600 font-bold' : 'text-stone-400'">
                {{ projectName.length }}/50
              </span>
            </div>
            <input 
              id="project-name-input"
              v-model="projectName" 
              type="text" 
              maxlength="50" 
              placeholder="เช่น พัฒนาแอปคลังมังงะ" 
              required 
              class="w-full bg-white border border-amber-200/90 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" 
            />
          </div>
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label for="project-desc-input" class="block text-xs sm:text-sm font-bold text-stone-700">รายละเอียด <span class="text-stone-400 font-medium">(ไม่บังคับ)</span></label>
              <span class="text-[11px] font-mono tabular-nums text-stone-400">
                {{ projectDescription.length }}/500
              </span>
            </div>
            <textarea 
              id="project-desc-input"
              v-model="projectDescription" 
              maxlength="500" 
              rows="3" 
              placeholder="อธิบายจุดประสงค์ของโปรเจกต์สั้นๆ..." 
              class="w-full bg-white border border-amber-200/90 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            ></textarea>
          </div>
          <p v-if="modalMessage" role="alert" class="text-xs sm:text-sm text-center font-bold py-2.5 px-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {{ modalMessage }}
          </p>
          <div class="flex justify-end gap-2.5 pt-2">
            <button 
              type="button" 
              @click="closeModal" 
              class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center cursor-pointer"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting" 
              class="min-h-[44px] px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-300 disabled:to-stone-400 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-amber-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span v-if="isSubmitting" class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" aria-hidden="true"></span>
              <span>{{ isSubmitting ? 'กำลังบันทึก...' : (isEditProjectMode ? 'บันทึกการแก้ไข' : 'สร้างโปรเจกต์') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal สำหรับ เข้าร่วมโปรเจกต์ -->
    <div 
      v-if="isJoinModalOpen" 
      @click.self="closeJoinModal"
      class="fixed inset-0 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-join-title"
    >
      <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" aria-hidden="true"></div>

        <div class="flex items-center justify-between gap-2 mt-1 mb-1">
          <h2 id="modal-join-title" class="text-lg sm:text-xl font-extrabold text-stone-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-amber-600" aria-hidden="true">
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="m21 2-9.6 9.6" />
              <path d="m15.5 7.5 3 3L22 7l-3-3" />
            </svg>
            <span>เข้าร่วมโปรเจกต์</span>
          </h2>
          <button
            type="button"
            @click="closeJoinModal"
            aria-label="ปิดหน้าต่าง"
            class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <p class="text-stone-500 text-xs sm:text-sm font-medium mb-4">
          นำรหัสเชิญ 6 หลักจากเจ้าของโปรเจกต์มาวางเพื่อเข้าร่วมทีมทันที
        </p>

        <form @submit.prevent="handleJoinProject" class="space-y-4">
          <div>
            <label for="invite-code-input" class="sr-only">รหัสเชิญ 6 หลัก</label>
            <input 
              id="invite-code-input"
              v-model="codeToJoin" 
              type="text" 
              placeholder="A7B9X2" 
              maxlength="6" 
              required 
              class="w-full min-h-[52px] bg-white border border-amber-200/90 rounded-xl px-4 py-3 text-center text-xl font-mono font-black uppercase text-amber-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all tracking-[0.25em]" 
            />
          </div>
          <p v-if="joinError" role="alert" class="text-xs text-center text-rose-700 font-bold bg-rose-50 py-2 px-3 rounded-xl border border-rose-200">
            {{ joinError }}
          </p>
          <div class="flex justify-end gap-2.5 pt-2">
            <button 
              type="button" 
              @click="closeJoinModal" 
              class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center cursor-pointer"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              :disabled="isJoining || !codeToJoin.trim()"
              class="min-h-[44px] px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-amber-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span v-if="isJoining" class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" aria-hidden="true"></span>
              <span>{{ isJoining ? 'กำลังเข้าร่วม...' : 'เข้าร่วมบอร์ด' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal ยืนยันการออกจากระบบ -->
    <div 
      v-if="isLogoutModalOpen" 
      @click.self="isLogoutModalOpen = false"
      class="fixed inset-0 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-logout-title"
    >
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" aria-hidden="true"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-2xl shrink-0" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </div>
          <div>
            <h3 id="modal-logout-title" class="text-base sm:text-lg font-black text-stone-800 mb-1">
              ยืนยันการออกจากระบบ
            </h3>
            <p class="text-stone-500 text-xs sm:text-sm font-medium leading-relaxed">
              คุณต้องการออกจากระบบใช่หรือไม่? เมื่อออกจากระบบแล้ว คุณสามารถเข้าสู่ระบบใหม่ได้ทุกเมื่อ
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 mt-6 pt-4 border-t border-stone-200/60">
          <button 
            type="button"
            @click="isLogoutModalOpen = false" 
            class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center cursor-pointer"
          >
            ยกเลิก
          </button>
          <button 
            type="button"
            @click="confirmLogout" 
            class="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Toast />

  </div>
</template>

<style scoped>
.bg-grid {
  background-image: radial-gradient(#bcaaa4 1px, transparent 1px);
  background-size: 24px 24px;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({ middleware: 'auth' })

const currentUser = ref(null)
const projects = ref([])
const isLoading = ref(true)

// Search & Filter State
const searchQuery = ref('')
const roleFilter = ref('ALL') // 'ALL' | 'OWNER' | 'MEMBER'

const ownedCount = computed(() => projects.value.filter(p => p.isOwner).length)
const memberCount = computed(() => projects.value.filter(p => !p.isOwner).length)

const filteredProjects = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return projects.value.filter(project => {
    if (roleFilter.value === 'OWNER' && !project.isOwner) return false
    if (roleFilter.value === 'MEMBER' && project.isOwner) return false
    if (!q) return true
    const matchName = (project.name || '').toLowerCase().includes(q)
    const matchDesc = (project.description || '').toLowerCase().includes(q)
    const matchOwner = (project.ownerName || '').toLowerCase().includes(q)
    return matchName || matchDesc || matchOwner
  })
})

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const projectName = ref('')
const projectDescription = ref('')
const modalMessage = ref('')
const isEditProjectMode = ref(false)
const editingProjectId = ref(null)

const isJoinModalOpen = ref(false)
const isJoining = ref(false)
const codeToJoin = ref('')
const joinError = ref('')
const isLogoutModalOpen = ref(false)

const { showToast } = useToast()

const notifications = ref([])
const isNotificationsOpen = ref(false)

const fetchNotifications = async () => {
  try {
    const res = await $fetch('/api/notifications')
    if (res.success) notifications.value = res.data
  } catch (err) { console.error(err) }
}

const markNotificationRead = async (id) => {
  try {
    const res = await $fetch('/api/notifications', { method: 'PUT', body: { id } })
    if (res.success) {
      notifications.value = notifications.value.map(n => n.id === id ? { ...n, isRead: true } : n)
    }
  } catch (err) { console.error(err) }
}

const markAllNotificationsRead = async () => {
  try {
    const res = await $fetch('/api/notifications', { method: 'PUT', body: { all: true } })
    if (res.success) {
      notifications.value = notifications.value.map(n => ({ ...n, isRead: true }))
    }
  } catch (err) { console.error(err) }
}

const deleteNotification = async (id) => {
  const backup = [...notifications.value]
  notifications.value = notifications.value.filter(n => n.id !== id)
  try {
    await $fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
  } catch (err) {
    notifications.value = backup
    showToast(err?.data?.message || 'ลบการแจ้งเตือนไม่สำเร็จ ❌', 'error')
  }
}

const clearAllNotifications = async () => {
  const backup = [...notifications.value]
  notifications.value = []
  try {
    await $fetch('/api/notifications?all=true', { method: 'DELETE' })
  } catch (err) {
    notifications.value = backup
    showToast(err?.data?.message || 'ล้างการแจ้งเตือนไม่สำเร็จ ❌', 'error')
  }
}

const fetchProjects = async () => {
  if (!currentUser.value) return
  isLoading.value = true
  try {
    const response = await $fetch('/api/projects/list')
    if (response.success) projects.value = response.projects
  } catch (error) { console.error(error) }
  finally { isLoading.value = false }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && currentUser.value) {
    fetchProjects()
    fetchNotifications()
  }
}

const handleGlobalKeydown = (e) => {
  if (e.key === 'Escape') {
    if (isNotificationsOpen.value) { isNotificationsOpen.value = false; return }
    if (isModalOpen.value) closeModal()
    if (isJoinModalOpen.value) closeJoinModal()
    if (isLogoutModalOpen.value) isLogoutModalOpen.value = false
  }
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)
    window.addEventListener('keydown', handleGlobalKeydown)
  }

  const cachedUser = localStorage.getItem('user')
  if (cachedUser) {
    try {
      currentUser.value = JSON.parse(cachedUser)
      fetchProjects()
      fetchNotifications()
    } catch (e) {}
  }

  try {
    const meRes = await $fetch('/api/auth/me')
    if (meRes.success) {
      const prevId = currentUser.value?.id
      currentUser.value = meRes.user
      localStorage.setItem('user', JSON.stringify(meRes.user))
      if (!prevId || prevId !== meRes.user.id) {
        fetchProjects()
      }
      fetchNotifications()
    }
  } catch (error) {
    localStorage.removeItem('user')
    navigateTo('/login')
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleVisibilityChange)
    window.removeEventListener('keydown', handleGlobalKeydown)
  }
})

const handleCreateProject = async () => {
  if (!projectName.value.trim() || !currentUser.value) return
  if (projectName.value.trim().length > 50) {
    modalMessage.value = 'ชื่อโปรเจกต์ต้องมีความยาวไม่เกิน 50 ตัวอักษร'
    return
  }
  if (projectDescription.value.trim().length > 500) {
    modalMessage.value = 'รายละเอียดโปรเจกต์ต้องมีความยาวไม่เกิน 500 ตัวอักษร'
    return
  }
  isSubmitting.value = true
  modalMessage.value = ''
  try {
    const response = await $fetch('/api/projects/create', {
      method: 'POST',
      body: { name: projectName.value.trim(), description: projectDescription.value.trim() }
    })
    if (response.success && response.project) {
      closeModal()
      await fetchProjects()
      navigateTo(buildProjectUrl(response.project.id, response.project.name))
    }
  } catch (error) { modalMessage.value = error.data?.message || 'เกิดข้อผิดพลาดในการสร้างเวิร์กสเปซ' }
  finally { isSubmitting.value = false }
}

const handleUpdateProject = async () => {
  if (!projectName.value.trim() || !currentUser.value || !editingProjectId.value) return
  if (projectName.value.trim().length > 50) {
    modalMessage.value = 'ชื่อโปรเจกต์ต้องมีความยาวไม่เกิน 50 ตัวอักษร'
    return
  }
  if (projectDescription.value.trim().length > 500) {
    modalMessage.value = 'รายละเอียดโปรเจกต์ต้องมีความยาวไม่เกิน 500 ตัวอักษร'
    return
  }
  isSubmitting.value = true
  modalMessage.value = ''
  try {
    const response = await $fetch('/api/projects/update', {
      method: 'PUT',
      body: { id: editingProjectId.value, name: projectName.value.trim(), description: projectDescription.value.trim() }
    })
    if (response.success) { closeModal(); await fetchProjects() }
  } catch (error) { modalMessage.value = error.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขรายละเอียดเวิร์กสเปซ' }
  finally { isSubmitting.value = false }
}

const openCreateProjectModal = () => {
  isEditProjectMode.value = false
  editingProjectId.value = null
  projectName.value = ''
  projectDescription.value = ''
  modalMessage.value = ''
  isModalOpen.value = true
}

const openEditProjectModal = (project) => {
  isEditProjectMode.value = true
  editingProjectId.value = project.id
  projectName.value = project.name
  projectDescription.value = project.description || ''
  modalMessage.value = ''
  isModalOpen.value = true
}

const openJoinModal = () => {
  codeToJoin.value = ''
  joinError.value = ''
  isJoinModalOpen.value = true
}

const closeJoinModal = () => {
  isJoinModalOpen.value = false
  codeToJoin.value = ''
  joinError.value = ''
}

const handleJoinProject = async () => {
  if (!codeToJoin.value.trim() || !currentUser.value || isJoining.value) return
  isJoining.value = true
  joinError.value = ''
  try {
    const response = await $fetch('/api/projects/join', {
      method: 'POST',
      body: { inviteCode: codeToJoin.value.trim() }
    })
    if (response.success) {
      closeJoinModal()
      showToast(response.message, 'success')
      navigateTo(buildProjectUrl(response.projectId))
    }
  } catch (error) { 
    joinError.value = error.data?.message || 'รหัสเชิญไม่ถูกต้องหรือหมดอายุ' 
  } finally {
    isJoining.value = false
  }
}

const closeModal = () => {
  isModalOpen.value = false
  projectName.value = ''
  projectDescription.value = ''
  modalMessage.value = ''
  isEditProjectMode.value = false
  editingProjectId.value = null
}

const goToProject = (projectOrId) => {
  if (projectOrId && typeof projectOrId === 'object') {
    navigateTo(buildProjectUrl(projectOrId.id, projectOrId.name))
  } else {
    navigateTo(buildProjectUrl(projectOrId))
  }
}

const handleLogout = () => {
  isLogoutModalOpen.value = true
}

const confirmLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch (e) {}
  localStorage.removeItem('user')
  navigateTo('/login')
}
</script>