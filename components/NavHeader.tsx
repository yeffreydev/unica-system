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
      {bank.avatar && <img className="w-[50px]" src={bank.avatar} alt="" />}
      <span className="font-bold">{bank.name}</span>
    </div>
  );
}
