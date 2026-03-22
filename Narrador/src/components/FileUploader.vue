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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadCloud } from 'lucide-vue-next';
import axios from 'axios';

const emit = defineEmits(['textExtracted', 'error']);

const isDragging = ref(false);
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

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/extract-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    emit('textExtracted', response.data.text);
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    emit('error', 'Error al procesar el archivo: ' + errorMsg);
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
  // Reset input after processing
  if (fileInput.value) fileInput.value.value = '';
};
</script>
