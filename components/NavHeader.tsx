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
      <img className="w-[50px]" src={'/qipi.svg'} alt="Qipi Logo" />
      <span className="font-bold text-primary">Qipi</span>
    </div>
  );
}
