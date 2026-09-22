"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui", padding: 40 }}>
        <h1>Algo deu errado</h1>
        <p>Tente de novo. Se o problema continuar, fale com o suporte do Brasa.</p>
        <button type="button" onClick={() => reset()}>
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
