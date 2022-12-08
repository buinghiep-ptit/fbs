import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addOtpCountCustomer,
  changePasswordCustomer,
  lockCustomer,
  unLockCustomer,
  updateCustomer,
} from 'app/apis/accounts/customer.service'
import { ICustomerDetail } from 'app/models/account'
import { extractFromObject } from './useUsersData'

export const useUpdatePasswordCustomer = (onSuccess?: any, onError?: any) => {
  const queryClient = useQueryClient()
  return useMutation(
    (params: {
      payload: { newPassword: string; note: string }
      customerId: number | string
    }) => changePasswordCustomer(params.customerId, params.payload),
    {
      onSettled: () => {
        queryClient.invalidateQueries(['customer'])
        queryClient.invalidateQueries(['logs-customer'])
      },
      onSuccess,
    },
  )
}

export const useUpdateCustomer = (onSuccess?: any, onError?: any) => {
  const queryClient = useQueryClient()
  return useMutation(
    (params: { cusId?: any; payload?: any }) =>
      updateCustomer(params.cusId, params.payload as ICustomerDetail),
    {
      onSettled: () => {
        queryClient.invalidateQueries(['customer'])
        queryClient.invalidateQueries(['logs-customer'])
      },
      onSuccess,
    },
  )
}

export const useLockCustomer = (onSuccess?: any, onError?: any) => {
  const queryClient = useQueryClient()

  return useMutation(
    (payload: Record<string, any>) =>
      lockCustomer(
        payload.customerId,
        extractFromObject(payload, [
          'lockType',
          'lockDuration',
          'reason',
        ]) as any,
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(['customer'])
        queryClient.invalidateQueries(['logs-customer'])
      },
      onSuccess,
    },
  )
}

export const useUnLockCustomer = (onSuccess?: any, onError?: any) => {
  const queryClient = useQueryClient()

  return useMutation(
    (payload: Record<string, any>) =>
      unLockCustomer(
        payload.customerId,
        extractFromObject(payload, ['reason']) as any,
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(['customer'])
        queryClient.invalidateQueries(['logs-customer'])
      },
      onSuccess,
    },
  )
}

export const useAddOtpCountCustomer = (onSuccess?: any, onError?: any) => {
  const queryClient = useQueryClient()

  return useMutation(
    (payload: { customerId: number; otpType: string }) =>
      addOtpCountCustomer(
        payload.customerId,
        extractFromObject(payload, ['otpType']) as any,
      ),
    {
      onSettled: () => {
        queryClient.invalidateQueries(['customer'])
        queryClient.invalidateQueries(['logs-customer'])
      },
      onSuccess,
    },
  )
}
