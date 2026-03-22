<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-2">
      <label for="text-input" class="block text-sm font-medium text-gray-700">
        O pega tu texto directamente:
      </label>
      <span class="text-xs text-gray-400">{{ modelValue.length }} caracteres</span>
    </div>
    <textarea
      id="text-input"
      rows="6"
      class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none shadow-sm"
      placeholder="Pega aquí el texto que deseas convertir a voz..."
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});
defineEmits(['update:modelValue']);
</script>
