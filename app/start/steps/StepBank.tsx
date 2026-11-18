"use client";

import { useState } from "react";
import { Check, Coins, HandCoins, History, PiggyBank, Sparkles, Sprout, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencySelect } from "@/components/CurrencySelect";
import { useTenant } from "@/context/TenantContext";
import { currencyInfo } from "@/lib/currency";
import { useOnboarding } from "../OnboardingProvider";
import { saveBank } from "../api";
import { StepShell } from "../components/StepShell";
import { VideoTutorial } from "../components/VideoTutorial";
import { COMMUNITY_TYPE_VIDEO, INTRO_VIDEO, NEW_COMMUNITY_VIDEO } from "../videos";
import {
  COMMUNITY_KIND_HINTS,
  COMMUNITY_KIND_LABELS,
  CommunityKind,
  UnicaMode,
} from "../types";

export function StepBank() {
  const { state, setState, mode, setMode } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const { currency, updateCurrency } = useTenant();
  // Se guarda recién al continuar, junto con el resto de datos.
  const [currencyCode, setCurrencyCode] = useState(currency.code);
  const esAntigua = mode === "antigua";

  const onNext = async () => {
    if (!state.bank.name.trim()) {
      toast({
        title: "Falta el nombre",
        description: "Escribe cómo se llama tu comunidad para continuar.",
      });
      throw new Error("name required");
    }
    if (esAntigua && state.communityKind === "otro" && !state.communityKindOther.trim()) {
      toast({
        title: "Cuéntanos el tipo",
        description: "Escribe qué tipo de comunidad es (junta, cooperativa, etc.).",
      });
      throw new Error("kind required");
    }
    setSaving(true);
    try {
      if (currencyCode !== currency.code) await updateCurrency(currencyCode);
      await saveBank(state.bank);
      toast({ title: "Listo", description: "Datos de la comunidad guardados." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepShell
      stepId="bank"
      title="Empecemos por tu comunidad"
      description="Toma dos minutos. Puedes salir cuando quieras: todo queda guardado como borrador."
      onNext={onNext}
      saving={saving}
    >
      <div className="space-y-6 max-w-2xl">
        {/* Bienvenida */}
        <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Bienvenido a Aquí Nace
            </span>
          </div>
          <h2 className="text-xl font-bold mt-2 leading-snug">
            Tu comunidad de ahorro, ordenada en un solo lugar
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Registra socios, acciones, préstamos y utilidades sin cuadernos ni hojas sueltas.
            Empezamos con lo básico y el sistema hace las cuentas por ti.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
            <Highlight icon={<Users className="h-4 w-4" />} title="Socios" text="Quiénes ahorran" />
            <Highlight icon={<Coins className="h-4 w-4" />} title="Acciones" text="Cuánto aporta cada uno" />
            <Highlight icon={<HandCoins className="h-4 w-4" />} title="Préstamos" text="Quién debe y cuánto" />
          </div>
        </div>

        {/* Tutorial de bienvenida */}
        <VideoTutorial video={INTRO_VIDEO} eyebrow="Antes de empezar" />

        {/* Estado de la comunidad */}
        <div className="rounded-xl border border-border p-5">
          <Label className="text-sm font-semibold">¿Tu comunidad recién empieza?</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Con esto sabemos cuánta información pedirte.
          </p>
          <div role="radiogroup" aria-label="Estado de la comunidad" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <ModeCard
              active={mode === "nueva"}
              onSelect={() => setMode("nueva")}
              icon={<Sprout className="h-4 w-4" />}
              title="Sí, empieza desde cero"
              text="3 pasos: comunidad, reuniones y socios."
            />
            <ModeCard
              active={mode === "antigua"}
              onSelect={() => setMode("antigua")}
              icon={<History className="h-4 w-4" />}
              title="No, ya viene funcionando"
              text="Registras tu historial hasta una fecha de corte."
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
            {esAntigua
              ? "Vamos a registrar lo que ya pasó: acciones, préstamos, ingresos, gastos y el cuadre de caja a una fecha de corte."
              : "Solo pediremos los datos de la comunidad, cada cuánto se reúnen y quiénes son los socios. Nada más."}
          </p>

          {/* Video de referencia debajo del tipo de comunidad */}
          <VideoTutorial
            video={esAntigua ? COMMUNITY_TYPE_VIDEO : NEW_COMMUNITY_VIDEO}
            compact
            eyebrow="Video de referencia"
            className="mt-4"
          />

          {esAntigua && (
            <div className="mt-5 border-t border-border pt-4">
              <Label className="text-sm font-semibold">¿Qué tipo de comunidad es?</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Nos ayuda a usar las palabras que ustedes ya usan.
              </p>
              <Select
                value={state.communityKind}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, communityKind: v as CommunityKind }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(COMMUNITY_KIND_LABELS) as CommunityKind[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {COMMUNITY_KIND_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {COMMUNITY_KIND_HINTS[state.communityKind]}
              </p>

              {state.communityKind === "otro" && (
                <Input
                  className="mt-3"
                  placeholder="¿Cómo le llaman ustedes? Ej: junta de vecinos"
                  value={state.communityKindOther}
                  onChange={(e) =>
                    setState((s) => ({ ...s, communityKindOther: e.target.value }))
                  }
                />
              )}
            </div>
          )}
        </div>

        {/* Datos base */}
        <div className="rounded-xl border border-border p-5 space-y-5">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Datos de la comunidad</h3>
          </div>

          <div>
            <Label>Nombre de la comunidad</Label>
            <Input
              className="mt-1.5"
              placeholder="Ej: Asociación El Progreso"
              value={state.bank.name}
              onChange={(e) =>
                setState((s) => ({ ...s, bank: { ...s.bank, name: e.target.value } }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Así aparecerá en los reportes y actas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Interés de los préstamos (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="mt-1.5"
                value={state.bank.loanInterestRate}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    bank: { ...s.bank, loanInterestRate: Number(e.target.value) || 0 },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lo que paga al mes quien recibe un préstamo.
              </p>
            </div>
            <div>
              <Label>Interés de los ahorros (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="mt-1.5"
                value={state.bank.savingsInterestRate}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    bank: { ...s.bank, savingsInterestRate: Number(e.target.value) || 0 },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lo que gana al mes quien deja su dinero ahorrado.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="onboarding-currency">Moneda</Label>
            <CurrencySelect
              id="onboarding-currency"
              className="mt-1.5 max-w-sm"
              value={currencyCode}
              onChange={setCurrencyCode}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground mt-1">
              La moneda en la que la comunidad lleva sus cuentas. Puedes cambiarla luego en
              Configuración.
            </p>
          </div>

          <div>
            <Label>Precio de la acción ({currencyInfo(currencyCode).symbol})</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="mt-1.5 max-w-[200px]"
              value={state.bank.mainStockPrice}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  bank: { ...s.bank, mainStockPrice: Number(e.target.value) || 0 },
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cuánto cuesta una acción. El capital de la comunidad = acciones compradas × este
              precio.
            </p>
          </div>
        </div>
      </div>
    </StepShell>
  );
}

function ModeCard({
  active,
  onSelect,
  icon,
  title,
  text,
}: {
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        "relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
        active
          ? "border-primary bg-primary/10 ring-1 ring-primary"
          : "border-border hover:border-primary/40 hover:bg-accent/50"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug">{title}</span>
        <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">{text}</span>
      </span>
      {active && <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={3} />}
    </button>
  );
}

function Highlight({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg bg-background/70 border border-border/60 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-foreground">
        {icon}
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">{text}</p>
    </div>
  );
}
