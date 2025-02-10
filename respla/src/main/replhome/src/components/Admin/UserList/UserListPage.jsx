import axios from 'axios';
import './UserListPage.css';
import { useEffect, useState } from 'react';
import moment from 'moment';

import UserBenModal from './UserBenModal';

function UserListPage() {

    const [userList, setUserList] = useState([]);

    const [searchWord, setSearchWord] = useState('');
    const [isCurrentUse, setIsCurrentUse] = useState('all');
    const [isBenned, setIsBenned] = useState('all');
    const [benCause, setBenCause] = useState(false);
    const [benCauseContent, setBenCauseContent] = useState();
    const [unbenCause, setUnbenCause] = useState(false);
    const [unbenCauseContent, setUnbenCauseContent] = useState();
    const [benData, setBenData] = useState(
        {
            opened: false,
            id: null,
            isBenned: false,
            name: '',
            phoneNum: '',
        }
    );


    // [1. 모든 유저 정보]===================================================================================================
    useEffect(() => {
        axios
            .get(`/user/allUserList`)
            .then((r) => {
                setUserList(r.data);
            }).catch((e) => {
                alert(`유저리스트 실패`);
                console.log(`유저리스트 실패 : ${e.message}`);
            })
    }, []);


    // [2. 검색된 유저 정보]===================================================================================================
    function searchUserData() {
        axios
            .get(`/user/userSearch?searchWord=${searchWord}`)
            .then((r) => {
                setUserList(r.data);
            }).catch((e) => {
                alert(`검색어를 입력해주세요.`);
            })
    }


    // [3-1. 입실 사용자 선택]===================================================================================================
    function selectByCheckedStatus(e) {
        axios
            .get(`/user/selectByCheckedStatus?opt=${e}`)
            .then((r) => {
                setUserList(r.data);
            }).catch((e) => {
                alert(`체크인기준 오류.`);
            })
    }


    // [3-2. 이용금지 사용자 선택]===================================================================================================
    function selectByBenned(isBenned) {
        const isBennedValue = String(isBenned);

        console.log(isBennedValue);
        axios
            .get(`/user/selectByBenned?opt=${isBennedValue}`)
            .then((r) => {
                setUserList(r.data);
            }).catch((e) => {
                console.log(`검색실패 : ${e.message}`);
                alert(`벤기준 오류.`);
            })
    }

    // [4. 금지하기 / 해제]=====================================================================================================
    function userBen(selectedId, state, name, number) {
        console.log(state);
        setBenData({
            opened: true,
            id: selectedId,
            isBenned: state,
            name: name,
            phoneNum: number
        })
    }

    // [?. 날짜 포맷]===================================================================================================
    function birthFormatter(date) {
        return moment(date).format('YY-MM-DD');
    }

    function phoneFormat(num) {
        return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`
    }

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD / HH:mm:ss');
    };



    console.log(userList);

    //=====================================================================================================================
    return (
        <>
            <div className='UserListPageContainer'>
                <div className='userListSearchBox'>
                    <span className='userListSearchTitle'>유저 정보</span>
                    <input
                        type="text"
                        className='userListSearchInputText'
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                    />
                    <button className='userListSearchButton' onClick={searchUserData}>검색</button>

                    <select
                        name="isCurrentUse"
                        className='userListSelectIsCurrentUse'
                        value={isCurrentUse}
                        onChange={(e) => setIsCurrentUse(e.target.value)}
                    >
                        <option value="all">모두</option>
                        <option value="true">입실중</option>
                        <option value="false">미입실</option>
                    </select>
                    <button className='userListSearchButton' onClick={() => selectByCheckedStatus(isCurrentUse)}>검색</button>

                    <select
                        name="isBenned"
                        className='userListSelectIsBenned'
                        value={isBenned}
                        onChange={(e) => setIsBenned(e.target.value)}
                    >
                        <option value="all">모두</option>
                        <option value="true">이용금지자</option>
                        <option value="false">일반이용자</option>
                    </select>
                    <button className='userListSearchButton' onClick={() => selectByBenned(isBenned)}>검색</button>
                </div>

                <table className='userListPageTable'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>이름</th>
                            <th>생년월일</th>
                            <th>휴대폰번호</th>
                            <th>가입일</th>
                            <th>금지 여부</th>
                            <th>금지 적용</th>
                            <th>{null}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {userList && userList.length > 0 ? (
                            userList.map((d, i) => (
                                <tr key={i} className={d.benned === true ? `userListTbodyTrBenned` : `userListTbodyTr`}>
                                    <td>{d.id}</td>
                                    <td>{d.user_name}</td>
                                    <td>{birthFormatter(d.birth)}</td>
                                    <td>{phoneFormat(d.phone_number)}</td>
                                    <td>{formatDate(d.join_date)}</td>
                                    <td>
                                        {d.ben_cause === null && d.unben_cause === null ? null

                                            : d.benned === true ?
                                                <button onClick={
                                                    () => {
                                                        setBenCause(true);
                                                        setBenCauseContent(d.ben_cause);
                                                    }
                                                }>금지사유</button>
                                                : d.benned === false ?
                                                    <button onClick={
                                                        () => {
                                                            setUnbenCause(true);
                                                            setUnbenCauseContent(d.unben_cause);
                                                        }
                                                    }>해제사유</button>
                                                    : null
                                        }
                                    </td>
                                    <td>
                                        {d.benned === true ?
                                            <div className='unBenButton'>
                                                <button onClick={() => userBen(d.id, d.benned, d.user_name, d.phone_number)}>금지해제</button>
                                            </div>
                                            :
                                            <div className='benButton'>
                                                <button onClick={() => userBen(d.id, d.benned, d.user_name, d.phone_number)}>이용금지</button>
                                            </div>
                                        }
                                    </td>
                                </tr>
                            )))
                            :
                            (

                                <tr className='noSearchedUserList'><td colSpan={8}>정보 없음</td></tr>
                            )

                        }
                    </tbody>
                </table>
            </div>

            {benData.opened && (
                <UserBenModal
                    benData={benData}
                    setBenData={setBenData}
                />
            )
            }

            {benCause && (
                <div className='benCauseContentContainerBackGround'>
                    <div className='benCauseContentContainer'>
                        <div>
                            <span>이용 금지 사유</span>
                        </div>
                        <div>{benCauseContent}</div>
                        <div><button onClick={() => setBenCause(false)}>닫기</button></div>

                    </div>
                </div>
            )}

            {unbenCause && (
                <div className='benCauseContentContainerBackGround'>
                    <div className='benCauseContentContainer'>
                        <div><span>금지 해제 사유</span></div>
                        <div>{unbenCauseContent}</div>
                        <div><button onClick={() => setUnbenCause(false)}>닫기</button></div>

                    </div>
                </div>
            )}
        </>
    )
}

export default UserListPage;