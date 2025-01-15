import './PurchaseItem.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import SuccessModal from './SuccessModal';
import PaymentModal from './PaymentModal';


function PurchaseItem({ product_code, time_value, day_value, price, sell_count }) {
    const navigator = useNavigate();

    const loginID = sessionStorage.getItem('loginID');
    const ptype = sessionStorage.getItem('ptype');



    const [closeTime, setCloseTime] = useState(20);          // Modal 자동종료 시간
    const [orderType, setOrderType] = useState();
    const [successModalOpen, setSuccessModalOpen] = useState(false); // 구매성공시 나오는 Modal
    const [paymentModalOpen, setPaymentModalOpen] = useState(false); // 결제 Modal
    const [dateConflict, setDateConflict] = useState(false);
    const [conflictStartDate, setConflictStartDate] = useState();
    const [conflictEndDate, setConflictEndDate] = useState();
    const [conflictPType, setConflictPType] = useState();
    const [conflictDayValue, setConflictDayValue] = useState();

    const [extStartDate, setExtStartDate] = useState();
    const [extEndDate, setExtEndDate] = useState();

    function formatDate(dateString) {
        return moment(dateString).format('YYYY-MM-DD # HH:mm:ss');
    }

    //==[0. 초기 시간 설정]====================================================================================
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const KoreaLocalDate = new Date(now.getTime() - (offset * 60000));    // - (offset * 60000) 보정 계산이 중요하다.
    const getLocalDatetime = KoreaLocalDate.toISOString().slice(0, 16);

    const [startDateTime, setStartDateTime] = useState(getLocalDatetime);

    const startDateFormat = new Date(startDateTime);
    // const calculatedEndDate = new Date(startDateFormat.getTime() + (day_value * 60 * 60 * 1000) - (offset * 60000));  // Hours 단위에 맞게 계산.
    const calculatedEndDate = new Date(startDateFormat.getTime() + (day_value * 1000) - (offset * 60000));  // 임시로 초단위.
    // const calculatedEndDate = new Date(startDateFormat);
    // calculatedEndDate.setDate(startDateFormat.getDate() + day_value);  // 일수를 더합니다.


    const getEndDateLocalTime = calculatedEndDate.toISOString().slice(0, 16);


    const [endDateTime, setEndDateTime] = useState(getEndDateLocalTime);


    //===[1. 날짜변경시 종료날짜 재계산]==================================================================================================================
    function calculateEndDateTime(changedStartTime) {
        const changedstartDateFormat = new Date(changedStartTime);
        // const calculatedchangedEndDate = new Date(changedstartDateFormat.getTime() + (day_value * 60 * 60 * 1000) - (offset * 60000));  // Hours 단위에 맞게 계산.
        const calculatedchangedEndDate = new Date(changedstartDateFormat.getTime() + (day_value * 1000) - (offset * 60000));
        const getChangedEndDateLocalTime = calculatedchangedEndDate.toISOString().slice(0, 16);
        setEndDateTime(getChangedEndDateLocalTime);
    }


    //===[2. 시작날짜 선택 & 이전 날짜 선택 방지.]===============================================================================================
    const selectStartDateTime = (e) => {
        if (e.target.value < getLocalDatetime) {
            alert('현재 시간보다 이전의 시간은 선택할 수 없습니다.');
            setStartDateTime(getLocalDatetime);

        } else {
            setStartDateTime(e.target.value);
            calculateEndDateTime(e.target.value);
        }
    };


    //===[3. 시간권 바로 구매 함수]===================================================================================
    function purchaseTimePass() {
        setStartDateTime(null);
        setEndDateTime(null);
        setPaymentModalOpen(true);
    }

    //===[3. 날짜 충돌 검사 && 일반/연장구매 함수]===================================================================================
    function normalOrder(selectedStartDateTime, selectedEndDateTime, order_type) {
        console.log(selectedStartDateTime, selectedEndDateTime);

        setOrderType(order_type);
        sessionStorage.setItem('order_type', order_type);

        const requestData = {
            id: loginID,
            startDateTime: selectedStartDateTime,
            endDateTime: selectedEndDateTime,
            product_code: product_code,
            order_type: order_type
        }

        axios
            .post('/product/isDateConflict', requestData)
            .then(r => {
                console.log(`기간충돌 없음. 정상작동. ${r.data}`);

                switch (r.status) {
                    case 200:
                        return new Promise((resolve) => {
                            const { extStartDate, extEndDate } = r.data;
                            // console.log(`제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발`);
                            // console.log(`${orderType}`);
                            // console.log(`ext시작: ${extStartDate}`);
                            // console.log(`ext끝: ${extEndDate}`);
                            // console.log(`제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발제발`);
                            setExtStartDate(extStartDate);
                            setExtEndDate(extEndDate);
                            resolve();
                        }).then(() => {
                            return new Promise((resolve) => {
                                setPaymentModalOpen(true);
                                resolve();
                            });
                        });

                    case 202:
                        setPaymentModalOpen(true);
                        break;

                    case 204:
                        alert(`연장구매는 기간권 / 고정석 상품 사용중에만 가능합니다.`);
                        break;

                    default:
                        console.log(`Unhandled status code: ${r.status}`);
                        alert(`알수없는 케이스`);
                        break;
                }

            })
            .catch(error => {
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            console.log(`날짜 존재하지 않음`);
                            alert(`시작날짜를 정확히 선택해주세요.`);
                            break;

                        case 403:
                            console.log(`날짜 존재하지 않음`);
                            alert(`구매상품의 종료날짜가 현재 시간 이전입니다.`);
                            break;

                        case 409:
                            console.log(`기간 충돌. 다른 날짜 선택`);
                            // alert(`사용중 / 사용예정 상품의 사용기간과 중복됩니다. \n다른 날짜를 선택해주세요.`);
                            console.log(error.response.data);
                            setConflictStartDate(error.response.data.startDateTime);
                            setConflictEndDate(error.response.data.endDateTime);
                            setConflictPType(error.response.data.p_type);
                            setConflictDayValue(error.response.data.day_value);
                            setDateConflict(true);
                            break;

                        default:
                            console.log(`default-error.messege : ${error.messege}`)
                            alert(`오류`);
                            break;
                    }
                } else {
                    console.log(`else-error : ${error.messege}`)
                    alert(`서버오류`);
                }
            });
    }


    //===[4. 상품 구매 성공시 모달]===================================================================================
    function onPaymentSuccessd() {
        setSuccessModalOpen(true);
        setPaymentModalOpen(false);
    }

    //===[5. 상품 구매 성공시 모달 출력 시간 계산]===================================================================================
    useEffect(() => {
        if (successModalOpen) {
            const timer = setInterval(() => {
                setCloseTime(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        setSuccessModalOpen(false);
                        navigator('/');
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            // 컴포넌트가 언마운트되거나 모달이 닫힐 때 타이머를 정리
            return () => clearInterval(timer);
        }
    }, [successModalOpen, navigator]);


    //==============================================================================================================================================
    return (
        <div className={ptype === 'm' ? 'PurchaseItemContainerTimePass' : ptype === 'd' ? 'PurchaseItemContainerDayPass' : 'PurchaseItemContainerFixPass'}>
            {ptype === 'm' ?
                <>
                    <div className='timePassInfoTitle'>
                        <div><span>{time_value / 60} 시간</span></div>

                        <div className='timePassPrice'>
                            <span>{price !== null ? price.toLocaleString() : null}</span>
                            <span> 원</span>
                        </div>

                        <div className='purchaseDayPassButtonBox'>
                            <button onClick={purchaseTimePass}>상품구매</button>
                        </div>
                    </div>
                </>

                : ptype === 'd' || ptype === 'f' ?
                    <>
                        <div className='dayPassInfoTitle'>
                            {/* <span>{day_value / 24 < 300 ? `${day_value / 7 / 24} 주` : `1년`}</span> */}
                            <span>{`${Math.floor(day_value / 24)} 일`}</span>
                        </div>

                        <div className='dayPassPrice'>
                            <span>{price !== null ? price.toLocaleString() : null}</span>
                            <span> 원</span>
                        </div>

                        <div className='chooseDateBox'>
                            <div className='chooseDateTitle'><span>시작 날짜 선택</span></div>
                            <div className='chooseStartDate'>
                                <span>시작일&nbsp;</span>
                                <input type="datetime-local"
                                    value={startDateTime}
                                    onChange={selectStartDateTime}
                                    min={getLocalDatetime}
                                />
                            </div>
                            <div className='choosedEndDate'>
                                <span>종료일&nbsp;</span>
                                <input type="datetime-local"
                                    value={endDateTime}
                                    onChange={selectStartDateTime}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className='purchaseDayPassButtonBox'>
                            <button onClick={() => normalOrder(startDateTime, endDateTime, 'normal')}>일반구매</button>
                            <button onClick={() => normalOrder(null, null, 'extend')}>연장구매</button>
                        </div>
                    </>

                    :
                    <>
                        <div>error_Pass</div>
                    </>

            }

            {paymentModalOpen && (
                <PaymentModal
                    paymentModalOpen={paymentModalOpen}
                    setPaymentModalOpen={setPaymentModalOpen}
                    product_code={product_code}
                    p_type={ptype}
                    time_value={time_value}
                    day_value={day_value}
                    price={price}
                    start_date={orderType === 'normal' ? startDateTime : orderType === 'extend' ? extStartDate : null}
                    end_date={orderType === 'normal' ? endDateTime : orderType === 'extend' ? extEndDate : null}
                    order_type={orderType}
                    onPaymentSuccessd={onPaymentSuccessd}
                />
            )}


            {successModalOpen && (
                <SuccessModal
                    successModalOpen={successModalOpen}
                    setSuccessModalOpen={setSuccessModalOpen}
                    closeTime={closeTime}
                />
            )}


            {dateConflict === true && conflictStartDate !== null && conflictEndDate !== null && (
                <div className='ConflictModalContainerBackGround'>
                    <div className='ConflictModalContainer'>
                        <div className='conflictTitle'><span>날짜 충돌</span></div>
                        <div className='conflictSubTitle'>
                            <span>사용중 / 사용예정인 상품이 존재합니다.</span>
                            <span>&nbsp;&nbsp;다른 날짜를 선택해주세요.</span>
                        </div>
                        <div className='conflictData'>
                            <span>{conflictPType === 'd' ? '기간권' : conflictPType === 'f' ? '고정석' : '오류'}</span>
                            <span>&nbsp;</span>
                            <span>{`[`}</span>
                            <span>{conflictDayValue / 24}</span>
                            <span>일</span>
                            <span>{`]`}</span>
                            <span>{`(`}</span>
                            <span>{conflictDayValue}</span>
                            <span>시간{`)`}</span>
                            <span>&nbsp;&nbsp;&nbsp;</span>
                            <span> : </span>
                            <span>&nbsp;&nbsp;&nbsp;</span>
                            <span>{formatDate(conflictStartDate)}</span>
                            <span>&nbsp; ~ &nbsp;</span>
                            <span>{formatDate(conflictEndDate)}</span>
                        </div>
                        <div className='conflictModalClose'>
                            <button onClick={() => setDateConflict(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default PurchaseItem;