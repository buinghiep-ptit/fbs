import { yupResolver } from '@hookform/resolvers/yup'
import {
  Chip,
  Icon,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
} from '@mui/material'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { getPolicyDetail } from 'app/apis/policy/policy.service'
import { BoxWrapperDialog } from 'app/components/common/BoxWrapperDialog'
import FormInputText from 'app/components/common/MuiRHFInputText'
import FormTextArea from 'app/components/common/MuiRHFTextarea'
import MuiRHFNumericFormatInput from 'app/components/common/MuiRHFWithNumericFormat'
import MuiStyledModal from 'app/components/common/MuiStyledModal'
import { MuiTypography } from 'app/components/common/MuiTypography'
import { toastSuccess } from 'app/helpers/toastNofication'
import {
  useCreatePolicy,
  useUpdatePolicy,
} from 'app/hooks/queries/usePoliciesData'
import { IPolicyOverall } from 'app/models/policy'
import { messages } from 'app/utils/messages'
import React, { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'

type Props = {
  title: string
}

type SchemaType = {
  name?: string
  scope?: number
  scaleAmount?: number
  minAmount?: number | null
  maxAmount?: number | null
  note?: string
}

export default function AddPolicy({ title }: Props) {
  const navigate = useNavigate()
  const location = useLocation() as any
  const isModal = location.state?.modal ?? false
  const { policyId } = useParams()

  const [defaultValues] = useState<SchemaType>({
    scope: 1,
  })

  const { data: policy }: UseQueryResult<IPolicyOverall, Error> = useQuery<
    IPolicyOverall,
    Error
  >(['policy', policyId], () => getPolicyDetail(Number(policyId ?? 0)), {
    enabled: !!policyId,
  })

  useEffect(() => {
    if (policy && !!Object.keys(policy).length) {
      defaultValues.name = policy.name
      defaultValues.scope = policy.scope
      defaultValues.scaleAmount = policy.scaleAmount
      defaultValues.minAmount = policy.minAmount ?? null
      defaultValues.maxAmount = policy.maxAmount ?? null

      methods.reset({ ...defaultValues })
    }
  }, [policy])

  const onSuccess = (data: any, message?: string) => {
    toastSuccess({
      message: message ?? '',
    })
    navigate(-1)
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .max(255, 'Nội dung không được vượt quá 255 ký tự')
      .required(messages.MSG1),
    scaleAmount: Yup.string()
      .max(11, 'Chỉ được nhập tối đa 9 ký tự')
      .nullable(),
    minAmount: Yup.string().max(11, 'Chỉ được nhập tối đa 9 ký tự').nullable(),
    maxAmount: Yup.string().max(11, 'Chỉ được nhập tối đa 9 ký tự').nullable(),
  })

  const methods = useForm<SchemaType>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  })

  const { mutate: create, isLoading: createLoading } = useCreatePolicy(() =>
    onSuccess(null, 'Thêm mới thành công'),
  )

  const { mutate: update, isLoading: updateLoading } = useUpdatePolicy(() =>
    onSuccess(null, 'Cập nhật thành công'),
  )

  const onSubmitHandler: SubmitHandler<SchemaType> = async (
    values: SchemaType,
  ) => {
    const scaleAmount =
      values?.scaleAmount?.toString().replace(/,(?=\d{3})/g, '') ?? 0
    const minAmount =
      values?.minAmount?.toString().replace(/,(?=\d{3})/g, '') ?? 0
    const maxAmount =
      values?.maxAmount?.toString().replace(/,(?=\d{3})/g, '') ?? 0

    const payload: IPolicyOverall = {
      name: values.name,
      scope: values.scope,
      scaleAmount: Number(scaleAmount ?? 0),
      minAmount: Number(minAmount) || null,
      maxAmount: Number(maxAmount) || null,
    }

    if (policyId) {
      update({ id: Number(policyId ?? 0), payload: payload })
    } else {
      create(payload)
    }
  }

  const handleClose = () => {
    navigate(-1)
  }

  const getContent = () => {
    return (
      <BoxWrapperDialog>
        <FormProvider {...methods}>
          <Stack my={3} gap={3}>
            <FormInputText
              type="text"
              label={'Tên chính sách'}
              name="name"
              placeholder="Nhập tên chính sách"
              defaultValue=""
              required
            />

            <Stack
              direction={'row'}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack
                direction={'row'}
                gap={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <MuiTypography variant="subtitle2">Phạm vi:</MuiTypography>
                <Chip
                  sx={{ minWidth: 80 }}
                  label={
                    policy ? (policy.scope == 1 ? 'Riêng' : 'Chung') : 'Riêng'
                  }
                  size="medium"
                  color={
                    policy
                      ? policy.scope == 1
                        ? 'primary'
                        : 'warning'
                      : 'primary'
                  }
                />
              </Stack>

              <IconButton>
                <Tooltip arrow title="Xem danh sách điểm camp đã được liên kết">
                  <Stack direction={'row'} alignItems="center">
                    <MuiTypography
                      color={'primary'}
                      sx={{ textDecorationLine: 'underline', mr: 1 }}
                      variant="subtitle2"
                    >
                      6 điểm Camp liên kết
                    </MuiTypography>
                    <Icon color="primary">double_arrow</Icon>
                  </Stack>
                </Tooltip>
              </IconButton>
            </Stack>

            <MuiRHFNumericFormatInput
              type="text"
              name="scaleAmount"
              label="% giao dịch"
              placeholder="Nhập % giao dich"
              iconEnd={<MuiTypography variant="subtitle2">%</MuiTypography>}
              fullWidth
              required
            />

            <MuiRHFNumericFormatInput
              type="text"
              name="maxAmount"
              label="Giá trị tối đa"
              placeholder="Nhập giá trị tối đa"
              iconEnd={<MuiTypography variant="subtitle2">VNĐ</MuiTypography>}
              fullWidth
            />

            <MuiRHFNumericFormatInput
              type="text"
              name="minAmount"
              label="Giá trị tối thiểu"
              placeholder="Nhập giá trị tối thiểu"
              iconEnd={<MuiTypography variant="subtitle2">VNĐ</MuiTypography>}
              fullWidth
            />

            <Stack>
              <MuiTypography variant="subtitle2" pb={1}>
                Ghi chú:
              </MuiTypography>
              <FormTextArea
                name="note"
                defaultValue={''}
                placeholder="Nhập nội dung"
              />
              <MuiTypography
                sx={{ fontStyle: 'italic', fontSize: '0.875rem', mt: 1 }}
                variant="subtitle2"
              >
                Lưu ý: Sau khi cập nhật, chính sách mới sẽ được áp dụng cho toàn
                bộ các điểm Camp liên quan.
              </MuiTypography>
            </Stack>
          </Stack>
          {createLoading || (updateLoading && <LinearProgress />)}
        </FormProvider>
      </BoxWrapperDialog>
    )
  }

  return (
    <React.Fragment>
      <MuiStyledModal
        title={title}
        open={isModal}
        onCloseModal={handleClose}
        isLoading={createLoading || updateLoading}
        onSubmit={methods.handleSubmit(onSubmitHandler)}
        submitText="Lưu"
        cancelText="Quay lại"
      >
        {getContent()}
      </MuiStyledModal>
    </React.Fragment>
  )
}
