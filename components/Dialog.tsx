"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Icon } from "./Icon";

export type DialogHandle = { open: () => void; close: () => void };

interface Props {
  title: string;
  children: React.ReactNode;
}

export const Dialog = forwardRef<DialogHandle, Props>(function Dialog({ title, children }, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  return (
    <dialog
      ref={dialogRef}
      className="rounded-xl outline-none backdrop:bg-black/50"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        color: "var(--text)",
        maxWidth: "480px",
        width: "calc(100% - 2rem)",
        padding: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--card-border)" }}
      >
        <h2 className="font-semibold text-base">{title}</h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <Icon name="x" size={18} />
        </button>
      </div>
      {children}
    </dialog>
  );
});
