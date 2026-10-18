<!-- app/pages/admin.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] text-stone-800 flex flex-col relative overflow-x-hidden bg-grid">
    
    <!-- Background ambient lighting (Reduced GPU load on mobile) -->
    <div class="hidden sm:block absolute top-[-10%] left-[-10%] w-[420px] h-[420px] bg-amber-200/35 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] bg-orange-200/25 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

    <!-- Header -->
    <header class="sticky top-0 z-30 bg-[#fdfaf5]/90 backdrop-blur-md border-b border-amber-200/80 px-4 py-3 shadow-xs">
      <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
        <div class="flex items-center gap-3">
          <NuxtLink 
            to="/dashboard"
            class="min-h-[44px] px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 hover:text-amber-900 font-bold rounded-xl text-xs sm:text-sm transition-all border border-amber-200/90 shadow-2xs inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            title="กลับสู่หน้าแดชบอร์ด"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span class="hidden sm:inline">แดชบอร์ด</span>
          </NuxtLink>

          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-600/20 shrink-0" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <div>
              <h1 class="text-base sm:text-xl font-black text-stone-800 tracking-tight leading-none">
                FlowSpace Admin
              </h1>
              <p class="text-[11px] text-stone-400 font-semibold mt-0.5 hidden sm:block">
                ศูนย์ควบคุมระบบและจัดการผู้ใช้งาน
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="min-h-[44px] text-xs sm:text-sm font-bold text-stone-700 bg-[#f5ecdc] px-3 py-1.5 rounded-xl border border-amber-300/90 flex items-center gap-2 shadow-2xs">
            <div class="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center uppercase shrink-0" aria-hidden="true">
              {{ (currentAdmin?.username || 'A').charAt(0) }}
            </div>
            <span class="max-w-[120px] sm:max-w-[160px] truncate">{{ currentAdmin?.username || 'Admin' }}</span>
            <span class="text-[10px] bg-amber-700 text-white font-extrabold px-1.5 py-0.5 rounded-md tracking-wide">SUPER ADMIN</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10">
      
      <!-- Tabs Navigation -->
      <div class="flex flex-wrap gap-2 border-b border-amber-200/80 pb-3 mb-6" role="tablist" aria-label="หมวดหมู่การจัดการระบบ">
        <button 
          type="button"
          role="tab"
          :aria-selected="activeTab === 'overview'"
          @click="activeTab = 'overview'; fetchStats()" 
          :class="activeTab === 'overview' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 border-transparent' : 'bg-[#fdfaf5] hover:bg-white text-stone-700 border-amber-200/90'"
          class="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>📊</span>
          <span>ภาพรวมระบบ</span>
        </button>
        <button 
          type="button"
          role="tab"
          :aria-selected="activeTab === 'users'"
          @click="activeTab = 'users'; fetchUsers(userPagination.page); fetchStats()" 
          :class="activeTab === 'users' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 border-transparent' : 'bg-[#fdfaf5] hover:bg-white text-stone-700 border-amber-200/90'"
          class="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>👥</span>
          <span>จัดการผู้ใช้</span>
          <span v-if="stats?.totalUsers" :class="activeTab === 'users' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-900'" class="text-[11px] font-extrabold px-2 py-0.5 rounded-full tabular-nums">{{ stats.totalUsers }}</span>
        </button>
        <button 
          type="button"
          role="tab"
          :aria-selected="activeTab === 'workspaces'"
          @click="activeTab = 'workspaces'; fetchProjects(projectPagination.page); fetchStats()" 
          :class="activeTab === 'workspaces' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 border-transparent' : 'bg-[#fdfaf5] hover:bg-white text-stone-700 border-amber-200/90'"
          class="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>🗂️</span>
          <span>เวิร์กสเปซทั้งหมด</span>
          <span v-if="stats?.totalProjects" :class="activeTab === 'workspaces' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-900'" class="text-[11px] font-extrabold px-2 py-0.5 rounded-full tabular-nums">{{ stats.totalProjects }}</span>
        </button>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: OVERVIEW -->
      <!-- ========================================== -->
      <section v-if="activeTab === 'overview'" class="space-y-6">
        
        <div v-if="isLoadingStats" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
          <p class="text-stone-500 font-bold text-sm">กำลังโหลดสถิติระบบ...</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <!-- Card 1: Users -->
          <div class="bg-[#fdfaf5] border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">ผู้ใช้งานทั้งหมด</span>
              <span class="text-2xl">👥</span>
            </div>
            <div class="text-3xl font-black text-stone-800">{{ stats?.totalUsers || 0 }}</div>
            <div class="mt-3 flex items-center justify-between text-xs text-stone-500">
              <span>ยืนยันอีเมลแล้ว {{ stats?.verifiedUsers || 0 }} คน</span>
              <span class="font-bold text-emerald-600">{{ stats?.verificationRate || 0 }}%</span>
            </div>
            <div class="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full transition-all" :style="{ width: `${stats?.verificationRate || 0}%` }"></div>
            </div>
          </div>

          <!-- Card 2: Workspaces -->
          <div class="bg-[#fdfaf5] border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">บอร์ดเวิร์กสเปซ</span>
              <span class="text-2xl">🗂️</span>
            </div>
            <div class="text-3xl font-black text-amber-900">{{ stats?.totalProjects || 0 }}</div>
            <p class="text-xs text-stone-500 mt-3 font-medium">โปรเจกต์ที่เปิดใช้งานทั้งหมดในระบบ</p>
          </div>

          <!-- Card 3: Tasks -->
          <div class="bg-[#fdfaf5] border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">การ์ดงานทั้งหมด</span>
              <span class="text-2xl">📋</span>
            </div>
            <div class="text-3xl font-black text-amber-900">{{ stats?.totalTasks || 0 }}</div>
            <p class="text-xs text-stone-500 mt-3 font-medium">ประวัติกิจกรรม {{ stats?.totalLogs || 0 }} รายการ</p>
          </div>

          <!-- Card 4: Moderation -->
          <div class="bg-[#fdfaf5] border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">สถานะการกำกับดูแล</span>
              <span class="text-2xl">🔒</span>
            </div>
            <div class="text-3xl font-black text-rose-600">{{ stats?.bannedUsers || 0 }}</div>
            <div class="mt-3 flex items-center justify-between text-xs text-stone-500">
              <span>รอยืนยันอีเมล {{ stats?.unverifiedUsers || 0 }}</span>
              <span>แอดมิน {{ stats?.adminUsers || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 class="text-base font-extrabold text-stone-800 mb-3 flex items-center gap-2">
            <span>⚡</span> เมนูกู้ชีพด่วนสำหรับช่วยเหลือยูสเซอร์ (Quick Actions)
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              @click="activeTab = 'users'; userFilter = 'unverified'; fetchUsers()"
              class="p-4 bg-white hover:bg-amber-50 rounded-xl border border-amber-200 transition-all text-left flex items-start gap-3"
            >
              <span class="text-2xl">✉️</span>
              <div>
                <p class="font-bold text-sm text-stone-800">กู้ชีพคนติดอีเมล</p>
                <p class="text-xs text-stone-500 mt-0.5">กดยืนยันอีเมลให้ผู้ใช้ที่ลิงก์หมดอายุ</p>
              </div>
            </button>
            <button 
              @click="activeTab = 'users'; userFilter = 'all'; fetchUsers()"
              class="p-4 bg-white hover:bg-amber-50 rounded-xl border border-amber-200 transition-all text-left flex items-start gap-3"
            >
              <span class="text-2xl">🔑</span>
              <div>
                <p class="font-bold text-sm text-stone-800">รีเซ็ตรหัสผ่านให้ยูสเซอร์</p>
                <p class="text-xs text-stone-500 mt-0.5">ออกรหัสชั่วคราวฉุกเฉินให้ผู้ใช้</p>
              </div>
            </button>
            <button 
              @click="activeTab = 'users'; userFilter = 'banned'; fetchUsers()"
              class="p-4 bg-white hover:bg-amber-50 rounded-xl border border-amber-200 transition-all text-left flex items-start gap-3"
            >
              <span class="text-2xl">🔒</span>
              <div>
                <p class="font-bold text-sm text-stone-800">จัดการบัญชีที่ถูกแบน</p>
                <p class="text-xs text-stone-500 mt-0.5">ตรวจสอบหรือปลดแบนยูสเซอร์</p>
              </div>
            </button>
          </div>
        </div>

      </section>

      <!-- ========================================== -->
      <!-- TAB 2: USER MANAGEMENT -->
      <!-- ========================================== -->
      <section v-else-if="activeTab === 'users'" class="space-y-4">
        
        <!-- Search & Filter Controls -->
        <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <!-- Search Box -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
            <input 
              v-model="userSearchQuery" 
              @input="handleUserSearchInput"
              type="text" 
              placeholder="ค้นหาด้วยชื่อผู้ใช้ หรืออีเมล..." 
              class="w-full bg-white border border-amber-200 rounded-xl pl-10 pr-4 py-2.5 min-h-[44px] text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <!-- Filter Pills -->
          <div class="flex flex-wrap gap-1.5 items-center">
            <button 
              v-for="filterOpt in [
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'unverified', label: '🟡 รออีเมล' },
                { id: 'banned', label: '🔴 ถูกแบน' },
                { id: 'admin', label: '👑 แอดมิน' }
              ]"
              :key="filterOpt.id"
              @click="userFilter = filterOpt.id; fetchUsers(1)"
              :class="userFilter === filterOpt.id ? 'bg-amber-600 text-white' : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'"
              class="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              {{ filterOpt.label }}
            </button>
            <button 
              @click="fetchUsers(userPagination.page); fetchStats()"
              class="min-h-[36px] px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-lg text-xs font-bold transition-all ml-1 flex items-center gap-1 shadow-sm"
              title="รีเฟรชรายชื่อผู้ใช้"
            >
              <span>🔄</span>
            </button>
          </div>
        </div>

        <!-- Bulk Actions Bar (ปรากฏเมื่อมีการเลือกผู้ใช้งานตั้งแต่ 1 คนขึ้นไป) -->
        <div v-if="selectedUserIds.length > 0" class="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300 rounded-xl p-3 px-4 shadow-sm flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div class="flex items-center gap-2">
            <span class="text-base">☑️</span>
            <span class="text-xs sm:text-sm font-extrabold text-amber-950">
              เลือกผู้ใช้งานอยู่ <span class="bg-amber-600 text-white px-2 py-0.5 rounded-full text-xs font-black">{{ selectedUserIds.length }}</span> คน
            </span>
            <button 
              @click="clearSelection" 
              class="text-xs text-stone-500 hover:text-stone-800 underline ml-2 font-medium cursor-pointer"
            >
              ยกเลิกการเลือก
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="openBulkDeleteModal" 
              class="min-h-[38px] px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🗑️</span>
              <span>ลบผู้ใช้ที่เลือก ({{ selectedUserIds.length }} คน)</span>
            </button>
          </div>
        </div>

        <!-- Users Table Container (Lock horizontal scroll on mobile) -->
        <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl shadow-sm overflow-hidden">
          
          <div v-if="isLoadingUsers" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
            <p class="text-stone-500 font-bold text-sm">กำลังโหลดข้อมูลผู้ใช้...</p>
          </div>

          <div v-else-if="usersList.length === 0" class="text-center py-12">
            <span class="text-4xl mb-2 block">🔍</span>
            <p class="font-extrabold text-stone-700 text-base">ไม่พบรายชื่อผู้ใช้งานที่ตรงกับเงื่อนไข</p>
            <p class="text-xs text-stone-400 mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกตัวกรองอื่น</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-amber-100/60 border-b border-amber-200/80 text-stone-700 font-extrabold uppercase text-[11px] tracking-wider">
                <tr>
                  <th class="py-3 px-3 text-center w-10">
                    <input 
                      type="checkbox" 
                      :checked="isAllCurrentPageSelected" 
                      @change="toggleSelectAllCurrentPage"
                      class="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer align-middle"
                      title="เลือกทั้งหมดในหน้านี้"
                    />
                  </th>
                  <th class="py-3 px-4">ผู้ใช้งาน</th>
                  <th class="py-3 px-3">สถานะอีเมล</th>
                  <th class="py-3 px-3">สิทธิ์ระบบ</th>
                  <th class="py-3 px-3">สถานะบัญชี</th>
                  <th class="py-3 px-3">สถิติ</th>
                  <th class="py-3 px-4 text-right">การจัดการ (Actions)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-100">
                <tr v-for="u in usersList" :key="u.id" :class="selectedUserIds.includes(u.id) ? 'bg-amber-100/50' : 'hover:bg-amber-50/60'" class="transition-colors">
                  
                  <!-- Checkbox Column -->
                  <td class="py-3 px-3 text-center w-10">
                    <input 
                      v-if="u.id !== currentAdmin?.id"
                      type="checkbox" 
                      :checked="selectedUserIds.includes(u.id)"
                      @change="toggleSelectUser(u.id)"
                      class="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer align-middle"
                    />
                    <span v-else class="text-xs text-stone-300 select-none" title="บัญชีของคุณ (ป้องกันการเลือกลบ)">🔒</span>
                  </td>

                  <!-- Column: User Info -->
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center font-black text-amber-900 text-xs shrink-0">
                        {{ u.username.slice(0, 1).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-extrabold text-stone-800 truncate" :title="u.username">
                          {{ u.username }}
                          <span v-if="u.id === currentAdmin?.id" class="text-[10px] text-amber-700 bg-amber-100 px-1 rounded ml-1 font-bold">คุณ</span>
                        </p>
                        <p class="text-xs text-stone-400 truncate font-mono" :title="u.email">{{ u.email }}</p>
                      </div>
                    </div>
                  </td>

                  <!-- Column: Verification -->
                  <td class="py-3 px-3 whitespace-nowrap">
                    <span 
                      :class="u.isVerified ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'"
                      class="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                    >
                      {{ u.isVerified ? '🟢 ยืนยันแล้ว' : '🟡 รออีเมล' }}
                    </span>
                  </td>

                  <!-- Column: Role -->
                  <td class="py-3 px-3 whitespace-nowrap">
                    <span 
                      :class="u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200 font-black' : 'bg-stone-100 text-stone-600 border-stone-200 font-bold'"
                      class="px-2 py-0.5 rounded-full text-[11px] border"
                    >
                      {{ u.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER' }}
                    </span>
                  </td>

                  <!-- Column: Account Status -->
                  <td class="py-3 px-3 whitespace-nowrap">
                    <span 
                      v-if="u.isBanned"
                      class="bg-rose-100 text-rose-700 border-rose-200 px-2 py-0.5 rounded-full text-[11px] font-black border"
                      :title="u.banReason || 'ถูกระงับการใช้งาน'"
                    >
                      🔒 ระงับการใช้งาน
                    </span>
                    <span v-else class="text-stone-400 text-xs font-medium">ปกติ</span>
                  </td>

                  <!-- Column: Stats -->
                  <td class="py-3 px-3 whitespace-nowrap text-xs text-stone-500 font-medium">
                    <span title="สร้างบอร์ด">{{ u._count?.projectsOwned || 0 }} 🗂️</span>
                    <span class="mx-1.5">•</span>
                    <span title="การ์ดงานที่ถือ">{{ u._count?.assignedTasks || 0 }} 📋</span>
                  </td>

                  <!-- Column: Action Buttons -->
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <div class="inline-flex items-center gap-1.5 justify-end">
                      
                      <!-- กดยืนยันอีเมลด่วน -->
                      <button 
                        v-if="!u.isVerified"
                        @click="handleManualVerify(u)"
                        class="min-h-[34px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 transition-all"
                        title="กดยืนยันอีเมลให้ผู้ใช้ทันที"
                      >
                        ✅ ยืนยันเมล
                      </button>

                      <!-- รีเซ็ตรหัสผ่าน -->
                      <button 
                        @click="openResetPasswordModal(u)"
                        class="min-h-[34px] px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-lg border border-stone-250 transition-all"
                        title="รีเซ็ตรหัสผ่านให้ผู้ใช้"
                      >
                        🔑 รหัสผ่าน
                      </button>

                      <!-- แบน / ปลดแบน (ซ่อนปุ่มถ้าเป็นตัวเอง) -->
                      <button 
                        v-if="u.id !== currentAdmin?.id"
                        @click="openBanModal(u)"
                        :class="u.isBanned ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'"
                        class="min-h-[34px] px-2.5 py-1 font-bold text-xs rounded-lg border transition-all"
                        :title="u.isBanned ? 'คลิกเพื่อปลดการระงับบัญชี' : 'คลิกเพื่อระงับการใช้งานบัญชี'"
                      >
                        {{ u.isBanned ? '🔓 ปลดแบน' : '🔒 แบน' }}
                      </button>

                      <!-- เลื่อนขั้น / ปลดสิทธิ์ Admin (ซ่อนถ้าเป็นตัวเอง) -->
                      <button 
                        v-if="u.id !== currentAdmin?.id"
                        @click="handleToggleRole(u)"
                        class="min-h-[34px] px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg border border-amber-200 transition-all"
                        :title="u.role === 'ADMIN' ? 'ลดสิทธิ์เป็นผู้ใช้ทั่วไป' : 'เลื่อนขั้นเป็นแอดมิน'"
                      >
                        {{ u.role === 'ADMIN' ? '⬇️ ปลดแอดมิน' : '👑 ตั้งแอดมิน' }}
                      </button>

                      <!-- ลบบัญชีผู้ใช้งานถาวร (ซ่อนถ้าเป็นตัวเอง) -->
                      <button 
                        v-if="u.id !== currentAdmin?.id"
                        @click="openDeleteUserModal(u)"
                        class="min-h-[34px] px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg border border-rose-200 transition-all flex items-center gap-1"
                        title="ลบบัญชีผู้ใช้นี้ออกจากระบบถาวร"
                      >
                        <span>🗑️</span>
                        <span>ลบ</span>
                      </button>

                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Advanced Pagination Bar -->
          <div class="p-3.5 sm:p-4 bg-amber-50/40 border-t border-amber-200/80 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
            
            <!-- Left: Info & Items Per Page -->
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-stone-500 font-medium">
              <span>
                แสดง 
                <strong class="font-bold text-stone-800">
                  {{ userPagination.total === 0 ? 0 : (userPagination.page - 1) * userPagination.limit + 1 }} - 
                  {{ Math.min(userPagination.page * userPagination.limit, userPagination.total) }}
                </strong> 
                จากทั้งหมด <strong class="font-bold text-stone-800">{{ userPagination.total }}</strong> คน
              </span>

              <div class="flex items-center gap-1.5 border-l border-amber-200/80 pl-2.5">
                <span>แสดงหน้าละ:</span>
                <select 
                  v-model="userPageSize" 
                  @change="handleUserPageSizeChange"
                  class="bg-white border border-amber-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-700 focus:outline-none cursor-pointer"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span>คน</span>
              </div>
            </div>

            <!-- Right: Page Navigation Buttons & Direct Jump -->
            <div class="flex flex-wrap items-center justify-center gap-1.5">
              
              <!-- First Page Button -->
              <button 
                @click="fetchUsers(1)" 
                :disabled="userPagination.page <= 1"
                class="min-h-[32px] px-2 py-1 bg-white hover:bg-stone-50 disabled:opacity-30 rounded-lg font-bold border border-stone-250 transition-all text-xs cursor-pointer disabled:cursor-not-allowed"
                title="หน้าแรก"
              >
                ⏮️
              </button>

              <!-- Prev Page Button -->
              <button 
                @click="fetchUsers(userPagination.page - 1)" 
                :disabled="userPagination.page <= 1"
                class="min-h-[32px] px-2.5 py-1 bg-white hover:bg-stone-50 disabled:opacity-30 rounded-lg font-bold border border-stone-250 transition-all text-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                title="หน้าก่อนหน้า"
              >
                ◀ ก่อนหน้า
              </button>

              <!-- Numeric Page Buttons (Windowed) -->
              <template v-for="(p, idx) in getUserPageNumbers" :key="idx">
                <span v-if="p === '...'" class="px-1 text-stone-400 font-bold select-none">...</span>
                <button 
                  v-else 
                  @click="fetchUsers(p)"
                  :class="userPagination.page === p ? 'bg-amber-500 text-white border-amber-500 shadow-sm font-black' : 'bg-white hover:bg-amber-50 text-stone-700 border-stone-250 font-bold'"
                  class="min-h-[32px] min-w-[32px] px-2 py-1 rounded-lg border transition-all text-xs flex items-center justify-center cursor-pointer"
                >
                  {{ p }}
                </button>
              </template>

              <!-- Next Page Button -->
              <button 
                @click="fetchUsers(userPagination.page + 1)" 
                :disabled="userPagination.page >= userPagination.totalPages"
                class="min-h-[32px] px-2.5 py-1 bg-white hover:bg-stone-50 disabled:opacity-30 rounded-lg font-bold border border-stone-250 transition-all text-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                title="หน้าถัดไป"
              >
                ถัดไป ▶
              </button>

              <!-- Last Page Button -->
              <button 
                @click="fetchUsers(userPagination.totalPages)" 
                :disabled="userPagination.page >= userPagination.totalPages"
                class="min-h-[32px] px-2 py-1 bg-white hover:bg-stone-50 disabled:opacity-30 rounded-lg font-bold border border-stone-250 transition-all text-xs cursor-pointer disabled:cursor-not-allowed"
                title="หน้าสุดท้าย"
              >
                ⏭️
              </button>

              <!-- Direct Jump Input -->
              <div v-if="userPagination.totalPages > 1" class="flex items-center gap-1 ml-2 pl-2 border-l border-amber-200/80">
                <span>ไปหน้า:</span>
                <input 
                  v-model.number="userJumpPage" 
                  type="number" 
                  min="1" 
                  :max="userPagination.totalPages || 1"
                  @keyup.enter="jumpToUserPage"
                  class="w-12 bg-white border border-amber-200 rounded-lg px-1.5 py-1 text-xs text-center font-bold focus:outline-none"
                />
                <button 
                  @click="jumpToUserPage"
                  class="min-h-[30px] px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-xs transition-all border border-amber-300 cursor-pointer"
                >
                  ไป
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

      <!-- ========================================== -->
      <!-- TAB 3: WORKSPACES ALL -->
      <!-- ========================================== -->
      <section v-else-if="activeTab === 'workspaces'" class="space-y-4">
        
        <!-- Search Box & Refresh -->
        <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="relative flex-1 max-w-md">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
            <input 
              v-model="projectSearchQuery" 
              @input="handleProjectSearchInput"
              type="text" 
              placeholder="ค้นหาชื่อโปรเจกต์ หรือรหัสเชิญ 6 หลัก..." 
              class="w-full bg-white border border-amber-200 rounded-xl pl-10 pr-4 py-2.5 min-h-[44px] text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
          <div class="flex items-center gap-2 justify-between sm:justify-end">
            <span class="text-xs text-stone-500 font-bold">
              ทั้งหมด {{ projectPagination.total }} บอร์ด
            </span>
            <button 
              @click="fetchProjects(projectPagination.page); fetchStats()"
              class="min-h-[38px] px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-250 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="รีเฟรชรายชื่อโปรเจกต์"
            >
              <span>🔄</span> รีเฟรช
            </button>
          </div>
        </div>

        <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl shadow-sm overflow-hidden">
          
          <div v-if="isLoadingProjects" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
            <p class="text-stone-500 font-bold text-sm">กำลังโหลดรายชื่อโปรเจกต์...</p>
          </div>

          <div v-else-if="projectsList.length === 0" class="text-center py-12">
            <span class="text-4xl mb-2 block">🗂️</span>
            <p class="font-extrabold text-stone-700 text-base">ไม่พบโปรเจกต์ที่ตรงกับคำค้นหา</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-amber-100/60 border-b border-amber-200/80 text-stone-700 font-extrabold uppercase text-[11px] tracking-wider">
                <tr>
                  <th class="py-3 px-4">ชื่อโปรเจกต์</th>
                  <th class="py-3 px-3">เจ้าของ (Owner)</th>
                  <th class="py-3 px-3">รหัสเชิญ</th>
                  <th class="py-3 px-3">สมาชิก</th>
                  <th class="py-3 px-3">การ์ดงาน</th>
                  <th class="py-3 px-4 text-right">ลิงก์เข้าสู่บอร์ด</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-amber-100">
                <tr v-for="p in projectsList" :key="p.id" class="hover:bg-amber-50/60 transition-colors">
                  <td class="py-3 px-4 font-extrabold text-stone-800">
                    <p class="truncate max-w-xs" :title="p.name">{{ p.name }}</p>
                    <p v-if="p.description" class="text-xs text-stone-400 font-normal truncate max-w-xs">{{ p.description }}</p>
                  </td>
                  <td class="py-3 px-3">
                    <p class="font-bold text-stone-800">{{ p.owner?.username || 'Unknown' }}</p>
                    <p class="text-xs text-stone-400 font-mono">{{ p.owner?.email }}</p>
                  </td>
                  <td class="py-3 px-3 whitespace-nowrap">
                    <span class="font-mono font-black bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-900 text-xs">
                      {{ p.inviteCode }}
                    </span>
                    <span :class="p.isInviteActive ? 'text-emerald-600' : 'text-stone-400'" class="text-[10px] font-bold block mt-0.5">
                      {{ p.isInviteActive ? '🟢 เปิดรับ' : '🔒 ปิดรับ' }}
                    </span>
                  </td>
                  <td class="py-3 px-3 font-bold text-stone-700 whitespace-nowrap">
                    👥 {{ p._count?.members || 0 }} คน
                  </td>
                  <td class="py-3 px-3 font-bold text-stone-700 whitespace-nowrap">
                    📋 {{ p._count?.tasks || 0 }} การ์ด
                  </td>
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <div class="inline-flex items-center gap-1.5 justify-end">
                      <NuxtLink 
                        :to="`/project/${p.id}`"
                        class="min-h-[34px] px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-all inline-flex items-center gap-1 shadow-sm"
                      >
                        เปิดดูบอร์ด ↗
                      </NuxtLink>
                      <button 
                        @click="openDeleteProjectModal(p)"
                        class="min-h-[34px] px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-all inline-flex items-center gap-1"
                        title="ลบโปรเจกต์นี้ออกจากระบบ"
                      >
                        🗑️ ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="projectPagination.totalPages > 1" class="p-3.5 bg-amber-50/40 border-t border-amber-200/80 flex items-center justify-between">
            <span class="text-xs text-stone-500 font-medium">
              แสดงหน้า {{ projectPagination.page }} จาก {{ projectPagination.totalPages }}
            </span>
            <div class="flex items-center gap-1.5">
              <button 
                @click="fetchProjects(projectPagination.page - 1)" 
                :disabled="projectPagination.page <= 1"
                class="min-h-[36px] px-3 py-1 bg-white hover:bg-stone-50 disabled:opacity-40 rounded-lg text-xs font-bold border border-stone-250 transition-all"
              >
                ◀ ก่อนหน้า
              </button>
              <button 
                @click="fetchProjects(projectPagination.page + 1)" 
                :disabled="projectPagination.page >= projectPagination.totalPages"
                class="min-h-[36px] px-3 py-1 bg-white hover:bg-stone-50 disabled:opacity-40 rounded-lg text-xs font-bold border border-stone-250 transition-all"
              >
                ถัดไป ▶
              </button>
            </div>
          </div>

        </div>

      </section>

    </main>

    <!-- ========================================== -->
    <!-- MODAL: RESET PASSWORD -->
    <!-- ========================================== -->
    <div v-if="isResetModalOpen" @click.self="closeResetModal" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>

        <h3 class="text-lg font-extrabold text-stone-800 mb-1 mt-2 flex items-center gap-2">
          <span>🔑</span> รีเซ็ตรหัสผ่านให้ผู้ใช้
        </h3>
        <p class="text-xs text-stone-500 mb-4">
          ผู้ใช้งาน: <span class="font-bold text-amber-900">{{ selectedUser?.username }}</span> ({{ selectedUser?.email }})
        </p>

        <!-- ผลลัพธ์รหัสผ่านชั่วคราวหลังกดรีเซ็ต -->
        <div v-if="tempPasswordResult" class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center my-4">
          <p class="text-xs text-emerald-800 font-bold mb-1">🎉 รีเซ็ตรหัสผ่านสำเร็จ!</p>
          <p class="text-xs text-stone-600 mb-2">รหัสผ่านชั่วคราวใหม่ของผู้ใช้คือ:</p>
          <div class="flex items-center justify-center gap-2 flex-wrap">
            <div class="font-mono text-lg font-black text-amber-950 bg-white border border-amber-300 py-2 px-4 rounded-xl inline-block tracking-widest select-all">
              {{ tempPasswordResult }}
            </div>
            <button
              type="button"
              @click="copyTempPassword"
              class="min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-xs transition-all border shadow-sm cursor-pointer"
              :class="isCopiedTempPass ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'"
            >
              {{ isCopiedTempPass ? '✅ คัดลอกแล้ว' : '📋 คัดลอกรหัส' }}
            </button>
          </div>
          <p class="text-[11px] text-stone-500 mt-2.5">กรุณาคัดลอกรหัสนี้ส่งให้ผู้ใช้เพื่อเข้าสู่ระบบ</p>
        </div>

        <form v-else @submit.prevent="handleConfirmResetPassword" class="space-y-4">
          <div>
            <label for="admin-custom-password" class="block text-xs font-semibold text-stone-600 mb-1">กำหนดรหัสผ่านใหม่ (หากเว้นว่าง ระบบจะสุ่มรหัสให้อัตโนมัติ):</label>
            <input 
              id="admin-custom-password"
              v-model="customNewPassword" 
              type="text" 
              placeholder="เว้นว่างไว้เพื่อสุ่ม เช่น FS-8x7a2b"
              class="w-full bg-white border border-amber-200 rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <div class="flex justify-end gap-2.5 pt-2">
            <button 
              type="button" 
              @click="closeResetModal" 
              class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              :disabled="isSubmittingAction"
              class="min-h-[44px] px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span v-if="isSubmittingAction" class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
              {{ isSubmittingAction ? 'กำลังดำเนินการ...' : 'ยืนยันรีเซ็ตรหัสผ่าน ⚡' }}
            </button>
          </div>
        </form>

        <div v-if="tempPasswordResult" class="flex justify-end pt-3">
          <button 
            @click="closeResetModal" 
            class="min-h-[44px] px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL: BAN / UNBAN -->
    <!-- ========================================== -->
    <div v-if="isBanModalOpen" @click.self="isBanModalOpen = false; selectedUser = null" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>

        <h3 class="text-lg font-extrabold text-stone-800 mb-1 mt-2 flex items-center gap-2">
          <span>{{ selectedUser?.isBanned ? '🔓 ยกเลิกการระงับบัญชี' : '🔒 ระงับการใช้งานบัญชี' }}</span>
        </h3>
        <p class="text-xs text-stone-500 mb-4">
          ผู้ใช้งาน: <span class="font-bold text-stone-800">{{ selectedUser?.username }}</span> ({{ selectedUser?.email }})
        </p>

        <form @submit.prevent="handleConfirmBan" class="space-y-4">
          <div v-if="!selectedUser?.isBanned">
            <label for="admin-ban-reason" class="block text-xs font-semibold text-stone-600 mb-1">ระบุเหตุผลในการระงับการใช้งาน:</label>
            <textarea 
              id="admin-ban-reason"
              v-model="banReasonInput" 
              rows="3" 
              placeholder="เช่น ละเมิดกฎชุมชน, สแปมเนื้อหาในบอร์ด..."
              required
              class="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-all"
            ></textarea>
          </div>

          <p v-else class="text-xs text-stone-600 font-medium">
            คุณต้องการปลดการระงับบัญชี เพื่อให้ผู้ใช้สามารถกลับเข้าสู่ระบบและใช้งานบอร์ดได้ตามปกติใช่หรือไม่?
          </p>

          <div class="flex justify-end gap-2.5 pt-2">
            <button 
              type="button" 
              @click="isBanModalOpen = false; selectedUser = null" 
              class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              :disabled="isSubmittingAction"
              :class="selectedUser?.isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'"
              class="min-h-[44px] px-5 py-2 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span v-if="isSubmittingAction" class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
              {{ isSubmittingAction ? 'กำลังดำเนินการ...' : (selectedUser?.isBanned ? 'ยืนยันปลดแบน 🔓' : 'ยืนยันระงับบัญชี 🔒') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL: DELETE PROJECT -->
    <!-- ========================================== -->
    <div v-if="isDeleteProjectModalOpen" @click.self="isDeleteProjectModalOpen = false; selectedProject = null" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>

        <h3 class="text-lg font-extrabold text-stone-800 mb-1 mt-2 flex items-center gap-2">
          <span>🗑️ ลบโปรเจกต์ออกจากระบบ</span>
        </h3>
        <p class="text-xs text-stone-500 mb-4">
          โปรเจกต์: <span class="font-bold text-amber-900">{{ selectedProject?.name }}</span>
        </p>

        <div class="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 mb-4 space-y-1">
          <p class="font-bold">⚠️ คำเตือนการดำเนินการขั้นเด็ดขาด:</p>
          <p>การลบจะลบข้อมูลคอลัมน์ การ์ดงาน สมาชิก และประวัติทั้งหมดในบอร์ดนี้โดยถาวร และไม่สามารถกู้คืนได้</p>
        </div>

        <div class="flex justify-end gap-2.5 pt-2">
          <button 
            type="button" 
            @click="isDeleteProjectModalOpen = false; selectedProject = null" 
            class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            ยกเลิก
          </button>
          <button 
            type="button"
            @click="handleConfirmDeleteProject"
            :disabled="isSubmittingAction"
            class="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span v-if="isSubmittingAction" class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
            {{ isSubmittingAction ? 'กำลังลบ...' : 'ยืนยันลบถาวร 🗑️' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL: DELETE USER (SINGLE OR BULK) -->
    <!-- ========================================== -->
    <div v-if="isDeleteUserModalOpen" @click.self="isDeleteUserModalOpen = false; userToDelete = null" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>

        <h3 class="text-lg font-extrabold text-stone-800 mb-1 mt-2 flex items-center gap-2">
          <span>🗑️</span> 
          <span>{{ usersToDeleteList.length > 1 ? `ลบบัญชีผู้ใช้งานที่เลือก (${usersToDeleteList.length} คน)` : 'ลบบัญชีผู้ใช้งานถาวร' }}</span>
        </h3>

        <!-- Single User Target Info -->
        <p v-if="usersToDeleteList.length === 1" class="text-xs text-stone-500 mb-4">
          คุณกำลังจะลบบัญชีของ: <strong class="text-stone-800 font-bold">@{{ usersToDeleteList[0]?.username }}</strong> (<span class="font-mono text-amber-900">{{ usersToDeleteList[0]?.email }}</span>)
        </p>

        <!-- Multi-User Target Chips / List -->
        <div v-else class="mb-4">
          <p class="text-xs text-stone-500 mb-2">
            คุณกำลังจะลบผู้ใช้งานจำนวน <strong class="text-rose-600 font-bold">{{ usersToDeleteList.length }}</strong> คนพร้อมกัน:
          </p>
          <div class="max-h-28 overflow-y-auto bg-white border border-stone-200 rounded-xl p-2.5 flex flex-wrap gap-1.5">
            <span 
              v-for="u in usersToDeleteList" 
              :key="u.id"
              class="inline-flex items-center gap-1 bg-stone-100 border border-stone-250 text-stone-700 px-2 py-0.5 rounded-lg text-xs font-semibold"
            >
              <span>👤</span>
              <strong class="font-bold">@{{ u.username }}</strong>
              <span class="text-[10px] text-stone-400">({{ u.email }})</span>
            </span>
          </div>
        </div>

        <!-- Information & Aggregate Stats Badges -->
        <div class="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div class="bg-white border border-amber-200/80 rounded-xl p-2.5 shadow-sm">
            <span class="text-xs text-stone-400 font-bold block">เป็นเจ้าของรวม</span>
            <span class="text-sm font-black text-amber-950">{{ totalProjectsOwnedByTarget }} บอร์ด 🗂️</span>
          </div>
          <div class="bg-white border border-amber-200/80 rounded-xl p-2.5 shadow-sm">
            <span class="text-xs text-stone-400 font-bold block">เป็นสมาชิกรวม</span>
            <span class="text-sm font-black text-stone-800">{{ totalMembershipsByTarget }} บอร์ด 👥</span>
          </div>
          <div class="bg-white border border-amber-200/80 rounded-xl p-2.5 shadow-sm">
            <span class="text-xs text-stone-400 font-bold block">ถือการ์ดงานรวม</span>
            <span class="text-sm font-black text-stone-800">{{ totalTasksAssignedToTarget }} งาน 📋</span>
          </div>
        </div>

        <!-- Project Handling Section (If users own projects) -->
        <div v-if="totalProjectsOwnedByTarget > 0" class="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-4 space-y-2.5">
          <p class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <span>⚙️</span> จัดการบอร์ดที่ผู้ใช้กลุ่มนี้เป็นเจ้าของ (รวม {{ totalProjectsOwnedByTarget }} โครงการ):
          </p>
          <div class="space-y-2 text-xs">
            <label class="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-amber-200/80 cursor-pointer hover:bg-amber-50/50 transition-colors">
              <input 
                type="radio" 
                v-model="projectHandlingChoice" 
                value="transfer" 
                class="mt-0.5 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <strong class="text-stone-800 font-bold block">โอนสิทธิ์โครงการให้สมาชิกคนถัดไป (แนะนำ) 👑</strong>
                <span class="text-stone-500 text-[11px] block mt-0.5 leading-snug">
                  หากบอร์ดมีสมาชิกอื่นอยู่ จะโอนสิทธิ์ Owner ให้สมาชิกคนถัดไปในทีมอัตโนมัติ เพื่อไม่ให้เพื่อนร่วมทีมสูญเสียข้อมูล และลบเฉพาะบอร์ดที่ไม่มีสมาชิกอื่น
                </span>
              </div>
            </label>

            <label class="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-rose-200/80 cursor-pointer hover:bg-rose-50/50 transition-colors">
              <input 
                type="radio" 
                v-model="projectHandlingChoice" 
                value="delete" 
                class="mt-0.5 text-rose-600 focus:ring-rose-500"
              />
              <div>
                <strong class="text-rose-700 font-bold block">ลบทุกโครงการที่ผู้ใช้กลุ่มนี้สร้างทิ้งทั้งหมด 💥</strong>
                <span class="text-rose-500 text-[11px] block mt-0.5 leading-snug">
                  บอร์ดโครงการทั้งหมดที่ผู้ใช้กลุ่มนี้เป็นเจ้าของจะถูกลบถาวรไปพร้อมกัน (รวมถึงการ์ดงานและสมาชิกในบอร์ดเหล่านั้น)
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Impact Summary Card -->
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 mb-4 space-y-1.5">
          <p class="font-black flex items-center gap-1">
            <span>⚠️</span> ผลกระทบหลังการลบบัญชี:
          </p>
          <ul class="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
            <li><strong>ปลดล็อกอีเมล:</strong> อีเมลของผู้ใช้ที่ถูกลบทั้งหมดจะว่างทันที สามารถนำกลับมาสมัครใหม่ได้</li>
            <li><strong>การ์ดงาน:</strong> งานที่เคยมอบหมายให้ผู้ใช้กลุ่มนี้จะกลายเป็น "ยังไม่ระบุผู้รับผิดชอบ" (Unassigned)</li>
            <li><strong>สมาชิกภาพ:</strong> รายชื่อจะถูกถอดออกจากทุกบอร์ดโครงการที่เคยเข้าร่วม</li>
          </ul>
        </div>

        <div class="flex justify-end gap-2.5 pt-2">
          <button 
            type="button" 
            @click="isDeleteUserModalOpen = false; userToDelete = null" 
            class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            ยกเลิก
          </button>
          <button 
            type="button"
            @click="handleConfirmDeleteUser"
            :disabled="isSubmittingAction"
            class="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span v-if="isSubmittingAction" class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
            {{ isSubmittingAction ? 'กำลังลบบัญชี...' : (usersToDeleteList.length > 1 ? `ยืนยันลบผู้ใช้ทั้ง ${usersToDeleteList.length} คน 🗑️` : 'ยืนยันลบบัญชีถาวร 🗑️') }}
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

definePageMeta({
  middleware: 'admin'
})

const { showToast } = useToast()

const getApiErrorMessage = (error, fallback = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง') => {
  return error?.data?.statusMessage || error?.data?.message || error?.statusMessage || fallback
}

const activeTab = ref('overview') // 'overview' | 'users' | 'workspaces'
const currentAdmin = ref(null)

// Stats state
const stats = ref(null)
const isLoadingStats = ref(true)

// Users state
const usersList = ref([])
const isLoadingUsers = ref(false)
const userSearchQuery = ref('')
const userFilter = ref('all')
const userPageSize = ref(20)
const userJumpPage = ref(1)
const userPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
const selectedUserIds = ref([]) // array of selected user IDs for bulk actions

// Workspaces state
const projectsList = ref([])
const isLoadingProjects = ref(false)
const projectSearchQuery = ref('')
const projectPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })

// Modal states
const isResetModalOpen = ref(false)
const isBanModalOpen = ref(false)
const isDeleteProjectModalOpen = ref(false)
const isDeleteUserModalOpen = ref(false)
const selectedUser = ref(null)
const userToDelete = ref(null)
const projectHandlingChoice = ref('transfer')
const selectedProject = ref(null)
const customNewPassword = ref('')
const tempPasswordResult = ref('')
const isCopiedTempPass = ref(false)
const banReasonInput = ref('')
const isSubmittingAction = ref(false)

let searchDebounceTimer = null

const fetchStats = async () => {
  isLoadingStats.value = true
  try {
    const res = await $fetch('/api/admin/stats')
    if (res.success) {
      stats.value = res.stats
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'ไม่สามารถโหลดสถิติระบบได้'), 'error')
  } finally {
    isLoadingStats.value = false
  }
}

const fetchUsers = async (page = 1) => {
  isLoadingUsers.value = true
  userJumpPage.value = page
  selectedUserIds.value = []
  try {
    const res = await $fetch('/api/admin/users', {
      params: {
        page,
        limit: userPageSize.value,
        q: userSearchQuery.value.trim(),
        filter: userFilter.value
      }
    })
    if (res.success) {
      usersList.value = res.users
      userPagination.value = res.pagination
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'ไม่สามารถโหลดรายชื่อผู้ใช้ได้'), 'error')
  } finally {
    isLoadingUsers.value = false
  }
}

const fetchProjects = async (page = 1) => {
  isLoadingProjects.value = true
  try {
    const res = await $fetch('/api/admin/projects', {
      params: {
        page,
        limit: 20,
        q: projectSearchQuery.value.trim()
      }
    })
    if (res.success) {
      projectsList.value = res.projects
      projectPagination.value = res.pagination
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'ไม่สามารถโหลดรายชื่อโปรเจกต์ได้'), 'error')
  } finally {
    isLoadingProjects.value = false
  }
}

const handleUserSearchInput = () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    fetchUsers(1)
  }, 350)
}

const handleProjectSearchInput = () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    fetchProjects(1)
  }, 350)
}

// User Selection & Bulk Action Helpers
const selectableUsersOnCurrentPage = computed(() => {
  return usersList.value.filter(u => u.id !== currentAdmin.value?.id)
})

const isAllCurrentPageSelected = computed(() => {
  return (
    selectableUsersOnCurrentPage.value.length > 0 &&
    selectableUsersOnCurrentPage.value.every(u => selectedUserIds.value.includes(u.id))
  )
})

const toggleSelectAllCurrentPage = () => {
  if (isAllCurrentPageSelected.value) {
    const pageIds = selectableUsersOnCurrentPage.value.map(u => u.id)
    selectedUserIds.value = selectedUserIds.value.filter(id => !pageIds.includes(id))
  } else {
    const pageIds = selectableUsersOnCurrentPage.value.map(u => u.id)
    selectedUserIds.value = Array.from(new Set([...selectedUserIds.value, ...pageIds]))
  }
}

const toggleSelectUser = (id) => {
  if (id === currentAdmin.value?.id) return
  const idx = selectedUserIds.value.indexOf(id)
  if (idx > -1) {
    selectedUserIds.value.splice(idx, 1)
  } else {
    selectedUserIds.value.push(id)
  }
}

const clearSelection = () => {
  selectedUserIds.value = []
}

// User Advanced Pagination Helpers
const getUserPageNumbers = computed(() => {
  const total = userPagination.value.totalPages || 1
  const current = userPagination.value.page || 1
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const jumpToUserPage = () => {
  const maxPage = userPagination.value.totalPages || 1
  const target = Math.max(1, Math.min(Number(userJumpPage.value) || 1, maxPage))
  userJumpPage.value = target
  fetchUsers(target)
}

const handleUserPageSizeChange = () => {
  userPagination.value.limit = userPageSize.value
  fetchUsers(1)
}

// User Actions
const handleManualVerify = async (user) => {
  try {
    const res = await $fetch('/api/admin/users/verify', {
      method: 'POST',
      body: { userId: user.id }
    })
    showToast(res.message, 'success')
    user.isVerified = true
    fetchStats()
  } catch (err) {
    showToast(getApiErrorMessage(err, 'ยืนยันอีเมลไม่สำเร็จ'), 'error')
  }
}

const openResetPasswordModal = (user) => {
  selectedUser.value = user
  customNewPassword.value = ''
  tempPasswordResult.value = ''
  isCopiedTempPass.value = false
  isResetModalOpen.value = true
}

const closeResetModal = () => {
  isResetModalOpen.value = false
  selectedUser.value = null
  customNewPassword.value = ''
  tempPasswordResult.value = ''
  isCopiedTempPass.value = false
}

const copyTempPassword = async () => {
  if (!tempPasswordResult.value) return
  try {
    await navigator.clipboard.writeText(tempPasswordResult.value)
    isCopiedTempPass.value = true
    setTimeout(() => {
      isCopiedTempPass.value = false
    }, 2000)
  } catch {}
}

const handleConfirmResetPassword = async () => {
  if (!selectedUser.value) return
  isSubmittingAction.value = true
  try {
    const res = await $fetch('/api/admin/users/reset-password', {
      method: 'POST',
      body: {
        userId: selectedUser.value.id,
        newPassword: customNewPassword.value.trim() || undefined
      }
    })
    tempPasswordResult.value = res.temporaryPassword
    isCopiedTempPass.value = false
  } catch (err) {
    showToast(getApiErrorMessage(err, 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน'), 'error')
  } finally {
    isSubmittingAction.value = false
  }
}

const openBanModal = (user) => {
  selectedUser.value = user
  banReasonInput.value = user.banReason || ''
  isBanModalOpen.value = true
}

const handleConfirmBan = async () => {
  if (!selectedUser.value) return
  isSubmittingAction.value = true
  const willBan = !selectedUser.value.isBanned

  try {
    const res = await $fetch('/api/admin/users/ban', {
      method: 'POST',
      body: {
        userId: selectedUser.value.id,
        isBanned: willBan,
        banReason: willBan ? banReasonInput.value.trim() : null
      }
    })
    showToast(res.message, 'success')
    selectedUser.value.isBanned = willBan
    selectedUser.value.banReason = willBan ? banReasonInput.value.trim() : null
    isBanModalOpen.value = false
    selectedUser.value = null
    fetchStats()
  } catch (err) {
    showToast(getApiErrorMessage(err, 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะการระงับบัญชี'), 'error')
  } finally {
    isSubmittingAction.value = false
  }
}

const handleToggleRole = async (user) => {
  const targetRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
  try {
    const res = await $fetch('/api/admin/users/role', {
      method: 'PUT',
      body: {
        userId: user.id,
        role: targetRole
      }
    })
    showToast(res.message, 'success')
    user.role = targetRole
    fetchStats()
  } catch (err) {
    showToast(getApiErrorMessage(err, 'เปลี่ยนระดับสิทธิ์ไม่สำเร็จ'), 'error')
  }
}

// User Deletion (Single & Bulk) Helpers
const usersToDeleteList = computed(() => {
  if (userToDelete.value) {
    return [userToDelete.value]
  }
  return usersList.value.filter(u => selectedUserIds.value.includes(u.id))
})

const totalProjectsOwnedByTarget = computed(() => {
  return usersToDeleteList.value.reduce((sum, u) => sum + (u._count?.projectsOwned || 0), 0)
})

const totalMembershipsByTarget = computed(() => {
  return usersToDeleteList.value.reduce((sum, u) => sum + (u._count?.projectMembers || 0), 0)
})

const totalTasksAssignedToTarget = computed(() => {
  return usersToDeleteList.value.reduce((sum, u) => sum + (u._count?.assignedTasks || 0), 0)
})

const openDeleteUserModal = (user) => {
  userToDelete.value = user
  projectHandlingChoice.value = 'transfer'
  isDeleteUserModalOpen.value = true
}

const openBulkDeleteModal = () => {
  if (selectedUserIds.value.length === 0) return
  userToDelete.value = null
  projectHandlingChoice.value = 'transfer'
  isDeleteUserModalOpen.value = true
}

const handleConfirmDeleteUser = async () => {
  const targetIds = usersToDeleteList.value.map(u => u.id)
  if (targetIds.length === 0) return
  isSubmittingAction.value = true

  try {
    const res = await $fetch('/api/admin/users/delete', {
      method: 'DELETE',
      body: {
        userIds: targetIds,
        projectHandling: projectHandlingChoice.value
      }
    })
    showToast(res.message || 'ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว 🗑️', 'success')

    // Instant Closed-Loop Reactive UI Update
    usersList.value = usersList.value.filter(u => !targetIds.includes(u.id))
    selectedUserIds.value = selectedUserIds.value.filter(id => !targetIds.includes(id))
    isDeleteUserModalOpen.value = false
    userToDelete.value = null
    fetchStats()

    // If current page is now empty and not on first page, go back 1 page
    if (usersList.value.length === 0 && userPagination.value.page > 1) {
      fetchUsers(userPagination.value.page - 1)
    } else {
      fetchUsers(userPagination.value.page)
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน'), 'error')
  } finally {
    isSubmittingAction.value = false
  }
}

// Project Actions
const openDeleteProjectModal = (project) => {
  selectedProject.value = project
  isDeleteProjectModalOpen.value = true
}

const handleConfirmDeleteProject = async () => {
  if (!selectedProject.value) return
  isSubmittingAction.value = true
  try {
    const res = await $fetch(`/api/projects/delete?projectId=${selectedProject.value.id}`, {
      method: 'DELETE'
    })
    showToast(res.message || 'ลบโปรเจกต์เรียบร้อยแล้ว 🗑️', 'success')
    isDeleteProjectModalOpen.value = false
    selectedProject.value = null
    await fetchProjects(projectPagination.value.page)
    fetchStats()
  } catch (err) {
    showToast(getApiErrorMessage(err, 'เกิดข้อผิดพลาดในการลบโปรเจกต์'), 'error')
  } finally {
    isSubmittingAction.value = false
  }
}

const handleGlobalKeydown = (e) => {
  if (e.key === 'Escape') {
    if (isResetModalOpen.value) closeResetModal()
    if (isBanModalOpen.value) { isBanModalOpen.value = false; selectedUser.value = null }
    if (isDeleteProjectModalOpen.value) { isDeleteProjectModalOpen.value = false; selectedProject.value = null }
    if (isDeleteUserModalOpen.value) { isDeleteUserModalOpen.value = false; userToDelete.value = null }
  }
}

const handleVisibilityOrFocus = () => {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    fetchStats()
    if (activeTab.value === 'users') {
      fetchUsers(userPagination.value.page)
    } else if (activeTab.value === 'workspaces') {
      fetchProjects(projectPagination.value.page)
    }
  }
}

onMounted(async () => {
  const cachedUser = localStorage.getItem('user')
  if (cachedUser) {
    try {
      currentAdmin.value = JSON.parse(cachedUser)
    } catch {}
  }

  try {
    const meRes = await $fetch('/api/auth/me')
    if (meRes.success) {
      currentAdmin.value = meRes.user
      localStorage.setItem('user', JSON.stringify(meRes.user))
    }
  } catch {}

  fetchStats()
  fetchUsers()
  fetchProjects()

  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityOrFocus)
    window.addEventListener('focus', handleVisibilityOrFocus)
    window.addEventListener('keydown', handleGlobalKeydown)
  }
})

onUnmounted(() => {
  clearTimeout(searchDebounceTimer)
  if (typeof window !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
    window.removeEventListener('focus', handleVisibilityOrFocus)
    window.removeEventListener('keydown', handleGlobalKeydown)
  }
})
</script>
