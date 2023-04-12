import { ROLES } from './utils/enums/roles'

export const navigations = [
  { name: 'Trang chủ', path: '/dashboard', icon: 'dashboard' },
  {
    name: 'Quản lý khách hàng',
    path: '/customers',
    icon: 'person',
  },
  {
    name: 'Quản lý cầu thủ',
    path: '/players',
    icon: 'accessibility',
  },
  { name: 'Quản lý tin tức', path: '/news', icon: 'newspaper' },
  { name: 'Quản lý đội bóng', path: '/teams', icon: 'groups' },
  { name: 'Quản lý lịch thi đấu', path: '/schedules', icon: 'schedule' },
  { name: 'Quản lý CAHN TV', path: '/videos', icon: 'movie' },
  { name: 'Quản lý cửa hàng', path: '/shop', icon: 'storefront' },
  { name: 'Quản lý tài khoản vận hành', path: '/accounts', icon: 'contacts' },
  { name: 'Quản lý đơn hàng', path: '/orders', icon: 'notes' },
  // {
  //   name: 'Quản lý giải đấu',
  //   icon: 'sports_soccer',
  //   children: [
  //     {
  //       name: 'BXH',
  //       iconText: 'SI',
  //       path: '/quan-ly-thong-bao/nguoi-dung',
  //     },
  //     {
  //       name: 'Quản lý cố phiếu đội',
  //       iconText: 'SU',
  //       path: '/quan-ly-thong-bao/dau-trang',
  //     },
  //   ],
  //   auth: [ROLES.ADMIN],
  // },
  // {
  //   name: 'Quản lý Homepages',
  //   path: '/quan-ly-tai-khoan-admin',
  //   icon: 'mediation',
  //   auth: [ROLES.ADMIN],
  // },
]
