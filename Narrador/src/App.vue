<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-[#0b0f19]">
    <!-- Ambient Background Glows -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-4xl mx-auto space-y-8 relative z-10">
      
      <header class="text-center space-y-4">
        <!-- Top Status Pill -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-lg shadow-indigo-950/20">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Estudio de Voz Serverless Local
        </div>

        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          VozText <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Pro</span>
        </h1>
        <p class="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
          Transforma documentos PDF y textos en una narración de voz fluida, profesional y privada.
        </p>

        <!-- Feature Badges -->
        <div class="pt-2 flex flex-wrap justify-center gap-3 text-xs font-medium text-slate-300">
          <span class="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2 backdrop-blur-md shadow-sm">
            <Sparkles size="14" class="text-amber-400" /> 100% Privado & Sin Registro
          </span>
          <span class="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2 backdrop-blur-md shadow-sm">
            <FileText size="14" class="text-indigo-400" /> Lector PDF & TXT
          </span>
          <span class="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2 backdrop-blur-md shadow-sm">
            <Volume2 size="14" class="text-purple-400" /> Motor TTS Nativo
          </span>
        </div>
      </header>

      <!-- Toast Notification -->
      <transition 
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0">
        <div v-if="notification" :class="[
            'p-4 rounded-2xl flex items-center justify-between gap-3 backdrop-blur-xl border shadow-2xl transition-all',
            notification.type === 'error' 
              ? 'bg-rose-950/80 border-rose-800/80 text-rose-200' 
              : 'bg-indigo-950/80 border-indigo-700/80 text-indigo-200'
          ]">
          <div class="flex items-center gap-3">
            <AlertCircle v-if="notification.type === 'error'" size="20" class="text-rose-400 shrink-0" />
            <CheckCircle2 v-else size="20" class="text-indigo-400 shrink-0" />
            <p class="text-sm font-medium">{{ notification.msg }}</p>
          </div>
          <button @click="notification = null" class="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 transition-colors">✕</button>
        </div>
      </transition>

      <!-- Main Container Card -->
      <main class="bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-indigo-950/30 rounded-3xl p-6 sm:p-10 space-y-8 border border-slate-800/80">
        
        <section class="space-y-4">
          <div class="flex items-center gap-2.5">
            <span class="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold border border-indigo-500/30">1</span>
            <h2 class="text-lg font-semibold text-slate-100">Carga tu documento</h2>
          </div>
          <FileUploader
            @textExtracted="handleTextExtracted"
            @error="(msg) => showNotification(msg, 'error')"
          />
        </section>

        <div class="relative flex items-center py-1">
          <div class="flex-grow border-t border-slate-800/80"></div>
          <span class="flex-shrink-0 mx-4 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-xs font-semibold tracking-wider">O</span>
          <div class="flex-grow border-t border-slate-800/80"></div>
        </div>

        <section class="space-y-4">
          <TextInput v-model="text" />
        </section>

        <section class="pt-6 border-t border-slate-800/80 space-y-4">
          <div class="flex items-center gap-2.5">
            <span class="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold border border-indigo-500/30">2</span>
            <h2 class="text-lg font-semibold text-slate-100">Control de Narración y Audio</h2>
          </div>
          <AudioPlayer :text="text" @error="(msg) => showNotification(msg, 'error')" />
        </section>
      </main>

      <footer class="text-center text-xs text-slate-500 pb-10 space-y-2">
        <p>Ejecutándose 100% en tu navegador (PDF.js + Web Speech API). Sin servidor, sin rastreadores.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { AlertCircle, CheckCircle2, Sparkles, FileText, Volume2 } from 'lucide-vue-next';
import FileUploader from './components/FileUploader.vue';
import TextInput from './components/TextInput.vue';
import AudioPlayer from './components/AudioPlayer.vue';

const text = ref('');
const notification = ref(null);
let timeoutId = null;

const showNotification = (msg, type = 'error') => {
  notification.value = { msg, type };
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    notification.value = null;
  }, 5000);
};

const handleTextExtracted = (extractedText) => {
  text.value = extractedText;
  showNotification('¡Archivo procesado exitosamente! Listo para escuchar.', 'info');
};
</script>

