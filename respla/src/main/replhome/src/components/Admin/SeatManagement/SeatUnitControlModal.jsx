import './SeatUnitControlModal.css';

import axios from 'axios';
import moment from 'moment';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function SeatUnitControlModal(props) {
    const sItem = sessionStorage.getItem('seat');
    const navigator = useNavigate();

    const [searchWord, setSearchWord] = useState();
    const [seatData, setSeatData] = useState({});

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD # HH:mm:ss');
    };


    //=====[1. 퇴실]====================================================
    function checkOutRequest(ID, NUM, UPP) {
        const checkOutData = {
            id: ID,
            seat_num: NUM,
            upp_code: UPP
        }

        axios
            .post(`/seat/adminCheckOut`, checkOutData)
            .then((response) => {
                window.location.reload();
                alert(`퇴실처리 되었습니다.`, response.data);
            }).catch((error) => {
                console.log(`체크아웃 실패`, error.message);
                alert(`체크아웃실패`, error.message);
            });
    }

    //=====[2. 완전 퇴실]====================================================
    function forcedOut(ID, NUM, UPP) {
        const forcedOutData = {
            id: ID,
            seat_num: NUM,
            upp_code: UPP
        }

        axios
            .post(`/seat/forcedOut`, forcedOutData)
            .then((response) => {
                alert(`강퇴처리 완료.`);
                window.location.reload();
            }).catch((error) => {
                console.log(`강퇴 실패`, error.message);
                alert(`강퇴 실패`);
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
            <div className="SeatUnitControlModalContainer">
                {sItem === 'click' && props.id !== null && props.upp_code !== null ?
                    <>
                        <div className="seatModalContentBox">
                            <div className='adminSeatNumber'>
                                <span>{`<`}&nbsp;</span>
                                <span>{props.seat_num}</span>
                                <span>&nbsp;{`>`}</span>
                            </div>
                            <div className='adminSeatId'>
                                <span>ID</span>
                                <span>&nbsp; : &nbsp;</span>
                                <span>{props.id !== null ? props.id : '빈자리'}</span>
                            </div>

                            <div className='adminSeatPassInfo'>
                                <div className='adminSeatPType'>
                                    <span>{props.p_type === 'm' ? '시간권'
                                        : props.p_type === 'd' ? '기간권' : props.p_type === 'f' ? '고정석' : ''}
                                    </span>
                                    <span>&nbsp;</span>
                                    <span>{`[`}</span>
                                    <span>{props.p_type === 'm' ? props.time_value / 60
                                        : props.p_type === 'd' ? props.day_value / 24 : props.p_type === 'f' ? props.day_value / 24 / 7 : ''}
                                    </span>
                                    <span>{props.p_type === 'm' ? '시간' : props.p_type === 'd' ? '일' : props.p_type === 'f' ? '주' : ''}</span>
                                    <span>{`]`}</span>
                                    <span>&nbsp; / &nbsp;</span>
                                    <span>{props.upp_code}</span>
                                </div>
                                <div className='adminSeatTimeDayValue'>
                                    {props.p_type === 'm' ?
                                        <div className='userInfoUppTimePass'>
                                            <span>잔여시간</span>
                                            <span>&nbsp;&nbsp;:&nbsp;&nbsp;</span>
                                            <span>{Math.floor(props.available_time / 60)}</span>
                                            <span>&nbsp;시간&nbsp;&nbsp;</span>
                                            <span>{props.available_time % 60}</span>
                                            <span>&nbsp;분</span>
                                        </div>
                                        : props.p_type === 'd' || props.p_type === 'f' ?
                                            <>
                                                <span>{formatDate(props.start_date)}</span>
                                                <span>&nbsp; ~ &nbsp;</span>
                                                <span>{formatDate(props.end_date)}</span>
                                            </>
                                            : ''

                                    }
                                </div>
                            </div>
                        </div>
                        <div className='adminSeatButtonBox'>
                            <button className='checkOutConfirm' onClick={() => checkOutRequest(props.id, props.seat_num, props.upp_code)}>퇴실</button>
                            <button className='forcedOutConfirm' onClick={() => forcedOut(props.id, props.seat_num, props.upp_code)}>강퇴</button>
                        </div>
                        <div className='adminSeatCloseButtonBox'>
                            <button onClick={() => props.setSeatUnitControlModalOpen(false)}>닫기</button>

                        </div>

                    </>

                    : sItem === 'click' && props.id === null && props.upp_code === null ?
                        <div className="seatModalContentBox">
                            <div className='adminSeatNumber'>
                                <span>{`<`}&nbsp;</span>
                                <span>{props.seat_num}</span>
                                <span>&nbsp;{`>`}</span>
                            </div>
                            <div className='adminSeatvacated'><span>빈자리</span></div>
                            <div className='adminSeatCloseButtonBox'>
                                <button onClick={() => props.setSeatUnitControlModalOpen(false)}>닫기</button>

                            </div>
                        </div>
                        : sItem === 'search' ?
                            <>
                                <div className="seatModalContentBox">
                                    <div className='adminSeatNumber'>
                                        <span>{`<`}&nbsp;</span>
                                        <span>{seatData.seat_num}</span>
                                        <span>&nbsp;{`>`}</span>
                                    </div>

                                    {seatData.id !== null && seatData.upp_code !== null ?
                                        <>
                                            <div className='adminSeatId'>
                                                <span>ID</span>
                                                <span>&nbsp; : &nbsp;</span>
                                                <span>{seatData.id !== null ? seatData.id : ''}</span>
                                            </div>
                                            <div className='adminSeatPassInfo'>
                                                <div className='adminSeatPType'>
                                                    <span>{seatData.p_type === 'm' ? '시간권'
                                                        : seatData.p_type === 'd' ? '기간권' : seatData.p_type === 'f' ? '고정석' : ''}
                                                    </span>
                                                    <span>&nbsp;</span>
                                                    <span>{`[`}</span>
                                                    <span>{seatData.p_type === 'm' ? seatData.time_value / 60
                                                        : seatData.p_type === 'd' ? seatData.day_value / 24 : seatData.p_type === 'f' ? seatData.day_value / 24 / 7 : ''}
                                                    </span>
                                                    <span>{seatData.p_type === 'm' ? '시간' : seatData.p_type === 'd' ? '일' : seatData.p_type === 'f' ? '주' : ''}</span>
                                                    <span>{`]`}</span>
                                                    <span>&nbsp; / &nbsp;</span>
                                                    <span>{seatData.upp_code}</span>
                                                </div>
                                                <div className='adminSeatTimeDayValue'>
                                                    {seatData.p_type === 'm' ?
                                                        <div className='userInfoUppTimePass'>
                                                            <span>잔여시간</span>
                                                            <span>&nbsp;&nbsp;:&nbsp;&nbsp;</span>
                                                            <span>{Math.floor(seatData.available_time / 60)}</span>
                                                            <span>&nbsp;시간&nbsp;&nbsp;</span>
                                                            <span>{seatData.available_time % 60}</span>
                                                            <span>&nbsp;분</span>
                                                        </div>
                                                        : seatData.p_type === 'd' || seatData.p_type === 'f' ?
                                                            <>
                                                                <span>{formatDate(seatData.start_date)}</span>
                                                                <span>&nbsp; ~ &nbsp;</span>
                                                                <span>{formatDate(seatData.end_date)}</span>
                                                            </>
                                                            : ''

                                                    }
                                                </div>
                                            </div>
                                            <div className='adminSeatButtonBox'>
                                                <button className='checkOutConfirm' onClick={() => checkOutRequest(seatData.id, seatData.seat_num, seatData.upp_code)}>퇴실</button>
                                                <button className='forcedOutConfirm' onClick={() => forcedOut(seatData.id, seatData.seat_num, seatData.upp_code)}>강퇴</button>
                                            </div>
                                        </>
                                        :
                                        <>
                                            <div className='adminSeatId'>
                                                <span>{seatData.upp_code === null ? '빈자리' : '오류'}</span>
                                            </div>
                                            <div className='adminSeatPassInfo'>
                                                <div className='adminSeatPType'>

                                                </div>
                                                <div className='adminSeatTimeDayValue'>
                                                    <span>{seatData.upp_code === null ? '상품없음' : '오류'}</span>
                                                </div>
                                            </div>
                                            <div className='adminSeatButtonBox'>
                                                {/* <button className='checkOutConfirm' onClick={() => checkOutRequest(seatData.id, seatData.seat_num, seatData.upp_code)}>퇴실</button> */}
                                                {/* <button className='forcedOutConfirm' onClick={() => forcedOut(seatData.id, seatData.seat_num, seatData.upp_code)}>강퇴</button> */}
                                            </div>
                                        </>
                                    }
                                </div>

                                <div className='adminSeatCloseButtonBox'>
                                    <button onClick={() => props.setSeatUnitControlModalOpen(false)}>닫기</button>
                                </div>
                                <div className='userSeatSearchBox'>
                                    <span className='userSeatSearchTitle'>ID/좌석</span>
                                    <input
                                        placeholder='ID 또는 좌석번호를 입력해주세요'
                                        type="text"
                                        className='userSeatSearchInputText'
                                        value={searchWord}
                                        onChange={(e) => setSearchWord(e.target.value)}
                                    />
                                    <button className='userSeatSearchButton' onClick={searchSeat}>검색</button>
                                </div>
                            </>

                            : null
                }
            </div>


        </div >
    )
};

export default SeatUnitControlModal;