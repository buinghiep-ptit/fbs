import { http } from 'app/helpers/http-config'

export const getLeagues = async (params: any): Promise<any> => {
  const { data } = await http.get<any>('/api/leagues', {
    params,
  })
  return data
}

export const getLeaguesById = async (id: any): Promise<any> => {
  const { data } = await http.get<any>(`/api/leagues/${id}`)
  return data
}

export const deleteLeagues = async (id: any): Promise<any> => {
  const { data } = await http.delete<any>(`/api/leagues/${id}`)
  return data
}

export const createLeagues = async (params: any): Promise<any> => {
  const { data } = await http.post<any>(`/api/leagues`, params)
  return data
}

export const editMatch = async (params: any, id: any): Promise<any> => {
  const { data } = await http.put<any>(`/api/match/${id}`, params)
  return data
}

export const createMatch = async (params: any, id: any): Promise<any> => {
  const { data } = await http.post<any>(`/api/leagues/${id}/schedule`, params)
  return data
}

export const deleteMatch = async (id: any): Promise<any> => {
  const { data } = await http.delete<any>(`/api/match/${id}`)
  return data
}

export const deleteRound = async (id: any): Promise<any> => {
  const { data } = await http.delete<any>(`/api/round/${id}`)
  return data
}

export const editLeagues = async (params: any, id: any): Promise<any> => {
  const { data } = await http.put<any>(`/api/leagues/${id}`, params)
  return data
}

export const getSchedule = async (id: any): Promise<any> => {
  const { data } = await http.get<any>(`/api/leagues/${id}/schedule`)
  return data
}

export const getRank = async (id: any): Promise<any> => {
  const { data } = await http.get<any>(`/api/leagues/${id}/standings`)
  return data
}