"use client";

import { CustomInput } from "@/components/AppLayout";
import {
  RP_Overview,
  RP_Overview3,
  RP_Overview_2,
  TableHeads_Dashboard,
} from "@/config/data/dashboard";
import { roboto_300, roboto_400, roboto_500, roboto_900 } from "@/config/fonts";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import { selectShowAcc, setShowAcc } from "@/store/slices/usersSlice";
import { abbreviateNumber } from "@/utilities/abbrebiate";
import { formatAmount, formatWithoutDecimals } from "@/utilities/formatAmount";
import Image from "next/image";
import React, { Fragment, useState } from "react";

function page() {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentId2, setCurrentId2] = useState<string | null>(null);

  return (
    <section className={`${roboto_400.className} h-[92%] overflow-y-auto pl-5`}>
      <div className="bg-black3 py-3 px-10">
        <p className="font-normal text-lg text-grey_700">Home / Dashboard</p>
      </div>

      <div className="px-10 bg-black3 py-5 pb-6 mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <p
            className={`${roboto_300.className} font-light text-base text-white mb-2 sm:mb-0`}
          >
            REEPLAY OVERVIEW
          </p>
          <div className="border border-[#3D3C41] rounded py-1 px-3 flex items-center gap-x-2">
            <span
              className={`${roboto_500.className} font-medium text-sm text-white`}
            >
              One week
            </span>
            <button
            // onClick={setShowOptions}
            >
              <Image
                src="/down.png"
                width={13}
                height={8}
                alt=""
                className={`transition-all duration-500 ease-in-out ${
                  // showOptions ? "rotate-180" : ""
                  ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex sm:flex-row flex-col items-start justify-between gap-x-5 flex-wrap">
          {RP_Overview.map((x, i) => {
            const active = currentId === `${i}${x}`;
            return (
              <div
                key={i}
                className="mt-3 flex-1 w-full sm:w-fit cursor-pointer"
              >
                <div
                  onClick={() => setCurrentId(`${i}${x}`)}
                  className={`${
                    active ? "border-t-[5px] border-red_500" : ""
                  } min-w-[170px] h-[100px] bg-black2 flex flex-col items-center justify-center`}
                >
                  <p
                    className={`${roboto_400.className} font-normal text-sm text-white `}
                  >
                    {x.name}
                  </p>
                  <p
                    className={`${roboto_900.className} font-[900] text-2xl text-white`}
                  >
                    {abbreviateNumber(Number(x.value))}
                  </p>
                </div>

                {active && (
                  <p
                    className={`${roboto_300.className} font-light text-base text-white text-center mt-3`}
                  >
                    {formatAmount(x.value)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-10 bg-black3 py-12 pb-9 mt-8">
        <div className="flex sm:flex-row flex-col items-start justify-between gap-x-5 flex-wrap">
          {RP_Overview_2.map((x, i) => {
            const active = currentId2 === `${i}${x}`;
            return (
              <div
                key={i}
                className="mt-3 flex-1 w-full sm:w-fit cursor-pointer"
              >
                <div
                  onClick={() => setCurrentId2(`${i}${x}`)}
                  className={`${
                    active ? "border-t-[5px] border-red_500" : ""
                  } min-w-[250px] h-[100px] bg-black2 flex flex-col items-center justify-center`}
                >
                  <p
                    className={`${roboto_400.className} font-normal text-sm text-white `}
                  >
                    {x.name}
                  </p>
                  <p
                    className={`${roboto_900.className} font-[900] text-2xl text-white`}
                  >
                    {x.name === "Total Balance"
                      ? formatWithoutDecimals(Number(x.value)).split(".")[0]
                      : abbreviateNumber(Number(x.value))}
                  </p>
                </div>

                {active && (
                  <p
                    className={`${roboto_300.className} font-light text-base text-white text-center mt-3`}
                  >
                    {formatAmount(x.value)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative w-full mt-8">
        <div className="absolute w-full bg-black3 py-5 pb-6 px-10 overflow-x-auto">
          <table className="w-full table">
            <thead className="">
              <tr>
                {TableHeads_Dashboard.map((t, i) => {
                  return (
                    <th
                      key={i}
                      className={`${roboto_300.className} font-light text-base text-white uppercase text-wrap text-left`}
                    >
                      {t}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TableHeads_Dashboard.map((t, i) => {
                return (
                  <tr key={i}>
                    {RP_Overview3.map((tx, indx) => {
                      return (
                        // <tr>
                        <td
                          className="whitespace-nowrap text-white py-2 pr-4"
                          key={indx}
                        >
                          <div className="flex items-center pl-2 py-1 pr-8 border border-border_dark rounded w-fit min-w-[160px]">
                            <Image
                              src={`/tablepic/${tx.image}.png`}
                              width={42}
                              height={42}
                              alt="profiles"
                              className="object-contain rounded-full"
                            />
                            <div className="ml-2">
                              <p
                                className={`${roboto_500.className} font-medium text-[#fff] text-[15px]`}
                              >
                                {tx.name}
                              </p>
                              <div className="flex items-center -mt-[2px]">
                                <Image
                                  src="/views.svg"
                                  width={12.5}
                                  height={10}
                                  alt="views"
                                />
                                <p
                                  className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                >
                                  {formatAmount(tx.views)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                        // </tr>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default page;
