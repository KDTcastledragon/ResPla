import './OwnedPass.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import moment from 'moment';

function OwnedPass({ setOpenOwnedPass, loginID }) {
    const [ownedPassData, setOwnedPassData] = useState([]);

    useEffect(() => {
        const idData = { id: loginID }
        axios
            .post(`/upp/selectAllUppsById`, idData)
            .then((r) => {
                setOwnedPassData(r.data);
            }).catch((e) => {
                console.log(`e`);
            })
    }, []);

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD / HH시 mm분 ss초');
    };


    function closeModal() {
        setOpenOwnedPass(false);
    }

    return (
        <div className='OwnedPassBackGround'>
            <div className='OwnedPassContainer'>
                <div className='OwnedPassTitle'>
                    <span>구매 이력</span>
                </div>

                <table className='ph_table'>
                    <thead className='ph_thead'>
                        <tr>
                            <th>상품 구분</th>
                            <th>구매일</th>
                            <th>가격</th>
                            <th>결제 수단</th>
                            <th>환불</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className='ph_tbody'>
                        {ownedPassData.map((d, i) => (
                            <tr key={i}
                                className={d.refunded === true ? 'refunded_ph' : 'ph_tr'}
                            >
                                <td>
                                    <div>
                                        <span>{d.p_type === 'm' ? '시간권' : d.p_type === 'd' ? '기간권' : d.p_type === 'f' ? '고정석' : 'null'}</span>
                                        <span>&nbsp;</span>
                                        <span>{`(${d.p_type === 'm' ? d.time_value / 60 : Math.floor(d.day_value / 24 / 60)})`}</span>
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
                                <td>{d.payment}</td>
                                <td>{d.refunded === true ? '환불처리'
                                    : d.refunded === false ? <button>환불하기</button>
                                        : '환불불가'}</td>
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