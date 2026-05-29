<template>
  <div class="preview-container">
    <!-- Remount component via key to force initial state replay on reset -->
    <LoginLoadingScreen
      :key="previewKey"
      name="测试同学"
      avatar="🚀"
      :interests="['极客技术', '开源开发', '人工智能', '羽毛球', '科幻电影', '流行音乐']"
      @done="handleDone"
    />

    <!-- Floating Sandbox Controller -->
    <transition name="fade">
      <div class="sandbox-overlay" v-if="showDoneOverlay">
        <div class="sandbox-card">
          <h3>🎉 启动加载完成</h3>
          <p>（在此状态下，由于是沙盒环境，不会跳转页面，方便您继续调试）</p>
          <button class="sandbox-reset-btn" @click="resetPreview">
            🔄 重新跑一遍完整动画
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginLoadingScreen from '@/components/auth/LoginLoadingScreen.vue'

const showDoneOverlay = ref(false)
const previewKey = ref(0)

const handleDone = () => {
  showDoneOverlay.value = true
}

const resetPreview = () => {
  showDoneOverlay.value = false
  previewKey.value++
}
</script>

<style>
.preview-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #020617;
  overflow: hidden;
}
.sandbox-overlay {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  z-index: 300; /* above loading screen */
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.sandbox-card {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(6, 182, 212, 0.25);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.15);
  border-radius: 16px;
  padding: 24px 36px;
  text-align: center;
  max-width: 400px;
}
.sandbox-card h3 {
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 18px;
  font-family: 'Fira Code', monospace;
}
.sandbox-card p {
  margin: 0 0 20px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12.5px;
  line-height: 1.6;
}
.sandbox-reset-btn {
  background: rgba(253, 151, 31, 0.12);
  border: 1px solid rgba(253, 151, 31, 0.4);
  color: #ffb74d;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(253, 151, 31, 0.1);
  outline: none;
}
.sandbox-reset-btn:hover {
  transform: translateY(-2px);
  background-color: rgba(253, 151, 31, 0.2);
  border-color: rgba(253, 151, 31, 0.55);
  box-shadow: 0 6px 18px rgba(253, 151, 31, 0.2);
}

/* fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
