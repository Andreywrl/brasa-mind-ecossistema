import toast from "react-hot-toast";

export function toastActionError(
  e: unknown,
  fallback = "Não foi possível concluir.",
) {
  toast.error(e instanceof Error ? e.message : fallback);
}
