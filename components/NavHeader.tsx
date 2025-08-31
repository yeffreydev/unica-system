"use client";
import { AppContext } from "@/context/AppContext";
import { useContext, useEffect } from "react";

export default function NavHeader() {
  const {
    bank: { bank },
  } = useContext(AppContext);

  useEffect(() => {
    console.log(bank.avatar);
  }, [bank]);

  return (
    <div className="flex flex-col items-center justify-center">
      <img className="w-[50px]" src={'/akinace.png'} alt="" />
      {/* <span className="font-bold text-[#145750] text-sidebar-[#145750]">{bank.name}</span> */}
      <span className="font-bold text-[#145750] text-sidebar-[#145750]">Aki Nace</span>
    </div>
  );
}
