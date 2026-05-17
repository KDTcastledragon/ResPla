import './Seat.css';
// import axios from 'axios';
import { useState } from 'react';
import SeatModal from './SeatModal';

function Seat(props) {
    const loginID = sessionStorage.getItem("loginID");
    const menuType = sessionStorage.getItem('menuType');
    const [seatModalOpen, setSeatModalOpen] = useState(false);

    const seatClick = () => {
        switch (menuType) {
            case 'checkin':
            case 'moveseat':
                if (props.id && props.id !== loginID) {
                    alert(`다른 이용자가 사용중입니다. 비어있는 자리를 선택해주세요.`);

                } else if (props.id === null) {
                    setSeatModalOpen(true);

                } else if (props.id && props.id === loginID) {
                    alert(`현재 입실중인 자리입니다. 비어있는 자리를 선택해주세요.`);

                }

                break;

            case 'checkout':
                if (props.id && props.id !== loginID) {
                    alert(`다른 이용자가 사용중입니다. 본인이 사용중인 자리를 선택해주세요.`);

                } else if (props.id === null) {
                    alert(`현재 비어있는 자리입니다. 본인이 사용중인 자리를 선택해주세요.`);

                } else {
                    setSeatModalOpen(true);
                }
                break;


            default:
                break;
        }
    }

    return (
        <div className={props.id !== null && props.upp_code !== null && props.id === loginID ? 'seatMine'
            : props.occupied === true || (props.occupied === false && props.id !== null && props.upp_code !== null && props.id !== loginID) ? 'seatUsed'
                : 'SeatContainer'}

            onClick={menuType !== 'seatpresent' ? seatClick : null}>

            <div className='seatNum'>
                <span>{props.seat_num}</span>
            </div>

            <div className='seatPrseentState'>

                {props.occupied === true || (props.id !== null && props.upp_code !== null) ?
                    <>
                        <div className='seatPrseentOccupied'>
                            <span>{props.id === loginID ? '본인좌석'
                                : '사용중'}</span>
                        </div>
                    </>

                    : props.occupied === false ?

                        <>
                            <div className='seatPrseentVacant'>

                            </div>
                        </>
                        :
                        <>
                            <div>error</div>
                        </>
                }
            </div>

            {seatModalOpen &&
                <>
                    <SeatModal
                        seat_num={props.seat_num}
                        id={props.id}
                        occupied={props.occupied}
                        setSeatModalOpen={setSeatModalOpen}
                        seatModalOpen={seatModalOpen}
                        upp_code={props.upp_code}
                    />
                </>

            }

        </div>
    )
}

export default Seat;