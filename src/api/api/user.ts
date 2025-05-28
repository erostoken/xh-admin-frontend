import createAxios from '@/utils/request'
import type { PageQuery } from '@i/utils/request'

const systemBaseUrl = import.meta.env.VITE_SYSTEM_BASE_URL

// 用户分页查询
export function queryUserList(params: PageQuery<any>, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}/api/user/list/page`, params)
}

// 用户新增
export function userAdd(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}/api/user/add`, params)
}

// 用户修改
export function userUpdate(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}/api/user/update`, params)
}

// 用户删除
export function userDelete(id: number, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}/api/user/delete`, { id })
}

// 用户查询
export function userGet(id: number, option?: RequestOption) {
  return createAxios(option).get(`${systemBaseUrl}/api/user/get`, { params: { id } })
}
