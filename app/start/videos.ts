/**
 * Videos de referencia del onboarding.
 * Reemplaza los IDs por los tutoriales propios de Aquí Nace cuando estén listos.
 */
export interface TutorialVideo {
  /** ID de YouTube (lo que va después de watch?v=). */
  id: string;
  title: string;
  description: string;
  /** Duración aproximada, solo informativa. */
  length?: string;
}

/** Bienvenida: qué es una comunidad de ahorro y cómo funciona. */
export const INTRO_VIDEO: TutorialVideo = {
  id: "pUxFA2omtEk",
  title: "¿Cómo funciona una comunidad de ahorro?",
  description:
    "Míralo antes de empezar: acciones, préstamos entre socios y reparto de utilidades explicados con ejemplos reales.",
  length: "3 min",
};

/** Referencia para comunidades que recién arrancan. */
export const NEW_COMMUNITY_VIDEO: TutorialVideo = {
  id: "VYNOnef90Us",
  title: "Comunidades que empiezan de cero",
  description:
    "Cómo se organiza un grupo nuevo: acuerdos, aportes y las primeras reuniones.",
  length: "5 min",
};

/** Referencia para comunidades que ya vienen funcionando. */
export const COMMUNITY_TYPE_VIDEO: TutorialVideo = {
  id: "bCAomxGmxu0",
  title: "Comunidades que ya vienen funcionando",
  description:
    "Ejemplo de una comunidad en marcha: qué datos acumulados necesitas tener a la mano antes de registrarlos.",
  length: "4 min",
};
