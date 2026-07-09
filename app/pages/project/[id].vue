<template>
  <div class="min-h-screen bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] text-stone-800 flex flex-col relative overflow-hidden bg-grid">
    
    <div class="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

    <header class="bg-[#fdfaf5] border-b border-amber-200/80 p-4 shadow-sm relative z-40">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div class="flex items-center gap-2">
          <div v-if="isEditingProjectName" class="flex items-center gap-2">
            <input 
              v-model="newProjectName"
              type="text"
              class="bg-white border border-amber-400 rounded-lg px-3 py-1 text-xl font-extrabold text-stone-800 focus:outline-none"
              @keyup.enter="saveProjectName"
            />
            <button @click="saveProjectName" class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-md shadow-sm">บันทึก</button>
            <button @click="isEditingProjectName = false" class="bg-stone-300 hover:bg-stone-400 text-stone-700 text-xs font-bold px-2.5 py-1.5 rounded-md">ยกเลิก</button>
          </div>

          <h1 v-else class="text-2xl font-extrabold text-stone-800 flex items-center gap-2 group">
            📁 โปรเจกต์: {{ projectName || 'กำลังโหลดชื่อบอร์ด...' }}
            <button v-if="hasPermission('MANAGE_PROJECT')" @click="startEditProjectName" class="text-sm opacity-40 group-hover:opacity-100 hover:text-amber-600 transition-all ml-1" title="แก้ไขชื่อโปรเจกต์">✏️</button>
          </h1>
        </div>

        <div class="flex items-center gap-2 bg-white border border-amber-200 rounded-xl p-1.5 shadow-sm">
          <div class="px-2">
            <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">รหัสเชิญเข้าตี้</p>
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-mono font-black text-amber-900 tracking-wider">
                {{ !currentInviteCode ? 'กำลังโหลด...' : (isInviteCodeVisible ? currentInviteCode : '••••••') }}
              </p>
              <button 
                v-if="currentInviteCode"
                @click="isInviteCodeVisible = !isInviteCodeVisible" 
                class="text-stone-400 hover:text-stone-600 transition-colors p-0.5 focus:outline-none"
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
          <button @click="copyInviteCode" class="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-2 rounded-lg transition-all self-center">📋 คัดลอกรหัส</button>
        </div>

        <div class="flex items-center gap-2.5 relative">
          <div class="relative">
            <button @click="isNotificationsOpen = !isNotificationsOpen" class="bg-white border border-amber-200 text-stone-600 hover:text-stone-850 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center relative focus:outline-none">
              🔔
              <span v-if="notifications.filter(n => !n.isRead).length > 0" class="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {{ notifications.filter(n => !n.isRead).length }}
              </span>
            </button>
            
            <div v-if="isNotificationsOpen" class="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-2xl z-[150] p-4 text-left max-h-96 overflow-y-auto">
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

          <button v-if="hasPermission('MANAGE_PROJECT')" @click="openManageTeamModal" class="bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-md text-sm flex items-center gap-1.5">
            👥 จัดการสมาชิกและยศ
          </button>
          
          <button v-if="currentUser && projectOwnerId !== currentUser.id" @click="leaveProject" class="bg-stone-100 hover:bg-stone-200 text-rose-600 font-bold px-4 py-2 rounded-lg transition-all border border-stone-200 text-sm">
            🚪 ออกจากโครงการ
          </button>
          <button v-if="currentUser && projectOwnerId === currentUser.id" @click="isDeleteProjectModalOpen = true" class="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-4 py-2 rounded-lg transition-all border border-rose-250 text-sm">
            🗑️ ลบโครงการ
          </button>

          <button @click="navigateTo('/dashboard')" class="bg-[#f3e9d7] hover:bg-[#ebdcc5] text-stone-700 font-bold px-4 py-2 rounded-lg transition-all border border-amber-200 text-sm">
            ⬅️ แดชบอร์ด
          </button>
          <button v-if="hasPermission('CREATE_TASK')" @click="openAddModal(columns[0]?.id)" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-md text-sm">
            + เพิ่มงานใหม่
          </button>
        </div>

      </div>
    </header>

    <div class="bg-white/80 backdrop-blur-md border border-amber-200/50 rounded-xl p-4 mt-6 mx-6 shadow-sm flex flex-wrap items-center justify-between gap-4 relative z-10">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative max-w-xs">
          <input v-model="searchQuery" type="text" placeholder="🔍 ค้นหาการ์ดงาน..." class="pl-3 pr-4 py-1.5 w-60 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 focus:bg-white transition-all font-semibold" />
        </div>
        <select v-model="filterAssigneeId" class="py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 font-bold text-stone-600">
          <option value="">👤 สมาชิกทั้งหมด</option>
          <option v-for="m in projectMembers" :key="m.id" :value="m.user.id">{{ m.user.username }}</option>
        </select>
        <select v-model="filterPriority" class="py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 font-bold text-stone-600">
          <option value="">🎯 ความเร่งด่วนทั้งหมด</option>
          <option value="URGENT">🚨 Urgent</option>
          <option value="HIGH">🟠 High</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="LOW">⚪ Low</option>
        </select>
        <select v-model="filterLabelId" class="py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-400 font-bold text-stone-600">
          <option value="">🏷️ ป้ายกำกับทั้งหมด</option>
          <option v-for="lbl in projectLabels" :key="lbl.id" :value="lbl.id">🏷️ {{ lbl.name }}</option>
        </select>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 text-xs font-bold text-stone-500">
          <span>เรียงโดย:</span>
          <select v-model="sortBy" class="py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 focus:outline-none">
            <option value="createdAt">⏰ วันที่สร้าง</option>
            <option value="dueDate">📅 วันกำหนดส่ง</option>
            <option value="priority">🎯 ระดับความเร่งด่วน</option>
          </select>
        </div>

        <div v-if="hasPermission('MANAGE_PROJECT')" class="relative">
          <button v-if="!isAddingColumn" @click="isAddingColumn = true" class="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center gap-1">
            ➕ เพิ่มคอลัมน์
          </button>
          <div v-else class="flex items-center gap-1.5 bg-stone-50 p-1 rounded-lg border border-amber-300">
            <input v-model="newColumnTitle" type="text" placeholder="ชื่อช่อง..." class="px-2 py-1 text-xs w-28 bg-white border border-stone-200 rounded focus:outline-none" @keyup.enter="addColumn" />
            <button @click="addColumn" class="bg-emerald-500 text-white text-[10px] font-bold p-1 rounded">✅</button>
            <button @click="isAddingColumn = false" class="bg-stone-300 text-stone-700 text-[10px] font-bold p-1 rounded">❌</button>
          </div>
        </div>
      </div>
    </div>

    <main class="flex-1 p-6 overflow-x-auto relative z-10">
      <div class="flex gap-6 h-full items-start pb-4 min-w-max">
        
        <div v-for="col in columns" :key="col.id" data-testid="column-container" @dragover.prevent @drop="onDrop(col.id)" class="bg-[#fdfaf5]/95 border border-amber-200/80 rounded-xl p-4 shadow-sm w-80 shrink-0 relative flex flex-col max-h-[70vh]">
          
          <div class="flex justify-between items-center mb-4">
            <div class="flex-1 min-w-0">
              <div v-if="editingColumnId === col.id" class="flex items-center gap-1.5">
                <input v-model="editingColumnTitle" type="text" class="bg-white border border-amber-400 rounded px-2 py-0.5 text-xs font-bold text-stone-800 focus:outline-none w-full" @keyup.enter="saveColumnName(col.id)" />
                <button @click="saveColumnName(col.id)" class="text-emerald-500 text-xs">💾</button>
                <button @click="editingColumnId = null" class="text-stone-400 text-xs">❌</button>
              </div>
              <h2 v-else class="font-extrabold text-sm text-amber-900 flex items-center gap-1.5 truncate">
                📌 {{ col.title }}
                <span class="bg-[#f3e9d7] text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {{ getFilteredTasks(col.id).length }}
                </span>
              </h2>
            </div>
            
            <div v-if="hasPermission('MANAGE_PROJECT') && editingColumnId !== col.id" class="flex items-center gap-1">
              <button @click="editingColumnId = col.id; editingColumnTitle = col.title" class="text-stone-400 hover:text-amber-600 text-xs p-0.5" title="เปลี่ยนชื่อช่อง">✏️</button>
              <button @click="triggerDeleteColumn(col.id, col.title)" class="text-stone-400 hover:text-rose-600 text-xs p-0.5" title="ลบช่อง">🗑️</button>
            </div>
          </div>

          <div class="space-y-3 overflow-y-auto pr-1 flex-1">
            
            <div v-for="task in getFilteredTasks(col.id)" :key="task.id" :draggable="hasPermission('CREATE_TASK')" @dragstart="onDragStart(task.id)" :class="!hasPermission('CREATE_TASK') ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:border-amber-400'" class="bg-white p-4 rounded-lg border border-amber-100 shadow-sm transition-all group relative">
              
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
                  
                  <div class="flex gap-3 mt-3 pt-2.5 border-t border-stone-100">
                    <button v-if="hasPermission('CREATE_TASK')" @click="openEditModal(task)" class="text-amber-600 text-xs font-black">✏️ แก้ไข</button>
                    <button v-if="hasPermission('DELETE_TASK')" @click="deleteTask(task.id)" class="text-rose-600 text-xs font-black">🗑️ ลบ</button>
                    
                    <!-- Backwards compatible status navigation buttons for E2E testing compatibility -->
                    <button v-if="col.title === 'To Do'" @click="moveTask(task.id, columns.find(c => c.title === 'Doing')?.id || columns[1]?.id)" class="bg-[#f3e9d7] hover:bg-[#ebdcc5] text-amber-900 font-bold text-xs px-2.5 py-1 rounded shrink-0 ml-auto transition-all">
                      เริ่มทำ ⚡
                    </button>
                    
                    <div v-else-if="col.title === 'Doing'" class="flex items-center gap-1.5 ml-auto">
                      <button @click="moveTask(task.id, columns.find(c => c.title === 'To Do')?.id || columns[0]?.id)" class="text-stone-400 text-[10px] underline">ถอยกลับ</button>
                      <button @click="moveTask(task.id, columns.find(c => c.title === 'Done')?.id || columns[2]?.id)" class="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded shadow-sm transition-all">
                        เสร็จสิ้น ✅
                      </button>
                    </div>
                    
                    <button v-else-if="col.title === 'Done'" @click="moveTask(task.id, columns.find(c => c.title === 'Doing')?.id || columns[1]?.id)" class="text-amber-700 text-[11px] font-bold underline ml-auto shrink-0 self-center">
                      ทำใหม่
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="getFilteredTasks(col.id).length === 0" class="border-2 border-dashed border-amber-100 rounded-lg p-6 text-center text-stone-400 text-xs font-semibold">ไม่มีงานค้างอยู่ในช่องนี้</div>
          </div>
          
          <button v-if="hasPermission('CREATE_TASK')" @click="openAddModal(col.id)" class="mt-4 border border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 text-amber-800 font-extrabold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1">
            ➕ เพิ่มการ์ดงานใหม่
          </button>
        </div>

      </div>
    </main>

    <div v-if="isModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>

        <div class="px-6 py-4 border-b border-stone-200/60 bg-white flex justify-between items-center mt-1">
          <h2 class="text-lg font-black text-stone-850 flex items-center gap-2">
            {{ isEditMode ? '✏️ รายละเอียดการ์ดงาน' : '➕ เพิ่มการ์ดงานใหม่' }}
          </h2>
          <button @click="isModalOpen = false" class="text-stone-400 hover:text-stone-600 focus:outline-none">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="md:col-span-2 space-y-5">
            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">หัวข้องาน</label>
              <input v-model="taskTitle" type="text" placeholder="เช่น เขียนคู่มือระบบ..." class="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
            </div>

            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">รายละเอียด</label>
              <textarea v-model="taskDescription" rows="4" placeholder="อธิบายรายละเอียดงานเล็กน้อย..." class="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"></textarea>
            </div>

            <div v-if="isEditMode" class="border-t border-stone-200/60 pt-4">
              <label class="block text-xs font-black text-stone-500 mb-2 uppercase tracking-wider">☑️ งานย่อย (Checklist)</label>
              
              <div v-if="subtasks.length > 0" class="space-y-2 mb-3">
                <div v-for="sub in subtasks" :key="sub.id" class="flex items-center justify-between bg-white border border-stone-100 rounded-lg p-2.5 shadow-xs">
                  <div class="flex items-center gap-2.5 flex-1 min-w-0">
                    <input v-model="sub.isCompleted" type="checkbox" @change="toggleSubtask(sub)" class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                    <span :class="sub.isCompleted ? 'line-through text-stone-400 font-normal' : 'text-stone-700 font-bold'" class="text-sm truncate">
                      {{ sub.title }}
                    </span>
                  </div>
                  <button @click="deleteSubtask(sub.id)" class="text-stone-400 hover:text-rose-600 p-1 text-xs font-bold transition-all">ลบ</button>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input v-model="newSubtaskTitle" type="text" placeholder="ระบุงานย่อยใหม่..." class="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 text-xs focus:outline-none focus:border-amber-500" @keyup.enter="addSubtask" />
                <button @click="addSubtask" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm">
                  เพิ่ม
                </button>
              </div>
            </div>

            <div v-if="isEditMode" class="border-t border-stone-200/60 pt-4">
              <label class="block text-xs font-black text-stone-500 mb-2 uppercase tracking-wider">📎 ไฟล์แนบ (Attachments)</label>
              
              <div v-if="attachments.length > 0" class="space-y-2 mb-3">
                <div v-for="att in attachments" :key="att.id" class="flex items-center justify-between bg-stone-50 border border-stone-200/60 rounded-lg p-2 text-xs">
                  <div class="flex items-center gap-2 truncate">
                    <span class="text-amber-700">📄</span>
                    <a :href="att.filePath" target="_blank" class="font-bold text-amber-700 hover:underline truncate">{{ att.fileName }}</a>
                    <span class="text-stone-400">({{ (att.fileSize / 1024).toFixed(1) }} KB)</span>
                  </div>
                  <span class="text-[10px] text-stone-400">{{ new Date(att.createdAt).toLocaleDateString('th-TH') }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <label class="bg-white border border-dashed border-amber-300 hover:border-amber-500 text-amber-800 hover:bg-amber-50 font-bold px-4 py-2 rounded-lg cursor-pointer transition-all text-xs flex items-center gap-1.5">
                  📁 เลือกไฟล์เพื่ออัปโหลด
                  <input type="file" class="hidden" @change="handleFileUpload" />
                </label>
              </div>
            </div>

            <div v-if="isEditMode" class="border-t border-stone-200/60 pt-4">
              <label class="block text-xs font-black text-stone-500 mb-2 uppercase tracking-wider">💬 บอร์ดความคิดเห็น (Comments)</label>
              
              <div v-if="comments.length > 0" class="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                <div v-for="c in comments" :key="c.id" class="bg-white border border-stone-100 rounded-lg p-3 shadow-xs">
                  <div class="flex justify-between items-center mb-1 text-[11px]">
                    <span class="font-black text-amber-900">{{ c.user.username }}</span>
                    <span class="text-stone-400 font-mono">{{ new Date(c.createdAt).toLocaleString('th-TH') }}</span>
                  </div>
                  <p class="text-stone-700 text-xs font-semibold break-words leading-relaxed">{{ c.content }}</p>
                </div>
              </div>

              <div class="flex gap-2">
                <input v-model="newCommentContent" type="text" placeholder="พิมพ์ความคิดเห็นของคุณ..." class="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-850 text-xs focus:outline-none focus:border-amber-500" @keyup.enter="addComment" />
                <button @click="addComment" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm">
                  ส่ง
                </button>
              </div>
            </div>
          </div>

          <!-- Right settings column -->
          <div class="bg-stone-50 border-l border-stone-200/60 p-4 -m-6 md:-m-6 md:border-l space-y-5 overflow-y-auto">
            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">👤 ผู้รับผิดชอบ</label>
              <select v-model="taskAssigneeId" class="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-xs focus:outline-none">
                <option value="">ไม่มี (Unassigned)</option>
                <option v-for="member in projectMembers" :key="member.user.id" :value="member.user.id">
                  {{ member.user.username }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">📅 กำหนดส่งงาน</label>
              <input v-model="taskDueDate" type="date" class="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-xs focus:outline-none cursor-pointer" />
            </div>

            <div>
              <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">🎯 ความสำคัญ (Priority)</label>
              <select v-model="taskPriority" class="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-xs focus:outline-none">
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
                <button v-if="!isCreatingLabel" @click="isCreatingLabel = true" class="text-[10px] font-black text-amber-600 hover:underline">เพิ่มป้าย</button>
              </div>
              
              <div v-if="isCreatingLabel" class="bg-white border border-stone-200 rounded-lg p-2 mb-2.5 space-y-2 text-xs">
                <input v-model="newLabelName" type="text" placeholder="ชื่อแท็ก..." class="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded focus:outline-none text-[11px]" />
                <div class="flex items-center justify-between gap-1.5">
                  <input v-model="newLabelColor" type="color" class="w-6 h-6 p-0 border border-stone-300 rounded cursor-pointer shrink-0" />
                  <button @click="createProjectLabel" class="bg-emerald-500 text-white font-bold px-2 py-1 rounded text-[10px] shadow-sm">บันทึก</button>
                  <button @click="isCreatingLabel = false" class="bg-stone-300 text-stone-700 font-bold px-2 py-1 rounded text-[10px]">ปิด</button>
                </div>
              </div>

              <div v-if="projectLabels.length > 0" class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                <label v-for="lbl in projectLabels" :key="lbl.id" class="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-600">
                  <input type="checkbox" :value="lbl.id" v-model="selectedLabelIds" class="rounded text-amber-600 focus:ring-amber-500" />
                  <span :style="{ backgroundColor: lbl.color }" class="text-[9px] font-black text-white px-2 py-0.5 rounded shadow-sm">
                    {{ lbl.name }}
                  </span>
                </label>
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

        <div class="px-6 py-4 border-t border-stone-200/60 bg-white flex justify-end gap-3">
          <button @click="isModalOpen = false" class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-bold text-sm transition-all">ยกเลิก</button>
          <button @click="handleSubmit" class="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-bold text-sm transition-all shadow-md">{{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกงาน' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal จัดการสิทธิ์ทีมงาน (isManageTeamModalOpen) -->
    <div v-if="isManageTeamModalOpen" class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-amber-200 rounded-2xl w-full max-w-4xl h-[600px] flex flex-col shadow-2xl overflow-hidden relative">
        <!-- แถบสีส้มไล่เฉดด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
        
        <div class="p-4 bg-white border-b border-amber-200/60 flex justify-between items-center mt-1">
          <div>
            <h2 class="text-xl font-black text-stone-800">⚙️ การตั้งค่าระบบทีมและสิทธิ์</h2>
            <p class="text-xs text-stone-400 font-medium mt-0.5">บริหารจัดการตี้ มอบยศตำแหน่ง หรือเนรเทศสมาชิกที่ไม่ทำงาน</p>
          </div>
          <button @click="isManageTeamModalOpen = false" class="text-stone-400 hover:text-stone-600 p-1.5 focus:outline-none transition-colors">
            <!-- SVG Icon Close -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex bg-stone-100 border-b border-amber-200/40">
          <button @click="activeTab = 'members'" :class="activeTab === 'members' ? 'bg-[#fdfaf5] text-amber-900 border-b-2 border-amber-500 font-black' : 'text-stone-500 font-bold'" class="flex-1 py-3 text-sm transition-all focus:outline-none">
            👥 รายชื่อสมาชิกในบอร์ด ({{ projectMembers.length }})
          </button>
          <button @click="activeTab = 'roles'" :class="activeTab === 'roles' ? 'bg-[#fdfaf5] text-amber-900 border-b-2 border-amber-500 font-black' : 'text-stone-500 font-bold'" class="flex-1 py-3 text-sm transition-all focus:outline-none">
            ⚔️ ตั้งค่า Custom Roles
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-[#fdfaf5]">
          
          <div v-if="activeTab === 'members'" class="space-y-4">
            <div class="border border-amber-100 rounded-xl overflow-hidden bg-white shadow-sm">
              <table class="w-full text-left border-collapse">
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
                      <p class="font-bold text-stone-800">{{ member.user.username }}</p>
                      <p class="text-xs text-stone-400 font-mono">{{ member.user.email }}</p>
                    </td>
                    <td class="p-3">
                      <select 
                        :value="member.roleId || ''" 
                        @change="changeMemberRole(member.id, $event.target.value)"
                        class="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-lg px-2 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                      >
                        <option value="">👤 สมาชิกทั่วไป (No Role)</option>
                        <option v-for="role in projectRoles" :key="role.id" :value="role.id">⚔️ {{ role.name }}</option>
                      </select>
                    </td>
                    <td class="p-3 text-center">
                      <button @click="kickMember(member.id, member.user.username)" class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm">
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
              <div class="flex-1">
                <label class="block text-xs font-black text-stone-500 mb-1 uppercase tracking-wider">🛠️ สร้างยศตำแหน่งใหม่</label>
                <input v-model="newRoleName" type="text" placeholder="เช่น QA Tester, Frontend Dev..." class="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
              </div>
              <button @click="createNewRole" class="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm shadow-amber-600/10 shrink-0 transition-all">
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
                    class="font-black text-amber-900 border-b border-transparent hover:border-amber-300 focus:border-amber-500 focus:outline-none text-base bg-transparent px-1 py-0.5"
                    title="คลิกเพื่อแก้ไขชื่อยศ"
                  />
                  <button @click="deleteRole(role.id)" class="text-rose-500 hover:text-rose-700 text-xs font-bold">🗑️ ลบยศนี้ทิ้ง</button>
                </div>

                <div>
                  <p class="text-[11px] font-bold text-stone-400 mb-2 uppercase tracking-wide">สิทธิ์เข้าถึงฟีเจอร์ต่างๆ (Permissions Check)</p>
                  <div class="grid grid-cols-2 gap-3 text-xs font-semibold text-stone-600">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" :checked="role.permissions.includes('CREATE_TASK')" @change="togglePermission(role, 'CREATE_TASK')" class="rounded text-amber-600 focus:ring-amber-400" /> สร้างการ์ดงานได้
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" :checked="role.permissions.includes('DELETE_TASK')" @change="togglePermission(role, 'DELETE_TASK')" class="rounded text-amber-600 focus:ring-amber-400" /> สั่งลบการ์ดงานได้
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" :checked="role.permissions.includes('MANAGE_PROJECT')" @change="togglePermission(role, 'MANAGE_PROJECT')" class="rounded text-amber-600 focus:ring-amber-400" /> สิทธิ์จัดการบอร์ด/แก้ไขชื่อ
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
    <div v-if="isDeleteProjectModalOpen" class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-250 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <!-- แถบสีแดงไล่เฉดด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-600"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-black text-rose-700 mb-1">🚨 ลบโครงการแบบถาวร?</h3>
            <p class="text-stone-700 text-sm font-bold leading-relaxed mb-2">
              คำเตือนขั้นเด็ดขาด: ต้องการลบโครงการ <span class="text-rose-600 font-black">"{{ projectName }}"</span> ใช่หรือไม่?
            </p>
            <p class="text-stone-500 text-xs leading-relaxed">
              ข้อมูลการ์ดงาน คอลัมน์ เช็คลิสต์ สมาชิก ยศตำแหน่ง และประวัติกิจกรรมทั้งหมดจะสูญหายโดยสิ้นเชิงและไม่สามารถกู้คืนได้อีก
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
          <button @click="isDeleteProjectModalOpen = false" class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-bold text-xs transition-all">
            ยกเลิก
          </button>
          <button @click="confirmDeleteProject" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-all shadow-md shadow-rose-500/10">
            ลบโครงการถาวร 🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบช่องคอลัมน์ (isDeleteColumnModalOpen) -->
    <div v-if="isDeleteColumnModalOpen" class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <!-- แถบสีแดงไล่เฉดด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-rose-600"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-50 text-rose-500 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-black text-rose-700 mb-1">🗑️ ลบคอลัมน์?</h3>
            <p class="text-stone-700 text-sm font-bold leading-relaxed mb-2">
              คุณแน่ใจหรือไม่ว่าต้องการลบคอลัมน์ <span class="text-rose-600 font-black">"{{ columnToDeleteTitle }}"</span> ใช่หรือไม่?
            </p>
            <p class="text-stone-500 text-xs leading-relaxed">
              หมายเหตุ: เพื่อความปลอดภัย ระบบจะยอมให้ลบคอลัมน์ได้เฉพาะคอลัมน์ที่ไม่มีการ์ดงานค้างอยู่เท่านั้น หากมีงานค้างอยู่ กรุณาย้ายงานออกไปช่องอื่นก่อนทำการลบครับ
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
          <button @click="isDeleteColumnModalOpen = false; columnToDeleteId = null; columnToDeleteTitle = ''" class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-bold text-xs transition-all">
            ยกเลิก
          </button>
          <button @click="confirmDeleteColumn" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-all shadow-md shadow-rose-500/10">
            ยืนยันลบคอลัมน์
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบการ์ดงาน -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <!-- แถบสีแดงด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-black text-stone-800 mb-1">🗑️ ยืนยันการลบการ์ดงาน</h3>
            <p class="text-stone-500 text-sm font-medium">คุณแน่ใจหรือไม่ว่าต้องการลบการ์ดงานใบนี้? การกระทำนี้ไม่สามารถย้อนกลับได้และข้อมูลงานจะหายไปถาวร</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
          <button 
            @click="isDeleteModalOpen = false; taskToDeleteId = null" 
            class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg text-sm transition-all"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmDeleteTask" 
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm shadow-md shadow-rose-600/20 transition-all"
          >
            ยืนยันลบถาวร ⚠️
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการลบยศตำแหน่ง -->
    <div v-if="isDeleteRoleModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <!-- แถบสีแดงด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-black text-stone-800 mb-1">⚔️ ยืนยันการลบยศตำแหน่ง</h3>
            <p class="text-stone-500 text-sm font-medium">คุณแน่ใจหรือไม่ว่าต้องการลบยศตำแหน่งนี้? สมาชิกที่ถือครองยศนี้อยู่จะถูกถอดถอนสิทธิ์การใช้งานออกทั้งหมดทันที</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
          <button 
            @click="isDeleteRoleModalOpen = false; roleToDeleteId = null" 
            class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg text-sm transition-all"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmDeleteRole" 
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm shadow-md shadow-rose-600/20 transition-all"
          >
            ยืนยันลบยศ ⚠️
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันการเนรเทศสมาชิก -->
    <div v-if="isKickModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <!-- แถบสีแดงด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-black text-stone-800 mb-1">🚪 ยืนยันการเนรเทศสมาชิก</h3>
            <p class="text-stone-500 text-sm font-medium">คุณแน่ใจหรือไม่ว่าต้องการเนรเทศคุณ <span class="font-bold text-stone-800">"{{ memberToKickUsername }}"</span> ออกจากโปรเจกต์นี้? การกระทำนี้จะถอนสิทธิ์เข้าบอร์ดทั้งหมดทันที</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
          <button 
            @click="isKickModalOpen = false; memberToKickId = null; memberToKickUsername = ''" 
            class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg text-sm transition-all"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmKickMember" 
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm shadow-md shadow-rose-600/20 transition-all"
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
const tasks = ref([])
const currentInviteCode = ref('')
const isEditingProjectName = ref(false)
const newProjectName = ref('')
const isInviteCodeVisible = ref(false)
const projectName = ref('') 
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingTaskId = ref(null)

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
const sortBy = ref('createdAt')

// [STATE การแจ้งเตือน]
const notifications = ref([])
const isNotificationsOpen = ref(false)

// [STATE ของระบบจัดการทีมและยศ]
const isManageTeamModalOpen = ref(false)
const isDeleteProjectModalOpen = ref(false)
const isDeleteColumnModalOpen = ref(false)
const columnToDeleteId = ref(null)
const columnToDeleteTitle = ref('')
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
  const date = new Date(dueDateStr)
  return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
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
      showToast(res.message, 'success')
      newColumnTitle.value = ''
      isAddingColumn.value = false
      // Instant UI reactivity update
      if (res.data && !columns.value.some(c => c.id === res.data.id)) {
        columns.value.push(res.data)
      }
      await fetchColumns()
    }
  } catch (err) {
    showToast(err.message || 'สร้างคอลัมน์ไม่สำเร็จ', 'error')
  }
}

const triggerDeleteColumn = (columnId, columnTitle) => {
  columnToDeleteId.value = columnId
  columnToDeleteTitle.value = columnTitle
  isDeleteColumnModalOpen.value = true
}

const confirmDeleteColumn = async () => {
  if (!columnToDeleteId.value) return
  const idToDelete = columnToDeleteId.value
  try {
    const res = await $fetch(`/api/columns/delete?id=${idToDelete}`, {
      method: 'DELETE'
    })
    if (res.success) {
      showToast(res.message, 'success')
      isDeleteColumnModalOpen.value = false
      // Instant UI reactivity update
      columns.value = columns.value.filter(c => c.id !== idToDelete)
      columnToDeleteId.value = null
      columnToDeleteTitle.value = ''
      await fetchColumns()
      await fetchTasks()
    }
  } catch (err) {
    showToast(err.message || 'ไม่สามารถลบคอลัมน์ได้', 'error')
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
      showToast(res.message, 'success')
      editingColumnId.value = null
      await fetchColumns()
    }
  } catch (err) {
    showToast(err.message || 'เปลี่ยนชื่อคอลัมน์ไม่สำเร็จ', 'error')
  }
}

const fetchTasks = async () => {
  try {
    const response = await $fetch(`/api/tasks?projectId=${projectId}&t=${Date.now()}`)
    if (response.success) {
      tasks.value = response.data
      currentInviteCode.value = response.inviteCode
      projectName.value = response.projectName
      projectOwnerId.value = response.ownerId
    }
  } catch (error) { console.error(error) }
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
      newLabelName.value = ''
      isCreatingLabel.value = false
      showToast('สร้างป้ายกำกับสีสำเร็จแล้ว!', 'success')
    }
  } catch (err) {
    showToast(err.message || 'สร้างป้ายกำกับไม่สำเร็จ', 'error')
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
      showToast('อ่านข้อความแจ้งเตือนทั้งหมดแล้ว 🔔', 'success')
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
    showToast(err.message || 'ออกจากโครงการไม่สำเร็จ', 'error')
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
    showToast(err.message || 'ลบโครงการไม่สำเร็จ', 'error')
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
  } catch (err) { showToast(err.message || 'เพิ่มงานย่อยไม่สำเร็จ', 'error') }
}

const toggleSubtask = async (sub) => {
  try {
    await $fetch('/api/tasks/subtasks', {
      method: 'PUT',
      body: { id: sub.id, isCompleted: sub.isCompleted }
    })
    fetchTasks()
  } catch (err) { showToast(err.message || 'แก้ไขสถานะไม่สำเร็จ', 'error') }
}

const deleteSubtask = async (id) => {
  try {
    await $fetch(`/api/tasks/subtasks?id=${id}`, { method: 'DELETE' })
    subtasks.value = subtasks.value.filter(s => s.id !== id)
    fetchTasks()
  } catch (err) { showToast(err.message || 'ลบงานย่อยไม่สำเร็จ', 'error') }
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
  } catch (err) { showToast(err.message || 'ส่งความเห็นไม่สำเร็จ', 'error') }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file || !editingTaskId.value) return
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
      showToast('อัปโหลดไฟล์แนบสำเร็จ! 📎', 'success')
      fetchTasks()
      fetchTaskLogs(editingTaskId.value)
    }
  } catch (err) { showToast(err.message || 'อัปโหลดล้มเหลว', 'error') }
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
    const priorityMap = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 }
    list.sort((a, b) => (priorityMap[a.priority] || 2) - (priorityMap[b.priority] || 2))
  } else {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
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
    if (membersRes.success) projectMembers.value = membersRes.data
    if (rolesRes.success) projectRoles.value = rolesRes.data
  } catch (error) { console.error('Error fetching team or roles:', error) }
}

let eventSource = null

const initSse = () => {
  if (eventSource) eventSource.close()

  eventSource = new EventSource(`/api/projects/events?projectId=${projectId}`)

  eventSource.onmessage = (event) => {
    if (event.data === 'connected') return
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'TASKS_UPDATED') {
        fetchTasks()
        fetchColumns()
        fetchNotifications()
      } else if (data.type === 'TEAM_UPDATED') {
        fetchTeamAndRoles()
        fetchNotifications()
      }
    } catch (e) {
      console.error('Failed to parse SSE event message:', e)
    }
  }

  eventSource.onerror = (err) => {
    console.error('SSE connection error. Reconnecting...', err)
  }
}

onMounted(async () => { 
  try {
    const meRes = await $fetch('/api/auth/me')
    if (meRes.success) {
      currentUser.value = meRes.user
      localStorage.setItem('user', JSON.stringify(meRes.user))
    }
  } catch (error) {
    localStorage.removeItem('user')
    navigateTo('/login')
    return
  }
  fetchTasks()
  await fetchColumns()
  await fetchLabels()
  await fetchNotifications()
  await fetchTeamAndRoles()
  initSse()
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    console.log('[SSE] Connection closed on component unmount.')
  }
})

const hasPermission = (permission) => {
  if (!currentUser.value) return false
  if (projectOwnerId.value && currentUser.value && projectOwnerId.value === currentUser.value.id) return true
  
  const myMemberInfo = projectMembers.value.find(m => m.user.id === currentUser.value.id)
  if (!myMemberInfo) return false
  
  return myMemberInfo.role?.permissions.includes(permission) || false
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
  try {
    const response = await $fetch('/api/projects/update', {
      method: 'PUT',
      body: { id: projectId, name: newProjectName.value.trim(), userId: currentUser.value?.id }
    })
    if (response.success) {
      projectName.value = response.project.name
      isEditingProjectName.value = false
      showToast('แก้ไขชื่อโปรเจกต์สำเร็จ! ✨', 'success')
    }
  } catch (error) { showToast('ไม่สามารถเปลี่ยนชื่อโปรเจกต์ได้ ❌', 'error') }
}

const createNewRole = async () => {
  if (!newRoleName.value.trim()) return
  try {
    const response = await $fetch('/api/roles/create', {
      method: 'POST',
      body: { projectId, name: newRoleName.value.trim(), permissions: ['CREATE_TASK'] }
    })
    if (response.success) {
      newRoleName.value = ''
      await fetchTeamAndRoles()
      showToast('สร้างยศใหม่สำเร็จแล้ว! ⚔️', 'success')
    }
  } catch (error) { showToast('เกิดข้อผิดพลาดในการสร้างยศ ❌', 'error') }
}

const updateRoleData = async (role) => {
  try {
    await $fetch('/api/roles/update', {
      method: 'PUT',
      body: { roleId: role.id, name: role.name, permissions: role.permissions }
    })
  } catch (error) { showToast('ไม่สามารถบันทึกชื่อยศใหม่ได้ ❌', 'error') }
}

const togglePermission = async (role, permissionStr) => {
  const index = role.permissions.indexOf(permissionStr)
  if (index > -1) {
    role.permissions.splice(index, 1)
  } else {
    role.permissions.push(permissionStr)
  }
  await updateRoleData(role)
  showToast('อัปเดตสิทธิ์บทบาทสำเร็จ ✨', 'success')
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
      showToast('ลบยศตำแหน่งสำเร็จแล้ว 👋', 'success')
    }
  } catch (error) { showToast('ไม่สามารถลบยศนี้ได้ ❌', 'error') }
}

const changeMemberRole = async (memberId, targetRoleId) => {
  try {
    const response = await $fetch('/api/members/update-role', {
      method: 'PUT',
      body: { memberId, roleId: targetRoleId ? Number(targetRoleId) : null }
    })
    if (response.success) {
      await fetchTeamAndRoles()
      showToast('เปลี่ยนยศสมาชิกบอร์ดสำเร็จ! ⚔️', 'success')
    }
  } catch (error) { showToast('เปลี่ยนยศไม่สำเร็จ ❌', 'error') }
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
      showToast('เนรเทศสมาชิกเรียบร้อยแล้ว 👋', 'success')
    }
  } catch (error) { showToast('เตะคนออกไม่สำเร็จ ❌', 'error') }
}

const copyInviteCode = () => {
  if (!currentInviteCode.value) return
  navigator.clipboard.writeText(currentInviteCode.value)
  showToast(`คัดลอกรหัสเชิญ: ${currentInviteCode.value} ไปยังคลิปบอร์ดแล้ว! 📋`, 'success')
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
  isModalOpen.value = true
}

const openEditModal = (task) => {
  isEditMode.value = true
  editingTaskId.value = task.id
  taskTitle.value = task.title
  taskDescription.value = task.description || ''
  taskAssigneeId.value = task.assigneeId || ''
  taskDueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  taskPriority.value = task.priority || 'MEDIUM'
  selectedLabelIds.value = task.labels ? task.labels.map(l => l.id) : []
  subtasks.value = []
  attachments.value = []
  comments.value = []
  newSubtaskTitle.value = ''
  newCommentContent.value = ''
  taskLogs.value = []
  fetchTaskDetails(task.id)
  fetchTaskLogs(task.id)
  isModalOpen.value = true
}

const handleSubmit = async () => {
  if (!taskTitle.value.trim()) return
  if (isEditMode.value) {
    try {
      const response = await $fetch('/api/tasks', { 
        method: 'PUT', 
        body: { 
          id: editingTaskId.value, 
          title: taskTitle.value, 
          description: taskDescription.value,
          assigneeId: taskAssigneeId.value || null,
          dueDate: taskDueDate.value || null,
          priority: taskPriority.value,
          labelIds: selectedLabelIds.value
        } 
      })
      if (response.success) fetchTasks()
    } catch (error) { console.error(error) }
  } else {
    try {
      const response = await $fetch('/api/tasks', { 
        method: 'POST', 
        body: { 
          title: taskTitle.value, 
          description: taskDescription.value, 
          projectId: projectId,
          columnId: activeAddColumnId.value,
          assigneeId: taskAssigneeId.value || null,
          dueDate: taskDueDate.value || null,
          priority: taskPriority.value
        } 
      })
      if (response.success) fetchTasks()
    } catch (error) { console.error(error) }
  }
  isModalOpen.value = false
}

const isDeleteModalOpen = ref(false)
const taskToDeleteId = ref(null)

const deleteTask = (id) => {
  taskToDeleteId.value = id
  isDeleteModalOpen.value = true
}

const confirmDeleteTask = async () => {
  if (!taskToDeleteId.value) return
  try {
    const response = await $fetch(`/api/tasks?id=${taskToDeleteId.value}`, { 
      method: 'DELETE'
    })
    if (response.success) {
      fetchTasks()
      isDeleteModalOpen.value = false
      taskToDeleteId.value = null
    }
  } catch (error) { console.error(error) }
}

const moveTask = async (id, targetColumnId) => {
  try {
    await $fetch('/api/tasks', { 
      method: 'PUT', 
      body: { id, columnId: targetColumnId } 
    })
    fetchTasks()
  } catch (error) { console.error(error) }
}

let draggedTaskId = null
const onDragStart = (id) => { draggedTaskId = id }
const onDrop = (columnId) => {
  if (!hasPermission('CREATE_TASK')) return
  if (draggedTaskId) { moveTask(draggedTaskId, columnId); draggedTaskId = null }
}
</script>