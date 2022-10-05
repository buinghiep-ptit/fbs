import { yupResolver } from '@hookform/resolvers/yup'
import { ApprovalRounded, CancelSharp } from '@mui/icons-material'
import { Grid, LinearProgress, MenuItem, Stack, styled } from '@mui/material'
import { Box } from '@mui/system'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { getEventDetail } from 'app/apis/events/event.service'
import { Breadcrumb, SimpleCard } from 'app/components'
import { MuiButton } from 'app/components/common/MuiButton'
import MuiLoading from 'app/components/common/MuiLoadingApp'
import { MuiAutocompleteWithTags } from 'app/components/common/MuiRHFAutocompleteWithTags'
import { MuiCheckBox } from 'app/components/common/MuiRHFCheckbox'
import { MuiRHFDatePicker } from 'app/components/common/MuiRHFDatePicker'
import FormInputText from 'app/components/common/MuiRHFInputText'
import { SelectDropDown } from 'app/components/common/MuiRHFSelectDropdown'
import MuiRHFNumericFormatInput from 'app/components/common/MuiRHFWithNumericFormat'
import { MuiTypography } from 'app/components/common/MuiTypography'
import RHFWYSIWYGEditor from 'app/components/common/RHFWYSIWYGEditor'
import { UploadPreviewer } from 'app/components/common/UploadPreviewer'
import { toastSuccess } from 'app/helpers/toastNofication'
import { checkIfFilesAreTooBig } from 'app/helpers/validateUploadFiles'
import { useCreateEvent } from 'app/hooks/queries/useEventsData'
import { useUploadFiles } from 'app/hooks/useFilesUpload'
import { IEventDetail, IMediaOverall, ITags } from 'app/models'
import { EMediaFormat, EMediaType } from 'app/utils/enums/medias'
import { GtmToYYYYMMDD } from 'app/utils/formatters/dateTimeFormatters'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'

export interface Props {}

type SchemaType = {
  name?: string
  typeFile?: number
  files?: any
  isEveryYear?: boolean
  startDate?: string
  endDate?: string
  hashtag?: ITags[]
  amount?: number
  status?: number
  editor_content?: string
}

const Container = styled('div')<Props>(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}))

export default function AddEvent(props: Props) {
  const { eventId } = useParams()
  const [fileConfigs, setFileConfigs] = useState({
    mediaFormat: EMediaFormat.IMAGE,
    accept: 'image/*',
    multiple: true,
    mediaType: EMediaType.POST,
  })
  const [mediasSrcPreviewer, setMediasSrcPreviewer] = useState<IMediaOverall[]>(
    [],
  )

  const [defaultValues] = useState<SchemaType>({
    typeFile: EMediaFormat.IMAGE,
    isEveryYear: false,
    hashtag: [{ value: 'hashtag' }],
    status: 1,
    amount: 0,
  })

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Tên không được bỏ trống'),
    startDate: Yup.date()
      //   .min(new Date(), 'Tối thiều là hôm nay')
      .typeError('Sai dịnh dạng.')
      .nullable()
      .required('Chọn ngày bắt đầu'),
    endDate: Yup.date()
      .when('startDate', (startDate, yup) => {
        if (startDate && startDate != 'Invalid Date') {
          const dayAfter = new Date(startDate.getTime() + 86400000)
          return yup.min(dayAfter, 'Ngày kết thúc phải lớn hơn ngày đắt đầu')
        }
        return yup
      })
      .typeError('Sai định dạng.')
      .nullable()
      .required('Chọn ngày kết thúc.'),
    amount: Yup.string().nullable(),
    files: Yup.mixed()
      .required('Vui lòng chọn file')
      .test(
        'fileSize',
        fileConfigs.mediaFormat === EMediaFormat.VIDEO
          ? 'Dung lượng video tối đa 3phút'
          : 'Dung lượng ảnh tối đa 10MB/ảnh',
        files => checkIfFilesAreTooBig(files, fileConfigs.mediaFormat),
      ),
  })

  const methods = useForm<SchemaType>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  })

  const [
    selectFiles,
    uploadFiles,
    removeSelectedFiles,
    uploading,
    progressInfos,
    message,
    fileInfos,
  ] = useUploadFiles()

  const {
    data: event,
    isLoading,
    fetchStatus,
    isError,
    error,
  }: UseQueryResult<IEventDetail, Error> = useQuery<IEventDetail, Error>(
    ['feed', eventId],
    () => getEventDetail(Number(eventId ?? 0)),
    {
      enabled: !!eventId,
    },
  )

  useEffect(() => {
    if (event) {
      defaultValues.name = event.name
      defaultValues.isEveryYear = event.isEveryYear === 1 ? true : false
      defaultValues.hashtag = event.tags
      defaultValues.amount = event.amount ?? 0
      defaultValues.status = event.status
      defaultValues.editor_content = event.content
      defaultValues.startDate = event.startDate
      defaultValues.endDate = event.endDate
      defaultValues.editor_content = event.content

      setMediasSrcPreviewer(event.medias ?? [])

      methods.reset({ ...defaultValues })
    }
  }, [event])

  const onSubmitHandler: SubmitHandler<SchemaType> = (values: SchemaType) => {
    const files = fileInfos.map(file => ({
      mediaType: EMediaType.POST,
      mediaFormat: fileConfigs.mediaFormat,
      url: file.url,
    }))

    const payload: IEventDetail = {
      name: values.name,
      content: values.editor_content,
      medias: files,
      isEveryYear: values.isEveryYear ? 1 : 0,
      startDate: GtmToYYYYMMDD(values.startDate as string),
      endDate: GtmToYYYYMMDD(values.endDate as string),
      amount: Number(values.amount ?? 0),
      status: Number(values.status ?? -1),
      tags: values.hashtag ?? [],
    }
    add(payload)
  }
  const onRowUpdateSuccess = (data: any) => {
    toastSuccess({ message: 'Thêm mới thành công' })
    setMediasSrcPreviewer([])
    methods.reset()
  }
  const { mutate: add, isLoading: createLoading } =
    useCreateEvent(onRowUpdateSuccess)

  useEffect(() => {
    if (Number(methods.watch('typeFile') ?? 0) === EMediaFormat.IMAGE) {
      setFileConfigs(prev => ({
        ...prev,
        mediaFormat: EMediaFormat.IMAGE,
        multiple: true,
        accept: 'image/*',
      }))
    } else {
      setFileConfigs(prev => ({
        ...prev,
        mediaFormat: EMediaFormat.VIDEO,
        accept: 'video/*',
        multiple: false,
      }))
    }
    methods.setValue('files', null)
  }, [methods.watch('typeFile')])

  if (isLoading && fetchStatus === 'fetching') return <MuiLoading />

  if (isError)
    return (
      <Box my={2} textAlign="center">
        <MuiTypography variant="h5">
          Have an errors: {error.message}
        </MuiTypography>
      </Box>
    )
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Quản lý sự kiện', path: '/quan-ly-su-kien' },
            { name: 'Thêm mới sự kiện' },
          ]}
        />
      </Box>
      <SimpleCard title="Thêm mới">
        <form
          onSubmit={methods.handleSubmit(onSubmitHandler)}
          noValidate
          autoComplete="off"
        >
          <FormProvider {...methods}>
            <Grid container spacing={3}>
              <Grid item sm={5} xs={12}>
                <Stack gap={3}>
                  <Grid container spacing={2}>
                    <Grid item sm={6} xs={6}>
                      <MuiButton
                        title="Lưu"
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ width: '100%' }}
                        loading={createLoading}
                        startIcon={<ApprovalRounded />}
                      />
                    </Grid>
                    <Grid item sm={6} xs={6}>
                      <MuiButton
                        onClick={() => methods.reset()}
                        title="Huỷ"
                        variant="outlined"
                        color="secondary"
                        sx={{ width: '100%' }}
                        startIcon={<CancelSharp />}
                      />
                    </Grid>
                  </Grid>

                  {createLoading && <LinearProgress sx={{ mt: 0.5 }} />}

                  <Stack>
                    <FormInputText
                      type="text"
                      name="name"
                      label={'Tên sự kiện'}
                      defaultValue=""
                      placeholder="Nhập tên events"
                      fullWidth
                    />
                  </Stack>
                  <Stack flexDirection={'column'}>
                    <Stack
                      flexDirection={'row'}
                      gap={1.5}
                      alignItems={'center'}
                    >
                      <MuiTypography variant="subtitle2" pb={1}>
                        Thời gian diễn ra:
                      </MuiTypography>
                      <Box mt={-1}>
                        <MuiCheckBox name="isEveryYear" label="Hàng năm" />
                      </Box>
                    </Stack>

                    <Stack flexDirection={'row'} gap={3}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Stack flexDirection={'row'} gap={1}>
                          <MuiRHFDatePicker
                            name="startDate"
                            label="Ngày bắt đầu"
                          />
                        </Stack>
                        <Stack flexDirection={'row'} gap={1}>
                          <MuiRHFDatePicker
                            name="endDate"
                            label="Ngày kết thúc"
                          />
                        </Stack>
                      </LocalizationProvider>
                      {/* <CalPicker
                        label="Select date and time"
                        name="startDate"
                      /> */}
                    </Stack>
                  </Stack>
                  <Stack>
                    <SelectDropDown name="typeFile" label="Loại file tải lên">
                      <MenuItem value={1}>Video</MenuItem>
                      <MenuItem value={2}>Ảnh</MenuItem>
                    </SelectDropDown>
                  </Stack>
                  <Stack>
                    <MuiAutocompleteWithTags name="hashtag" label="Hashtag" />
                  </Stack>

                  <MuiRHFNumericFormatInput
                    type="text"
                    name="amount"
                    label="Giá tham gia"
                    placeholder="Nhập giá"
                    defaultValue=""
                    iconEnd={
                      <MuiTypography variant="subtitle2">VNĐ</MuiTypography>
                    }
                    fullWidth
                  />

                  <Stack>
                    <SelectDropDown name="status" label="Trạng thái">
                      <MenuItem value="1">Hoạt động</MenuItem>
                      <MenuItem value="-1">Không hoạt động</MenuItem>
                    </SelectDropDown>
                  </Stack>
                </Stack>
              </Grid>

              <Grid
                item
                sm={7}
                xs={12}
                justifyContent="center"
                alignItems={'center'}
              >
                <Stack
                  gap={2}
                  flexDirection={'column'}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <Box
                    width={{
                      sx: '100%',
                      md:
                        fileConfigs.mediaFormat === EMediaFormat.VIDEO
                          ? 300
                          : 500,
                    }}
                    position="relative"
                  >
                    <UploadPreviewer
                      name="files"
                      mediasSrcPreviewer={mediasSrcPreviewer}
                      setMediasSrcPreviewer={setMediasSrcPreviewer}
                      mediaConfigs={fileConfigs}
                      selectFiles={selectFiles}
                      uploadFiles={uploadFiles}
                      removeSelectedFiles={removeSelectedFiles}
                      uploading={uploading}
                      progressInfos={progressInfos}
                    />
                  </Box>
                </Stack>
              </Grid>

              <Grid item sm={12}>
                <Stack>
                  <MuiTypography variant="subtitle2" pb={1}>
                    Nội dung
                  </MuiTypography>
                  <RHFWYSIWYGEditor name="editor_content" />
                </Stack>
              </Grid>
            </Grid>
          </FormProvider>
        </form>
      </SimpleCard>
    </Container>
  )
}
