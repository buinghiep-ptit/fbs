import { http } from 'app/helpers/http-config'

export const getProductCategories = async (): Promise<any> => {
  const { data } = await http.get<any>(`/api/product-categories`)
  return data
}

export const getCategoriesSort = async (): Promise<any> => {
  const { data } = await http.get<any>(`/api/product-categories/sort`)
  return data
}

export const updateCategoriesSort = async (params: any): Promise<any> => {
  const { data } = await http.put<any>(`/api/product-categories/sort`, params)
  return data
}

export const getProducts = async (params: any, id: any): Promise<any> => {
  const { data } = await http.get<any>(`/api/product-categories/${id}/info`, {
    params,
  })
  return data
}

export const getInformationProduct = async (id: any): Promise<any> => {
  const { data } = await http.get<any>(
    `/api/product-categories/${id}/subproducts`,
  )
  return data
}

export const syncCategory = async (): Promise<any> => {
  const { data } = await http.post<any>(`/api/sync-category`)
  return data
}

export const uploadImageCategories = async (
  id: any,
  params: any,
): Promise<any> => {
  const { data } = await http.put<any>(`/api/product-categories/${id}`, params)
  return data
}

export const syncStatus = async (params: any): Promise<any> => {
  const { data } = await http.get<any>(`/api/synchronize-status`, { params })
  return data
}
