<template>
  <div class="interface-edit">
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="120px"
      label-position="right"
    >
      <el-form-item label="接口名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入接口名称" />
      </el-form-item>
      
      <el-form-item label="接口路径" prop="url">
        <el-input v-model="form.url" placeholder="请输入接口路径" />
      </el-form-item>
      
      <el-form-item label="请求方法" prop="method">
        <el-select v-model="form.method" placeholder="请选择请求方法">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="接口描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入接口描述"
        />
      </el-form-item>
      
      <el-form-item label="接口状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">开启</el-radio>
          <el-radio :label="0">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="请求参数">
        <ParamsEditor v-model="requestParams" placeholder="请输入请求参数" />
      </el-form-item>
      
      <el-form-item label="响应参数">
        <ParamsEditor v-model="responseParams" placeholder="请输入响应参数" />
      </el-form-item>
    </el-form>
    
    <div class="form-actions">
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        保存修改
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import ParamsEditor from '@/views/api/interface/info/ParamsEditor.vue'
import type { InterfaceInfo, ParamItem } from '@/api/api/interface'
import { interfaceUpdate } from '@/api/api/interface'

// Props

const props = defineProps<{
  interfaceInfo: InterfaceInfo | null
}>()

const emit = defineEmits<{
  refresh: [data: InterfaceInfo]
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const requestParams = ref<ParamItem[]>([])
const responseParams = ref<ParamItem[]>([])

const form = reactive({
  id: '',
  name: '',
  url: '',
  method: 'GET',
  description: '',
  status: 0,
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入接口名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入接口路径', trigger: 'blur' },
    { pattern: /^\/.*/, message: '接口路径必须以 / 开头', trigger: 'blur' }
  ],
  method: [
    { required: true, message: '请选择请求方法', trigger: 'change' }
  ],

}

// 方法
const initForm = () => {
  if (props.interfaceInfo) {
    form.id = props.interfaceInfo.id || ''
    form.name = props.interfaceInfo.name || ''
    form.url = props.interfaceInfo.url || ''
    form.method = props.interfaceInfo.method || 'GET'
    form.description = props.interfaceInfo.description || ''
    form.status = props.interfaceInfo.status || 0
    
    // 处理请求参数
    if (props.interfaceInfo.requestParams) {
      try {
        const parsedParams = typeof props.interfaceInfo.requestParams === 'string'
          ? JSON.parse(props.interfaceInfo.requestParams)
          : props.interfaceInfo.requestParams
        
        if (Array.isArray(parsedParams)) {
          requestParams.value = parsedParams
        } else if (typeof parsedParams === 'object' && parsedParams !== null) {
          requestParams.value = Object.keys(parsedParams).map(key => ({
            name: key,
            type: typeof parsedParams[key] === 'string' ? parsedParams[key] : 'string',
            required: false,
            example: '',
            description: ''
          }))
        }
      } catch {
        requestParams.value = []
      }
    } else {
      requestParams.value = []
    }
    
    // 处理响应参数
    if (props.interfaceInfo.responseParams) {
      try {
        const parsedParams = typeof props.interfaceInfo.responseParams === 'string'
          ? JSON.parse(props.interfaceInfo.responseParams)
          : props.interfaceInfo.responseParams
        
        if (Array.isArray(parsedParams)) {
          responseParams.value = parsedParams
        } else if (typeof parsedParams === 'object' && parsedParams !== null) {
          responseParams.value = Object.keys(parsedParams).map(key => ({
            name: key,
            type: typeof parsedParams[key] === 'string' ? parsedParams[key] : 'string',
            required: false,
            example: '',
            description: ''
          }))
        }
      } catch {
        responseParams.value = []
      }
    } else {
      // 设置默认的响应参数
      responseParams.value = []
    }
  } else {
    // 新建接口时也设置默认响应参数
    responseParams.value = []
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  initForm()
}



const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    // 构建提交数据
    const submitData: InterfaceInfo = {
      id: form.id,
      name: form.name,
      url: form.url,
      method: form.method,
      description: form.description,
      status: form.status
    }
    
    // 处理参数
    if (requestParams.value.length > 0) {
      submitData.requestParams = requestParams.value.filter(param => param.fieldName && param.fieldName.trim())
    }
    
    if (responseParams.value.length > 0) {
      submitData.responseParams = responseParams.value.filter(param => param.fieldName && param.fieldName.trim())
    }
    
    // 调用接口更新API
    await interfaceUpdate(submitData)
    
    // 触发刷新事件，通知父组件刷新
    emit('refresh', submitData)
    
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 监听接口信息变化
watch(() => props.interfaceInfo, () => {
  initForm()
}, { immediate: true, deep: true })
</script>

<style scoped>
.interface-edit {
  padding: 0px;
}

.form-tip {
  margin-top: 0px;
}

.form-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}

.form-actions .el-button {
  margin-left: 12px;
}


</style>