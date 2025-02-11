import './AdminPageMenuBar.css';

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function AdminPageMenuBar() {
    const currentAdminMenu = sessionStorage.getItem('adminMenu');
    const [selectedMenu, setSelectedMenu] = useState();

    useEffect(() => {
        setSelectedMenu(currentAdminMenu);
    }, [currentAdminMenu])

    function selectMenu(selectedMenu) {
        sessionStorage.setItem('adminMenu', selectedMenu);
        setSelectedMenu(selectedMenu);
    }

    return (
        <div className='AdminPageMenuBarContainer'>
            <span className='AdminPageMenuBarTitle'>관리자 메뉴</span>

            <div className={`${selectedMenu === 'uli' ? ' selectedAdminMenu' : ''}`}>
                <Link to='/UserListPage' onClick={() => selectMenu('uli')}>회원 목록</Link>
            </div>

            <div className={`${selectedMenu === 'smm' ? ' selectedAdminMenu' : ''}`}>
                <Link to='/SeatManagementPage' onClick={() => selectMenu('smm')}>좌석관리</Link>
            </div>

            <div className={`${selectedMenu === 'sls' ? ' selectedAdminMenu' : ''}`}>
                <Link to='/SalesStatusPage' onClick={() => selectMenu('sls')}>매출 지표</Link>
            </div>

            <div className={`${selectedMenu === 'ush' ? ' selectedAdminMenu' : ''}`}>
                <Link to='/UserUsageHistoryPage' onClick={() => selectMenu('ush')}>사용 기록</Link>
            </div>

            {/* <div className={`${selectedMenu === 'san' ? ' selectedAdminMenu' : ''}`}>
                <Link to='/SeatManagementPage' onClick={() => selectMenu('san')}>좌석 이용 분석</Link>
            </div>

            <div className={`AdminPageMenuBarProductmanagement${selectedMenu === 'pmg' ? ' selectedAdminMenu' : ''}`}>
                <Link to='/ProductManagementPage' onClick={() => selectMenu('pmg')}>상품 관리</Link>
            </div> */}

        </div>
    )
}

export default AdminPageMenuBar;

