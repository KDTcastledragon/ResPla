import { useEffect } from 'react';
import './SaledProductItem.css';
import axios from 'axios';

function SaledProductItem({ product_code, p_type, time_value, day_value, price, sell_count, refund_count, maxCount }) {


    //=========================================================================================================================
    return (
        <div className='SaledProductItemContainer'>
            <div className='salesBarArea'>
                <div className="barTrack">
                    <span>{sell_count}</span>
                    {/* <span>4567</span> */}
                    <div className="salesBar" style={{ height: `${(sell_count / maxCount) * 100}%` }}>
                    </div>
                </div>

                <div className="barTrack">
                    <span>{refund_count}</span>
                    <div className="refundBar" style={{ height: `${(refund_count / maxCount) * 100}%` }}>
                    </div>
                </div>
            </div>
            <div>
                {p_type === 'm' ?
                    <>
                        <span>시간권</span>
                        <span>&nbsp;{`[ ${time_value / 60} ]`}</span>
                    </>
                    : p_type === 'd' ? `기간권 [ ${day_value} ]`
                        : p_type === 'f' ? `고정석 [ ${day_value} ]`
                            : 'error'}



                <span>{price.toLocaleString()}</span>
            </div>
            <div>
            </div>

        </div>
    );
}

export default SaledProductItem;