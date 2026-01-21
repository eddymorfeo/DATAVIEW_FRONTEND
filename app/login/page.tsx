import { LoginForm } from "@/components/principal/login/login-form"
import { ModeToggle } from "@/components/principal/mode-toggle/mode-toggle"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 w-full">
      
      {/* Contenedor ancho que permite alinear el botón a la derecha */}
      <div className="w-full max-w-sm md:max-w-4xl flex justify-end mb-4">
        {/* <ModeToggle /> */}
      </div>

      {/* Formulario centrado */}
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
