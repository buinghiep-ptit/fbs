import Loadable from 'app/components/Loadable'
import { navCustomerDetail } from 'app/utils/navbars'
import { lazy } from 'react'
// import { LayoutCustomer } from './accounts/customers/LayoutCustomerDetail'
import CreateMerchant from './managerMerchant/CreactMerchant'
import { Navigate, Outlet } from 'react-router-dom'
import { LayoutWithNavTabs } from './layoutWithTabs/LayoutWithNavTabs'

const AdminAccounts = Loadable(
  lazy(() => import('./accounts/ManagementAdminAccounts')),
)
const UserDetail = Loadable(lazy(() => import('./accounts/users/UserDetail')))
const CreateUser = Loadable(lazy(() => import('./accounts/users/CreateUser')))

const CustomerAccounts = Loadable(
  lazy(() => import('./accounts/ManagementCustomerAccounts')),
)
const CustomerDetail = Loadable(
  lazy(() => import('./accounts/customers/CustomerInfoDetail')),
)
const ChangePassword = Loadable(
  lazy(() => import('./accounts/customers/details/ChangePassword')),
)
const LockCustomer = Loadable(
  lazy(() => import('./accounts/customers/details/LockCustomer')),
)
const UnlockCustomer = Loadable(
  lazy(() => import('./accounts/customers/details/UnlockCustomer')),
)
const OrdersHistoryTab = Loadable(
  lazy(() => import('./accounts/customers/OrdersHistoryTab')),
)

const ManagerFeed = Loadable(lazy(() => import('./feeds/ManagerFeed')))
const FeedDetail = Loadable(lazy(() => import('./feeds/FeedDetail')))
const PostsCheck = Loadable(lazy(() => import('./feeds/PostsCheck')))
const ReportDialog = Loadable(lazy(() => import('./feeds/ReportDialog')))
const ManagerPlace = Loadable(lazy(() => import('./managerPlace/ManagerPlace')))
const ManagerMerchant = Loadable(lazy(() => import('./managerMerchant')))
const CreateFeed = Loadable(lazy(() => import('./feeds/CreateFeed')))
const ManagerEvents = Loadable(lazy(() => import('./events/ManagerEvents')))
const AddEvent = Loadable(lazy(() => import('./events/AddEvent')))
const OrdersHistory = Loadable(lazy(() => import('./orders/OrdersHistory')))
const OrderDetail = Loadable(lazy(() => import('./orders/OrderDetail')))
const UnAvailableOrder = Loadable(
  lazy(() => import('./orders/details/ButtonsLink/UnAvailableOrder')),
)
const AvailablePayment = Loadable(
  lazy(() => import('./orders/details/ButtonsLink/AvailablePayment')),
)
const ManagerServices = Loadable(lazy(() => import('./ManagerServices')))
const ManagerForbiddenWord = Loadable(
  lazy(() => import('./ManagerForbiddenWord')),
)
const DetailPlace = Loadable(
  lazy(() => import('./managerPlace/detailPlace/detailPlace')),
)
const DetailCampGround = Loadable(
  lazy(() => import('./managerLocation/detailCampGround/detailCampground')),
)
const ManagerLocation = Loadable(lazy(() => import('./managerLocation')))
const CreatePlace = Loadable(lazy(() => import('./managerPlace/CreactPlace')))
const UpdateMerchant = Loadable(
  lazy(() => import('./managerMerchant/updateMerchant')),
)

const ManagementRoutes = [
  {
    path: '/quan-ly-tai-khoan-admin',
    element: (
      <>
        <AdminAccounts />
        <Outlet />
      </>
    ),
    children: [
      {
        path: ':id/chi-tiet',
        element: <UserDetail title="Chi tiết tài khoản" />,
      },
      {
        path: 'them-moi',
        element: <CreateUser title="Thêm mới tài khoản" />,
      },
    ],
  },
  { path: '/quan-ly-tai-khoan-khach-hang', element: <CustomerAccounts /> },
  {
    path: '/quan-ly-tai-khoan-khach-hang/:customerId',
    element: (
      <LayoutWithNavTabs navInfo={navCustomerDetail as any}>
        <Outlet />
      </LayoutWithNavTabs>
    ),
    children: [
      {
        // index: true,
        path: 'thong-tin',
        element: (
          <>
            <CustomerDetail />
            <Outlet />
          </>
        ),
        children: [
          {
            path: 'doi-mat-khau',
            element: <ChangePassword title="Đổi mật khẩu" />,
          },
          {
            path: 'mo-khoa-tai-khoan',
            element: <UnlockCustomer title="Mở khoá tài khoản" />,
          },
          {
            path: 'khoa-tai-khoan',
            element: <LockCustomer title="Khoá tài khoản" />,
          },
        ],
      },
      { path: 'lich-su-dat-cho', element: <OrdersHistoryTab /> },
    ],
  },
  {
    path: '/quan-ly-feeds',
    element: (
      <>
        <ManagerFeed />
        <Outlet />
      </>
    ),
    children: [
      {
        path: 'ds/:feedId/vi-pham',
        element: <ReportDialog title="Báo cáo vi phạm" />,
      },
    ],
  },
  {
    path: '/quan-ly-feeds/:feedId',
    element: (
      <>
        <FeedDetail />
        <Outlet />
      </>
    ),
    children: [
      {
        path: 'vi-pham',
        element: <ReportDialog title="Vi phạm" />,
      },
    ],
  },
  { path: '/quan-ly-feeds/bao-cao-vi-pham', element: <ReportDialog /> }, // ?? unused
  {
    path: '/quan-ly-feeds/hau-kiem',
    element: (
      <>
        <PostsCheck />
        <Outlet />
      </>
    ),
    children: [
      {
        path: ':feedId/vi-pham',
        element: <ReportDialog title="Báo cáo vi phạm" />,
      },
    ],
  },
  { path: '/them-moi-feed', element: <CreateFeed /> },
  { path: '/quan-ly-su-kien', element: <ManagerEvents /> },
  { path: '/quan-ly-su-kien/them-moi-su-kien', element: <AddEvent /> },
  { path: '/quan-ly-su-kien/:eventId/*', element: <AddEvent /> },
  {
    path: '/quan-ly-don-hang',
    children: [
      {
        index: true,
        element: <Navigate to="xu-ly" replace />,
      },
      {
        path: ':source',
        children: [
          { index: true, element: <OrdersHistory /> },
          // { path: ':orderId', element: <OrderDetail /> },
        ],
      },
      {
        path: ':source/:orderId',
        element: (
          <>
            <OrderDetail />
            <Outlet />
          </>
        ),
        children: [
          {
            path: 'het-cho',
            element: <UnAvailableOrder title="Chi tiết đơn hàng (Hết chỗ)" />,
          },
          {
            path: 'con-cho',
            element: (
              <AvailablePayment title="Chi tiết đơn hàng (Còn chỗ, chờ thanh toán)" />
            ),
          },
        ],
      },
    ],
  },

  {
    path: '/quan-ly-thong-tin-dia-danh',
    element: <ManagerPlace />,
  },
  {
    path: '/quan-ly-thong-tin-doi-tac',
    element: <ManagerMerchant />,
  },
  {
    path: '/them-dia-danh',
    element: <CreatePlace />,
  },
  {
    path: '/them-doi-tac',
    element: <CreateMerchant />,
  },
  {
    path: '/cap-nhat-thong-tin-doi-tac/:id',
    element: <UpdateMerchant />,
  },
  {
    path: '/chi-tiet-dia-danh/:id',
    element: <DetailPlace />,
  },
  {
    path: '/chi-tiet-diem-camp/:id',
    element: <DetailCampGround action="edit" />,
  },
  {
    path: '/them-diem-camp',
    element: <DetailCampGround action="create" />,
  },
  { path: '/quan-ly-thong-tin-diem-camp', element: <ManagerLocation /> },
  { path: '/quan-ly-dich-vu', element: <ManagerServices /> },
  { path: '/quan-ly-tu-cam', element: <ManagerForbiddenWord /> },
  { path: '/danh-sach-dia-diem', element: <ManagerLocation /> },
]
export default ManagementRoutes
