import './UserBenModal.css';

import axios from 'axios';
import { useState, useEffect } from 'react';

function UserBenModal({ benData, setBenData }) {
    const [benCauseText, setBenCauseText] = useState(null);

    function phoneFormat(num) {
        return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`
    }


    function userBen() {
        if (benCauseText === null) {
            alert(`사유를 적어주세요.`);

        } else {
            const data = {
                id: benData.id,
                isBenned: benData.isBenned,
                benCause: benCauseText
            }
            axios
                .post(`/user/ben`, data)
                .then(() => {
                    alert(`${benData.isBenned === false ? '이용금지 처리 완료' : benData.isBenned === true ? '이용금지 해제 완료' : '알 수 없는 오류'}`);
                    window.location.reload();

                }).catch((e) => {
                    alert(`금지 실패`);
                })
        }
    }


    //===================================================================================================================================
    return (
        <div className='UserBenModalContainerBackGround'>
            <div className='UserBenModalContainer'>
                <div className='userBenTitle'>
                    <span>
                        {benData.isBenned === false ? '이용 금지' : benData.isBenned === true ? '금지 해제' : '오류'}
                    </span>
                </div>

                <div className='userBenInfomation'>
                    <div>
                        <span>ID </span>
                        <span> : </span>
                        <span>{benData.id}</span>
                    </div>
                    <div>
                        <span>{benData.name}</span>
                    </div>
                    <div>
                        <span>{phoneFormat(benData.phoneNum)}</span>
                    </div>
                </div>

                <div className='benCauseBox'>
                    <div>
                        <span> {benData.isBenned === false ? '금지 사유' : benData.isBenned === true ? '금지 해제 사유' : '오류'}</span>
                    </div>
                    <textarea name="causeBen" id="causeben"
                        value={benCauseText}
                        onChange={(e) => setBenCauseText(e.target.value)}
                        maxLength={500}
                        placeholder='사유 작성'></textarea>
                </div>

                <div className={`${benData.isBenned === false ? 'userBenRequest' : benData.isBenned === true ? 'userUnBenRequest' : ''}`}>
                    <button onClick={userBen}>
                        {benData.isBenned === false ? '이용 금지' : benData.isBenned === true ? '금지 해제' : '오류'}
                    </button>
                    <button onClick={() => setBenData({ opened: false })}>닫기</button>
                </div>
            </div>
        </div>
    );
}

export default UserBenModal;