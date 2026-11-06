<template>
  <div :class="isMinimalMode ? 'bg-[#fafafa] text-neutral-900' : 'bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] text-stone-800'" class="min-h-screen transition-colors duration-300 font-sans pb-12">
    
    <!-- Floating Switcher Toolbar -->
    <header class="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-3 flex justify-between items-center transition-all"
      :class="isMinimalMode ? 'bg-white/80 border-neutral-200' : 'bg-[#fdfaf5]/90 border-amber-200/80 shadow-sm'">
      
      <div class="flex items-center gap-3">
        <span class="text-xl font-black tracking-tight" :class="isMinimalMode ? 'text-black' : 'text-stone-800'">
          {{ isMinimalMode ? 'FlowSpace' : '🌌 FlowSpace' }}
        </span>
        <span class="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
          :class="isMinimalMode ? 'bg-neutral-100 text-neutral-600 border border-neutral-200' : 'bg-amber-100 text-amber-900 border border-amber-300'">
          {{ isMinimalMode ? 'Minimal Mode' : 'Warm Earth Mode' }}
        </span>
      </div>

      <!-- Theme Mode Toggle Button -->
      <div class="flex items-center gap-2">
        <button 
          @click="isMinimalMode = !isMinimalMode"
          class="text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          :class="isMinimalMode 
            ? 'bg-black text-white hover:bg-neutral-800' 
            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'">
          <span>{{ isMinimalMode ? '🪵 สลับเป็นสไตล์ Warm Earth เดิม' : '◻️ สลับเป็นสไตล์ Clean Minimal' }}</span>
        </button>

        <NuxtLink to="/dashboard" class="text-xs font-bold px-3 py-2 rounded-xl border transition-all"
          :class="isMinimalMode ? 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700' : 'bg-[#f3e9d7] border-amber-300 hover:bg-[#ebdcc5] text-amber-950'">
          กลับหน้าหลัก ➡️
        </NuxtLink>
      </div>
    </header>

    <!-- Sub-header Breadcrumb & Actions -->
    <div class="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight" :class="isMinimalMode ? 'text-neutral-900' : 'text-stone-800'">
          {{ isMinimalMode ? 'Project: Mobile App Redesign' : '📁 โปรเจกต์: พัฒนาแอปมือถือ 2026' }}
        </h1>
        <p class="text-xs font-medium mt-1" :class="isMinimalMode ? 'text-neutral-500' : 'text-stone-500'">
          {{ isMinimalMode ? '3 columns · 5 tasks active · 3 members' : 'คอลัมน์ 3 ขั้นตอน · การ์ดงาน 5 ใบ · สมาชิก 3 คน' }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold"
          :class="isMinimalMode ? 'bg-white border-neutral-200 text-neutral-700' : 'bg-white border-amber-200 text-amber-950'">
          <span class="text-neutral-400 font-sans text-[11px]">รหัส:</span>
          <span>A9X3F1</span>
        </div>
        <button class="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          :class="isMinimalMode ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'bg-amber-600 text-white hover:bg-amber-700'">
          + งานใหม่
        </button>
      </div>
    </div>

    <!-- Kanban Board Grid -->
    <main class="max-w-7xl mx-auto px-6 mt-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        <!-- COLUMN 1: TO DO -->
        <div class="rounded-2xl border transition-all p-4"
          :class="isMinimalMode ? 'bg-white border-neutral-200/80 shadow-none' : 'bg-[#fdfaf5] border-amber-200/80 shadow-sm'">
          
          <div class="flex justify-between items-center mb-4 pb-2 border-b"
            :class="isMinimalMode ? 'border-neutral-100' : 'border-amber-100'">
            <div class="flex items-center gap-2">
              <span v-if="!isMinimalMode">📋</span>
              <h2 class="text-sm font-bold tracking-tight" :class="isMinimalMode ? 'text-neutral-900 uppercase tracking-wider text-xs' : 'text-stone-800'">
                {{ isMinimalMode ? 'Backlog' : 'จะทำ (To Do)' }}
              </h2>
              <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                :class="isMinimalMode ? 'bg-neutral-100 text-neutral-600' : 'bg-amber-100 text-amber-900'">
                2
              </span>
            </div>
            <button class="text-neutral-400 hover:text-neutral-600 text-xs">···</button>
          </div>

          <!-- Cards in Col 1 -->
          <div class="space-y-3">
            <!-- Card 1 -->
            <div class="rounded-xl border p-4 transition-all cursor-pointer group"
              :class="isMinimalMode 
                ? 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-sm' 
                : 'bg-white border-amber-200 hover:border-amber-400 shadow-sm'">
              
              <div class="flex justify-between items-start gap-2 mb-2">
                <div class="flex items-center gap-1.5">
                  <!-- Priority indicator -->
                  <span v-if="isMinimalMode" class="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Urgent Priority"></span>
                  <span v-else class="text-[9px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">URGENT</span>
                  <span class="text-xs font-bold leading-snug group-hover:text-amber-800 transition-colors"
                    :class="isMinimalMode ? 'text-neutral-900 group-hover:text-black font-semibold' : 'text-stone-800'">
                    ออกแบบหน้า Login & Register ใหม่
                  </span>
                </div>
              </div>

              <p class="text-xs line-clamp-2 mb-3"
                :class="isMinimalMode ? 'text-neutral-500 font-normal' : 'text-stone-500 font-medium'">
                ปรับแต่งฟอร์มให้รองรับการกรอกข้อมูลแบบมือถือและเพิ่มความเร็วในการโหลด
              </p>

              <!-- Metadata row -->
              <div class="flex justify-between items-center text-[11px] pt-2 border-t"
                :class="isMinimalMode ? 'border-neutral-100 text-neutral-500' : 'border-amber-50 text-stone-400'">
                <div class="flex items-center gap-2.5">
                  <span class="flex items-center gap-1">
                    <span>☑</span> 2/4
                  </span>
                  <span class="flex items-center gap-1">
                    <span>📎</span> 1
                  </span>
                </div>
                <div class="flex items-center gap-1.5 font-mono">
                  <span class="text-[10px] text-rose-600 font-bold">12 พ.ย.</span>
                  <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                    :class="isMinimalMode ? 'bg-neutral-900 text-white' : 'bg-amber-200 text-amber-900'">
                    KW
                  </span>
                </div>
              </div>
            </div>

            <!-- Card 2 -->
            <div class="rounded-xl border p-4 transition-all cursor-pointer group"
              :class="isMinimalMode 
                ? 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-sm' 
                : 'bg-white border-amber-200 hover:border-amber-400 shadow-sm'">
              
              <div class="flex items-center gap-1.5 mb-2">
                <span v-if="isMinimalMode" class="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Medium Priority"></span>
                <span v-else class="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">MEDIUM</span>
                <span class="text-xs font-bold leading-snug"
                  :class="isMinimalMode ? 'text-neutral-900 font-semibold' : 'text-stone-800'">
                  ติดตั้งเครื่องมือ Analytics ตรวจจับ Error
                </span>
              </div>

              <div class="flex justify-between items-center text-[11px] pt-2 border-t"
                :class="isMinimalMode ? 'border-neutral-100 text-neutral-500' : 'border-amber-50 text-stone-400'">
                <span class="flex items-center gap-1"><span>💬</span> 3</span>
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  :class="isMinimalMode ? 'bg-neutral-200 text-neutral-700' : 'bg-stone-200 text-stone-700'">
                  TH
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMN 2: IN PROGRESS -->
        <div class="rounded-2xl border transition-all p-4"
          :class="isMinimalMode ? 'bg-white border-neutral-200/80 shadow-none' : 'bg-[#fdfaf5] border-amber-200/80 shadow-sm'">
          
          <div class="flex justify-between items-center mb-4 pb-2 border-b"
            :class="isMinimalMode ? 'border-neutral-100' : 'border-amber-100'">
            <div class="flex items-center gap-2">
              <span v-if="!isMinimalMode">⚙️</span>
              <h2 class="text-sm font-bold tracking-tight" :class="isMinimalMode ? 'text-neutral-900 uppercase tracking-wider text-xs' : 'text-stone-800'">
                {{ isMinimalMode ? 'In Progress' : 'ทำอยู่ (Doing)' }}
              </h2>
              <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                :class="isMinimalMode ? 'bg-neutral-100 text-neutral-600' : 'bg-amber-100 text-amber-900'">
                2
              </span>
            </div>
            <button class="text-neutral-400 hover:text-neutral-600 text-xs">···</button>
          </div>

          <div class="space-y-3">
            <!-- Card 3 -->
            <div class="rounded-xl border p-4 transition-all cursor-pointer group"
              :class="isMinimalMode 
                ? 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-sm' 
                : 'bg-white border-amber-200 hover:border-amber-400 shadow-sm'">
              
              <div class="flex items-center gap-1.5 mb-2">
                <span v-if="isMinimalMode" class="w-2 h-2 rounded-full bg-orange-500 shrink-0" title="High Priority"></span>
                <span v-else class="text-[9px] font-black bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">HIGH</span>
                <span class="text-xs font-bold leading-snug"
                  :class="isMinimalMode ? 'text-neutral-900 font-semibold' : 'text-stone-800'">
                  เชื่อมต่อ Database Neon ใน Region สิงคโปร์
                </span>
              </div>

              <!-- Subtask progress bar in Warm mode vs Hairline in Minimal -->
              <div class="w-full h-1.5 rounded-full overflow-hidden my-2.5"
                :class="isMinimalMode ? 'bg-neutral-100' : 'bg-amber-100'">
                <div class="h-full transition-all"
                  :class="isMinimalMode ? 'bg-neutral-900 w-3/4' : 'bg-amber-500 w-3/4'"></div>
              </div>

              <div class="flex justify-between items-center text-[11px] pt-1"
                :class="isMinimalMode ? 'text-neutral-500' : 'text-stone-400'">
                <span>75% เสร็จสิ้น</span>
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  :class="isMinimalMode ? 'bg-neutral-900 text-white' : 'bg-amber-200 text-amber-900'">
                  KW
                </span>
              </div>
            </div>

            <!-- Card 4 -->
            <div class="rounded-xl border p-4 transition-all cursor-pointer group"
              :class="isMinimalMode 
                ? 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-sm' 
                : 'bg-white border-amber-200 hover:border-amber-400 shadow-sm'">
              
              <div class="flex items-center gap-1.5 mb-2">
                <span v-if="isMinimalMode" class="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Low Priority"></span>
                <span v-else class="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">LOW</span>
                <span class="text-xs font-bold leading-snug"
                  :class="isMinimalMode ? 'text-neutral-900 font-semibold' : 'text-stone-800'">
                  ปรับแต่งฟอนต์ภาษาไทยและระบบภาษา
                </span>
              </div>

              <div class="flex justify-between items-center text-[11px] pt-2 border-t"
                :class="isMinimalMode ? 'border-neutral-100 text-neutral-500' : 'border-amber-50 text-stone-400'">
                <span class="text-[10px] text-neutral-400">18 พ.ย.</span>
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  :class="isMinimalMode ? 'bg-neutral-200 text-neutral-700' : 'bg-stone-200 text-stone-700'">
                  AL
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMN 3: DONE -->
        <div class="rounded-2xl border transition-all p-4"
          :class="isMinimalMode ? 'bg-white border-neutral-200/80 shadow-none' : 'bg-[#fdfaf5] border-amber-200/80 shadow-sm'">
          
          <div class="flex justify-between items-center mb-4 pb-2 border-b"
            :class="isMinimalMode ? 'border-neutral-100' : 'border-amber-100'">
            <div class="flex items-center gap-2">
              <span v-if="!isMinimalMode">✅</span>
              <h2 class="text-sm font-bold tracking-tight" :class="isMinimalMode ? 'text-neutral-900 uppercase tracking-wider text-xs' : 'text-stone-800'">
                {{ isMinimalMode ? 'Completed' : 'ทำเสร็จแล้ว (Done)' }}
              </h2>
              <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                :class="isMinimalMode ? 'bg-neutral-100 text-neutral-600' : 'bg-amber-100 text-amber-900'">
                1
              </span>
            </div>
            <button class="text-neutral-400 hover:text-neutral-600 text-xs">···</button>
          </div>

          <div class="space-y-3">
            <!-- Card 5 -->
            <div class="rounded-xl border p-4 opacity-75 hover:opacity-100 transition-all cursor-pointer group"
              :class="isMinimalMode 
                ? 'bg-neutral-50 border-neutral-200 hover:border-neutral-300' 
                : 'bg-stone-50 border-stone-200 hover:border-stone-300'">
              
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-emerald-500 text-xs font-bold">✓</span>
                <span class="text-xs font-semibold line-through text-neutral-500">
                  ร่างโครงสร้างฐานข้อมูล Prisma และ Role
                </span>
              </div>
              <p class="text-[10px] text-neutral-400 mt-2">เสร็จสิ้นเมื่อ 3 วันที่แล้ว</p>
            </div>
          </div>
        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const isMinimalMode = ref(true)
</script>
