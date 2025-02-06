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
                        <div>
                            <button onClick={() => alert(`변경하기`)}>비밀번호 변경</button>
                            <button onClick={() => setChangePasswordOpen(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            }

            {withdrawMemberOpen &&
                <div className='userInfoControlBackGround'>
                    <div className='WithDrawMemberContainer'>
                        <div className='ChangePasswordTitle'><span>회원탈퇴</span></div>
                        <div>
                            <button onClick={() => alert(`탈퇴`)}>회원탈퇴</button>
                            <button onClick={() => setWithdrawMemberOpen(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export default UserProfilePage;