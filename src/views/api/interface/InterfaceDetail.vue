<template>
  <div class="interface-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>
    
    <!-- 无数据状态 -->
    <div v-else-if="!interfaceInfo" class="empty-container">
      <el-empty description="暂无接口信息" />
    </div>
    
    <!-- 主要Tab切换 -->
    <el-tabs v-else v-model="activeMainTab" class="main-tabs">
      <!-- 接口信息 -->
      <el-tab-pane name="info">
        <template #label>
          <span class="tab-label">
            <el-icon class="tab-icon"><Document /></el-icon>
            <span class="tab-text">接口详情</span>
          </span>
        </template>
        <InterfaceShow :interface-info="interfaceInfo" />
      </el-tab-pane>

      <!-- 修改接口 -->
      <el-tab-pane name="edit">
        <template #label>
          <span class="tab-label">
            <el-icon class="tab-icon"><Edit /></el-icon>
            <span class="tab-text">编辑接口</span>
          </span>
        </template>
        <InterfaceEdit :interface-info="interfaceInfo" @refresh="handleRefresh" />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Edit } from '@element-plus/icons-vue'
import InterfaceShow from '@/views/api/interface/info/InterfaceShow.vue'
import InterfaceEdit from '@/views/api/interface/info/InterfaceEdit.vue'
import { interfaceGet, type InterfaceInfo } from '@/api/api/interface'

// 接口信息类型

const props = defineProps<{
  interfaceId?: string 
}>()

// 响应式数据
const interfaceInfo = ref<InterfaceInfo | null>(null)
const loading = ref(false)

const activeMainTab = ref('info')

// 获取接口详情
const getInterfaceDetail = async () => {
  if (!props.interfaceId) {
    interfaceInfo.value = null
    return
  }
  
  loading.value = true
  try {
    const res = await interfaceGet(props.interfaceId)
     if (res.status === 'success') {
       interfaceInfo.value = res.data
       // 处理请求参数和响应参数的显示
       if (interfaceInfo.value && typeof interfaceInfo.value.requestParams === 'string' && interfaceInfo.value.requestParams) {
         try {
           interfaceInfo.value.requestParams = JSON.parse(interfaceInfo.value.requestParams)
         } catch {
           // 如果解析失败，保持原样
         }
       }
       if (interfaceInfo.value && typeof interfaceInfo.value.responseParams === 'string' && interfaceInfo.value.responseParams) {
         try {
           interfaceInfo.value.responseParams = JSON.parse(interfaceInfo.value.responseParams)
         } catch {
           // 如果解析失败，保持原样
         }
       }
    } else {
      ElMessage.error(res.message || '获取接口详情失败')
      interfaceInfo.value = null
    }
  } catch (error) {
    console.error('获取接口详情出错:', error)
    ElMessage.error('获取接口详情出错')
    interfaceInfo.value = null
  } finally {
    loading.value = false
  }
}

// 监听接口ID变化
watch(() => props.interfaceId, () => {
  getInterfaceDetail()
}, { immediate: true })

// 方法
const handleRefresh = (updatedInterface: InterfaceInfo) => {
  // 处理刷新逻辑
  console.log('刷新接口信息:', updatedInterface)
  // 重新获取接口详情以更新显示
  getInterfaceDetail()
}
</script>

<style scoped>
.interface-detail {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.loading-container {
  padding: 20px;
}

.empty-container {
  padding: 10px 10px;
  text-align: center;
}

.main-tabs {
  margin-top: 8px;
}

:deep(.el-tabs__header) {
  margin: 0 0 16px 0;
  border-bottom: 2px solid #f0f2f5;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__item) {
  padding: 0 24px;
  height: 44px;
  line-height: 44px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border: none;
  border-radius: 6px 6px 0 0;
  margin-right: 4px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-tabs__item:hover) {
  color: #409eff;
  background-color: #f8faff;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
  background-color: #fff;
  border-bottom: 2px solid #409eff;
  font-weight: 600;
}

:deep(.el-tabs__item.is-active::before) {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #409eff 0%, #66b3ff 100%);
  border-radius: 1px;
}

:deep(.el-tabs__content) {
  padding-top: 12px;
  min-height: 400px;
}

:deep(.el-tabs__nav) {
  border: none;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-icon {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.tab-text {
  font-size: 14px;
  white-space: nowrap;
}

:deep(.el-tabs__item:hover .tab-icon) {
  transform: scale(1.1);
}

:deep(.el-tabs__item.is-active .tab-icon) {
  color: #409eff;
  transform: scale(1.1);
}

:deep(.el-tabs__item.is-active .tab-text) {
  color: #409eff;
}
</style>