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
      <img className="w-[50px] dark:hidden" src={'/aquinace.svg'} alt="Aqui Nace Logo" />
      <img className="w-[50px] hidden dark:block" src={'/aquinace-light.svg'} alt="Aqui Nace Logo" />
      <span className="font-bold text-primary">Aqui Nace</span>
    </div>
  );
}
