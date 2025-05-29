import createAxios from '@/utils/request'
import type { PageQuery } from '@i/utils/request'

const systemBaseUrl = import.meta.env.VITE_SYSTEM_BASE_URL

const moduleUrl = '/api/productInfo'

// 产品分页查询
export function queryProductList(params: PageQuery<any>, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/list/page`, params)
}

// 产品新增
export function productAdd(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/add`, params)
}

// 产品修改
export function productUpdate(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/update`, params)
}

// 产品封禁
export function productBan(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/ban`, params)
}

// 产品解封
export function productNormal(params = {}, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/normal`, params)
}

// 产品删除
export function productDelete(id: number, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/delete`, { id })
}

// 产品查询
export function productGet(id: number, option?: RequestOption) {
  return createAxios(option).get(`${systemBaseUrl}${moduleUrl}/get`, { params: { id } })
}

// 产品上线
export function productOnline(id: number, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/online`,  { id })
}

// 产品下线
export function productOffline(id: number, option?: RequestOption) {
  return createAxios(option).post(`${systemBaseUrl}${moduleUrl}/offline`,  { id })
}