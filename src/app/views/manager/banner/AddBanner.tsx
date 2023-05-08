import { yupResolver } from '@hookform/resolvers/yup'
import BackupIcon from '@mui/icons-material/Backup'
import DeleteIcon from '@mui/icons-material/Delete'
import { Grid, Icon, IconButton, MenuItem, Stack } from '@mui/material'
import { Box } from '@mui/system'
import { createBannerI } from 'app/apis/banner/banner.service'
import { Breadcrumb, Container, SimpleCard } from 'app/components'
import { MuiButton } from 'app/components/common/MuiButton'
import FormInputText from 'app/components/common/MuiRHFInputText'
import { SelectDropDown } from 'app/components/common/MuiRHFSelectDropdown'
import handleUploadImage from 'app/helpers/handleUploadImage'
import { toastSuccess } from 'app/helpers/toastNofication'
import { useNavigateParams } from 'app/hooks/useNavigateParams'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

export interface Props {}
type NewBanner = {
  id?: number
  title?: string
  titlePosition?: number
  titleColor?: string
  buttonContent?: string
  butonPosition?: number
  url?: string
  mediaUrl?: string
}
export default function AddBanner(props: Props) {
  const navigation = useNavigate()
  const navigate = useNavigateParams()
  const [bannerId, setBannerId] = useState<any>()
  const [searchParams] = useSearchParams()
  const queryParams = Object.fromEntries([...searchParams])
  const [page, setPage] = useState<number>(
    queryParams.page ? +queryParams.page : 0,
  )
  const [size, setSize] = useState<number>(
    queryParams.size ? +queryParams.size : 20,
  )

  const [color, setColor] = useState('')
  const [type, setType] = useState<number>(1)
  const [file, setFile] = useState<any>()
  const [previewImage, setPreviewImage] = useState<string>('')
  const [banner, setBanner] = useState<any>()

  const schema = yup
    .object({
      title: yup.string().max(255, 'Tối đa 255 ký tự'),
      titlePosition: yup.number(),
      titleColor: yup.string(),
      buttonContent: yup.string().max(255, 'Tối đa 255 ký tự'),
      url: yup.string().required('Giá trị bắt buộc').trim(),
      butonPosition: yup.number(),
      file: yup
        .mixed()
        .required('Giá trị bắt buộc')
        .test('fileType', 'File không hợp lệ', value => {
          if (value && value.name)
            return ['png', 'jpg', 'jpeg'].includes(
              value?.name?.split('.').pop(),
            )
          else return true
        })
        .test('fileSize', 'Dung lượng file <= 50MB', value => {
          return Math.floor(value?.size / 1000000) <= 50
        }),
    })
    .required()
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      titlePosition: '',
      titleColor: '#fff',
      buttonContent: '',
      butonPosition: '',
      url: '',
      file: null,
      type: '1',
    },
  })
  const onSubmitHandler = async (data: any) => {
    let imgUrl: any = ''
    if (file) {
      imgUrl = await handleUploadImage(file)
    }
    const payload: any = {
      title: data.title,
      titlePosition: data.titlePosition,
      titleColor: data.titleColor,
      buttonContent: data.buttonContent,
      butonPosition: data.butonPosition,
      type: data.type,
      url: data.url,
      imgUrl: imgUrl,
    }
    await createBannerI(payload).then(() => {
      toastSuccess({
        message: 'Thành công',
      })
      navigate('/banner', {})
    })
  }
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: 'Thêm mới banner' }]} />
      </Box>
      <SimpleCard>
        <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
          <FormProvider {...methods}>
            <Grid container spacing={6}>
              <Grid item sm={6} xs={12}>
                <Stack gap={3}>
                  <FormInputText
                    type="text"
                    name="title"
                    label={'Tiêu đề'}
                    defaultValue=""
                    placeholder="Nhập tiêu đề"
                    fullWidth
                  />
                  <Stack direction={'row'} gap={2}>
                    <SelectDropDown
                      name="titlePosition"
                      label="Vị trí tiêu đề"
                      sx={{ width: '75%' }}
                    >
                      <MenuItem value="0">Không hiển thị</MenuItem>
                      <MenuItem value="1">Trái</MenuItem>
                      <MenuItem value="2">Giữa</MenuItem>
                      <MenuItem value="3">Phải</MenuItem>
                    </SelectDropDown>
                    <Stack flexDirection={'row'} gap={1} alignItems={'center'}>
                      <div
                        style={{
                          backgroundColor: '#fff',
                          width: '50px',
                          height: '35px',
                          border: '1px solid #aeaaaa',
                        }}
                      ></div>
                      <FormInputText
                        type="text"
                        name="titleColor"
                        label={'Màu hiển thị'}
                        defaultValue=""
                        placeholder=""
                        fullWidth
                      />
                    </Stack>
                  </Stack>

                  <FormInputText
                    type="text"
                    name="buttonContent"
                    label={'Nội dung nút điều hướng'}
                    defaultValue=""
                    placeholder="Nhập nội dung muốn hiển thị"
                    fullWidth
                  />

                  <Stack flexDirection={'row'} gap={2}>
                    <SelectDropDown
                      name="butonPosition"
                      label="Vị trí nút điều hướng"
                      sx={{ width: '75%' }}
                    >
                      <MenuItem value="0">Không hiển thị</MenuItem>
                      <MenuItem value="1">Trái</MenuItem>
                      <MenuItem value="2">Giữa</MenuItem>
                      <MenuItem value="3">Phải</MenuItem>
                    </SelectDropDown>
                    <Stack flexDirection={'row'} gap={1} alignItems={'center'}>
                      <div
                        style={{
                          backgroundColor: '#fff',
                          width: '50px',
                          height: '35px',
                          border: '1px solid #aeaaaa',
                        }}
                      ></div>
                      <FormInputText
                        type="text"
                        name="butonColor"
                        label={'Màu nút'}
                        defaultValue="#fff"
                        placeholder=""
                        fullWidth
                      />
                    </Stack>
                    <Stack flexDirection={'row'} gap={1} alignItems={'center'}>
                      <div
                        style={{
                          backgroundColor: '#fff',
                          width: '50px',
                          height: '35px',
                          border: '1px solid #aeaaaa',
                        }}
                      ></div>
                      <FormInputText
                        type="text"
                        name="titleColor"
                        label={'Màu chữ'}
                        defaultValue="#fff"
                        placeholder=""
                        fullWidth
                      />
                    </Stack>
                  </Stack>
                  <FormInputText
                    type="text"
                    name="url"
                    label={'Link tới'}
                    defaultValue=""
                    placeholder="http://"
                    fullWidth
                  />
                  <Stack flexDirection={'row'} gap={2}>
                    <MuiButton
                      title="Lưu"
                      variant="contained"
                      color="primary"
                      type="submit"
                      // onClick={() => navigation(`chi-tiet-banner`, {})}
                      sx={{ width: '100px' }}
                    />
                    <MuiButton
                      title="Quay lại"
                      variant="outlined"
                      color="primary"
                      type="submit"
                      onClick={() => navigation(`/banner`, {})}
                      startIcon={<Icon>keyboard_return</Icon>}
                    />
                  </Stack>
                </Stack>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Stack gap={3}>
                  <SelectDropDown
                    name="type"
                    label="Loại"
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    sx={{ width: '80%' }}
                  >
                    <MenuItem value="1">Ảnh</MenuItem>
                    <MenuItem value="2">Video</MenuItem>
                  </SelectDropDown>

                  <input
                    type="file"
                    id="uploadImage"
                    style={{ display: 'none' }}
                    onChange={(e: any) => {
                      if (e.target.files[0].size > 52428800) {
                        toastSuccess({
                          message: 'Quá dung lượng cho phép',
                        })
                        return
                      }
                      setFile(e.target.files[0])
                      setPreviewImage(
                        window.URL.createObjectURL(e.target.files[0]),
                      )
                    }}
                  />
                  {type != 2 && (
                    <div
                      onClick={() => {
                        const inputUploadImage = document.getElementById(
                          'uploadImage',
                        ) as HTMLInputElement | null
                        inputUploadImage?.click()
                      }}
                      style={{
                        width: '80%',
                        height: '90%',
                        border: '2px dashed #aeaaaa',
                        textAlign: 'center',
                      }}
                    >
                      {!file && previewImage?.length === 0 && (
                        <div
                          style={{ marginTop: '50px', marginBottom: '50px' }}
                        >
                          <div>Chọn ảnh để tải lên</div>
                          <div>Hoặc kéo và thả tập tin</div>
                          <BackupIcon fontSize="large" />
                          <div>PNG/JPEG hoặc JPG</div>
                          <div>Dung lượng không quá 50mb</div>
                          <div>(Tỷ lệ ảnh phù hợp)</div>
                        </div>
                      )}
                      {previewImage?.length !== 0 && (
                        <>
                          {file && (
                            <div style={{ textAlign: 'right' }}>
                              <IconButton
                                aria-label="delete"
                                size="large"
                                style={{ position: 'relative' }}
                                onClick={event => {
                                  setFile(null)
                                  console.log(banner)
                                  setPreviewImage(banner.imageUrl)
                                  event.stopPropagation()
                                }}
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </div>
                          )}

                          <img
                            src={previewImage}
                            width="30%"
                            height="40%"
                            style={{ objectFit: 'contain' }}
                          ></img>
                        </>
                      )}
                    </div>
                  )}
                  {type == 2 && (
                    <div
                      onClick={() => {
                        const inputUploadImage = document.getElementById(
                          'uploadImage',
                        ) as HTMLInputElement | null
                        inputUploadImage?.click()
                      }}
                      style={{
                        width: '80%',
                        height: '90%',
                        border: '2px dashed #aeaaaa',
                        textAlign: 'center',
                      }}
                    >
                      {!file && previewImage?.length === 0 && (
                        <div
                          style={{ marginTop: '50px', marginBottom: '50px' }}
                        >
                          <div>Chọn video để tải lên</div>
                          <div>Hoặc kéo và thả tập tin</div>
                          <BackupIcon fontSize="large" />
                          <div>MP4, MOV, 3GP hoặc WebM</div>
                          <div>Dung lượng không quá 50mb</div>
                          <div>
                            (Lưu ý: video nặng sẽ khiến trải nghiệm người dùng
                            không được mượt mà)
                          </div>
                        </div>
                      )}
                      {previewImage?.length !== 0 && (
                        <>
                          {file && (
                            <div style={{ textAlign: 'right' }}>
                              <IconButton
                                aria-label="delete"
                                size="large"
                                style={{ position: 'relative' }}
                                onClick={event => {
                                  setFile(null)
                                  console.log(banner)
                                  setPreviewImage(banner.imageUrl)
                                  event.stopPropagation()
                                }}
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </div>
                          )}

                          <img
                            src={previewImage}
                            width="30%"
                            height="40%"
                            style={{ objectFit: 'contain' }}
                          ></img>
                        </>
                      )}
                    </div>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </FormProvider>
        </form>
      </SimpleCard>
    </Container>
  )
}
