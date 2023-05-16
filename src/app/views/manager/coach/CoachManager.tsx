import { Edit } from '@mui/icons-material'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import CachedIcon from '@mui/icons-material/Cached'
import SearchIcon from '@mui/icons-material/Search'
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload'
import {
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material'
import { Box } from '@mui/system'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { getCoachs } from 'app/apis/coachs/coachs.service'
import { Breadcrumb, Container, SimpleCard, StyledTable } from 'app/components'
import moment from 'moment'
import * as React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { headTableCoachs } from './const'

export interface Props {}

export default function CoachManager(props: Props) {
  const [page, setPage] = useState(0)
  const [countTable, setCountTable] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [coaches, setCoaches] = useState<any>()
  const [nameFilter, setNameFilter] = useState<any>('')
  const [statusFilter, setStatusFilter] = useState<any>(2)
  const [type, setType] = useState<any>(2)
  const [from, setFrom] = useState<any>(null)
  const [to, setTo] = useState<any>(null)
  const [position, setPosition] = useState<any>()
  const [isLoading, setIsLoading] = useState(false)
  const [doRerender, setDoRerender] = React.useState(false)
  const navigate = useNavigate()

  const handleChangePage = (_: any, newPage: React.SetStateAction<number>) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: {
    target: { value: string | number }
  }) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
    setDoRerender(!doRerender)
  }

  const fetchCoaches = async () => {
    setIsLoading(true)
    const res = await getCoachs({
      name: nameFilter.trim(),
      position: position,
      status: statusFilter === 2 ? null : statusFilter,
      dateStart:
        moment(from).format('YYYY-MM-DD') === 'Invalid date'
          ? null
          : moment(from).format('YYYY-MM-DD'),
      dateEnd:
        moment(to).format('YYYY-MM-DD') === 'Invalid date'
          ? null
          : moment(to).format('YYYY-MM-DD'),
      size: rowsPerPage,
      page: page,
    })
    setCoaches(res.content)
    setCountTable(res.totalElements)
    setIsLoading(false)
  }

  const handleSearch = async () => {
    setPage(0)
    setDoRerender(!doRerender)
  }

  const handleClearFilter = async () => {
    setNameFilter('')
    setTo(null)
    setStatusFilter(2)
    setFrom(null)
    setDoRerender(!doRerender)
  }

  React.useEffect(() => {
    fetchCoaches()
  }, [page, doRerender])

  return (
    <Container>
      {isLoading && (
        <Box
          sx={{
            width: '100%',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: '1000',
          }}
        >
          <LinearProgress />
        </Box>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box className="breadcrumb">
          <Breadcrumb routeSegments={[{ name: 'Quản lý ban huấn luyện' }]} />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddBoxOutlinedIcon />}
          style={{ width: '200px', margin: '15px 0', height: '52px' }}
          onClick={() => navigate('/leagues/create')}
        >
          Thêm mới ban huấn luyện
        </Button>
      </div>
      <SimpleCard>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              id="name1"
              label="Tên ban huấn luyện"
              variant="outlined"
              fullWidth
              onChange={e => {
                setNameFilter(e.target.value)
              }}
              value={nameFilter}
              onKeyDown={async e => {
                if (e.keyCode === 13) {
                  handleSearch()
                }
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Loại giải</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Vị trí"
                onChange={e => setType(e.target.value)}
              >
                <MenuItem value={99}>Tất cả</MenuItem>
                <MenuItem value={1}>Bóng đá nam</MenuItem>
                <MenuItem value={2}>Bóng đá nữ</MenuItem>
                <MenuItem value={3}>Futsal</MenuItem>
                <MenuItem value={4}>Bóng đá bãi biển</MenuItem>
                <MenuItem value={5}>Phong trào cộng đồng</MenuItem>
                <MenuItem value={6}>Khác</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={from}
                label="Từ ngày"
                onChange={newValue => setFrom(newValue)}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    size="medium"
                    variant="outlined"
                    fullWidth
                    color="primary"
                    autoComplete="bday"
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={to}
                label="Đến ngày"
                onChange={newValue => setTo(newValue)}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    size="medium"
                    variant="outlined"
                    fullWidth
                    color="primary"
                    autoComplete="bday"
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Trạng thái</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Trạng thái"
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value)
                }}
              >
                <MenuItem value={2}>Tất cả</MenuItem>
                <MenuItem value={1}>Hoạt động</MenuItem>
                <MenuItem value={0}>Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={9} style={{ textAlign: 'end' }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              style={{ marginRight: '15px', height: '50px' }}
              disabled={isLoading}
            >
              Tìm kiếm
            </Button>
            <Button
              variant="contained"
              startIcon={<CachedIcon />}
              onClick={handleClearFilter}
              disabled={isLoading}
              style={{ marginRight: '15px', height: '50px' }}
            >
              Làm mới
            </Button>
            <Button
              startIcon={<SimCardDownloadIcon />}
              variant="contained"
              disabled={isLoading}
              style={{ marginRight: '15px', height: '50px' }}
            >
              Xuất Excel
            </Button>
          </Grid>
        </Grid>
      </SimpleCard>
      <div style={{ height: '30px' }} />
      <SimpleCard title="Danh sách BHL">
        <Box width="100%" overflow="auto">
          <StyledTable>
            <TableHead>
              <TableRow>
                {headTableCoachs.map(header => (
                  <TableCell align="center" style={{ minWidth: header.width }}>
                    {header.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(coaches || []).map((coach: any, index: any) => {
                return (
                  <TableRow hover key={coach.name}>
                    <TableCell align="center">
                      {rowsPerPage * page + index + 1}
                    </TableCell>
                    <TableCell align="left">
                      <Link to="#" style={{ wordBreak: 'keep-all' }}>
                        {coach.name}
                      </Link>
                    </TableCell>
                    <TableCell align="center">{coach.position}</TableCell>
                    <TableCell align="left" style={{ wordBreak: 'keep-all' }}>
                      {coach.placeOfOrigin}
                    </TableCell>
                    <TableCell align="left" style={{ wordBreak: 'keep-all' }}>
                      {coach.birthday}
                    </TableCell>
                    <TableCell align="left" style={{ wordBreak: 'keep-all' }}>
                      {coach.dateJoin}
                    </TableCell>
                    <TableCell align="center">
                      {coach.status === 1 && (
                        <Chip label="Hoạt động" color="success" />
                      )}
                      {coach.status === 0 && (
                        <Chip label="Không hoạt động" color="warning" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Sửa" placement="top">
                        <IconButton
                          color="primary"
                          // onClick={() => navigate(`/leagues/${league.id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </StyledTable>
        </Box>
        <TablePagination
          sx={{ px: 2 }}
          page={page}
          component="div"
          rowsPerPage={rowsPerPage}
          count={countTable}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[20, 50, 100]}
          labelRowsPerPage={'Dòng / Trang'}
          onRowsPerPageChange={handleChangeRowsPerPage}
          nextIconButtonProps={{ 'aria-label': 'Next Page' }}
          backIconButtonProps={{ 'aria-label': 'Previous Page' }}
        />
      </SimpleCard>
    </Container>
  )
}
