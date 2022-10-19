import { yupResolver } from '@hookform/resolvers/yup'
import { IOrderDetail, IService } from 'app/models/order'
import { messages } from 'app/utils/messages'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as Yup from 'yup'

type SchemaType = {
  dateStart?: string
  dateEnd?: string
  fullName?: string
  mobilePhone?: string
  email?: string
  services?: IService[]
}

export const useRHFOrder = (order: IOrderDetail) => {
  useEffect(() => {
    if (order) {
      defaultValues.dateStart = order.dateStart
      defaultValues.dateEnd = order.dateEnd
      defaultValues.fullName = order.contact.fullName
      defaultValues.mobilePhone = order.contact.mobilePhone
      defaultValues.email = order.contact.email
      defaultValues.services = order.services

      methods.reset({ ...defaultValues })
    }
  }, [order])

  const [defaultValues] = useState<SchemaType>({})

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required(messages.MSG1),
    dateStart: Yup.date()
      .typeError('Sai dịnh dạng.')
      .nullable()
      .required(messages.MSG1),
    dateEnd: Yup.date()
      .when('startDate', (startDate, yup) => {
        if (startDate && startDate != 'Invalid Date') {
          const dayAfter = new Date(startDate.getTime() + 0)
          return yup.min(dayAfter, 'Ngày kết thúc >= ngày bắt đầu')
        }
        return yup
      })
      .typeError('Sai định dạng.')
      .nullable()
      .required(messages.MSG1),
    services: Yup.lazy(() =>
      Yup.array().of(
        Yup.object().shape({
          quantity: Yup.string()
            .required(messages.MSG1)
            .max(11, 'Tối đa 9 ký tự'),
        }),
      ),
    ),
  })

  const methods = useForm<SchemaType>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  })

  const { fields, append, remove } = useFieldArray<SchemaType>({
    name: 'services',
    control: methods.control,
  })

  useEffect(() => {
    const currentProp = order?.services.length || 0
    const previousProp = fields.length
    if (currentProp > previousProp) {
      for (let i = previousProp; i < currentProp; i++) {
        append({ quantity: 0 })
      }
    } else {
      for (let i = previousProp; i > currentProp; i--) {
        remove(i - 1)
      }
    }
  }, [order?.services, fields])

  return [methods as any, fields as any] as const
}
