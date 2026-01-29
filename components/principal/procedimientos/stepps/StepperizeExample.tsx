"use client";

import * as React from "react";
import { defineStepper } from "@stepperize/react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stepper = defineStepper(
  { id: "step-1", title: "Step 1", description: "Identificación del Caso" },
  { id: "step-2", title: "Step 2", description: "Drogas e Incautaciones" },
  { id: "step-3", title: "Step 3", description: "Armas y Elementos" },
  { id: "step-4", title: "Step 4", description: "Resumen" }
);

type StepId = (typeof stepper)["steps"][number]["id"];

function getStepState(currentIndex: number, stepIndex: number) {
  if (currentIndex === stepIndex) return "active";
  if (currentIndex > stepIndex) return "completed";
  return "inactive";
}

export default function StepperizeExample() {
  const methods = stepper.useStepper();
  const steps = stepper.steps;
  const utils = stepper.utils;

  // Dirección para animación (izq/der) al cambiar de step
  const [direction, setDirection] = React.useState<1 | -1>(1);

  const currentIndex = utils.getIndex(methods.current.id);
  const isFirst = methods.isFirst;
  const isLast = methods.isLast;

  const goTo = (id: StepId) => {
    const nextIndex = utils.getIndex(id);
    setDirection(nextIndex >= currentIndex ? 1 : -1);
    methods.goTo(id);
  };

  const next = () => {
    setDirection(1);
    methods.next();
  };

  const prev = () => {
    setDirection(-1);
    methods.prev();
  };

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Header / Steps */}
      <div className="rounded-xl border bg-background p-4">
        <ol className="flex items-start gap-2">
          {steps.map((s, idx) => {
            const state = getStepState(currentIndex, idx);

            return (
              <li key={s.id} className="flex flex-1 items-start gap-2">
                <button
                  type="button"
                  onClick={() => goTo(s.id as StepId)}
                  className={cn(
                    "group flex items-start gap-3 text-left outline-none",
                    state === "inactive" && "opacity-60 hover:opacity-90"
                  )}
                >
                  {/* Indicador (círculo) con micro-animación */}
                  <motion.span
                    layout
                    className={cn(
                      "mt-0.5 grid h-8 w-8 place-items-center rounded-full border text-sm font-medium transition-colors",
                      state === "active" && "border-primary text-primary",
                      state === "completed" && "border-primary bg-primary text-primary-foreground",
                      state === "inactive" && "border-muted-foreground/30"
                    )}
                    animate={{
                      scale: state === "active" ? 1.05 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    {idx + 1}
                  </motion.span>

                  <div className="min-w-0">
                    <div
                      className={cn(
                        "truncate text-sm font-medium transition-colors",
                        state === "active" && "text-foreground",
                        state === "completed" && "text-foreground",
                        state === "inactive" && "text-muted-foreground"
                      )}
                    >
                      {s.title}
                    </div>

                    {s.description ? (
                      <div className="truncate text-xs text-muted-foreground">
                        {s.description}
                      </div>
                    ) : null}
                  </div>
                </button>

                {/* Conector con animación suave (tipo Stepperize) */}
                {idx !== steps.length - 1 && (
                  <div className="mt-4 hidden flex-1 sm:block">
                    <div className="h-0.5 w-full overflow-hidden rounded bg-muted">
                      <motion.div
                        className="h-full bg-primary"
                        initial={false}
                        animate={{
                          width: currentIndex > idx ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Panel con transición slide/fade */}
      <div className="relative overflow-hidden rounded-xl border bg-background p-4">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={methods.current.id}
            custom={direction}
            variants={{
              enter: (dir: 1 | -1) => ({
                x: dir === 1 ? 24 : -24,
                opacity: 0,
              }),
              center: { x: 0, opacity: 1 },
              exit: (dir: 1 | -1) => ({
                x: dir === 1 ? -24 : 24,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-3"
          >
            {methods.switch({
              "step-1": () => (
                <StepContent
                  title="Contenido Step 1"
                  description="Aquí iría tu primer bloque del formulario (inputs, selects, etc.)."
                />
              ),
              "step-2": () => (
                <StepContent
                  title="Contenido Step 2"
                  description="Segundo bloque del formulario. Ideal para datos operativos."
                />
              ),
              "step-3": () => (
                <StepContent
                  title="Contenido Step 3"
                  description="Revisión/confirmación antes de enviar."
                />
              ),
              "step-4": () => (
                <StepContent
                  title="Contenido Step 4"
                  description="Revisión/confirmación antes de enviar."
                />
              ),
            })}
          </motion.div>
        </AnimatePresence>

        {/* Controles */}
        <div className="mt-6 flex items-center justify-between gap-2">
          <Button variant="outline" onClick={prev} disabled={isFirst}>
            Previous
          </Button>

          <Button
            onClick={() => {
              if (isLast) {
                // Reset con animación hacia atrás (opcional)
                setDirection(-1);
                methods.reset();
                return;
              }
              next();
            }}
          >
            {isLast ? "Reset" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepContent(props: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-base font-semibold">{props.title}</h3>
      <p className="text-sm text-muted-foreground">{props.description}</p>

      <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        (Placeholder) Aquí renderizas el formulario real del step.
      </div>
    </div>
  );
}
