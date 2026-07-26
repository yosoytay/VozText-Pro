<template>
  <div
    class="relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-300 cursor-pointer group backdrop-blur-sm"
    :class="[
      isDragging 
        ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01] shadow-xl shadow-indigo-500/10' 
        : 'border-slate-800/90 hover:border-indigo-500/50 bg-slate-950/40 hover:bg-slate-900/60'
    ]"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept=".txt,.pdf"
      @change="handleFileInput"
    />
    
    <div class="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
      <UploadCloud class="w-8 h-8" />
    </div>

    <h3 class="text-base font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
      Arrastra y suelta tu archivo aquí
    </h3>
    <p class="mt-1 text-sm text-slate-400">
      o <span class="text-indigo-400 font-medium underline underline-offset-4 hover:text-indigo-300">haz clic para explorar</span> en tu equipo
    </p>

    <div class="mt-4 flex items-center justify-center gap-2">
      <span class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60">PDF</span>
      <span class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60">TXT</span>
    </div>

    <div v-if="isLoading" class="mt-5 flex items-center justify-center gap-2 text-indigo-400 font-medium">
      <Loader2 class="animate-spin" size="18" />
      <span class="text-xs tracking-wide">Extrayendo texto del documento...</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadCloud, Loader2 } from 'lucide-vue-next';
import * as pdfjsLib from 'pdfjs-dist';

// Configuración del worker de PDF.js importado directamente para que Vite lo procese
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const emit = defineEmits(['textExtracted', 'error']);

const isDragging = ref(false);
const isLoading = ref(false);
const fileInput = ref(null);

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const processFile = async (file) => {
  if (!file) return;

  const validTypes = ['text/plain', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    emit('error', 'Por favor, sube un archivo TXT o PDF válido.');
    return;
  }

  isLoading.value = true;
  try {
    if (file.type === 'text/plain') {
      const text = await file.text();
      emit('textExtracted', text);
    } else if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      if (!fullText.trim()) throw new Error('No se pudo extraer texto del PDF.');
      emit('textExtracted', fullText.trim());
    }
  } catch (err) {
    emit('error', 'Error al procesar el archivo: ' + err.message);
  } finally {
    isLoading.value = false;
  }
};

const handleDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  processFile(file);
};

const handleFileInput = (e) => {
  const file = e.target.files[0];
  processFile(file);
  if (fileInput.value) fileInput.value.value = '';
};
</script>

