import './SeatManagementPage.css';

import axios from 'axios';
import { useEffect, useState } from 'react';

import SeatUnit from './SeatUnit';
import SeatUnitControlModal from './SeatUnitControlModal';


function SeatManagementPage() {

    const [seatsData, setSeatsData] = useState([]);
    const [seatUnitControlModalOpen, setSeatUnitControlModalOpen] = useState(false);

    useEffect(() => {
        axios
            // .get(`/seat/presentAllSeats`)
            .get(`/seat/allSeatsAdmin`)
            .then((r) => {
                console.log(`관리자 좌석 현황 성공 : ${JSON.stringify(r.data)}`);
                setSeatsData(r.data);
            }).catch((e) => {
                console.log(`관리자 좌석현황 실패 : ${e.message}`);
                alert(`관리자 좌석 현황 실패`);
            })


        // 클린업 함수
        return () => {
            sessionStorage.setItem('seat', null);
        };

    }, []);

    function searchSeat() {
        sessionStorage.setItem('seat', 'search');
        setSeatUnitControlModalOpen(true);
    }

    function fixedSeatMove() {
        sessionStorage.setItem('seat', 'search');
        setSeatUnitControlModalOpen(true);
    }

    console.log(sessionStorage.getItem('seat'));
    //===============================================================================================================================
    return (
        <>
            <div className='SeatManagementPageContainer'>
                <div className='seatRoom1'>

                    <div className='enteranceDoor'>출입문</div>
                    <div className='topCenter'>
                        {seatsData.slice(0, 10).map((d, i) => (
                            <SeatUnit
                                key={i}
                                seat_num={d.seat_num}
                                occupied={d.occupied}
                                id={d.id}
                                upp_code={d.upp_code}
                                p_type={d.p_type}
                                time_value={d.time_value}
                                used_time={d.used_time}
                                available_time={d.available_time}
                                day_value={d.day_value}
                                start_date={d.start_date}
                                end_date={d.end_date}
                                setSeatUnitControlModalOpen={setSeatUnitControlModalOpen}
                            />
                        ))}
                    </div>

                    <div className='leftSide'>
                        {seatsData.slice(10, 22).map((d, i) => (
                            <SeatUnit
                                key={i + 10}
                                seat_num={d.seat_num}
                                occupied={d.occupied}
                                id={d.id}
                                upp_code={d.upp_code}
                                p_type={d.p_type}
                                time_value={d.time_value}
                                used_time={d.used_time}
                                available_time={d.available_time}
                                day_value={d.day_value}
                                start_date={d.start_date}
                                end_date={d.end_date}
                                setSeatUnitControlModalOpen={setSeatUnitControlModalOpen}
                            />
                        ))}
                    </div>

                    <div className='rightSide'>
                        {seatsData.slice(22, 37).map((d, i) => (
                            <SeatUnit
                                key={i + 22}
                                seat_num={d.seat_num}
                                occupied={d.occupied}
                                id={d.id}
                                upp_code={d.upp_code}
                                p_type={d.p_type}
                                time_value={d.time_value}
                                used_time={d.used_time}
                                available_time={d.available_time}
                                day_value={d.day_value}
                                start_date={d.start_date}
                                end_date={d.end_date}
                                setSeatUnitControlModalOpen={setSeatUnitControlModalOpen}
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
                                <SeatUnit
                                    key={i + 37}
                                    seat_num={d.seat_num}
                                    occupied={d.occupied}
                                    id={d.id}
                                    upp_code={d.upp_code}
                                    p_type={d.p_type}
                                    time_value={d.time_value}
                                    used_time={d.used_time}
                                    available_time={d.available_time}
                                    day_value={d.day_value}
                                    start_date={d.start_date}
                                    end_date={d.end_date}
                                    setSeatUnitControlModalOpen={setSeatUnitControlModalOpen}
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
                                <SeatUnit
                                    key={i + 45}
                                    seat_num={d.seat_num}
                                    occupied={d.occupied}
                                    id={d.id}
                                    upp_code={d.upp_code}
                                    p_type={d.p_type}
                                    time_value={d.time_value}
                                    used_time={d.used_time}
                                    available_time={d.available_time}
                                    day_value={d.day_value}
                                    start_date={d.start_date}
                                    end_date={d.end_date}
                                    setSeatUnitControlModalOpen={setSeatUnitControlModalOpen}
                                />
                            ))}
                        </div>
                    </div>

                    <div className='bottomCenter'>
                        {seatsData.slice(53, 67).map((d, i) => (
                            <SeatUnit
                                key={i + 53}
                                seat_num={d.seat_num}
                                occupied={d.occupied}
                                id={d.id}
                                upp_code={d.upp_code}
                                p_type={d.p_type}
                                time_value={d.time_value}
                                used_time={d.used_time}
                                available_time={d.available_time}
                                day_value={d.day_value}
                                start_date={d.start_date}
                                end_date={d.end_date}
                                setSeatUnitControlModalOpen={setSeatUnitControlModalOpen}
                            />
                        ))}
                    </div>



                </div>

                {seatUnitControlModalOpen &&
                    <SeatUnitControlModal
                        seatUnitControlModalOpen={seatUnitControlModalOpen}
                        setSeatUnitControlModalOpen={setSeatUnitControlModalOpen}
                    />
                }

            </div>
            <div className='seatManageButton'>
                <div className='seatSearchButton'><button onClick={() => searchSeat()}>좌석 검색</button></div>
                {/* <div className='fixedSeatMoveButton'><button onClick={() => fixedSeatMove()}>고정석 자리 이동</button></div> */}
            </div>
        </>
    )
}

export default SeatManagementPage;