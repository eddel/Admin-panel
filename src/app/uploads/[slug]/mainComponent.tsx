'use client'

import { getFetchMovies, getFetchMusicVideo, getFetchSeries, getFetchSkit, useGetAllMovieQuery, useGetAllMusicQuery, useGetAllSeriesQuery, useGetAllSkitsQuery } from '@/api/mediaSlice'
import { TABLE_TH } from '@/config/data/upload'
import { roboto_400, roboto_400_italic, roboto_500 } from '@/config/fonts'
import { IMediaData, IMediaResponse } from '@/types/api/media.types'
import { isExpired } from '@/utilities/dateUtilities'
import Lottie from 'lottie-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import LoadingSpinner from "@/config/lottie/loading.json";
import { toast } from 'react-toastify'
import { AppButton, CustomInput, SelectInputForm } from '@/components/AppLayout'
import { useGetCategoryQuery, useGetGenreQuery } from '@/api/categorySlice'
import { ICategory } from '@/types/api/category.types'
import { formatAmount } from '@/utilities/formatAmount'
import ReactPlayer from 'react-player'
import { truncateText } from '@/utilities/textUtils'
import { getLinkPreview } from "link-preview-js";
import { isValidUrl, normalizeUrl, transformResponse } from '@/utilities/linkUtils'
import { getPreview } from '@/app/server'
import { LinkViewProps } from '@/types/packages'
import SeasonComponent from './SeasonComponent'
import { ImageProps } from '@/app/plans/ClientComponent'




interface Props {
    slug: string
}

function MainComponent({ slug }: Props) {
    const [isAdd, setIsAdd] = useState<boolean>(false);
    const [mediaList, setMediaList] = useState<IMediaData[]>([])
    const [mediaFilteredList, setFilteredList] = useState<IMediaData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [pg, setPg] = useState<number>(1)
    const [searchParams, setSearchParams] = useState<string>("");
    const [paginationList, setPaginationList] = useState([...Array(8)].map((_, i) => i + 1));
    const paginationStep = 8;
    const {
        data: moviesData,
        refetch,
        error,
        isSuccess,
        isLoading,
    } = useGetAllMovieQuery({ limit: 5, page: pg }, {});
    const {
        data: skitsData,
    } = useGetAllSkitsQuery({ limit: 5, page: pg }, {});
    const {
        data: musicVideoData,
    } = useGetAllMusicQuery({ limit: 5, page: pg }, {});
    const {
        data: seriesData,
    } = useGetAllSeriesQuery({ limit: 5, page: pg }, {});


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
            mediaList.filter((x) => x.title.includes(query))
        );
        if (query === "") {
            setFilteredList(mediaList);
        }
    }

    function handleMediaList(data: IMediaResponse | undefined) {
        if (!data) return;
        const mediaFullList = data.data
        setMediaList(mediaFullList);
        setFilteredList(mediaFullList);
    }

    async function handleRefreshMedia(query?: number) {
        try {
            setLoading(true);
            const res = slug === 'movies' ? await getFetchMovies({ limit: 5, page: query ?? pg }) : slug === 'skits' ? await getFetchSkit({ limit: 5, page: query ?? pg }) : slug === 'series' ? await getFetchSeries({ limit: 5, page: query ?? pg }) : await getFetchMusicVideo({ limit: 5, page: query ?? pg })
            if (res.ok && res.data) {
                handleMediaList(res.data)
            } else {
                toast(`Opps! couldn't get ${slug} list`, { type: "error" });
            }
        } catch (error) {
            toast(`Opps! couldn't get ${slug} list`, { type: "error" });
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        if (slug.toLowerCase() === 'movies') handleMediaList(moviesData)
        if (slug.toLowerCase() === 'skits') handleMediaList(skitsData)
        if (decodeURI(slug) === 'music videos') handleMediaList(musicVideoData)
        if (slug.toLowerCase() === 'series') handleMediaList(seriesData)

    }, [slug, moviesData, skitsData, seriesData, musicVideoData, isSuccess])

    return (
        <section className={`${roboto_400.className} h-full pl-5`}>
            <div className="bg-black3 py-3 px-10">
                <p className="font-normal text-lg text-grey_700">Home / Uploads / {decodeURI(slug)}</p>
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
                        placeholder={`Search ${decodeURI(slug)}`}
                        className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:capitalize placeholder:text-grey_700"
                    // value={searchParams}
                    // onChange={(e) => handleSearchfilter(e)}
                    />
                </div>

                {/* add butn */}
                <div
                    onClick={() => setIsAdd(!isAdd)}
                    className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
                >
                    {isAdd ? 'Back' : `Add ${slug.includes('videos') ? 'Videos' : decodeURI(slug)}`}
                </div>
            </div>


            {!isAdd ? <>
                <div className="relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
                    <div className="absolute h-[700px] w-full py-5 pb-6 pl-0  sm:ml-0 sm:pl-3 md:pl-10 overflow-x-auto">
                        <div className='relative h-full'>
                            <table className={`${roboto_400.className} w-full min-w-[810px]`}>
                                <thead className="h-[50px]">
                                    <tr className=''>
                                        {TABLE_TH.map((t, i) => {
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
                                    {mediaFilteredList.map((tx, indx) => {
                                        return (
                                            <tr key={indx} className="text-white h-[110px]">
                                                <td
                                                    className="whitespace-nowrap text-white py-2 pr-4  w-[30px]"
                                                    key={indx}
                                                >
                                                    <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
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
                                                    {tx.default_rating}
                                                </td>

                                                <td className="text-center font-normal text-xs capitalize">
                                                    {tx.vid_class}
                                                </td>

                                                <td className="text-center font-normal text-xs capitalize">
                                                    {new Date(tx.releaseed_date).getFullYear()}
                                                </td>
                                                <td className="text-center font-normal text-xs capitalize">
                                                    {isExpired(tx.expiry_date) ? 'Active' : 'Inactive'}
                                                </td>

                                                <td className="w-[50px] xl:w-[400px]">
                                                    <div className="flex items-center justify-center gap-x-10">
                                                        <button>
                                                            <Image
                                                                src="/edit.svg"
                                                                width={14}
                                                                height={14}
                                                                alt="edit"
                                                            />
                                                        </button>
                                                        <button>
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


                            <div className="absolute ml-5 md:ml-10 lg:ml-16 bg-black2  bottom-10 z-50 flex flex-row items-center">
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

                                                <p key={index} onClick={() => [setPg(num), handleRefreshMedia(num)]} className={`${active ? 'text-red' : 'text-[#C4C4C4]'} cursor-pointer`}>{num}</p>
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
                    </div>

                </div>
            </>
                :
                <>
                    <AddComponent slug={slug} />
                </>

            }
        </section>
    )
}

export default MainComponent


interface ModalProps {
    // handleClose: () => void;
    // handleReset: () => void;
    slug: string;
}

export interface ISeason {
    index: number;
    episodes: []
}


export const AddComponent = ({ slug }: ModalProps) => {
    const [isGenre, setIsGenre] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [subtitle, setSubTitle] = useState<string>('');
    const [releaseDate, setReleaseDate] = useState<string>('');
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [class_, setClass] = useState<string>('Select');
    const [amount, setAmount] = useState<string>('');
    const [PG, setPG] = useState<string>('Select');
    const [portrait, setPortrait] = useState<ImageProps | null>(null);
    const [portrait_L, setPortrait_L] = useState<ImageProps | null>(null);
    const [subtitleFile, setSubtitleFile] = useState<ImageProps | null>(null);
    const [videoTrailer, setVideoTrailer] = useState<ImageProps | null>(null);
    const [videoTrailer_2, setVideoTrailer_2] = useState<ImageProps | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [thumbnailUrl_2, setThumbnailUrl_2] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPlaying_2, setIsPlaying_2] = useState<boolean>(false);
    const [urlLink, setUrlLink] = useState<string>('')
    const [urlLink_2, setUrlLink_2] = useState<string>('')
    const [time, setTime] = useState<string>('')
    const [rating, setRating] = useState<string>('Select');
    const [views, setViews] = useState<string>('Select');
    const [options, setOptions] = useState<string>('Select');
    const [subtitle_, setSUBTITLE] = useState<string>('Select Language');

    const [genriesList, setGenriesList] = useState<ICategory[]>([]);
    const [cat_List, setCat_List] = useState<ICategory[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['popular on REEPLAY']);
    const [selectedGenries, setSelectedGenries] = useState<string[]>([]);
    const [selectedCasts, setSelectedCasts] = useState<string[]>([]);
    const [castTxt, setCastTxt] = useState<string>('');
    const [genriesPlaceholder, setGenriesPlaceholder] = useState<string>('');
    const [cat_Placeholder, setCat_Placeholder] = useState<string>('');
    const [links, setLinks] = useState<LinkViewProps | null>(null)
    const [links_2, setLinks_2] = useState<LinkViewProps | null>(null)
    const [isPreview, setIsPreview] = useState<boolean>(false)
    const [isPreview_2, setIsPreview_2] = useState<boolean>(false)
    const [details, setDetails] = useState("");
    const maxLength = 200;
    const [seasons, setSeasons] = useState<ISeason[]>([{
        index: 1,
        episodes: []
    }])
    const {
        data: genries,
        isSuccess
    } = useGetGenreQuery(undefined, {});
    const {
        data: categories,
        isSuccess: isSuccess_C
    } = useGetCategoryQuery(undefined, {});


    function handleValidInput(query: string,) {
        const inputValue = query;
        if (/^\d*$/.test(inputValue)) {
            setAmount(inputValue);
        }
    }

    const handleInputFormatForTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.replace(/[^0-9]/g, '');

        if (inputValue.length > 7) {
            return;
        }

        let seconds = '00';
        let minutes = '00';
        let hours = '00';

        if (inputValue.length > 0) {
            seconds = inputValue.slice(-2).padStart(2, '0');
        }

        if (inputValue.length > 2) {
            minutes = inputValue.slice(-4, -2).padStart(2, '0');
        }

        if (inputValue.length > 4) {
            hours = inputValue.slice(0, -4).padStart(2, '0');
        }

        const sec = Math.min(parseInt(seconds, 10), 59);
        const min = Math.min(parseInt(minutes, 10), 59);
        const hr = Math.min(Math.max(parseInt(hours, 10), 0), 99); // Limit hours, e.g., 0 to 99

        if (hr === 59 && min === 59 && sec === 59) {
            return;
        }

        const formattedTime = `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

        setTime(formattedTime);
    };

    const handleTextChange = (newText: string) => {
        if (newText.length <= maxLength) {
            setDetails(newText);
        }
    };

    function handleVideo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        setIsPlaying(true);
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>, type?: string) {
        const files = e.target.files;
        if (files) {
            if (type === "cover") {
                // setCoverImage({
                //   name: files[0].name,
                //   url: URL.createObjectURL(files[0]),
                // });
            } else if (type === "video") {
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
            } else if (type === 'subtitle') {
                setSubtitleFile({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                });
            } else if (type === 'portrait') {
                setPortrait({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                });
            } else if (type === 'landscape') {
                setPortrait_L({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                });
            } else {
                // setImage({
                //   name: files[0].name,
                //   url: URL.createObjectURL(files[0]),
                // });
            }
        }
    }


    const handleInputChange = (value: string, type?: string) => {
        if (value === '') return
        if (type === 'cast') setCastTxt(value);
        if (value.includes(",")) {
            const newItem = value.split(",")[0].trim();
            if (type === 'cast') {
                if (!selectedCasts.includes(newItem)) {
                    setSelectedCasts([newItem, ...selectedCasts]);
                    setCastTxt('');
                }
            } else if (type === 'categories') {
                setSelectedCategories([newItem, ...selectedCategories]);
            } else {
                setSelectedGenries([newItem, ...selectedGenries]);
            }

            setGenriesPlaceholder("");
            setCat_Placeholder("");
        } else if (!selectedGenries.includes(value)) {
            if (type === 'cast') {
                return;
            } else if (type === 'categories') {
                setSelectedCategories([value, ...selectedCategories]);
            } else {
                setSelectedGenries([value, ...selectedGenries]);
            };
        }
    };

    const getData = async (url: string, type?: string) => {
        if (!url.trim() || !isValidUrl(url)) {
            toast("Please enter a valid URL.", { type: 'error' })
            return
        }
        try {
            const normalizedUrl = normalizeUrl(url)
            const res = await getPreview(normalizedUrl);
            if (typeof res === "string") {
                if (type === '2') {
                    setLinks_2(transformResponse(res, normalizedUrl))
                } else {
                    setLinks(transformResponse(res, normalizedUrl))
                }
                setUrlLink('');
                return
            }
            if (type === '2') {
                const linkPreview = transformResponse(res, normalizedUrl)
                setLinks_2(linkPreview);
            } else {
                const linkPreview = transformResponse(res, normalizedUrl)
                setLinks(linkPreview);
            }
            setUrlLink('');
            setUrlLink_2('');
        } catch (error) {
            toast("Please enter a valid URL.", { type: 'error' })
        }
    }

    useEffect(() => {
        handleInputChange(genriesPlaceholder);
        handleInputChange(cat_Placeholder, 'categories');
    }, [genriesPlaceholder, cat_Placeholder]);

    useEffect(() => {
        if (genries) setGenriesList(genries.data);
        if (categories) setCat_List(categories.data);
    }, [genries, categories, isSuccess_C, isSuccess]);


    return (
        <div className='mt-5 h-full flex flex-col'>
            {slug === 'movies' && <div className="flex-1 mt-10 ml-16 flex items-center gap-x-6">
                <p
                    className={`${roboto_500.className} capitalize font-medium text-white text-base ml-2.5`}
                >
                    Show on Genre
                </p>
                <div
                    className={`w-[45px] h-[18px] flex items-center rounded-[15px] ${(
                        isGenre
                    )
                        ? `bg-[#FF131373]`
                        : "bg-[#BCBDBD73]"
                        }`}
                >
                    <div
                        onClick={() =>
                            setIsGenre(!isGenre)
                        }
                        className={`w-[26px] h-[26px] rounded-full transition-all ease-in-out duration-500 ${(
                            isGenre
                        )
                            ? `translate-x-5 bg-red`
                            : "-translate-x-0 bg-[#BCBDBD]"
                            } `}
                    />
                </div>
            </div>
            }
            <div className='mt-6 bg-black3 py-10 flex-1'>
                <div className='space-y-6'>
                    {/* First level */}
                    <div className='px-10 lg:px-16 flex flex-col lg:flex-row lg:items-start gap-x-10 lg:gap-x-[10%] xl:gap-x-[20%]'>
                        <div className='flex-1 space-y-6'>
                            {/* TITLE */}
                            <div>
                                <label
                                    htmlFor="title"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    {slug.includes('videos') ? 'ARTISTE NAME' : 'TITLE'} *
                                </label>
                                <CustomInput
                                    type="text"
                                    id="title"
                                    className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* CLASS & PG */}
                            <div className='flex items-start gap-x-5 lg:gap-x-16'>
                                <div className="flex-1">
                                    <p
                                        className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                    >
                                        CLASS *
                                    </p>
                                    <SelectInputForm
                                        placeholder={class_}
                                        setType={setClass}
                                        selectData={['Free', 'Premium', 'Exclusive', `${slug === 'movies' ? 'AD' : ''}`].filter(x => x !== '')}
                                        className="border-border_grey text-grey_500 rounded-sm flex-1"
                                    />
                                </div>

                                <div className="flex-1">
                                    <p
                                        className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                    >
                                        PG *
                                    </p>
                                    <SelectInputForm
                                        placeholder={PG}
                                        setType={setPG}
                                        selectData={['G', '16+', `18+`]}
                                        className="border-border_grey text-grey_500 rounded-sm flex-1"
                                    />
                                </div>
                            </div>

                            {/* AMOUNT */}
                            {class_ === 'Exclusive' &&
                                <div className='flex flex-col'>
                                    <label
                                        htmlFor="amount"
                                        className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                    >
                                        AMOUNT *
                                    </label>
                                    <CustomInput
                                        type="text"
                                        id="amount"
                                        className="font-normal w-[140px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                        value={formatAmount(amount)}
                                        onChange={(e) => handleValidInput(e.target.value.replaceAll(',', ''))}
                                    />
                                </div>
                            }

                            {/* GENRE */}
                            {class_ !== 'AD' && <div className="flex-1">
                                <p
                                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                >
                                    GENRE <span className='text-grey_800 text-sm'>(Only 3 selections)</span>*
                                </p>
                                <SelectInputForm
                                    placeholder=''
                                    categoryListing={<div className="flex flex-1 flex-row flex-wrap gap-x-3 gap-y-1.5">
                                        {selectedGenries.slice(0, 3).map((item, i) => {
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
                                                    <button
                                                        onClick={() => setSelectedGenries(prev => prev.filter(x => x !== item))}
                                                    >
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
                                    </div>}
                                    setType={setGenriesPlaceholder}
                                    selectData={genriesList.map(x => x.name)}
                                    className="border-border_grey h-[42px] text-grey_500 rounded-sm flex-1"
                                />
                            </div>}
                        </div>

                        <div className='mt-6 md:mt-0 flex-1 space-y-6'>
                            {/* SUB TITLE */}
                            <div>
                                <label
                                    htmlFor="subtitle"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    {slug.includes('videos') ? 'MUSIC' : 'SUB'} TITLE *
                                </label>
                                <CustomInput
                                    type="text"
                                    id="subtitle"
                                    className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                    value={subtitle}
                                    onChange={(e) => setSubTitle(e.target.value)}
                                />
                            </div>

                            {/* RELEASE & EXPIRY DATE */}
                            <div className='flex flex-wrap gap-y-5 items-start gap-x-5 lg:gap-x-10'>
                                {class_ === 'AD' ? <div className='flex-1' /> : <div className="flex-1">
                                    <p
                                        className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                    >
                                        RELEASE DATE *
                                    </p>
                                    <CustomInput
                                        placeholder="DD/MM/YYYY"
                                        type="date"
                                        className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-input_grey"
                                        value={releaseDate.replaceAll('/', '-')}
                                        onChange={(e) => setReleaseDate(e.target.value)}
                                    />
                                </div>}

                                <div className="flex-1">
                                    <p
                                        className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                    >
                                        EXPIRY DATE *
                                    </p>
                                    <CustomInput
                                        placeholder="DD/MM/YYYY"
                                        type="date"
                                        className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-input_grey"
                                        value={expiryDate.replaceAll('/', '-')}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* CAST */}
                            {(class_ !== 'AD' && !decodeURI(slug).includes('videos')) && <div className="flex-1">
                                <p
                                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                >
                                    CAST <span className='text-grey_800 text-sm'>(Max 10 selections)</span>*
                                </p>
                                <div className="min-h-[40px] border border-[#D9D9D938] p-1 overflow-y-auto">
                                    <input
                                        type="text"
                                        placeholder="Start typing..."
                                        className={`${roboto_500.className} pl-2 w-full outline-none bg-transparent text-sm text-white placeholder:text-grey_600/50`}
                                        value={castTxt}
                                        onChange={e => handleInputChange(e.target.value, 'cast')}
                                    />

                                    <div className="flex flex-row flex-wrap gap-x-3 gap-y-1.5 mt-2">
                                        {selectedCasts.map((item, i) => {
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
                                                    <button onClick={() => setSelectedCasts(prev => prev.filter(x => x != item))}>
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
                            </div>}

                        </div>
                    </div>


                    {/* second level */}
                    <div className="px-10 lg:px-16 flex-1">
                        <p
                            className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                        >
                            CATEGORY *
                        </p>
                        <SelectInputForm
                            placeholder=''
                            categoryListing={<div className="flex flex-1 flex-row flex-wrap gap-x-3 gap-y-1.5">
                                {selectedCategories.slice(0, 3).map((item, i) => {
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
                                            <button
                                                onClick={() => setSelectedCategories(prev => prev.filter(x => x !== item))}
                                            >
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
                            </div>}
                            setType={setCat_Placeholder}
                            selectData={cat_List.map(x => x.name)}
                            className="border-border_grey min-h-[75px] items-start text-grey_500 rounded-sm flex-1"
                        />
                    </div>


                    {/* third level */}
                    <div className='px-10 lg:px-16 flex flex-col flex-wrap lg:flex-row lg:items-start gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]'>
                        {/* right */}
                        <div className='flex flex-col flex-1'>
                            <label
                                htmlFor="trailer"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                TRAILER <span className='text-grey_800 text-sm'>(90 sec max)</span> *
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
                                    Upload Trailer *
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


                    {/* fourth level */}
                    <>
                        <div className='px-10 lg:px-16'>
                            <p
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                            >
                                VIDEO UPLOAD *
                            </p>

                            {slug !== 'series' && <div className="">
                                <p className={`${roboto_400.className} text-grey_500 font-normal text-base ml-3`}>Details</p>
                                <div className="h-[90px] relative border border-[#D9D9D938] mt-2">
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
                            </div>}
                        </div>


                        {/* time and ratings */}
                        <div className='flex flex-col px-10 lg:px-16 lg:flex-row lg:items-start gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]'>
                            <div className='flex-1'>
                                <label
                                    htmlFor="time"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    RUNTIME <span className='text-grey_800 text-sm'>(HH:MM:SS)</span> *
                                </label>
                                <CustomInput
                                    type="text"
                                    id="time"
                                    className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                    value={time}
                                    onChange={handleInputFormatForTime}
                                />
                            </div>

                            <div className="flex-1">
                                <p
                                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                >
                                    DEFAULT RATINGS *
                                </p>
                                <SelectInputForm
                                    placeholder={rating}
                                    setType={setRating}
                                    selectData={['3.0', '3.5', `4.0`]}
                                    className="border-border_grey text-grey_500 rounded-sm flex-1"
                                />
                            </div>
                        </div>

                        {/* movie file */}
                        {(class_ !== 'AD' && slug !== 'series') && <div className='px-10 lg:px-16 flex flex-col flex-wrap lg:flex-row lg:items-start gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]'>
                            {/* right */}
                            <div className='flex flex-col flex-1'>
                                <label
                                    htmlFor="trailer"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    {slug === 'skits' ? 'SKIT' : slug.includes('videos') ? 'VIDEO' : 'MOVIE'} FILE *
                                </label>
                                <CustomInput
                                    type="text"
                                    id="trailer"
                                    placeholder='Paste Deep link Url ex. Youtube'
                                    className="font-normal w-full sm:min-w-[364px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                    value={urlLink_2}
                                    onChange={(e) => [setUrlLink_2(e.target.value), getData(e.target.value, '2')]}
                                    readOnly={videoTrailer_2 ? true : false}
                                />

                                {links_2 && <>
                                    <div className="flex flex-row items-center mt-5 justify-center gap-x-3">
                                        <>
                                            <div className="rounded-[10px] flex items-start gap-x-16 flex-wrap relative overflow-hidden">

                                                <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                                    <Image
                                                        src={links_2.image ? links_2.image : ''}
                                                        width={42}
                                                        height={42}
                                                        alt="profiles"
                                                        className="w-[42px] h-[42px] border border-grey_800/40 rounded-full"
                                                    />
                                                    <div className="ml-2.5">
                                                        <p
                                                            className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                                        >
                                                            {truncateText(20, links_2.title ?? '')}                             </p>
                                                        <div className="flex items-center -mt-[2px]">
                                                            <Image
                                                                src="/views.svg"
                                                                width={12.5}
                                                                height={10}
                                                                alt="views"
                                                            />
                                                            <button
                                                                onClick={() => setIsPreview_2(!isPreview_2)}
                                                                className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                                            >
                                                                Click to preview
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='text-[13px] text-white font-normal max-w-[200px] mt-2.5'>
                                                    {truncateText(80, links_2?.url ?? '')}
                                                </div>

                                            </div>

                                            <button
                                                className="hover:scale-110 transition-all duration-200"
                                                onClick={() => setLinks_2(null)}
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
                                    {isPreview_2 && links_2 && <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
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
                                        {links_2.url && <div
                                            style={{ zIndex: isPlaying_2 ? 20 : 0 }}
                                            className="absolute w-full h-full"
                                        >
                                            <ReactPlayer
                                                playing={isPlaying_2}
                                                muted={false}
                                                controls={false}
                                                // onProgress={e => }
                                                url={links_2.url}
                                                width="100%" // Set to 100%
                                                height="100%"
                                                volume={1}
                                                onEnded={() => setIsPlaying_2(false)}
                                            // onReady={() => setIsPlayerReady(true)}
                                            />
                                        </div>}
                                    </div>
                                    }
                                </>}
                            </div>

                            {/* left */}
                            <div className='flex-1'>
                                <div className="ml-auto w-full md:w-[350px] md:ml-auto">
                                    <p
                                        className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                                    >
                                        Upload {slug === 'skits' ? 'Skit' : slug.includes('videos') ? 'Video' : 'Movie'} *
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
                                                {videoTrailer_2 ? truncateText(20, videoTrailer_2.name) : "No File selected"}
                                            </span>
                                            <input
                                                type="file"
                                                id="file"
                                                accept="video/*"
                                                onChange={(e) => handleInput(e, "video")}
                                                className="absolute z-20 opacity-0"
                                                disabled={links_2 ? true : false}
                                            />
                                        </div>
                                        <div
                                            className={`${roboto_500.className} cursor-pointer text-white text-[15px] ${links_2 ? 'bg-grey_800' : 'bg-[#EE2726]'} h-[42px] px-4 flex items-center justify-center`}
                                        >
                                            UPLOAD
                                        </div>
                                    </div>

                                    <>
                                        <div className="flex flex-row items-end mt-5 justify-center gap-x-3">
                                            {videoTrailer_2 && (
                                                <>
                                                    <div className="rounded-[10px] relative overflow-hidden">

                                                        <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                                            <Image
                                                                src={thumbnailUrl_2 ?? ''}
                                                                width={42}
                                                                height={42}
                                                                alt="profiles"
                                                                className="w-[42px] h-[42px] rounded-full"
                                                            />
                                                            <div className="ml-2.5">
                                                                <p
                                                                    className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                                                >
                                                                    {truncateText(20, videoTrailer_2.name)}                             </p>
                                                                <div className="flex items-center -mt-[2px]">
                                                                    <Image
                                                                        src="/views.svg"
                                                                        width={12.5}
                                                                        height={10}
                                                                        alt="views"
                                                                    />
                                                                    <button
                                                                        onClick={() => setIsPreview_2(!isPreview_2)
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
                                                        onClick={() => setVideoTrailer_2(null)}
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
                                        {isPreview_2 && videoTrailer_2 && <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                                            <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
                                                <button
                                                    style={{ display: isPlaying_2 ? "none" : "inline", zIndex: 20 }}
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
                                            {videoTrailer_2 && <div
                                                style={{ zIndex: isPlaying_2 ? 20 : 0 }}
                                                className="absolute w-full h-full"
                                            >
                                                <ReactPlayer
                                                    playing={isPlaying}
                                                    muted={false}
                                                    controls={false}
                                                    // onProgress={e => }
                                                    url={videoTrailer_2.url}
                                                    width="100%" // Set to 100%
                                                    height="100%"
                                                    volume={1}
                                                    onEnded={() => setIsPlaying_2(false)}
                                                // onReady={() => setIsPlayerReady(true)}
                                                />
                                            </div>}
                                        </div>}
                                    </>
                                </div>
                            </div>

                        </div>}

                        {slug === 'series' && <div className="px-10 lg:px-16">
                            <p className={`${roboto_400.className} text-grey_500 font-normal text-base ml-3`}>Season Details *</p>
                            <div className="h-[90px] relative border border-[#D9D9D938] mt-2">
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
                        </div>}


                        {/* subtitle */}
                        {class_ !== 'AD' && <div className='px-10 lg:px-16 flex flex-col lg:flex-row lg:items-start gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]'>
                            <div className='flex flex-col flex-1'>
                                <label
                                    htmlFor="trailer"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    SUBTITLE *
                                </label>
                                <SelectInputForm
                                    placeholder={subtitle_}
                                    setType={setSUBTITLE}
                                    selectData={['English', 'Igbo', 'Yoruba', 'Hausa', 'French', 'Spanish']}
                                    className="border-border_grey mt-2 text-grey_500 rounded-sm flex-1"
                                />
                            </div>



                            <div className='flex-1'>
                                <div className="w-full md:w-[350px] md:ml-auto">
                                    <p
                                        className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                                    >
                                        Upload Subtitle <span className={`${roboto_400_italic.className}`}>(SRT)</span> *
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
                                                {subtitleFile ? truncateText(20, subtitleFile.name) : "No File selected"}
                                            </span>
                                            <input
                                                type="file"
                                                id="file"
                                                accept="srt/*"
                                                onChange={(e) => handleInput(e, "subtitle")}
                                                className="absolute z-20 opacity-0"
                                            />
                                        </div>
                                        <div
                                            className={`${roboto_500.className} cursor-pointer text-white text-[15px] ${links_2 ? 'bg-grey_800' : 'bg-[#EE2726]'} h-[42px] px-4 flex items-center justify-center`}
                                        >
                                            UPLOAD
                                        </div>
                                    </div>

                                </div>

                                <AppButton title='Add Subtitle' bgColor='bg-green_400' className='ml-auto mt-6 px-6 py-3' />
                            </div>


                        </div>}

                        {/* list of subtitle */}
                        {class_ !== 'AD' && <div className='px-10 lg:px-16 flex flex-wrap gap-x-12 pl-10 gap-y-14 items-start py-6'>
                            {[...Array(8)].map((x, i) => {
                                return (
                                    <div key={i} className='flex items-center gap-x-12'>
                                        <div className="ml-4">
                                            <p
                                                className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                            >
                                                {truncateText(20, "Mum's Soldier.srt")}                             </p>
                                            <div className={`${roboto_400.className} font-normal text-[13px] text-grey_500 `}
                                            >
                                                English
                                            </div>
                                        </div>

                                        <button
                                            className="hover:scale-110 transition-all duration-200"
                                        // onClick={() => setVideoTrailer_2(null)}
                                        >
                                            <Image
                                                src="/delete.svg"
                                                width={16}
                                                height={16}
                                                alt="delete icon"
                                            />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>}


                        {/* options and views */}
                        <div className='px-10 lg:px-16 flex flex-col lg:flex-row lg:items-end gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]'>
                            <div className="flex-1">
                                <label
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                >
                                    OPTIONS *
                                    <p className={`${roboto_400.className} text-grey_500 font-normal text-base ml-3`}>Status</p>
                                </label>
                                <SelectInputForm
                                    placeholder={options}
                                    setType={setOptions}
                                    selectData={['Active', 'Inactive',]}
                                    className="border-border_grey mt-2 text-grey_500 rounded-sm flex-1"
                                />
                            </div>

                            <div className="flex-1">
                                <p
                                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                >
                                    Show Views *
                                </p>
                                <SelectInputForm
                                    placeholder={views}
                                    setType={setViews}
                                    selectData={['Yes', 'No',]}
                                    className="border-border_grey text-grey_500 rounded-sm flex-1"
                                />
                            </div>
                        </div>

                        {/* Adding seasons */}
                        {slug === 'series' && <div className='pt-10'>

                            <div className='px-10 lg:px-16'>
                                <AppButton
                                    title='Add Season'
                                    bgColor='bg-[#EE2726]'
                                    className='px-6 py-3 mb-5 hover:scale-105 transition-all duration-300'
                                    onClick={() => setSeasons(prev => [...prev, { index: prev.length + 1, episodes: [] }])}
                                />
                            </div>

                            <div className='mt-8'>

                                {seasons.map((season, i) => {
                                    return (
                                        <SeasonComponent season={season} key={i} />
                                    )
                                })}
                            </div>


                        </div>}

                    </>


                    {/* fifth level */}
                    <>
                        <div className='px-10 lg:px-16 flex items-start gap-x-3 gap-y-10 flex-wrap'>
                            <div className='flex-1'>
                                <div className="w-full md:w-[350px] md:mr-auto mt-10">
                                    <p
                                        className={`${roboto_500.className} font-medium text-sm text-white mb-2`}
                                    >
                                        PORTRAIT POSTER <span className='text-grey_800 text-sm'>(390 x 454 jpeg, jpg)</span>
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
                                                {portrait ? truncateText(20, portrait.name) : "No File selected"}
                                            </span>
                                            <input
                                                type="file"
                                                id="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                onChange={(e) => handleInput(e, "portrait")}
                                                className="absolute z-20 opacity-0"
                                            />
                                        </div>
                                        <div
                                            className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                        >
                                            UPLOAD
                                        </div>
                                    </div>

                                </div>
                                <div className="mt-5">
                                    {portrait && (
                                        <>
                                            <Image
                                                id="upload"
                                                src={portrait.url}
                                                width={347}
                                                height={436}
                                                alt="uploaded"
                                                className="rounded-[10px] w-[347px] h-[436px]"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>


                            <div className='flex-1'>
                                <div className="w-full md:w-[350px] xl:ml-auto mt-10">
                                    <p
                                        className={`${roboto_500.className} font-medium text-sm text-white mb-2`}
                                    >
                                        LANDSCAPE POSTER <span className='text-grey_800 text-sm'>(1080 x 1290 jpeg, jpg)</span>
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
                                                {portrait_L ? truncateText(20, portrait_L.name) : "No File selected"}
                                            </span>
                                            <input
                                                type="file"
                                                id="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                onChange={(e) => handleInput(e, "landscape")}
                                                className="absolute z-20 opacity-0"
                                            />
                                        </div>
                                        <div
                                            className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                        >
                                            UPLOAD
                                        </div>
                                    </div>

                                </div>
                                <div className="mt-5">
                                    {portrait_L && (
                                        <>
                                            <Image
                                                id="upload"
                                                src={portrait_L.url}
                                                width={687}
                                                height={436}
                                                alt="uploaded"
                                                className="rounded-[10px] w-[687px] h-[436px]"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>

                </div>


                <div className='px-10 lg:px-16 mt-4'>
                    <AppButton
                        title='UPLOAD'
                        bgColor='bg-[#EE2726]'
                        className='px-6 py-3 mb-5 hover:scale-105 transition-all duration-300'
                    />
                </div>

            </div>
        </div>
    )
}