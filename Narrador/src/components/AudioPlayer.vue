<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3 w-full sm:w-auto">
      <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <FileText size="24" />
      </div>
      <div>
        <h4 class="font-semibold text-gray-800">Motor TTS (Backend Local)</h4>
        <p class="text-xs text-gray-500" v-if="!audioUrl">Listo para convertir</p>
        <p class="text-xs text-blue-500" v-else>Audio generado exitosamente</p>
      </div>
    </div>

    <!-- Controles Nativo HTML Audio -->
    <div class="flex-grow max-w-md w-full" v-if="audioUrl">
      <audio controls :src="audioUrl" class="w-full h-10 outline-none"></audio>
    </div>

    <div class="flex items-center gap-2" v-if="!audioUrl">
      <button
        @click="generateAudio"
        :disabled="isLoading || text.length === 0"
        class="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md text-sm font-semibold"
      >
        <Loader2 v-if="isLoading" class="animate-spin text-white" size="18" />
        <Play size="18" v-else />
        <span>{{ isLoading ? 'Generando...' : 'Generar Audio MP3' }}</span>
      </button>
    </div>

    <div class="flex items-center gap-2" v-if="audioUrl">
      <a
        :href="audioUrl"
        download="voztext-audio.mp3"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm font-medium"
      >
        <Download size="16" />
        <span>MP3</span>
      </a>
      
      <button
        @click="resetAudio"
        class="p-2 ml-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        title="Crear nuevo audio"
      >
        <RotateCcw size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { FileText, Play, Download, Loader2, RotateCcw } from 'lucide-vue-next';
import axios from 'axios';

const props = defineProps({
  text: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['error']);

const isLoading = ref(false);
const audioUrl = ref(null);

watch(() => props.text, () => {
    resetAudio();
});

const resetAudio = () => {
    if(audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value);
        audioUrl.value = null;
    }
};

const generateAudio = async () => {
  if (!props.text.trim()) {
    emit('error', 'No hay texto para reproducir. Por favor, ingresa algún texto.');
    return;
  }

  isLoading.value = true;
  try {
    const response = await axios.post('/api/tts', { text: props.text }, {
      responseType: 'blob' 
    });
    
    // Crear URL object local a partir del blob de MP3 descagrado
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }));
    audioUrl.value = url;
  } catch (err) {
    let errorMessage = err.message;
    // Si la gTTS falla, el backend puede devolver JSON en vez de BLOB pero axios lo trata como Blob, intentamos decodearlo.
    if (err.response && err.response.data && err.response.data.text) {
         try {
            const errorObj = JSON.parse(await err.response.data.text());
            errorMessage = errorObj.error || errorMessage;
         } catch(e){}
    }
    emit('error', 'Error generando audio: ' + errorMessage);
  } finally {
    isLoading.value = false;
  }
};
</script>
