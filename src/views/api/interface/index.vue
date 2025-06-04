<template>
  <div class="interface-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="接口名称">
          <el-input v-model="searchForm.name" placeholder="请输入接口名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="接口路径">
          <el-input v-model="searchForm.url" placeholder="请输入接口路径" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="请求方法">
          <el-select v-model="searchForm.method" placeholder="请选择请求方法" clearable style="width: 200px">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
            <el-option label="HEAD" value="HEAD" />
            <el-option label="OPTIONS" value="OPTIONS" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
            <el-option label="关闭" :value="0" />
            <el-option label="开启" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="接口名称" min-width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="接口路径" min-width="150" show-overflow-tooltip />
        <el-table-column prop="method" label="请求方法" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getMethodTagType(row.method)"
              effect="plain"
            >
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="接口描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="handleView(row)"
            >
              详情
            </el-button>
            <el-dropdown @command="(command) => handleDropdownCommand(command, row)"
              style="margin-left: 8px;">
              <el-button type="primary" size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="row.status === 1"
                    command="offline"
                    :icon="ArrowDown"
                  >
                    下线
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-else
                    command="online"
                    :icon="ArrowUp"
                  >
                    上线
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" :icon="Delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 接口详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="接口详情"
      size="70%"
      :destroy-on-close="true"
      @close="closeDetailDrawer"
    >
      <InterfaceDetail :interface-id="selectedInterfaceId" />
    </el-drawer>

    <!-- 新增接口组件 -->
    <InterfaceAdd v-model="addDialogVisible" @success="handleAddSuccess" />


  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, ArrowUp, Search, Refresh, Plus, Delete, View } from '@element-plus/icons-vue'
import InterfaceDetail from '@/views/api/interface/InterfaceDetail.vue'
import InterfaceAdd from '@/views/api/interface/InterfaceAdd.vue'
import {
  queryInterfaceList,
  interfaceBan,
  interfaceNormal,
  interfaceDelete,
  interfaceOnline,
  interfaceOffline,
   type InterfaceInfo
} from '@/api/api/interface'

defineOptions({
  name: 'ApiInterface'
})

// 抽屉状态
const drawerVisible = ref(false)
const selectedInterfaceId = ref<string>()

// 关闭抽屉
const closeDetailDrawer = () => {
  drawerVisible.value = false
}

// 搜索表单
const searchForm = reactive({
  name: '',
  url: '',
  method: '',
  status: ''
})

// 表格数据
const tableData = ref<InterfaceInfo[]>([])
const tableLoading = ref(false)
const multipleSelection = ref<InterfaceInfo[]>([])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const addDialogVisible = ref(false)

// 获取接口列表
const getInterfaceList = async () => {
  tableLoading.value = true
  try {
    const res = await queryInterfaceList({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      param: {
        name: searchForm.name,
        url: searchForm.url,
        method: searchForm.method,
        status: searchForm.status
      }
    })
    if (res.status === 'success') {
      tableData.value = res.data.records
      total.value = Number(res.data.total)
    } else {
      ElMessage.error(res.message || '获取接口列表失败')
    }
  } catch (error) {
    console.error('获取接口列表出错:', error)
    ElMessage.error('获取接口列表出错')
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getInterfaceList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getInterfaceList()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getInterfaceList()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getInterfaceList()
}

// 表格选择改变
const handleSelectionChange = (val: InterfaceInfo[]) => {
  multipleSelection.value = val
}

// 查看接口详情
const handleView = (row: InterfaceInfo) => {
  selectedInterfaceId.value = row.id
  drawerVisible.value = true
}

// 新增接口
const handleAdd = () => {
  addDialogVisible.value = true
}

// 新增接口成功回调
const handleAddSuccess = () => {
  getInterfaceList()
}



// 处理下拉菜单命令
const handleDropdownCommand = (command: string, row: InterfaceInfo) => {
  switch (command) {
    case 'delete':
      handleDelete(row)
      break
    case 'ban':
      handleBan(row)
      break
    case 'normal':
      handleNormal(row)
      break
    case 'online':
      handleOnline(row)
      break
    case 'offline':
      handleOffline(row)
      break
    default:
      break
  }
}

// 禁用接口
const handleBan = (row: InterfaceInfo) => {
  ElMessageBox.confirm(`确定要禁用接口 ${row.name}?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await interfaceBan({ id: row.id })
      if (res.status === 'success') {
        ElMessage.success('禁用成功')
        getInterfaceList()
      } else {
        ElMessage.error(res.message || '禁用失败')
      }
    } catch (error) {
      console.error('禁用接口出错:', error)
      ElMessage.error('禁用接口出错')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 启用接口
const handleNormal = (row: InterfaceInfo) => {
  ElMessageBox.confirm(`确定要启用接口 ${row.name}?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await interfaceNormal({ id: row.id })
      if (res.status === 'success') {
        ElMessage.success('启用成功')
        getInterfaceList()
      } else {
        ElMessage.error(res.message || '启用失败')
      }
    } catch (error) {
      console.error('启用接口出错:', error)
      ElMessage.error('启用接口出错')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 上线接口
const handleOnline = (row: InterfaceInfo) => {
  ElMessageBox.confirm(`确定要上线接口 ${row.name}?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await interfaceOnline(row.id)
      if (res.status === 'success') {
        ElMessage.success('上线成功')
        getInterfaceList()
      } else {
        ElMessage.error(res.message || '上线失败')
      }
    } catch (error) {
      console.error('上线接口出错:', error)
      ElMessage.error('上线接口出错')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 下线接口
const handleOffline = (row: InterfaceInfo) => {
  ElMessageBox.confirm(`确定要下线接口 ${row.name}?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await interfaceOffline(row.id)
      if (res.status === 'success') {
        ElMessage.success('下线成功')
        getInterfaceList()
      } else {
        ElMessage.error(res.message || '下线失败')
      }
    } catch (error) {
      console.error('下线接口出错:', error)
      ElMessage.error('下线接口出错')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 删除接口
const handleDelete = (row: InterfaceInfo) => {
  ElMessageBox.confirm(`确定要删除接口 ${row.name}?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await interfaceDelete(row.id)
      if (res.status === 'success') {
        ElMessage.success('删除成功')
        getInterfaceList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除接口出错:', error)
      ElMessage.error('删除接口出错')
    }
  }).catch(() => {
    // 取消操作
  })
}





// 获取请求方法对应的标签类型
const getMethodTagType = (method: string) => {
  const methodMap: Record<string, string> = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info',
    'HEAD': '',
    'OPTIONS': ''
  }
  return methodMap[method] || ''
}

// 组件挂载时获取数据
onMounted(() => {
  getInterfaceList()
})
</script>

<style scoped>
.interface-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}
</style>