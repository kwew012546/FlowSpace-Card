<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] text-stone-800 flex flex-col relative overflow-x-hidden bg-grid">
    
    <div class="absolute top-[-10%] left-[-10%] w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Top Admin Bar (Exclusive when Super Admin inspects OTHER users' boards) -->
    <aside 
      v-if="currentUser?.role === 'ADMIN' && projectOwnerId && projectOwnerId !== currentUser?.id" 
      aria-label="Admin Control Bar"
      :class="isAdminEditUnlocked ? 'from-rose-700 via-amber-700 to-amber-800' : 'from-amber-600 via-amber-700 to-amber-800'"
      class="bg-gradient-to-r text-amber-50 px-3 sm:px-6 py-2 shadow-sm text-xs relative z-50 flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/30 transition-all"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span class="flex h-2 w-2 relative shrink-0">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="isAdminEditUnlocked ? 'bg-rose-300' : 'bg-amber-200'"></span>
          <span class="relative inline-flex rounded-full h-2 w-2" :class="isAdminEditUnlocked ? 'bg-rose-400' : 'bg-amber-300'"></span>
        </span>
        <span class="font-black tracking-wide flex items-center gap-1.5 shrink-0">
          <span>🛡️</span>
          <span>{{ isAdminEditUnlocked ? 'โหมดผู้ดูแลระบบ (เปิดแก้ไขฉุกเฉิน)' : 'โหมดผู้ดูแลระบบ (ดูอย่างเดียว)' }}</span>
        </span>
        <span class="text-amber-300/60 hidden sm:inline">•</span>
        <span class="text-amber-100 hidden sm:inline">
          เจ้าของบอร์ด: <strong class="text-white font-bold">{{ projectOwnerUsername || 'กำลังโหลด...' }}</strong>
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2 shrink-0">
        <!-- Read-Only vs Admin Override Toggle -->
        <button
          @click="toggleAdminEditMode"
          :class="isAdminEditUnlocked 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-300/50' 
            : 'bg-amber-950/50 hover:bg-amber-950/80 text-amber-100 border-amber-400/30'"
          class="min-h-[32px] px-2.5 py-1 font-bold rounded-lg transition-all text-xs flex items-center gap-1 shadow-sm border"
          :title="isAdminEditUnlocked ? 'คลิกเพื่อกลับสู่โหมดดูอย่างเดียว (ป้องกันการเผลอแก้ไข)' : 'คลิกเพื่อปลดล็อกแก้ไขบอร์ดนี้ (ทุกการกระทำจะติดป้าย 🛡️ [ผู้ดูแลระบบ])'"
        >
          <span>{{ isAdminEditUnlocked ? '🔓' : '🔒' }}</span>
          <span>{{ isAdminEditUnlocked ? 'เปิดโหมดแก้ไขอยู่ (คลิกเพื่อล็อก)' : 'โหมดดูอย่างเดียว (คลิกเพื่อแก้ไข)' }}</span>
        </button>

        <!-- Delete project shortcut for Admin -->
        <button 
          @click="isDeleteProjectModalOpen = true" 
          class="min-h-[32px] px-2.5 py-1 bg-rose-600/90 hover:bg-rose-600 text-white font-bold rounded-lg transition-all text-xs flex items-center gap-1 shadow-sm border border-rose-400/40"
          title="ลบโปรเจกต์นี้ในฐานะผู้ดูแลระบบ"
        >
          <span>🗑️</span>
          <span>ลบโครงการนี้</span>
        </button>

        <!-- Back to Admin Portal link -->
        <NuxtLink 
          to="/admin" 
          class="min-h-[32px] px-3 py-1 bg-white hover:bg-amber-50 text-amber-900 font-extrabold rounded-lg transition-all text-xs flex items-center gap-1 shadow-sm"
          title="กลับสู่หน้าแผงควบคุมหลัก Admin Portal"
        >
          <span>⬅️</span>
          <span>กลับหน้า Admin</span>
        </NuxtLink>
      </div>
    </aside>

    <header class="bg-[#fdfaf5] border-b border-amber-200/80 p-3 sm:p-4 shadow-sm relative z-40">
      <div class="container mx-auto flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 sm:gap-4">
        
        <div class="flex items-center gap-2 min-w-0 max-w-full xl:max-w-xs 2xl:max-w-md shrink-1">
          <div v-if="isEditingProjectName" class="flex items-center gap-1.5 flex-nowrap w-full min-w-0">
            <input 
              v-model="newProjectName"
              type="text"
              maxlength="50"
              class="bg-white border border-amber-400 rounded-lg px-2.5 py-1.5 text-base sm:text-lg font-extrabold text-stone-800 focus:outline-none min-h-[40px] flex-1 min-w-0 w-full"
              @keyup.enter="saveProjectName"
            />
            <button @click="saveProjectName" class="min-h-[40px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center shrink-0">บันทึก</button>
            <button @click="isEditingProjectName = false" class="min-h-[40px] bg-stone-300 hover:bg-stone-400 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center shrink-0">ยกเลิก</button>
          </div>

          <h1 v-else class="text-xl sm:text-2xl font-extrabold text-stone-800 flex items-center gap-1.5 group min-w-0" :title="projectName">
            <span class="shrink-0">📁 โปรเจกต์:</span>
            <span class="truncate block min-w-0" :title="projectName">{{ projectName || 'กำลังโหลดชื่อบอร์ด...' }}</span>
            <button v-if="hasPermission('MANAGE_PROJECT')" @click="startEditProjectName" class="min-h-[36px] min-w-[36px] flex items-center justify-center text-sm opacity-50 hover:opacity-100 hover:text-amber-600 transition-all shrink-0 ml-0.5" title="แก้ไขชื่อโปรเจกต์">✏️</button>
          </h1>
        </div>

        <div v-if="hasPermission('INVITE_MEMBERS')" class="flex flex-nowrap items-center justify-start gap-2 bg-white border border-amber-200 rounded-xl p-2 sm:p-1.5 shadow-sm shrink-0 whitespace-nowrap">
          <div class="px-2 shrink-0">
            <div class="flex items-center gap-1.5 whitespace-nowrap">
              <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider whitespace-nowrap">รหัสเชิญเข้าตี้</p>
              <span v-if="!isInviteActive" class="text-[9px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                🔒 ปิดรับชั่วคราว
              </span>
              <span v-else class="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                🟢 เปิดรับ
              </span>
            </div>
            <div class="flex items-center gap-1.5 whitespace-nowrap">
              <p class="text-sm font-mono font-black tracking-wider shrink-0" :class="isInviteActive ? 'text-amber-900' : 'text-stone-400 line-through'">
                {{ !currentInviteCode ? 'กำลังโหลด...' : (isInviteCodeVisible ? currentInviteCode : '••••••') }}
              </p>
              <button 
                v-if="currentInviteCode"
                @click="isInviteCodeVisible = !isInviteCodeVisible" 
                class="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none shrink-0"
                title="เปิด/ปิดการแสดงรหัส"
              >
                <!-- SVG Icon Open Eye (เมื่อกำลังแสดงรหัส) -->
                <svg v-if="isInviteCodeVisible" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <!-- SVG Icon Closed Eye (เมื่อกำลังซ่อนรหัส) -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>
          <button 
            @click="copyInviteCode" 
            :disabled="!isInviteActive"
            :class="isInviteActive ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer' : 'bg-stone-100 text-stone-400 cursor-not-allowed'"
            class="min-h-[38px] text-xs font-bold px-3 py-2 rounded-lg transition-all self-center flex items-center justify-center shrink-0 whitespace-nowrap"
          >
            {{ isCopied ? '✅ คัดลอกแล้ว' : '📋 คัดลอกรหัส' }}
          </button>

          <!-- ตัวเลือกจัดการสำหรับผู้มีสิทธิ์จัดการบอร์ด (Owner หรือ MANAGE_PROJECT) -->
          <div v-if="hasPermission('MANAGE_PROJECT')" class="flex items-center gap-1 border-l border-amber-200/80 pl-1.5 ml-0.5 shrink-0 whitespace-nowrap">
            <button 
              @click="toggleInviteActive" 
              :disabled="isUpdatingInviteSettings"
              :title="isInviteActive ? 'คลิกเพื่อปิดรับสมาชิกผ่านรหัส' : 'คลิกเพื่อเปิดรับสมาชิกผ่านรหัส'" 
              class="min-h-[38px] min-w-[38px] p-2 rounded-lg text-xs font-bold transition-all border shrink-0 flex items-center justify-center whitespace-nowrap"
              :class="isInviteActive ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'"
            >
              {{ isInviteActive ? '🔒 ปิดรับ' : '🔓 เปิดรับ' }}
            </button>
            <button 
              @click="regenerateInviteCode" 
              :disabled="isUpdatingInviteSettings"
              title="สุ่มรหัสเชิญใหม่ (รหัสเดิมจะใช้ไม่ได้)" 
              class="min-h-[38px] min-w-[38px] bg-stone-100 hover:bg-stone-200 text-stone-700 p-2 rounded-lg text-xs font-bold transition-all border border-stone-250 flex items-center justify-center gap-0.5 shrink-0 whitespace-nowrap"
            >
              <span :class="{ 'animate-spin': isUpdatingInviteSettings }">🔄</span> <span class="hidden sm:inline text-xs">สุ่มใหม่</span>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-start xl:justify-end gap-2 sm:gap-2.5 relative w-full xl:w-auto shrink-0">
          <a 
            href="/manual.html" 
            target="_blank" 
            class="min-h-[40px] bg-white border border-amber-200 text-stone-600 hover:text-amber-800 px-3 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center focus:outline-none text-xs font-bold gap-1.5"
            title="เปิดอ่านคู่มือการใช้งานระบบ FlowSpace"
          >
            <span>📖</span>
            <span class="inline">คู่มือ</span>
          </a>

          <div class="relative">
            <button @click="isNotificationsOpen = !isNotificationsOpen" class="min-h-[40px] min-w-[40px] bg-white border border-amber-200 text-stone-600 hover:text-stone-850 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center relative focus:outline-none">
              🔔
              <span v-if="notifications.filter(n => !n.isRead).length > 0" class="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {{ notifications.filter(n => !n.isRead).length }}
              </span>
            </button>
            
            <div v-if="isNotificationsOpen" class="absolute right-0 sm:right-auto sm:left-0 lg:left-auto lg:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white border border-stone-200 rounded-xl shadow-2xl z-[150] p-4 text-left max-h-96 overflow-y-auto">
              <div class="flex justify-between items-center mb-3 pb-2 border-b border-stone-100">
                <h3 class="font-black text-stone-800 text-sm">🔔 การแจ้งเตือนล่าสุด</h3>
                <button v-if="notifications.filter(n => !n.isRead).length > 0" @click="markAllNotificationsRead" class="text-xs font-bold text-amber-600 hover:underline">อ่านทั้งหมด</button>
              </div>
              <div v-if="notifications.length === 0" class="text-center py-6 text-stone-400 text-xs">ไม่มีการแจ้งเตือนใด ๆ</div>
              <div v-else class="space-y-2">
                <div v-for="n in notifications" :key="n.id" @click="markNotificationRead(n.id)" :class="n.isRead ? 'bg-stone-50/50' : 'bg-amber-50/60 border-l-2 border-amber-500'" class="p-2.5 rounded-lg border border-stone-100/80 transition-all cursor-pointer">
                  <h4 class="text-xs font-bold text-stone-800 flex items-center justify-between">
                    {{ n.title }}
                    <span v-if="!n.isRead" class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  </h4>
                  <p class="text-[11px] text-stone-500 mt-0.5">{{ n.message }}</p>
                  <p class="text-[9px] text-stone-400 mt-1">{{ new Date(n.createdAt).toLocaleDateString('th-TH', { hour: 'numeric', minute: 'numeric' }) }}</p>
                </div>
              </div>
            </div>
          </div>

          <button v-if="hasPermission('MANAGE_PROJECT')" @click="openManageTeamModal" class="min-h-[40px] bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 text-white font-bold px-3.5 sm:px-4 py-2 rounded-lg transition-all shadow-md text-xs sm:text-sm flex items-center gap-1.5">
            👥 จัดการสมาชิกและยศ
          </button>
          
          <button v-if="currentUser && projectOwnerId !== currentUser.id && currentUser.role !== 'ADMIN'" @click="leaveProject" class="min-h-[40px] bg-stone-100 hover:bg-stone-200 text-rose-600 font-bold px-3.5 sm:px-4 py-2 rounded-lg transition-all border border-stone-200 text-xs sm:text-sm flex items-center">
            🚪 ออกจากโครงการ
          </button>
          <button v-if="currentUser && projectOwnerId === currentUser.id" @click="isDeleteProjectModalOpen = true" class="min-h-[40px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3.5 sm:px-4 py-2 rounded-lg transition-all border border-rose-250 text-xs sm:text-sm flex items-center">
            🗑️ ลบโครงการ
          </button>

          <button @click="navigateTo('/dashboard')" class="min-h-[40px] bg-[#f3e9d7] hover:bg-[#ebdcc5] text-stone-700 font-bold px-3.5 sm:px-4 py-2 rounded-lg transition-all border border-amber-200 text-xs sm:text-sm flex items-center">
            ⬅️ แดชบอร์ด
          </button>
          <button v-if="hasPermission('CREATE_TASK') && columns.length > 0" @click="openAddModal(columns[0]?.id)" class="min-h-[40px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-md text-xs sm:text-sm flex items-center">
            + เพิ่มงานใหม่
          </button>
        </div>

      </div>
    </header>

    <div class="bg-white/80 backdrop-blur-md border border-amber-200/50 rounded-xl p-3 sm:p-4 mt-3 sm:mt-6 mx-3 sm:mx-6 shadow-sm flex flex-wrap items-center justify-between gap-3 sm:gap-4 relative z-10">
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
        <div class="relative w-full sm:w-auto">
          <input v-model="searchQuery" type="text" placeholder="🔍 ค้นหาการ์ดงาน..." class="pl-3 pr-4 py-2 w-full sm:w-60 min-h-[38px] bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 focus:bg-white transition-all font-semibold" />
        </div>
        <select v-model="filterAssigneeId" class="py-2 px-3 min-h-[38px] flex-1 sm:flex-initial min-w-[130px] bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 font-bold text-stone-600">
          <option value="">👤 สมาชิกทั้งหมด</option>
          <option v-for="m in projectMembers" :key="m.id" :value="m.user.id">{{ m.user.username }}</option>
        </select>
        <select v-model="filterPriority" class="py-2 px-3 min-h-[38px] flex-1 sm:flex-initial min-w-[130px] bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 font-bold text-stone-600">
          <option value="">🎯 ความเร่งด่วนทั้งหมด</option>
          <option value="URGENT">🚨 Urgent</option>
          <option value="HIGH">🟠 High</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="LOW">⚪ Low</option>
        </select>
        <select v-model="filterLabelId" class="py-2 px-3 min-h-[38px] flex-1 sm:flex-initial min-w-[130px] bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 font-bold text-stone-600">
          <option value="">🏷️ ป้ายกำกับทั้งหมด</option>
          <option v-for="lbl in projectLabels" :key="lbl.id" :value="lbl.id">🏷️ {{ lbl.name }}</option>
        </select>
      </div>

      <div class="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
        <div class="flex items-center gap-1.5 text-xs font-bold text-stone-500">
          <span>เรียงโดย:</span>
          <select v-model="sortBy" class="py-2 px-3 min-h-[38px] bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 focus:outline-none">
            <option value="position">⠿ ลำดับในคอลัมน์ (ลากเรียงเอง)</option>
            <option value="createdAt">⏰ วันที่สร้าง</option>
            <option value="dueDate">📅 วันกำหนดส่ง</option>
            <option value="priority">🎯 ระดับความเร่งด่วน</option>
          </select>
        </div>

        <div v-if="hasPermission('MANAGE_PROJECT') && columns.length > 0" class="relative">
          <button v-if="!isAddingColumn" @click="isAddingColumn = true" class="min-h-[38px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3.5 py-2 rounded-lg text-xs shadow-sm flex items-center gap-1">
            ➕ เพิ่มคอลัมน์
          </button>
          <div v-else class="flex items-center gap-1.5 bg-stone-50 p-1 rounded-lg border border-amber-300 min-h-[38px]">
            <input v-model="newColumnTitle" type="text" placeholder="ชื่อช่อง..." class="px-2 py-1 text-xs w-28 bg-white border border-stone-200 rounded focus:outline-none" @keyup.enter="addColumn" />
            <button @click="addColumn" class="min-h-[30px] min-w-[30px] flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold p-1 rounded">✅</button>
            <button @click="isAddingColumn = false" class="min-h-[30px] min-w-[30px] flex items-center justify-center bg-stone-300 text-stone-700 text-[10px] font-bold p-1 rounded">❌</button>
          </div>
        </div>
      </div>
    </div>

    <main class="flex-1 p-3 sm:p-6 overflow-x-auto relative z-10">
      <!-- Empty State if columns.length === 0 -->
      <div v-if="columns.length === 0" class="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div class="bg-white/80 backdrop-blur-md border border-amber-200/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-sm">
          <span class="text-4xl mb-3 block">📌</span>
          <h3 class="text-base font-extrabold text-stone-800 mb-1">ยังไม่มีคอลัมน์ในโปรเจกต์นี้</h3>
          <p class="text-xs text-stone-500 mb-4">
            เริ่มต้นจัดการงานด้วยการเพิ่มคอลัมน์แรกสำหรับติดตามความคืบหน้า (เช่น To Do, Doing, Done)
          </p>
          <template v-if="hasPermission('MANAGE_PROJECT')">
            <div v-if="isAddingColumn" class="flex items-center justify-center gap-2 mt-2">
              <input v-model="newColumnTitle" type="text" placeholder="ระบุชื่อคอลัมน์แรก..." class="px-3 py-2 text-xs flex-1 min-h-[40px] bg-white border border-amber-300 rounded-xl focus:outline-none font-bold text-stone-800" @keyup.enter="addColumn" />
              <button @click="addColumn" class="min-h-[40px] px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm">บันทึก</button>
              <button @click="isAddingColumn = false" class="min-h-[40px] px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-xl">ยกเลิก</button>
            </div>
            <button 
              v-else
              @click="isAddingColumn = true" 
              class="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              ➕ เพิ่มคอลัมน์แรกเลย
            </button>
          </template>
        </div>
      </div>

      <div v-else class="flex gap-4 sm:gap-6 h-full items-start pb-4 min-w-max">
        
        <div
          v-for="col in columns"
          :key="col.id"
          data-testid="column-container"
          :draggable="hasPermission('MANAGE_PROJECT') && editingColumnId !== col.id"
          @dragstart="onColumnDragStart(col.id)"
          @dragover.prevent
          @drop="onDrop(col.id)"
          class="bg-[#fdfaf5]/95 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 shadow-sm w-[85vw] sm:w-80 shrink-0 relative flex flex-col max-h-[calc(100dvh-17rem)] sm:max-h-[72vh] transition-all"
        >
          
          <div class="flex justify-between items-center mb-3 sm:mb-4" :class="hasPermission('MANAGE_PROJECT') && editingColumnId !== col.id ? 'cursor-grab active:cursor-grabbing' : ''">
            <div class="flex-1 min-w-0">
              <div v-if="editingColumnId === col.id" class="flex items-center gap-1.5">
                <input v-model="editingColumnTitle" type="text" class="bg-white border border-amber-400 rounded px-2 py-1 text-xs font-bold text-stone-800 focus:outline-none w-full min-h-[32px]" @keyup.enter="saveColumnName(col.id)" />
                <button @click="saveColumnName(col.id)" class="min-h-[32px] min-w-[32px] flex items-center justify-center text-emerald-500 text-xs">💾</button>
                <button @click="editingColumnId = null" class="min-h-[32px] min-w-[32px] flex items-center justify-center text-stone-400 text-xs">❌</button>
              </div>
              <h2 v-else class="font-extrabold text-sm text-amber-900 flex items-center gap-1.5 truncate" :title="hasPermission('MANAGE_PROJECT') ? 'ลากหัวคอลัมน์เพื่อสลับตำแหน่ง' : col.title">
                <span v-if="hasPermission('MANAGE_PROJECT')" class="text-stone-400 text-xs select-none" title="ลากเพื่อย้ายตำแหน่งคอลัมน์">⠿</span>
                <span>📌 {{ col.title }}</span>
                <span class="bg-[#f3e9d7] text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {{ getFilteredTasks(col.id).length }}
                </span>
              </h2>
            </div>
            
            <div v-if="hasPermission('MANAGE_PROJECT') && editingColumnId !== col.id" class="flex items-center gap-1">
              <button @click="editingColumnId = col.id; editingColumnTitle = col.title" class="min-h-[32px] min-w-[32px] flex items-center justify-center text-stone-400 hover:text-amber-600 text-xs p-1" title="เปลี่ยนชื่อช่อง">✏️</button>
              <button @click="triggerDeleteColumn(col.id, col.title)" class="min-h-[32px] min-w-[32px] flex items-center justify-center text-stone-400 hover:text-rose-600 text-xs p-1 transition-all" title="ลบช่อง">🗑️</button>
            </div>
          </div>

          <div class="space-y-3 overflow-y-auto pr-1 flex-1">
            
            <div
              v-for="task in getFilteredTasks(col.id)"
              :key="task.id"
              :draggable="hasPermission('MOVE_TASK')"
              @dragstart.stop="onDragStart(task.id)"
              @dragover.prevent
              @drop.stop="onDropOnTask(task.id, col.id)"
              :class="!hasPermission('MOVE_TASK') ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:border-amber-400'"
              class="bg-white p-3.5 sm:p-4 rounded-xl border border-amber-100 shadow-sm transition-all group relative"
            >
              
              <div v-if="task.labels && task.labels.length > 0" class="flex flex-wrap gap-1 mb-2">
                <span v-for="lbl in task.labels" :key="lbl.id" :style="{ backgroundColor: lbl.color }" class="text-[9px] font-black text-white px-2 py-0.5 rounded shadow-sm">
                  {{ lbl.name }}
                </span>
              </div>

              <div class="flex justify-between items-start gap-2">
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-stone-800 text-sm leading-snug mb-1 truncate flex items-center gap-1.5">
                    {{ task.title }}
                    <span v-if="task.priority === 'URGENT'" class="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-black border border-rose-200">URGENT</span>
                    <span v-else-if="task.priority === 'HIGH'" class="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black">HIGH</span>
                  </h3>
                  <p class="text-stone-400 text-xs truncate break-all">{{ task.description || 'ไม่มีรายละเอียด...' }}</p>
                  
                  <div v-if="(task.subtasks && task.subtasks.length > 0) || (task.attachments && task.attachments.length > 0)" class="flex flex-col gap-1.5 mt-2.5">
                    <div class="flex items-center gap-2.5 text-[10px] font-extrabold text-stone-400">
                      <span v-if="task.subtasks && task.subtasks.length > 0" :class="task.subtasks.filter(s => s.isCompleted).length === task.subtasks.length ? 'text-emerald-600' : ''" class="flex items-center gap-0.5">
                        ☑️ {{ task.subtasks.filter(s => s.isCompleted).length }}/{{ task.subtasks.length }}
                      </span>
                      <span v-if="task.attachments && task.attachments.length > 0" class="flex items-center gap-0.5">
                        📎 {{ task.attachments.length }}
                      </span>
                    </div>
                    
                    <!-- Subtask Progress Bar -->
                    <div v-if="task.subtasks && task.subtasks.length > 0" class="w-full bg-stone-200/60 h-1 rounded-full overflow-hidden relative">
                      <div 
                        class="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                        :style="{ width: `${(task.subtasks.filter(s => s.isCompleted).length / task.subtasks.length) * 100}%` }"
                      ></div>
                    </div>
                  </div>

                  <div v-if="task.dueDate || task.assignee" class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100 text-[10px]">
                    <div v-if="task.dueDate" :class="isOverdue(task.dueDate) ? 'bg-rose-50 text-rose-700 border-rose-250 font-black' : 'bg-amber-50 text-amber-700 border-amber-250'" class="px-2 py-0.5 rounded border flex items-center gap-1 shrink-0">
                      📅 {{ formatDate(task.dueDate) }}
                    </div>
                    <div v-if="task.assignee" class="flex items-center gap-1.5 text-stone-600 ml-auto shrink-0">
                      <div class="w-5 h-5 rounded-full bg-amber-600 text-white text-[9px] font-black flex items-center justify-center uppercase shadow-sm" :title="task.assignee.username">
                        {{ getInitials(task.assignee.username) }}
                      </div>
                      <span class="font-bold text-[10px] max-w-[70px] truncate">{{ task.assignee.username }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-100">
                    <button v-if="hasPermission('CREATE_TASK')" @click="openEditModal(task)" class="min-h-[36px] px-2 py-1 text-amber-600 text-xs font-black flex items-center">✏️ แก้ไข</button>
                    <button v-else @click="openEditModal(task)" class="min-h-[36px] px-2 py-1 text-stone-600 hover:text-amber-700 text-xs font-black flex items-center">🔍 ดูรายละเอียด</button>
                    <button v-if="hasPermission('DELETE_TASK')" @click="deleteTask(task.id)" class="min-h-[36px] px-2 py-1 text-rose-600 text-xs font-black flex items-center ml-auto">🗑️ ลบ</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="getFilteredTasks(col.id).length === 0" class="border-2 border-dashed border-amber-100 rounded-xl p-6 text-center text-stone-400 text-xs font-semibold">ไม่มีงานค้างอยู่ในช่องนี้</div>
          </div>
          
          <button v-if="hasPermission('CREATE_TASK')" @click="openAddModal(col.id)" class="mt-3 sm:mt-4 min-h-[42px] border border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 text-amber-800 font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1">
            ➕ เพิ่มการ์ดงานใหม่
          </button>
        </div>

      </div>
    </main>

    <div v-if="isModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl w-full max-w-4xl max-h-[90dvh] flex flex-col shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>

        <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200/60 bg-white flex justify-between items-center mt-1">
          <h2 class="text-base sm:text-lg font-black text-stone-850 flex items-center gap-2">
            {{ !hasPermission('CREATE_TASK') ? '🔍 รายละเอียดการ์ดงาน (โหมดดูอย่างเดียว)' : (isEditMode ? '✏️ รายละเอียดการ์ดงาน' : '➕ เพิ่มการ์ดงานใหม่') }}
          </h2>
          <button @click="isModalOpen = false" class="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-400 hover:text-stone-600 focus:outline-none">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          
          <div class="md:col-span-2 space-y-4 sm:space-y-5">
            <div v-if="taskModalError" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ taskModalError }}</span>
            </div>

            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">หัวข้องาน</label>
              <input v-model="taskTitle" :disabled="!hasPermission('CREATE_TASK')" type="text" placeholder="เช่น เขียนคู่มือระบบ..." class="w-full bg-white disabled:bg-stone-100 disabled:text-stone-500 border border-stone-200 rounded-xl px-3.5 py-2.5 min-h-[44px] text-stone-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
            </div>

            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">รายละเอียด</label>
              <textarea v-model="taskDescription" :disabled="!hasPermission('CREATE_TASK')" rows="4" placeholder="อธิบายรายละเอียดงานเล็กน้อย..." class="w-full bg-white disabled:bg-stone-100 disabled:text-stone-500 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"></textarea>
            </div>

            <div v-if="isEditMode" class="border-t border-stone-200/60 pt-4">
              <label class="block text-xs font-black text-stone-500 mb-2 uppercase tracking-wider">☑️ งานย่อย (Checklist)</label>
              
              <div v-if="subtasks.length > 0" class="space-y-2 mb-3">
                <div v-for="sub in subtasks" :key="sub.id" class="flex items-center justify-between bg-white border border-stone-100 rounded-xl p-2.5 shadow-xs">
                  <div class="flex items-center gap-2.5 flex-1 min-w-0">
                    <input v-model="sub.isCompleted" :disabled="!hasPermission('CREATE_TASK')" type="checkbox" @change="toggleSubtask(sub)" class="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed" />
                    <span :class="sub.isCompleted ? 'line-through text-stone-400 font-normal' : 'text-stone-700 font-bold'" class="text-sm truncate">
                      {{ sub.title }}
                    </span>
                  </div>
                  <button v-if="hasPermission('CREATE_TASK')" @click="deleteSubtask(sub.id)" class="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-rose-600 p-1 text-xs font-bold transition-all">ลบ</button>
                </div>
              </div>

              <div v-if="hasPermission('CREATE_TASK')" class="flex items-center gap-2">
                <input v-model="newSubtaskTitle" type="text" placeholder="ระบุงานย่อยใหม่..." class="flex-1 min-h-[40px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 text-base sm:text-xs focus:outline-none focus:border-amber-500" @keyup.enter="addSubtask" />
                <button @click="addSubtask" class="min-h-[40px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center">
                  เพิ่ม
                </button>
              </div>
            </div>

            <div v-if="isEditMode" class="border-t border-stone-200/60 pt-4">
              <label class="block text-xs font-black text-stone-500 mb-2 uppercase tracking-wider">📎 ไฟล์แนบ (Attachments)</label>
              
              <div v-if="attachments.length > 0" class="space-y-2 mb-3">
                <div v-for="att in attachments" :key="att.id" class="flex items-center justify-between gap-2 bg-stone-50 border border-stone-200/60 rounded-xl p-2.5 text-xs">
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <span class="text-amber-700 shrink-0">📄</span>
                    <a :href="att.filePath" :download="att.fileName" target="_blank" class="font-bold text-amber-700 hover:underline truncate">{{ att.fileName }}</a>
                    <span class="text-stone-400 shrink-0">({{ att.fileSize >= 1048576 ? `${(att.fileSize / 1048576).toFixed(1)} MB` : `${(att.fileSize / 1024).toFixed(1)} KB` }})</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[10px] text-stone-400 hidden sm:inline">{{ new Date(att.createdAt).toLocaleDateString('th-TH') }}</span>
                    <button
                      v-if="hasPermission('CREATE_TASK') || hasPermission('DELETE_TASK')"
                      type="button"
                      @click="deleteAttachment(att.id)"
                      class="min-h-[32px] px-2 py-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-xs transition-all flex items-center gap-1"
                      title="ลบไฟล์แนบนี้ออกจากการ์ด"
                    >
                      <span>🗑️</span>
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="hasPermission('CREATE_TASK')" class="flex flex-wrap items-center gap-2">
                <label class="min-h-[40px] bg-white border border-dashed border-amber-300 hover:border-amber-500 text-amber-800 hover:bg-amber-50 font-bold px-4 py-2 rounded-xl cursor-pointer transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5">
                  📁 เลือกไฟล์เพื่ออัปโหลด
                  <input type="file" class="hidden" @change="handleFileUpload" />
                </label>
                <span class="text-[10px] text-stone-400 font-semibold">สูงสุดไม่เกิน 30MB</span>
              </div>
            </div>

            <div v-if="isEditMode" class="border-t border-stone-200/60 pt-4">
              <label class="block text-xs font-black text-stone-500 mb-2 uppercase tracking-wider">💬 บอร์ดความคิดเห็น (Comments)</label>
              
              <div v-if="comments.length > 0" class="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                <div v-for="c in comments" :key="c.id" class="bg-white border border-stone-100 rounded-xl p-3 shadow-xs">
                  <div class="flex justify-between items-center mb-1 text-[11px]">
                    <span class="font-black text-amber-900 flex items-center gap-1 flex-wrap">
                      <span v-if="isAdminOverrideActor(c.user)" class="inline-flex items-center gap-0.5 bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded text-[9px] font-black">
                        🛡️ [ผู้ดูแลระบบ]
                      </span>
                      <span>{{ c.user.username }}</span>
                    </span>
                    <span class="text-stone-400 font-mono">{{ new Date(c.createdAt).toLocaleString('th-TH') }}</span>
                  </div>
                  <p class="text-stone-700 text-xs font-semibold break-words leading-relaxed">{{ c.content }}</p>
                </div>
              </div>

              <div v-if="hasPermission('CREATE_TASK')" class="flex gap-2">
                <input v-model="newCommentContent" type="text" placeholder="พิมพ์ความคิดเห็นของคุณ..." class="flex-1 min-h-[40px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-850 text-base sm:text-xs focus:outline-none focus:border-amber-500" @keyup.enter="addComment" />
                <button @click="addComment" class="min-h-[40px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center">
                  ส่ง
                </button>
              </div>
            </div>
          </div>

          <!-- Right settings column -->
          <div class="bg-stone-50 border-t md:border-t-0 md:border-l border-stone-200/60 p-4 rounded-xl md:rounded-none md:-my-6 md:-mr-6 space-y-4 sm:space-y-5 overflow-y-auto">
            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">📌 คอลัมน์ (สถานะงาน)</label>
              <select v-model="activeAddColumnId" :disabled="isEditMode ? (!hasPermission('MOVE_TASK') && !hasPermission('CREATE_TASK')) : !hasPermission('CREATE_TASK')" class="w-full min-h-[44px] bg-white disabled:bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-bold text-base sm:text-xs focus:outline-none">
                <option v-for="col in columns" :key="col.id" :value="col.id">
                  📌 {{ col.title }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">👤 ผู้รับผิดชอบ</label>
              <select v-model="taskAssigneeId" :disabled="!hasPermission('CREATE_TASK')" class="w-full min-h-[44px] bg-white disabled:bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 text-base sm:text-xs focus:outline-none">
                <option value="">ไม่มี (Unassigned)</option>
                <option v-for="member in projectMembers" :key="member.user.id" :value="member.user.id">
                  {{ member.user.username }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">📅 กำหนดส่งงาน</label>
              <input v-model="taskDueDate" :disabled="!hasPermission('CREATE_TASK')" type="date" class="w-full min-h-[44px] bg-white disabled:bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 text-base sm:text-xs focus:outline-none cursor-pointer disabled:cursor-not-allowed" />
            </div>

            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">🎯 ความสำคัญ (Priority)</label>
              <select v-model="taskPriority" :disabled="!hasPermission('CREATE_TASK')" class="w-full min-h-[44px] bg-white disabled:bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 text-base sm:text-xs focus:outline-none">
                <option value="LOW">Low (ต่ำ)</option>
                <option value="MEDIUM">Medium (ปานกลาง)</option>
                <option value="HIGH">High (สูง)</option>
                <option value="URGENT">Urgent (ด่วนที่สุด)</option>
              </select>
            </div>

            <!-- Labels Select -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-xs font-black text-stone-500 uppercase tracking-wider">🏷️ ป้ายกำกับสี (Labels)</label>
                <button v-if="hasPermission('CREATE_TASK') && !isCreatingLabel" @click="isCreatingLabel = true" class="text-xs font-black text-amber-600 hover:underline py-1">เพิ่มป้าย</button>
              </div>
              
              <div v-if="isCreatingLabel" class="bg-white border border-stone-200 rounded-xl p-2.5 mb-2.5 space-y-2 text-xs">
                <input v-model="newLabelName" type="text" placeholder="ชื่อแท็ก..." class="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none text-xs" @keyup.enter="createProjectLabel" />
                <div class="flex items-center justify-between gap-2">
                  <input v-model="newLabelColor" type="color" class="w-8 h-8 p-0 border border-stone-300 rounded cursor-pointer shrink-0" />
                  <div class="flex items-center gap-1.5">
                    <button @click="createProjectLabel" class="min-h-[32px] bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs shadow-sm">บันทึก</button>
                    <button @click="isCreatingLabel = false" class="min-h-[32px] bg-stone-300 text-stone-700 font-bold px-2.5 py-1 rounded-lg text-xs">ปิด</button>
                  </div>
                </div>
              </div>

              <div v-if="projectLabels.length > 0" class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                <div v-for="lbl in projectLabels" :key="lbl.id" class="flex items-center justify-between gap-2 py-1 px-1.5 rounded-lg hover:bg-stone-100/80 transition-colors">
                  <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-600 flex-1 min-w-0">
                    <input type="checkbox" :disabled="!hasPermission('CREATE_TASK')" :value="lbl.id" v-model="selectedLabelIds" class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 disabled:cursor-not-allowed shrink-0" />
                    <span :style="{ backgroundColor: lbl.color }" class="text-[9px] font-black text-white px-2 py-0.5 rounded shadow-sm truncate">
                      {{ lbl.name }}
                    </span>
                  </label>
                  <button
                    v-if="hasPermission('CREATE_TASK') || hasPermission('DELETE_TASK')"
                    type="button"
                    @click.stop="deleteProjectLabel(lbl.id)"
                    class="min-h-[28px] min-w-[28px] flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md text-xs transition-all shrink-0"
                    title="ลบป้ายกำกับนี้ออกจากบอร์ด"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div v-else class="text-[10px] text-stone-400 py-1">ยังไม่มีการตั้งค่าป้ายสีบอร์ดนี้</div>
            </div>

            <!-- Modal activity timeline logs -->
            <div v-if="isEditMode" class="border-t border-stone-200/60 pt-4 mt-2">
              <label class="block text-[10px] font-black text-stone-400 mb-2 uppercase tracking-wider">📜 กิจกรรมการ์ดงาน</label>
              <div v-if="isLoadingLogs" class="text-[10px] text-stone-400 py-1">กำลังโหลดประวัติ...</div>
              <div v-else-if="taskLogs.length === 0" class="text-[10px] text-stone-400 py-1">ยังไม่มีกิจกรรมใดๆ</div>
              <div v-else class="max-h-36 overflow-y-auto space-y-2 pr-1 text-[10px]">
                <div v-for="log in taskLogs" :key="log.id" class="flex gap-2 items-start leading-snug">
                  <div class="w-1.5 h-1.5 rounded-full shrink-0 mt-1 bg-amber-500"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-stone-700 font-bold break-words">
                      <span v-if="isAdminOverrideActor(log.user)" class="inline-flex items-center gap-0.5 bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded text-[9px] font-black mr-1">
                        🛡️ [ผู้ดูแลระบบ]
                      </span>
                      <span class="font-black text-stone-900">{{ log.user.username }}</span>
                      {{ log.details }}
                    </p>
                    <p class="text-[8.5px] text-stone-400 font-mono mt-0.5">{{ new Date(log.createdAt).toLocaleString('th-TH') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-4 sm:px-6 py-3 sm:py-4 border-t border-stone-200/60 bg-white flex justify-end gap-2.5">
          <button @click="isModalOpen = false" :disabled="isSavingTask" class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 disabled:opacity-50 text-stone-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center">{{ (hasPermission('CREATE_TASK') || (isEditMode && hasPermission('MOVE_TASK'))) ? 'ยกเลิก' : 'ปิดหน้าต่าง' }}</button>
          <button 
            v-if="hasPermission('CREATE_TASK') || (isEditMode && hasPermission('MOVE_TASK'))"
            @click="handleSubmit" 
            :disabled="isSavingTask" 
            class="min-h-[44px] px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span v-if="isSavingTask" class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
            {{ isSavingTask ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกงาน') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal จัดการสิทธิ์ทีมงาน (isManageTeamModalOpen) -->
    <div v-if="isManageTeamModalOpen" class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div class="bg-[#fdfaf5] border border-amber-200 rounded-2xl w-full max-w-4xl max-h-[90dvh] h-auto md:h-[600px] flex flex-col shadow-2xl overflow-hidden relative">
        <!-- แถบสีส้มไล่เฉดด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
        
        <div class="p-4 bg-white border-b border-amber-200/60 flex justify-between items-center mt-1">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-stone-800">⚙️ การตั้งค่าระบบทีมและสิทธิ์</h2>
            <p class="text-xs text-stone-400 font-medium mt-0.5">บริหารจัดการตี้ มอบยศตำแหน่ง หรือเนรเทศสมาชิกที่ไม่ทำงาน</p>
          </div>
          <button @click="isManageTeamModalOpen = false" class="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-400 hover:text-stone-600 p-1.5 focus:outline-none transition-colors">
            <!-- SVG Icon Close -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex bg-stone-100 border-b border-amber-200/40">
          <button @click="activeTab = 'members'" :class="activeTab === 'members' ? 'bg-[#fdfaf5] text-amber-900 border-b-2 border-amber-500 font-black' : 'text-stone-500 font-bold'" class="flex-1 min-h-[44px] py-3 text-xs sm:text-sm transition-all focus:outline-none flex items-center justify-center">
            👥 รายชื่อสมาชิกในบอร์ด ({{ projectMembers.length }})
          </button>
          <button @click="activeTab = 'roles'" :class="activeTab === 'roles' ? 'bg-[#fdfaf5] text-amber-900 border-b-2 border-amber-500 font-black' : 'text-stone-500 font-bold'" class="flex-1 min-h-[44px] py-3 text-xs sm:text-sm transition-all focus:outline-none flex items-center justify-center">
            ⚔️ ตั้งค่า Custom Roles
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fdfaf5]">
          
          <div v-if="activeTab === 'members'" class="space-y-4">
            <div class="border border-amber-100 rounded-xl overflow-x-auto bg-white shadow-sm">
              <table class="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr class="bg-stone-50 text-stone-500 text-xs font-bold uppercase border-b border-amber-100">
                    <th class="p-3">ชื่อผู้ใช้ / อีเมล</th>
                    <th class="p-3">ยศตำแหน่ง</th>
                    <th class="p-3 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-100 text-sm">
                  <tr v-for="member in projectMembers" :key="member.id" class="hover:bg-amber-50/30 transition-colors">
                    <td class="p-3">
                      <p class="font-bold text-stone-800 flex items-center gap-1.5 flex-wrap">
                        <span>{{ member.user.username }}</span>
                        <span v-if="member.user.id === projectOwnerId" class="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full">
                          👑 เจ้าของบอร์ด
                        </span>
                      </p>
                      <p class="text-xs text-stone-400 font-mono">{{ member.user.email }}</p>
                    </td>
                    <td class="p-3">
                      <select 
                        :value="member.roleId || ''" 
                        @change="changeMemberRole(member.id, $event.target.value, $event)"
                        class="min-h-[38px] bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                      >
                        <option value="">{{ member.user.id === projectOwnerId ? '👑 เจ้าของโปรเจกต์ (สิทธิ์สูงสุด)' : '👤 สมาชิกทั่วไป (No Role)' }}</option>
                        <option v-for="role in projectRoles" :key="role.id" :value="role.id">⚔️ {{ role.name }}</option>
                      </select>
                    </td>
                    <td class="p-3 text-center">
                      <span v-if="member.user.id === projectOwnerId" class="text-xs font-bold text-amber-700">
                        👑 เจ้าของโปรเจกต์
                      </span>
                      <button v-else @click="kickMember(member.id, member.user.username)" class="min-h-[38px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm">
                        🚪 เตะออก
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="activeTab === 'roles'" class="space-y-6">
            <div class="bg-white border border-amber-200/70 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-end">
              <div class="flex-1 w-full sm:w-auto">
                <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">🛠️ สร้างยศตำแหน่งใหม่</label>
                <input v-model="newRoleName" type="text" placeholder="เช่น QA Tester, Frontend Dev..." class="w-full min-h-[44px] bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
              </div>
              <button @click="createNewRole" class="min-h-[44px] w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-5 py-2 rounded-xl shadow-sm shadow-amber-600/10 shrink-0 transition-all flex items-center justify-center">
                ➕ เพิ่มยศใหม่
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="role in projectRoles" :key="role.id" class="border border-amber-200/60 rounded-xl p-4 bg-white shadow-sm space-y-3">
                <div class="flex justify-between items-center border-b border-stone-100 pb-2">
                  <input 
                    v-model="role.name" 
                    type="text" 
                    @change="updateRoleData(role)"
                    class="font-black text-amber-900 border-b border-transparent hover:border-amber-300 focus:border-amber-500 focus:outline-none text-base bg-transparent px-1 py-1 min-h-[38px]"
                    title="คลิกเพื่อแก้ไขชื่อยศ"
                  />
                  <button @click="deleteRole(role.id)" class="min-h-[36px] text-rose-500 hover:text-rose-700 text-xs font-bold px-2 flex items-center">🗑️ ลบยศนี้ทิ้ง</button>
                </div>

                <div>
                  <p class="text-[11px] font-bold text-stone-400 mb-2 uppercase tracking-wide">สิทธิ์เข้าถึงฟีเจอร์ต่างๆ (Permissions Check)</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-stone-600">
                    <label class="flex items-center gap-2 cursor-pointer py-1">
                      <input type="checkbox" :checked="role.permissions.includes('CREATE_TASK')" @change="togglePermission(role, 'CREATE_TASK')" class="w-4 h-4 rounded text-amber-600 focus:ring-amber-400" /> สร้าง/แก้ไขการ์ดงานได้
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer py-1">
                      <input type="checkbox" :checked="role.permissions.includes('MOVE_TASK')" @change="togglePermission(role, 'MOVE_TASK')" class="w-4 h-4 rounded text-amber-600 focus:ring-amber-400" /> เลื่อนปรับลำดับ/ย้ายการ์ดในคอลัมน์ได้
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer py-1">
                      <input type="checkbox" :checked="role.permissions.includes('DELETE_TASK')" @change="togglePermission(role, 'DELETE_TASK')" class="w-4 h-4 rounded text-amber-600 focus:ring-amber-400" /> สั่งลบการ์ดงานได้
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer py-1">
                      <input type="checkbox" :checked="role.permissions.includes('MANAGE_PROJECT')" @change="togglePermission(role, 'MANAGE_PROJECT')" class="w-4 h-4 rounded text-amber-600 focus:ring-amber-400" /> สิทธิ์จัดการบอร์ด/แก้ไขชื่อ
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer py-1">
                      <input type="checkbox" :checked="role.permissions.includes('INVITE_MEMBERS')" @change="togglePermission(role, 'INVITE_MEMBERS')" class="w-4 h-4 rounded text-amber-600 focus:ring-amber-400" /> สิทธิ์ดู/แชร์รหัสเชิญ (Invite)
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบโครงการ (isDeleteProjectModalOpen) -->
    <div v-if="isDeleteProjectModalOpen" class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-250 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <!-- แถบสีแดงไล่เฉดด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-600"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-rose-700 mb-1">🚨 ลบโครงการแบบถาวร?</h3>
            <p class="text-stone-700 text-sm font-bold leading-relaxed mb-2">
              คำเตือนขั้นเด็ดขาด: ต้องการลบโครงการ <span class="text-rose-600 font-black">"{{ projectName }}"</span> ใช่หรือไม่?
            </p>
            <p class="text-stone-500 text-xs leading-relaxed">
              ข้อมูลการ์ดงาน คอลัมน์ เช็คลิสต์ สมาชิก ยศตำแหน่ง และประวัติกิจกรรมทั้งหมดจะสูญหายโดยสิ้นเชิงและไม่สามารถกู้คืนได้อีก
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 mt-6 pt-4 border-t border-stone-100">
          <button @click="isDeleteProjectModalOpen = false" class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center">
            ยกเลิก
          </button>
          <button @click="confirmDeleteProject" class="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-rose-500/10 flex items-center justify-center">
            ลบโครงการถาวร 🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบช่องคอลัมน์ (isDeleteColumnModalOpen) -->
    <div v-if="isDeleteColumnModalOpen" class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <!-- แถบสีแดงไล่เฉดด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-rose-600"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-50 text-rose-500 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base sm:text-lg font-black text-rose-700 mb-1">🗑️ ลบคอลัมน์?</h3>
            <p class="text-stone-700 text-sm font-bold leading-relaxed mb-2">
              คุณแน่ใจหรือไม่ว่าต้องการลบคอลัมน์ <span class="text-rose-600 font-black">"{{ columnToDeleteTitle }}"</span> ใช่หรือไม่?
            </p>

            <div v-if="tasks.filter(t => t.columnId === columnToDeleteId).length > 0" class="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5 text-xs">
              <p class="font-extrabold text-amber-900">
                ⚠️ พบการ์ดงานค้างอยู่ในคอลัมน์นี้จำนวน {{ tasks.filter(t => t.columnId === columnToDeleteId).length }} ใบ:
              </p>

              <template v-if="columns.length > 1">
                <label class="flex items-start gap-2 cursor-pointer font-bold text-stone-700">
                  <input type="radio" value="move" v-model="deleteColumnTaskAction" class="mt-0.5 text-amber-600 focus:ring-amber-500" />
                  <div class="flex-1 space-y-1.5">
                    <span>📦 ย้ายการ์ดทั้งหมดไปที่คอลัมน์อื่น (แนะนำ)</span>
                    <select
                      v-if="deleteColumnTaskAction === 'move'"
                      v-model="deleteColumnTargetId"
                      class="w-full min-h-[38px] bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:outline-none"
                    >
                      <option v-for="col in columns.filter(c => c.id !== columnToDeleteId)" :key="col.id" :value="col.id">
                        📌 {{ col.title }}
                      </option>
                    </select>
                  </div>
                </label>

                <label class="flex items-start gap-2 cursor-pointer font-bold text-rose-700 pt-1 border-t border-amber-200/60">
                  <input type="radio" value="delete" v-model="deleteColumnTaskAction" class="mt-0.5 text-rose-600 focus:ring-rose-500" />
                  <span>🗑️ ลบการ์ดทั้ง {{ tasks.filter(t => t.columnId === columnToDeleteId).length }} ใบในคอลัมน์นี้ทิ้งไปพร้อมกัน</span>
                </label>
              </template>
              <p v-else class="font-bold text-rose-700 leading-relaxed">
                🗑️ เนื่องจากเป็นคอลัมน์สุดท้ายของบอร์ด การ์ดทั้ง {{ tasks.filter(t => t.columnId === columnToDeleteId).length }} ใบจะถูกลบทิ้งไปพร้อมกับคอลัมน์นี้
              </p>
            </div>
            <p v-else class="text-stone-500 text-xs leading-relaxed">
              คอลัมน์นี้ไม่มีการ์ดงานค้างอยู่ สามารถลบออกได้ทันทีครับ
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 mt-6 pt-4 border-t border-stone-100">
          <button @click="isDeleteColumnModalOpen = false; columnToDeleteId = null; columnToDeleteTitle = ''" class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center">
            ยกเลิก
          </button>
          <button @click="confirmDeleteColumn" class="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-rose-500/10 flex items-center justify-center">
            ยืนยันลบคอลัมน์
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบการ์ดงาน -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <!-- แถบสีแดงด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-stone-800 mb-1">🗑️ ยืนยันการลบการ์ดงาน</h3>
            <p class="text-stone-500 text-xs sm:text-sm font-medium">คุณแน่ใจหรือไม่ว่าต้องการลบการ์ดงานใบนี้? การกระทำนี้ไม่สามารถย้อนกลับได้และข้อมูลงานจะหายไปถาวร</p>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 mt-6 pt-4 border-t border-stone-100">
          <button 
            @click="isDeleteModalOpen = false; taskToDeleteId = null" 
            class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmDeleteTask" 
            class="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center"
          >
            ยืนยันลบถาวร ⚠️
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบยศตำแหน่ง -->
    <div v-if="isDeleteRoleModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <!-- แถบสีแดงด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-stone-800 mb-1">⚔️ ยืนยันการลบยศตำแหน่ง</h3>
            <p class="text-stone-500 text-xs sm:text-sm font-medium">คุณแน่ใจหรือไม่ว่าต้องการลบยศตำแหน่งนี้? สมาชิกที่ถือครองยศนี้อยู่จะถูกถอดถอนสิทธิ์การใช้งานออกทั้งหมดทันที</p>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 mt-6 pt-4 border-t border-stone-100">
          <button 
            @click="isDeleteRoleModalOpen = false; roleToDeleteId = null" 
            class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmDeleteRole" 
            class="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center"
          >
            ยืนยันลบยศ ⚠️
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการเนรเทศสมาชิก -->
    <div v-if="isKickModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative overflow-hidden max-h-[90dvh] overflow-y-auto">
        <!-- แถบสีแดงด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-stone-800 mb-1">🚪 ยืนยันการเนรเทศสมาชิก</h3>
            <p class="text-stone-500 text-xs sm:text-sm font-medium">คุณแน่ใจหรือไม่ว่าต้องการเนรเทศคุณ <span class="font-bold text-stone-800">"{{ memberToKickUsername }}"</span> ออกจากโปรเจกต์นี้? การกระทำนี้จะถอนสิทธิ์เข้าบอร์ดทั้งหมดทันที</p>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 mt-6 pt-4 border-t border-stone-100">
          <button 
            @click="isKickModalOpen = false; memberToKickId = null; memberToKickUsername = ''" 
            class="min-h-[44px] px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmKickMember" 
            class="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center"
          >
            เนรเทศออก 🚪
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Toast />

  </div>
</template>

<style scoped>
.bg-grid { background-image: radial-gradient(#bcaaa4 1px, transparent 1px); background-size: 24px 24px; }
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const projectId = Number(route.params.id)

const currentUser = ref(null)
const projectOwnerId = ref(null)
const projectOwnerUsername = ref('')
const tasks = ref([])
const currentInviteCode = ref('')
const isInviteActive = ref(true)
const isUpdatingInviteSettings = ref(false)
const isCopied = ref(false)
const isEditingProjectName = ref(false)
const newProjectName = ref('')
const isInviteCodeVisible = ref(false)
const projectName = ref('') 
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingTaskId = ref(null)
const isSavingTask = ref(false)
const taskModalError = ref('')

const isKickModalOpen = ref(false)
const memberToKickId = ref(null)
const memberToKickUsername = ref('')

const { showToast } = useToast()

const taskTitle = ref('')
const taskDescription = ref('')
const taskAssigneeId = ref('')
const taskDueDate = ref('')
const taskPriority = ref('MEDIUM')
const selectedLabelIds = ref([])
const taskLogs = ref([])
const isLoadingLogs = ref(false)

// [STATE คอลัมน์ยืดหยุ่น]
const columns = ref([])
const isAddingColumn = ref(false)
const newColumnTitle = ref('')
const editingColumnId = ref(null)
const editingColumnTitle = ref('')

// [STATE งานย่อย, ไฟล์แนบ, คอมเมนต์]
const subtasks = ref([])
const newSubtaskTitle = ref('')
const attachments = ref([])
const comments = ref([])
const newCommentContent = ref('')
const projectLabels = ref([])
const isCreatingLabel = ref(false)
const newLabelName = ref('')
const newLabelColor = ref('#D4AF37')

// [STATE ค้นหา & ฟิลเตอร์]
const searchQuery = ref('')
const filterAssigneeId = ref('')
const filterPriority = ref('')
const filterLabelId = ref('')
const sortBy = ref('position')

const getApiErrorMessage = (err, fallback) => {
  return err?.data?.message || err?.data?.statusMessage || fallback
}

// [STATE การแจ้งเตือน]
const notifications = ref([])
const isNotificationsOpen = ref(false)

// [STATE ของระบบจัดการทีมและยศ]
const isManageTeamModalOpen = ref(false)
const isDeleteProjectModalOpen = ref(false)
const isDeleteColumnModalOpen = ref(false)
const columnToDeleteId = ref(null)
const columnToDeleteTitle = ref('')
const deleteColumnTaskAction = ref('move')
const deleteColumnTargetId = ref(null)
const activeTab = ref('members')
const projectMembers = ref([])
const projectRoles = ref([])
const newRoleName = ref('')

const isOverdue = (dueDateStr) => {
  if (!dueDateStr) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr)
  due.setHours(0, 0, 0, 0)
  return due < now
}

const formatDate = (dueDateStr) => {
  if (!dueDateStr) return ''
  // จัดการกรณีเป็นสตริงวันที่รูปแบบ YYYY-MM-DD
  if (typeof dueDateStr === 'string' && dueDateStr.includes('-') && !dueDateStr.includes('T')) {
    const parts = dueDateStr.split('-')
    if (parts.length === 3) {
      const [y, m, d] = parts
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
    }
  }
  const date = new Date(dueDateStr)
  if (isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const getInitials = (username) => {
  if (!username) return '?'
  return username.substring(0, 2).toUpperCase()
}

// --- การจัดการคอลัมน์ ---
const fetchColumns = async () => {
  try {
    const res = await $fetch(`/api/columns?projectId=${projectId}&t=${Date.now()}`)
    if (res.success) {
      columns.value = res.data
    }
  } catch (err) {
    console.error('Error fetching columns:', err)
    if (err.statusCode === 404) {
      showToast('โปรเจกต์นี้ถูกลบไปแล้ว 🗑️', 'info')
      navigateTo('/dashboard')
    } else if ((err.statusCode === 403 || err.statusCode === 401) && currentUser.value?.role !== 'ADMIN') {
      navigateTo('/dashboard')
    }
  }
}

const addColumn = async () => {
  if (!newColumnTitle.value.trim()) return
  try {
    const res = await $fetch('/api/columns/create', {
      method: 'POST',
      body: { projectId, title: newColumnTitle.value.trim() }
    })
    if (res.success) {
      newColumnTitle.value = ''
      isAddingColumn.value = false
      // Instant UI reactivity update
      if (res.data && !columns.value.some(c => c.id === res.data.id)) {
        columns.value.push(res.data)
      }
      await fetchColumns()
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'สร้างคอลัมน์ไม่สำเร็จ'), 'error')
  }
}

const triggerDeleteColumn = (columnId, columnTitle) => {
  columnToDeleteId.value = columnId
  columnToDeleteTitle.value = columnTitle
  const fallbackCol = columns.value.find(c => c.id !== columnId)
  deleteColumnTaskAction.value = fallbackCol ? 'move' : 'delete'
  deleteColumnTargetId.value = fallbackCol ? fallbackCol.id : null
  isDeleteColumnModalOpen.value = true
}

const confirmDeleteColumn = async () => {
  if (!columnToDeleteId.value) return
  const idToDelete = columnToDeleteId.value
  const hasTasksInCol = tasks.value.some(t => t.columnId === idToDelete)

  const params = new URLSearchParams({ id: String(idToDelete) })
  if (hasTasksInCol) {
    if (deleteColumnTaskAction.value === 'move' && deleteColumnTargetId.value) {
      params.set('targetColumnId', String(deleteColumnTargetId.value))
    } else if (deleteColumnTaskAction.value === 'delete') {
      params.set('forceDeleteTasks', 'true')
    }
  }

  try {
    const res = await $fetch(`/api/columns/delete?${params.toString()}`, {
      method: 'DELETE'
    })
    if (res.success) {
      isDeleteColumnModalOpen.value = false
      // Instant UI reactivity update
      if (hasTasksInCol) {
        if (deleteColumnTaskAction.value === 'move' && deleteColumnTargetId.value) {
          tasks.value = tasks.value.map(t => t.columnId === idToDelete ? { ...t, columnId: Number(deleteColumnTargetId.value) } : t)
        } else {
          tasks.value = tasks.value.filter(t => t.columnId !== idToDelete)
        }
      }
      columns.value = columns.value.filter(c => c.id !== idToDelete)
      columnToDeleteId.value = null
      columnToDeleteTitle.value = ''
      await Promise.all([fetchColumns(), fetchTasks()])
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'ไม่สามารถลบคอลัมน์ได้'), 'error')
  }
}

const saveColumnName = async (columnId) => {
  if (!editingColumnTitle.value.trim()) return
  try {
    const res = await $fetch('/api/columns/update', {
      method: 'PUT',
      body: { id: columnId, title: editingColumnTitle.value.trim() }
    })
    if (res.success) {
      editingColumnId.value = null
      await fetchColumns()
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'เปลี่ยนชื่อคอลัมน์ไม่สำเร็จ'), 'error')
  }
}

const fetchTasks = async () => {
  try {
    const response = await $fetch(`/api/tasks?projectId=${projectId}&t=${Date.now()}`)
    if (response.success) {
      tasks.value = response.data
      currentInviteCode.value = response.inviteCode
      if (typeof response.isInviteActive === 'boolean') {
        isInviteActive.value = response.isInviteActive
      }
      projectName.value = response.projectName
      projectOwnerId.value = response.ownerId
      projectOwnerUsername.value = response.ownerUsername || ''
    }
  } catch (error) {
    console.error(error)
    if (error.statusCode === 404) {
      showToast('โปรเจกต์นี้ถูกลบไปแล้ว 🗑️', 'info')
      navigateTo('/dashboard')
    } else if ((error.statusCode === 403 || error.statusCode === 401) && currentUser.value?.role !== 'ADMIN') {
      navigateTo('/dashboard')
    }
  }
}

const fetchLabels = async () => {
  try {
    const res = await $fetch(`/api/projects/labels?projectId=${projectId}`)
    if (res.success) projectLabels.value = res.data
  } catch (err) { console.error(err) }
}

const createProjectLabel = async () => {
  if (!newLabelName.value.trim()) return
  try {
    const res = await $fetch('/api/projects/labels', {
      method: 'POST',
      body: { projectId, name: newLabelName.value.trim(), color: newLabelColor.value }
    })
    if (res.success) {
      projectLabels.value.push(res.data)
      if (!selectedLabelIds.value.includes(res.data.id)) {
        selectedLabelIds.value.push(res.data.id)
      }
      newLabelName.value = ''
      isCreatingLabel.value = false
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'สร้างป้ายกำกับไม่สำเร็จ ❌'), 'error')
  }
}

const deleteProjectLabel = async (labelId) => {
  if (!labelId) return
  const backupLabels = [...projectLabels.value]
  const backupSelected = [...selectedLabelIds.value]
  projectLabels.value = projectLabels.value.filter(l => l.id !== labelId)
  selectedLabelIds.value = selectedLabelIds.value.filter(id => id !== labelId)
  tasks.value = tasks.value.map(t => ({
    ...t,
    labels: t.labels ? t.labels.filter(l => l.id !== labelId) : []
  }))
  if (Number(filterLabelId.value) === Number(labelId)) {
    filterLabelId.value = ''
  }
  try {
    await $fetch(`/api/projects/labels?id=${labelId}`, { method: 'DELETE' })
  } catch (err) {
    projectLabels.value = backupLabels
    selectedLabelIds.value = backupSelected
    await fetchTasks()
    showToast(getApiErrorMessage(err, 'ลบป้ายกำกับไม่สำเร็จ ❌'), 'error')
  }
}

// --- ระบบการแจ้งเตือน ---
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

// --- ฟังก์ชันออกจากบอร์ด / ลบบอร์ดโครงการ ---
const leaveProject = async () => {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากโปรเจกต์นี้? 🚪')) return
  try {
    const res = await $fetch(`/api/projects/leave?projectId=${projectId}`, { method: 'DELETE' })
    if (res.success) {
      showToast('ออกจากโปรเจกต์สำเร็จแล้ว 🚪', 'success')
      navigateTo('/dashboard')
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'ออกจากโครงการไม่สำเร็จ ❌'), 'error')
  }
}

const confirmDeleteProject = async () => {
  isDeleteProjectModalOpen.value = false
  try {
    const res = await $fetch(`/api/projects/delete?projectId=${projectId}`, { method: 'DELETE' })
    if (res.success) {
      showToast('ลบโครงการเรียบร้อยแล้ว 🗑️', 'success')
      navigateTo('/dashboard')
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'ลบโครงการไม่สำเร็จ ❌'), 'error')
  }
}

// --- รายละเอียดการ์ดงานย่อย (Checklist) และ คอมเมนต์ ---
const fetchTaskDetails = async (taskId) => {
  try {
    const commRes = await $fetch(`/api/tasks/comments?taskId=${taskId}`)
    if (commRes.success) comments.value = commRes.data
    
    const t = tasks.value.find(x => x.id === taskId)
    if (t) {
      subtasks.value = JSON.parse(JSON.stringify(t.subtasks || []))
      attachments.value = JSON.parse(JSON.stringify(t.attachments || []))
    }
  } catch (err) {
    console.error('Error loading task details:', err)
  }
}

const addSubtask = async () => {
  if (!newSubtaskTitle.value.trim() || !editingTaskId.value) return
  try {
    const res = await $fetch('/api/tasks/subtasks', {
      method: 'POST',
      body: { taskId: editingTaskId.value, title: newSubtaskTitle.value.trim() }
    })
    if (res.success) {
      subtasks.value.push(res.data)
      newSubtaskTitle.value = ''
      fetchTasks()
    }
  } catch (err) { showToast(getApiErrorMessage(err, 'เพิ่มงานย่อยไม่สำเร็จ ❌'), 'error') }
}

const toggleSubtask = async (sub) => {
  try {
    await $fetch('/api/tasks/subtasks', {
      method: 'PUT',
      body: { id: sub.id, isCompleted: sub.isCompleted }
    })
    fetchTasks()
  } catch (err) { showToast(getApiErrorMessage(err, 'แก้ไขสถานะไม่สำเร็จ ❌'), 'error') }
}

const deleteSubtask = async (id) => {
  try {
    await $fetch(`/api/tasks/subtasks?id=${id}`, { method: 'DELETE' })
    subtasks.value = subtasks.value.filter(s => s.id !== id)
    fetchTasks()
  } catch (err) { showToast(getApiErrorMessage(err, 'ลบงานย่อยไม่สำเร็จ ❌'), 'error') }
}

const addComment = async () => {
  if (!newCommentContent.value.trim() || !editingTaskId.value) return
  try {
    const res = await $fetch('/api/tasks/comments', {
      method: 'POST',
      body: { taskId: editingTaskId.value, content: newCommentContent.value.trim() }
    })
    if (res.success) {
      comments.value.push(res.data)
      newCommentContent.value = ''
      fetchTasks()
      fetchTaskLogs(editingTaskId.value)
    }
  } catch (err) { showToast(getApiErrorMessage(err, 'ส่งความเห็นไม่สำเร็จ ❌'), 'error') }
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file || !editingTaskId.value) return
  const maxSizeBytes = 30 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    showToast('ขนาดไฟล์ต้องไม่เกิน 30MB ❌', 'error')
    event.target.value = ''
    return
  }
  const formData = new FormData()
  formData.append('taskId', editingTaskId.value)
  formData.append('file', file)
  try {
    const res = await $fetch('/api/tasks/attachments', {
      method: 'POST',
      body: formData
    })
    if (res.success) {
      attachments.value.push(res.data)
      fetchTasks()
      fetchTaskLogs(editingTaskId.value)
    }
  } catch (err) {
    showToast(getApiErrorMessage(err, 'อัปโหลดไฟล์ล้มเหลว ❌'), 'error')
  } finally {
    event.target.value = ''
  }
}

const deleteAttachment = async (attachmentId) => {
  if (!attachmentId) return
  const backupAttachments = [...attachments.value]
  attachments.value = attachments.value.filter(a => a.id !== attachmentId)
  tasks.value = tasks.value.map(t => (
    t.id === editingTaskId.value
      ? { ...t, attachments: (t.attachments || []).filter(a => a.id !== attachmentId) }
      : t
  ))
  try {
    await $fetch(`/api/tasks/attachments?id=${attachmentId}`, { method: 'DELETE' })
    fetchTasks()
    if (editingTaskId.value) {
      fetchTaskLogs(editingTaskId.value)
    }
  } catch (err) {
    attachments.value = backupAttachments
    await fetchTasks()
    showToast(getApiErrorMessage(err, 'ลบไฟล์แนบไม่สำเร็จ ❌'), 'error')
  }
}

// --- ตัวกรองและการจัดเรียงฝั่ง Client ---
const getFilteredTasks = (columnId) => {
  let list = tasks.value.filter(t => t.columnId === columnId)
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)))
  }

  if (filterAssigneeId.value) {
    list = list.filter(t => t.assigneeId === Number(filterAssigneeId.value))
  }

  if (filterPriority.value) {
    list = list.filter(t => t.priority === filterPriority.value)
  }

  if (filterLabelId.value) {
    list = list.filter(t => t.labels && t.labels.some(l => l.id === Number(filterLabelId.value)))
  }

  if (sortBy.value === 'dueDate') {
    list.sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  } else if (sortBy.value === 'priority') {
    const priorityMap = { 'URGENT': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 }
    list.sort((a, b) => (priorityMap[a.priority] ?? 3) - (priorityMap[b.priority] ?? 3))
  } else if (sortBy.value === 'createdAt') {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } else {
    list.sort((a, b) => {
      const posDiff = (a.position ?? 0) - (b.position ?? 0)
      if (posDiff !== 0) return posDiff
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }

  return list
}

// --- ฟังก์ชันดึงรายชื่อทีมงาน และข้อมูลยศ ---
const fetchTeamAndRoles = async () => {
  try {
    const [membersRes, rolesRes] = await Promise.all([
      $fetch(`/api/members?projectId=${projectId}`),
      $fetch(`/api/roles?projectId=${projectId}`)
    ])
    if (membersRes.success) {
      projectMembers.value = membersRes.data
      // Check if current user is kicked (Admins are immune to kick checks)
      if (currentUser.value && currentUser.value.role !== 'ADMIN' && projectOwnerId.value && projectOwnerId.value !== currentUser.value.id) {
        const isStillMember = projectMembers.value.some(m => m.user.id === currentUser.value.id)
        if (!isStillMember) {
          navigateTo('/dashboard')
          return
        }
      }
    }
    if (rolesRes.success) projectRoles.value = rolesRes.data
  } catch (error) {
    console.error('Error fetching team or roles:', error)
    if ((error.statusCode === 403 || error.statusCode === 401) && currentUser.value?.role !== 'ADMIN') {
      navigateTo('/dashboard')
    }
  }
}

let eventSource = null
let pollingInterval = null
let lastLocalMutationAt = 0
let sseReconnectTimeout = null
let isComponentMounted = false

const scheduleSseReconnect = (delayMs = 3500) => {
  if (!isComponentMounted) return
  if (sseReconnectTimeout) clearTimeout(sseReconnectTimeout)
  sseReconnectTimeout = setTimeout(() => {
    if (!isComponentMounted) return
    // เมื่อเชื่อมต่อกลับมาใหม่ ดึงข้อมูลสดเพื่อซิงค์การเปลี่ยนแปลงที่พลาดไประหว่างสายหลุด
    Promise.allSettled([
      fetchTasks(),
      fetchColumns(),
      fetchTeamAndRoles(),
      fetchNotifications()
    ])
    initSse()
  }, delayMs)
}

const initSse = () => {
  if (!isComponentMounted) return
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  try {
    eventSource = new EventSource(`/api/projects/events?projectId=${projectId}`)

    eventSource.onmessage = (event) => {
      if (event.data === 'connected') return
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'PROJECT_DELETED') {
          showToast('โปรเจกต์นี้ถูกลบไปแล้ว 🗑️', 'info')
          navigateTo('/dashboard')
          return
        }
        // ป้องกันการโหลดซ้ำซ้อนหากผู้ใช้คนนี้เพิ่งเป็นคนกดย้าย/แก้ไขการ์ดเองเมื่อไม่เกิน 1.5 วินาทีที่ผ่านมา
        if (Date.now() - lastLocalMutationAt < 1500) return

        if (data.type === 'TASKS_UPDATED') {
          Promise.all([fetchTasks(), fetchColumns(), fetchNotifications()])
        } else if (data.type === 'TEAM_UPDATED') {
          Promise.all([fetchTeamAndRoles(), fetchNotifications(), fetchTasks()])
        }
      } catch (e) {
        console.error('Failed to parse SSE event message:', e)
      }
    }

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      // เชื่อมต่อสายใหม่อัตโนมัติ (Anti-Zombie State)
      scheduleSseReconnect(3500)
    }
  } catch (e) {
    scheduleSseReconnect(5000)
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && isComponentMounted) {
    if (!eventSource) initSse()
    Promise.allSettled([fetchTasks(), fetchColumns(), fetchTeamAndRoles(), fetchNotifications()])
  }
}

const handleOnline = () => {
  if (!eventSource && isComponentMounted) {
    initSse()
    fetchTasks()
    fetchNotifications()
  }
}

onMounted(async () => { 
  isComponentMounted = true

  // ดึงข้อมูลผู้ใช้เบื้องต้นจากเครื่องทันทีเพื่อไม่ให้หน้าจอกระพริบระหว่างรอ API
  const cachedUser = localStorage.getItem('user')
  if (cachedUser) {
    try {
      currentUser.value = JSON.parse(cachedUser)
    } catch (e) {}
  }

  // 1. ตรวจสอบสถานะผู้ใช้และอัปเดต role ล่าสุด (เช่น ADMIN) ก่อนเสมอ
  try {
    const meRes = await $fetch('/api/auth/me')
    if (meRes?.success && meRes.user) {
      currentUser.value = meRes.user
      localStorage.setItem('user', JSON.stringify(meRes.user))
    } else {
      localStorage.removeItem('user')
      navigateTo('/login')
      return
    }
  } catch (err) {
    localStorage.removeItem('user')
    navigateTo('/login')
    return
  }

  // 2. ดึงข้อมูลส่วนประกอบของบอร์ดพร้อมกันในครั้งเดียว (Parallel Fetching)
  await Promise.allSettled([
    fetchColumns(),
    fetchTasks(),
    fetchLabels(),
    fetchNotifications(),
    fetchTeamAndRoles()
  ])

  initSse()

  // shortcut: 15s visible-tab sync covers multi-instance Vercel serverless where in-memory SSE is per-lambda
  pollingInterval = setInterval(() => {
    if (document.visibilityState === 'visible' && !isModalOpen.value && Date.now() - lastLocalMutationAt > 3000) {
      Promise.allSettled([fetchTasks(), fetchColumns(), fetchNotifications()])
    }
  }, 15000)

  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
  }
})

onUnmounted(() => {
  isComponentMounted = false
  if (sseReconnectTimeout) {
    clearTimeout(sseReconnectTimeout)
    sseReconnectTimeout = null
  }
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleVisibilityChange)
    window.removeEventListener('online', handleOnline)
  }
})

const isAdminEditUnlocked = ref(false)

const toggleAdminEditMode = () => {
  isAdminEditUnlocked.value = !isAdminEditUnlocked.value
  if (!isAdminEditUnlocked.value) {
    isEditingProjectName.value = false
    isAddingColumn.value = false
    editingColumnId.value = null
  }
}

const isAdminOverrideActor = (actor) => {
  if (!actor || actor.role !== 'ADMIN') return false
  if (projectOwnerId.value && actor.id === projectOwnerId.value) return false
  return !projectMembers.value.some(m => m.user?.id === actor.id)
}

const hasPermission = (permission) => {
  if (!currentUser.value) return false
  if (projectOwnerId.value && currentUser.value && projectOwnerId.value === currentUser.value.id) return true
  
  const myMemberInfo = projectMembers.value.find(m => m.user.id === currentUser.value.id)
  if (myMemberInfo) {
    if (myMemberInfo.role?.permissions.includes('MANAGE_PROJECT')) return true
    if (myMemberInfo.role?.permissions.includes(permission)) return true
  }

  // สำหรับ Super Admin ที่กำลังเปิดส่องบอร์ดของคนอื่น จะเป็น Read-Only เป็นค่าเริ่มต้นจนกว่าจะกดปลดล็อกโหมดแก้ไข
  if (currentUser.value.role === 'ADMIN') {
    return isAdminEditUnlocked.value
  }
  return false
}

const openManageTeamModal = async () => {
  await fetchTeamAndRoles()
  isManageTeamModalOpen.value = true
}

const startEditProjectName = () => {
  newProjectName.value = projectName.value
  isEditingProjectName.value = true
}

const saveProjectName = async () => {
  if (!newProjectName.value.trim() || newProjectName.value.trim() === projectName.value) {
    isEditingProjectName.value = false
    return
  }
  if (newProjectName.value.trim().length > 50) {
    showToast('ชื่อโปรเจกต์ต้องมีความยาวไม่เกิน 50 ตัวอักษร ❌', 'error')
    return
  }
  try {
    const response = await $fetch('/api/projects/update', {
      method: 'PUT',
      body: { id: projectId, name: newProjectName.value.trim(), userId: currentUser.value?.id }
    })
    if (response.success) {
      projectName.value = response.project.name
      isEditingProjectName.value = false
    }
  } catch (error) { 
    showToast(error.data?.message || 'ไม่สามารถเปลี่ยนชื่อโปรเจกต์ได้ ❌', 'error') 
  }
}

const createNewRole = async () => {
  if (!newRoleName.value.trim()) return
  try {
    const response = await $fetch('/api/roles/create', {
      method: 'POST',
      body: { projectId, name: newRoleName.value.trim(), permissions: ['CREATE_TASK', 'MOVE_TASK'] }
    })
    if (response.success) {
      newRoleName.value = ''
      await fetchTeamAndRoles()
    }
  } catch (error) { showToast(getApiErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างยศ ❌'), 'error') }
}

const updateRoleData = async (role) => {
  try {
    await $fetch('/api/roles/update', {
      method: 'PUT',
      body: { roleId: role.id, name: role.name, permissions: role.permissions }
    })
  } catch (error) { showToast(getApiErrorMessage(error, 'ไม่สามารถบันทึกข้อมูลยศได้ ❌'), 'error') }
}

const togglePermission = async (role, permissionStr) => {
  const index = role.permissions.indexOf(permissionStr)
  if (index > -1) {
    role.permissions.splice(index, 1)
  } else {
    role.permissions.push(permissionStr)
  }
  await updateRoleData(role)
}

const isDeleteRoleModalOpen = ref(false)
const roleToDeleteId = ref(null)

const deleteRole = (id) => {
  roleToDeleteId.value = id
  isDeleteRoleModalOpen.value = true
}

const confirmDeleteRole = async () => {
  if (!roleToDeleteId.value) return
  try {
    const response = await $fetch(`/api/roles/delete?id=${roleToDeleteId.value}`, { method: 'DELETE' })
    if (response.success) {
      await fetchTeamAndRoles()
      isDeleteRoleModalOpen.value = false
      roleToDeleteId.value = null
    }
  } catch (error) { showToast(getApiErrorMessage(error, 'ไม่สามารถลบยศนี้ได้ ❌'), 'error') }
}

const changeMemberRole = async (memberId, targetRoleId, event) => {
  const previousMember = projectMembers.value.find(m => m.id === memberId)
  const previousRoleId = previousMember?.roleId ? String(previousMember.roleId) : ''
  try {
    const response = await $fetch('/api/members/update-role', {
      method: 'PUT',
      body: { memberId, roleId: targetRoleId ? Number(targetRoleId) : null }
    })
    if (response.success) {
      await fetchTeamAndRoles()
    }
  } catch (error) {
    if (event?.target) {
      event.target.value = previousRoleId
    }
    await fetchTeamAndRoles()
    showToast(getApiErrorMessage(error, 'เปลี่ยนยศไม่สำเร็จ ❌'), 'error')
  }
}

const kickMember = (memberId, username) => {
  memberToKickId.value = memberId
  memberToKickUsername.value = username
  isKickModalOpen.value = true
}

const confirmKickMember = async () => {
  if (!memberToKickId.value) return
  try {
    const response = await $fetch(`/api/members/kick?memberId=${memberToKickId.value}&projectId=${projectId}`, {
      method: 'DELETE'
    })
    if (response.success) {
      await fetchTeamAndRoles()
      isKickModalOpen.value = false
      memberToKickId.value = null
      memberToKickUsername.value = ''
    }
  } catch (error) { showToast(getApiErrorMessage(error, 'เตะสมาชิกออกไม่สำเร็จ ❌'), 'error') }
}

const copyInviteCode = () => {
  if (!currentInviteCode.value || !isInviteActive.value) return
  navigator.clipboard.writeText(currentInviteCode.value)
  isCopied.value = true
  setTimeout(() => { isCopied.value = false }, 2000)
}

const toggleInviteActive = async () => {
  if (isUpdatingInviteSettings.value) return
  isUpdatingInviteSettings.value = true
  try {
    const res = await $fetch('/api/projects/invite-settings', {
      method: 'PUT',
      body: {
        projectId,
        isInviteActive: !isInviteActive.value
      }
    })
    if (res.success && res.data) {
      isInviteActive.value = res.data.isInviteActive
    }
  } catch (err) {
    console.error('Failed to update invite settings:', err)
  } finally {
    isUpdatingInviteSettings.value = false
  }
}

const regenerateInviteCode = async () => {
  if (isUpdatingInviteSettings.value) return
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการสุ่มรหัสเชิญใหม่? รหัสเดิมจะไม่สามารถใช้งานได้อีกต่อไป')) return
  isUpdatingInviteSettings.value = true
  try {
    const res = await $fetch('/api/projects/invite-settings', {
      method: 'PUT',
      body: {
        projectId,
        regenerateCode: true
      }
    })
    if (res.success && res.data) {
      currentInviteCode.value = res.data.inviteCode
      if (typeof res.data.isInviteActive === 'boolean') {
        isInviteActive.value = res.data.isInviteActive
      }
    }
  } catch (err) {
    console.error('Failed to regenerate invite code:', err)
  } finally {
    isUpdatingInviteSettings.value = false
  }
}

const fetchTaskLogs = async (taskId) => {
  isLoadingLogs.value = true
  try {
    const response = await $fetch(`/api/tasks/logs?taskId=${taskId}`)
    if (response.success) {
      taskLogs.value = response.data
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงบันทึกกิจกรรม:', error)
  } finally {
    isLoadingLogs.value = false
  }
}

const activeAddColumnId = ref(null)
const openAddModal = (columnId) => {
  isEditMode.value = false
  activeAddColumnId.value = columnId
  taskTitle.value = ''
  taskDescription.value = ''
  taskAssigneeId.value = ''
  taskDueDate.value = ''
  taskPriority.value = 'MEDIUM'
  selectedLabelIds.value = []
  subtasks.value = []
  attachments.value = []
  comments.value = []
  newSubtaskTitle.value = ''
  newCommentContent.value = ''
  taskLogs.value = []
  taskModalError.value = ''
  isSavingTask.value = false
  isModalOpen.value = true
}

const openEditModal = (task) => {
  isEditMode.value = true
  editingTaskId.value = task.id
  activeAddColumnId.value = task.columnId
  taskTitle.value = task.title
  taskDescription.value = task.description || ''
  taskAssigneeId.value = task.assigneeId || ''
  taskDueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  taskPriority.value = task.priority || 'MEDIUM'
  selectedLabelIds.value = task.labels ? task.labels.map(l => l.id) : []
  // แสดงรายการงานย่อยและไฟล์แนบที่มีอยู่ทันทีโดยไม่ต้องรอโหลดใหม่
  subtasks.value = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : []
  attachments.value = task.attachments ? JSON.parse(JSON.stringify(task.attachments)) : []
  comments.value = []
  newSubtaskTitle.value = ''
  newCommentContent.value = ''
  taskLogs.value = []
  taskModalError.value = ''
  isSavingTask.value = false
  isModalOpen.value = true
  Promise.all([
    fetchTaskDetails(task.id),
    fetchTaskLogs(task.id)
  ])
}

const handleSubmit = async () => {
  if (!taskTitle.value.trim()) {
    taskModalError.value = 'กรุณาระบุหัวข้องาน ❌'
    return
  }
  taskModalError.value = ''
  isSavingTask.value = true
  lastLocalMutationAt = Date.now()

  if (isEditMode.value) {
    const targetId = editingTaskId.value
    const canEditFullTask = hasPermission('CREATE_TASK')
    const payload = canEditFullTask
      ? {
          id: targetId,
          columnId: activeAddColumnId.value ? Number(activeAddColumnId.value) : undefined,
          title: taskTitle.value.trim(),
          description: taskDescription.value ? taskDescription.value.trim() : null,
          assigneeId: taskAssigneeId.value ? Number(taskAssigneeId.value) : null,
          dueDate: taskDueDate.value || null,
          priority: taskPriority.value,
          labelIds: selectedLabelIds.value
        }
      : {
          id: targetId,
          columnId: activeAddColumnId.value ? Number(activeAddColumnId.value) : undefined
        }
    try {
      const response = await $fetch('/api/tasks', { 
        method: 'PUT', 
        body: payload
      })
      if (response.success) {
        isModalOpen.value = false
        await fetchTasks()
      }
    } catch (error) {
      console.error(error)
      taskModalError.value = getApiErrorMessage(error, 'เกิดข้อผิดพลาดในการแก้ไขงาน กรุณาลองใหม่อีกครั้ง')
    } finally {
      isSavingTask.value = false
    }
  } else {
    try {
      const response = await $fetch('/api/tasks', { 
        method: 'POST', 
        body: { 
          title: taskTitle.value.trim(), 
          description: taskDescription.value ? taskDescription.value.trim() : null, 
          projectId: projectId,
          columnId: activeAddColumnId.value,
          assigneeId: taskAssigneeId.value ? Number(taskAssigneeId.value) : null,
          dueDate: taskDueDate.value || null,
          priority: taskPriority.value,
          labelIds: selectedLabelIds.value
        } 
      })
      if (response.success) {
        isModalOpen.value = false
        await fetchTasks()
      }
    } catch (error) {
      console.error(error)
      taskModalError.value = getApiErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างงาน กรุณาลองใหม่อีกครั้ง')
    } finally {
      isSavingTask.value = false
    }
  }
}

const isDeleteModalOpen = ref(false)
const taskToDeleteId = ref(null)

const deleteTask = (id) => {
  taskToDeleteId.value = id
  isDeleteModalOpen.value = true
}

const confirmDeleteTask = async () => {
  if (!taskToDeleteId.value) return
  const idToRemove = taskToDeleteId.value
  lastLocalMutationAt = Date.now()
  // Optimistic UI: ลบออกจากหน้าจอทันที
  const backupTasks = [...tasks.value]
  tasks.value = tasks.value.filter(t => t.id !== idToRemove)
  isDeleteModalOpen.value = false
  taskToDeleteId.value = null
  try {
    const response = await $fetch(`/api/tasks?id=${idToRemove}`, { 
      method: 'DELETE'
    })
    if (!response.success) {
      tasks.value = backupTasks
    }
  } catch (error) {
    console.error(error)
    tasks.value = backupTasks
    showToast(getApiErrorMessage(error, 'ลบการ์ดงานไม่สำเร็จ ❌'), 'error')
  }
}

const getSortedColumnTasks = (columnId) => {
  return tasks.value
    .filter(t => t.columnId === columnId)
    .sort((a, b) => {
      const posDiff = (a.position ?? 0) - (b.position ?? 0)
      if (posDiff !== 0) return posDiff
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
}

const moveTask = async (id, targetColumnId, targetTaskId = null) => {
  const task = tasks.value.find(t => t.id === id)
  if (!task) return
  if (task.columnId === targetColumnId && targetTaskId === id) return

  const backupTasks = tasks.value.map(t => ({ ...t }))
  const sourceColumnId = task.columnId
  lastLocalMutationAt = Date.now()

  // หากกำลังใช้ตัวเรียงลำดับแบบอื่นแล้วลากจัดลำดับการ์ด ให้สลับมาที่โหมดเรียงตามลำดับในคอลัมน์อัตโนมัติ
  if (targetTaskId !== null && sortBy.value !== 'position') {
    sortBy.value = 'position'
  }

  const destTasks = getSortedColumnTasks(targetColumnId).filter(t => t.id !== id)
  if (targetTaskId !== null) {
    const targetIdx = destTasks.findIndex(t => t.id === targetTaskId)
    const sourceTasks = getSortedColumnTasks(sourceColumnId)
    const fromIdx = sourceTasks.findIndex(t => t.id === id)
    const toOrigIdx = sourceTasks.findIndex(t => t.id === targetTaskId)

    if (targetIdx !== -1) {
      // ถ้าลากในคอลัมน์เดิมจากบนลงล่าง ให้แทรกหลังการ์ดเป้าหมายเพื่อให้เลื่อนขึ้น-ลงได้เป็นธรรมชาติ
      if (sourceColumnId === targetColumnId && fromIdx < toOrigIdx) {
        destTasks.splice(targetIdx + 1, 0, task)
      } else {
        destTasks.splice(targetIdx, 0, task)
      }
    } else {
      destTasks.push(task)
    }
  } else {
    destTasks.push(task)
  }

  task.columnId = targetColumnId
  const orderedTaskIds = destTasks.map(t => t.id)
  orderedTaskIds.forEach((taskId, idx) => {
    const item = tasks.value.find(t => t.id === taskId)
    if (item) item.position = idx
  })

  if (sourceColumnId !== targetColumnId) {
    const remainingSourceTasks = getSortedColumnTasks(sourceColumnId).filter(t => t.id !== id)
    remainingSourceTasks.forEach((item, idx) => {
      item.position = idx
    })
  }

  try {
    await $fetch('/api/tasks', { 
      method: 'PUT', 
      body: {
        id,
        columnId: targetColumnId,
        orderedTaskIds
      } 
    })
  } catch (error) {
    console.error(error)
    tasks.value = backupTasks
    showToast(getApiErrorMessage(error, 'ไม่สามารถย้ายหรือจัดลำดับการ์ดได้ ❌'), 'error')
  }
}

let draggedTaskId = null
let draggedColumnId = null

const onDragStart = (id) => {
  if (!hasPermission('MOVE_TASK')) return
  draggedTaskId = id
  draggedColumnId = null
}

const onColumnDragStart = (colId) => {
  if (!hasPermission('MANAGE_PROJECT')) return
  draggedColumnId = colId
  draggedTaskId = null
}

const reorderColumn = async (sourceColId, targetColId) => {
  if (!hasPermission('MANAGE_PROJECT') || sourceColId === targetColId) return
  const fromIndex = columns.value.findIndex(c => c.id === sourceColId)
  const toIndex = columns.value.findIndex(c => c.id === targetColId)
  if (fromIndex === -1 || toIndex === -1) return

  const backupColumns = [...columns.value]
  const updated = [...columns.value]
  const [movedCol] = updated.splice(fromIndex, 1)
  updated.splice(toIndex, 0, movedCol)
  columns.value = updated.map((col, idx) => ({ ...col, position: idx }))
  lastLocalMutationAt = Date.now()

  try {
    await $fetch('/api/columns/update', {
      method: 'PUT',
      body: {
        projectId: Number(route.params.id),
        orderedColumnIds: columns.value.map(c => c.id)
      }
    })
  } catch (err) {
    columns.value = backupColumns
    showToast(getApiErrorMessage(err, 'ไม่สามารถย้ายตำแหน่งคอลัมน์ได้ ❌'), 'error')
  }
}

const onDropOnTask = (targetTaskId, targetColumnId) => {
  if (draggedColumnId !== null) {
    const srcColId = draggedColumnId
    draggedColumnId = null
    reorderColumn(srcColId, targetColumnId)
    return
  }
  if (!hasPermission('MOVE_TASK')) return
  if (draggedTaskId) {
    const id = draggedTaskId
    draggedTaskId = null
    moveTask(id, targetColumnId, targetTaskId)
  }
}

const onDrop = (columnId) => {
  if (draggedColumnId !== null) {
    const srcColId = draggedColumnId
    draggedColumnId = null
    reorderColumn(srcColId, columnId)
    return
  }
  if (!hasPermission('MOVE_TASK')) return
  if (draggedTaskId) {
    const id = draggedTaskId
    draggedTaskId = null
    moveTask(id, columnId, null)
  }
}
</script>