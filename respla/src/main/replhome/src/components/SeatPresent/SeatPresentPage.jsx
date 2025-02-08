import './SeatPresentPage.css';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import Seat from './Seat';
import SeatModal from './SeatModal';
import CheckInUseProducts from './CheckInUseProducts';


function SeatPresentPage() {
    const [seatsData, setSeatsData] = useState([]);

    const loginID = sessionStorage.getItem("loginID");
    const menuType = sessionStorage.getItem("menuType");
    const sessionUppcode = sessionStorage.getItem("uppcode");

    const [checkInUseProductsOpen, setCheckInUseProductsOpen] = useState(false);
    const [menuTypeModalOpen, setMenuTypeModalOpen] = useState(false);
    const [seatModalOpen, setSeatModalOpen] = useState(false);

    const [startIdx, setStartIdx] = useState(0);

    //==[1. esc 입력시, Modal 닫힘 설정 함수] =======================================================================================
    function handleEscKey(e) {
        if (e.key === 'Escape') {
            setMenuTypeModalOpen(false);
        }
    };

    //===[2. 좌석현황 보여주기 , checkin창 열기 , checkout moveseat 열기 ]=======================================================================
    useEffect(() => {
        window.addEventListener('keydown', handleEscKey);

        axios
            .get(`/seat/presentAllSeats`)
            .then((response) => {
                console.log(`좌석현황 성공 :`, response);
                console.log('========================================');

                setSeatsData(response.data);

            }).catch((err) => {
                alert(`좌석현황 실패 => ${err.message}`);
            });

        if (menuType === 'checkin') {
            setCheckInUseProductsOpen(true);

        } else if (menuType === 'checkout' || menuType === 'moveseat') {
            setMenuTypeModalOpen(true);
        }


        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };

    }, []);


    // =======[3. 체크아웃 , 자리이동 창 확인버튼 함수]============================================
    function closeMenuTypeModalOpen() {
        setMenuTypeModalOpen(false);
    }

    function closeMenuTypeModalOpenBackGround(event) {
        if (event.target.className === 'menuTypeModalContainerBackGround') {
            setMenuTypeModalOpen(false);
        }
    }


    //=======[4. 좌석 구역]============================================================
    function sliceSeat(chunkSize) {
        const duplSeats = seatsData.slice(startIdx, startIdx + chunkSize);
        // setStartIdx(prev => prev + chunkSize);
        console.log(`slice : ${startIdx} , ${startIdx + chunkSize}`);
        return duplSeats;
    }

    //============================================================================================================================
    return (
        <div className='SeatPresentPageContainer'>
            <div className='seatRoom1'>
                <div className='enteranceDoor'>출입문</div>
                <div className='topCenter'>
                    {seatsData.slice(0, 10).map((d, i) => (
                        <Seat
                            key={i}
                            seat_num={d.seat_num}
                            occupied={d.occupied}
                            id={d.id}
                            menuType={menuType}
                            upp_code={d.upp_code}
                            setSeatModalOpen={setSeatModalOpen}
                        />
                    ))}
                </div>

                <div className='leftSide'>
                    {seatsData.slice(10, 22).map((d, i) => (
                        <Seat
                            key={i + 10}
                            seat_num={d.seat_num}
                            occupied={d.occupied}
                            id={d.id}
                            menuType={menuType}
                            upp_code={d.upp_code}
                            setSeatModalOpen={setSeatModalOpen}
                        />
                    ))}
                </div>

                <div className='rightSide'>
                    {seatsData.slice(22, 37).map((d, i) => (
                        <Seat
                            key={i + 22}
                            seat_num={d.seat_num}
                            occupied={d.occupied}
                            id={d.id}
                            menuType={menuType}
                            upp_code={d.upp_code}
                            setSeatModalOpen={setSeatModalOpen}
                        />
                    ))}
                </div>

                <div className='centerSection1'>
                    <div className='verticalWall'></div>
                    <div className='horizontalWall1'></div>
                    <div className='horizontalWall2'></div>
                    <div className='horizontalWall3'></div>

                    <div className='centerSectionSeats'>
                        {seatsData.slice(37, 45).map((d, i) => (
                            <Seat
                                key={i + 37}
                                seat_num={d.seat_num}
                                occupied={d.occupied}
                                id={d.id}
                                menuType={menuType}
                                upp_code={d.upp_code}
                                setSeatModalOpen={setSeatModalOpen}
                            />
                        ))}
                    </div>
                </div>

                <div className='centerSection2'>
                    <div className='verticalWall'></div>
                    <div className='horizontalWall1'></div>
                    <div className='horizontalWall2'></div>
                    <div className='horizontalWall3'></div>

                    <div className='centerSectionSeats'>
                        {seatsData.slice(45, 53).map((d, i) => (
                            <Seat
                                key={i + 45}
                                seat_num={d.seat_num}
                                occupied={d.occupied}
                                id={d.id}
                                menuType={menuType}
                                upp_code={d.upp_code}
                                setSeatModalOpen={setSeatModalOpen}
                            />
                        ))}
                    </div>
                </div>

                <div className='bottomCenter'>
                    {seatsData.slice(53, 67).map((d, i) => (
                        <Seat
                            key={i + 53}
                            seat_num={d.seat_num}
                            occupied={d.occupied}
                            id={d.id}
                            menuType={menuType}
                            upp_code={d.upp_code}
                            setSeatModalOpen={setSeatModalOpen}
                        />
                    ))}
                </div>



            </div>

            {checkInUseProductsOpen && (
                <CheckInUseProducts
                    setCheckInUseProductsOpen={setCheckInUseProductsOpen}
                    checkInUseProductsOpen={checkInUseProductsOpen}
                />
            )}

            {menuTypeModalOpen && (
                <div className='menuTypeModalContainerBackGround' onClick={closeMenuTypeModalOpenBackGround}>
                    <div className='menuTypeModalContainer' onClick={(e) => e.stopPropagation()}>
                        {menuType === 'checkout' ?
                            <>
                                <span>현재 본인이 사용중인 자리를</span>
                                <span>선택해주세요</span>
                            </>

                            : menuType === 'moveseat' ?
                                <>
                                    <span>이동하실 좌석을 선택해주세요</span>
                                    <span>&nbsp;</span>
                                </>

                                : null}

                        <button onClick={closeMenuTypeModalOpen}>확인</button>
                    </div>
                </div>
            )}

        </div>
    )
}

export default SeatPresentPage;