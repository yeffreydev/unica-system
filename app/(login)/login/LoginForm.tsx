"use client";
import { AuthContext } from "@/context/auth/AuthContex";
import apiClient from "@/config/apiClient";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { isDesktop } from "@/config/runtime";
import { AlertCircle, Eye, EyeOff, Globe, Loader2, Lock, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const REMEMBER_KEY = "aquinace.login.username";

const inputBase =
  "peer w-full rounded-xl border border-input bg-card pl-11 pr-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-all hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60";

export const LoginForm = () => {
  const { loginUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [remember, setRemember] = useState(false);
  const [shake, setShake] = useState(false);
  const userRef = useRef<HTMLInputElement>(null);

  // Instalación de escritorio recién puesta: la base local está vacía, así que
  // el primer ingreso necesita internet una sola vez para bajar la asociación.
  const [needsLink, setNeedsLink] = useState(false);
  const [tenantCode, setTenantCode] = useState("");
  const [linking, setLinking] = useState(false);
  const desktop = isDesktop();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setForm((f) => ({ ...f, username: saved }));
        setRemember(true);
      }
    } catch {}
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!desktop) return;
    // Si el sidecar todavía no está enlazado, se pide el dominio de una.
    apiClient
      .get("/sync/status")
      .then(({ data }) => {
        if (!data?.tenantCode) setNeedsLink(true);
        else setTenantCode(data.tenantCode);
      })
      .catch(() => undefined);
  }, [desktop]);

  const fail = (message: string) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  /** Baja la asociación completa a la base local y entra. */
  const linkAndLogin = async () => {
    setLinking(true);
    setError(null);
    try {
      await apiClient.post("/sync/link", {
        tenantCode: tenantCode.trim(),
        username: form.username,
        password: form.password,
      });
      setNeedsLink(false);
      await postLogin();
    } catch (e: any) {
      fail(
        e?.response?.data?.message ||
          "No se pudo enlazar la asociación. Revisa el dominio y tu conexión.",
      );
    } finally {
      setLinking(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const onPasswordKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setCapsLock(e.getModifierState("CapsLock"));
    }
  };

  const postLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/auth/login", {
        username: form.username.trim(),
        password: form.password,
      });
      if (res.data) {
        try {
          if (remember) localStorage.setItem(REMEMBER_KEY, form.username.trim());
          else localStorage.removeItem(REMEMBER_KEY);
        } catch {}
        loginUser(res.data.accessToken);
        router.push("/");
      }
    } catch (error: any) {
      setIsLoading(false);
      // En el escritorio, que no exista el usuario suele significar que esta
      // máquina todavía no bajó la asociación, no que la clave esté mal.
      if (desktop && !needsLink) setNeedsLink(true);
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;
      const message =
        status === 401 && (!serverMsg || /unauthorized|invalid/i.test(String(serverMsg)))
          ? "Usuario o contraseña incorrectos. Revísalos e inténtalo otra vez."
          : !error?.response
            ? "No pudimos conectarnos con el servidor. Revisa tu internet."
            : serverMsg || (error instanceof Error ? error.message : "Error al iniciar sesión");
      fail(message);
      console.error(error);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      fail("Escribe tu usuario y tu contraseña.");
      return;
    }
    if (desktop && needsLink) {
      void linkAndLogin();
      return;
    }
    void postLogin();
  };

  const busy = isLoading || linking;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("w-full flex flex-col gap-7", shake && "animate-[shake_0.4s_ease-in-out]")}
    >
      <style jsx global>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
      `}</style>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Iniciar sesión</h2>
        <p className="text-muted-foreground leading-relaxed">
          {desktop && needsLink
            ? "Esta computadora todavía no tiene los datos de tu asociación. Conéctala una vez y después funciona sin internet."
            : "Ingresa con tu usuario de socio para continuar."}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {desktop && needsLink && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground/80 ml-1">Dominio de la asociación</span>
            <span className="relative block">
              <Globe className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground peer-focus:text-primary" />
              <input
                name="tenantCode"
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value)}
                placeholder="miasociacion.aquinace.com"
                className={inputBase}
                type="text"
                autoComplete="off"
                disabled={busy}
              />
            </span>
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground/80 ml-1">Usuario</span>
          <span className="relative block">
            <input
              ref={userRef}
              name="username"
              cy-data="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Tu DNI o usuario"
              className={inputBase}
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              disabled={busy}
            />
            <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors peer-focus:text-primary" />
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground/80 ml-1">Contraseña</span>
          <span className="relative block">
            <input
              name="password"
              cy-data="password"
              value={form.password}
              onChange={handleChange}
              onKeyUp={onPasswordKey}
              onKeyDown={onPasswordKey}
              placeholder="••••••••"
              className={cn(inputBase, "pr-12")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={busy}
            />
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors peer-focus:text-primary" />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
          {capsLock && (
            <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
              Tienes las mayúsculas activadas.
            </span>
          )}
        </label>

        <label className="flex items-center gap-2.5 ml-1 cursor-pointer select-none text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary accent-[hsl(var(--primary))] focus:ring-primary/30"
          />
          Recordar mi usuario en este equipo
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      <button
        className="group relative w-full overflow-hidden rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={busy || (desktop && needsLink && !tenantCode.trim())}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {linking ? "Bajando los datos..." : "Entrando..."}
            </>
          ) : desktop && needsLink ? (
            "Conectar y entrar"
          ) : (
            "Entrar"
          )}
        </span>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </button>

      <p className="text-center text-xs text-muted-foreground -mt-2">
        ¿Olvidaste tu clave? Pídele al administrador de tu asociación que la restablezca.
      </p>
    </form>
  );
};
