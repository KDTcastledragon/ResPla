import './SeatUnitControlModal.css';

import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function SeatUnitControlModal(props) {
    const sItem = sessionStorage.getItem('seat');
    const navigator = useNavigate();

    const [searchWord, setSearchWord] = useState();
    const [seatData, setSeatData] = useState({});


    //=====[1. 퇴실]====================================================
    function checkOutRequest(ID, NUM, UPP) {
        const checkOutData = {
            id: ID,
            seat_num: NUM,
            upp_code: UPP
        }

        axios
            .post(`/seat/checkOut`, checkOutData)
            .then((response) => {
                alert(`퇴실처리 되었습니다.`, response.data);
                window.location.reload();
            }).catch((error) => {
                console.log(`체크아웃 실패`, error.message);
                alert(`체크아웃실패`, error.message);
            });
    }

    //=====[2. 완전 퇴실]====================================================
    function comepleteCheckOut(ID, NUM, UPP) {
        const checkOutData = {
            id: ID,
            seat_num: NUM,
            upp_code: UPP
        }

        axios
            .post(`/seat/comepleteCheckOut`, checkOutData)
            .then((response) => {
                alert(`퇴실처리 되었습니다.`, response.data);
                window.location.reload();
            }).catch((error) => {
                console.log(`체크아웃 실패`, error.message);
                alert(`완전 퇴실실패`);
            });
    }


    //======[3. 좌석 검색]===============================================================================================
    function searchSeat() {
        axios
            .get(`/seat/selectBySearchWord?searchWord=${searchWord}`)
            .then((r) => {
                if (r.status === 200) {
                    setSeatData(r.data);
                } else if (r.status === 204) {
                    alert(`해당 검색어와 일치하는 데이터 존재하지 않음.`);
                }
            }).catch((e) => {
                alert(`검색 오류`);
            })
    }


    //===================================================================================================
    return (
        <div className='SeatUnitControlContainerBackground'>
            <div className="SeatModalContainer">
                {sItem === 'click' && props.id !== null ?
                    <div className="seatModalContentBox">
                        <div className='adminSeatNumber'>
                            <span>좌석 번호 </span>
                            <span> : </span>
                            <span>{props.seat_num}</span>
                        </div>
                        <div>
                            <span>ID : </span>
                            <span>{props.id !== null ? props.id : '빈자리'}</span>
                        </div>
                        <div>
                            <span>uppCode : </span>
                            <span>{props.upp_code}</span>
                        </div>
                        <div>
                            <button className='checkOutConfirm' onClick={() => checkOutRequest(props.id, props.seat_num, props.upp_code)}>퇴실</button>
                            <button className='checkOutConfirm' onClick={() => comepleteCheckOut(props.id, props.seat_num, props.upp_code)}>완전 퇴실</button>
                        </div>
                    </div>

                    : sItem === 'click' && props.id === null ?
                        <div className="seatModalContentBox">
                            <div>빈자리</div>
                        </div>

                        : sItem === 'search' ?
                            <div className="seatModalContentBox">
                                <div>
                                    <span className='userListSearchTitle'>유저/좌석 정보</span>
                                    <input
                                        type="text"
                                        className='userListSearchInputText'
                                        value={searchWord}
                                        onChange={(e) => setSearchWord(e.target.value)}
                                    />
                                    <button className='userListSearchButton' onClick={searchSeat}>검색</button>
                                </div>

                                <div>
                                    <span>좌석 번호 </span>
                                    <span> : </span>
                                    <span>{seatData.seat_num}</span>
                                </div>

                                {seatData.id !== null ?
                                    <>
                                        <div>
                                            <span>ID : </span>
                                            <span>{seatData.id}</span>
                                        </div>
                                        <div>
                                            <span>uppCode : </span>
                                            <span>{seatData.upp_code}</span>
                                        </div>

                                        <div>
                                            <button className='checkOutConfirm'
                                                onClick={() => checkOutRequest(seatData.id, seatData.seat_num, seatData.upp_code)}>
                                                퇴실
                                            </button>
                                            <button className='checkOutConfirm'
                                                onClick={() => comepleteCheckOut(seatData.id, seatData.seat_num, seatData.upp_code)}>
                                                완전 퇴실
                                            </button>
                                        </div>
                                    </>
                                    :
                                    <>
                                        <div>빈자리</div>
                                    </>
                                }
                            </div>

                            : null
                }
                <div>
                    <button onClick={() => props.setSeatUnitControlModalOpen(false)}>닫기</button>
                </div>
            </div>
        </div>
    )
};

export default SeatUnitControlModal;