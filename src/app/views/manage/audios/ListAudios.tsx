import { yupResolver } from '@hookform/resolvers/yup'
import { ChangeCircleSharp, SearchSharp } from '@mui/icons-material'
import { Grid, Icon, MenuItem, Stack, styled } from '@mui/material'
import { Box } from '@mui/system'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { fetchAudios } from 'app/apis/audio/audio.service'
import { Breadcrumb, SimpleCard } from 'app/components'
import { MuiButton } from 'app/components/common/MuiButton'
import FormInputText from 'app/components/common/MuiRHFInputText'
import { SelectDropDown } from 'app/components/common/MuiRHFSelectDropdown'
import MuiStyledPagination from 'app/components/common/MuiStyledPagination'
import MuiStyledTable from 'app/components/common/MuiStyledTable'
import { MuiTypography } from 'app/components/common/MuiTypography'
import { toastSuccess } from 'app/helpers/toastNofication'
import { useApproveFeed } from 'app/hooks/queries/useFeedsData'
import { useNavigateParams } from 'app/hooks/useNavigateParams'
import { IFeed } from 'app/models'
import { IAudioOverall, IAudioResponse } from 'app/models/audio'
import { columnFeeds } from 'app/utils/columns'
import { columnsAudios } from 'app/utils/columns/columnsAudios'
import { extractMergeFiltersObject } from 'app/utils/extraSearchFilters'
import React, { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'
import { DiagLogConfirm } from '../orders/details/ButtonsLink/DialogConfirm'

const Container = styled('div')<Props>(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}))

export interface IAudiosFilters {
  search?: string
  status?: 0 | 1 | 'all' | string | undefined //  0:Chờ hậu kiểm 1:Đã duyệt -1:Vi phạm  -2:Bị báo cáo -3:Đã xóa
  page?: number | 0
  size?: number | 20
  sort?: string
}

export interface Props {}

export default function ListAudios(props: Props) {
  const navigate = useNavigateParams()
  const navigation = useNavigate()
  const [searchParams] = useSearchParams()
  const queryParams = Object.fromEntries([...searchParams])
  const [page, setPage] = useState<number>(
    queryParams.page ? +queryParams.page : 0,
  )
  const [size, setSize] = useState<number>(
    queryParams.size ? +queryParams.size : 20,
  )
  const [isReset, setIsReset] = useState<boolean>(false)

  const [defaultValues] = useState<IAudiosFilters>({
    search: queryParams.search ?? '',
    status: queryParams.status ?? 'all',
    page: queryParams.page ? +queryParams.page : 0,
    size: queryParams.size ? +queryParams.size : 20,
  })

  const [filters, setFilters] = useState<IAudiosFilters>(
    extractMergeFiltersObject(defaultValues, {}),
  )

  const [titleDialog, setTitleDialog] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState(1)
  const [feedId, setFeedId] = useState(0)

  const validationSchema = Yup.object().shape({
    search: Yup.string()
      .min(0, 'email must be at least 0 characters')
      .max(255, 'email must be at almost 256 characters'),
  })

  const methods = useForm<IAudiosFilters>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  })

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  }: UseQueryResult<IAudioResponse, Error> = useQuery<IAudioResponse, Error>(
    ['audios', filters],
    () => fetchAudios(filters),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      enabled: !!filters,
    },
  )

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
    setFilters(prevFilters => {
      return {
        ...prevFilters,
        page: +newPage,
      }
    })
    navigate('', {
      ...filters,
      page: +newPage,
    } as any)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSize(+event.target.value)
    setPage(0)
    setFilters(prevFilters => {
      return {
        ...prevFilters,
        page: 0,
        size: +event.target.value,
      }
    })
    navigate('', {
      ...filters,
      page: 0,
      size: +event.target.value,
    } as any)
  }

  const onSubmitHandler: SubmitHandler<IAudiosFilters> = (
    values: IAudiosFilters,
  ) => {
    setPage(0)
    setSize(20)
    setIsReset(false)
    setFilters(prevFilters => {
      return {
        ...extractMergeFiltersObject(prevFilters, values),
        page: 0,
        size: 20,
      }
    })

    navigate('', {
      ...extractMergeFiltersObject(filters, values),
      page: 0,
      size: 20,
    } as any)
  }

  const onResetFilters = () => {
    setIsReset(true)
    methods.reset({
      status: 'all',
      search: '',
      page: 0,
      size: 20,
    })

    setPage(0)
    setSize(20)

    setFilters({
      page: 0,
      size: 20,
    })

    navigate('', {
      page: 0,
      size: 20,
    } as any)
  }

  const onSuccess = (data: any) => {
    toastSuccess({
      message: dialogType === 1 ? 'Duyệt bài thành công' : '',
    })
    setOpenDialog(false)
  }
  const { mutate: approve, isLoading: approveLoading } =
    useApproveFeed(onSuccess)

  const approveConfirm = () => {
    approve(feedId)
  }

  const onRowUpdate = (cell: any, row: any) => {
    console.log(cell, row)
  }
  const onRowDelete = (cell: any, row: any) => {
    console.log(cell, row)
  }

  const onClickRow = (cell: any, row: any) => {
    if (cell.action) {
      if (['edit', 'account'].includes(cell.id)) {
        navigation(`${row.feedId}`, {})
      } else if (cell.id === 'approve' && ![1, -3].includes(row.status)) {
        setTitleDialog('Duyệt bài đăng')
        setFeedId(row.feedId)
        setOpenDialog(true)
      } else if (cell.id === 'violate' && ![-1, -3].includes(row.status)) {
        navigation(`ds/${row.feedId ?? 0}/vi-pham`, {
          state: { modal: true },
        })
      }
    }
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: 'Quản lý Feed' }]} />
      </Box>
      <Stack
        flexDirection={'row'}
        gap={2}
        sx={{ position: 'fixed', right: '48px', top: '80px', zIndex: 9 }}
      >
        <MuiButton
          title="Thêm bài hát"
          variant="contained"
          color="primary"
          type="submit"
          onClick={() =>
            navigation('them-moi', {
              state: { modal: true },
            })
          }
          startIcon={<Icon>control_point</Icon>}
        />
      </Stack>
      <Stack gap={3}>
        <SimpleCard>
          <form onSubmit={methods.handleSubmit(onSubmitHandler)}>
            <FormProvider {...methods}>
              <Grid container spacing={2}>
                <Grid item sm={3} xs={12}>
                  <FormInputText
                    label={'Tến bài hát/Người thể hiện/Tác giả'}
                    type="text"
                    name="search"
                    size="small"
                    placeholder="Nhập từ khoá"
                    fullWidth
                    defaultValue=""
                  />
                </Grid>

                <Grid item sm={3} xs={12}>
                  <SelectDropDown name="status" label="Trạng thái">
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="1">Hoạt động</MenuItem>
                    <MenuItem value="0">Không hoạt động</MenuItem>
                  </SelectDropDown>
                </Grid>

                <Grid item sm={3} xs={12}>
                  <MuiButton
                    loading={!isReset && isFetching}
                    title="Tìm kiếm"
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{ width: '100%' }}
                    startIcon={<SearchSharp />}
                  />
                </Grid>
                <Grid item sm={3} xs={12}>
                  <MuiButton
                    loading={isReset && isFetching}
                    title="Làm mới"
                    variant="outlined"
                    color="primary"
                    onClick={onResetFilters}
                    sx={{ width: '100%' }}
                    startIcon={<ChangeCircleSharp />}
                  />
                </Grid>
              </Grid>
            </FormProvider>
          </form>
        </SimpleCard>

        <SimpleCard>
          <MuiStyledTable
            rows={data ? (data?.content as IAudioOverall[]) : []}
            columns={columnsAudios}
            rowsPerPage={size}
            page={page}
            onClickRow={onClickRow}
            isFetching={isFetching}
            error={isError ? error : null}
            actions={[
              {
                icon: 'edit_calendar',
                color: 'warning',
                tooltip: 'Chi tiết',
                onClick: onRowUpdate,
              },
              {
                icon: 'delete',
                color: 'error',
                tooltip: 'Xoá',
                onClick: onRowDelete,
              },
            ]}
          />
          <MuiStyledPagination
            component="div"
            rowsPerPageOptions={[20, 50, 100]}
            count={data ? (data?.totalElements as number) : 0}
            rowsPerPage={size}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </SimpleCard>
      </Stack>

      <DiagLogConfirm
        title={titleDialog}
        open={openDialog}
        setOpen={setOpenDialog}
        onSubmit={approveConfirm}
      >
        <Stack py={5} justifyContent={'center'} alignItems="center">
          <MuiTypography variant="subtitle1">
            Đồng ý duyệt bài đăng?
          </MuiTypography>
        </Stack>
      </DiagLogConfirm>
    </Container>
  )
}