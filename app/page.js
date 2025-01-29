"use client"

import dynamic from 'next/dynamic';
// import TradingviewWidget from './components/TradingviewWidget';
import { Chat } from './components/Chat';
import { GetNews } from './components/GetNews';

const TradingviewWidget = dynamic(() => import('./components/TradingviewWidget'), { ssr: false });

export default function Home() {
    return (
        <>
            <div className='flex'>
                <TradingviewWidget />
                <Chat />
            </div>
            <GetNews />
        </>
    );
}
