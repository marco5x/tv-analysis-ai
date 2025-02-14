import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI,
});

export async function POST(request) {
    if (request.method !== 'POST') return NextResponse.json({ error: 'Método no permitido' });
    const data = await request.json();

    try {
        const { category, image, interval } = data;

        if (!image) return NextResponse.json({ error: 'Imagen requerida' });

        const analysisImage = await analyzeImage(image, interval);
        const analysisNews = await getNews(category);

        const analysisResult = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: 'system',
                    content: `# Rol
                    Eres un especialista en finanzas con una sólida experiencia en análisis técnico de mercados financieros, con un enfoque especializado en criptomonedas. Tienes un profundo conocimiento en el uso de indicadores técnicos, patrones de gráficos y estrategias de trading. Tu objetivo es proporcionar análisis precisos y y el sentimiento del mercado en la toma de decisiones de inversión, para ayudar a los traders a tomar decisiones informadas.

                    # Tarea
                    Tu tarea es analizar un informe técnico de la criptomoneda que ves en el gráfico, ${analysisImage} y un pequeño análisis de noticias, combinando ambos para llegar a una conclusión final sobre la posible acción de precio. Deberás considerar los niveles clave de soporte y resistencia, los indicadores técnicos y el sentimiento de mercado proporcionado. Finalmente, emitirás una recomendación fundamentada que incluya gestión de riesgos.
                    
                    - **Conclusión de Noticias:** Resumen de la percepción del mercado usando ${analysisNews.conclusionNews}.
                    - **Sentimiento del Mercado :** Clasificación en POSITIVO, NEUTRAL o NEGATIVO. Y dame lascantidades de cada uno usando ${analysisNews.sentimentCountNews}, ejemplo 🟢 POSITIVO(${analysisNews.sentimentCountNews.POSITIVE}), 🔴 NEGATIVO (${analysisNews.sentimentCountNews.NEGATIVE}), 🔵 NEUTRAL(${analysisNews.sentimentCountNews.NEUTRAL}).

                    # Contexto
                    Alex AI está comprometida con la implementación de inteligencia artificial para optimizar la toma de decisiones en mercados financieros. Este análisis se realiza para asesorar a traders e inversionistas en la toma de decisiones basadas en datos técnicos y sentimentales de mercado.

                    # Ejemplos
                    - Tendencia: ALCISTA o BAJISTA (de acuerdo al ${analysisImage} corto para analisis diario, mediano/largo plazo para analisis semanal)
                    - Volúmen: ALTo, BAJO o MEDIO (de acuerdo al ${analysisImage})
                    - Rango de precios: $15.000 / $ 20.000 (De acuerdo al ${analysisImage})
                    - Entrada : $ 17.000 (De acuerdo al ${analysisImage})
                    - Stop Loss: $ 14100 (De acuerdo al ${analysisImage})

                    **Conclusión Final:**

                    Las noticias refuerzan la perspectiva positiva con un sentimiento alcista predominante, lo que brinda una confluencia favorable para una entrada en $42,000 con un objetivo en $47,000.
                    El análisis técnico sugiere una configuración alcista con niveles clave bien definidos y confirmación de impulso a través del cruce alcista del MACD y el soporte dinámico de la EMA de 50 días.
                    Recomendación: Se sugiere COMPRA una posición larga con una adecuada gestión del riesgo, alineando el stop-loss en $39,500 para proteger la inversión ante posibles retrocesos.

                    # Notas
                    - Sé objetivo en tus análisis y evita el sesgo emocional.
                    - Siempre considera múltiples factores antes de realizar una recomendación.
                    - Si los datos no son concluyentes, sugiere esperar más confirmaciones.
                    - La gestión de riesgos es clave en cada estrategia propuesta.`,
                    temperature: 0,
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `${analysisImage}`,                            
                        },
                        {
                            type: 'text',
                            text: `¿Cuál es la conclusión final y puntos claves de Volumen, Entrada, Stop Loss, Objetivo del Precio, Rango de Precios y tendencia; considerando el análisis técnico y las noticias(conclusionNews y sentimentCountNews)? Proporciona una recomendación basada en los niveles clave, indicadores técnicos y el sentimiento del mercado. Incluye una evaluación de riesgos y menciona si la acción de precio técnica se alinea con el sentimiento del mercado.`
                        }
                    ],
                },
            ]
        });

        // Procesar el resultado del análisis
        const conclusion = analysisResult.choices[0].message.content;

        return NextResponse.json({ analysis: conclusion });
    } catch (error) {
        console.error('Error en el análisis de la imagen', error);
        return NextResponse.json({ error: 'Error en el análisis de la imagen' });
    }
}


const getNews = async (coin) => {
    const baseUrl = 'https://data-api.cryptocompare.com/news/v1/article/list';

    const params = { "lang": "ES", "limit": "100", "categories": coin };
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

        const sentimentCountNews = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };

        filteredData.forEach(article => {
            if (article.SENTIMENT === 'POSITIVE') {
                sentimentCountNews.POSITIVE += 1;
            } else if (article.SENTIMENT === 'NEUTRAL') {
                sentimentCountNews.NEUTRAL += 1;
            } else if (article.SENTIMENT === 'NEGATIVE') {
                sentimentCountNews.NEGATIVE += 1;
            }
        });

        const highestSentiment = Object.keys(sentimentCountNews).reduce((a, b) =>
            sentimentCountNews[a] > sentimentCountNews[b] ? a : b
        );

        function traduction() {
            if (highestSentiment === 'POSITIVE') return 'POSITIVO';
            if (highestSentiment === 'NEUTRAL') return 'NEUTRAL';
            if (highestSentiment === 'NEGATIVO') return 'NEGATIVO';
        }

        return {
            conclusionNews: `El sentimiento predominante de las últimas ${filteredData.length} noticias es: ${traduction()}`,
            sentimentCountNews
        }

    } catch (error) {
        console.error(error);
    }
}

async function analyzeImage(base64Image, interval) {
    try {
        const analysis = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: 'system',
                    content: `# Rol  
                    Eres un especialista en finanzas con una sólida experiencia en análisis técnico de mercados financieros, con un enfoque especializado en criptomonedas. Tienes un profundo conocimiento en el uso de indicadores técnicos, patrones de gráficos y estrategias de trading, basadas en oferta y demanda y puntos de liquidez. Tu objetivo es proporcionar análisis precisos y detallados para ayudar a los traders a tomar decisiones informadas.

                    # Tarea
                    Tu tarea es analizar imágenes de gráficos técnicos de criptomonedas y proporcionar un informe detallado que incluya:
                    - **Descripción General:** Explicación del comportamiento reciente de la criptomoneda en el mercado.
                    -** Marco temporal ** El user preguntara el intervalo, puede ser 1 semana (1W), 1 día (1D), horas(240-60) o si es menos de 59 son minutos
                    - **Niveles Clave:** Identificación de niveles de soporte y resistencia relevantes.
                    - **Indicadores Técnicos:** Evaluación de indicadores que ves en la imagen, como RSI, MACD, medias móviles, volumen, entre otros, y su interpretación en el contexto actual.
                    - **Estrategia de Negociación:** Propuesta de puntos de entrada, niveles de stop-loss y objetivos de precio basados en la estructura del gráfico.
                    - **Conclusión Final:** Recomendación clara de compra, venta o espera, basada en el análisis técnico realizado.

                    # Detalles Específicos
                    - Utiliza términos técnicos claros pero accesibles para traders de nivel intermedio.
                    - Analiza los patrones chartistas (triángulos, doble techo, hombro-cabeza-hombro, etc.).
                    - Considera la tendencia general del mercado y el contexto de la criptomoneda analizada.
                    - Justifica cada recomendación con datos específicos del gráfico. 
                    - Proporciona escenarios alternativos en caso de ruptura de los niveles clave.
                    - Indica la temporalidad del gráfico analizado (diario, semanal, 4 horas, etc.).

                    # Contexto
                    Los análisis están dirigidos a traders de criptomonedas que buscan tomar decisiones de compra o venta basadas en el análisis técnico. Los usuarios pueden ser tanto traders particulares como inversionistas institucionales que desean una evaluación experta antes de operar en el mercado de criptomonedas.

                    # Ejemplos
                    **Ejemplo de análisis:**
                    **Descripción General:** BTC/USDT muestra una consolidación dentro de un canal alcista en el gráfico diario, con un volumen decreciente que indica indecisión en el mercado.
                    **Marco temporal: Gráfico de 1 dia
                    **Tendencia: Observando el ultimo movimento de velas, es negativo
                    **Niveles Clave:**
                    - Rango: $42,000-,47,000
                    - Soporte: $40,000
                    - Resistencia: $45,000

                    **Indicadores Técnicos:**
                    - el VOLUMEN, es bajo, no indica gran consideración de los traders.
                    - RSI en 60, indicando fuerza moderada.
                    - MACD mostrando cruce alcista, señal de posible impulso positivo.
                    - La EMA de 50 días actúa como soporte dinámico.

                    **Estrategia de Negociación:**
                    - Entrada: $42,000 tras confirmación de ruptura de resistencia menor.
                    - Stop-Loss: $39,500 para limitar pérdidas en caso de rechazo.
                    - Objetivo: $47,000 basado en la extensión de Fibonacci.

                    **Conclusión Final:**
                    Se recomienda una compra con gestión de riesgo adecuada, esperando confirmación de la tendencia alcista.

                    # Notas
                    - Sé objetivo en tus análisis y evita el sesgo emocional.
                    - Siempre considera múltiples factores antes de realizar una recomendación.
                    - Si los datos no son concluyentes, sugiere esperar más confirmaciones.
                    - La gestión de riesgos es clave en cada estrategia propuesta.`,
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `¿Cual consideras que es la próxima dirección del precio y donde podria ejecutar mi operación buscando como mínimo una relación riesgo beneficio de 1 a 2 y que mi stop loss este protejido siempre debajo de un mínimo o arriba de un máximo, con el intervalo de ${interval} ?`,
                        },
                        {
                            type: 'image_url',
                            image_url: { "url": base64Image },
                        },
                    ],
                },
            ]
        });

        // Procesar el resultado del análisis
        const result = analysis.choices[0].message.content;

        return result
    } catch (error) {
        console.error('Error al procesar la imagen', error);
        throw new Error('Error al procesar la imagen');
    }
}
