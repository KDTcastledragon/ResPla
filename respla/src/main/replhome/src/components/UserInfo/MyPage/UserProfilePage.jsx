import './UserProfilePage.css';

import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserProfilePage() {
    const [userData, setUserData] = useState({});
    const userId = sessionStorage.getItem('loginID');
    const navigator = useNavigate();

    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [withdrawMemberOpen, setWithdrawMemberOpen] = useState(false);

    const [prevPassword, setPrevPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [validPw, setValidPw] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [confirmPw, setConfirmPw] = useState('');
    const [pwMsg, setPwMsg] = useState('');

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
    const noKorPwRegex = /^[^가-힣ㄱ-ㅎㅏ-ㅣ]*$/;

    const [activeJoinButton, setActiveJoinButton] = useState(true);

    const [writtenedPassword, setWrittenedPassword] = useState('');

    const logout = () => {
        sessionStorage.clear();
        navigator('/');
    }


    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return "";
        return phoneNumber.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
    };

    function formatDate(dateString) {
        return moment(dateString).format('YYYY-MM-DD # HH:mm:ss');
    }

    useEffect(() => {
        const data = { id: userId }
        axios
            .post(`/user/profile`, data)
            .then((r) => {
                setUserData(r.data);
            })
    }, [])

    //======================
    function handleValidatePw() {
        if (newPassword.length < 7 || newPassword.length > 15) {
            setPwMsg('비밀번호는 7자 이상, 15자 이하여야 합니다.');
            setValidPw(false);
        } else if (!pwRegex.test(newPassword)) {
            setPwMsg('비밀번호에는 특수문자 , 숫자 , 영문이 모두 포함되어야 합니다.');
            setValidPw(false);
        } else if (!noKorPwRegex.test(newPassword)) {
            setPwMsg('한글은 비밀번호에 포함될 수 없습니다.');
            setValidPw(false);
        } else {
            setPwMsg('validPw');
            setValidPw(true);
        }
    }

    function handleActivation() {
        if (validPw && confirmPw === newPassword && prevPassword !== null) {
            setActiveJoinButton(false);
        } else {
            setActiveJoinButton(true);
        }
    }

    function changePassword() {
        const pWdata = {
            id: userId,
            prevPw: prevPassword,
            newPw: newPassword
        }

        if (validPw && confirmPw === newPassword) {
            axios
                .post(`/user/changePassword`, pWdata)
                .then((r) => {
                    logout();
                    alert(`비밀번호 변경 성공. 다시 로그인 해주세요.`);

                }).catch((e) => {

                    switch (e.response.status) {
                        case 409:
                            alert(`기존 비밀번호가 일치하지 않습니다.`);
                            break;

                        default:
                            alert(`서버 오류`);
                            break;
                    }
                })
        }
    }

    function withdrawMember() {
        const withdrawData = {
            id: userId,
            password: writtenedPassword
        }

        if (writtenedPassword !== null) {
            axios
                .post(`/user/withdrawMember`, withdrawData)
                .then((r) => {
                    logout();
                    alert(`지금까지 저희 카페를 이용해주셔서 감사합니다.`);

                }).catch((e) => {
                    if (e.response.status === 409) {
                        alert(`기존 비밀번호가 일치하지 않습니다.`);

                    } else {
                        alert(`서버 오류`);
                    }
                })
        } else {
            alert(`비밀번호를 입력해주세요`);
        }
    }


    //================================================================================================================== 
    return (
        <div className='UserProfilePageContainer'>
            <div className='userProfileTitle'><span>회원 정보</span></div>
            <div className='userProfileInfoBox'>
                <div className='userProfileTable'>
                    <table>
                        <tr>
                            <td>ID</td>
                            <td>{userData.id}</td>
                        </tr>

                        <tr>
                            <td>이름</td>
                            <td>{userData.user_name}</td>
                        </tr>
                        <tr>
                            <td>생년월일</td>
                            <td>{userData.birth}</td>
                        </tr>
                        <tr>
                            <td>휴대폰 번호</td>
                            <td>{formatPhoneNumber(userData.phone_number)}</td>
                        </tr>
                        <tr>
                            <td>가입일</td>
                            <td>{formatDate(userData.join_date)}</td>
                        </tr>
                    </table>
                </div>

                <div className='userTableButtonBox'>
                    <button onClick={() => setChangePasswordOpen(true)}>비밀번호 변경</button>
                    <button onClick={() => setWithdrawMemberOpen(true)}>회원탈퇴</button>
                </div>
            </div>

            <div className='userTablePrevBox'>
                <button onClick={() => navigator('/MyPage')}>이전 페이지</button>
            </div>

            {changePasswordOpen &&
                <div className='userInfoControlBackGround'>
                    <div className='ChangePasswordContainer'>
                        <div className='ChangePasswordTitle'><span>비밀번호 변경</span></div>
                        <div className='prevPw'>
                            <span>기존 비밀번호 확인</span>
                            <input type={showPw ? 'text' : "password"} value={prevPassword}
                                onChange={(e) => {
                                    setPrevPassword(e.target.value);
                                }}
                                required autoComplete='off' minLength={8} maxLength={15} placeholder='기존 비밀번호를 입력해주세요'
                            />
                        </div>

                        <div className='newPw'>
                            <span>새 비밀번호</span>
                            <input type={showPw ? 'text' : "password"} value={newPassword} onKeyUp={handleActivation}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                }}
                                required autoComplete='off' minLength={8} maxLength={15} placeholder='특수문자 포함 8~15자리' onBlur={handleValidatePw}
                            />
                            {pwMsg === 'validPw' ? <span className='validPw'>적절한 비밀번호</span> : <span className='inValidPw'>{pwMsg}</span>}
                        </div>

                        <div className='ConfirmNewPw'>
                            <span>새 비밀번호 확인</span>
                            <input type={showPw ? 'text' : "password"} value={confirmPw} onKeyUp={handleActivation}
                                onChange={(e) => { setConfirmPw(e.target.value) }}
                                required autoComplete='off' minLength={8} maxLength={15} placeholder='비밀번호 재입력'
                            />
                            {validPw === true && newPassword !== null && confirmPw !== null && newPassword === confirmPw ? <span className='confirmedPw'>비밀번호 일치</span>
                                : validPw === true && newPassword !== null && confirmPw !== null && newPassword !== confirmPw ? <span className='denyPw'>비밀번호 불일치</span>
                                    : <span className='denyPw'>비밀번호 검사 필요</span>}
                            <button onClick={() => setShowPw(p => !p)}>
                                {showPw ?
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
                                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                        <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                    </svg>

                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                    </svg>
                                }
                            </button>

                        </div>

                        <div className='chgPwButtonBox'>
                            <button onClick={changePassword} disabled={activeJoinButton}>비밀번호 변경</button>
                            <button onClick={() => setChangePasswordOpen(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            }

            {withdrawMemberOpen &&
                <div className='userInfoControlBackGround'>
                    <div className='WithDrawMemberContainer'>
                        <div className='withDrawMemberTitle'><span>회원탈퇴</span></div>
                        <div className='withdrawMemberConfirmPwBox'>
                            <span>비밀번호 확인</span>
                            <input type="password" value={writtenedPassword}
                                onChange={(e) => setWrittenedPassword(e.target.value)} minLength={7} />
                        </div>

                        <div className='withDrawMemberButtonBox'>
                            <button onClick={withdrawMember}>회원탈퇴</button>
                            <button onClick={() => setWithdrawMemberOpen(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export default UserProfilePage;