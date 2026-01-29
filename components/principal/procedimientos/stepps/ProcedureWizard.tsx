"use client";

import * as React from "react";
import { defineStepper } from "@stepperize/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { FormProvider, useForm, type Resolver } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  procedureFormSchema,
  type ProcedureFormValues,
} from "@/components/principal/schemas/schema";

import { stepFields } from "./step-fields";
import Step1CaseIdentification from "./Step1CaseIdentification";
import Step2DrugsSeizures from "./Step2DrugsSeizures";
import Step3WeaponsElements from "./Step3WeaponsElements";
import Step4ReviewSubmit from "./Step4ReviewSubmit";

const stepper = defineStepper(
  { id: "step-1", title: "Identificación", description: "Caso / unidad / fiscal" },
  { id: "step-2", title: "Drogas e Incautaciones", description: "Drogas, dinero, vehículo, inmueble" },
  { id: "step-3", title: "Armas y Elementos", description: "Armas, municiones, otros" },
  { id: "step-4", title: "Revisión", description: "Resumen + envío" }
);

type StepId = (typeof stepper)["steps"][number]["id"];

function getStepState(currentIndex: number, stepIndex: number) {
  if (currentIndex === stepIndex) return "active";
  if (currentIndex > stepIndex) return "completed";
  return "inactive";
}

export default function ProcedureWizard() {
  const methods = useForm<ProcedureFormValues>({
    // ✅ FIX: NO fuerces genéricos en zodResolver cuando tu schema usa preprocess/transform
    //        (porque el input de Zod queda como unknown en esos campos).
    resolver: zodResolver(procedureFormSchema) as unknown as Resolver<ProcedureFormValues>,
    mode: "onTouched",
    defaultValues: {
      procedureType: "PROPIO",
      seizedProperty: false,
      detaineesCount: 0,
    },
  });

  const step = stepper.useStepper();
  const steps = stepper.steps;
  const utils = stepper.utils;

  const [direction, setDirection] = React.useState<1 | -1>(1);
  const currentIndex = utils.getIndex(step.current.id);

  const goTo = (id: StepId) => {
    const nextIndex = utils.getIndex(id);
    setDirection(nextIndex >= currentIndex ? 1 : -1);
    step.goTo(id);
  };

  const validateAndNext = async () => {
    if (step.current.id === "step-1") {
      const ok = await methods.trigger(stepFields.step1, { shouldFocus: true });
      if (!ok) return;
    }

    if (step.current.id === "step-2") {
      const ok = await methods.trigger(stepFields.step2, { shouldFocus: true });
      if (!ok) return;
    }

    if (step.current.id === "step-3") {
      const ok = await methods.trigger(stepFields.step3, { shouldFocus: true });
      if (!ok) return;
    }

    setDirection(1);
    step.next();
  };

  const prev = () => {
    setDirection(-1);
    step.prev();
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    console.log("SUBMIT", data);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="w-full max-w-4xl space-y-6">
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
                    <motion.span
                      layout
                      className={cn(
                        "mt-0.5 grid h-8 w-8 place-items-center rounded-full border text-sm font-medium transition-colors",
                        state === "active" && "border-primary text-primary",
                        state === "completed" && "border-primary bg-primary text-primary-foreground",
                        state === "inactive" && "border-muted-foreground/30"
                      )}
                      animate={{ scale: state === "active" ? 1.05 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                      {idx + 1}
                    </motion.span>

                    <div className="min-w-0">
                      <div
                        className={cn(
                          "truncate text-sm font-medium transition-colors",
                          state === "inactive" ? "text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {s.title}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{s.description}</div>
                    </div>
                  </button>

                  {idx !== steps.length - 1 && (
                    <div className="mt-4 hidden flex-1 sm:block">
                      <div className="h-0.5 w-full overflow-hidden rounded bg-muted">
                        <motion.div
                          className="h-full bg-primary"
                          initial={false}
                          animate={{ width: currentIndex > idx ? "100%" : "0%" }}
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

        {/* Panel animado */}
        <div className="relative overflow-hidden rounded-xl border bg-background p-4">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step.current.id}
              custom={direction}
              variants={{
                enter: (dir: 1 | -1) => ({ x: dir === 1 ? 24 : -24, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: 1 | -1) => ({ x: dir === 1 ? -24 : 24, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-5"
            >
              {step.switch({
                "step-1": () => <Step1CaseIdentification />,
                "step-2": () => <Step2DrugsSeizures />,
                "step-3": () => <Step3WeaponsElements />,
                "step-4": () => <Step4ReviewSubmit onEditSection={goTo} />,
              })}
            </motion.div>
          </AnimatePresence>

          {/* Controles */}
          <div className="mt-6 flex items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={prev} disabled={step.isFirst}>
              Anterior
            </Button>

            {step.isLast ? (
              <Button type="submit">Enviar</Button>
            ) : (
              <Button type="button" onClick={validateAndNext}>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
