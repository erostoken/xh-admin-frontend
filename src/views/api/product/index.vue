<template>
    <div class="product-management">
        <!-- 搜索区域 -->
        <el-card class="search-card">
            <el-form :inline="true" :model="searchForm">
                <el-form-item label="产品名称">
                    <el-input v-model="searchForm.name" placeholder="请输入产品名称" clearable  style="width: 200px" />
                </el-form-item>
                <el-form-item label="产品状态">
                    <el-select v-model="searchForm.status" placeholder="请选择产品状态" clearable style="width: 200px" >
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
                v-loading="loading"
                :data="tableData"
                border
                style="width: 100%"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" />
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="name" label="产品名称" min-width="120" />
                <el-table-column prop="description" label="产品描述" min-width="180" show-overflow-tooltip />
                <el-table-column prop="addPoints" label="产品积分" width="100" />
                <el-table-column prop="amount" label="产品金额" width="100">
                    <template #default="{ row }">
                        <span>{{ row.amount }} 元</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="产品状态" width="100">
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
                            @click="showProductDetail(row)"
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
                                    <el-dropdown-item command="edit" :icon="Edit">编辑</el-dropdown-item>
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
                    v-model:current-page="pagination.currentPage"
                    v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pagination.total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 产品详情抽屉 -->
        <el-drawer
            v-model="detailDrawerVisible"
            title="产品详情"
            size="30%"
            :destroy-on-close="true"
            @close="closeDetailDrawer"
        >
            <el-descriptions :column="1" border>
                <el-descriptions-item label="产品ID">{{ currentProductDetail?.id }}</el-descriptions-item>
                <el-descriptions-item label="产品名称">{{ currentProductDetail?.name }}</el-descriptions-item>
                <el-descriptions-item label="产品描述">{{ currentProductDetail?.description }}</el-descriptions-item>
                <el-descriptions-item label="产品积分">{{ currentProductDetail?.addPoints }}</el-descriptions-item>
                <el-descriptions-item label="产品金额">{{ currentProductDetail?.amount }} 元</el-descriptions-item>
                <el-descriptions-item label="产品状态">
                    <el-tag :type="currentProductDetail?.status === 1 ? 'success' : 'danger'">
                        {{ currentProductDetail?.status === 1 ? '开启' : '关闭' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ currentProductDetail?.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ currentProductDetail?.updateTime }}</el-descriptions-item>
            </el-descriptions>
        </el-drawer>

        <!-- 新增产品对话框 -->
        <el-dialog
            v-model="addDialogVisible"
            title="新增产品"
            width="500px"
            :destroy-on-close="true"
            @close="handleAddDialogClose"
        >
            <el-form
                ref="addProductFormRef"
                :model="addProductForm"
                :rules="productFormRules"
                label-width="100px"
            >
                <el-form-item label="产品名称" prop="name">
                    <el-input v-model="addProductForm.name" placeholder="请输入产品名称" />
                </el-form-item>
                <el-form-item label="产品描述" prop="description">
                    <el-input
                        v-model="addProductForm.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入产品描述"
                    />
                </el-form-item>
                <el-form-item label="产品积分" prop="addPoints">
                    <el-input-number
                        v-model="addProductForm.addPoints"
                        :min="1"
                        :precision="0"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="产品金额" prop="amount">
                    <el-input-number
                        v-model="addProductForm.amount"
                        :min="0"
                        :precision="2"
                        :step="0.01"
                        style="width: 100%"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleAddDialogClose">取消</el-button>
                    <el-button type="primary" @click="handleAddSubmit" :loading="submitLoading">
                        确定
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 编辑产品对话框 -->
        <el-dialog
            v-model="editDialogVisible"
            title="编辑产品"
            width="500px"
            :destroy-on-close="true"
            @close="handleEditDialogClose"
        >
            <el-form
                ref="editProductFormRef"
                :model="editProductForm"
                :rules="productFormRules"
                label-width="100px"
            >
                <el-form-item label="产品名称" prop="name">
                    <el-input v-model="editProductForm.name" placeholder="请输入产品名称" />
                </el-form-item>
                <el-form-item label="产品描述" prop="description">
                    <el-input
                        v-model="editProductForm.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入产品描述"
                    />
                </el-form-item>
                <el-form-item label="产品积分" prop="addPoints">
                    <el-input-number
                        v-model="editProductForm.addPoints"
                        :min="1"
                        :precision="0"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="产品金额" prop="amount">
                    <el-input-number
                        v-model="editProductForm.amount"
                        :min="0"
                        :precision="2"
                        :step="0.01"
                        style="width: 100%"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleEditDialogClose">取消</el-button>
                    <el-button type="primary" @click="handleEditSubmit" :loading="submitLoading">
                        确定
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { queryProductList, productAdd, productUpdate, productDelete, productGet, productBan, productNormal, productOnline, productOffline } from '@/api/api/product'
import type { PageQuery, MybatisPageResult } from '@i/utils/request'

// 抽屉状态
const detailDrawerVisible = ref(false)
const currentProductDetail = ref<ProductData>()

// 关闭抽屉
const closeDetailDrawer = () => {
    detailDrawerVisible.value = false
}

// 查看产品详情
const showProductDetail = async (row: ProductData) => {
    try {
        const res = await productGet(row.id as number)
        if (res.data) {
            currentProductDetail.value = res.data
            detailDrawerVisible.value = true
        }
    } catch (error) {
        ElMessage.error('获取产品详情失败')
        console.error('获取产品详情失败:', error)
    }
}

// 产品数据类型
interface ProductData {
    id?: number
    // 产品名称
    name: string
    // 产品描述
    description: string
    // 产品积分
    addPoints: number
    // 产品金额
    amount: number
    // 产品状态（0- 关闭 1- 开启）
    status: number
    createTime?: string
    updateTime?: string
}

// 搜索表单
const searchForm = reactive({
    name: '',
    status: undefined as number | undefined
})

// 表格数据
const tableData = ref<ProductData[]>([])
const loading = ref(false)
const selectedRows = ref<ProductData[]>([])

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 对话框相关
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const submitLoading = ref(false)
const addProductFormRef = ref<FormInstance>()
const editProductFormRef = ref<FormInstance>()

// 新增产品表单
const addProductForm = reactive({
    name: '',
    description: '',
    addPoints: 1,
    amount: 0
})

// 编辑产品表单
const editProductForm = reactive({
    id: undefined as number | undefined,
    name: '',
    description: '',
    addPoints: 1,
    amount: 0
})

// 表单验证规则
const productFormRules = {
    name: [
        { required: true, message: '请输入产品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '产品名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入产品描述', trigger: 'blur' },
        { min: 2, max: 200, message: '产品描述长度在 2 到 200 个字符', trigger: 'blur' }
    ],
    addPoints: [
        { required: true, message: '请输入产品积分', trigger: 'blur' },
        { type: 'number', min: 1, message: '产品积分必须大于0', trigger: 'blur' }
    ],
    amount: [
        { required: true, message: '请输入产品金额', trigger: 'blur' },
        { type: 'number', min: 0, message: '产品金额必须大于等于0', trigger: 'blur' }
    ]
}

// 获取产品列表
const getProductList = async () => {
    loading.value = true
    try {
        const params: PageQuery<any> = {
            isPage: true,
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            param: {
                name: searchForm.name || undefined,
                status: searchForm.status
            }
        }

        const response = await queryProductList(params)
        if (response.status === 'success' && response.data) {
            const result = response.data as MybatisPageResult<ProductData>
            tableData.value = result.records
            pagination.total =  Number(result.total)
        }
    } catch (error) {
        ElMessage.error('获取产品列表失败')
        console.error('获取产品列表失败:', error)
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    pagination.currentPage = 1
    getProductList()
}

// 重置搜索
const handleReset = () => {
    searchForm.name = ''
    searchForm.status = undefined
    pagination.currentPage = 1
    getProductList()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    getProductList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    getProductList()
}

// 表格选择改变
const handleSelectionChange = (selection: ProductData[]) => {
    selectedRows.value = selection
}

// 新增产品
const handleAdd = () => {
    resetAddProductForm()
    addDialogVisible.value = true
}

// 编辑产品
const handleEdit = (row: ProductData) => {
    Object.assign(editProductForm, row)
    editDialogVisible.value = true
}

// 重置新增产品表单
const resetAddProductForm = () => {
    addProductForm.name = ''
    addProductForm.description = ''
    addProductForm.addPoints = 1
    addProductForm.amount = 0
    nextTick(() => {
        addProductFormRef.value?.clearValidate()
    })
}

// 重置编辑产品表单
const resetEditProductForm = () => {
    editProductForm.id = undefined
    editProductForm.name = ''
    editProductForm.description = ''
    editProductForm.addPoints = 1
    editProductForm.amount = 0
    nextTick(() => {
        editProductFormRef.value?.clearValidate()
    })
}

// 处理下拉菜单命令
const handleDropdownCommand = (command: string, row: ProductData) => {
    switch (command) {
        case 'edit':
            handleEdit(row)
            break
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
    }
}

// 启用产品
const handleNormal = async (row: ProductData) => {
    try {
        await ElMessageBox.confirm(
            `确定要启用产品 "${row.name}" 吗？`,
            '启用确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        const response = await productNormal({ id: row.id as number })
        if (response.status === 'success') {
            ElMessage.success('启用成功')
            getProductList()
        } else {
            ElMessage.error(response.message || '启用失败')
        }
    } catch (error) {
        console.error('启用产品失败:', error)
    }
}

// 禁用产品
const handleBan = async (row: ProductData) => {
    try {
        await ElMessageBox.confirm(
            `确定要禁用产品 "${row.name}" 吗？`,
            '禁用确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        const response = await productBan({ id: row.id as number })
        if (response.status === 'success') {
            ElMessage.success('禁用成功')
            getProductList()
        } else {
            ElMessage.error(response.message || '禁用失败')
        }
    } catch (error) {
        console.error('禁用产品失败:', error)
    }
}

// 上线产品
const handleOnline = async (row: ProductData) => {
    try {
        await ElMessageBox.confirm(
            `确定要上线产品 "${row.name}" 吗？`,
            '上线确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        const response = await productOnline(row.id as number)
        if (response.status === 'success') {
            ElMessage.success('上线成功')
            getProductList()
        } else {
            ElMessage.error(response.message || '上线失败')
        }
    } catch (error) {
        console.error('上线产品失败:', error)
    }
}

// 下线产品
const handleOffline = async (row: ProductData) => {
    try {
        await ElMessageBox.confirm(
            `确定要下线产品 "${row.name}" 吗？`,
            '下线确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        const response = await productOffline(row.id as number)
        if (response.status === 'success') {
            ElMessage.success('下线成功')
            getProductList()
        } else {
            ElMessage.error(response.message || '下线失败')
        }
    } catch (error) {
        console.error('下线产品失败:', error)
    }
}

// 删除产品
const handleDelete = async (row: ProductData) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除产品 "${row.name}" 吗？`,
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        const response = await productDelete(row.id as number)
        if (response.status === 'success') {
            ElMessage.success('删除成功')
            getProductList()
        } else {
            ElMessage.error(response.message || '删除失败')
        }
    } catch (error) {
        console.error('删除产品失败:', error)
    }
}

// 关闭新增对话框
const handleAddDialogClose = () => {
    addDialogVisible.value = false
    resetAddProductForm()
}

// 关闭编辑对话框
const handleEditDialogClose = () => {
    editDialogVisible.value = false
    resetEditProductForm()
}

// 提交新增产品表单
const handleAddSubmit = async () => {
    if (!addProductFormRef.value) return

    try {
        await addProductFormRef.value.validate()
        submitLoading.value = true

        const response = await productAdd({
            name: addProductForm.name,
            description: addProductForm.description,
            addPoints: addProductForm.addPoints,
            amount: addProductForm.amount
        })

        if (response.status === 'success') {
            ElMessage.success('新增成功')
            addDialogVisible.value = false
            getProductList()
        } else {
            ElMessage.error(response.message || '新增失败')
        }
    } catch (error) {
        console.error('表单提交失败:', error)
        ElMessage.error('新增失败')
    } finally {
        submitLoading.value = false
    }
}

// 提交编辑产品表单
const handleEditSubmit = async () => {
    if (!editProductFormRef.value) return

    try {
        await editProductFormRef.value.validate()
        submitLoading.value = true

        const response = await productUpdate({
            id: editProductForm.id,
            name: editProductForm.name,
            description: editProductForm.description,
            addPoints: editProductForm.addPoints,
            amount: editProductForm.amount
        })

        if (response.status === 'success') {
            ElMessage.success('更新成功')
            editDialogVisible.value = false
            getProductList()
        } else {
            ElMessage.error(response.message || '更新失败')
        }
    } catch (error) {
        console.error('表单提交失败:', error)
        ElMessage.error('更新失败')
    } finally {
        submitLoading.value = false
    }
}

// 组件挂载时获取数据
onMounted(() => {
    getProductList()
})

// 组件选项（Vue 3.3+）
defineOptions({
    name: 'ApiProduct'
})
</script>

<style lang="scss" scoped>
.product-management {
    padding: 20px;

    .search-card {
        margin-bottom: 20px;

        :deep(.el-card__body) {
            padding: 20px;
        }
    }

    .table-card {
        :deep(.el-card__body) {
            padding: 20px;
        }
    }

    .pagination-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
}
</style>