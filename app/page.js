"use client"

import dynamic from 'next/dynamic';
// import TradingviewWidget from './components/TradingviewWidget';
import { Chat } from './components/Chat';

const TradingviewWidget = dynamic(() => import('./components/TradingviewWidget'), { ssr: false });

export default function Home() {
    return (
        <>
            <TradingviewWidget />
            <Chat />
        </>
    );
}
