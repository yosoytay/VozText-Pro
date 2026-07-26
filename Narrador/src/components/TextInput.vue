<template>
  <div class="w-full space-y-2">
    <div class="flex items-center justify-between">
      <label for="text-input" class="block text-sm font-medium text-slate-300">
        O escribe / pega tu texto directamente:
      </label>
      <div class="flex items-center gap-3">
        <button
          v-if="modelValue.length > 0"
          @click="$emit('update:modelValue', '')"
          type="button"
          class="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-rose-950/40"
          title="Limpiar texto"
        >
          <Trash2 size="12" /> Limpiar
        </button>
        <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span class="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">{{ wordCount }} palabras</span>
          <span class="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">{{ modelValue.length }} caracteres</span>
        </div>
      </div>
    </div>
    <div class="relative group">
      <textarea
        id="text-input"
        rows="6"
        class="w-full p-4 bg-slate-950/60 text-slate-100 placeholder:text-slate-600 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/80 transition-all resize-none shadow-inner font-sans text-sm leading-relaxed"
        placeholder="Escribe o pega aquí el contenido que deseas convertir en voz..."
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Trash2 } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);

const wordCount = computed(() => {
  if (!props.modelValue.trim()) return 0;
  return props.modelValue.trim().split(/\s+/).length;
});
</script>

