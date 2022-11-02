import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Grid,
  Icon,
  InputLabel,
  LinearProgress,
  MenuItem,
  Stack,
  styled,
} from '@mui/material'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { fetchCampGrounds } from 'app/apis/feed/feed.service'
import { getServiceDetail } from 'app/apis/services/services.service'
import { Breadcrumb, SimpleCard } from 'app/components'
import { MuiButton } from 'app/components/common/MuiButton'
import { MuiRHFAutoComplete } from 'app/components/common/MuiRHFAutoComplete'
import FormInputText from 'app/components/common/MuiRHFInputText'
import { SelectDropDown } from 'app/components/common/MuiRHFSelectDropdown'
import MuiRHFNumericFormatInput from 'app/components/common/MuiRHFWithNumericFormat'
import { MuiTypography } from 'app/components/common/MuiTypography'
import RHFWYSIWYGEditor from 'app/components/common/RHFWYSIWYGEditor'
import { UploadPreviewer } from 'app/components/common/UploadPreviewer'
import { toastSuccess } from 'app/helpers/toastNofication'
import { checkIfFilesAreTooBig } from 'app/helpers/validateUploadFiles'
import {
  useCreateService,
  useUpdateService,
} from 'app/hooks/queries/useServicesData'
import { useUploadFiles } from 'app/hooks/useFilesUpload'
import { IMediaOverall } from 'app/models'
import {
  ICampAreaResponse,
  ICampGround,
  ICampGroundResponse,
} from 'app/models/camp'
import { DetailService, WeekdayPrices } from 'app/models/service'
import { EMediaFormat, EMediaType } from 'app/utils/enums/medias'
import { messages } from 'app/utils/messages'
import * as React from 'react'
import { useState } from 'react'
import {
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'
const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}))
export interface Props {}
type TypeElement = {
  camp?: ICampGround
  files?: any
  description?: string
  rentalType?: number | string
  capacity?: number
  name?: string
  status?: number | string
  weekdayPrices?: WeekdayPrices[]
}
export default function ServiceDetail(props: Props) {
  const navigate = useNavigate()
  const { serviceId } = useParams()
  const [loading, setLoading] = useState(false)
  const [mediasSrcPreviewer, setMediasSrcPreviewer] = useState<IMediaOverall[]>(
    [],
  )

  const calendar = [
    { day: 2 },
    { day: 3 },
    { day: 4 },
    { day: 5 },
    { day: 6 },
    { day: 7 },
    { day: 1 },
  ]

  const [fileConfigs, setFileConfigs] = useState({
    mediaType: EMediaType.POST,
    mediaFormat: EMediaFormat.IMAGE,
    accept: 'image/*',
    multiple: true,
  })
  const [defaultValues] = useState<TypeElement>({
    status: '',
    rentalType: '',
    description: '',
  })

  const validationSchema = Yup.object().shape({
    camp: Yup.object().nullable().required(messages.MSG1),
    rentalType: Yup.string().required(messages.MSG1),
    capacity: Yup.string().required(messages.MSG1),
    name: Yup.string().required(messages.MSG1),
    status: Yup.string().required(messages.MSG1),
    files: Yup.mixed()
      .test('empty', messages.MSG1, files => {
        // if (!!Number(eventId ?? 0)) {
        const media = ((fileInfos ?? []) as IMediaOverall[]).find(
          media => media.mediaFormat === fileConfigs.mediaFormat,
        )

        if (files && files.length) {
          return true
        }

        return !!media
        // }
        // const isError = files && !!files.length
        // return isError
      })
      .test(
        'fileSize',
        fileConfigs.mediaFormat === EMediaFormat.VIDEO
          ? 'Dung lượng video tối đa 3 phút'
          : 'Dung lượng ảnh tối đa 10MB/ảnh',
        files => checkIfFilesAreTooBig(files, fileConfigs.mediaFormat),
      ),
    weekdayPrices: Yup.lazy(() =>
      Yup.array().of(
        Yup.object({
          amount: Yup.string().required(messages.MSG1),
        }),
      ),
    ),
  })

  const methods = useForm<TypeElement>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  })

  const { fields, append, remove } = useFieldArray<TypeElement>({
    name: 'weekdayPrices',
    control: methods.control,
  })

  const [
    selectFiles,
    uploadFiles,
    removeUploadedFiles,
    cancelUploading,
    uploading,
    progressInfos,
    message,
    setInitialFileInfos,
    fileInfos,
  ] = useUploadFiles()
  const {
    data: campService,
    isLoading,
    fetchStatus,
    isError,
    error,
  }: UseQueryResult<DetailService, Error> = useQuery<DetailService, Error>(
    ['campService', serviceId],
    () => getServiceDetail(Number(serviceId ?? 0)),
    {
      enabled: !!serviceId,
      staleTime: 5 * 60 * 1000, // 5min
    },
  )

  const onSubmitHandler: SubmitHandler<TypeElement> = (values: TypeElement) => {
    if (values.weekdayPrices && values.weekdayPrices.length) {
      values.weekdayPrices = values.weekdayPrices.map(item => ({
        ...item,
        amount: Number(item.amount?.toString().replace(/,(?=\d{3})/g, '') ?? 0),
      })) as any
    }

    const files = (fileInfos as IMediaOverall[])
      .filter(
        (f: IMediaOverall) =>
          f.mediaFormat === fileConfigs.mediaFormat &&
          !f.thumbnail &&
          f.mediaType === 3,
      )
      .map((file: IMediaOverall) => ({
        mediaType: EMediaType.POST,
        mediaFormat: fileConfigs.mediaFormat,
        url: file.url,
        detail: file.detail ?? null,
      }))

    let thumbnails = (fileInfos as IMediaOverall[]).filter(
      (f: IMediaOverall) => f.thumbnail,
    )

    if (fileConfigs.mediaFormat == EMediaFormat.IMAGE) {
      thumbnails = thumbnails
        .filter((f: IMediaOverall) => f.thumbnail?.type === 'image')
        .map((file: IMediaOverall) => ({
          mediaType: EMediaType.COVER,
          mediaFormat: EMediaFormat.IMAGE,
          url: file.url,
        }))
    } else if (fileConfigs.mediaFormat == EMediaFormat.VIDEO) {
      thumbnails = thumbnails
        .filter((f: IMediaOverall) => f.thumbnail?.type === 'video')
        .map((file: IMediaOverall) => ({
          mediaType: EMediaType.COVER,
          mediaFormat: EMediaFormat.IMAGE,
          url: file.url,
        }))
    }

    let medias: IMediaOverall[] = []
    if (fileConfigs.mediaFormat === EMediaFormat.VIDEO) {
      medias = [
        {
          ...files[files.length - 1],
          detail:
            thumbnails && thumbnails.length
              ? {
                  ...files[files.length - 1].detail,
                  coverImgUrl: thumbnails[thumbnails.length - 1].url,
                }
              : null,
        },
      ]
    } else if (fileConfigs.mediaFormat === EMediaFormat.IMAGE) {
      medias =
        thumbnails && thumbnails.length ? [thumbnails[0], ...files] : files
    }

    const payload: DetailService = {
      name: values.name,
      campGroundId: values.camp?.id,
      rentalType: Number(values.rentalType),
      capacity: values.capacity,
      description: values.description ?? '',
      images: medias,
      status: Number(values.status ?? -1),
      weekdayPrices: values.weekdayPrices ?? [],
    }
    if (serviceId) {
      edit({ ...payload, serviceId: Number(serviceId) })
    } else {
      add(payload)
    }
  }

  const onRowUpdateSuccess = (data: any, message?: string) => {
    toastSuccess({ message: message ?? '' })
    // setMediasSrcPreviewer([])
    navigate(-1)
    methods.reset()
  }
  const { mutate: add, isLoading: createLoading } = useCreateService(() =>
    onRowUpdateSuccess(null, 'Thêm mới thành công'),
  )

  const { mutate: edit, isLoading: editLoading } = useUpdateService(() =>
    onRowUpdateSuccess(null, 'Cập nhật thành công'),
  )

  const { data: campGrounds }: UseQueryResult<ICampGroundResponse, Error> =
    useQuery<ICampAreaResponse, Error>(['camp-grounds'], () =>
      fetchCampGrounds({ size: 200, page: 0 }),
    )

  React.useEffect(() => {
    if (campService) {
      defaultValues.rentalType = campService.rentalType
      defaultValues.status = campService.status
      defaultValues.capacity = campService.capacity
      defaultValues.name = campService.name
      defaultValues.description = campService.description
      defaultValues.weekdayPrices = campService.weekdayPrices
      if (campGrounds && campGrounds.content) {
        const getCamp = campGrounds.content.find(
          camp => camp.id == campService.campGroundId,
        )
        defaultValues.camp = getCamp ?? {}
      }
      setMediasSrcPreviewer([
        ...(campService?.images?.filter(f => f.mediaType === 3) ?? []),
      ])
      setInitialFileInfos([
        ...(campService?.images?.filter(f => f.mediaType === 3) ?? []),
      ])
    } else {
      setMediasSrcPreviewer([])
    }

    methods.reset({ ...defaultValues })
  }, [campService, campGrounds])

  React.useEffect(() => {
    const currentProp = campService?.weekdayPrices.length ?? calendar.length
    const previousProp = fields.length
    if (currentProp > previousProp) {
      for (let i = previousProp; i < currentProp; i++) {
        append({ day: calendar[i].day, amount: '' })
      }
    } else {
      for (let i = previousProp; i > currentProp; i--) {
        remove(i - 1)
      }
    }
  }, [campService?.weekdayPrices, fields])
  if (isError)
    return (
      <Box my={2} textAlign="center">
        <MuiTypography variant="h5">
          Have an errors: {error.message}
        </MuiTypography>
      </Box>
    )

  const convertToDay = (day?: number) => {
    switch (day) {
      case 1:
        return 'Chủ nhật'
      case 2:
        return 'Thứ 2'
      case 3:
        return 'Thứ 3'
      case 4:
        return 'Thứ 4'
      case 5:
        return 'Thứ 5'
      case 6:
        return 'Thứ 6'
      case 7:
        return 'Thứ 7'
    }
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: 'Chi tiết dịch vụ' }]} />
      </Box>
      <Stack
        flexDirection={'row'}
        gap={2}
        sx={{ position: 'fixed', right: '48px', top: '80px', zIndex: 999 }}
      >
        <MuiButton
          title="Lưu"
          variant="contained"
          color="primary"
          onClick={methods.handleSubmit(onSubmitHandler)}
          startIcon={<Icon>done</Icon>}
        />

        <MuiButton
          onClick={() => methods.reset()}
          title="Huỷ"
          variant="contained"
          color="warning"
          startIcon={<Icon>cached</Icon>}
        />

        <MuiButton
          title="Quay lại"
          variant="contained"
          color="inherit"
          onClick={() => navigate(-1)}
          startIcon={<Icon>keyboard_return</Icon>}
        />
      </Stack>
      <SimpleCard>
        <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
          <FormProvider {...methods}>
            {loading && <LinearProgress sx={{ mt: 0.5 }} />}
            <Grid container spacing={6}>
              <Grid item sm={6} xs={12}>
                <Stack gap={3}>
                  <MuiRHFAutoComplete
                    label="Địa điểm camp"
                    name="camp"
                    options={campGrounds?.content ?? []}
                    optionProperty="name"
                    getOptionLabel={option => option.name ?? ''}
                    defaultValue=""
                    required
                  />

                  <SelectDropDown
                    name="rentalType"
                    label="Loại dịch vụ"
                    required
                  >
                    <MenuItem value="1">Gói dịch vụ</MenuItem>
                    <MenuItem value="2">Gói lưu trú</MenuItem>
                    <MenuItem value="3">Khác</MenuItem>
                  </SelectDropDown>

                  <MuiRHFNumericFormatInput
                    type="text"
                    name="capacity"
                    label="Áp dụng"
                    placeholder=""
                    iconEnd={
                      <MuiTypography variant="subtitle2">Người</MuiTypography>
                    }
                    required
                    fullWidth
                  />

                  <FormInputText
                    type="text"
                    name="name"
                    label={'Tên dịch vụ'}
                    defaultValue=""
                    placeholder=""
                    required
                    fullWidth
                  />

                  <SelectDropDown name="status" label="Trạng thái" required>
                    <MenuItem value="1">Hiệu lực</MenuItem>
                    <MenuItem value="-1">Không hiệu lực</MenuItem>
                  </SelectDropDown>

                  <Stack
                    direction={'row'}
                    width={{
                      sx: '100%',
                    }}
                  >
                    <MuiTypography mb={1.5} flex={1}>
                      Hình ảnh:
                    </MuiTypography>
                    <Box flex={1}>
                      <UploadPreviewer
                        name="files"
                        initialMedias={campService?.images ?? []}
                        fileInfos={fileInfos}
                        mediasSrcPreviewer={mediasSrcPreviewer}
                        setMediasSrcPreviewer={setMediasSrcPreviewer}
                        mediaConfigs={fileConfigs as any}
                        selectFiles={selectFiles}
                        uploadFiles={uploadFiles}
                        removeUploadedFiles={removeUploadedFiles}
                        cancelUploading={cancelUploading}
                        uploading={uploading}
                        progressInfos={progressInfos}
                      />
                    </Box>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Stack gap={1.5}>
                  {(fields as unknown as WeekdayPrices[]).map(
                    ({ id, day, amount }: any, index) => (
                      <Stack key={id}>
                        <MuiTypography mb={1.5}>
                          {convertToDay(day)}
                        </MuiTypography>
                        <MuiRHFNumericFormatInput
                          label={'Giá'}
                          required
                          name={`weekdayPrices.${index}.amount`}
                          iconEnd={
                            <MuiTypography variant="subtitle2">
                              VNĐ/Ngày
                            </MuiTypography>
                          }
                          fullWidth
                        />
                      </Stack>
                    ),
                  )}
                </Stack>
              </Grid>
            </Grid>

            <Stack gap={1} mt={3}>
              <InputLabel sx={{ fontWeight: 500 }}>Mô tả</InputLabel>
              <RHFWYSIWYGEditor name="description" />
            </Stack>
          </FormProvider>
        </form>
      </SimpleCard>
    </Container>
  )
}
