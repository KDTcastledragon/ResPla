import './MyPage.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PurchaseHistory from './PurchaseHistory';
import UsageHistory from './UsageHistory';
import OwnedPass from './OwnedPass';

function MyPage() {
    const navigator = useNavigate();
    const loginID = sessionStorage.getItem('loginID');
    const [openOwnedPass, setOpenOwnedPass] = useState(false);
    const [openPurchaseHistory, setOpenPurchaseHistory] = useState(false);
    const [openUsageHistory, setOpenUsageHistory] = useState(false);

    function openOwnedPassModal() {
        setOpenOwnedPass(true);
    }

    function openPurchaseHistoryModal() {
        setOpenPurchaseHistory(true);
    }

    function openUsageHistoryModal() {
        setOpenUsageHistory(true);
    }

    //========================================================================================================
    return (
        <div className='MyPageContainer'>
            <div className='myPageMenuButton'>
                <button onClick={() => navigator('/UserProfilePage')}>회원정보</button>
                <button onClick={() => openOwnedPassModal()}>보유 이용권</button>
                <button onClick={() => openPurchaseHistoryModal()}>구매이력</button>
                <button onClick={() => openUsageHistoryModal()}>사용기록</button>
            </div>

            {openOwnedPass &&
                <OwnedPass
                    setOpenOwnedPass={setOpenOwnedPass}
                    loginID={loginID}
                />
            }

            {openPurchaseHistory &&
                <PurchaseHistory
                    setOpenPurchaseHistory={setOpenPurchaseHistory}
                    loginID={loginID}
                />
            }

            {openUsageHistory &&
                <UsageHistory
                    setOpenUsageHistory={setOpenUsageHistory}
                    loginID={loginID}
                />
            }

        </div>
    );
}

export default MyPage;