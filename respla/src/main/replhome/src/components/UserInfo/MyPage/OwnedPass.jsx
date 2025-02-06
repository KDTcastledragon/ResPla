import './OwnedPass.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import moment from 'moment';

function OwnedPass({ setOpenOwnedPass, loginID }) {
    const [ownedPassData, setOwnedPassData] = useState([]);
    const [today, setToday] = useState(new Date());

    useEffect(() => {
        const idData = { id: loginID }
        axios
            .post(`/upp/usableUppList`, idData)
            .then((r) => {
                console.log(r.data);
                setOwnedPassData(r.data);
            }).catch((e) => {
                console.log(`e`);
            })

        // 1분마다 현재시간 재계산. 현재로부터 남은 기간을 계산하기 위한 목적.
        const intervalToday = setInterval(() => {
            setToday(new Date());
        }, 60000);

        return () => clearInterval(intervalToday);

    }, []);

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD / HH시 mm분 ss초');
    };

    const availableTimeFormat = (availableTime) => {
        return `${availableTime / 60}시간 ${availableTime % 60}분`
    }

    const availablePeriod = (startDateStr, endDateStr) => {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        // console.log(startDate);
        // console.log(endDate);

        if (startDate > today) {
            return '미사용';
        }
        else if (endDate < today) {
            return '만료';
        }

        const diffMs = endDate - today;
        const diffMin = Math.floor(diffMs / (1000 * 60)); // 총 남은 분
        const days = Math.floor(diffMin / (60 * 24)); // 남은 일
        const hours = Math.floor((diffMin % (60 * 24)) / 60); // 남은 시간
        const minutes = diffMin % 60; // 남은 분

        return `${days}일 ${hours}시간 ${minutes}분`;
    }

    const paymentOptFormat = (payOpt) => {
        switch (payOpt) {
            case 'naverPay':
                return '네이버페이';

            case 'tossPay':
                return '토스페이';

            case 'kakaoPay':
                return '카카오페이';

            case 'bankTransfer':
                return '무통장입금';

            case 'mobilePay':
                return '휴대폰결제';

            default:
                return 'etc';
        }
    }

    function refund(refundedUppCode, refundedProductCode) {
        const data = {
            id: loginID,
            uppCode: refundedUppCode,
            productCode: refundedProductCode
        }

        axios
            .post(`/upp/refund`, data)
            .then((r) => {
                alert(`성공~~`);
            }).catch((e) => {
                alert(`에러`);
            })
    }


    function closeModal() {
        setOpenOwnedPass(false);
    }

    return (
        <div className='OwnedPassBackGround'>
            <div className='OwnedPassContainer'>
                <div className='OwnedPassTitle'>
                    <span>보유 이용권</span>
                </div>

                <table className='owned_table'>
                    <thead className='owned_thead'>
                        <tr>
                            <th>상품 구분</th>
                            <th>잔여 시간/일</th>
                            <th>가격</th>
                            <th>결제 수단</th>
                            <th>환불</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className='owned_tbody'>
                        {ownedPassData.map((d, i) => (
                            <tr key={i}
                                className={d.refunded === true ? 'refunded_owned' : 'owned_tr'}
                            >
                                <td>
                                    <div>
                                        <span>{d.p_type === 'm' ? '시간권' : d.p_type === 'd' ? '기간권' : d.p_type === 'f' ? '고정석' : 'null'}</span>
                                        <span>&nbsp;</span>
                                        <span>{`(`}</span>
                                        <span>{d.p_type === 'm' ? d.time_value / 60 : Math.floor(d.day_value / 24)}</span>
                                        <span>{d.p_type === 'm' ? '시간' : '일'}</span>
                                        <span>{`)`}</span>
                                    </div>
                                    <div>
                                        <span>{d.upp_code}</span>
                                    </div>
                                </td>

                                <td>{d.p_type === 'm' ? availableTimeFormat(d.available_time) : availablePeriod(d.start_date, d.end_date)}</td>

                                <td>
                                    <span>{d.price !== null ? d.price.toLocaleString() : null}</span>
                                    <span>원</span>
                                </td>

                                <td>{paymentOptFormat(d.payment)}</td>

                                <td>
                                    {d.refunded === true ?
                                        <button className='refundedBox'>환불처리</button>
                                        :
                                        <button className='refundRequestBox' onClick={() => refund(d.upp_code, d.product_code)}>환불하기</button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table >
                <div className='closePurchaseHistoryModal'><button onClick={closeModal}>닫기</button></div>
            </div>
        </div>

    );
}

export default OwnedPass;