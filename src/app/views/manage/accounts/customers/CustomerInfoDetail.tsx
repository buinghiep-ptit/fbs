import { yupResolver } from '@hookform/resolvers/yup'
import {
  AddAPhoto,
  AddBox,
  CameraAltRounded,
  LockClockSharp,
  PasswordSharp,
} from '@mui/icons-material'
import {
  Avatar,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import {
  fetchLogsCustomer,
  getCustomerDetail,
} from 'app/apis/accounts/customer.service'
import { MuiButton } from 'app/components/common/MuiButton'
import FormInputText from 'app/components/common/MuiInputText'
import MuiLoading from 'app/components/common/MuiLoadingApp'
import { SelectDropDown } from 'app/components/common/MuiSelectDropdown'
import MuiStyledPagination from 'app/components/common/MuiStyledPagination'
import MuiStyledTable from 'app/components/common/MuiStyledTable'
import { MuiTypography } from 'app/components/common/MuiTypography'
import { ILogsActionCustomer, OtpCount } from 'app/models/account'
import { columnLogsCustomer } from 'app/utils/columns/columnsLogsCustomer'
import { ISODateTimeFormatter } from 'app/utils/formatters/dateTimeISOFormatter'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'

type ISearchFilters = {
  email?: string
  phoneNumber?: string
  displayName?: string
  otp?: number
  avatar?: any
  cusType?: string | number
}

type RHFLabelProps = {
  control: any
  name: string
  options: OtpCount[]
}

const RHFLabel = ({ control, name, options }: RHFLabelProps) => {
  const watchOtp = useWatch({ control, name })

  const watchToString = (watchValue: string) => {
    const index = options.findIndex(o => o.type === parseInt(watchValue, 10))
    const currentOtpSelected = options[index]

    return currentOtpSelected ?? options[0]
  }

  return (
    <Chip
      label={`${watchToString(watchOtp).numToday} / ${
        watchToString(watchOtp).maxPerDay
      }`}
      size="small"
      color={true ? 'primary' : 'default'}
      sx={{ mx: 1 }}
    />
  )
}

export interface Props {}
const FILE_SIZE = 10000000
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png']

export default function CustomerDetail(props: Props) {
  const navigation = useNavigate()
  const { customerId } = useParams()

  const queryResults = useQueries({
    queries: [
      {
        queryKey: ['customer', customerId],
        queryFn: () => getCustomerDetail(customerId ?? 0),
        refetchOnWindowFocus: false,
        enabled: !!customerId,
      },
      {
        queryKey: ['logs-customer', customerId],
        queryFn: () => fetchLogsCustomer(customerId ?? 0),
        refetchOnWindowFocus: false,
        enabled: !!customerId,
      },
    ],
  })
  const [customer, logs] = queryResults
  const isLoading = queryResults.some(
    (query: UseQueryResult) => query.isLoading,
  )
  const isError = queryResults.some((query: UseQueryResult) => query.isError)
  const isFetching = queryResults.some(
    (query: UseQueryResult) => query.isFetching,
  )

  const convertOtpToLabel = (type: number) => {
    switch (type) {
      case 1:
        return 'OTP đăng ký'
      case 2:
        return 'OTP quên mật khẩu'

      case 3:
        return 'OTP đăng nhập'

      case 4:
        return 'OTP đổi SĐT'

      default:
        return 'OTP đăng ký'
    }
  }

  const getColorByCusStatus = (status: number) => {
    switch (status) {
      case 1:
        return '#2F9B42'
      case -1:
        return '#cccccc'

      case -2:
        return '#FF3D57'

      case -3:
        return '#ff9e43'

      default:
        return '2F9B42'
    }
  }

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .min(0, 'hashtag must be at least 0 characters')
      .max(256, 'hashtag must be at almost 256 characters'),
    phoneNumber: Yup.string()
      .min(0, 'email must be at least 0 characters')
      .max(256, 'email must be at almost 256 characters'),
    displayName: Yup.string()
      .min(0, 'email must be at least 0 characters')
      .max(256, 'email must be at almost 256 characters'),
    avatar: Yup.mixed()
      .test(
        'fileSize',
        'Dung lượng file quá lớn (tối đa 10MB)',
        file => !file || (file && file.size <= FILE_SIZE),
      )
      .test('fileFormat', 'Chỉ hỗ trợ ảnh .jpg | .jpeg | .png | .gif', file => {
        console.log('fileFormat test: ', file)
        return !file || (file && SUPPORTED_FORMATS.includes(file.type))
      }),
  })

  const methods = useForm<ISearchFilters>({
    defaultValues: { avatar: null },
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  })

  const onSubmitHandler: SubmitHandler<ISearchFilters> = (
    values: ISearchFilters,
  ) => {
    console.log('values: ', values)
  }

  if (isLoading) return <MuiLoading />

  if (isError)
    return (
      <Box my={2} textAlign="center">
        <MuiTypography variant="h5">Have an errors</MuiTypography>
      </Box>
    )

  return (
    <>
      <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
        <FormProvider {...methods}>
          <Grid container spacing={3}>
            <Grid item sm={7} xs={12}>
              <Box>
                <Grid container alignItems={'center'} pb={1}>
                  <Grid item sm={4} xs={12}>
                    <MuiTypography variant="subtitle2">Email:</MuiTypography>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <FormInputText
                      type="email"
                      name="email"
                      placeholder="Nhập Email"
                      size="small"
                      fullWidth
                      defaultValue={customer?.data?.email ?? ''}
                    />
                  </Grid>
                </Grid>
                <Grid container alignItems={'center'} py={1}>
                  <Grid item sm={4} xs={12}>
                    <MuiTypography variant="subtitle2">
                      Số điện thoại:
                    </MuiTypography>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <FormInputText
                      type="text"
                      name="mobilePhone"
                      size="small"
                      placeholder="Nhập tên tài khoản"
                      fullWidth
                      defaultValue={customer?.data?.mobilePhone ?? ''}
                    />
                  </Grid>
                </Grid>
                <Grid container alignItems={'center'} py={1}>
                  <Grid item sm={4} xs={12}>
                    <MuiTypography variant="subtitle2">
                      Tên hiển thị:
                    </MuiTypography>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <FormInputText
                      type="text"
                      name="displayName"
                      placeholder="Nhập họ và tên"
                      size="small"
                      fullWidth
                      defaultValue={customer?.data?.fullName ?? ''}
                    />
                  </Grid>
                </Grid>
                <Grid container alignItems={'center'} py={1}>
                  <Grid item sm={4} xs={12}>
                    <MuiTypography variant="subtitle2">
                      OTP trong ngày:
                    </MuiTypography>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <Stack flexDirection={'row'} alignItems={'center'}>
                      <Box flex={1}>
                        <SelectDropDown
                          name="otp"
                          defaultValue={
                            (customer?.data?.otpCount &&
                              customer?.data?.otpCount[0]?.type) ??
                            0
                          }
                        >
                          {customer?.data?.otpCount?.length ? (
                            customer?.data?.otpCount?.map(item => (
                              <MenuItem key={item.type} value={item.type}>
                                {convertOtpToLabel(item.type ?? 0)}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem value={0}>{'number'}</MenuItem>
                          )}
                        </SelectDropDown>
                      </Box>

                      <RHFLabel
                        control={methods.control}
                        name={'otp'}
                        options={customer?.data?.otpCount ?? []}
                      />

                      <MuiButton
                        onClick={() => {}}
                        title="Thêm lượt"
                        variant="outlined"
                        color="primary"
                        sx={{ width: '100%' }}
                        startIcon={<AddBox />}
                      />
                    </Stack>
                  </Grid>
                </Grid>

                <Grid container alignItems={'center'} py={1}>
                  <Grid item sm={4} xs={12}>
                    <MuiTypography variant="subtitle2">
                      Đăng ký bằng:
                    </MuiTypography>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <MuiTypography
                      variant="subtitle2"
                      pb={1}
                      color="primary"
                      sx={{ textDecorationLine: 'underline' }}
                    >
                      {customer?.data?.registeredBy}
                    </MuiTypography>
                  </Grid>
                </Grid>
                <Grid container alignItems={'center'} py={1}>
                  <Grid item sm={4} xs={12}>
                    <MuiTypography variant="subtitle2">
                      Lần cuối đăng nhập:
                    </MuiTypography>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <MuiTypography variant="subtitle2" color="primary">
                      {customer?.data?.lastLoginDate
                        ? ISODateTimeFormatter(
                            customer?.data?.lastLoginDate ?? '',
                          )
                        : ''}
                    </MuiTypography>
                  </Grid>
                </Grid>
                <Grid container alignItems={'center'} py={1}>
                  <Grid item sm={4} xs={12}>
                    <MuiTypography variant="subtitle2">
                      Mã giới thiệu:
                    </MuiTypography>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <MuiTypography variant="subtitle2" color="primary">
                      {customer?.data?.referralCode}
                    </MuiTypography>
                  </Grid>
                </Grid>
              </Box>

              <Box py={3}>
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <MuiButton
                      disabled={!!Object.keys(methods.formState.errors).length}
                      title="Lưu"
                      variant="contained"
                      color="primary"
                      type="submit"
                      sx={{ width: '100%' }}
                      startIcon={<LockClockSharp />}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <MuiButton
                      onClick={() => methods.reset()}
                      title="Huỷ"
                      variant="outlined"
                      color="secondary"
                      sx={{ width: '100%' }}
                      startIcon={<PasswordSharp />}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item sm={5} xs={12}>
              <Stack alignItems={'center'} justifyContent={'center'}>
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <MuiButton
                      title="Khoá"
                      variant="outlined"
                      color="error"
                      type="submit"
                      sx={{ width: '100%' }}
                      startIcon={<LockClockSharp />}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <MuiButton
                      onClick={() =>
                        navigation(`doi-mat-khau`, {
                          state: { modal: true },
                        })
                      }
                      title="Đổi mật khẩu"
                      variant="outlined"
                      color="secondary"
                      sx={{ width: '100%' }}
                      startIcon={<PasswordSharp />}
                    />
                  </Grid>
                </Grid>

                <Stack alignItems={'center'} p={3} gap={2}>
                  <Box
                    width={200}
                    height={200}
                    sx={{
                      bgcolor: 'gray',
                      borderRadius: 100,
                      position: 'relative',
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      backgroundImage: `url(${
                        methods.watch('avatar')
                          ? URL.createObjectURL(methods.watch('avatar'))
                          : '/assets/images/avatars/avatar-duck.jpeg'
                      })`,
                    }}
                  >
                    <label>
                      <Controller
                        name="avatar"
                        control={methods.control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <input
                            style={{ display: 'none' }}
                            type="file"
                            name="avatar"
                            accept="image/*"
                            // multiple
                            {...props}
                            onChange={event => {
                              console.log(
                                'onchange:',
                                event.target.files && event.target.files[0],
                              )
                              if (event.target.files?.length) {
                                field.onChange(event.target.files[0])
                              }
                            }}
                          />
                        )}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          borderRadius: 100,
                          backgroundColor: 'white',
                          width: 50,
                          height: 50,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <CameraAltRounded
                          color="primary"
                          fontSize="large"
                          sx={{ width: 40, height: 40 }}
                        />
                      </Box>
                    </label>
                    <Box
                      sx={{
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        position: 'absolute',
                        bottom: 10,
                        right: 20,
                        borderRadius: 100,
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: getColorByCusStatus(
                            customer.data?.status ?? 0,
                          ),
                          right: 0,
                          borderRadius: 100,
                        }}
                      />
                    </Box>
                  </Box>
                  {methods.formState.errors.avatar && (
                    <MuiTypography color="error" fontSize="0.75rem">
                      {methods.formState.errors.avatar?.message as string}
                    </MuiTypography>
                  )}

                  <Box>
                    <Stack flexDirection={'row'} pb={2}>
                      <Stack alignItems={'center'}>
                        <MuiTypography variant="subtitle1" color="primary">
                          {customer?.data?.followers}
                        </MuiTypography>
                        <MuiTypography variant="subtitle2" color="primary">
                          Người theo dõi
                        </MuiTypography>
                      </Stack>
                      <Divider
                        orientation="vertical"
                        sx={{ backgroundColor: '#D9D9D9', mx: 2, my: 1 }}
                        flexItem
                      />
                      <Stack alignItems={'center'}>
                        <MuiTypography variant="subtitle1" color="primary">
                          {customer?.data?.following}
                        </MuiTypography>
                        <MuiTypography variant="subtitle2" color="primary">
                          Đang theo dõi
                        </MuiTypography>
                      </Stack>
                    </Stack>
                    <SelectDropDown
                      name="cusType"
                      defaultValue={customer?.data?.type ?? 1}
                    >
                      <MenuItem value={1}>Thường</MenuItem>
                      <MenuItem value={2}>KOL</MenuItem>
                    </SelectDropDown>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </FormProvider>
      </form>

      <Box mt={1} pt={3} sx={{ borderTop: '1px solid #D9D9D9' }}>
        <MuiTypography variant="subtitle1" pb={2}>
          Logs hành động
        </MuiTypography>

        <MuiStyledTable
          rows={logs?.data?.content as ILogsActionCustomer[]}
          columns={columnLogsCustomer as any}
          onClickRow={() => {}}
          isFetching={isFetching}
        />
        <MuiStyledPagination
          component="div"
          rowsPerPageOptions={[10, 20, 100]}
          count={logs?.data?.content?.length as number}
          rowsPerPage={10}
          page={0}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
        />
      </Box>
    </>
  )
}
