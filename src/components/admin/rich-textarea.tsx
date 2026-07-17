import type { TextareaHTMLAttributes } from "react";

export function RichTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary min-h-[100px] " +
        (props.className ?? "")
      }
    />
  );
}
