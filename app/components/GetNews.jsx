
export const GetNews = () => {
    const closeModal = () => { 
        const modal = document.getElementById("newsModal");
        const modalNews = document.getElementById("modalNews");

        modalNews.innerHTML = "";
        modal.style.display = "none";
    }

    return (
        <div id="newsModal" className="fixed top-[9%] left-[36%] w-[36%] h-[80%] border-l-8 border-[#394E99] rounded-lg bg-white shadow-lg p-3 overflow-y-auto hidden ">
            <div className="w-full flex justify-between items-center mb-3 sticky">
                <h2 className="w-auto size-4 font-bold">Últimas Noticas</h2>
                <button id="closeModal" onClick={closeModal} className="text-dark-900 text-xl font-bold">&times;</button>
            </div>
            <div id="modalNews" className=""></div>
        </div>
    )
}