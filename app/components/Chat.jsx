"use client"

import { Loading } from "./Loading";
import { PieChart } from 'react-minimal-pie-chart';
import { useRef } from 'react';

export const Chat = () => {
    const sentimentRef = useRef("pieSentiment");

    const closeModal = () => { 
        const modal = document.getElementById("responseModal");
        const modalMsg = document.getElementById("modalMessage");

        modalMsg.textContent = "Analizando..."
        modal.style.marginRight = "-24rem";
    }

    const PieChartContainer = ({ sentiment }) => {
            return (
                <PieChart
                    data={[
                        { title: `Positivo (${sentiment?.POSITIVE}%)`, value: sentiment?.POSITIVE, color: '#394E99' },
                        { title: `Negativo (${sentiment?.NEGATIVE}%)`, value: sentiment?.NEGATIVE, color: '#f97066' },
                        { title: `Neutral (${sentiment?.NEUTRAL}%)`, value: sentiment?.NEUTRAL, color: '#DEE2F3' },
                    ]}
                />
            )
        }

    return (
        <div id="responseModal" className="relative flex justify-end items-center h-full mr-[-24rem]">
            <div className="bg-white p-3 rounded-lg shadow-lg w-96 h-dvh max-w-full overflow-y-auto ">
            <button id="closeModal" onClick={closeModal} className="text-dark-900 text-xl font-bold relative top-3 left-[93%]">&times;</button>
                <h2 className="text-xl font-semibold text-center mb-3">Análisis by Alios 🤖</h2>
                <p id="modalMessage">Analizando
                <Loading/>
                </p>
            </div>
        </div>
    );
}
