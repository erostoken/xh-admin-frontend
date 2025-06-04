<template>
  <el-dialog
    v-model="visible"
    title="新增接口"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="100px"
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
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
          <el-option label="PATCH" value="PATCH" />
          <el-option label="HEAD" value="HEAD" />
          <el-option label="OPTIONS" value="OPTIONS" />
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
      <el-form-item label="请求参数" prop="requestParams">
        <ParamsEditor v-model="form.requestParams" />
      </el-form-item>
      <el-form-item label="响应参数" prop="responseParams">
        <ParamsEditor v-model="form.responseParams" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import ParamsEditor from '@/views/api/interface/info/ParamsEditor.vue'
import { interfaceAdd } from '@/api/api/interface'
import type { ParamItem } from '@/api/api/interface'

// Props
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

// 响应式数据
const visible = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  name: '',
  url: '',
  method: 'GET',
  description: '',
  requestParams: [] as ParamItem[],
  responseParams: [] as ParamItem[]
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入接口名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入接口路径', trigger: 'blur' }
  ],
  method: [
    { required: true, message: '请选择请求方法', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入接口描述', trigger: 'blur' }
  ]
}

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  if (visible.value !== newValue) {
    visible.value = newValue
    if (newValue) {
      resetForm()
    }
  }
})

// 监听visible变化
watch(visible, (newValue) => {
  if (props.modelValue !== newValue) {
    emit('update:modelValue', newValue)
  }
})

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.name = ''
  form.url = ''
  form.method = 'GET'
  form.description = ''
  form.requestParams = []
  form.responseParams = []
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 处理请求参数和响应参数
        const params = {
          ...form,
          requestParams: form.requestParams || [],
          responseParams: form.responseParams || []
        }
        
        const res = await interfaceAdd(params)
        if (res.status === 'success') {
          ElMessage.success('新增成功')
          handleClose()
          emit('success')
        } else {
          ElMessage.error(res.message || '新增失败')
        }
      } catch (error) {
        console.error('新增接口出错:', error)
        ElMessage.error('新增接口出错')
      } finally {
        submitLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>