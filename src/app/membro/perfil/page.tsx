"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { toastActionError } from "@/lib/action-toast";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Camera, Loader2, Lock } from "lucide-react";
import { formatPoints, cn, memberBannerClass } from "@/lib/utils";
import { MaskedInput } from "@/components/masked-input";
import { AddressFields, type AddressForm } from "@/components/address-fields";
import { uploadImageFile } from "@/components/image-upload-field";
import { MemberAvatar } from "@/components/member-avatar";
import { labelCategory } from "@/lib/labels";
import { formatCnpj, formatPhoneBr, formatCep } from "@/lib/br";

type MeData = {
  user: { name: string | null; email: string };
  profile: {
    id: string;
    empresa: string;
    especialidade: string | null;
    cidade: string | null;
    categoria: string;
    whatsapp: string | null;
    telefone: string | null;
    instagram: string | null;
    linkedin: string | null;
    site: string | null;
    endereco: string | null;
    cep: string | null;
    addressNumber: string | null;
    addressComplement: string | null;
    bairro: string | null;
    youtube: string | null;
    descricao: string | null;
    fotoUrl: string | null;
    capaUrl: string | null;
    cnpj: string | null;
    pontos: number;
    rank: number | null;
    subscription: { status: string } | null;
  };
};

export default function PerfilPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useApiQuery<MeData>(["membro", "me"], "/api/membro/me");
  const [form, setForm] = useState({
    name: "",
    email: "",
    empresa: "",
    especialidade: "",
    whatsapp: "",
    telefone: "",
    instagram: "",
    linkedin: "",
    site: "",
    youtube: "",
    descricao: "",
    fotoUrl: "",
    capaUrl: "",
    cnpj: "",
  });
  const [address, setAddress] = useState<AddressForm>({
    cep: "",
    endereco: "",
    addressNumber: "",
    addressComplement: "",
    bairro: "",
    cidade: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"foto" | "capa" | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const capaRef = useRef<HTMLInputElement>(null);
  const [pwd, setPwd] = useState({
    currentPassword: "",
    password: "",
    confirm: "",
  });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.user.name ?? "",
      email: data.user.email,
      empresa: data.profile.empresa,
      especialidade: data.profile.especialidade ?? "",
      whatsapp: data.profile.whatsapp
        ? formatPhoneBr(data.profile.whatsapp)
        : "",
      telefone: data.profile.telefone
        ? formatPhoneBr(data.profile.telefone)
        : "",
      instagram: data.profile.instagram ?? "",
      linkedin: data.profile.linkedin ?? "",
      site: data.profile.site ?? "",
      youtube: data.profile.youtube ?? "",
      descricao: data.profile.descricao ?? "",
      fotoUrl: data.profile.fotoUrl ?? "",
      capaUrl: data.profile.capaUrl ?? "",
      cnpj: data.profile.cnpj ? formatCnpj(data.profile.cnpj) : "",
    });
    setAddress({
      cep: data.profile.cep ? formatCep(data.profile.cep) : "",
      endereco: data.profile.endereco ?? "",
      addressNumber: data.profile.addressNumber ?? "",
      addressComplement: data.profile.addressComplement ?? "",
      bairro: data.profile.bairro ?? "",
      cidade: data.profile.cidade ?? "",
    });
  }, [data]);

  async function uploadImage(kind: "foto" | "capa", file: File | undefined) {
    if (!file || uploading) return;
    setUploading(kind);
    try {
      const url = await uploadImageFile(
        file,
        kind === "foto" ? "members/fotos" : "members/capas",
      );
      setForm((prev) => ({
        ...prev,
        [kind === "foto" ? "fotoUrl" : "capaUrl"]: url,
      }));
      toast.success(
        kind === "foto"
          ? "Foto enviada. Salve o perfil para publicar."
          : "Capa enviada. Salve o perfil para publicar.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await apiMutate("/api/membro/perfil", {
        method: "PATCH",
        body: JSON.stringify({ ...form, ...address }),
      });
      toast.success("Perfil atualizado.");
      await qc.invalidateQueries({ queryKey: ["membro", "me"] });
      await qc.invalidateQueries({ queryKey: ["membro", "hub"] });
      await qc.invalidateQueries({ queryKey: ["hub-all"] });
    } catch (e) {
      toastActionError(e, "Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  }

  const closePassword = useCallback(() => {
    setPwdOpen(false);
    setPwd({ currentPassword: "", password: "", confirm: "" });
  }, []);

  async function savePassword() {
    if (pwd.password !== pwd.confirm) {
      toast.error("A confirmação não bate com a nova senha.");
      return;
    }
    setSavingPwd(true);
    try {
      await apiMutate("/api/membro/perfil", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: pwd.currentPassword,
          password: pwd.password,
        }),
      });
      toast.success("Senha atualizada. Use a nova senha no próximo acesso.");
      closePassword();
    } catch (e) {
      toastActionError(e, "Não foi possível atualizar a senha.");
    } finally {
      setSavingPwd(false);
    }
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-[760px] space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const blocked = data.profile.subscription?.status === "BLOCKED";
  const displayName = form.name || data.user.name || "Membro";

  return (
    <div className="mx-auto max-w-[760px] space-y-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/membro/membros/${data.profile.id}`}
          className="text-[13px] font-semibold text-muted-foreground no-underline hover:text-foreground"
        >
          Ver como a rede vê você
        </Link>
        <div className="flex items-center gap-2">
          <Badge>{labelCategory(data.profile.categoria)}</Badge>
          <span className="text-sm text-muted-foreground">
            {formatPoints(data.profile.pontos)} pts
            {data.profile.rank ? ` · ${data.profile.rank}º` : ""}
          </span>
        </div>
      </div>

      {blocked && (
        <Card className="space-y-3 border-destructive/40 p-5">
          <Badge variant="destructive">Acesso bloqueado</Badge>
          <p className="text-sm">
            Sua mensalidade está em atraso há mais de 30 dias. Quite as competências
            em aberto para liberar a rede.
          </p>
          <Link href="/membro/financeiro">
            <Button>Ir para o financeiro</Button>
          </Link>
        </Card>
      )}

      <Card className="overflow-hidden rounded-[18px] p-0">
        <div
          className={cn("relative h-[120px]", memberBannerClass(data.profile.categoria))}
          style={
            form.capaUrl
              ? {
                  backgroundImage: `url(${form.capaUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <button
            type="button"
            className="group absolute inset-0 z-1 cursor-pointer border-0 bg-transparent p-0 disabled:cursor-wait"
            aria-label="Alterar capa do perfil"
            disabled={uploading === "capa"}
            onClick={() => capaRef.current?.click()}
          >
            <span className="om-img-scrim" aria-hidden />
            <span
              className="pointer-events-none absolute inset-0 z-2 bg-black/0 transition-colors group-hover:bg-black/30 group-focus-visible:bg-black/30"
              aria-hidden
            />
            <span className="pointer-events-none absolute right-3 top-3 z-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
              {uploading === "capa" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Camera className="h-3.5 w-3.5" aria-hidden />
              )}
              {uploading === "capa" ? "Enviando…" : "Alterar capa"}
            </span>
          </button>
          <div className="absolute -bottom-9 left-7 z-3">
            <button
              type="button"
              className="group relative cursor-pointer rounded-full border-0 bg-transparent p-0 disabled:cursor-wait"
              aria-label="Alterar foto de perfil"
              disabled={uploading === "foto"}
              onClick={() => fotoRef.current?.click()}
            >
              <MemberAvatar
                name={displayName}
                src={form.fotoUrl}
                size="lg"
                className="!h-[92px] !w-[92px] ring-4 ring-card"
              />
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                aria-hidden
              />
              <span className="pointer-events-none absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brasa text-white ring-2 ring-card">
                {uploading === "foto" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Camera className="h-3.5 w-3.5" aria-hidden />
                )}
              </span>
            </button>
          </div>
          <input
            ref={capaRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              void uploadImage("capa", e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <input
            ref={fotoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              void uploadImage("foto", e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <form
          className="flex flex-col gap-[18px] px-7 pb-7 pt-[52px]"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="om-split">
            <div className="flex flex-col gap-1.5">
              <Label>Nome completo</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Empresa</Label>
              <Input
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              />
            </div>
            <MaskedInput
              label="CNPJ"
              mask="cnpj"
              value={form.cnpj}
              onChange={(cnpj) => setForm({ ...form, cnpj })}
            />
            <div className="flex flex-col gap-1.5">
              <Label>Especialidade</Label>
              <Input
                value={form.especialidade}
                onChange={(e) =>
                  setForm({ ...form, especialidade: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Descrição</Label>
            <Textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Vídeo do YouTube</Label>
            <Input
              value={form.youtube}
              onChange={(e) => setForm({ ...form, youtube: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <span className="text-xs text-muted-foreground">
              Cole o link do YouTube. O vídeo aparece no seu perfil para a rede.
            </span>
          </div>

          <div className="om-split">
            <MaskedInput
              label="Telefone"
              mask="phone"
              value={form.telefone}
              onChange={(telefone) => setForm({ ...form, telefone })}
            />
            <MaskedInput
              label="WhatsApp"
              mask="phone"
              value={form.whatsapp}
              onChange={(whatsapp) => setForm({ ...form, whatsapp })}
            />
            <div className="flex flex-col gap-1.5">
              <Label>Instagram</Label>
              <Input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>LinkedIn</Label>
              <Input
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Site</Label>
              <Input
                value={form.site}
                onChange={(e) => setForm({ ...form, site: e.target.value })}
              />
            </div>
          </div>

          <AddressFields value={address} onChange={setAddress} />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPwdOpen(true)}
            >
              <Lock size={18} aria-hidden />
              Alterar senha
            </Button>
            <div className="flex flex-wrap gap-3">
              <Link href={`/membro/membros/${data.profile.id}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="bg-brasa glow-ember" loading={saving}>
                {saving ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <Modal
        open={pwdOpen}
        onClose={closePassword}
        title="Alterar senha"
        description="Confirme a senha atual e defina uma nova para o seu acesso ao Brasamind."
        footer={
          <>
            <Button type="button" variant="outline" onClick={closePassword}>
              Cancelar
            </Button>
            <Button type="submit" form="alterar-senha" loading={savingPwd}>
              {savingPwd ? "Salvando…" : "Salvar nova senha"}
            </Button>
          </>
        }
      >
        <form
          id="alterar-senha"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void savePassword();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pwd-atual">Senha atual</Label>
            <Input
              id="pwd-atual"
              type="password"
              value={pwd.currentPassword}
              onChange={(e) =>
                setPwd({ ...pwd, currentPassword: e.target.value })
              }
              autoComplete="current-password"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pwd-nova">Nova senha</Label>
            <Input
              id="pwd-nova"
              type="password"
              value={pwd.password}
              onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pwd-conf">Confirmar nova senha</Label>
            <Input
              id="pwd-conf"
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
