import { Check } from "lucide-react";
import { TASK_STATUS_META, TASK_FLOW } from "@/lib/tasks";
import type { TaskStatus } from "@/lib/types";

export function TaskBadge({ status }: { status: TaskStatus }) {
  const meta = TASK_STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${meta.color}22`, color: meta.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

/** Horizontal progress timeline across the task workflow. */
export function TaskTimeline({ status }: { status: TaskStatus }) {
  const currentStep = TASK_STATUS_META[status].step;
  return (
    <div className="flex items-center">
      {TASK_FLOW.map((s, i) => {
        const meta = TASK_STATUS_META[s];
        const done = meta.step <= currentStep;
        const active = meta.step === currentStep;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full grid place-items-center text-xs font-bold transition-colors"
                style={{
                  background: done ? meta.color : "rgba(255,255,255,0.06)",
                  color: done ? "#0a0a1a" : "#6b7280",
                  boxShadow: active ? `0 0 0 4px ${meta.color}33` : "none",
                }}
              >
                {done ? <Check size={15} /> : i + 1}
              </div>
              <span
                className="text-[10px] text-center whitespace-nowrap"
                style={{ color: done ? "#e5e7eb" : "#6b7280" }}
              >
                {meta.label}
              </span>
            </div>
            {i < TASK_FLOW.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-1 -mt-5 rounded"
                style={{ background: meta.step < currentStep ? meta.color : "rgba(255,255,255,0.08)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
