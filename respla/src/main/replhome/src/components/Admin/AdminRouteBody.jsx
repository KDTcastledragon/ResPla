import { Route, Routes } from "react-router-dom";

import AdminPage from "./AdminPage";

import UserListPage from "./UserList/UserListPage";
import SalesStatusPage from "./SalesStatus/SalesStatusPage";
import SeatManagementPage from "./SeatManagement/SeatManagementPage";
import UserUsageHistoryPage from "./UserUsageHistory/UserUsageHistoryPage";
import AdminLogInPage from "./AdminLogInPage";

function AdminRouteBody() {
    return (
        <>
            <Routes>
                <Route path='/AdminPage' element={<AdminPage />} />
                <Route path='/UserListPage' element={<UserListPage />} />
                <Route path='/SalesStatusPage' element={<SalesStatusPage />} />
                <Route path='/SeatManagementPage' element={<SeatManagementPage />} />
                <Route path='/UserUsageHistoryPage' element={<UserUsageHistoryPage />} />

                <Route path='/AdminLogInPage' element={<AdminLogInPage />} />
            </Routes>
        </>
    )
}

export default AdminRouteBody;