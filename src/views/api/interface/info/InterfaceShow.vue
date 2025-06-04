<template>
  <div class="interface-info">
    <!-- 接口基本信息 -->
    <div class="interface-header">
      <div class="interface-title">
        <el-tag :type="getMethodTagType(interfaceInfo?.method)" class="method-tag">
          {{ interfaceInfo?.method }}
        </el-tag>
        <span class="interface-name">{{ interfaceInfo?.name }}</span>
        <el-tag v-if="interfaceInfo?.status === 1" type="success" size="small">开启</el-tag>
        <el-tag v-else type="info" size="small">关闭</el-tag>
      </div>
      <div class="interface-url">
        <span class="url-text">{{ interfaceInfo?.url }}</span>
      </div>
      <div class="interface-meta">
        <span>创建时间：{{ interfaceInfo?.createTime }}</span>
        <span>修改时间：{{ interfaceInfo?.updateTime }}</span>
      </div>
    </div>

    <!-- 接口详细信息 -->
    <div class="interface-details">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="接口名称">{{ interfaceInfo?.name }}</el-descriptions-item>
        <el-descriptions-item label="接口路径">{{ interfaceInfo?.url }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">
          <el-tag :type="getMethodTagType(interfaceInfo?.method)" effect="plain">
            {{ interfaceInfo?.method }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="接口描述">{{ interfaceInfo?.description || '暂无描述' }}</el-descriptions-item>
        <el-descriptions-item label="请求参数">
          <div class="params-content">
            <ParamsViewer v-if="interfaceInfo?.requestParams" :model-value="interfaceInfo.requestParams" />
            <span v-else class="no-data">暂无参数</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="响应参数">
          <div class="params-content">
            <ParamsViewer v-if="interfaceInfo?.responseParams" :model-value="interfaceInfo.responseParams" />
            <span v-else class="no-data">暂无参数</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { InterfaceInfo } from '@/api/api/interface'
import ParamsViewer from '@/views/api/interface/info/ParamsViewer.vue'

// Props
defineProps<{
  interfaceInfo: InterfaceInfo | null
}>()

// 计算属性
const getMethodTagType = (method?: string) => {
  const methodTypes: Record<string, string> = {
    GET: 'success',
    POST: 'warning',
    PUT: 'primary',
    DELETE: 'danger',
    PATCH: 'info',
    HEAD: '',
    OPTIONS: ''
  }
  return methodTypes[method || 'GET'] || ''
}


</script>

<style scoped>
.interface-info {
  padding: 0px;
}

.interface-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.interface-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.method-tag {
  font-weight: bold;
  font-size: 12px;
  padding: 4px 8px;
}

.interface-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.interface-url {
  margin-bottom: 12px;
}

.url-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
}

.interface-meta {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: #909399;
}

.interface-details {
  margin-top: 20px;
}

.params-content {
  max-height: 400px;
  max-width: 100%;
  overflow-y: auto;
}

.no-data {
  color: #909399;
  font-style: italic;
}
</style>