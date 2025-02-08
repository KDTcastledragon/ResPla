import './UsageHistory.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import moment from 'moment';


function UsageHistory({ setOpenUsageHistory, loginID }) {
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        const idData = { id: loginID }

        axios
            .post(`/usage/userHistoryList`, idData)
            .then((r) => {
                setHistoryData(r.data);
                console.log(`유저사용기록 조회 성공 : ${r.data}`);
            }).catch((e) => {
                // alert(`사용기록조회 실패`);
            })
    }, [])

    console.log(`사용기록 데이터 : ${historyData}`);

    function closeModal() {
        setOpenUsageHistory(false);
    }

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD / HH:mm:ss');
    };

    return (
        <div className='UsageHistoryBackGround'>
            <div className='UsageHistoryContainer'>
                <div className='usageHistoryTitle'>
                    <span>사용 기록</span>
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
                                                            : d.action_type === 'autoOutForce' ? '강제퇴실(규칙위반)'
                                                                : 'ERROR'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table >

                <div className='closeUsageHistoryModal'><button onClick={closeModal}>닫기</button></div>
            </div>
        </div>
    )
}

export default UsageHistory;