import './CheckInUseProducts.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

function CheckInUseProducts({ setCheckInUseProductsOpen, checkInUseProductsOpen }) {
    const loginID = sessionStorage.getItem("loginID");
    const navigator = useNavigate();

    const [usableProductData, setUsableProductData] = useState([]);
    const [selectedUsableProduct, setSelectedUsableProduct] = useState(null);
    const [choosedTableType, setChoosedTableType] = useState('df');


    //==[1. 사용가능 상품 목록 요청 & 스크롤 방지]=============================================================================================
    useEffect(() => {
        // javaScript 이용해야함.
        document.body.style.cssText = `
        position: fixed; 
        top: -${window.scrollY}px;
        overflow-y: scroll;
        width: 100%;`;

        const idData = { id: loginID }

        axios
            .post(`/upp/usableUppList`, idData)
            .then((res) => {
                console.log(`소유중인 상품 목록 부르기 성공`);
                console.log(res.data);
                setUsableProductData(res.data);

            }).catch((e) => {
                alert(`소유중인 상품 목록 부르기 Failed`);
                console.log(`소유중인 상품 목록 부르기 Failed : ${e.message}`);
            })
    }, []);


    //==[2. 사용할 상품 선택하기 ]=============================================================================================
    function selectUpp(uppcode) {
        setSelectedUsableProduct(uppcode);
    }

    console.log(`사용할 상품 선택 중....  : ${selectedUsableProduct}`);


    //==[3. 최종 선택 ]=============================================================================================
    function finalChooseProduct() {
        if (selectedUsableProduct) {
            const choosedData = {
                id: loginID,
                upp_code: selectedUsableProduct
            }

            axios
                .post(`seat/finalChooseProduct`, choosedData)
                .then((r) => {
                    sessionStorage.setItem('uppcode', selectedUsableProduct);
                    sessionStorage.setItem('menuType', 'checkin');
                    setCheckInUseProductsOpen(false);

                }).catch((e) => {
                    if (e.response.status === 409) {
                        alert(`기간권 / 고정석 상품 사용중에는 중복 사용 방지를 위해 \n시간권 사용이 제한됩니다`);
                    } else {
                        alert(`error`);
                    }
                })

        } else {
            alert(`사용하실 이용권을 선택해주세요.`);
        }

        console.log(`최종 사용 상품 선택 : ${selectedUsableProduct}`);
    }


    //==[4. 날짜 format ]=============================================================================================
    function formatDate(dateString) {
        return moment(dateString).format('YYYY-MM-DD # HH:mm:ss');
    }


    //==[5. 테이블 Rendering ]=============================================================================================
    function usableProductTable() {
        const filterUsableData =
            choosedTableType === 'm' ? usableProductData.filter(data => data.p_type === 'm')
                : usableProductData.filter(data => data.p_type === 'd' || data.p_type === 'f');

        console.log(`${choosedTableType === 'm' ? '시간권' : '기간권'} 선택 : ${filterUsableData}`);

        return (
            <table className='usableProductTable'>
                <thead>

                    <tr>
                        <th>상품 구분</th>

                        {choosedTableType === 'm' ?
                            <>
                                <th className='th_usedTime'>사용시간</th>
                                <th className='th_availableTime'>남은시간</th>
                            </>
                            :
                            <>
                                <th className='th_usableValidPeriod'>유효기간</th>
                            </>
                        }

                        <th></th>
                    </tr>
                </thead>
                <tbody className='OwnedProductsTbody'>
                    {filterUsableData.map((d, i) => (
                        <tr key={i}
                            onClick={() => selectUpp(d.upp_code)}
                            className={`usablePass${selectedUsableProduct === d.upp_code ? 'Selected' : ''} `}
                        >

                            {choosedTableType === 'm' ?
                                <>
                                    <td>
                                        <span>시간권</span>
                                        <span>&nbsp;&nbsp;</span>
                                        <span>/</span>
                                        <span>&nbsp;&nbsp;</span>
                                        <span>{d.time_value / 60}</span>
                                        <span>시간</span>
                                    </td>
                                    <td className='td_usedTime'>
                                        <span>{Math.floor(d.used_time / 60)}</span>
                                        <span>시간</span>
                                        <span>&nbsp;</span>
                                        <span>{d.used_time % 60}</span>
                                        <span>분</span>
                                    </td>
                                    <td className='td_availableTime'>
                                        <span>{Math.floor(d.available_time / 60)}</span>
                                        <span>시간</span>
                                        <span>&nbsp;</span>
                                        <span>{d.available_time % 60}</span>
                                        <span>분</span>
                                    </td>
                                </>
                                :
                                <>
                                    <td>
                                        <span>{d.p_type === 'd' ? '기간권' : '고정석'}</span>
                                        <span>&nbsp;&nbsp;</span>
                                        <span>/</span>
                                        <span>&nbsp;&nbsp;</span>
                                        <span>{(d.day_value / 24) >= 28 ? d.day_value / 24 / 7 : `${(d.day_value / 24)}`}</span>
                                        <span>{(d.day_value / 24) >= 28 ? `주` : `일`}</span>
                                    </td>
                                    <td className='td_startEndDate'>
                                        <span>{formatDate(d.start_date)}</span>
                                        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <span>~</span>
                                        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <span>{formatDate(d.end_date)}</span>
                                    </td>
                                </>
                            }

                        </tr>
                    ))}
                </tbody>
            </table >
        )
    }

    //=========================================================================================================================================
    return (
        <>
            <div className='CheckInUseProductsBackGround'>
                <div className='CheckInUseProductsContainer'>
                    <div className='checkInUseProductTitle'><span>사용하실 상품을 선택해주세요</span></div>

                    <div className='selectPassTypeButtonBox'>
                        <button onClick={() => setChoosedTableType('df')}
                            className={choosedTableType === 'm' ? '' : 'choosedTabletypeButton'}>기간권 / 고정석</button>
                        <button onClick={() => setChoosedTableType('m')}
                            className={choosedTableType === 'm' ? 'choosedTabletypeButton' : ''}>시간권</button>
                    </div>

                    {usableProductTable()}

                    <div className='usableProductTableButtonBox'>
                        <button
                            onClick={() => finalChooseProduct()}
                            className={selectedUsableProduct !== null ? 'activeChooseButton' : 'noneActiveChooseButton'}>선택상품 사용</button>
                        <button onClick={() => navigator('/')}>홈으로</button>
                    </div>
                </div>
            </div >
        </>
    );
}

export default CheckInUseProducts;
