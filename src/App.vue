<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <Teleport to="body">
    <div class="toast-stack" v-if="toasts.length">
      <TransitionGroup name="slide">
        <div v-for="t in toasts" :key="t.id" :class="['toast-item', t.type]">{{ t.message }}</div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
</script>

<style>
body { margin: 0; }
</style>
