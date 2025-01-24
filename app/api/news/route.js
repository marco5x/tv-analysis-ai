
import { NextResponse } from 'next/server';

export async function GET(request) {
    if (request.method !== 'GET') return NextResponse.json({ error: 'Método no permitido' });

    const baseUrl = 'https://data-api.cryptocompare.com/news/v1/article/list';
    const cat = request.nextUrl.searchParams.get('category');
    
    const params = { "lang": "ES", "limit": "100", "categories": cat };
    const url = new URL(baseUrl);
    url.search = new URLSearchParams(params).toString();

    const options = {
        method: 'GET',
        headers: { "Content-type": "application/json; charset=UTF-8" },
    };

    try {
        const resp = await fetch(url, options);
        const data = await resp.json();
                
        const filteredData = data.Data.map(article => ({
            TITLE: article.TITLE,
            BODY: article.BODY,
            URL: article.URL,
            IMAGE_URL: article.IMAGE_URL,
            SENTIMENT: article.SENTIMENT,
        }));
        
        const sentimentConclusion = getSentimentConclusion(filteredData);

        return NextResponse.json({ articles: filteredData, sentimentConclusion });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching data', error: error.message });
    }
}

// Función para contar los sentimientos y determinar la conclusión general
function getSentimentConclusion(articles) {
    const sentimentCount = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };

    articles.forEach(article => {
        if (article.SENTIMENT === 'POSITIVE') {
            sentimentCount.POSITIVE += 1;
        } else if (article.SENTIMENT === 'NEUTRAL') {
            sentimentCount.NEUTRAL += 1;
        } else if (article.SENTIMENT === 'NEGATIVE') {
            sentimentCount.NEGATIVE += 1;
        }
    });

    const highestSentiment = Object.keys(sentimentCount).reduce((a, b) =>
        sentimentCount[a] > sentimentCount[b] ? a : b
    );

    function traduction() {
        if (highestSentiment === 'POSITIVE') return 'POSITIVO';
        if (highestSentiment === 'NEUTRAL') return 'NEUTRAL';
        if (highestSentiment === 'NEGATIVO') return 'NEGATIVO';
    }
    
    return {
        conclusion:`El sentimiento predominante de las últimas ${articles.length} noticias es: ${traduction()}`,
        sentimentCount
    }
}
