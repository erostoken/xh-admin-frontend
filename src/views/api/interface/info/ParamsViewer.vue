<template>
  <div class="params-viewer">
    <div class="params-table">
      <el-table :data="paramsList" border row-key="fieldName">
        <el-table-column label="操作" width="60"/>

        <el-table-column label="参数名" width="200">
          <template #default="{ row }">
            <div class="param-name-container">
              <span class="param-name" :class="{ 'has-children': ['object', 'array'].includes(row.type) && hasChildren(row) }">
                {{ row.fieldName }}
              </span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="必填" width="80">
          <template #default="{ row }">
            <el-tag :type="row.required ? 'danger' : 'info'" size="small">
              {{ row.required ? '必填' : '可选' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="示例值" width="200">
          <template #default="{ row }">
            <!-- 普通类型 -->
            <div 
              v-if="!['object', 'array'].includes(row.type)" 
              class="example-value"
              :class="getExampleValueClass(row.type)"
            >
              <span v-if="row.example" class="example-text">{{ formatExampleValue(row.example, row.type) }}</span>
              <span v-else class="example-placeholder">暂无示例</span>
            </div>
            <!-- object/array类型 -->
            <div 
              v-else 
              class="example-value complex-type"
            >
              <el-tag size="small" type="info" effect="plain">
                {{ row.type === 'object' ? '{ Object }' : '[ Array ]' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="描述">
          <template #default="{ row }">
            <span>{{ row.desc }}</span>
          </template>
        </el-table-column>
      </el-table>
      
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { ParamItem } from '@/api/api/interface'

// Props
interface Props {
  modelValue: ParamItem[] | string
}

const props = defineProps<Props>()

// 响应式数据
const expandedRows = ref<Set<string>>(new Set())

// 计算属性
const paramsList = computed(() => {
  let result: ParamItem[] = []
  
  if (typeof props.modelValue === 'string') {
    try {
      const parsed = JSON.parse(props.modelValue)
      if (Array.isArray(parsed)) {
        result = parsed
      } else if (typeof parsed === 'object' && parsed !== null) {
        result = Object.keys(parsed).map(key => ({
          fieldName: key,
          type: typeof parsed[key] === 'string' ? parsed[key] : 'string',
          required: false,
          example: '',
          desc: ''
        }))
      }
    } catch {
      result = []
    }
  } else if (Array.isArray(props.modelValue)) {
    result = props.modelValue
  }
  
  // 为每个参数添加展开状态
  return result.map(param => ({
    ...param,
    showChildren: expandedRows.value.has(param.fieldName || '')
  }))
})



// 获取类型标签类型
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    string: 'primary',
    number: 'success',
    boolean: 'warning',
    array: 'info',
    object: 'danger'
  }
  return typeMap[type] || 'primary'
}

// 检查是否有子参数
const hasChildren = (param: ParamItem) => {
  if (!['object', 'array'].includes(param.type || '')) return false
  
  try {
    const parsed = JSON.parse(param.example || '{}')
    if (Array.isArray(parsed)) {
      return parsed.length > 0
    } else if (typeof parsed === 'object' && parsed !== null) {
      return Object.keys(parsed).length > 0
    }
  } catch {
    // 如果example不是有效JSON，检查是否有children属性
    return !!(param as any).children && Array.isArray((param as any).children) && (param as any).children.length > 0
  }
  return false
}

// 格式化示例值
const formatExampleValue = (example: string, type: string) => {
  if (!example) return ''
  
  // 根据类型格式化显示
  switch (type) {
    case 'string':
      return `"${example}"`
    case 'number':
      return example
    case 'boolean':
      return example.toLowerCase() === 'true' ? 'true' : 'false'
    default:
      return example
  }
}

// 获取示例值样式类
const getExampleValueClass = (type: string) => {
  return {
    'example-string': type === 'string',
    'example-number': ['number'].includes(type),
    'example-boolean': type === 'boolean'
  }
}
</script>

<style scoped>
.params-viewer {
  width: 100%;
}

.params-table {
  border-radius: 4px;
  overflow: hidden;
}



.param-name {
  font-weight: 500;
  color: #303133;
}

.param-name-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.expand-btn {
  padding: 0;
  width: 16px;
  height: 16px;
  min-height: 16px;
  border: none;
  background: none;
}

.param-name.has-children {
  cursor: pointer;
  color: #409eff;
}

.param-name.has-children:hover {
  text-decoration: underline;
}

.clickable-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.example-display {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 示例值样式 */
.example-value {
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.4;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.example-text {
  color: #495057;
}

.example-placeholder {
  color: #adb5bd;
  font-style: italic;
}

/* 不同类型的示例值颜色 */
.example-value.example-string {
  background-color: #e8f5e8;
  border-color: #c3e6c3;
}

.example-value.example-string .example-text {
  color: #155724;
}

.example-value.example-number {
  background-color: #e3f2fd;
  border-color: #bbdefb;
}

.example-value.example-number .example-text {
  color: #0d47a1;
}

.example-value.example-boolean {
  background-color: #fff3cd;
  border-color: #ffeaa7;
}

.example-value.example-boolean .example-text {
  color: #856404;
}

.example-value.complex-type {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nested-params {
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.nested-header {
  margin-bottom: 12px;
}

.nested-title {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
}

:deep(.el-table td) {
  padding: 8px 0;
}


</style>