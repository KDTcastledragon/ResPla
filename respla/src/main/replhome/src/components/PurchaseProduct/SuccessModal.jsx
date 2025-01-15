import './SuccessModal.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function SuccessModal({ setSuccessModalOpen, closeTime }) {
    const navigator = useNavigate();
    const orderType = sessionStorage.getItem('order_type');


    //==[1. esc 입력시, Modal 닫힘 설정 함수] =======================================================================================
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            setSuccessModalOpen(false);
        }
    };


    //==[2. 모달창 오픈시에 자동으로 Esc 키 이벤트를 감지하도록 설정]=============================================================
    useEffect(() => {
        window.addEventListener('keydown', handleEscKey);

        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };

    }, []);


    //===================================================================================================
    function closeModalBackGround(e) {
        if (e.target.classList.contains('SuccessModalContainerBackGround')) {
            setSuccessModalOpen(false);
        }
    }


    //================================================================================================================
    return (
        <div className='SuccessModalContainerBackGround' onClick={closeModalBackGround}>
            <div className="SuccessModalContainer" onClick={(e) => e.stopPropagation()}>
                <div className='successModalTitle'>
                    {orderType === 'normal' ? <span>상품 구매 성공</span>
                        : orderType === 'extend' ? <span>연장 구매 성공</span>
                            : <span>구매 성공</span>}
                </div>
                <div className='successModalButtonBox'>
                    <button onClick={() => navigator('/')}>홈으로</button>
                    <button onClick={() => setSuccessModalOpen(false)}>닫기</button>
                </div>
                <div className='successModalCloseTime'>
                    <span>{closeTime}</span>
                    <span>초 후에 홈 화면으로 이동합니다.</span>
                </div>
            </div>
        </div>
    );
}

export default SuccessModal;