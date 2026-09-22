"use client";

import { useEffect, useState } from "react";
import { apiMutate, useApiQuery } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { formatPoints } from "@/lib/utils";
import { MaskedInput } from "@/components/masked-input";
import { AddressFields, type AddressForm } from "@/components/address-fields";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  formatCnpj,
  formatPhoneBr,
  formatCep,
} from "@/lib/br";

type MeData = {
  user: { name: string | null; email: string };
  profile: {
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
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

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

  async function save() {
    setError("");
    setMsg("");
    try {
      await apiMutate("/api/membro/perfil", {
        method: "PATCH",
        body: JSON.stringify({ ...form, ...address }),
      });
      setMsg("Perfil atualizado.");
      await qc.invalidateQueries({ queryKey: ["membro", "me"] });
      await qc.invalidateQueries({ queryKey: ["membro", "hub"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const blocked = data.profile.subscription?.status === "BLOCKED";

  return (
    <div className="space-y-6 max-w-3xl">
      {blocked && (
        <Card className="p-5 border-destructive/40 space-y-3">
          <Badge variant="destructive">Acesso bloqueado</Badge>
          <p className="text-sm">
            Sua mensalidade está em atraso há mais de 30 dias. Quite as competências
            em aberto para liberar a rede.
          </p>
          <a href="/membro/financeiro">
            <Button>Ir para o financeiro</Button>
          </a>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Meu perfil</h1>
          <p className="text-muted-foreground text-sm">
            {formatPoints(data.profile.pontos)} pts
            {data.profile.rank ? ` · ${data.profile.rank}º no ranking` : ""}
          </p>
        </div>
        <Badge>{data.profile.categoria}</Badge>
      </div>

      <Card className="p-6 grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Nome</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>E-mail</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Empresa</Label>
          <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
        </div>
        <MaskedInput
          label="CNPJ"
          mask="cnpj"
          value={form.cnpj}
          onChange={(cnpj) => setForm({ ...form, cnpj })}
        />
        <div className="space-y-1">
          <Label>Especialidade</Label>
          <Input value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} />
        </div>
        <MaskedInput
          label="WhatsApp"
          mask="phone"
          value={form.whatsapp}
          onChange={(whatsapp) => setForm({ ...form, whatsapp })}
        />
        <MaskedInput
          label="Telefone"
          mask="phone"
          value={form.telefone}
          onChange={(telefone) => setForm({ ...form, telefone })}
        />
        <div className="space-y-1">
          <Label>Instagram</Label>
          <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>LinkedIn</Label>
          <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Site</Label>
          <Input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <AddressFields value={address} onChange={setAddress} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>YouTube</Label>
          <Input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
        </div>
        <ImageUploadField
          label="Foto"
          value={form.fotoUrl}
          onChange={(fotoUrl) => setForm({ ...form, fotoUrl })}
          folder="members/fotos"
        />
        <ImageUploadField
          label="Capa"
          value={form.capaUrl}
          onChange={(capaUrl) => setForm({ ...form, capaUrl })}
          folder="members/capas"
        />
        <div className="sm:col-span-2 space-y-1">
          <Label>Descrição</Label>
          <Textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>
        {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}
        {msg && <p className="sm:col-span-2 text-sm text-success">{msg}</p>}
        <div className="sm:col-span-2">
          <Button onClick={save}>Salvar alterações</Button>
        </div>
      </Card>
    </div>
  );
}
