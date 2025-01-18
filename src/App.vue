<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
onLaunch(() => {
  console.log('App Launch')
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style>
page {
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Icons',
    'Helvetica Neue', Helvetica, Arial, sans-serif;
  --primary-color: #0066cc;
  --danger-color: #ff3b30;
  --text-color: #1d1d1f;
  --secondary-text: #86868b;
  --border-color: #d2d2d7;
  --card-bg: rgba(255, 255, 255, 0.7);
}

.uni-page-head {
  display: none !important;
}

.uni-page-head-placeholder {
  display: none !important;
}

.uni-page-wrapper {
  height: 100% !important;
}

.uni-page-body {
  height: 100% !important;
  background: #f6f7fb;
}

button {
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  background: none;
}

button::after {
  border: none;
}
</style>
