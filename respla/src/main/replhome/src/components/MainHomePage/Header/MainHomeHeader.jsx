import './MainHomeHeader.css';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MainHomeHeader() {
    const [loginID, setLoginID] = useState(sessionStorage.getItem('loginID'));

    useEffect(() => {
        const updateLoginID = () => {
            setLoginID(sessionStorage.getItem('loginID'));
        };

        updateLoginID();

        const interval = setInterval(updateLoginID, 20); // Check every 100ms

        return () => {
            clearInterval(interval);
        };
    }, []);

    const [aeee, ssaeee] = useState('init');
    const [nu, setnu] = useState(0);

    function allClear() {
        axios
            .get(`/user/abcde`)
            .then((r) => {
                ssaeee('allClear');
                setnu((prevNu) => {
                    if (prevNu >= 9999) {
                        return 0;  // 0으로 초기화하고 100을 추가한 값
                    } else {
                        return prevNu + 100;
                    }
                });
            })
            .catch((e) => {
                alert(`FailedClear. Please Refactoring.`);
                ssaeee(`FailedClear. Please Refactoring.`);
            });
    }


    return (
        <>
            <div className='MainHomeHeaderContainer'>
                <div className='mainHomeHeaderLogoTitle'>
                    <Link to={'/'}>
                        <span className='homeHeaderLogo'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="currentColor" class="bi bi-book" viewBox="-4 -5 20 20">
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752
                             1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81
                             4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02
                             1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5
                             0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
                            </svg>
                        </span>
                        <span className='homeHeaderTitle'> RESPLA 스터디카페 </span>
                    </Link>
                </div>
                <div>
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <button style={{ width: '200px', height: '50px', backgroundColor: 'gray' }} onClick={allClear}>제품 & 자리 & 기록 AllClear</button>

                    <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span style={{ width: '300px', height: '30px' }}>{aeee} {nu}</span>
                </div>
            </div>
        </>
    )
}

export default MainHomeHeader;