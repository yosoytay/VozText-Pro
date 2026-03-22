<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-3xl mx-auto space-y-8">
      
      <header class="text-center">
        <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">
          VozText <span class="text-blue-600">Pro</span>
        </h1>
        <p class="mt-2 text-lg text-gray-600">
          Convierte tus documentos y notas en audio de forma rápida y accesible.
        </p>
      </header>

      <transition 
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0">
        <div v-if="notification" :class="[
            'p-4 rounded-lg flex items-start gap-3 transition-all',
            notification.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
          ]">
          <AlertCircle v-if="notification.type === 'error'" size="20" class="mt-0.5" />
          <CheckCircle2 v-else size="20" class="mt-0.5" />
          <p class="text-sm font-medium">{{ notification.msg }}</p>
        </div>
      </transition>

      <main class="bg-white shadow-xl shadow-gray-200/50 rounded-3xl p-6 sm:p-10 space-y-8 border border-gray-100">
        
        <section>
          <h2 class="text-xl font-semibold text-gray-800 mb-4">1. Carga tu documento</h2>
          <FileUploader
            @textExtracted="handleTextExtracted"
            @error="(msg) => showNotification(msg, 'error')"
          />
        </section>

        <div class="relative flex items-center py-2">
          <div class="flex-grow border-t border-gray-200"></div>
          <span class="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase">O</span>
          <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <section>
          <TextInput v-model="text" />
        </section>

        <section class="pt-4 border-t border-gray-100">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">2. Generación MP3 y Reproducción</h2>
          <AudioPlayer :text="text" @error="(msg) => showNotification(msg, 'error')" />
        </section>
      </main>

      <footer class="text-center text-sm text-gray-400 pb-10">
        Versión Serverless: Ejecutando 100% en tu navegador (PDF.js + Web Speech API).
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next';
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
  showNotification('¡Archivo procesado exitosamente!', 'info');
};
</script>
