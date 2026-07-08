import React from "react";
import styles from "../styles/styles";
import { navitems } from "../static/data";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/actions/authActions";

const Navbar = ({ active }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()

  return (
    <div className={`block 800px:${styles.normalFlex}`}>
      {navitems &&
        navitems.map((i, index) => (
          <div key={index} className="flex">
            <Link
              to={i.url}
              className={`${
                active === index + 1
                  ? "text-[#17dd1f]"
                  : "text-black 800px:text-[#fff] font-[500] px-6 cursor-pointer pb-[30px]"
              }`}
            >
              {i.title}
            </Link>
          </div>
        ))}
    </div>
  );
};

export default Navbar;
