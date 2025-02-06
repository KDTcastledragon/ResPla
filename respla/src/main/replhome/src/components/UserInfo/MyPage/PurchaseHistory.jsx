import './PurchaseHistory.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import moment from 'moment';

function PurchaseHistory({ setOpenPurchaseHistory, loginID }) {
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        const idData = { id: loginID }
        axios
            .post(`/upp/selectAllUppsById`, idData)
            .then((r) => {
                setHistoryData(r.data);
            }).catch((e) => {
                console.log(`e`);
            })
    }, []);

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD / HH시 mm분 ss초');
    };

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


    function closeModal() {
        setOpenPurchaseHistory(false);
    }

    return (
        <div className='PurchaseHistoryBackGround'>
            <div className='PurchaseHistoryContainer'>
                <div className='purchaseHistoryTitle'>
                    <span>구매 이력</span>
                </div>

                <table className='ph_table'>
                    <thead className='ph_thead'>
                        <tr>
                            <th>상품 구분</th>
                            <th>구매일</th>
                            <th>가격</th>
                            <th>결제 수단</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className='ph_tbody'>
                        {historyData.map((d, i) => (
                            <tr key={i}
                                className={d.refunded === true ? 'refunded_ph' : 'ph_tr'}
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

                                <td>{formatDate(d.purchase_date)}</td>
                                <td>
                                    <span>{d.price !== null ? d.price.toLocaleString() : null}</span>
                                    <span>원</span>
                                </td>
                                <td>{paymentOptFormat(d.payment)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table >
                <div className='closePurchaseHistoryModal'><button onClick={closeModal}>닫기</button></div>
            </div>
        </div>
    );
}

export default PurchaseHistory;