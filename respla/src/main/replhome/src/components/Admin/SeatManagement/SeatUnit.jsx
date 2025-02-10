import './SeatUnit.css';
import { useState } from 'react';

import SeatUnitControlModal from './SeatUnitControlModal';

function SeatUnit(props) {
    const [seatUnitControlModalOpen, setSeatUnitControlModalOpen] = useState(false);

    const seatClick = () => {
        sessionStorage.setItem('seat', 'click');
        setSeatUnitControlModalOpen(true);
    }

    //==================================================================================================================================
    return (
        <div>
            <div className={props.occupied === false && props.id === null && props.upp_code === null ? 'SeatAdminContainer'
                : props.occupied === false && props.id !== null && props.upp_code !== null ? 'SeatAdminFixed'
                    : 'SeatAdminUsed'} onClick={seatClick}>

                <div className='seatNum'>
                    <span>{props.seat_num}</span>
                </div>

                {props.occupied === false && props.id === null && props.upp_code === null ?
                    <>
                        {null}
                    </>
                    :
                    <>
                        <div className='seatAdminUserId'><span>{props.id}</span></div>
                    </>
                }
            </div>

            {seatUnitControlModalOpen &&
                <>
                    <SeatUnitControlModal
                        seat_num={props.seat_num}
                        id={props.id}
                        occupied={props.occupied}
                        upp_code={props.upp_code}
                        p_type={props.p_type}
                        time_value={props.time_value}
                        used_time={props.used_time}
                        available_time={props.available_time}
                        day_value={props.day_value}
                        start_date={props.start_date}
                        end_date={props.end_date}
                        seatUnitControlModalOpen={seatUnitControlModalOpen}
                        setSeatUnitControlModalOpen={setSeatUnitControlModalOpen}
                    />
                </>

            }

        </div>
    )
};

export default SeatUnit;