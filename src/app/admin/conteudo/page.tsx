"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Star,
  HelpCircle,
  Phone,
} from "lucide-react";

export default function AdminContentPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Conteúdo da Landing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edite textos da landing page, depoimentos, FAQ e contatos.
        </p>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="cta">CTA final</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="testimonials">
            Depoimentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroEditor />
        </TabsContent>
        <TabsContent value="cta">
          <CtaEditor />
        </TabsContent>
        <TabsContent value="contact">
          <ContactEditor />
        </TabsContent>
        <TabsContent value="faq">
          <FaqEditor />
        </TabsContent>
        <TabsContent value="testimonials">
          <TestimonialsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function useContent() {
  const { data, loading, error, refetch } = useApi<{ content: any }>(
    "/api/admin/content"
  );
  return { content: data?.content || {}, loading, error, refetch };
}

async function patchSection(section: string, content: any) {
  await apiFetch("/api/admin/content", {
    method: "PATCH",
    json: { section, content },
  });
}

function HeroEditor() {
  const { content, loading, refetch } = useContent();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content.hero) setForm(content.hero);
  }, [content]);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      await patchSection("hero", form);
      toast.success("Seção Hero salva.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <Card className="p-4">Carregando...</Card>;
  }

  return (
    <Card className="p-5 space-y-4 max-w-2xl">
      <h3 className="font-bold">Seção Hero</h3>
      <div>
        <Label>Título principal</Label>
        <Textarea
          rows={2}
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <Label>Subtítulo</Label>
        <Textarea
          rows={3}
          value={form.subtitle || ""}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>CTA principal</Label>
          <Input
            value={form.primary_cta || ""}
            onChange={(e) =>
              setForm({ ...form, primary_cta: e.target.value })
            }
          />
        </div>
        <div>
          <Label>CTA secundário</Label>
          <Input
            value={form.secondary_cta || ""}
            onChange={(e) =>
              setForm({ ...form, secondary_cta: e.target.value })
            }
          />
        </div>
      </div>
      <Button
        onClick={save}
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
      >
        <Save className="h-4 w-4" />
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </Card>
  );
}

function CtaEditor() {
  const { content, loading, refetch } = useContent();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content.cta_final) setForm(content.cta_final);
  }, [content]);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      await patchSection("cta_final", form);
      toast.success("CTA final salvo.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <Card className="p-4">Carregando...</Card>;
  }

  return (
    <Card className="p-5 space-y-4 max-w-2xl">
      <h3 className="font-bold">CTA final</h3>
      <div>
        <Label>Título</Label>
        <Textarea
          rows={2}
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <Label>Subtítulo</Label>
        <Textarea
          rows={2}
          value={form.subtitle || ""}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
      </div>
      <div>
        <Label>Botão (texto)</Label>
        <Input
          value={form.button || ""}
          onChange={(e) => setForm({ ...form, button: e.target.value })}
        />
      </div>
      <Button
        onClick={save}
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
      >
        <Save className="h-4 w-4" />
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </Card>
  );
}

function ContactEditor() {
  const { content, loading, refetch } = useContent();
  const [form, setForm] = useState<any>({
    whatsapp: "",
    email: "",
    instagram: "",
    facebook: "",
    linkedin: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content.contact) setForm(content.contact);
  }, [content]);

  async function save() {
    setSaving(true);
    try {
      await patchSection("contact", form);
      toast.success("Contato salvo.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 space-y-4 max-w-2xl">
      <h3 className="font-bold flex items-center gap-2">
        <Phone className="h-4 w-4" /> Contato & Redes
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>WhatsApp (com DDI)</Label>
          <Input
            value={form.whatsapp || ""}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="5511999999999"
          />
        </div>
        <div>
          <Label>E-mail de contato</Label>
          <Input
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label>Instagram</Label>
          <Input
            value={form.instagram || ""}
            onChange={(e) =>
              setForm({ ...form, instagram: e.target.value })
            }
            placeholder="https://instagram.com/..."
          />
        </div>
        <div>
          <Label>Facebook</Label>
          <Input
            value={form.facebook || ""}
            onChange={(e) =>
              setForm({ ...form, facebook: e.target.value })
            }
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <Label>LinkedIn</Label>
          <Input
            value={form.linkedin || ""}
            onChange={(e) =>
              setForm({ ...form, linkedin: e.target.value })
            }
            placeholder="https://linkedin.com/company/..."
          />
        </div>
      </div>
      {loading && (
        <p className="text-xs text-muted-foreground">Carregando dados...</p>
      )}
      <Button
        onClick={save}
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
      >
        <Save className="h-4 w-4" />
        {saving ? "Salvando..." : "Salvar"}
      </Button>
    </Card>
  );
}

function FaqEditor() {
  const { content, loading, refetch } = useContent();
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(content.faq)) setItems(content.faq);
    else if (content.faq && Array.isArray((content.faq as any).items))
      setItems((content.faq as any).items);
  }, [content]);

  async function save() {
    setSaving(true);
    try {
      await patchSection("faq", { items });
      toast.success("FAQ salvo.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setSaving(false);
    }
  }

  if (loading && items.length === 0) {
    return <Card className="p-4">Carregando...</Card>;
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <HelpCircle className="h-4 w-4" /> Perguntas frequentes
        </h3>
        <Button
          onClick={() => setItems([...items, { q: "", a: "" }])}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                #{i + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-7 w-7"
                onClick={() =>
                  setItems(items.filter((_, j) => j !== i))
                }
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </Button>
            </div>
            <Input
              placeholder="Pergunta"
              value={it.q || ""}
              onChange={(e) => {
                const n = [...items];
                n[i] = { ...n[i], q: e.target.value };
                setItems(n);
              }}
            />
            <Textarea
              rows={2}
              placeholder="Resposta"
              value={it.a || ""}
              onChange={(e) => {
                const n = [...items];
                n[i] = { ...n[i], a: e.target.value };
                setItems(n);
              }}
            />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma pergunta. Clique em "Nova".
          </p>
        )}
      </div>
      <Button
        onClick={save}
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
      >
        <Save className="h-4 w-4" />
        {saving ? "Salvando..." : "Salvar FAQ"}
      </Button>
    </Card>
  );
}

type Testimonial = {
  id: string;
  name: string;
  company?: string | null;
  role?: string | null;
  content: string;
  rating: number;
  avatar?: string | null;
  active: boolean;
  order: number;
};

function TestimonialsManager() {
  const { data, loading, error, refetch } = useApi<{
    testimonials: Testimonial[];
  }>("/api/admin/testimonials");
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const testimonials = data?.testimonials || [];

  async function remove(t: Testimonial) {
    try {
      await apiFetch(`/api/admin/testimonials/${t.id}`, {
        method: "DELETE",
      });
      toast.success("Depoimento removido.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" /> Depoimentos
        </h3>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900">
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Depoimento</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Nenhum depoimento.
                </TableCell>
              </TableRow>
            ) : (
              testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-sm">{t.company || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md line-clamp-2">
                    {t.content}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < t.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.active ? "default" : "secondary"}>
                      {t.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{t.order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(t)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {createOpen && (
        <TestimonialFormDialog
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            refetch();
          }}
        />
      )}

      {editTarget && (
        <TestimonialFormDialog
          testimonial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            refetch();
          }}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir depoimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir depoimento de{" "}
              <strong>{deleteTarget?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && remove(deleteTarget)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function TestimonialFormDialog({
  testimonial,
  onClose,
  onSaved,
}: {
  testimonial?: Testimonial;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: testimonial?.name || "",
    company: testimonial?.company || "",
    role: testimonial?.role || "",
    content: testimonial?.content || "",
    rating: testimonial?.rating ?? 5,
    order: testimonial?.order ?? 0,
    active: testimonial?.active ?? true,
  });

  async function save() {
    if (!form.name || !form.content) {
      toast.error("Preencha nome e depoimento.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        ...form,
        rating: Number(form.rating),
        order: Number(form.order),
      };
      if (testimonial) {
        await apiFetch(`/api/admin/testimonials/${testimonial.id}`, {
          method: "PATCH",
          json: payload,
        });
        toast.success("Depoimento atualizado!");
      } else {
        await apiFetch(`/api/admin/testimonials`, {
          method: "POST",
          json: payload,
        });
        toast.success("Depoimento criado!");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {testimonial ? "Editar depoimento" : "Novo depoimento"}
          </DialogTitle>
          <DialogDescription>
            Depoimentos aparecem na landing page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Empresa</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Depoimento *</Label>
            <Textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Nota (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Ordem</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="h-4 w-4 rounded"
                />
                Ativo
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
