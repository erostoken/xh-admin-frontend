import createAxios from '@/utils/request'
import type { PageQuery } from '@i/utils/request'

// 参数项类型定义
export interface ParamItem {
  fieldName?: string
  type?: string
  required?: boolean
  example?: string
  desc?: string
  children?: ParamItem[]
  showChildren?: boolean
}

// 接口信息类型定义
export interface InterfaceInfo {
  id: string
  name?: string
  url?: string
  method?: string
  description?: string
  status?: number
  requestParams?: ParamItem[]
  responseParams?: ParamItem[]
  createTime?: string
  updateTime?: string
  creator?: string
  category?: string
}

const systemBaseUrl = import.meta.env.VITE_SYSTEM_BASE_URL

const moduleUrl = '/api/interface'

// 接口分页查询
export function queryInterfaceList(params: PageQuery<any>, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/list/page`, params)
}

// 接口新增
export function interfaceAdd(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/add`, params)
}

// 接口修改
export function interfaceUpdate(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/update`, params)
}

// 接口禁用
export function interfaceBan(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/ban`, params)
}

// 接口启用
export function interfaceNormal(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/normal`, params)
}

// 接口删除
export function interfaceDelete(id: string, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/delete`, { id })
}

// 接口查询
export function interfaceGet(id: string, option?: RequestOption) {
  return createAxios(option).get(`${systemBaseUrl}${moduleUrl}/get`, { params: { id } })
}

// 接口上线
export function interfaceOnline(id: string, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/online`,  { id })
}

// 接口下线
export function interfaceOffline(id: string, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/offline`,  { id })
}