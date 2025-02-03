import './MainHomePage.css';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import IsCurrentUseModal from '../../UserInfo/IsCurrentUseModal';
import UserInfoBox from '../../UserInfo/UserInfoBox';
import Caution from '../../Caution/Caution';
// import AdminPage from '../../Admin/AdminPage';

// import TempWind from './TempWind';

function MainHomePage() {
    const navigator = useNavigate();
    const loginID = sessionStorage.getItem("loginID");
    const [cautionContainerOpen, setCautionContainerOpen] = useState(false);
    const [openEntryDoor, setOpenEntryDoor] = useState(false);
    const [entryDoorComment, setEntryDoorComment] = useState('');

    const [isCurrentUseModal, setIsCurrentUseModal] = useState({        // 기존에 false만 담았던 boolean타입에서 Object타입으로 변경.
        isOpen: false,
        menuType: '',
        responseStatus: '',
        comment: ''
    });

    const [initCloseTime, setInitCloseTime] = useState(30);          // 입퇴실여부 Modal 닫힘 시간 초기값
    const [closeTime, setCloseTime] = useState(initCloseTime);           // 입퇴실여부 Modal 닫힘 실시간 남은 시간


    //==[0. 로그인 후 이용 가능.]========================================================================================
    const loginRequired = () => {
        alert(`로그인 후 이용가능합니다.`);
        navigator('/LogInPage');
    }

    //==[2. isCurrentModal작동시, 타이머 설정]=========================================================================================
    useEffect(() => {
        if (isCurrentUseModal.isOpen) {
            const timer = setInterval(() => {
                setCloseTime(prevTime => {
                    if (prevTime <= 1) {   // prevTime == 0도 되기는 하는데, <=1이 더 깔끔함.
                        clearInterval(timer);
                        setIsCurrentUseModal(false);
                        navigator('/');
                        return initCloseTime;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timer);    // 컴포넌트가 언마운트되거나 모달이 닫힐 때 타이머를 정리

        } else if (isCurrentUseModal.isOpen === false || closeTime === 0) {
            setCloseTime(initCloseTime);
        }


    }, [isCurrentUseModal.isOpen, navigator, closeTime]);


    //==[3. 좌석현황 보기]=======================================================================================================
    function openSeatPrensent(menuType) {
        sessionStorage.setItem("menuType", menuType);
        navigator("/SeatPresentPage");
    }


    //==[4. 입실 여부 확인 함수]=======================================================================================================
    function handleMenu(selectedmenuType) {
        setIsCurrentUseModal({
            isOpen: false
        });

        const menuData = {
            id: loginID,
            menu: selectedmenuType
        }

        axios
            .post(`/seat/handleMenu`, menuData)
            .then((response) => {
                switch (response.status) {

                    // ===== [1] 이미 입실한 상태 ============= 
                    case 200:
                        switch (selectedmenuType) {
                            case 'purchase':
                                setIsCurrentUseModal({
                                    isOpen: true,
                                    menuType: selectedmenuType,
                                    responseStatus: response.status,
                                    comment: '200p'
                                    // comment: '이미 입실함. 추가구매'
                                });

                                break;

                            case 'checkin':
                                setIsCurrentUseModal({
                                    isOpen: true,
                                    menuType: selectedmenuType,
                                    responseStatus: response.status,
                                    comment: '200ci'
                                    // comment: '이미 입실함'
                                });
                                break;

                            case 'checkout':
                            case 'moveseat':
                                sessionStorage.setItem("menuType", selectedmenuType);
                                navigator("/SeatPresentPage");
                                break;

                            default:
                                alert(`오류200`);
                                break;
                        }
                        break;

                    // ===== [2] 입실x 상품존재o =============
                    case 202:
                        switch (selectedmenuType) {
                            case 'purchase':
                                setIsCurrentUseModal({
                                    isOpen: true,
                                    menuType: selectedmenuType,
                                    responseStatus: response.status,
                                    comment: '202p'
                                    // comment: '사용가능한 상품 존재. 추가 구매 '
                                });
                                break;

                            case 'checkin':
                                sessionStorage.setItem("menuType", selectedmenuType);
                                navigator('/seatPresentPage');
                                break;

                            case 'checkout':
                            case 'moveseat':
                                setIsCurrentUseModal({
                                    isOpen: true,
                                    menuType: selectedmenuType,
                                    responseStatus: response.status,
                                    comment: '202com'
                                    // comment: '입실 후 이용 가능합니다. 현재 사용가능한 상품이 존재합니다. 입실하시겠습니까? '
                                });
                                break;

                            default:
                                alert(`오류202`);
                                break;
                        }
                        break;

                    // ===== [3] 입실x 상품존재x =====
                    case 204:
                        switch (selectedmenuType) {
                            case 'purchase':
                                sessionStorage.setItem("menuType", selectedmenuType);
                                navigator('/PurchaseSelectPage');
                                break;

                            case 'checkin':
                                setIsCurrentUseModal({
                                    isOpen: true,
                                    menuType: selectedmenuType,
                                    responseStatus: response.status,
                                    comment: '204ci'
                                    // comment: '현재 사용가능한 상품이 없습니다. 이용권을 구매하시겠습니까? '
                                });
                                break;

                            case 'checkout':
                            case 'moveseat':
                                setIsCurrentUseModal({
                                    isOpen: true,
                                    menuType: selectedmenuType,
                                    responseStatus: response.status,
                                    comment: '204com'
                                    // comment: '입실 후 이용 가능합니다. 현재 사용가능한 상품이 없습니다. 이용권을 구매하시겠습니까? '
                                });
                                break;

                            default:
                                alert(`오류204`);
                                break;
                        }
                        break;

                    // ===== [4] 고정석 사용. 미입실. ============= 
                    case 206:
                        setIsCurrentUseModal({
                            isOpen: true,
                            menuType: selectedmenuType,
                            responseStatus: response.status,
                            comment: '202cif'
                            // comment: '고정석 상품 입실 '
                        });

                        break;

                    default:
                        break;
                } // switch 중첩문 종료 =====================

            }).catch((error) => {
                if (error.response.status === 403) {
                    setIsCurrentUseModal({
                        isOpen: true,
                        menuType: selectedmenuType,
                        responseStatus: error.response.status,
                        comment: '403mf'
                        // comment: '고정석 자리이동 불가 '
                    });
                } else {
                    console.log(`${error}`);
                    alert(`모르겠는 오류`);
                }
            });
    };

    // // ===지워야됨 나중에@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@2
    // const [ulist, sulist] = useState([]);
    // useEffect(() => {
    //     axios
    //         .get(`/user/allUserList`)
    //         .then((r) => {
    //             sulist(r.data);
    //         }).catch((e) => {
    //         });
    // }, [])


    // ** 로그인 데이터 전송
    // const logInButton = (isId) => {
    //     axios({
    //         url: "/user/login",
    //         method: 'post',
    //         headers: { 'Content-Type': 'application/json' },
    //         data: {
    //             id: isId,
    //         }
    //         // [===로그인 성공시===]
    //     }).then((res) => {
    //         sessionStorage.setItem('user', JSON.stringify(res.data));
    //         sessionStorage.setItem('loginID', res.data.id);
    //         sessionStorage.setItem('loginName', res.data.name);
    //         if (sessionStorage.getItem('loginID') === 'admin') {
    //             // navigator('/AdminPage');
    //             window.location.reload();
    //         } else {
    //             navigator('/');
    //         }
    //         // window.location.reload();

    //         // [===로그인 실패시===]
    //     }).catch((error) => {
    //         if (error.response.status === 401) {
    //             alert('아이디없음');
    //         } else if (error.response.status === 403) {
    //             alert('이용이 제한된 사용자입니다.');
    //         }

    //         window.location.reload();
    //     });
    // }

    function purchasePageImSI(ptype) {
        sessionStorage.setItem('ptype', ptype);
        navigator('/PurchasePage');
    }


    function handleEntryDoor() {
        setOpenEntryDoor(true);
        const data = { id: loginID }
        axios
            .post('/user/entryDoor', data)
            .then((r) => {
                setOpenEntryDoor(true);

                if (r.data === true) {
                    setEntryDoorComment('출입문이 열립니다.');
                    console.log(r);
                } else {
                    setEntryDoorComment('입실 이용자만 가능합니다.');
                    console.log(r);
                }
            }).catch((e) => {
                // alert(`입실후 이용해주세요.`);
            })
    }

    //===================================================================================================================
    return (
        <div className='MainHomePageContainer'>
            {loginID ?
                (
                    <>
                        <div className='mainHomePageNoticeBox'>
                            <button onClick={() => setCautionContainerOpen(true)}>카페이용 주의사항</button>
                            <button onClick={handleEntryDoor}>출입문 열기</button>
                        </div>

                        <div className='homeBodyLoginedMenu'>
                            <div className='loginedMenuTitle'><span>사용</span></div>
                            <div className='loginedPurchaseProduct' ><button onClick={() => handleMenu('purchase')}>이용권 구매</button></div>
                            <div className='loginedSeatPresent' ><button onClick={() => openSeatPrensent('seatpresent')}>좌석현황</button></div>
                            <div className='loginedCheckIn' ><button onClick={() => handleMenu('checkin')}>입실</button></div>
                            <div className='loginedCheckOut' ><button onClick={() => handleMenu('checkout')}>퇴실</button></div>
                            <div className='loginedMoveSeat' ><button onClick={() => handleMenu('moveseat')}>자리이동</button></div>
                        </div>

                        <div className='homeBodyUserInfoBox'>
                            <UserInfoBox />
                        </div>

                        {isCurrentUseModal.isOpen && (
                            <IsCurrentUseModal
                                isCurrentUseModalObject={isCurrentUseModal}
                                setIsCurrentUseModal={setIsCurrentUseModal}
                                initCloseTime={initCloseTime}
                                setInitCloseTime={setInitCloseTime}
                                closeTime={closeTime}
                                setCloseTime={setCloseTime}
                            />)}
                    </>
                )
                :
                (
                    <>
                        <div className='mainHomePageNoticeBox'>
                            <button style={{ width: '300px', height: '100px' }} onClick={() => setCautionContainerOpen(true)}>카페이용 주의사항</button>
                            <button onClick={loginRequired}>출입문 열기</button>
                        </div>

                        <div className='homeBodyLogoutedMenu'>
                            <div className='loginedMenuTitle'><span>사용</span></div>
                            <div className='logoutedPurchaseProductLink'><button onClick={loginRequired} >이용권 구매</button></div>
                            <div className='logoutedCheckInLink'><button onClick={loginRequired} >입실</button></div>
                            <div className='logoutedSeatPresent' ><button onClick={() => openSeatPrensent('seatpresent')}>좌석현황</button></div>
                        </div>

                        <div className='LogoutedUserInfoBoxContainer'>
                            <div className='logoutedUserLoginLink'><Link to='/LogInPage'>로그인</Link></div>
                            <div className='logoutedUserJoinMemberLink'><Link to='/JoinPage'>회원가입</Link></div>
                        </div>
                    </>
                )
            }

            {cautionContainerOpen &&
                <Caution
                    setCautionContainerOpen={setCautionContainerOpen}
                />
            }

            {openEntryDoor && (
                <div className='openEntryDoorContainerBackGround' onClick={() => setOpenEntryDoor(false)}>
                    <div className='openEntryDoorContainer'>
                        <div>
                            <span>{entryDoorComment}</span>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}

export default MainHomePage;