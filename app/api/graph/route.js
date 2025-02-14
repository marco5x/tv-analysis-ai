import { NextResponse } from 'next/server';
import { OpenAI } from 'openai'; 

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI,
});

export async function POST(request) {
    if (request.method !== 'POST') return NextResponse.json({ error: 'Método no permitido' });
    
    try {
        const data = await request.json();
        
        const { image } = data;
        const { interval } = data;

        if (!image) return NextResponse.json({ error: 'Imagen requerida' });
        
        // Procesar la imagen usando GPT-4 (modelo multimodal de OpenAI)
        const analysisResult = await analyzeImage(image, interval);

        return NextResponse.json({ analysis: analysisResult });
    } catch (error) {
        console.error('Error en el análisis de la imagen', error);
        return NextResponse.json({ error: 'Error en el análisis de la imagen' });
    }
}

async function analyzeImage(base64Image, interval) {
    try {
        const analysis = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: 'system',
                    content: `# Rol  
                    Eres un especialista en finanzas con una sólida experiencia en análisis técnico de mercados financieros, con un enfoque especializado en criptomonedas. Tienes un profundo conocimiento en el uso de indicadores técnicos, patrones de gráficos y estrategias de trading. Tu objetivo es proporcionar análisis precisos y detallados para ayudar a los traders a tomar decisiones informadas.

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
                            text: `¿Qué patrones y análisis técnico detectas en esta imágen, con el intervalo de ${interval} ?`,
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

        return {
            trend: result.includes('alcista') ? 'alcista' : 'bajista',
            analysisText: result,
        };
    } catch (error) {
        console.error('Error al procesar la imagen', error);
        throw new Error('Error al procesar la imagen');
    }
}
