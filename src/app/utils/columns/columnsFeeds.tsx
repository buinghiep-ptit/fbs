import { Chip, Icon, IconButton, Typography } from '@mui/material'
import { MuiTypography } from 'app/components/common/MuiTypography'
import { TableColumn, TitleFeeds } from 'app/models'
import { ISODateTimeFormatter } from '../formatters/dateTimeFormatters'
import { LabelFormatter } from '../formatters/labelFormatter'

export const columnFeeds: readonly TableColumn<TitleFeeds>[] = [
  {
    id: 'order',
    label: 'STT',
    minWidth: 50,
    sticky: {
      position: 'sticky',
      left: 0,
      background: 'white',
      zIndex: 9,
    },
  },
  {
    id: 'account',
    label: 'Tài khoản',
    minWidth: 170,
    action: (value: any) => (
      <Typography color={'primary'} sx={{ textDecorationLine: 'underline' }}>
        {value}
      </Typography>
    ),
    sticky: {
      position: 'sticky',
      left: 50,
      background: 'white',
      zIndex: 9,
      boxShadow: '-10px -10px 15px rgba(0,0,0,0.5)',
      clipPath: 'inset(0px -15px 0px 0px)',
    },
  },
  {
    id: 'content',
    label: 'Nội dung',
    minWidth: 250,
    align: 'left',
    format: (value: number) => (
      <Typography
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: '3',
          WebkitBoxOrient: 'vertical',
        }}
      >
        {value}
      </Typography>
    ),
  },
  {
    id: 'customerType',
    label: 'Loại tài khoản',
    minWidth: 170,
    align: 'center',
    format: (value: number) => LabelFormatter(value, 'customerType'),
  },
  {
    id: 'dateCreated',
    label: 'Thời gian đăng',
    minWidth: 170,
    align: 'center',
    format: (value: string) => ISODateTimeFormatter(value),
  },
  {
    id: 'type',
    label: 'Thể loại',
    minWidth: 100,
    align: 'center',
    format: (value: any) => (
      <Chip
        label={value === 1 ? 'Video' : 'Ảnh'}
        size="small"
        color={'primary'}
        sx={{ m: 0.5 }}
      />
    ),
  },
  {
    id: 'status',
    label: 'Trạng thái',
    minWidth: 120,
    align: 'center',
    status: (value: any) => LabelFormatter(value, 'feed'),
  },
  {
    id: 'handler',
    label: 'Người tiếp nhận',
    minWidth: 150,
    align: 'center',
  },
  {
    id: 'reportedNum',
    label: 'Số b/c vi phạm',
    minWidth: 170,
    align: 'center',
  },
  {
    id: 'edit',
    label: '',
    minWidth: 50,
    align: 'right',
    action: () => (
      <IconButton size="small">
        <Icon color="primary">east</Icon>
      </IconButton>
    ),
    sticky: {
      position: 'sticky',
      right: 130,
      background: 'white',
      boxShadow: '0px 0px 4px rgba(0,0,0,0.15)',
      clipPath: 'inset(0px 0px 0px -15px)',
    },
  },
  {
    id: 'approve',
    label: 'Thao tác',
    minWidth: 80,
    align: 'center',
    action: (status?: number) =>
      [-2, -1, 0].includes(status ?? 0) ? (
        <IconButton size="small">
          <Icon color="primary">checklist</Icon>
        </IconButton>
      ) : (
        <></>
      ),
    sticky: {
      position: 'sticky',
      right: 50,
      background: 'white',
    },
  },
  {
    id: 'violate',
    label: '',
    minWidth: 50,
    align: 'left',
    action: (status?: number) =>
      [-2, 0, 1].includes(status ?? 0) ? (
        <IconButton size="small">
          <Icon color="error">report</Icon>
        </IconButton>
      ) : (
        <></>
      ),
    sticky: {
      position: 'sticky',
      right: 0,
      background: 'white',
    },
  },
]
