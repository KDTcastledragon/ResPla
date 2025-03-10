import './AdminLogInPage.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogInPage() {
    const navigator = useNavigate();

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    // useEffect(() => {
    // sessionStorage.setItem('authenticationAdminPage', 'adminLogIn');
    // const authenAdmin = sessionStorage.getItem('authenticationAdminPage');
    // }, [])

    function adminLogIn() {
        const data = { id: id, password: password }
        axios
            .post(`/admin/adminLogin`, data)
            .then((r) => {
                console.log(r.data);
                sessionStorage.setItem('admin_name', r.data.admin_name);
                sessionStorage.setItem('authority', r.data.authority);
                sessionStorage.setItem('admcode', r.data.admcode);
                navigator('/AdminPage');
                alert(`성공`);
                window.location.reload();
            }).catch((e) => {
                alert(`실패`);
            })
    }

    const goHome = () => {
        sessionStorage.clear();
        navigator('/');
        window.location.reload();
    }

    return (
        <div className='AdminLogInPageContainer'>
            <div className='adminPageLogInBox'>
                <div className='adminIdPwBox'>
                    <input type="text" required
                        value={id}
                        onChange={(e) => {
                            setId(e.target.value);
                        }} />
                    <input type="password" required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                </div>

                <div className='adminLogInButton'><button onClick={adminLogIn}>→</button></div>
            </div>
            <div className='adminHomeButton'><button onClick={goHome}>홈으로</button></div>
        </div>
    );
}

export default AdminLogInPage;