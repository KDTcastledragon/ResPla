import './UserUsageHistory.css';

import axios from 'axios';
import { useEffect, useState } from 'react';

function UserUsageHistory() {

    useEffect(() => {
        axios
            .get(`/product/allProductList`)
            .then((r) => {
                setProducts(r.data);
            }).catch((e) => {
                alert(`실패`);
            })
    }, [])


    //======================================================================
    return (
        <>

        </>
    )
}

export default UserUsageHistory;