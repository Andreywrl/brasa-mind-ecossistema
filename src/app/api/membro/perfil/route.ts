import { jsonError, jsonOk, requireMember } from "@/lib/api";
import { prisma } from "@/lib/db";
import { onlyDigits, profilePatchSchema, zodErrorMessage } from "@/lib/br";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const result = await requireMember();
  if (!result.ok) return result.error;
  const { profile, session } = result;
  if (!profile) return jsonError("Perfil não encontrado", 404);

  const parsed = profilePatchSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error));
  const body = parsed.data;

  if (body.password) {
    if (!body.currentPassword) return jsonError("Informe a senha atual");
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.passwordHash) return jsonError("Conta sem senha local");
    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) return jsonError("Senha atual incorreta");
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: await bcrypt.hash(body.password, 10) },
    });
  }

  if (body.name || body.email) {
    if (body.email && body.email !== session.user.email) {
      const taken = await prisma.user.findUnique({ where: { email: body.email } });
      if (taken) return jsonError("E-mail já em uso");
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name ?? undefined,
        email: body.email ?? undefined,
      },
    });
  }

  const updated = await prisma.memberProfile.update({
    where: { id: profile.id },
    data: {
      empresa: body.empresa ?? undefined,
      especialidade: body.especialidade ?? undefined,
      cidade: body.cidade ?? undefined,
      whatsapp: body.whatsapp ? onlyDigits(body.whatsapp) : body.whatsapp === "" ? null : undefined,
      telefone: body.telefone ? onlyDigits(body.telefone) : body.telefone === "" ? null : undefined,
      instagram: body.instagram ?? undefined,
      linkedin: body.linkedin ?? undefined,
      site: body.site ?? undefined,
      endereco: body.endereco ?? undefined,
      cep: body.cep ? onlyDigits(body.cep) : body.cep === "" ? null : undefined,
      addressNumber: body.addressNumber ?? undefined,
      addressComplement: body.addressComplement ?? undefined,
      bairro: body.bairro ?? undefined,
      youtube: body.youtube ?? undefined,
      descricao: body.descricao ?? undefined,
      fotoUrl: body.fotoUrl ?? undefined,
      capaUrl: body.capaUrl ?? undefined,
      cnpj: body.cnpj ? onlyDigits(body.cnpj) : body.cnpj === "" ? null : undefined,
    },
  });

  return jsonOk({ profile: updated });
}
