"use client"

import { useState } from "react";
import { PieChart } from 'react-minimal-pie-chart';


export const GetNews = () => {
    const [ sentiment, setSentiment] = useState(null)
    
    const getNews = async () => {
        try {
            const modalNews = document.getElementById("modalNews");
            const category =  localStorage.getItem('tradingview-symbol')
            const categoryParam = category ? `category=${category}` : '`category="BTC`';
        
            const response = await fetch(`/api/news?${categoryParam}`);
            
            if (response.ok) {
                const data = await response.json();
                    
                setSentiment(data.sentimentConclusion.sentimentCount);
                modalNews.textContent = data.sentimentConclusion.conclusion;
            } else {
                console.error('Error ', response.statusText);
                modalNews.textContent = `Error: ${response.statusText}`;
            }
        } catch (error) {
            console.error('Error ', error);
        }
    }

    const PieChartContainer = ({ sentiment }) => {
        return (
            <PieChart
                data={[
                    { title: `Positivo (${sentiment?.POSITIVE}%)`, value: sentiment?.POSITIVE, color: '#394E99' },
                    { title: `Negativo (${sentiment?.NEGATIVE}%)`, value: sentiment?.NEGATIVE, color: '#f97066' },
                    { title: `Neutral (${sentiment?.NEUTRAL}%)`, value: sentiment?.NEUTRAL, color: '#DEE2F3' },
                ]}
                radius = {30}
                label={({ dataEntry }) => dataEntry.title}
                labelStyle={{ fontSize: '4px', fill: '1D284E' }}
                labelPosition={69}
            />
        )
    }

    return (
        <>
            <button type="button" onClick={getNews} className="rounded-3xl p-2 shadow-md bg-[#394E99] text-white"> Analizar Noticias</button>
            <div id="modalNews" className=""></div>
            <div style={{ display: sentiment ? 'block' : 'none' }}>
                <PieChartContainer sentiment={sentiment} />
            </div>
        </>
    )
}