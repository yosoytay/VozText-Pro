<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3 w-full sm:w-auto">
      <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <FileText size="24" />
      </div>
      <div>
        <h4 class="font-semibold text-gray-800">Motor TTS (Nativo)</h4>
        <p class="text-xs text-gray-500">{{ isPlaying ? 'Reproduciendo...' : (isPaused ? 'Pausado' : 'Listo para leer') }}</p>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <!-- Selector de voces -->
      <select 
        v-model="selectedVoiceIndex" 
        class="text-xs border rounded p-1 bg-gray-50 max-w-[150px]"
        v-if="voices.length > 0"
      >
        <option v-for="(voice, index) in voices" :key="index" :value="index">
          {{ voice.name }} ({{ voice.lang }})
        </option>
      </select>

      <div class="flex items-center gap-2">
        <button
          v-if="!isPlaying"
          @click="playVoice"
          :disabled="!text.trim()"
          class="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
          title="Reproducir"
        >
          <Play size="20" class="ml-1" />
        </button>
        
        <button
          v-else
          @click="pauseVoice"
          class="p-3 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md"
          title="Pausar"
        >
          <Pause size="20" />
        </button>

        <button
          @click="stopVoice"
          :disabled="!isPlaying && !isPaused"
          class="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors"
          title="Detener"
        >
          <Square size="20" fill="currentColor" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { FileText, Play, Pause, Square } from 'lucide-vue-next';

const props = defineProps({
  text: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['error']);

const isPlaying = ref(false);
const isPaused = ref(false);
const voices = ref([]);
const selectedVoiceIndex = ref(0);

const synth = window.speechSynthesis;
let utterance = null;

const loadVoices = () => {
  const allVoices = synth.getVoices();
  // Filtrar solo voces en español por defecto
  const spanishVoices = allVoices.filter(v => v.lang.startsWith('es'));
  voices.value = spanishVoices.length > 0 ? spanishVoices : allVoices;
  
  // Buscar una voz de Google o Microsoft en español como predeterminada
  const preferred = voices.value.findIndex(v => v.name.includes('Google') || v.name.includes('Microsoft'));
  if (preferred !== -1) selectedVoiceIndex.value = preferred;
};

onMounted(() => {
  loadVoices();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }
});

onUnmounted(() => {
  synth.cancel();
});

watch(() => props.text, () => {
    stopVoice();
});

const playVoice = () => {
  if (isPaused.value) {
    synth.resume();
    isPlaying.value = true;
    isPaused.value = false;
    return;
  }

  if (!props.text.trim()) return;

  synth.cancel();
  utterance = new SpeechSynthesisUtterance(props.text);
  
  if (voices.value[selectedVoiceIndex.value]) {
    utterance.voice = voices.value[selectedVoiceIndex.value];
  }

  utterance.onstart = () => {
    isPlaying.value = true;
    isPaused.value = false;
  };
  
  utterance.onend = () => {
    isPlaying.value = false;
    isPaused.value = false;
  };

  utterance.onerror = (e) => {
    console.error(e);
    emit('error', 'Error en la síntesis de voz del navegador.');
    isPlaying.value = false;
  };

  synth.speak(utterance);
};

const pauseVoice = () => {
  if (isPlaying.value) {
    synth.pause();
    isPlaying.value = false;
    isPaused.value = true;
  }
};

const stopVoice = () => {
  synth.cancel();
  isPlaying.value = false;
  isPaused.value = false;
};
</script>
