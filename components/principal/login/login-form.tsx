"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import backgroundLogin from "@/app/img/background_login.jpg";

import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

// ✅ Nuevo: login real contra backend
import { loginWithBackend } from "@/lib/auth/auth-service";

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

    const username = String(formData.get("user") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "").trim();

    try {
      // ✅ llama al backend: POST /api/auth/login
      const result = await loginWithBackend({ username, password });

      // ✅ guarda token + user (para consumir endpoints protegidos)
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(result.user));

      // ✅ (opcional) si tu middleware actual depende de cookie
      document.cookie = `dataview_user=true; path=/;`;

      Swal.fire({
        icon: "success",
        title: `Bienvenido ${result.user.fullName}`,
        showConfirmButton: false,
        timer: 1000,
      });

      router.push("/home");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Credenciales inválidas",
        text: err?.message ?? "El usuario o la contraseña no coinciden.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
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
                <Input id="user" name="user" type="text" required />
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

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
              priority
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
