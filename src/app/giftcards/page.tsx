"use client"

import React, { useEffect, useState } from "react";
import { roboto_400, roboto_500 } from "@/config/fonts";
import Image from "next/image";
import { G_Table, G_TableHeads, } from "@/config/data/gift.data";
import { AppButton, CustomInput } from "@/components/AppLayout";
import { getGiftCards, useGetGiftCardsQuery } from "@/api/giftCardSlice";
import { IGiftCardData, IGiftCardResponse } from "@/types/api/giftCard.types";
import { formatAmount } from "@/utilities/formatAmount";
import Lottie from "lottie-react";
import LoadingSpinner from "@/config/lottie/loading.json";
import { toast } from "react-toastify";


const page = () => {
  const [giftCardList, setList] = useState<IGiftCardData[]>([])
  const [searchParams, setSearchParams] = useState<string>("");
  const [giftCardFilteredList, setFilteredList] = useState<IGiftCardData[]>([])
  const [isAdd, setShowModal] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false)
  const [pg, setPg] = useState<number>(1)
  const [paginationList, setPaginationList] = useState([...Array(8)].map((_, i) => i + 1));
  const paginationStep = 8;
  const {
    data: giftCards,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetGiftCardsQuery({ limit: 5, page: pg }, {});


  const transformEventData = (data: IGiftCardData[]) => {
    // if(usersRP.len) return [];
    return data.map((GC) => ({
      ...GC,
      createdAt: new Date(GC.createdAt).toLocaleDateString(),
    }));
  };

  const handleNext = () => {
    setPaginationList((prevList) => prevList.map((num) => num + paginationStep));
  };

  const handlePrevious = () => {
    if (paginationList[0] === 1) return;
    setPaginationList((prevList) => prevList.map((num) => Math.max(1, num - paginationStep)));
  };

  function handleSearchfilter(query: string) {
    setSearchParams(query);

    setFilteredList(
      giftCardList.filter((x) => x.code.includes(query))
    );
    if (query === "") {
      setFilteredList(giftCardList);
    }
  }

  function handleGetGiftCards(data: IGiftCardResponse | undefined) {
    if (!data) return;
    const gift_cards = transformEventData(data.data);
    setList(gift_cards);
    setFilteredList(gift_cards);
  }

  async function handleRefreshGiftCards(query?: number) {
    try {
      setLoading(true);
      const res = await getGiftCards({ limit: 5, page: query ?? pg })
      if (res.ok && res.data) {
        handleGetGiftCards(res.data)
      } else {
        toast(`Opps! couldn't get giftcards list`, { type: "error" });
      }
    } catch (error) {
      toast(`Opps! couldn't get giftcards list`, { type: "error" });
    } finally {
      setLoading(false)
    }
  };


  useEffect(() => {
    handleGetGiftCards(giftCards);
  }, [isSuccess]);


  return (
    <section
      className={`${roboto_400.className} relative h-full overflow-y-auto pl-5`}>
      <div className="bg-black3 py-3 px-10">
        <p className="font-normal text-lg text-grey_700">Home / Giftcards</p>
      </div>

      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
        <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">
          <button className="rounded-l-[10px] bg-red_500 py-[14.5px] flex items-center justify-center w-[63px]">
            <Image
              src="/searchIcon.svg"
              width={20}
              height={20}
              alt="search"
            />
          </button>
          <input
            type="text"
            placeholder="Search Giftcards"
            className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
            value={searchParams}
            onChange={e => handleSearchfilter(e.target.value)}
          />
        </div>
        {/* add butn */}
        <div
          onClick={() => setShowModal(true)}
          className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
        >
          Add
        </div>
      </div>

      <div className="relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
        {isAdd && <ModalComponent handleClose={() => setShowModal(false)} handleReset={() => handleRefreshGiftCards()} />}
        <div className="absolute w-full py-5 pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-10 overflow-x-auto">
          <table className={`${roboto_400.className} w-full min-w-[810px] lg:-ml-5`}>
            <thead className="mb-3">
              <tr>
                {G_TableHeads.map((t, i) => {
                  return (
                    <th
                      key={i}
                      className={`${roboto_500.className} font-medium text-lg text-white uppercase`}
                    >
                      {t}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {giftCardFilteredList.map((tx, indx) => {
                return (

                  <tr key={indx} className={`${roboto_400.className} text-white h-[110px]`}>
                    <td
                      className="text-center py-2 pr-4 uppercase"
                      key={indx}
                    >
                      {tx.code}
                    </td>

                    <td className="text-center font-normal py-7 text-xs capitalize">
                      {formatAmount(tx.amount.toString())}
                    </td>

                    <td className="text-center font-normal text-xs capitalize">
                      {tx.createdAt.replaceAll('/', '-')}
                    </td>


                    <td className="text-center font-normal text-[15px] uppercase">
                      {tx.serial_number}
                    </td>

                    <td className="text-center font-normal text-xs capitalize">
                      {tx.used ? 'Used' : 'Active'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      <div className="mt-auto ml-5 md:ml-10 lg:ml-16 bg-black2 absolute bottom-10 z-50 flex flex-row items-center">
        <div
          className={`${roboto_500.className} py-2 px-7 flex w-fit items-center border border-[#C4C4C438]`}
        >
          <button
            onClick={handlePrevious}
            className={`${roboto_400.className} font-normal mr-3 text-[17px] text-grey_800`}
          >
            <span className="text-white mr-2">{`<<`}</span>
            Previous
          </button>
          <div className="text-grey_800 text-[17px] flex flex-row mr-1 font-medium space-x-1.5">
            {paginationList.map((num, index) => {
              const active = pg === num

              return (

                <p key={index} onClick={() => [setPg(num), handleRefreshGiftCards(num)]} className={`${active ? 'text-red' : 'text-[#C4C4C4]'} cursor-pointer`}>{num}</p>
              )
            })}
            {"   "} ...
          </div>
          <button
            onClick={() => handleNext()}
            className={`${roboto_400.className} font-normal ml-2 text-[17px] text-grey_800`}
          >
            Next <span className="text-white ml-2">{`>>`}</span>
          </button>
        </div>

        {loading && <Lottie
          animationData={LoadingSpinner}
          loop
          style={{ width: 35, height: 35, marginLeft: 15 }}
        />}
      </div>
    </section>
  );


};

export default page;


interface ModalProps {
  handleClose: () => void;
  handleReset: () => void;
}


export const ModalComponent = ({ handleClose, handleReset }: ModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [gift_code, setGift_Code] = useState<string>('');
  const [serial_NO, setSerial_NO] = useState<string>('');
  const [pin, setPIN] = useState<string>('');
  const isDisable = amount === '' || gift_code === '' || serial_NO === '' || pin === ''


  function reset() {
    setSerial_NO('');
    setAmount('');
    setGift_Code('')
    setPIN('')
  }

  function handleValidInput(query: string,) {
    const inputValue = query;
    if (/^\d*$/.test(inputValue)) {
      setAmount(inputValue);
    }
  }

  async function submitHandler() {
    try {
      setLoading(true);

    } catch (error) {

    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="z-[9999] w-[calc(100%-20px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-56px)] absolute overflow-hidden flex justify-center">
      <div style={{
        marginTop: 20
      }} className="w-[90%] sm:w-[60%] lg:w-[40%] p-5 rounded-[10px] overflow-y-auto bg-black4">
        <div className="ml-auto w-fit" onClick={handleClose}>
          <Image
            src="/closeIcon.svg"
            width={20}
            height={20}
            alt="close modal"
          />
        </div>

        <div style={{
          marginBottom: 20
        }} className="flex flex-col items-center">


          <div className="mt-5 space-y-5 w-[70%]">
            <div>
              <label
                htmlFor="amount"
                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
              >
                AMOUNT *
              </label>
              <CustomInput
                required
                type="text"
                placeholder=""
                value={amount}
                onChange={e => handleValidInput(e.target.value)}
                id="amount"
                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
              />
            </div>

            <div>
              <label
                htmlFor="gift_code"
                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
              >
                GIFT CODE *
              </label>
              <CustomInput
                required
                type="text"
                placeholder=""
                value={gift_code}
                readOnly
                id="gift_code"
                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
              />
            </div>
            <div>
              <label
                htmlFor="serialNo"
                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
              >
                SERIAL NUMBER *
              </label>
              <CustomInput
                required
                type="text"
                placeholder=""
                value={serial_NO}
                readOnly
                id="serialNo"
                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
              />
            </div>
            <div>

              <CustomInput
                required
                type="text"
                placeholder="ENTER AUTORIZED PIN TO CONTINUE"
                value={pin}
                readOnly
                id="pin"
                className=" font-normal text-sm py-2.5 mt-1 border border-border_grey rounded-sm"
              />
            </div>







          </div>
          <AppButton
            isLoading={loading}
            disabled={amount === ''}
            title="GENERATE"
            className="w-[70%] mt-10 text-xl py-2.5"
            onClick={() => console.log('geneerate func')}
          />
          <AppButton
            isLoading={loading}
            disabled={isDisable}
            title="SAVE"
            className="w-[70%] mt-3 text-xl py-2.5"
            onClick={submitHandler}
          />
        </div>
      </div>
    </div>
  );
};
