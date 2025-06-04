<template>
  <div class="params-editor" :data-level="level">
    <div class="params-header" v-if="!readonly">
      <el-button type="primary" size="small" @click="addParam">
        <el-icon><Plus /></el-icon>
        添加参数
      </el-button>
      <el-button type="success" size="small" @click="showImportDialog">
        <el-icon><Upload /></el-icon>
        导入JSON
      </el-button>
    </div>
    
    <!-- 导入JSON弹窗 -->
    <el-dialog v-model="importDialogVisible" title="导入JSON" width="70%">
      <div class="import-json-content">
        <el-alert
          title="使用说明"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>请粘贴有效的JSON数据，系统将自动解析并生成参数结构。</p>
            <p>支持嵌套对象和数组，会自动推断字段类型。</p>
          </template>
        </el-alert>
        
        <div class="json-input-area">
          <el-input
            v-model="importJsonText"
            type="textarea"
            :rows="12"
            placeholder="请粘贴JSON数据，例如：&#10;{&#10;  &quot;name&quot;: &quot;张三&quot;,&#10;  &quot;age&quot;: 25,&#10;  &quot;isActive&quot;: true,&#10;  &quot;tags&quot;: [&quot;前端&quot;, &quot;Vue&quot;],&#10;  &quot;profile&quot;: {&#10;    &quot;email&quot;: &quot;zhangsan@example.com&quot;,&#10;    &quot;phone&quot;: &quot;13800138000&quot;&#10;  }&#10;}"
            @input="validateJson"
          />
        </div>
        
        <div v-if="jsonError" class="json-error">
          <el-alert
            :title="jsonError"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
        
        <div v-if="previewParams.length > 0" class="json-preview">
          <el-divider>预览生成的参数结构</el-divider>
          <div class="preview-container">
            <ParamsViewer :model-value="previewParams" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelImport">取消</el-button>
          <el-button type="primary" @click="confirmImport" :disabled="jsonError || previewParams.length === 0">
            确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <div class="params-table">
      <el-table :data="paramsList" border :show-header="!readonly">
        <el-table-column label="参数名" width="150">
          <template #default="{ row }">
            <el-input 
              v-if="!readonly" 
              v-model="row.fieldName" 
              placeholder="参数名" 
              size="small" 
            />
            <span v-else class="param-name">{{ row.fieldName }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-select 
              v-if="!readonly" 
              v-model="row.type" 
              placeholder="类型" 
              size="small"
              @change="handleTypeChange(row)"
            >
              <el-option label="string" value="string" />
              <el-option label="number" value="number" />
              <el-option label="boolean" value="boolean" />
              <el-option label="array" value="array" />
              <el-option label="object" value="object" />
            </el-select>
            <el-tag v-else :type="getTypeTagType(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="必填" width="80">
          <template #default="{ row }">
            <el-checkbox v-if="!readonly" v-model="row.required" />
            <el-tag v-else :type="row.required ? 'danger' : 'info'" size="small">
              {{ row.required ? '必填' : '可选' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="示例值" width="200">
          <template #default="{ row }">
            <!-- 普通类型 -->
            <el-input 
              v-if="!readonly && !['object', 'array'].includes(row.type)" 
              v-model="row.example" 
              placeholder="示例值" 
              size="small" 
            />
            <!-- object/array类型 -->
            <el-button 
              v-else-if="!readonly && ['object', 'array'].includes(row.type)"
              size="small"
              @click="toggleChildren(row)"
            >
              {{ row.showChildren ? '收起' : (row.type === 'object' ? '展开子属性' : '展开数组项') }}
            </el-button>
            <!-- 展示模式 -->
            <div v-else class="example-display">
              <el-tooltip v-if="['object', 'array'].includes(row.type)" :content="getChildrenPreview(row)">
                <el-tag size="small">{{ getComplexExamplePreview(row) }}</el-tag>
              </el-tooltip>
              <span v-else>{{ row.example }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="描述">
          <template #default="{ row }">
            <el-input 
              v-if="!readonly" 
              v-model="row.desc" 
              placeholder="参数描述" 
              size="small" 
            />
            <span v-else>{{ row.desc }}</span>
          </template>
        </el-table-column>
        
        <el-table-column v-if="!readonly" label="操作" width="80">
          <template #default="{ $index }">
            <el-button type="danger" size="small" @click="removeParam($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 内联嵌套参数展示 -->
      <div v-for="(param, index) in paramsList" :key="index" class="nested-params">
        <div v-if="param.showChildren && ['object', 'array'].includes(param.type || '')" class="nested-container">
          <div class="nested-header">
            <el-icon><ArrowRight /></el-icon>
            <span class="nested-title">{{ param.fieldName || '未命名' }} ({{ param.type || 'unknown' }}) 的子参数</span>
          </div>
          <div class="nested-content">
            <ParamsEditor 
              v-model="param.children!" 
              :readonly="readonly"
              :level="(level || 0) + 1"
            />
          </div>
        </div>
      </div>
    </div>
    

  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Plus, Delete, ArrowRight, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ParamItem } from '@/api/api/interface'
import ParamsViewer from './ParamsViewer.vue'

// Props
interface Props {
  modelValue: ParamItem[]
  readonly?: boolean
  placeholder?: string
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  placeholder: '',
  level: 0
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: ParamItem[]]
}>()

// 响应式数据
const paramsList = ref<ParamItem[]>([])

// 导入JSON相关
const importDialogVisible = ref(false)
const importJsonText = ref('')
const jsonError = ref('')
const previewParams = ref<ParamItem[]>([])



// 初始化数据
const initData = () => {
  try {
    if (props.modelValue && Array.isArray(props.modelValue)) {
      paramsList.value = props.modelValue.map(item => ({
        ...item,
        showChildren: item.showChildren || false,
        children: item.children ? item.children.map(child => ({
          ...child,
          showChildren: child.showChildren || false
        })) : []
      }))
    } else {
      paramsList.value = []
    }
  } catch (error) {
    console.error('ParamsEditor initData error:', error)
    paramsList.value = []
  }
}



// 监听props变化
watch(() => props.modelValue, (newValue) => {
  try {
    // 避免循环更新：只有当新值与当前值不同时才更新
    if (JSON.stringify(newValue) !== JSON.stringify(paramsList.value)) {
      initData()
    }
  } catch (error) {
    console.error('ParamsEditor initData error:', error)
    paramsList.value = []
  }
}, { immediate: true })

// 监听参数列表变化
watch(paramsList, (newValue) => {
  try {
    // 避免循环更新：只有当新值与props不同时才emit
    if (JSON.stringify(newValue) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', newValue)
    }
  } catch (error) {
    console.error('ParamsEditor paramsList watch error:', error)
  }
}, { deep: true })

// 添加参数
const addParam = () => {
  paramsList.value.push({
    fieldName: '',
    type: 'string',
    required: false,
    example: '',
    desc: '',
    children: [],
    showChildren: false
  })
}

// 删除参数
const removeParam = (index: number) => {
  paramsList.value.splice(index, 1)
}



// 处理类型变化
const handleTypeChange = (row: ParamItem) => {
  // 当类型改变时，清空示例值和子参数
  if (['object', 'array'].includes(row.type || '')) {
    row.example = ''
    if (!row.children) {
      row.children = []
    }
    row.showChildren = false
  } else {
    row.example = ''
    row.children = []
    row.showChildren = false
  }
}

// 切换子参数展示（手风琴效果）
const toggleChildren = (row: ParamItem) => {
  // 如果当前行已经展开，则收起
  if (row.showChildren) {
    row.showChildren = false
    return
  }
  
  // 先收起所有其他展开的子参数
  paramsList.value.forEach(param => {
    if (param !== row) {
      param.showChildren = false
    }
  })
  
  // 初始化当前行的子参数
  if (!row.children) {
    row.children = []
    // 为数组类型初始化一个默认的子项结构
    if (row.type === 'array') {
      row.children.push({
        fieldName: 'item',
        type: 'string',
        required: false,
        example: '',
        desc: '数组元素',
        children: [],
        showChildren: false
      })
    }
  }
  
  // 展开当前行
  row.showChildren = true
}

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



// 获取复杂示例预览
const getComplexExamplePreview = (param: ParamItem) => {
  if (param.type === 'array') {
    const childrenCount = param.children ? param.children.length : 0
    return `数组[${childrenCount > 0 ? '已定义结构' : '未定义'}]`
  } else if (param.type === 'object') {
    const childrenCount = param.children ? param.children.length : 0
    return `对象{${childrenCount}个属性}`
  }
  return param.example || ''
}

// 获取子参数预览
const getChildrenPreview = (param: ParamItem) => {
  if (!param.children || param.children.length === 0) {
    return '暂无子参数定义'
  }
  
  const preview = param.children.map(child => 
    `${child.fieldName}: ${child.type}${child.required ? ' (必填)' : ''}`
  ).join('\n')
  
  return preview
}

// 显示导入JSON弹窗
const showImportDialog = () => {
  importDialogVisible.value = true
  importJsonText.value = ''
  jsonError.value = ''
  previewParams.value = []
}

// 取消导入
const cancelImport = () => {
  importDialogVisible.value = false
  importJsonText.value = ''
  jsonError.value = ''
  previewParams.value = []
}

// 验证JSON格式
const validateJson = () => {
  jsonError.value = ''
  previewParams.value = []
  
  if (!importJsonText.value.trim()) {
    return
  }
  
  try {
    const jsonData = JSON.parse(importJsonText.value)
    if (typeof jsonData !== 'object' || jsonData === null) {
      jsonError.value = 'JSON数据必须是一个对象'
      return
    }
    
    // 生成预览参数
    previewParams.value = parseJsonToParams(jsonData)
  } catch (error) {
    jsonError.value = 'JSON格式不正确，请检查语法'
    console.error('JSON解析错误:', error)
  }
}

// 解析JSON为参数结构
const parseJsonToParams = (obj: any, prefix = ''): ParamItem[] => {
  const params: ParamItem[] = []
  
  for (const [key, value] of Object.entries(obj)) {
    const fieldName = prefix ? `${prefix}.${key}` : key
    const param: ParamItem = {
      fieldName: key,
      type: getValueType(value),
      required: false,
      example: getExampleValue(value),
      desc: '',
      children: [],
      showChildren: false
    }
    
    // 处理嵌套对象
    if (param.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
      param.children = parseJsonToParams(value, fieldName)
    }
    
    // 处理数组
    if (param.type === 'array' && Array.isArray(value) && value.length > 0) {
      const firstItem = value[0]
      if (typeof firstItem === 'object' && firstItem !== null) {
        param.children = parseJsonToParams(firstItem, `${fieldName}[0]`)
      } else {
        param.children = [{
          fieldName: 'item',
          type: getValueType(firstItem),
          required: false,
          example: String(firstItem),
          desc: '',
          children: [],
          showChildren: false
        }]
      }
    }
    
    params.push(param)
  }
  
  return params
}

// 获取值的类型
const getValueType = (value: any): string => {
  if (value === null || value === undefined) {
    return 'string'
  }
  
  if (Array.isArray(value)) {
    return 'array'
  }
  
  if (typeof value === 'object') {
    return 'object'
  }
  
  if (typeof value === 'boolean') {
    return 'boolean'
  }
  
  if (typeof value === 'number') {
    return 'number'
  }
  
  return 'string'
}

// 获取示例值
const getExampleValue = (value: any): string => {
  if (value === null || value === undefined) {
    return ''
  }
  
  if (Array.isArray(value)) {
    return `[${value.length}个元素]`
  }
  
  if (typeof value === 'object') {
    return `{${Object.keys(value).length}个属性}`
  }
  
  return String(value)
}

// 确认导入
const confirmImport = () => {
  if (previewParams.value.length === 0) {
    ElMessage.warning('没有可导入的参数')
    return
  }
  
  // 询问是否替换现有参数
  if (paramsList.value.length > 0) {
    ElMessageBox.confirm(
      '导入JSON将替换当前所有参数，是否继续？',
      '确认导入',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      paramsList.value = [...previewParams.value]
      importDialogVisible.value = false
      ElMessage.success(`成功导入 ${previewParams.value.length} 个参数`)
    }).catch(() => {
      // 用户取消
    })
  } else {
    paramsList.value = [...previewParams.value]
    importDialogVisible.value = false
    ElMessage.success(`成功导入 ${previewParams.value.length} 个参数`)
  }
}
</script>

<style scoped>
.params-editor {
  width: 100%;
}

.params-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.params-table {
  border-radius: 4px;
  overflow: hidden;
}

.nested-params {
  margin-top: 16px;
}

.nested-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}

.nested-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  font-size: 13px;
  color: #606266;
}

.nested-header .el-icon {
  margin-right: 6px;
  color: #909399;
}

.nested-title {
  font-weight: 500;
}

.nested-content {
  padding: 12px;
}



.param-name {
  font-weight: 500;
  color: #303133;
}

.example-display {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-input__inner) {
  font-size: 12px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

/* 根据层级调整样式 */
.params-editor[data-level="1"] :deep(.el-table) {
  font-size: 12px;
}

.params-editor[data-level="2"] :deep(.el-table) {
  font-size: 11px;
}

.params-editor[data-level="1"] .nested-container {
  border-color: #d3d4d6;
}

.params-editor[data-level="2"] .nested-container {
  border-color: #e4e7ed;
  background-color: #f9f9f9;
}

/* 导入JSON样式 */
.import-json-content {
  padding: 0;
}

.json-input-area {
  margin: 16px 0;
}

.json-error {
  margin: 12px 0;
}

.json-preview {
  margin-top: 16px;
}

.preview-container {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>