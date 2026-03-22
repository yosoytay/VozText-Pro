<template>
  <div
    class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
    :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'"
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
    <UploadCloud class="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 class="text-lg font-medium text-gray-900">Arrastra tu archivo aquí</h3>
    <p class="mt-1 text-sm text-gray-500">o haz clic para buscar (TXT, PDF)</p>
    <div v-if="isLoading" class="mt-4 flex items-center justify-center gap-2 text-blue-600">
      <Loader2 class="animate-spin" size="18" />
      <span class="text-sm">Procesando archivo...</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadCloud, Loader2 } from 'lucide-vue-next';
import * as pdfjsLib from 'pdfjs-dist';

// Configuración del worker de PDF.js para entorno Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
