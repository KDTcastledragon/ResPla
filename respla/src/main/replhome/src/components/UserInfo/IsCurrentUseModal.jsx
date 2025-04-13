import './IsCurrentUseModal.css';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function IsCurrentUseModal({ setIsCurrentUseModal, closeTime, setCloseTime, isCurrentUseModalObject, setInitCloseTime, initCloseTime }) {

    const navigator = useNavigate();
    const [cmt, setCmt] = useState(isCurrentUseModalObject.comment);

    const [isOpen, seIsOpen] = useState(isCurrentUseModalObject.isOpen);
    const [currentMenuType, setCurrentMenuType] = useState(isCurrentUseModalObject.menuType);
    const [responseStatus, setResponseStatus] = useState(isCurrentUseModalObject.responseStatus);

    function closeCurrentModal() {
        setIsCurrentUseModal(false);
        setCloseTime(initCloseTime); // closeTime을 초기화 하는 작업 실행. 사소하지만 잊으면 안됨.
    }

    function PurchasePage() {
        navigator('/PurchaseSelectPage');
    }

    function CheckInPage() {
        sessionStorage.setItem("menuType", 'checkin');
        navigator('/seatPresentPage');
    }


    return (
        <div className={`IsCurrentUseModalContainer`}>
            <div className='isCurrentUseMOdalCommentBox'>
                {cmt === '200p' ?
                    <>
                        <span>이미 입실하였습니다.</span>
                        <span>추가 구매 하시겠습니까?</span>
                    </>

                    : cmt === '200ci' ?
                        <>
                            <span>이미 입실하였습니다.</span>
                        </>

                        : cmt === '202p' ?
                            <>
                                <span>현재 사용가능 상품이 존재합니다.</span>
                                <span>추가 구매 하시겠습니까?</span>
                            </>

                            : cmt === '202com' ?
                                <>
                                    <span>입실 후 이용 가능합니다.</span>
                                    <span>현재 사용가능 상품이 존재합니다.</span>
                                    <span>입실하시겠습니까? </span>
                                </>

                                : cmt === '204ci' ?
                                    <>
                                        <span>현재 사용가능 상품이 없습니다.</span>
                                        <span>이용권을 구매하시겠습니까?</span>
                                    </>

                                    : cmt === '204com' ?
                                        <>
                                            <span>입실 후 이용 가능합니다.</span>
                                            <span>현재 사용가능 상품이 없습니다.</span>
                                            <span>이용권을 구매하시겠습니까?</span>
                                        </>
                                        : cmt === '202cif' ?
                                            <>
                                                <span>사용중인 고정좌석으로</span>
                                                <span>입실 완료하였습니다.</span>
                                            </>
                                            // : cmt === '403mf' ?
                                            //     <>
                                            //         <span>고정석  자리이동은</span>
                                            //         <span>관리자에게 문의해주세요.</span>
                                            //     </>

                                            : <span>일시적 오류</span>





                }




            </div>


            <div className='isCurrentUseButtonBox'>
                {cmt === '200p' || cmt === '202p' || cmt === '204ci' || cmt === '204com' ?
                    <button onClick={PurchasePage}>상품 구매</button>

                    : cmt === '202com' ?
                        <button onClick={CheckInPage}>입실 하기</button>

                        : cmt === '200ci' ?
                            null

                            : cmt === '202cif' ?
                                null

                                : cmt === '403mf' ?
                                    null

                                    : <span>Error</span>
                }

                <button onClick={cmt === '202cif' ? () => window.location.reload()
                    : () => closeCurrentModal()
                }>닫기</button>
            </div>

            <div className='isCurrentUseModalCloseTimeComment'>
                <span>{closeTime}&nbsp;</span>
                <span>초 후에 창이 닫힙니다.</span>
            </div>
        </div>
    );
}

export default IsCurrentUseModal;