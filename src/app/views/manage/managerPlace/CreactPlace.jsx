import {
  Box,
  Button,
  Grid,
  Autocomplete,
  styled,
  TextField,
} from '@mui/material'
import { Breadcrumb, SimpleCard } from 'app/components'
import * as React from 'react'
import UploadImage from 'app/components/common/uploadImage'
import Typography from '@mui/material/Typography'
import { createPlace } from 'app/apis/place/place.service'
import {
  getDistricts,
  getProvinces,
  getWards,
} from 'app/apis/common/common.service'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toastSuccess } from 'app/helpers/toastNofication'
import { useNavigate } from 'react-router-dom'
import MapCustom from 'app/components/common/MapCustom/MapCustom'

const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}))

export default function CreatePlace(props) {
  const [hashtag, setHashtag] = React.useState([])
  const [provinceId, setProvinceId] = React.useState(null)
  const [districtId, setDistrictId] = React.useState('')
  const [provinces, setProvinces] = React.useState([])
  const [districts, setDistricts] = React.useState([])
  const [wards, setWards] = React.useState([])

  const typeCamp = [
    { label: 'Cắm trại', id: 1 },
    { label: 'Chạy bộ', id: 2 },
    { label: 'Teambuiding', id: 3 },
    { label: 'Lưu trú', id: 4 },
    { label: 'Trekking', id: 5 },
    { label: 'Leo núi', id: 6 },
  ]

  const uploadImageRef = React.useRef()
  const mapRef = React.useRef()
  const navigate = useNavigate()

  const schema = yup
    .object({
      namePlace: yup.string().required('Vui lòng nhập tên địa danh').trim(),
      province: yup.object().required(),
      district: yup.object().required(),
      description: yup.string().required('Vui lòng nhập mô tả').trim(),
    })
    .required()

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      namePlace: '',
      province: null,
      district: null,
      ward: null,
      address: '',
      description: '',
      hashtag: [],
    },
  })

  const addHashTag = e => {
    if (e.keyCode === 13 && !!e.target.value.trim()) {
      setValue('hashtag', [...getValues('hashtag'), { value: e.target.value }])
      e.preventDefault()
    }
  }

  const fetchGetProvinces = async () => {
    const res = await getProvinces()
    setProvinces(res)
    return
  }

  const handleDataImageUpload = async () => {
    const introData = uploadImageRef.current.getFiles()
    const fileUpload = [...introData].map(file => {
      console.log(file)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const token = window.localStorage.getItem('accessToken')
        const res = axios({
          method: 'post',
          url: 'https://dev09-api.campdi.vn/upload/api/image/upload',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        })
        return res
      } catch (e) {
        console.log(e)
      }
    })

    const response = await Promise.all(fileUpload)
    if (response) return response.map(item => item.data.url)
  }

  const onSubmit = async data => {
    console.log(data)

    const listUrlImage = await handleDataImageUpload()
    const mediasUpdate = listUrlImage.map((url, index) => {
      const media = new Object()
      media.srcType = 2
      media.mediaType = index === 0 ? 2 : 1
      media.mediaFormat = 2
      media.url = url
      return media
    })

    const { lat, lng } = mapRef.current.getCreateDegrees()
    const paramDetail = {
      medias: mediasUpdate,
      name: data.namePlace.trim(),
      description: data.description.trim(),
      idProvince: data?.province.id || null,
      idWard: data?.ward?.id || null,
      idDistrict: data?.district.id || null,
      longitude: lng,
      latitude: lat,
      address: data.address.trim(),
      tags: data.hashtag,
      imgUrl: '',
      status: 1,
      campAreaTypes: data.campAreaTypes.map(type => type.id),
    }

    const res = await createPlace(paramDetail)
    if (res) {
      toastSuccess({ message: 'Tạo địa danh thành công' })
      fetchGetProvinces()
      navigate('/quan-ly-thong-tin-dia-danh')
    }
  }

  React.useEffect(() => {
    if (provinceId)
      getDistricts(provinceId)
        .then(dataDistrict => {
          setDistricts(dataDistrict)
          setValue('district', null)
          setValue('ward', null)
          setWards([])
        })
        .catch(err => console.log(err))
  }, [provinceId])

  React.useEffect(() => {
    if (districtId)
      getWards(districtId)
        .then(dataWard => {
          setWards(dataWard)
          setValue('ward', null)
        })
        .catch(err => console.log(err))
  }, [districtId])

  React.useEffect(() => {
    fetchGetProvinces()
  }, [])

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Quản lý địa danh', path: '/quan-ly-thong-tin-dia-danh' },
            { name: 'Thêm địa danh' },
          ]}
        />
      </Box>
      <SimpleCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container>
            <Grid item xs={12} md={12}>
              <Controller
                name="namePlace"
                control={control}
                render={({ field }) => (
                  <TextField
                    error={errors.namePlace}
                    helperText={errors.namePlace?.message}
                    {...field}
                    label="Tên địa danh*"
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={12} style={{ display: 'flex' }}>
              <Controller
                name="province"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    disablePortal
                    {...field}
                    options={provinces}
                    getOptionLabel={option => option.name}
                    sx={{ width: 200, marginRight: 5 }}
                    onChange={(_, data) => {
                      field.onChange(data)
                      setProvinceId(getValues('province').id)
                    }}
                    renderInput={params => (
                      <TextField
                        error={errors.province}
                        helperText={
                          errors.province ? 'Vui lòng chọn tỉnh/thành' : ''
                        }
                        {...params}
                        label="Tỉnh/thành phố*"
                        margin="normal"
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disablePortal
                    id="combo-box-demo"
                    onChange={(_, data) => {
                      field.onChange(data)
                      setDistrictId(getValues('district').id)
                    }}
                    options={districts}
                    getOptionLabel={option => option.name}
                    sx={{ width: 200, marginRight: 5 }}
                    renderInput={params => (
                      <TextField
                        error={errors.district}
                        helperText={
                          errors.district ? 'Vui lòng chọn quận/huyện' : ''
                        }
                        {...params}
                        label="Quận huyện*"
                        margin="normal"
                      />
                    )}
                  />
                )}
              />
              <Controller
                control={control}
                name="ward"
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disablePortal
                    id="combo-box-demo"
                    options={wards}
                    onChange={(_, data) => field.onChange(data)}
                    getOptionLabel={option => option.name}
                    sx={{ width: 200, marginRight: 5 }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Xã phường"
                        margin="normal"
                      />
                    )}
                  />
                )}
              />
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={errors.address}
                    helperText={errors.address?.message}
                    label="Địa danh"
                    variant="outlined"
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <MapCustom
                ref={mapRef}
                center={{
                  lat: 21.027161210811197,
                  lng: 105.78872657468659,
                }}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Controller
                name="campAreaTypes"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    {...field}
                    options={typeCamp}
                    getOptionLabel={option => option.label}
                    filterSelectedOptions
                    onChange={(_, data) => field.onChange(data)}
                    sx={{ width: 400, marginRight: 5 }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        // error={errors.namePlace}
                        // helperText={errors.namePlace?.message}
                        variant="outlined"
                        label="Loại hình"
                        placeholder="Loại hình"
                        fullWidth
                        margin="normal"
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Controller
                name="hashtag"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    open={false}
                    popupIcon={''}
                    options={[...hashtag]}
                    getOptionLabel={option => option.value}
                    filterSelectedOptions
                    sx={{ width: 400, marginRight: 5 }}
                    onChange={(_, data) => field.onChange(data)}
                    renderInput={params => (
                      <TextField
                        error={errors.hashtag}
                        helperText={errors.hashtag?.message}
                        {...params}
                        variant="outlined"
                        label="Hashtag"
                        placeholder="Hashtag"
                        fullWidth
                        margin="normal"
                        onKeyDown={addHashTag}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField
                    error={errors.description}
                    helperText={errors.description?.message}
                    {...field}
                    label="Mô tả*"
                    margin="normal"
                    multiline
                    rows={10}
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>

          <Typography>Ảnh:</Typography>
          <UploadImage ref={uploadImageRef}></UploadImage>
          <Button color="primary" type="submit" variant="contained">
            Lưu
          </Button>
        </form>
      </SimpleCard>
    </Container>
  )
}
