import React from "react";

const Allorders = () => {
  const order = [
    {
      _id: "kjla9pw8eOIHkJBCX",

      orderitems: [
        {
          name: "I Phone 14 Pro",
        },
      ],
      totalprice: 2000,
      orderstatus: "processing",
    },
  ];
  const columes = [
    { fields: "id", headername: "Order Id", minWidth: 150, flex: 0.7 },

    {
      fields: "Status",
      headername: "Status",
      minWidth: 130,
      flex: 0.7,
      // cellClassName: (params)  => {
      //   return params.getValue(params.id , "status")  === "Delivered"
      //   ? "" : ""
      // }
    },
  ];
  return <div>Allorders</div>;
};

export default Allorders;
