<template>
  <div class="min-h-screen bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] text-stone-800 flex flex-col relative overflow-hidden bg-grid">
    
    <div class="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

    <header class="bg-[#fdfaf5] border-b border-amber-200/80 p-4 shadow-sm relative z-10">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-extrabold text-stone-800 flex items-center gap-2">
          🗂️ My Workspaces
        </h1>
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-stone-600 bg-[#f3e9d7] px-3 py-1.5 rounded-lg border border-amber-200">
            👤 {{ currentUser?.username || 'User' }}
          </span>
          <button @click="handleLogout" class="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold px-4 py-2 rounded-lg transition-all border border-stone-300 text-sm">
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 container mx-auto p-6 relative z-10">
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 class="text-2xl font-black text-stone-800">ยินดีต้อนรับกลับมา! 👋</h2>
          <p class="text-stone-500 font-medium text-sm mt-0.5">เลือกบอร์ดของคุณ หรือใช้รหัสเข้าร่วมทีมของเพื่อนเพื่อลุยงาน</p>
        </div>
        
        <div class="flex gap-3 w-full md:w-auto">
          <button 
            @click="isJoinModalOpen = true"
            class="bg-white hover:bg-stone-50 text-amber-950 font-bold px-5 py-2.5 rounded-xl transition-all border border-amber-300 text-sm flex items-center justify-center gap-1.5"
          >
            🔑 กรอกรหัสเข้าบอร์ด
          </button>
          <button 
            @click="openCreateProjectModal"
            class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-1.5"
          >
            ➕ สร้างโปรเจกต์ใหม่
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
        <p class="text-stone-500 font-bold text-sm">กำลังดึงข้อมูลเวิร์กสเปซ...</p>
      </div>

      <div v-else-if="projects.length === 0" class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xl shadow-amber-900/5 mt-8">
        <div class="text-5xl mb-4">🏜️</div>
        <h3 class="text-xl font-extrabold text-stone-800 mb-2">ยังไม่มีโปรเจกต์ในระบบ</h3>
        <p class="text-stone-500 text-sm font-medium mb-6 max-w-md mx-auto">
          เริ่มต้นสร้างบอร์ดใหม่ หรือขอรหัสเชิญ 6 หลักจากเพื่อนมาตอกใส่ปุ่มด้านบนเพื่อจอยตี้ได้เลยครับ!
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="project in projects" :key="project.id" class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-bold text-stone-800 group-hover:text-amber-800 transition-colors break-words max-w-[75%]">
                📁 {{ project.name }}
              </h3>
              <span :class="project.isOwner ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-stone-100 text-stone-700 border-stone-300'" class="text-[10px] font-black px-2 py-0.5 rounded-full border">
                {{ project.isOwner ? 'Owner' : 'Member' }}
              </span>
            </div>
            <p class="text-stone-500 text-sm font-medium line-clamp-2 mb-4 break-words">
              {{ project.description || 'ไม่มีคำอธิบายรายละเอียดโปรเจกต์...' }}
            </p>
          </div>

          <div class="pt-4 border-t border-amber-100 flex justify-between items-center">
            <span class="text-xs text-stone-400 font-medium">โดย: {{ project.ownerName }}</span>
            <div class="flex gap-2">
              <button 
                v-if="project.isOwner" 
                @click="openEditProjectModal(project)" 
                class="bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-stone-300 transition-all flex items-center gap-1"
              >
                ✏️ แก้ไข
              </button>
              <button @click="goToProject(project.id)" class="bg-[#f3e9d7] hover:bg-[#ebdcc5] text-amber-900 font-bold text-xs px-3 py-1.5 rounded-lg border border-amber-200 transition-all">
                เปิดบอร์ด ➡️
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal สำหรับ สร้าง/แก้ไข โปรเจกต์ -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <!-- แถบสีส้มด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>

        <h2 class="text-xl font-extrabold text-stone-800 mb-1 mt-2">📁 {{ isEditProjectMode ? 'แก้ไขรายละเอียดโปรเจกต์' : 'สร้างโปรเจกต์ใหม่' }}</h2>
        <form @submit.prevent="isEditProjectMode ? handleUpdateProject() : handleCreateProject()" class="space-y-4 mt-4">
          <div>
            <label class="block text-sm font-semibold text-stone-600 mb-1">ชื่อโปรเจกต์</label>
            <input v-model="projectName" type="text" placeholder="เช่น พัฒนาแอปคลังมังงะ" required class="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-stone-600 mb-1">รายละเอียด</label>
            <textarea v-model="projectDescription" rows="3" placeholder="อธิบายจุดประสงค์สั้นๆ..." class="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"></textarea>
          </div>
          <p v-if="modalMessage" class="text-sm text-center font-bold py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">{{ modalMessage }}</p>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="closeModal" class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-bold text-sm transition-all">ยกเลิก</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-amber-500/10">
              {{ isEditProjectMode ? 'บันทึกสำเร็จ ✨' : 'สร้างสำเร็จ ✨' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal สำหรับ เข้าร่วมโปรเจกต์ -->
    <div v-if="isJoinModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <!-- แถบสีทองด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>

        <h2 class="text-xl font-extrabold text-stone-800 mb-1 mt-2">🔑 เข้าร่วมโปรเจกต์</h2>
        <p class="text-stone-400 text-xs font-medium mb-4">นำรหัส 6 หลักจากเจ้าของโปรเจกต์มาวางเพื่อเข้าร่วมทำงาน</p>
        <form @submit.prevent="handleJoinProject" class="space-y-4">
          <input v-model="codeToJoin" type="text" placeholder="เช่น A7B9X2" maxlength="6" required class="w-full bg-white border border-amber-200 rounded-lg px-4 py-3 text-center text-xl font-mono font-black uppercase text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all tracking-widest" />
          <p v-if="joinError" class="text-xs text-center text-rose-600 font-bold bg-rose-50 py-1.5 rounded border border-rose-100">{{ joinError }}</p>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="isJoinModalOpen = false; codeToJoin = ''; joinError = ''" class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-bold text-sm transition-all">ยกเลิก</button>
            <button type="submit" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-amber-500/10">เข้าร่วมบอร์ด 🚀</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal ยืนยันการออกจากระบบ -->
    <div v-if="isLogoutModalOpen" class="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#fdfaf5] border border-rose-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <!-- แถบสีแดงด้านบน -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
        
        <div class="flex items-start gap-4 mt-2">
          <div class="bg-rose-100 text-rose-600 p-3 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-black text-stone-800 mb-1">🚪 ยืนยันการออกจากระบบ</h3>
            <p class="text-stone-500 text-sm font-medium">คุณต้องการออกจากระบบใช่หรือไม่? เมื่อออกจากระบบแล้ว คุณจำเป็นต้องเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งาน</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
          <button 
            @click="isLogoutModalOpen = false" 
            class="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg text-sm transition-all"
          >
            ยกเลิก
          </button>
          <button 
            @click="confirmLogout" 
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm shadow-md shadow-rose-600/20 transition-all"
          >
            ออกจากระบบ ➡️
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
import { ref, onMounted } from 'vue'

definePageMeta({ middleware: 'auth' })

const currentUser = ref(null)
const projects = ref([])
const isLoading = ref(true)

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const projectName = ref('')
const projectDescription = ref('')
const modalMessage = ref('')
const isEditProjectMode = ref(false)
const editingProjectId = ref(null)

const isJoinModalOpen = ref(false)
const codeToJoin = ref('')
const joinError = ref('')
const isLogoutModalOpen = ref(false)

const { showToast } = useToast()

const fetchProjects = async () => {
  if (!currentUser.value) return
  isLoading.value = true
  try {
    const response = await $fetch(`/api/projects/list?userId=${currentUser.value.id}`)
    if (response.success) projects.value = response.projects
  } catch (error) { console.error(error) }
  finally { isLoading.value = false }
}

onMounted(async () => {
  try {
    const meRes = await $fetch('/api/auth/me')
    if (meRes.success) {
      currentUser.value = meRes.user
      localStorage.setItem('user', JSON.stringify(meRes.user))
      fetchProjects()
    }
  } catch (error) {
    localStorage.removeItem('user')
    navigateTo('/login')
  }
})

const handleCreateProject = async () => {
  if (!projectName.value.trim() || !currentUser.value) return
  isSubmitting.value = true
  modalMessage.value = ''
  try {
    const response = await $fetch('/api/projects/create', {
      method: 'POST',
      body: { name: projectName.value.trim(), description: projectDescription.value.trim(), ownerId: currentUser.value.id }
    })
    if (response.success) { closeModal(); await fetchProjects() }
  } catch (error) { modalMessage.value = error.data?.message || 'เกิดข้อผิดพลาดในการสร้างเวิร์กสเปซ' }
  finally { isSubmitting.value = false }
}

const handleUpdateProject = async () => {
  if (!projectName.value.trim() || !currentUser.value || !editingProjectId.value) return
  isSubmitting.value = true
  modalMessage.value = ''
  try {
    const response = await $fetch('/api/projects/update', {
      method: 'PUT',
      body: { id: editingProjectId.value, name: projectName.value.trim(), description: projectDescription.value.trim(), userId: currentUser.value.id }
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

const handleJoinProject = async () => {
  if (!codeToJoin.value.trim() || !currentUser.value) return
  joinError.value = ''
  try {
    const response = await $fetch('/api/projects/join', {
      method: 'POST',
      body: { inviteCode: codeToJoin.value.trim(), userId: currentUser.value.id }
    })
    if (response.success) {
      isJoinModalOpen.value = false; codeToJoin.value = '';
      showToast(response.message, 'success'); await fetchProjects()
    }
  } catch (error) { joinError.value = error.data?.message || 'รหัสเชิญไม่ถูกต้องหรือหมดอายุ' }
}

const closeModal = () => {
  isModalOpen.value = false; projectName.value = ''; projectDescription.value = ''; modalMessage.value = ''
  isEditProjectMode.value = false; editingProjectId.value = null
}
const goToProject = (projectId) => { navigateTo(`/project/${projectId}`) }
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