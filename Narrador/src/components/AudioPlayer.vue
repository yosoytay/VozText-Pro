<template>
  <div class="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/90 backdrop-blur-md shadow-xl flex flex-col gap-6">
    <!-- Header info & Visualizer -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
      <div class="flex items-center gap-3.5 w-full sm:w-auto">
        <div class="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
          <Volume2 size="24" :class="{ 'animate-pulse text-indigo-300': isPlaying }" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-semibold text-slate-100 text-base">Motor TTS Nativo</h4>
            <span :class="[
              'inline-block w-2 h-2 rounded-full',
              isPlaying ? 'bg-emerald-400 animate-ping' : (isPaused ? 'bg-amber-400' : 'bg-slate-600')
            ]"></span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ isPlaying ? 'Reproduciendo narración...' : (isPaused ? 'Pausado' : 'Listo para sintetizar') }}
          </p>
        </div>
      </div>

      <!-- Animated Audio Wave visualizer -->
      <div class="flex items-end gap-1 h-6 px-4 py-1 rounded-xl bg-slate-900/80 border border-slate-800" title="Ecualizador de voz">
        <div :class="['w-1 rounded-full bg-indigo-500', isPlaying ? 'animate-wave-1' : 'h-1.5 opacity-30']"></div>
        <div :class="['w-1 rounded-full bg-purple-500', isPlaying ? 'animate-wave-2' : 'h-3 opacity-30']"></div>
        <div :class="['w-1 rounded-full bg-indigo-400', isPlaying ? 'animate-wave-3' : 'h-2 opacity-30']"></div>
        <div :class="['w-1 rounded-full bg-pink-500', isPlaying ? 'animate-wave-4' : 'h-4 opacity-30']"></div>
        <div :class="['w-1 rounded-full bg-violet-400', isPlaying ? 'animate-wave-5' : 'h-1.5 opacity-30']"></div>
      </div>
    </div>

    <!-- Controls Toolbar -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      
      <!-- Voice & Speed Selectors -->
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Voice dropdown -->
        <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 w-full sm:w-auto">
          <Mic size="14" class="text-indigo-400 shrink-0" />
          <select 
            v-model="selectedVoiceIndex" 
            class="bg-transparent text-slate-200 border-none outline-none focus:ring-0 text-xs w-full cursor-pointer"
            v-if="voices.length > 0"
          >
            <option v-for="(voice, index) in voices" :key="index" :value="index" class="bg-slate-900 text-slate-100">
              {{ voice.name }} ({{ voice.lang }})
            </option>
          </select>
          <span v-else class="text-slate-500">Buscando voces...</span>
        </div>

        <!-- Speed rate pills -->
        <div class="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <Gauge size="14" class="text-purple-400 ml-1.5 mr-1" />
          <button 
            v-for="rate in [0.75, 1, 1.25, 1.5, 2]" 
            :key="rate"
            @click="setPlaybackRate(rate)"
            :class="[
              'px-2 py-0.5 rounded-lg transition-all font-mono text-[11px]',
              playbackRate === rate 
                ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            ]"
          >
            {{ rate }}x
          </button>
        </div>
      </div>

      <!-- Action Playback Buttons -->
      <div class="flex items-center gap-3 self-end sm:self-auto">
        <button
          v-if="!isPlaying"
          @click="playVoice"
          :disabled="!text.trim()"
          class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
          title="Iniciar narración"
        >
          <Play size="18" class="fill-current" />
          <span class="text-sm font-semibold">{{ isPaused ? 'Reanudar' : 'Escuchar Audio' }}</span>
        </button>
        
        <button
          v-else
          @click="pauseVoice"
          class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-md font-medium text-sm"
          title="Pausar narración"
        >
          <Pause size="18" class="fill-current" />
          <span>Pausar</span>
        </button>

        <button
          @click="stopVoice"
          :disabled="!isPlaying && !isPaused"
          class="p-2.5 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Detener"
        >
          <Square size="18" class="fill-current" />
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Volume2, Play, Pause, Square, Mic, Gauge } from 'lucide-vue-next';

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
const playbackRate = ref(1);

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

const setPlaybackRate = (rate) => {
  playbackRate.value = rate;
  if (isPlaying.value || isPaused.value) {
    // Si ya se está reproduciendo, reiniciar con la nueva velocidad
    stopVoice();
    playVoice();
  }
};

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
  utterance.rate = playbackRate.value;
  
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

