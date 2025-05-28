<template>
    <div class="user-management" v-click-outside="closeDetailDrawer">
        <!-- 搜索区域 -->
        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" :inline="true" label-width="80px">
                <el-form-item label="用户昵称">
                    <el-input v-model="searchForm.userName" placeholder="请输入用户昵称" clearable style="width: 200px" />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable style="width: 200px" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch" :icon="Search">
                        搜索
                    </el-button>
                    <el-button @click="handleReset" :icon="Refresh">
                        重置
                    </el-button>
                    <el-button type="success" @click="handleAdd" :icon="Plus">
                        新增用户
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 表格区域 -->
        <el-card class="table-card" shadow="never">
            <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="userName" label="用户昵称" min-width="120" />
                <el-table-column prop="email" label="邮箱" min-width="180" />
                <el-table-column prop="userAccount" label="用户账号" min-width="120" />
                <el-table-column prop="invitationCode" label="邀请码" min-width="120" />
                <el-table-column prop="status" label="账号状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 0 ? 'success' : 'danger'">
                            {{ row.status === 0 ? '正常' : '封号' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="balance" label="钱包余额(分)" width="120">
                    <template #default="{ row }">
                        {{ row.balance }}
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button type="info" size="small" @click="showUserDetail(row)" :icon="View">
                            详情
                        </el-button>
                        <el-dropdown @command="(command) => handleDropdownCommand(command, row)"
                            style="margin-left: 8px;">
                            <el-button size="small" type="primary">
                                更多
                                <el-icon class="el-icon--right">
                                    <arrow-down />
                                </el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="edit" :icon="Edit">编辑</el-dropdown-item>
                                    <el-dropdown-item command="delete" :icon="Delete" divided>删除</el-dropdown-item>
                                    <el-dropdown-item v-if="row.status === 0" command="ban"
                                        divided>封禁</el-dropdown-item>
                                    <el-dropdown-item v-if="row.status !== 0" command="normal"
                                        divided>解封</el-dropdown-item>
                                    <el-dropdown-item command="points" :icon="Coin" divided>积分变更</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页组件 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 新增用户对话框 -->
        <el-dialog v-model="addDialogVisible" title="新增用户" width="500px" :before-close="handleAddDialogClose">
            <el-form ref="addUserFormRef" :model="addUserForm" :rules="userFormRules" label-width="80px">
                <el-form-item label="用户昵称" prop="userName">
                    <el-input v-model="addUserForm.userName" placeholder="请输入用户昵称" />
                </el-form-item>
                <el-form-item label="用户账号" prop="userAccount">
                    <el-input v-model="addUserForm.userAccount" placeholder="请输入用户账号" />
                </el-form-item>
                <el-form-item label="用户密码" prop="userPassword">
                    <el-input v-model="addUserForm.userPassword" placeholder="请输入用户密码" type="password" show-password />
                </el-form-item>
                <el-form-item label="用户邮箱" prop="email">
                    <el-input v-model="addUserForm.email" placeholder="请输入用户邮箱" />
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

        <!-- 编辑用户对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑用户" width="500px" :before-close="handleEditDialogClose">
            <el-form ref="editUserFormRef" :model="editUserForm" :rules="userFormRules" label-width="80px">
                <el-form-item label="用户昵称" prop="userName">
                    <el-input v-model="editUserForm.userName" placeholder="请输入用户昵称" />
                </el-form-item>
                <el-form-item label="用户账号" prop="userAccount">
                    <el-input v-model="editUserForm.userAccount" placeholder="请输入用户账号" />
                </el-form-item>
                <el-form-item label="用户邮箱" prop="email">
                    <el-input v-model="editUserForm.email" placeholder="请输入用户邮箱" />
                </el-form-item>
                <el-form-item label="钱包余额">
                    <el-input-number v-model="editUserForm.balance" :min="0" />
                </el-form-item>
                <el-form-item label="用户角色">
                    <el-select v-model="editUserForm.userRole" placeholder="请选择用户角色">
                        <el-option label="普通用户" value="user" />
                        <el-option label="管理员" value="admin" />
                    </el-select>
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

        <!-- 用户详情抽屉 -->
        <el-drawer v-model="detailDrawerVisible" title="用户详情" size="50%" :before-close="closeDetailDrawer">
            <el-tabs>
                <el-tab-pane label="基本信息">
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="用户昵称">{{ currentUserDetail?.userName }}</el-descriptions-item>
                        <el-descriptions-item label="用户账号">{{ currentUserDetail?.userAccount }}</el-descriptions-item>
                        <el-descriptions-item label="邮箱">{{ currentUserDetail?.email }}</el-descriptions-item>
                        <el-descriptions-item label="邀请码">{{ currentUserDetail?.invitationCode }}</el-descriptions-item>
                        <el-descriptions-item label="账号状态">
                            <el-tag :type="currentUserDetail?.status === 0 ? 'success' : 'danger'">
                                {{ currentUserDetail?.status === 0 ? '正常' : '封号' }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="钱包余额">{{ currentUserDetail?.balance }}</el-descriptions-item>
                        <el-descriptions-item label="创建时间">{{ currentUserDetail?.createTime }}</el-descriptions-item>
                        <el-descriptions-item label="访问密钥">{{ currentUserDetail?.accessKey }}</el-descriptions-item>
                        <el-descriptions-item label="秘密密钥">{{ currentUserDetail?.secretKey }}</el-descriptions-item>
                        <el-descriptions-item label="用户角色">
                            <el-tag :type="currentUserDetail?.userRole === 'admin' ? 'danger' : 'primary'">
                                {{ currentUserDetail?.userRole === 'admin' ? '管理员' : '普通用户' }}
                            </el-tag>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>
                <el-tab-pane label="积分明细">
                    <el-table :data="pointsTableData" v-loading="pointsLoading" stripe border style="width: 100%">
                        <el-table-column prop="createTime" label="操作时间" width="180" />
                        <el-table-column prop="channel" label="操作渠道" width="120" />
                        <el-table-column prop="points" label="积分变更" width="100" />
                        <el-table-column prop="remark" label="操作备注" min-width="200" />
                    </el-table>
                    <!-- 积分明细分页 -->
                    <div class="pagination-container">
                        <el-pagination v-model:current-page="pointsPagination.currentPage" v-model:page-size="pointsPagination.pageSize"
                            :page-sizes="[10, 20, 50, 100]" :total="pointsPagination.total"
                            layout="total, sizes, prev, pager, next, jumper" @size-change="handlePointsSizeChange"
                            @current-change="handlePointsCurrentChange" />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-drawer>

        <!-- 积分变更对话框 -->
        <el-dialog v-model="pointsDialogVisible" title="积分变更" width="500px" :before-close="handlePointsDialogClose">
            <el-form ref="pointsFormRef" :model="pointsForm" :rules="pointsFormRules" label-width="100px">
                <el-form-item label="用户昵称">
                    <el-input v-model="pointsForm.userName" disabled />
                </el-form-item>
                <el-form-item label="当前积分">
                    <el-input v-model="pointsForm.balance" disabled />
                </el-form-item>
                <el-form-item label="变更方式" prop="changeType">
                    <el-radio-group v-model="pointsForm.type">
                        <el-radio :label="1">新增</el-radio>
                        <el-radio :label="2">扣减</el-radio>
                        <el-radio :label="3">修改</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="积分" prop="points">
                    <el-input-number v-model="pointsForm.points" :min="1" :precision="0" style="width: 100%" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="pointsForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handlePointsDialogClose">取消</el-button>
                    <el-button type="primary" @click="handlePointsSubmit" :loading="submitLoading">
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
import { Search, Refresh, Plus, Edit, Delete, ArrowDown, Coin } from '@element-plus/icons-vue'
import { queryUserList, userAdd, userUpdate, userDelete, userGet, userBan, userNormal, pointsChange, pointsPage } from '@/api/api/user'
import type { PageQuery, MybatisPageResult } from '@i/utils/request'

// 抽屉状态
const detailDrawerVisible = ref(false)
const currentUserDetail = ref<UserData>()

// 积分明细表格数据
const pointsTableData = ref<any[]>([])
const pointsLoading = ref(false)

// 积分明细分页数据
const pointsPagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 关闭抽屉
const closeDetailDrawer = () => {
    detailDrawerVisible.value = false
    // 清空积分明细数据
    pointsTableData.value = []
    pointsPagination.currentPage = 1
    pointsPagination.total = 0
}

// 积分明细分页大小改变
const handlePointsSizeChange = (size: number) => {
    pointsPagination.pageSize = size
    pointsPagination.currentPage = 1
    if (currentUserDetail.value?.id) {
        getPointsList(currentUserDetail.value.id)
    }
}

// 积分明细当前页改变
const handlePointsCurrentChange = (page: number) => {
    pointsPagination.currentPage = page
    if (currentUserDetail.value?.id) {
        getPointsList(currentUserDetail.value.id)
    }
}

// 查看用户详情
const showUserDetail = async (row: UserData) => {
    try {
        const res = await userGet(row.id as number)
        if (res.data) {
            currentUserDetail.value = res.data
            detailDrawerVisible.value = true
            // 重置积分明细分页
            pointsPagination.currentPage = 1
            pointsPagination.pageSize = 10
            // 加载积分明细
            getPointsList(row.id as number)
        }
    } catch (error) {
        ElMessage.error('获取用户详情失败')
        console.error('获取用户详情失败:', error)
    }
}

// 获取积分明细列表
const getPointsList = async (id: number) => {
    pointsLoading.value = true
    try {
        const params: PageQuery<any> = {
            isPage: true,
            currentPage: pointsPagination.currentPage,
            pageSize: pointsPagination.pageSize,
            param: {
                id: id
            }
        }

        const response = await pointsPage(params)
        if (response.status === 'success' && response.data) {
            const result = response.data as MybatisPageResult<any>
            pointsTableData.value = result.records
            pointsPagination.total = result.total
        }
    } catch (error) {
        ElMessage.error('获取积分明细失败')
        console.error('获取积分明细失败:', error)
    } finally {
        pointsLoading.value = false
    }
}

// 用户数据类型
interface UserData {
    id?: number
    // 用户昵称
    userName: string
    // 用户账号
    userAccount: string
    // 用户密码
    userPassword: string
    // 邮箱
    email: string
    // 邀请码
    invitationCode: string
    // 账号状态（0- 正常 1- 封号）
    status: number
    // 钱包余额
    balance: number
    // 访问密钥
    accessKey: string
    // 秘密密钥
    secretKey: string
    // 用户角色: user, admin
    userRole: string
    createTime?: string
}

// 搜索表单
const searchForm = reactive({
    userName: '',
    email: ''
})

// 表格数据
const tableData = ref<UserData[]>([])
const loading = ref(false)
const selectedRows = ref<UserData[]>([])

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 对话框相关
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const pointsDialogVisible = ref(false)
const submitLoading = ref(false)
const addUserFormRef = ref<FormInstance>()
const editUserFormRef = ref<FormInstance>()
const pointsFormRef = ref<FormInstance>()

// 新增用户表单
const addUserForm = reactive({
    userName: '',
    userAccount: '',
    userPassword: '',
    email: ''
})

// 编辑用户表单
const editUserForm = reactive({
    id: undefined,
    userName: '',
    userAccount: '',
    email: '',
    balance: 0,
    userRole: ''
})

// 表单验证规则
const userFormRules = {
    userName: [
        { required: true, message: '请输入用户昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '用户昵称长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    userAccount: [
        { required: true, message: '请输入用户账号', trigger: 'blur' },
        { min: 4, max: 20, message: '用户账号长度在 4 到 20 个字符', trigger: 'blur' }
    ],
    userPassword: [
        { required: true, message: '请输入用户密码', trigger: 'blur' },
        { min: 6, max: 20, message: '用户密码长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    email: [
        { required: false, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址格式', trigger: ['blur', 'change'] }
    ]
}

// 获取用户列表
const getUserList = async () => {
    loading.value = true
    try {
        const params: PageQuery<any> = {
            isPage: true,
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            param: {
                userName: searchForm.userName || undefined,
                email: searchForm.email || undefined
            }
        }

        const response = await queryUserList(params)
        if (response.status === 'success' && response.data) {
            const result = response.data as MybatisPageResult<UserData>
            tableData.value = result.records
            pagination.total = result.total
        }
    } catch (error) {
        ElMessage.error('获取用户列表失败')
        console.error('获取用户列表失败:', error)
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    pagination.currentPage = 1
    getUserList()
}

// 重置搜索
const handleReset = () => {
    searchForm.userName = ''
    searchForm.email = ''
    pagination.currentPage = 1
    getUserList()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    getUserList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    getUserList()
}

// 表格选择改变
const handleSelectionChange = (selection: UserData[]) => {
    selectedRows.value = selection
}

// 新增用户
const handleAdd = () => {
    resetAddUserForm()
    addDialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserData) => {
    Object.assign(editUserForm, row)
    editDialogVisible.value = true
}

// 重置新增用户表单
const resetAddUserForm = () => {
    addUserForm.userName = ''
    addUserForm.userAccount = ''
    addUserForm.userPassword = ''
    addUserForm.email = ''
    nextTick(() => {
        addUserFormRef.value?.clearValidate()
    })
}

// 重置编辑用户表单
const resetEditUserForm = () => {
    editUserForm.id = undefined
    editUserForm.userName = ''
    editUserForm.userAccount = ''
    editUserForm.email = ''
    editUserForm.balance = 0
    editUserForm.userRole = ''
    nextTick(() => {
        editUserFormRef.value?.clearValidate()
    })
}

// 处理下拉菜单命令
const handleDropdownCommand = (command: string, row: UserData) => {
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
        case 'points':
            showPointsDialog(row)
            break
    }
}

// 解封用户
const handleNormal = async (row: UserData) => {
    try {
        await ElMessageBox.confirm(
            `确定要解封用户 "${row.userName}" 吗？`,
            '解封确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        const response = await userNormal({ id: row.id as number })
        if (response.status === 'success') {
            ElMessage.success('解封成功')
            getUserList()
        } else {
            ElMessage.error(response.message || '解封失败')
        }
    } catch (error) {
        console.error('解封用户失败:', error)
    }
}

// 封禁用户
const handleBan = async (row: UserData) => {
    try {
        await ElMessageBox.confirm(
            `确定要封禁用户 "${row.userName}" 吗？`,
            '封禁确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )
        const response = await userBan({ id: row.id as number })
        if (response.status === 'success') {
            ElMessage.success('封禁成功')
            getUserList()
        } else {
            ElMessage.error(response.message || '封禁失败')
        }
    } catch (error) {
        console.error('封禁用户失败:', error)
    }
}

// 删除用户
const handleDelete = async (row: UserData) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除用户 "${row.userName}" 吗？`,
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        const response = await userDelete(row.id as number)
        if (response.status === 'success') {
            ElMessage.success('删除成功')
            getUserList()
        } else {
            ElMessage.error(response.message || '删除失败')
        }
    } catch (error) {
        console.error('删除用户失败:', error)
    }
}

// 关闭新增对话框
const handleAddDialogClose = () => {
    addDialogVisible.value = false
    resetAddUserForm()
}

// 关闭编辑对话框
const handleEditDialogClose = () => {
    editDialogVisible.value = false
    resetEditUserForm()
}

// 提交新增用户表单
const handleAddSubmit = async () => {
    if (!addUserFormRef.value) return

    try {
        await addUserFormRef.value.validate()
        submitLoading.value = true

        const response = await userAdd({
            userName: addUserForm.userName,
            userAccount: addUserForm.userAccount,
            userPassword: addUserForm.userPassword,
            email: addUserForm.email
        })

        if (response.status === 'success') {
            ElMessage.success('注册成功')
            addDialogVisible.value = false
            getUserList()
        } else {
            ElMessage.error(response.message || '注册失败')
        }
    } catch (error) {
        console.error('表单提交失败:', error)
        ElMessage.error('注册失败')
    } finally {
        submitLoading.value = false
    }
}

// 提交编辑用户表单
const handleEditSubmit = async () => {
    if (!editUserFormRef.value) return

    try {
        await editUserFormRef.value.validate()
        submitLoading.value = true

        const response = await userUpdate({
            id: editUserForm.id,
            userName: editUserForm.userName,
            userAccount: editUserForm.userAccount,
            email: editUserForm.email,
            balance: editUserForm.balance,
            userRole: editUserForm.userRole
        })

        if (response.status === 'success') {
            ElMessage.success('更新成功')
            editDialogVisible.value = false
            getUserList()
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

// 积分变更表单
const pointsForm = reactive({
    id: undefined as number | undefined,
    userName: '',
    balance: 0,
    type: 1, // 1: 新增, 2: 扣减, 3: 修改
    points: 1,
    remark: ''
})

// 积分变更表单验证规则
const pointsFormRules = {
    type: [
        { required: true, message: '请选择变更方式', trigger: 'change' }
    ],
    points: [
        { required: true, message: '请输入积分', trigger: 'blur' },
        { type: 'number', min: 1, message: '积分必须大于0', trigger: 'blur' }
    ],
    remark: [
        { required: false, message: '请输入备注信息', trigger: 'blur' },
        { min: 1, max: 100, message: '备注长度在 1 到 200 个字符', trigger: 'blur' }
    ]
}

// 显示积分变更对话框
const showPointsDialog = (row: UserData) => {
    resetPointsForm()
    pointsForm.id = row.id
    pointsForm.userName = row.userName
    pointsForm.balance = row.balance
    pointsDialogVisible.value = true
}

// 关闭积分变更对话框
const handlePointsDialogClose = () => {
    pointsDialogVisible.value = false
    resetPointsForm()
}

// 重置积分变更表单
const resetPointsForm = () => {
    pointsForm.id = undefined
    pointsForm.userName = ''
    pointsForm.balance = 0
    pointsForm.type = 1
    pointsForm.points = 1
    pointsForm.remark = ''
    nextTick(() => {
        pointsFormRef.value?.clearValidate()
    })
}

// 提交积分变更表单
const handlePointsSubmit = async () => {
    if (!pointsFormRef.value) return

    try {
        await pointsFormRef.value.validate()
        submitLoading.value = true

        const response = await pointsChange({
            id: pointsForm.id,
            type: pointsForm.type,
            points: pointsForm.points,
            remark: pointsForm.remark
        })

        if (response.status === 'success') {
            ElMessage.success('积分变更成功')
            pointsDialogVisible.value = false
            getUserList()
        } else {
            ElMessage.error(response.message || '积分变更失败')
        }
    } catch (error) {
        console.error('积分变更失败:', error)
        ElMessage.error('积分变更失败')
    } finally {
        submitLoading.value = false
    }
}

// 组件挂载时获取数据
onMounted(() => {
    getUserList()
})

// 组件选项（Vue 3.3+）
defineOptions({
    name: 'ApiUser'
})
</script>
<style lang="scss" scoped>
.user-management {
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