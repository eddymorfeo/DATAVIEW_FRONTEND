import { Html, Head, Main, NextScript } from "next/document";
import { LoginForm } from "@/components/principal/login/login-form";
import { ModeToggle } from "@/components/principal/mode-toggle/mode-toggle";

export default function Home() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 w-full" translate="no">
      
      <div className="w-full max-w-sm md:max-w-4xl flex justify-end mb-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
