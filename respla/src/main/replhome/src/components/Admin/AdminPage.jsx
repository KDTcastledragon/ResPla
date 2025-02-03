import axios from 'axios';
import './AdminPage.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AdminPage() {

    const navigator = useNavigate();

    const admcode = sessionStorage.getItem('admcode');
    const authority = sessionStorage.getItem('authority');

    const [adminList, setAdminList] = useState([]);
    const [adminHistory, setAdminHistory] = useState([]);

    const [openCode, setOpenCode] = useState(false);

    useEffect(() => {
        if (admcode === 's9811' && authority === 'superAdmin') {

            const data = {
                admcode: admcode,
                adminAty: authority
            }

            axios
                .post(`/admin/allAdminList`, data)
                .then((r) => {
                    setAdminList(r.data);
                }).catch((e) => {
                    console.log(`실패`);
                })

            axios
                .post(`/admin/allAdminHistory`, data)
                .then((r) => {
                    setAdminHistory(r.data);
                }).catch((e) => {
                    console.log(`실패`);
                })
        }
    }, []);

    function pNumFom(phoneNumber) {
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;
    }

    const logout = () => {
        sessionStorage.clear();
        navigator('/AdminLogInPage');
        window.location.reload();
    }

    function deleteAdmin(adminID) {

        const data = { id: adminID }

        axios
            .post(`/admin/deleteAdmin`, data)
            .then((r) => {
                alert(`관리자 삭제 완료`);
            }).catch((e) => {
                alert(`관리자 삭제 실패`);
            })
    }

    return (
        <>
            {admcode === 's9811' || admcode === 'a377' || admcode === 'd14' ?
                <div className='AdminPageContainer'>
                    <div className={authority === 'superAdmin' && admcode === 's9811' ? 'superAdminInformation' : 'adminInformation'}>
                        <div className='adminAuthority'>
                            <span>{authority === 'superAdmin' && admcode === 's9811' ? '최고 관리자'
                                : authority === 'superAdmin' && admcode === 'a377' ? '중간 관리자'
                                    : authority === 'superAdmin' && admcode === 'd14' ? '일반 관리자'
                                        : '오류'}</span>
                        </div>
                        {/* {authority === 'superAdmin' && admcode === 's9811' ? <button onClick={() => setOpenCode(true)}>코드</button> : null} */}
                        <button onClick={logout}>로그아웃</button>
                    </div>

                    {authority === 'superAdmin' && admcode === 's9811' ?
                        <>
                            <div className='adminListBox'>
                                <div className='adminListBoxTitle'><span>관리자 목록</span></div>
                                <div className='adminList'>
                                    {adminList.map((d, i) => (
                                        <div>
                                            <span>{d.id}</span>
                                            <span>{d.authority === 'superAdmin' ? '최고 관리자'
                                                : d.authority === 'manageAdmin' ? '중간 관리자'
                                                    : d.authority === 'admin' ? '일반 관리자'
                                                        : '오류'}</span>
                                            <span>{d.admin_name}</span>
                                            <span>{pNumFom(d.admin_phone_number)}</span>
                                            {d.authority === 'superAdmin' ? null
                                                :
                                                <button onClick={() => deleteAdmin(d.id)}>X</button>
                                            }
                                        </div>
                                    ))}
                                </div>
                                {/* <div className='adminCreateButton'><button>관리자 생성</button></div> */}
                            </div>

                            {/* <div className='adminManagementHistory'>
                                <div><span>카페 관리 기록</span></div>
                                {adminHistory.map((d, i) => (
                                    <div key={i}>
                                        <span>{d.authority === 'superAdmin' ? 's' : d.id}</span>
                                        <span>{d.authority === 'superAdmin' ? '최고 관리자'
                                            : d.authority === 'manageAdmin' ? '중간 관리자'
                                                : d.authority === 'admin' ? '일반 관리자'
                                                    : '오류'}</span>
                                        <span>{d.admin_name}</span>
                                        <span>{d.admin_phone_number}</span>
                                        {d.authority === 'superAdmin' ? null
                                            :
                                            <button onClick={() => deleteAdmin(d.id)}>X</button>
                                        }
                                    </div>

                                ))}

                            </div> */}
                        </>
                        : null
                    }
                </div>

                :

                <div>허가되지 않은 접근입니다.</div>
            }
        </>
    );
}

export default AdminPage;