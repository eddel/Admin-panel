'use client'

import React, { useState } from 'react'
import { ISeason } from './mainComponent'
import Image from 'next/image'
import useToggle from '@/hooks/useToggle';
import { roboto_400, roboto_500 } from '@/config/fonts';
import { AppButton, CustomInput } from '@/components/AppLayout';
import ReactPlayer from 'react-player';
import { truncateText } from '@/utilities/textUtils';
import { LinkViewProps } from '@/types/packages';
import { isValidUrl, normalizeUrl, transformResponse } from '@/utilities/linkUtils';
import { toast } from 'react-toastify';
import { getPreview } from '@/app/server';
import { ImageProps } from '@/app/plans/ClientComponent';


interface Props {
    season: ISeason
}
function SeasonComponent({ season }: Props) {
    const [number, setNumber] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [showSelect, setShowSelect] = useToggle();
    const [details, setDetails] = useState("");
    const [links, setLinks] = useState<LinkViewProps | null>(null)
    const [videoTrailer, setVideoTrailer] = useState<ImageProps | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isPreview, setIsPreview] = useState<boolean>(false)
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [urlLink, setUrlLink] = useState<string>('')
    const maxLength = 200;

    const handleTextChange = (newText: string) => {
        if (newText.length <= maxLength) {
            setDetails(newText);
        }
    };

    function handleValidInput(query: string,) {
        const inputValue = query;
        if (/^\d*$/.test(inputValue)) {
            setNumber(inputValue);
        }
    }

    function handleVideo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        setIsPlaying(true);
    }

    const getData = async (url: string, type?: string) => {
        if (!url.trim() || !isValidUrl(url)) {
            toast("Please enter a valid URL.", { type: 'error' })
            return
        }
        try {
            const normalizedUrl = normalizeUrl(url)
            const res = await getPreview(normalizedUrl);
            if (typeof res === "string") {
                setLinks(transformResponse(res, normalizedUrl))
                setUrlLink('');
                return
            }

            const linkPreview = transformResponse(res, normalizedUrl)
            setLinks(linkPreview);
            setUrlLink('');
        } catch (error) {
            toast("Please enter a valid URL.", { type: 'error' })
        }
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>, type?: string) {
        const files = e.target.files;
        if (files) {
            if (type === "video") {
                const videoObjectUrl = URL.createObjectURL(files[0]);
                setVideoTrailer({
                    name: files[0].name,
                    url: videoObjectUrl,
                });
                const video = document.createElement("video");
                video.src = videoObjectUrl;
                video.currentTime = 2;
                video.onloadeddata = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth / 2;
                    canvas.height = video.videoHeight / 2;

                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        setThumbnailUrl(canvas.toDataURL("image/jpeg"));
                    }
                };
            }
        }
    }

    return (
        <div style={{ backfaceVisibility: "hidden" }} className={`relative z-0 overflow-y-hidden ${showSelect && 'h-[65px]'}`}>
            <div className='bg-black3'>
                <div className={`w-full px-10 lg:px-16 flex items-center gap-x-6 ${season.index % 2 !== 0 ? 'bg-black3' : 'bg-[#D9D9D91A]'} py-5 transition-all duration-300 z-[9999999]`}>
                    <button onClick={() => setShowSelect(!showSelect)}>
                        <Image
                            src="/bigDown.svg"
                            width={19}
                            height={13}
                            alt=""
                            className={showSelect ? "-rotate-90 transition-all duration-300" : "rotate-0 transition-all duration-300"}
                        />
                    </button>

                    <span className={`${roboto_400.className} text-base text-white font-medium`}>SEASON {season.index}</span>
                </div>
            </div>

            <div className={`px-10 lg:px-16 relative mt-5 -z-[10] space-y-6 transition-all duration-300 ${!showSelect ? 'translate-y-0 mb-5' : '-translate-y-[500px]'}`}>

                <div className='flex items-center gap-x-20'>
                    <div className='flex flex-col'>
                        <label
                            htmlFor="number"
                            className={`${roboto_500.className} font-medium text-grey_500 text-base ml-2.5`}
                        >
                            Episode Number *
                        </label>
                        <CustomInput
                            type="text"
                            id="number"
                            className="font-normal w-[170px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            value={number}
                            onChange={(e) => handleValidInput(e.target.value)}
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label
                            htmlFor="name"
                            className={`${roboto_500.className} font-medium text-grey_500 text-base ml-2.5`}
                        >
                            Episode Name *
                        </label>
                        <CustomInput
                            type="text"
                            id="name"
                            className="font-normal w-[170px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="">
                    <p className={`${roboto_400.className} text-grey_500 font-normal text-base ml-3`}>Episode Details *</p>
                    <div className="h-[70px] relative border border-[#D9D9D938] mt-2">
                        <textarea
                            name="details"
                            maxLength={maxLength}
                            onChange={e => handleTextChange(e.target.value)}
                            className={`${roboto_400.className} textarea w-full h-[80px] p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                        />
                        <p
                            className={`${roboto_400.className} absolute bottom-0 right-1 text-sm text-[#C4C4C4]`}
                        >
                            {details.length}/{maxLength}
                        </p>
                    </div>
                </div>

                <div className='flex flex-col flex-wrap lg:flex-row lg:items-start gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]'>
                    {/* right */}
                    <div className='flex flex-col flex-1'>
                        <label
                            htmlFor="trailer"
                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                        >
                            VIDEO FILE *
                        </label>
                        <CustomInput
                            type="text"
                            id="trailer"
                            placeholder='Paste Deep link Url ex. Youtube'
                            className="font-normal w-full sm:min-w-[364px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            value={urlLink}
                            onChange={(e) => [setUrlLink(e.target.value), getData(e.target.value)]}
                            readOnly={videoTrailer ? true : false}
                        />

                        {links && <>
                            <div className="flex flex-row items-center mt-5 justify-center gap-x-3">
                                <>
                                    <div className="rounded-[10px] flex items-start gap-x-16 flex-wrap relative overflow-hidden">

                                        <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                            <Image
                                                src={links.image ? links.image : ''}
                                                width={42}
                                                height={42}
                                                alt="profiles"
                                                className="w-[42px] h-[42px] border border-grey_800/40 rounded-full"
                                            />
                                            <div className="ml-2.5">
                                                <p
                                                    className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                                >
                                                    {truncateText(20, links.title ?? '')}                             </p>
                                                <div className="flex items-center -mt-[2px]">
                                                    <Image
                                                        src="/views.svg"
                                                        width={12.5}
                                                        height={10}
                                                        alt="views"
                                                    />
                                                    <button
                                                        onClick={() => setIsPreview(!isPreview)}
                                                        className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                                    >
                                                        Click to preview
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='text-[13px] text-white font-normal max-w-[200px] mt-2.5'>
                                            {truncateText(80, links?.url ?? '')}
                                        </div>

                                    </div>

                                    <button
                                        className="hover:scale-110 transition-all duration-200"
                                        onClick={() => setLinks(null)}
                                    >
                                        <Image
                                            src="/delete.svg"
                                            width={16}
                                            height={16}
                                            alt="delete icon"
                                        />
                                    </button>
                                </>
                            </div>

                            {/* preview */}
                            {isPreview && links && <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
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
                                {links.url && <div
                                    style={{ zIndex: isPlaying ? 20 : 0 }}
                                    className="absolute w-full h-full"
                                >
                                    <ReactPlayer
                                        playing={isPlaying}
                                        muted={false}
                                        controls={false}
                                        // onProgress={e => }
                                        url={links.url}
                                        width="100%" // Set to 100%
                                        height="100%"
                                        volume={1}
                                        onEnded={() => setIsPlaying(false)}
                                    // onReady={() => setIsPlayerReady(true)}
                                    />
                                </div>}
                            </div>
                            }
                        </>}
                    </div>

                    {/* left */}
                    <div className='flex-1'>
                        <div className="w-full md:w-[350px] md:ml-auto">
                            <p
                                className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                            >
                                Upload Video
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
                                        disabled={links ? true : false}
                                    />
                                </div>
                                <div
                                    className={`${roboto_500.className} cursor-pointer text-white text-[15px] ${links ? 'bg-grey_800' : 'bg-[#EE2726]'} h-[42px] px-4 flex items-center justify-center`}
                                >
                                    UPLOAD
                                </div>
                            </div>

                            <>
                                <div className="flex flex-row items-end mt-5 justify-center gap-x-3">
                                    {videoTrailer && (
                                        <>
                                            <div className="rounded-[10px] relative overflow-hidden">

                                                <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                                    <Image
                                                        src={thumbnailUrl ?? ''}
                                                        width={42}
                                                        height={42}
                                                        alt="profiles"
                                                        className="w-[42px] h-[42px] rounded-full"
                                                    />
                                                    <div className="ml-2.5">
                                                        <p
                                                            className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                                        >
                                                            {truncateText(20, videoTrailer.name)}                             </p>
                                                        <div className="flex items-center -mt-[2px]">
                                                            <Image
                                                                src="/views.svg"
                                                                width={12.5}
                                                                height={10}
                                                                alt="views"
                                                            />
                                                            <button
                                                                onClick={() => setIsPreview(!isPreview)
                                                                }
                                                                className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                                            >
                                                                Click to preview
                                                            </button>
                                                        </div>
                                                    </div>
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

                                {/* preview */}
                                {isPreview && videoTrailer && <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                                    <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
                                        <button
                                            style={{ display: isPlaying ? "none" : "inline", zIndex: 20 }}
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
                                    {videoTrailer && <div
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
                                    </div>}
                                </div>}
                            </>
                        </div>
                    </div>

                </div>

                <AppButton title='Add Episode' bgColor='bg-green_400' className='ml-auto mt-6 px-6 py-2.5' />


            </div>
        </div>
    )
}

export default SeasonComponent