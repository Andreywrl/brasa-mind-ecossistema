"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      containerClassName="brasa-toaster"
      gutter={10}
      toastOptions={{
        duration: 4200,
        style: {
          background: "hsl(var(--popover))",
          color: "hsl(var(--popover-foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0.75rem",
          boxShadow: "0 12px 32px -16px hsl(20 10% 4% / 0.45)",
          padding: "12px 14px",
          fontSize: "0.875rem",
          fontWeight: 600,
          maxWidth: "min(420px, calc(100vw - 32px))",
        },
        success: {
          iconTheme: {
            primary: "hsl(var(--success))",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "hsl(var(--destructive))",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
