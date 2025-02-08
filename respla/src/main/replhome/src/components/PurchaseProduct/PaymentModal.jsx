import './PaymentModal.css';
import axios from 'axios';
import { useState } from 'react';
import moment from 'moment';

import SuccessModal from './SuccessModal';

function PaymentModal({ product_code, p_type, time_value, day_value, price, start_date, end_date, setPaymentModalOpen, onPaymentSuccessd, order_type

}) {

    const loginID = sessionStorage.getItem('loginID');

    const [selectedpaymentOption, setSelectedpaymentOption] = useState('');

    function formatDate(dateString) {
        return moment(dateString).format('YYYY-MM-DD # HH:mm:ss');
    }

    // console.log("");
    // console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
    // console.log(`구매 타입 : ${order_type}`);
    // console.log(`상품코드 : ${product_code}`);
    // console.log(`시작일 : ${start_date}`);
    // console.log(`종료일 : ${end_date}`);
    // console.log(`구매 수단 : ${selectedpaymentOption}`);
    // console.log(`■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`);
    // console.log("");



    //===[1. 구매수단 선택]=============================================================================================
    function handlePaymentOption(e) {
        setSelectedpaymentOption(e.target.value);
    }


    //===[2. 상품 구매 버튼 작동 함수]===================================================================================
    function payment() {
        if (selectedpaymentOption) {

            const purchasedData = {
                id: loginID,
                product_code: product_code,
                p_type: p_type,
                start_date: start_date,
                end_date: end_date,
                order_type: order_type,
                paymentOption: selectedpaymentOption
            }

            console.log("");
            console.log(`▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶`);
            console.log(`구매 타입 : ${order_type}`);
            console.log(`상품코드-타입 : ${product_code} - ${p_type}`);
            console.log(`시작일 : ${start_date}`);
            console.log(`종료일 : ${end_date}`);
            console.log(`구매 수단 : ${selectedpaymentOption}`);
            console.log(`▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶`);
            console.log("");

            axios
                .post('/product/payment', purchasedData)
                .then((response) => {
                    console.log(`결제성공 ${response.data}`);
                    onPaymentSuccessd();   // 결제창 닫기 && 성공모달 열기
                    setPaymentModalOpen(false);

                }).catch(error => {
                    if (error.response) {
                        switch (error.response.status) {
                            case 400:
                                console.log(`날짜 존재하지 않음`);
                                alert(`시작날짜를 정확히 선택해주세요.`);
                                break;

                            case 403:
                                console.log(`날짜 존재하지 않음`);
                                alert(`구매상품의 종료날짜보다 이후의 시간입니다.`);
                                break;

                            case 409:
                                console.log(`기간 충돌. 다른 날짜 선택`);
                                alert(`사용중 / 사용예정 상품의 사용기간과 중복됩니다. \n다른 날짜를 선택해주세요.`);
                                break;

                            case 502:
                                alert(`502 Bad Gate Way.`);
                                break;

                            default:
                                console.log(`default-error.messege : ${error.messege}`)
                                alert(`default 오류`);
                                break;
                        }
                    } else {
                        console.log(`else-error : ${error.messege}`);
                        alert(`서버오류`);
                    }
                });

        } else {
            alert(`결제수단을 선택해주세요`);
        }

    } //payment


    // ===[. 결제창 닫기]========================================================================
    function close() {
        setPaymentModalOpen(false);
    }

    //==============================================================================================================================
    return (
        <div className='PaymentModalContainerBackGround'>
            <div className='PaymentModalContainer'>
                <div className='paymentModalTitle'>
                    <span>{order_type === 'normal' ? '일반 구매'
                        : order_type === 'extend' ? '연장 구매' : 'errorrr'}
                    </span>
                </div>

                <div className='paymentProductBox'>
                    <table className='paymentProductInfoTable'>
                        <thead>
                            <tr>
                                {p_type === 'm' ?
                                    <>
                                        <th style={{ width: '25%' }}>상품구분</th>
                                        <th style={{ width: '50%' }}>유효기간</th>
                                        <th style={{ width: '25%' }}>가격</th>
                                    </>

                                    : p_type === 'd' || p_type === 'f' ?
                                        <>
                                            <th style={{ width: '20%' }}>상품구분</th>
                                            <th style={{ width: '65%' }} colSpan={3} >유효기간</th>
                                            <th style={{ width: '15%' }}>가격</th>
                                        </>
                                        :
                                        <>
                                            <th>오류</th>
                                        </>
                                }
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                {p_type === 'm' ?
                                    <>
                                        <td style={{ width: '25%' }}>
                                            <span>시간권</span>
                                            <span>&nbsp;&nbsp;</span>
                                            <span>/</span>
                                            <span>&nbsp;&nbsp;</span>
                                            <span>{time_value / 60}</span>
                                            <span>시간</span>
                                        </td>

                                        <td style={{ width: '50%' }}>제한 없음</td>

                                        <td className='paymentModalPrice' style={{ width: '25%' }}>
                                            <span>{price !== null ? price.toLocaleString() : 'error'}</span>
                                            <span> 원</span>
                                        </td>
                                    </>

                                    : p_type === 'd' || p_type === 'f' ?
                                        <>
                                            <td style={{ width: '20%' }}>
                                                <span>{p_type === 'd' ? '기간권' : '고정석'}</span>
                                                <span>&nbsp;&nbsp;</span>
                                                <span>/</span>
                                                <span>&nbsp;&nbsp;</span>
                                                <span>{p_type === 'd' ? day_value / 24 : day_value / 24 / 7}</span>
                                                <span>{p_type === 'd' ? '일' : '주'}</span>
                                            </td>

                                            <td>
                                                <span className={order_type === 'extend' ? 'extendStartDate' : null}>{formatDate(start_date)}</span>
                                            </td>

                                            <td>~</td>

                                            <td>
                                                <span className={order_type === 'extend' ? 'extendEndDate' : 'extendNormal'}>{formatDate(end_date)}</span>
                                            </td>

                                            <td className='paymentModalPrice' style={{ width: '15%' }}>
                                                <span>{price !== null ? price.toLocaleString() : 'error'}</span>
                                                <span> 원</span>
                                            </td>
                                        </>

                                        :
                                        <>
                                            <th>오류</th>
                                        </>
                                }
                            </tr>

                        </tbody>
                    </table>
                </div>

                <div className='paymentOptionAmountContainer'>
                    <div className='paymentOptionWrapper'>
                        <div className='paymentOptionTitle'><span>결제수단</span></div>
                        <div className='paymentOptionBox'>
                            <div className='paymentOption naverPayOpt'>
                                <input type="radio" name="payoption" value='naverPay' onChange={handlePaymentOption} />
                                <span>네이버페이</span>
                            </div>
                            <div className='paymentOption tossOpt'>
                                <input type="radio" name="payoption" value='tossPay' onChange={handlePaymentOption} />
                                <span>토스페이</span>
                            </div>
                            <div className='paymentOption kakaoPayOpt'>
                                <input type="radio" name="payoption" value='kakaoPay' onChange={handlePaymentOption} />
                                <span>카카오페이</span>
                            </div>
                            <div className='paymentOption bankTransferOpt'>
                                <input type="radio" name="payoption" value='bankTransfer' onChange={handlePaymentOption} />
                                <span>무통장 입금</span>
                            </div>
                            <div className='paymentOption mobilePayOpt'>
                                <input type="radio" name="payoption" value='mobilePay' onChange={handlePaymentOption} />
                                <span>휴대폰 결제</span>
                            </div>
                        </div>
                    </div>

                    <div className='paymentAmountWrapper'>
                        <div className='paymentAmountTitle'><span>최종 결제금액</span></div>
                        <div className='paymentAmountBox'>
                            <span>{price !== null ? price.toLocaleString() : 'error'}</span>
                            <span> 원</span>
                        </div>
                    </div>
                </div>

                <div className='paymentButtonBox'>
                    <button onClick={payment}>결제</button>
                    <button onClick={close}>취소</button>
                </div>
            </div>

        </div>
    );
}

export default PaymentModal;