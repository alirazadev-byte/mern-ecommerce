import React, { useState } from 'react'
import Sidebar from './Sidebar'
import styles from '../../styles/styles';
import Profilecontent from '../Profile/Profilecontent';

const AdminDashboard = () => {
  const [active, setactive] = useState(1);
  return (
    <div className={`${styles.Secction} flex bg-[#f5f5f5] py-10 `}>
      <div className="w-[20%] ">
        <Sidebar active={active} setactive={setactive} />
      </div>
      <div className="w-[80%]">
        <Profilecontent active={active} />
      </div>
    </div>
  )
}

export default AdminDashboard