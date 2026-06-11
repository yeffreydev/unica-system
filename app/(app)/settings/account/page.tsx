import { AccountForm } from "./account-form";

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Cuenta de acceso</h3>
        <p className="text-sm text-muted-foreground">
          Cambia el DNI de usuario y la contraseña con los que se ingresa a la plataforma de esta asociación.
        </p>
      </div>
      <AccountForm />
    </div>
  );
}
