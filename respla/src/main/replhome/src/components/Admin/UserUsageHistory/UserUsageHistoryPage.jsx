import './UserUsageHistoryPage.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import moment from 'moment';


function UserUsageHistoryPage({ }) {
    const [historyData, setHistoryData] = useState([]);
    const [searchedUserId, setSearchedUserId] = useState('');
    const [searchedUserIdForDivision, setSearchedUserIdForDivision] = useState(searchedUserId);

    function handleSearchUserId() {

        const idData = { id: searchedUserId }


        axios
            .post(`/usage/userHistoryById`, idData)
            .then((r) => {

                if (r.status === 204) {
                    alert(`존재하지 않는 아이디입니다.`);
                } else if (r.status === 200) {
                    setSearchedUserIdForDivision(searchedUserId);
                    setHistoryData(r.data);
                    console.log(`유저사용기록 조회 성공 : ${r.data}`);
                }
            }).catch((e) => {
                alert(`사용기록조회 실패`);
            })
    }

    console.log(`사용기록 데이터 : ${historyData}`);

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD / HH:mm:ss');
    };

    return (
        <div className='UserUsageHistoryPageContainer'>
            <div className='userUsageHistorySearchBox'>
                <div className='userUsageHistoryInput'>
                    <input type="text"
                        value={searchedUserId}
                        onChange={(e) => setSearchedUserId(e.target.value)} />
                </div>
                <div className='userUsageHistorySearchButton'>
                    <button onClick={() => handleSearchUserId(searchedUserId)}>검색</button>
                </div>

            </div>


            <div className='userUsageHistoryInfobox'>
                <div className='userUsageHistoryTitle'>
                    <span>회원 사용 기록</span>
                </div>

                <div className='userUsageHistorySearchedId'>
                    <span>ID&nbsp; : &nbsp;</span>
                    <span>{searchedUserIdForDivision}</span>
                </div>

                <table className='uh_table'>
                    <thead className='uh_thead'>
                        <tr>
                            <th>상품 구분</th>
                            <th>이용 일자</th>
                            <th>좌석</th>
                            <th>사용 타입</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className='uh_tbody'>
                        {historyData.map((d, i) => (
                            <tr key={i}
                                className='uh_tr'
                            >
                                <td>
                                    <span>{d.p_type === 'm' ? '시간권' : d.p_type === 'd' ? '기간권' : d.p_type === 'f' ? '고정석' : 'null'}</span>
                                    <span>&nbsp;</span>
                                    <span>{`[`}</span>
                                    <span>{d.p_type === 'm' ? d.time_value / 60
                                        : d.p_type === 'd' ? Math.floor(d.day_value / 24)
                                            : Math.floor(d.day_value / 24 / 7)
                                    }</span>
                                    <span>{d.p_type === 'm' ? '시간' : d.p_type === 'd' ? '일' : d.p_type === 'f' ? '주' : 'null'}</span>
                                    <span>{`]`}</span>
                                    {/* <span>{`[${Math.floor(d.day_value / 60)}]`}</span> */}
                                </td>

                                <td>{formatDate(d.used_date_time)}</td>
                                <td>{d.seat_num}</td>
                                <td>{d.action_type === 'in' ? '입실'
                                    : d.action_type === 'out' ? '퇴실'
                                        : d.action_type === 'move' ? '자리이동'
                                            : d.action_type === 'autoIn' ? '자동재입실'
                                                : d.action_type === 'autoOutExpiry' ? '자동퇴실(기간만료)'
                                                    : d.action_type === 'autoOutSuspend' ? '자동퇴실(기간권 우선사용)'
                                                        : d.action_type === 'autoOutDaily' ? '자동퇴실(05시 정기퇴실)'
                                                            : d.action_type === 'forcedOut' ? '강제퇴실(규칙위반)'
                                                                : 'ERROR'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table >
            </div>

        </div>
    )
}

export default UserUsageHistoryPage;