import { NextResponse } from "next/server";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT =
  "Eres un asistente de ayuda para la plataforma UNICA. Responde en español, de forma breve, clara y accionable. Si necesitas más contexto, pide aclaraciones. Si el tema es sensible (seguridad, datos personales), recuerda buenas prácticas.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputMessages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...inputMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages,
        }),
      });

      if (!res.ok) {
        const details = await res.text();
        return NextResponse.json(
          { error: "AI request failed", details },
          { status: 500 }
        );
      }

      const data = await res.json();
      const reply: string =
        data?.choices?.[0]?.message?.content ??
        "Lo siento, no pude generar una respuesta.";
      return NextResponse.json({ reply });
    }

    const lastUserMessage = [...inputMessages]
      .reverse()
      .find((m) => m.role === "user")?.content;
    const fallback =
      "Soy tu asistente de ayuda. Aún no se ha configurado OPENAI_API_KEY, así que esta es una respuesta básica. ¿Podrías detallar tu pregunta para ayudarte mejor?";

    return NextResponse.json({
      reply: lastUserMessage
        ? `${fallback}\n\nTu pregunta: "${lastUserMessage}"`
        : fallback,
      note: "Configura OPENAI_API_KEY para habilitar respuestas de IA.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request", details: error},
      { status: 400 }
    );
  }
}


