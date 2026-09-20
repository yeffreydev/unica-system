"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Registro de una nueva cuenta, en pasos.
 *
 * Por ahora es solo interfaz: la navegación entre pasos funciona, pero el
 * envío está deshabilitado hasta que exista el endpoint de registro.
 */

const inputClass =
  "w-full border border-border bg-background hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 transition-all outline-none";

const STEPS = [
  { title: "Tus datos", subtitle: "Cuéntanos quién eres." },
  { title: "Contacto", subtitle: "Para avisarte de tus asambleas." },
  { title: "Tu contraseña", subtitle: "Con esto entrarás al sistema." },
];

const emptyForm = {
  name: "",
  lastname: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
};

export const RegisterForm = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const isLast = step === STEPS.length - 1;
  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  // El registro aún no está conectado: no se envía nada.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLast) goNext();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Crear mi cuenta
        </h2>
        <p className="text-muted-foreground">{STEPS[step].subtitle}</p>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex-1">
            <div
              className={`h-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
            <p
              className={`mt-1.5 text-[11px] transition-colors ${
                i === step ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {s.title}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {step === 0 && (
          <>
            <Field label="Nombres">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombres"
                className={inputClass}
                type="text"
                autoFocus
              />
            </Field>
            <Field label="Apellidos">
              <input
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="Apellidos"
                className={inputClass}
                type="text"
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Correo electrónico">
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
                className={inputClass}
                type="email"
                autoFocus
              />
            </Field>
            <Field label="Teléfono">
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="999 999 999"
                className={inputClass}
                type="tel"
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Contraseña">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
                type="password"
                autoFocus
              />
            </Field>
            <Field label="Repetir contraseña">
              <input
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
                type="password"
              />
            </Field>

            <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
              />
              <span>Acepto los términos del servicio y el tratamiento de mis datos.</span>
            </label>
          </>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-4 py-3.5 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </button>
          )}

          {isLast ? (
            <button
              type="submit"
              disabled
              aria-disabled="true"
              title="Crear cuenta — Próximamente"
              className="flex-1 flex items-center justify-center gap-2.5 rounded-xl border border-border bg-muted/60 py-3.5 px-4 font-semibold text-muted-foreground cursor-not-allowed select-none"
            >
              Crear cuenta
              <span className="ml-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                Próximamente
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 bg-primary hover:bg-primary/90 active:scale-[0.98] rounded-xl text-primary-foreground py-3.5 font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
            >
              Continuar
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {isLast && (
          <p className="text-xs text-center text-muted-foreground/80">
            El registro en línea todavía no está habilitado. Escríbenos a{" "}
            <a href="mailto:hola@aquinace.com" className="underline hover:text-foreground">
              hola@aquinace.com
            </a>{" "}
            para crear tu comunidad.
          </p>
        )}

        {step === 0 && (
          <>
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            {/* Crear una asociación (con correo o Google) se hace en el panel. */}
            <a
              href="https://panel.aquinace.com/register"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-border bg-background py-3.5 px-4 font-semibold text-foreground hover:bg-muted/60 transition-colors"
            >
              Crear mi asociación en el panel
            </a>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </form>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground/80 ml-1">{label}</label>
      {children}
    </div>
  );
}
