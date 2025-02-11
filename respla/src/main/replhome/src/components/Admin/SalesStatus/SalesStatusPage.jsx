import './SalesStatusPage.css';

import axios from 'axios';
import { useEffect, useState } from 'react';

import SaledProductItem from './SaledProductItem2';

function SalesStatusPage() {

    const [productData, setProductData] = useState([]);
    const [maxCount, setMaxCount] = useState();
    const [maxRevenue, setMaxRevenue] = useState();
    const [dateModalOpen, setDateModalOpen] = useState(false);

    const [animateBars, setAnimateBars] = useState(false);

    useEffect(() => {
        setAnimateBars(false);
        const timer = setTimeout(() => {
            setAnimateBars(true); // 800ms 후에 애니메이션 실행
        }, 700);

        axios
            .get(`/product/allProductList`)
            .then((r) => {
                setProductData(r.data);
                const maxCountValue = Math.max(...r.data.map((d) => Math.max(d.sell_count)));
                setMaxCount(maxCountValue + (maxCountValue / 3));

                const maxRevenueValue = Math.max(...r.data.map((d) => Math.max(d.sell_count * d.price)));
                setMaxRevenue(maxRevenueValue + (maxRevenueValue / 3));

            }).catch((e) => {
                alert(`실패`);
            })

        // setTimeout(() => {
        //     setAnimateBars(true);
        // }, 30);

        return () => {
            clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
            setAnimateBars(false);
        };
    }, [])


    //=================================================================================================================================
    return (
        <div className='SalesStatusPageContainer'>
            <div>
                <div className='salesStatusContentBox'>
                    <div className='salesStandardTitle'><span>판매량 기준</span></div>
                    <div className='salesStatusGraphBox'>
                        {productData.slice().sort((a, b) => b.sell_count - a.sell_count).map((d, i) => (
                            <>
                                <div className='salesInfo'>
                                    <div className="barTrack">
                                        <span className='barTrackSellCount'>{d.sell_count}</span>
                                        <div className={d.p_type === 'm' ? 'timebar' : d.p_type === 'd' ? 'daybar' : d.p_type === 'f' ? 'fixbar' : null}
                                            style={{
                                                height: animateBars ? `${(d.sell_count / maxCount) * 100}%` : '0',
                                            }}>
                                        </div>
                                    </div>
                                    <div className='barTrackProductInfo'>
                                        <div className='barTrackProductType'>
                                            <span>{d.p_type === 'm' ? '시간' : d.p_type === 'd' ? '기간' : d.p_type === 'f' ? '고정' : null}</span>
                                            <span>{`(`}</span>
                                            <span>{d.p_type === 'm' ? d.time_value / 60 : d.p_type === 'd' ? d.day_value / 24 : d.p_type === 'f' ? d.day_value / 24 / 7 : null}</span>
                                            <span>{`)`}</span>
                                        </div>
                                        <div className='barTrackProductPrice'>
                                            <span>{d.price !== null ? d.price.toLocaleString() : null}</span>
                                            <span>원</span>
                                        </div>

                                    </div>

                                </div>
                            </>
                        ))}
                    </div>
                </div>

                <div className='salesStatusContentBox'>
                    <div className='salesStandardTitle'><span>상품별 매출액 기준</span></div>
                    <div className='salesStatusGraphBox'>
                        {productData.slice().sort((a, b) => b.price * b.sell_count - a.price * a.sell_count).map((d, i) => (
                            <>
                                <div className='salesInfo'>
                                    <div className="barTrack">
                                        <span className='barTrackRevenue'><span>{d.price !== null ? (d.sell_count * d.price).toLocaleString() : null}</span></span>
                                        <div className={d.p_type === 'm' ? 'timebar' : d.p_type === 'd' ? 'daybar' : d.p_type === 'f' ? 'fixbar' : null}
                                            style={{
                                                height: animateBars ? `${(d.sell_count * d.price / maxRevenue) * 100}%` : '0',
                                            }}>
                                        </div>
                                    </div>
                                    <div className='barTrackProductInfo'>
                                        <div className='barTrackProductType'>
                                            <span>{d.p_type === 'm' ? '시간' : d.p_type === 'd' ? '기간' : d.p_type === 'f' ? '고정' : null}</span>
                                            <span>{`(`}</span>
                                            <span>{d.p_type === 'm' ? d.time_value / 60 : d.p_type === 'd' ? d.day_value / 24 : d.p_type === 'f' ? d.day_value / 24 / 7 : null}</span>
                                            <span>{`)`}</span>
                                        </div>
                                        <div className='barTrackProductPrice'>
                                            <span>{d.price !== null ? d.price.toLocaleString() : null}</span>
                                            <span>원</span>
                                        </div>

                                    </div>

                                </div>
                            </>
                        ))}
                    </div>
                </div>
            </div>

            <div className='salesTotalRevenueBox'>
                <div className='salesTotalRevenueTitle'><span>총 매출액</span></div>
                <div className='salesTotalRevenue'>
                    <span>{productData.reduce((total, d) => total + (d.sell_count * d.price), 0).toLocaleString()}</span>
                </div>
            </div>
        </div >
    )
}

export default SalesStatusPage;