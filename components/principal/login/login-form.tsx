"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import backgroundLogin from "@/app/img/background_login.jpg";

import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/auth/auth-service";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Usuario y clave ingresados
    const username = String(formData.get("user")).trim().toLowerCase();
    const password = String(formData.get("password")).trim();

    // Validar credenciales contra users.ts
    const user = login(username, password);

    if (!user) {
      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Credenciales inválidas",
        text: "El usuario o la contraseña no coinciden.",
        confirmButtonColor: "#3085d6",
      });

      return;
    }

    // Guardar cookie para middleware
    document.cookie = `dataview_user=true; path=/;`;

    // Mensaje de éxito
    Swal.fire({
      icon: "success",
      title: `Bienvenido ${user.name}`,
      showConfirmButton: false,
      timer: 1000,
    });

    // Redireccionar al home
    router.push("/home");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          
          {/* FORMULARIO */}
          <form className="p-6 md:p-8" onSubmit={handleLogin}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  Bienvenido a <strong>DataView</strong>
                </h1>
                <p className="text-muted-foreground">
                  Inicia sesión para acceder al sistema
                </p>
              </div>

              {/* Usuario */}
              <Field>
                <FieldLabel htmlFor="user">Usuario</FieldLabel>
                <Input
                  id="user"
                  name="user"
                  type="text"
                  required
                />
              </Field>

              {/* Password */}
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pr-10"
                  />

                  {/* Ícono de Mostrar/Ocultar */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? (
                      <IconEye size={20} stroke={1.5} />
                    ) : (
                      <IconEyeOff size={20} stroke={1.5} />
                    )}
                  </button>
                </div>
              </Field>

              <Field>
                <Button disabled={loading} type="submit" className="w-full">
                  {loading ? "Ingresando..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          {/* IMAGEN */}
          <div className="bg-muted relative hidden md:block">
            <Image
              src={backgroundLogin}
              alt="Login Background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
