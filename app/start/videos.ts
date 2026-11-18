/**
 * Videos de referencia del onboarding.
 * Videos propios del canal de YouTube de Aquí Nace (@aquinace).
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
  id: "slN5cIRTQ4o",
  title: "¿Qué es un Núcleo Comunitario?",
  description:
    "Míralo antes de empezar: acciones, préstamos entre socios y reparto de utilidades explicados con ejemplos reales.",
  length: "5 min",
};

/** Referencia para comunidades que recién arrancan. */
export const NEW_COMMUNITY_VIDEO: TutorialVideo = {
  id: "oKsLl_8IFpg",
  title: "Cómo formar un nuevo Núcleo Comunitario",
  description:
    "Cómo se organiza un grupo nuevo en 6 pasos: el grupo, los acuerdos, la junta directiva y la primera reunión, más 5 claves para el éxito.",
  length: "3 min",
};

/** Referencia para comunidades que ya vienen funcionando. */
export const COMMUNITY_TYPE_VIDEO: TutorialVideo = {
  id: "vqJZaHa5MfU",
  title: "Tu asociación ya funciona: conviértela en Núcleo",
  description:
    "Cómo adaptar una UNICA, banca comunal o junta que ya está en marcha, cargar tus saldos reales con Registrar historial y todos los beneficios de Aquí Nace.",
  length: "3 min",
};
