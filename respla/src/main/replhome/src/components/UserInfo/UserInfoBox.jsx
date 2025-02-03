import './UserInfoBox.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import moment from 'moment';

function UserInfoBox(props) {
    const navigator = useNavigate();

    const loginID = sessionStorage.getItem('loginID');

    const [uData, setUData] = useState([]);         // 로그인한 유저 정보 (userInfoBox로 전달)

    //==[ 1. 유저 정보 박스. 첫 렌더링시에 자동 실행]====================================================================================
    useEffect(() => {
        const loginedUserId = { id: loginID }

        axios
            .post(`/user/loginedUser`, loginedUserId)
            .then((response) => {
                console.log(`UserInfoBox_loginedUser 성공 : `, response.data);
                setUData(response.data);
                sessionStorage.setItem('uppcode', response.data.inUsedUppCode);
                console.log(`UserInfoBox_loginedUser uppcode [response.data.inUsedUppcode] : ${response.data.inUsedUppCode}`)

            }).catch((e) => {
                console.log(`HomeBody_loginedUser 실패 : `, e.message);
            })

    }, []);


    //==[ 2. 로그아웃 실행 ]============================================================================================================
    const logout = () => {
        sessionStorage.clear();
        navigator('/');
    }

    // console.log(`uData.ptype === ${uData.ptype}`);
    // console.log(`uData ${JSON.stringify(uData, null, 2)}`);

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD # HH:mm:00');
    };

    //==============================================================================================================================================
    return (<>

        {/* '객체' 속성 참조시,  null이거나 정의되지 않았을 때 오류 방지. 굉장히 중요함. */}
        {Object.keys(uData).length > 0 && (
            <div className='UserInfoBoxContainer'>

                <div className='userInfoBoxTitle'><span>로그인 정보</span></div>

                <div className='userLoginedState'>
                    <div className='loginedStateUserWelcome'>
                        <span className='welcomeId'>{uData.userName}</span>
                        <span className='welcomeComment'> 님 환영합니다.</span>
                    </div>
                </div>

                <div className='userIsCurrentUseAuthenticationBox'>
                    {loginID !== null && loginID === uData.userId && uData.inUsedUppCode !== null && uData.isCheckedIn === true ?
                        (
                            <>
                                <div className='userInfoUsedSeatNumBox'>
                                    <span>{uData.usedSeatNum}</span>
                                    <span>&nbsp;</span>
                                    <span>번 좌석 이용중</span>
                                </div>

                                <div className='userIsCurrentUseAuthenticationBoxOccupied'>
                                    <div className='userInfoUppProduct'>
                                        <span>{`${uData.p_type === 'm' ? '시간권' : uData.p_type === 'd' ? '기간권' : '고정석'}`}</span>
                                        <span>&nbsp;:&nbsp;</span>
                                        <span>{`[`}&nbsp;</span>
                                        <span>
                                            {uData.p_type === 'm' ? (uData.time_value / 60)
                                                : Math.floor(uData.day_value / 24 >= 28 ? uData.day_value / 24 / 7 : uData.day_value / 24)}
                                        </span>
                                        <span>&nbsp;{uData.p_type === 'm' ? '시간' : '일'}</span>
                                        <span>&nbsp;{`]`}</span>
                                    </div>

                                    <div className='userInfoUppUsedAvailableBox'>
                                        {uData.p_type === 'm' ?
                                            <>
                                                <div className='userInfoUppTimePass'>
                                                    <span>잔여시간</span>
                                                    <span>&nbsp;&nbsp;:&nbsp;&nbsp;</span>
                                                    <span>{Math.floor(uData.available_time / 60)}</span>
                                                    <span>&nbsp;시간&nbsp;&nbsp;</span>
                                                    <span>{uData.available_time % 60}</span>
                                                    <span>&nbsp;분</span>
                                                </div>
                                            </>

                                            : uData.p_type === 'd' || uData.p_type === 'f' ?
                                                <div className='userInfoUppDayPass'>
                                                    <span>종료일</span>
                                                    <span>&nbsp;:&nbsp;</span>
                                                    <span>{uData.end_date != null ? formatDate(uData.end_date) : '날짜 없음'}
                                                    </span>
                                                </div>

                                                :
                                                <div>null</div>}
                                    </div>

                                </div>
                            </>
                        )
                        :
                        (
                            <>
                                {null}
                            </>
                        )
                    }
                </div>

                <div className='userInfoIsCurrentUse'>
                    <div className={uData.isCheckedIn === true && uData.in_usedUpp_code !== null ? 'userInfoIsCurrentUseFalse_off' : 'userInfoIsCurrentUseFalse'}>미입실</div>
                    <div className={uData.isCheckedIn === true && uData.in_usedUpp_code !== null ? 'userInfoIsCurrentUseTrue' : 'userInfoIsCurrentUseTrue_off'}>입실중</div>
                </div>

                <div className='loginedStateMenu'>
                    <div className='loginedMenuMyPage'><button onClick={() => navigator('/MyPage')}>내 정보</button></div>
                    <div className='loginedMenuLogout'><button onClick={logout}>로그아웃</button></div>
                </div>
            </div >



        )}

    </>)
}

export default UserInfoBox;
