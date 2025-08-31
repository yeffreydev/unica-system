"use client";

import { useThemeContext } from "@/context/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TestPage() {
  const { theme, setTheme, systemTheme, mounted } = useThemeContext();

  if (!mounted) {
    return <div className="p-8">Cargando tema...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Página de Prueba - Temas</h1>
        <p className="text-muted-foreground">
          Esta página demuestra la funcionalidad de temas claro y oscuro.
        </p>
      </div>

      {/* Información del tema actual */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Tema</CardTitle>
          <CardDescription>
            Estado actual del tema y configuración del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tema Actual:</Label>
              <p className="text-sm text-muted-foreground">{theme}</p>
            </div>
            <div>
              <Label>Tema del Sistema:</Label>
              <p className="text-sm text-muted-foreground">{systemTheme || "No detectado"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setTheme("light")} variant="outline">
              Tema Claro
            </Button>
            <Button onClick={() => setTheme("dark")} variant="outline">
              Tema Oscuro
            </Button>
            <Button onClick={() => setTheme("system")} variant="outline">
              Tema del Sistema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo de contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ejemplo de Contenido</CardTitle>
            <CardDescription>
              Este card se adapta automáticamente al tema seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              El texto aquí se adapta automáticamente al tema. En modo claro será oscuro,
              y en modo oscuro será claro.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de Contacto</CardTitle>
            <CardDescription>
              Ejemplo de formulario con tema adaptativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Tu nombre" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" />
            </div>
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea id="message" placeholder="Tu mensaje aquí..." />
            </div>
            <Button className="w-full">Enviar Mensaje</Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de ejemplo */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla de Ejemplo</CardTitle>
          <CardDescription>
            Tabla que se adapta al tema seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-foreground">Nombre</th>
                  <th className="text-left p-2 text-foreground">Email</th>
                  <th className="text-left p-2 text-foreground">Rol</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 text-foreground">Juan Pérez</td>
                  <td className="p-2 text-muted-foreground">juan@ejemplo.com</td>
                  <td className="p-2 text-foreground">Admin</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 text-foreground">María García</td>
                  <td className="p-2 text-muted-foreground">maria@ejemplo.com</td>
                  <td className="p-2 text-foreground">Usuario</td>
                </tr>
                <tr>
                  <td className="p-2 text-foreground">Carlos López</td>
                  <td className="p-2 text-muted-foreground">carlos@ejemplo.com</td>
                  <td className="p-2 text-foreground">Editor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
