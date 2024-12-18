import { getFetchChannels, getFetchEvents, getFetchTVShows, useGetChannelsQuery, useGetEventsQuery, useGetTVShowsQuery } from '@/api/liveSlice';
import { roboto_400, roboto_500 } from '@/config/fonts'
import Lottie from 'lottie-react';
import Image from 'next/image'
import React, { useEffect, useState } from 'react';
import LoadingSpinner from "@/config/lottie/loading.json";
import { toast } from 'react-toastify';
import { LIVE_TH } from '@/config/data/live';
import { IEventData, IEventResponse } from '@/types/api/live.types';
import { AppButton, CustomInput, SelectInputForm } from '@/components/AppLayout';
import ReactPlayer from 'react-player';
import { formatAmount } from '@/utilities/formatAmount';
import { getDates } from '@/utilities/dateUtilities';
import { useEventEstimateMutation } from '@/api/extra.api';
import { truncateText } from '@/utilities/textUtils';
import { ImageProps } from '../plans/ClientComponent';


const TABS = ['Channels', 'Events', 'Tv Shows', 'Podcast']


function SuperAdminComp() {
  const [stage, setStage] = useState<string>('main')
  const [tab, setTab] = useState<string>('channels');
  const [liveTable, setTable] = useState<IEventData[]>([])
  const [liveTableFiltered, setFilteredTable] = useState<IEventData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [pg, setPg] = useState<number>(1);
  const [paginationList, setPaginationList] = useState([...Array(8)].map((_, i) => i + 1));
  const paginationStep = 8;
  const isEVENT = tab.toLowerCase() === "events";
  const isTVSHOW = tab.toLowerCase() === "tv shows";
  const isChannel = tab.toLowerCase() === "channels";
  const isPodcast = tab.toLowerCase() === "podcast";
  const [catText, setCatText] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [isPaymentActive, setIsPaymentActive] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [eventEstimatedPrice, setEventEstimatedPrice] = useState<number>(0);
  const [eventHours, setEventHours] = useState<string>("0");
  const [details, setDetails] = useState(""); // State to store the textarea content
  const [_class, setClass] = useState<string>("Select");
  const [pg_M, setPG_] = useState<string>("Select");
  const [isActive, setActive] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<ImageProps | null>(null);
  const [videoTrailer, setVideoTrailer] = useState<ImageProps | null>(null);
  const [image, setImage] = useState<ImageProps | null>(null);
  const maxLength = 200;
  const {
    data: allEvents,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetEventsQuery({ limit: 5, page: pg }, {});
  const {
    data: allChannels,
  } = useGetChannelsQuery({ limit: 5, page: pg }, {});
  const {
    data: allTVShows,
  } = useGetTVShowsQuery({ limit: 5, page: pg }, {});

  const [handleEstimate, { isLoading: isEstimatedLoading }] =
    useEventEstimateMutation();


  const handleNext = () => {
    setPaginationList((prevList) => prevList.map((num) => num + paginationStep));
  };

  const handlePrevious = () => {
    if (paginationList[0] === 1) return;
    setPaginationList((prevList) => prevList.map((num) => Math.max(1, num - paginationStep)));
  };

  function handleLiveList(data: IEventResponse | undefined) {
    if (!data) return;
    const liveList = data.data;
    setTable(liveList);
    setFilteredTable(liveList);
  }


  async function handleRefreshLive(query?: number) {
    try {
      setLoading(true);
      const res = tab === 'channels' ? await getFetchChannels({ limit: 5, page: query ?? pg }) : tab === 'events' ? await getFetchEvents({ limit: 5, page: query ?? pg }) : await getFetchTVShows({ limit: 5, page: query ?? pg })
      if (res.ok && res.data) {
        // handleGetADSs(res.data)
      } else {
        toast(`Opps! couldn't get ADSs list`, { type: "error" });
      }
    } catch (error) {
      toast(`Opps! couldn't get ADSs list`, { type: "error" });
    } finally {
      setLoading(false)
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(",")) {
      const newItem = value.split(",")[0].trim();

      setItems([newItem, ...items]);

      setCatText("");
    } else {
      setCatText(value);
    }
  };



  function handleDelete(value: string) {
    setItems((prev) => prev.filter((item) => item !== value));
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>, type?: string) {
    const files = e.target.files;
    if (files) {
      if (type === "cover") {
        setCoverImage({
          name: files[0].name,
          url: URL.createObjectURL(files[0]),
        });
      } else if (type === "video") {
        setVideoTrailer({
          name: files[0].name,
          url: URL.createObjectURL(files[0]),
        });
      } else {
        setImage({
          name: files[0].name,
          url: URL.createObjectURL(files[0]),
        });
      }
    }
  }

  const handleGetEstimatedPrice = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { end, start } = getDates(Number(e.target.value));
    setEventHours(e.target.value);

    const res = await handleEstimate({ end, start }).unwrap();
    console.log(res);
    if (res.data) {
      setEventEstimatedPrice(res.data.estimated_cost);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setDetails(newText);
    }
  };

  function handleVideo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setIsPlaying(true);
  }


  useEffect(() => {
    if (tab === 'channels') handleLiveList(allChannels)
    if (tab === 'events') handleLiveList(allEvents)
    if (tab === 'tv shows') handleLiveList(allTVShows)
    if (tab === 'podcast') {
      setTable([])
      setFilteredTable([])
    }
  }, [tab, allChannels, allTVShows, isSuccess])


  switch (stage) {
    case 'main':
      return (
        <div className='h-[calc(100%-58px)] min-h-fit relative'>

          <div className="mt-8 flex flex-col-reverse md:flex-row items-start justify-between pr-5">
            <div className='flex-row flex items-start gap-x-10 mt-6 md:mt-0 flex-wrap gap-y-10'>
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
                  placeholder={`Search Live`}
                  className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
                //   value={searchParams}
                //   onChange={(e) => handleSearchfilter(e)}
                />
              </div>

              <div className="flex flex-row w-fit h-[43px]">
                {TABS.map((x, i) => {
                  const active = x.toLowerCase() === tab
                  return (
                    <div key={i} onClick={() => setTab(x.toLowerCase())} className={`${roboto_500.className} text-[17px] hover:text-white hover:text-[18.5px] hover:h-[47.5px] transition-all duration-300 ${active ? 'text-white' : 'text-grey_800'} w-[88px] text-center py-2.5 cursor-pointer h-[46px] ${active ? 'bg-[#0096D6C9]' : 'bg-black3'}`}>
                      {x}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* add butn */}
            <div
              onClick={() => setStage('add')}
              className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
            >
              Add
            </div>
          </div>


          <div className="min-h-[500px] relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
            <div className="absolute w-full py-5 pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-10 overflow-x-auto">
              <table className={`${roboto_400.className} w-[calc(100%-20px)] min-w-[810px] lg:ml-5`}>
                <thead className="mb-3">
                  <tr>
                    {LIVE_TH.map((t, i) => {
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
                  {liveTableFiltered.map((tx, indx) => {
                    return (

                      <tr key={indx} className={`${roboto_400.className} text-white h-[110px]`}>
                        <td
                          className=" text-white py-2 w-[250px]"
                          key={indx}
                        >
                          <div className="flex items-center pl-2 py-1 pr-1 rounded w-fit ">
                            <Image
                              src={`/tablepic/mum.png`}
                              width={42}
                              height={42}
                              alt="profiles"
                              className="object-contain rounded-full"
                            />
                            <div className="ml-2.5">
                              <p
                                className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                              >
                                {tx.title}
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
                                  0
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="text-center font-normal text-xs capitalize">
                          {tx.pg}+
                        </td>

                        <td className="text-center font-normal text-xs capitalize">
                          {tx.vid_class}
                        </td>


                        <td className="text-center font-normal text-xs uppercase">
                          {new Date(tx.expiry).toLocaleDateString().replaceAll('/', '-')}
                        </td>

                        <td className="text-center font-normal text-xs capitalize">
                          {tx.active ? 'active' : 'inactive'}
                        </td>

                        <td className="">
                          <div className="flex items-center justify-center gap-x-5">
                            <button
                            // onClick={() => [setSelectedPlan({ data: { details: tx.details!, months: tx.month!, price: tx.price!, title: tx.title! }, _id: tx.id }), setShowModal(true)]}
                            >
                              <Image
                                src="/liveGreen.svg"
                                width={20}
                                height={20}
                                alt="live button"
                              />
                            </button>
                            <button
                            // onClick={() => [setSelectedPlan({ data: { details: tx.details!, months: tx.month!, price: tx.price!, title: tx.title! }, _id: tx.id }), setShowModal(true)]}
                            >
                              <Image
                                src="/edit.svg"
                                width={14}
                                height={14}
                                alt="edit"
                              />
                            </button>
                            <button
                            // onClick={() => handleDelete(tx._id)}
                            >
                              <Image
                                src="/delete.svg"
                                width={15}
                                height={18}
                                alt="delete"
                              />
                            </button>
                          </div>
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

                    <p key={index} onClick={() => [setPg(num), handleRefreshLive(num)]} className={`${active ? 'text-red' : 'text-[#C4C4C4]'} cursor-pointer`}>{num}</p>
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
        </div>
      )

    case 'add':
      return (
        <div className='h-[calc(100%-58px)] flex flex-col min-h-fit relative'>
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
            <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">

            </div>

            {/* add butn */}
            <div
              onClick={() => setStage('main')}
              className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
            >
              Back
            </div>
          </div>


          <div className="mt-12 flex flex-row w-fit h-[43px]">
            {TABS.map((x, i) => {
              const active = x.toLowerCase() === tab
              return (
                <div key={i} onClick={() => setTab(x.toLowerCase())} className={`${roboto_500.className} text-[17px] hover:text-white hover:text-[18.5px] hover:h-[47.5px] transition-all duration-300 ${active ? 'text-white' : 'text-grey_800'} w-[88px] text-center py-2.5 cursor-pointer h-[46px] ${active ? 'bg-[#0096D6C9]' : 'bg-black3'}`}>
                  {x}
                </div>
              )
            })}
          </div>

          <div
            className={`flex-1 ${(isEVENT || isPodcast || isTVSHOW) ? 'min-h-[1400px]' : 'min-h-[850px]'} md:min-h-[500px] lg:min-h-fit min-w-fit w-full h-full bg-black3 -mt-1 p-5 lg:p-10 lg:pl-16 lg:pt-16`}>
            <div className="flex mt-10 sm:mt-0 md:flex-row items-start gap-x-16 lg:gap-x-16">
              {/* LEFT START */}
              <div className="flex-1 min-w-[300px] space-y-7">
                <div className='flex items-start flex-wrap gap-y-4'>
                  <div className='space-y-7 flex-1'>
                    {isChannel ? (
                      <div className="w-[75%]">
                        <label
                          htmlFor="name"
                          className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                        >
                          CHANNEL NAME *
                        </label>
                        <CustomInput
                          required
                          type="text"
                          placeholder=""
                          id="name"
                          className="font-normal text-sm py-1 mt-2 border border-border_grey rounded-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="w-[75%]">
                          <label
                            htmlFor="name"
                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                          >
                            {isEVENT ? "EVENT" : isTVSHOW ? "SHOW" : ""} TITLE*
                          </label>
                          <CustomInput
                            required
                            type="text"
                            placeholder=""
                            id="name"
                            className="font-normal text-sm py-1 mt-2 border border-border_grey rounded-sm"
                          />
                        </div>

                        <div className="w-[75%]">
                          <label
                            htmlFor="subtitle"
                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                          >
                            SUB TITLE*
                          </label>
                          <CustomInput
                            required
                            type="text"
                            placeholder=""
                            id="name"
                            className="font-normal text-sm py-1 mt-2 border border-border_grey rounded-sm"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex flex-row items-start w-[75%] gap-x-5 lg:gap-x-14">
                      <div className="flex-1">
                        <label
                          htmlFor="name"
                          className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                        >
                          CLASS*
                        </label>
                        <SelectInputForm
                          placeholder={_class}
                          setType={setClass}
                          selectData={["Free", "Premium", "Exclusive"]}
                          className="font-normal h-[30px] mt-1 text-sm py-2 lg:pl-3 border border-border_grey rounded-sm"
                          textStyles="text-grey_500 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                        >
                          PG*
                        </label>
                        <SelectInputForm
                          placeholder={pg_M}
                          setType={setPG_}
                          selectData={["13+", "18+"]}
                          className="font-normal h-[30px] mt-1 text-sm py-2 lg:pl-3 border border-border_grey rounded-sm"
                          textStyles="text-grey_500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {(isEVENT || isTVSHOW || isPodcast) &&
                    <div className='flex items-start gap-x-10 lg:gap-x-20'>
                      <div className="w-full md:w-[350px] md:ml-auto mt-10">
                        <p
                          className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                        >
                          Upload Cover Image *
                        </p>
                        <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                          <div className="flex items-center ml-5 py-2 relative">
                            <div
                              className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                            >
                              Choose File
                            </div>
                            <span
                              className={`${roboto_400.className} flex-1 truncate text-xs text-grey_500`}
                            >
                              {coverImage ? truncateText(20, coverImage.name) : "No File selected"}
                            </span>
                            <input
                              type="file"
                              id="file"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={(e) => handleInput(e, "cover")}
                              className="absolute z-20 opacity-0"
                            />
                          </div>
                          <div
                            className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                          >
                            UPLOAD
                          </div>
                        </div>

                        <div className="h-[150px] flex flex-row items-end mt-5 justify-center gap-x-3">
                          {coverImage && (
                            <>
                              <Image
                                id="upload"
                                src={coverImage.url}
                                width={298}
                                height={159}
                                alt="uploaded"
                                className="rounded-[10px] w-[298px] h-[159px]"
                              />
                              <button
                                className="hover:scale-110 transition-all duration-200"
                                onClick={() => setCoverImage(null)}
                              >
                                <Image
                                  src="/delete.svg"
                                  width={16}
                                  height={16}
                                  alt="delete icon"
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="w-full md:w-[350px] md:ml-auto mt-10">
                        <p
                          className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                        >
                          Upload Video Trailer *
                        </p>
                        <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                          <div className="flex items-center ml-5 py-2 relative">
                            <div
                              className={`${roboto_500.className} mr-3 min-w-fit bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                            >
                              Choose File
                            </div>
                            <span
                              className={`${roboto_400.className} text-xs truncate text-grey_500`}
                            >
                              {videoTrailer ? truncateText(20, videoTrailer.name) : "No File selected"}
                            </span>
                            <input
                              type="file"
                              id="file"
                              accept="video/*"
                              onChange={(e) => handleInput(e, "video")}
                              className="absolute z-20 opacity-0"
                            />
                          </div>
                          <div
                            className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                          >
                            UPLOAD
                          </div>
                        </div>

                        <div className="h-[165px] flex flex-row items-end mt-5 justify-center gap-x-3">
                          {videoTrailer && (
                            <>
                              <div className="rounded-[10px] w-[292px] h-[159px] relative overflow-hidden">
                                <div
                                  style={{ zIndex: isPlaying ? 20 : 0 }}
                                  className="absolute w-full h-full"
                                >
                                  <ReactPlayer
                                    playing={isPlaying}
                                    muted={false}
                                    controls={false}
                                    // onProgress={e => }
                                    url={videoTrailer.url}
                                    width="100%" // Set to 100%
                                    height="100%"
                                    volume={1}
                                    onEnded={() => setIsPlaying(false)}
                                  // onReady={() => setIsPlayerReady(true)}
                                  />
                                </div>

                                <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
                                  <button
                                    style={{ display: isPlaying ? "none" : "inline" }}
                                    onClick={(e) => handleVideo(e)}
                                  >
                                    <Image
                                      src="/playBtn.svg"
                                      alt=""
                                      width={30}
                                      height={30}
                                      className=" object-contain"
                                    />
                                  </button>
                                </div>
                              </div>

                              <button
                                className="hover:scale-110 transition-all duration-200"
                                onClick={() => setVideoTrailer(null)}
                              >
                                <Image
                                  src="/delete.svg"
                                  width={16}
                                  height={16}
                                  alt="delete icon"
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>}

                </div>





                <div className="">
                  <label
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                  >
                    CATEGORY{" "}
                    <span
                      className={`${roboto_500.className} font-medium text-[15px] text-[#909090]`}
                    >
                      (separate with a comma)
                    </span>
                    *
                  </label>
                  <div className="h-[140px] border border-[#D9D9D938] mt-2 p-1 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="Start typing..."
                      className={`${roboto_500.className} w-full outline-none bg-transparent text-sm text-white placeholder:text-grey_600/50`}
                      value={catText}
                      onChange={handleInputChange}
                    />

                    <div className="flex flex-row flex-wrap gap-x-3 gap-y-1.5 mt-2">
                      {items.map((item, i) => {
                        return (
                          <div
                            key={i + item}
                            className="flex flex-row items-center gap-x-[2px]"
                          >
                            <span
                              className={`${roboto_500.className} text-sm text-white`}
                            >
                              {item}
                            </span>
                            <button onClick={() => handleDelete(item)}>
                              <Image
                                src="/small_close_btn.svg"
                                width={9}
                                height={9}
                                alt=""
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="">
                  <label
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                  >
                    Details*
                  </label>
                  <div className="h-[90px] relative border border-[#D9D9D938] mt-2">
                    <textarea
                      name="details"
                      maxLength={maxLength}
                      onChange={handleTextChange}
                      className={`${roboto_400.className} textarea w-full h-[80px] p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                    />
                    <p
                      className={`${roboto_400.className} absolute bottom-0 right-1 text-sm text-[#C4C4C4]`}
                    >
                      {details.length}/{maxLength}
                    </p>
                  </div>
                </div>

                <div className="pt-8 flex sm:flex-row flex-col flex-wrap gap-y-5 sm:items-end sm:justify-between">
                  {/* //here */}
                  <div className="min-w-fit w-[257]">
                    <label
                      htmlFor="client"
                      className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                    >
                      ASSIGN TO CLIENT *
                    </label>
                    <CustomInput
                      required
                      type="text"
                      placeholder="Search client here and select from dropdown"
                      id="client"
                      className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-[#C4C4C4]"
                    />
                  </div>

                  <div className="flex flex-row items-center gap-x-2 mr-20 mt-2">
                    <span
                      className={`${roboto_500.className} text-white ml-1 text-base`}
                    >
                      Active
                    </span>
                    <div
                      className={`w-[45px] h-[18px] flex items-center rounded-[15px] ${isActive ? "bg-[#00E3A373]" : "bg-[#BCBDBD73]"
                        }`}
                    >
                      <div
                        onClick={() => setActive(!isActive)}
                        className={`w-[26px] h-[26px] rounded-full transition-all ease-in-out duration-500 ${isActive
                          ? "translate-x-5 bg-green_400"
                          : "-translate-x-0 bg-[#BCBDBD]"
                          } `}
                      />
                    </div>
                  </div>

                  {(isEVENT || isPodcast || isTVSHOW) &&
                    <div className="min-w-[350px] flex flex-col sm:items-center sm:ml-10 lg:ml-36">
                      <label
                        className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                      >
                        EXPIRES{" "}
                        <span
                          className={`${roboto_500.className} font-medium text-[15px] text-[#909090]`}
                        >
                          (in Hours)
                        </span>
                        *
                      </label>
                      <div className="flex flex-row gap-x-2 items-center mt-2.5">
                        <CustomInput
                          required
                          type="text"
                          placeholder="0"
                          id="name"
                          className="w-[83px] font-normal text-sm text-center py-1 border border-border_grey rounded-sm"
                          onChange={(e) => handleGetEstimatedPrice(e)}
                        />

                        <button
                          className={`${roboto_400.className} min-w-fit py-1 px-2 text-[#747474] text-sm bg-[#333333]`}
                        >
                          Extend Hours
                        </button>
                      </div>
                      {/* <div
                    className={`${roboto_500.className} flex flex-row items-center gap-x-2 text-[#909090] text-[32px] mt-2.5`}
                  >
                    ₦{formatAmount(eventEstimatedPrice.toString())}.00
                    {isEstimatedLoading && (
                      <Lottie
                        animationData={LoadingSpinner}
                        loop
                        style={{ width: 35, height: 35, marginRight: 5 }}
                      />
                    )}
                  </div> */}
                    </div>

                  }
                </div>
              </div>
              {/* LEFT END */}

              {/* RIGHT START */}
              {isChannel && <div className="flex-1 min-w-[350px] lg:mr-2">
                <div className="w-full md:w-[350px] md:ml-auto mt-10">
                  <p
                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                  >
                    Upload Cover Image *
                  </p>
                  <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                    <div className="flex items-center ml-5 py-2 relative">
                      <div
                        className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                      >
                        Choose File
                      </div>
                      <span
                        className={`${roboto_400.className} truncate text-xs text-grey_500`}
                      >
                        {coverImage ? truncateText(20, coverImage.name) : "No File selected"}
                      </span>
                      <input
                        type="file"
                        id="file"
                        onChange={(e) => handleInput(e, "cover")}
                        className="absolute z-20 opacity-0"
                      />
                    </div>
                    <div
                      className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                    >
                      UPLOAD
                    </div>
                  </div>

                  <div className="h-[150px] flex flex-row items-end mt-5 justify-center gap-x-3">
                    {coverImage && (
                      <>
                        <Image
                          id="upload"
                          src={coverImage.url}
                          width={298}
                          height={159}
                          alt="uploaded"
                          className="rounded-[10px] w-[298px] h-[159px]"
                        />
                        <button
                          className="hover:scale-110 transition-all duration-200"
                          onClick={() => setCoverImage(null)}
                        >
                          <Image
                            src="/delete.svg"
                            width={16}
                            height={16}
                            alt="delete icon"
                          />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* {isChannel ? ( */}
                <div className="w-full md:w-[350px] md:ml-auto mt-16">
                  <p
                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                  >
                    Upload Channel logo *
                  </p>
                  <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                    <div className="flex items-center ml-5 py-2 relative">
                      <div
                        className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                      >
                        Choose File
                      </div>
                      <span
                        className={`${roboto_400.className} truncate text-xs text-grey_500`}
                      >
                        {image ? truncateText(20, image.name) : "No File selected"}
                      </span>
                      <input
                        type="file"
                        id="file"
                        onChange={handleInput}
                        className="absolute z-20 opacity-0"
                      />
                    </div>
                    <div
                      className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                    >
                      UPLOAD
                    </div>
                  </div>

                  <div className="h-[133px] flex flex-row items-end mt-5 justify-center gap-x-3">
                    {image && (
                      <>
                        <Image
                          // id="upload"
                          src={image.url}
                          width={110}
                          height={153}
                          alt="uploaded"
                          className="h-[153px] w-[110px] rounded-[10px]"
                        />
                        <button
                          className="hover:scale-110 transition-all duration-200"
                          onClick={() => setImage(null)}
                        >
                          <Image
                            src="/delete.svg"
                            width={16}
                            height={16}
                            alt="delete icon"
                          />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="min-w-fit flex flex-col items-center sm:ml-10 lg:ml-36">
                  <label
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                  >
                    EXPIRES{" "}
                    <span
                      className={`${roboto_500.className} font-medium text-[15px] text-[#909090]`}
                    >
                      (in Hours)
                    </span>
                    *
                  </label>
                  <div className="flex flex-row gap-x-2 items-center mt-2.5">
                    <CustomInput
                      required
                      type="text"
                      placeholder="0"
                      id="name"
                      className="w-[83px] font-normal text-sm text-center py-1 border border-border_grey rounded-sm"
                      onChange={(e) => handleGetEstimatedPrice(e)}
                    />

                    <button
                      className={`${roboto_400.className} min-w-fit py-1 px-2 text-[#747474] text-sm bg-[#333333]`}
                    >
                      Extend Hours
                    </button>
                  </div>
                  {/* <div
                    className={`${roboto_500.className} flex flex-row items-center gap-x-2 text-[#909090] text-[32px] mt-2.5`}
                  >
                    ₦{formatAmount(eventEstimatedPrice.toString())}.00
                    {isEstimatedLoading && (
                      <Lottie
                        animationData={LoadingSpinner}
                        loop
                        style={{ width: 35, height: 35, marginRight: 5 }}
                      />
                    )}
                  </div> */}
                </div>
              </div>}
              {/* RIGHT END */}
            </div>

            <div className="w-[170px] mt-10">
              <AppButton
                onClick={() => setIsPaymentActive(true)}
                title="SAVE"
                className="w-full"
              />
            </div>
          </div>

        </div>
      )

  }
}

export default SuperAdminComp