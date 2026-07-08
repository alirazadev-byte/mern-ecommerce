import React, { useState } from "react";
import styles from "../../styles/styles";
import Profilesidebar from "./Profilesidebar";
import Profilecontent from "./Profilecontent";

const ProfilePage = () => {
  const [active, setactive] = useState(1);

  return (
    <div className={`${styles.Secction} flex bg-[#f5f5f5] py-10 `}>
      <div className="w-[20%] ">
        <Profilesidebar active={active} setactive={setactive} />
      </div>
      <div className="w-[80%]">
        <Profilecontent active={active} />
      </div>
    </div>
  );
};

export default ProfilePage;
