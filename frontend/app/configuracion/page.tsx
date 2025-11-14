/**
 * Configuración - Tabs
 * General, Flujos, Áreas, Documentos y Tipos de Documento
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import FlujosTrabajoPage from "@/app/flujos-trabajo/page";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import apiService from "@/lib/apiService";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import { ColumnDef } from "@tanstack/react-table";

type ConfigTab = "general" | "flujos" | "areas" | "documentos" | "tipos_documento";

export default function ConfiguracionPage() {
  const router = useRouter();
  const { loading } = useUser();
  const [activeTab, setActiveTab] = useState<ConfigTab>("general");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !loading) {
      router.push("/login");
    }
  }, [router, loading]);

  const TabButton = ({ id, label }: { id: ConfigTab; label: string }) => (
    <button
      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        activeTab === id
          ? "border-primary-500 text-primary-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Configuración</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <nav className="-mb-px flex gap-6" aria-label="Tabs">
            <TabButton id="general" label="General" />
            <TabButton id="flujos" label="Flujos" />
            <TabButton id="areas" label="Áreas" />
            <TabButton id="documentos" label="Documentos" />
            <TabButton id="tipos_documento" label="Tipos de Documento" />
          </nav>
        </div>

        {/* Content */}
        {activeTab === "general" && <GeneralTab />}

        {activeTab === "flujos" && (
          <div className="bg-white rounded-lg shadow p-2">
            <FlujosTrabajoPage />
          </div>
        )}

        {activeTab === "areas" && <AreasTab />}

        {activeTab === "documentos" && <DocumentosTab />}

        {activeTab === "tipos_documento" && <TiposDocumentoTab />}
      </div>
    </div>
  );
}

function GeneralTab() {
  const { activeEmpresa, user, refresh } = useUser();
  const [form, setForm] = useState({
    nombre: "",
    alias: "",
    dominio: "",
    logo_url: "",
    color_principal: "",
    color_secundario: "",
    color_terciario: "",
    activo: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    if (!activeEmpresa) {
      setForm({
        nombre: "",
        alias: "",
        dominio: "",
        logo_url: "",
        color_principal: "",
        color_secundario: "",
        color_terciario: "",
        activo: true,
      });
      setLoading(false);
      return;
    }

    const loadEmpresa = async () => {
      try {
        setLoading(true);
        const data = await apiService.empresa.getEmpresaById(activeEmpresa.id);
        setForm({
          nombre: data.nombre || "",
          alias: data.alias || "",
          dominio: data.dominio || "",
          logo_url: data.logo_url || "",
          color_principal: data.color_principal || "",
          color_secundario: data.color_secundario || "",
          color_terciario: data.color_terciario || "",
          activo: data.activo ?? true,
        });
        setLogoPreview(data.logo_url || "");
      } catch (e: any) {
        swalError(e.response?.data?.detail || "Error al cargar la empresa");
      } finally {
        setLoading(false);
      }
    };

    loadEmpresa();
  }, [activeEmpresa]);

  const gradientPreview = useMemo(() => {
    const primary = form.color_principal || activeEmpresa?.color_principal || "#0A2E5C";
    const secondary = form.color_secundario || activeEmpresa?.color_secundario || "#2b4f83";
    const tertiary = form.color_terciario || activeEmpresa?.color_terciario || "#3098cb";
    return {
      backgroundImage: `linear-gradient(90deg, ${primary} 0%, ${secondary} 50%, ${tertiary} 100%)`,
    };
  }, [form.color_principal, form.color_secundario, form.color_terciario, activeEmpresa]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleColorChange = (name: "color_principal" | "color_secundario" | "color_terciario", value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setLogoPreview(e.target.value || "");
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      swalError("Selecciona un archivo de imagen válido (PNG, JPG, SVG, etc.)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setForm((prev) => ({ ...prev, logo_url: result }));
        setLogoPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setForm((prev) => ({ ...prev, logo_url: "" }));
    setLogoPreview("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmpresa) return;
    try {
      setSaving(true);
      await apiService.empresa.updateEmpresa(activeEmpresa.id, form);
      await swalSuccess("Empresa actualizada correctamente");
      await refresh();
    } catch (error: any) {
      swalError(error.response?.data?.detail || "Error al actualizar la empresa");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Datos de la empresa</h2>
        <p className="text-sm text-gray-500">
          Gestiona la identidad visual y la información básica de la empresa con la que estás operando.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando empresa...</p>
      ) : activeEmpresa ? (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre" name="nombre" value={form.nombre} onChange={onChange} required />
            <Input label="Alias" name="alias" value={form.alias || ""} onChange={onChange} />
            <Input label="Dominio" name="dominio" value={form.dominio || ""} onChange={onChange} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="logo_url"
                  value={form.logo_url || ""}
                  onChange={handleLogoUrlChange}
                  placeholder="https://..."
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                  Cargar
                </label>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={clearLogo}
                    className="rounded-md border border-transparent bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    Quitar
                  </button>
                )}
              </div>
              {logoPreview ? (
                <div className="mt-2 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="Logo preview" className="h-12 w-12 rounded object-contain" />
                  <p className="text-xs text-gray-500">Vista previa del logo</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Puedes pegar una URL pública o seleccionar un archivo de imagen (se enviará como base64).
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Color principal</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color_principal || "#0A2E5C"}
                  onChange={(e) => handleColorChange("color_principal", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  name="color_principal"
                  value={form.color_principal || ""}
                  onChange={onChange}
                  placeholder="#0A2E5C"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Color secundario</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color_secundario || "#2b4f83"}
                  onChange={(e) => handleColorChange("color_secundario", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  name="color_secundario"
                  value={form.color_secundario || ""}
                  onChange={onChange}
                  placeholder="#2b4f83"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Color terciario</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color_terciario || "#3098cb"}
                  onChange={(e) => handleColorChange("color_terciario", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  name="color_terciario"
                  value={form.color_terciario || ""}
                  onChange={onChange}
                  placeholder="#3098cb"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Vista previa del degradado</p>
            <div className="h-16 rounded-md shadow-inner border border-gray-100" style={gradientPreview}></div>
          </div>

          <Switch
            label="Empresa activa"
            checked={form.activo}
            onChange={(checked) => setForm((prev) => ({ ...prev, activo: checked }))}
          />

          <div className="flex justify-end gap-3">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-gray-500">No tienes una empresa activa asociada.</p>
      )}
    </div>
  );
}

function AreasTab() {
  const { user } = useUser();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", codigo: "", activo: true });

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAreas();
      setItems(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al cargar áreas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", codigo: "", activo: true });
    setModalOpen(true);
  };

  const openEdit = (area: any) => {
    setEditing(area);
    setForm({
      nombre: area.nombre || "",
      descripcion: area.descripcion || "",
      codigo: area.codigo || "",
      activo: !!area.activo,
    });
    setModalOpen(true);
  };

  const changeForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiService.updateArea(editing.id, form as any);
        await swalSuccess("Área actualizada");
      } else {
        await apiService.createArea(form as any);
        await swalSuccess("Área creada");
      }
      setModalOpen(false);
      loadItems();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al guardar área");
    }
  };

  const deleteItem = async (id: string) => {
    const confirmed = await swalConfirmDelete("¿Está seguro de eliminar esta área? Esta acción no se puede deshacer.");
    if (!confirmed) return;
    try {
      await apiService.deleteArea(id);
      await swalSuccess("Área eliminada");
      loadItems();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al eliminar área");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Áreas</h2>
          <p className="text-sm text-gray-500">Gestiona las áreas responsables dentro de la empresa.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>Nueva área</Button>
      </div>
      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <AreasTable data={items} onEdit={openEdit} onDelete={deleteItem} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar área" : "Nueva área"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={changeForm} required />
          <Input label="Código" name="codigo" value={form.codigo || ""} onChange={changeForm} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion || ""}
              onChange={changeForm}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <Switch
            label="Activo"
            checked={!!form.activo}
            onChange={(checked) => setForm((prev) => ({ ...prev, activo: checked }))}
          />
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AreasTable({ data, onEdit, onDelete }: { data: any[]; onEdit: (row: any) => void; onDelete: (id: string) => void }) {
  const columns: ColumnDef<any>[] = [
    {
      header: "Nombre",
      accessorKey: "nombre",
      cell: (info) => <span className="text-sm text-gray-900">{info.getValue() as string}</span>,
    },
    {
      header: "Código",
      accessorKey: "codigo",
      cell: (info) => <span className="text-sm text-gray-600">{(info.getValue() as string) || "-"}</span>,
    },
    {
      header: "Activo",
      accessorKey: "activo",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ? "Sí" : "No"}</span>,
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={() => onEdit(row.original)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(row.original.id)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} emptyText="No hay áreas registradas" />;
}

function DocumentosTab() {
  const router = useRouter();
  const [siniestroId, setSiniestroId] = useState("");
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    nombre_archivo: "",
    ruta_archivo: "",
    descripcion: "",
    version: 1,
    es_principal: false,
    es_adicional: false,
    activo: true,
  });

  const loadDocumentos = async () => {
    const objetivo = siniestroId.trim();
    if (!objetivo) {
      setDocumentos([]);
      return;
    }
    try {
      setLoading(true);
      const data = await apiService.getDocumentosSiniestro(objetivo, { limit: 200 });
      setDocumentos(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      nombre_archivo: "",
      ruta_archivo: "",
      descripcion: "",
      version: 1,
      es_principal: false,
      es_adicional: false,
      activo: true,
    });
    setModalOpen(true);
  };

  const openEdit = (documento: any) => {
    setEditing(documento);
    setForm({
      nombre_archivo: documento.nombre_archivo || "",
      ruta_archivo: documento.ruta_archivo || "",
      descripcion: documento.descripcion || "",
      version: documento.version || 1,
      es_principal: !!documento.es_principal,
      es_adicional: !!documento.es_adicional,
      activo: !!documento.activo,
    });
    setModalOpen(true);
  };

  const changeForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const objetivo = siniestroId.trim();
    if (!objetivo) {
      swalError("Debes indicar un siniestro para gestionar documentos");
      return;
    }
    try {
      if (editing) {
        await apiService.updateDocumento(editing.id, {
          nombre_archivo: form.nombre_archivo,
          descripcion: form.descripcion,
          es_principal: form.es_principal,
          es_adicional: form.es_adicional,
          activo: form.activo,
        });
        await swalSuccess("Documento actualizado");
      } else {
        await apiService.createDocumento({
          siniestro_id: objetivo,
          nombre_archivo: form.nombre_archivo,
          ruta_archivo: form.ruta_archivo,
          descripcion: form.descripcion,
          version: Number(form.version) || 1,
          es_principal: form.es_principal,
          es_adicional: form.es_adicional,
          activo: form.activo,
        });
        await swalSuccess("Documento creado");
      }
      setModalOpen(false);
      loadDocumentos();
    } catch (e: any) {
      swalError(e.response?.data?.detail || "Error al guardar documento");
    }
  };

  const deleteDocumento = async (id: string) => {
    const confirmed = await swalConfirmDelete("¿Eliminar documento? Esta acción no se puede deshacer.");
    if (!confirmed) return;
    try {
      await apiService.deleteDocumento(id);
      await swalSuccess("Documento eliminado");
      loadDocumentos();
    } catch (e: any) {
      swalError(e.response?.data?.detail || "Error al eliminar documento");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Documentos</h2>
          <p className="text-sm text-gray-500">
            Administra los documentos asociados a un siniestro específico.
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            label="ID de siniestro"
            name="siniestro_id"
            value={siniestroId}
            onChange={(e) => {
              const value = e.target.value;
              setSiniestroId(value);
              if (!value.trim()) {
                setDocumentos([]);
              }
            }}
          />
          <Button variant="secondary" onClick={loadDocumentos}>
            Buscar
          </Button>
        </div>
      </div>

      {siniestroId && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {documentos.length} documento(s) encontrados.
          </p>
          <Button variant="primary" onClick={openCreate}>
            Nuevo documento
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando documentos...</p>
      ) : documentos.length > 0 ? (
        <DocumentosTable data={documentos} onEdit={openEdit} onDelete={deleteDocumento} />
      ) : siniestroId ? (
        <p className="text-gray-500">No hay documentos para el siniestro indicado.</p>
      ) : (
        <p className="text-gray-500">Ingresa un siniestro para consultar documentos.</p>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar documento" : "Nuevo documento"}
      >
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Nombre del archivo"
            name="nombre_archivo"
            value={form.nombre_archivo}
            onChange={changeForm}
            required
          />
          <Input
            label="Ruta del archivo"
            name="ruta_archivo"
            value={form.ruta_archivo}
            onChange={changeForm}
            required={!editing}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion || ""}
              onChange={changeForm}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <Input
            label="Versión"
            name="version"
            type="number"
            value={String(form.version)}
            onChange={changeForm}
          />
          <div className="flex items-center gap-4">
            <Switch
              label="Principal"
              checked={form.es_principal}
              onChange={(checked) => setForm((prev) => ({ ...prev, es_principal: checked }))}
            />
            <Switch
              label="Adicional"
              checked={form.es_adicional}
              onChange={(checked) => setForm((prev) => ({ ...prev, es_adicional: checked }))}
            />
            <Switch
              label="Activo"
              checked={form.activo}
              onChange={(checked) => setForm((prev) => ({ ...prev, activo: checked }))}
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function DocumentosTable({ data, onEdit, onDelete }: { data: any[]; onEdit: (row: any) => void; onDelete: (id: string) => void }) {
  const columns: ColumnDef<any>[] = [
    {
      header: "Nombre",
      accessorKey: "nombre_archivo",
      cell: (info) => <span className="text-sm text-gray-900">{info.getValue() as string}</span>,
    },
    {
      header: "Descripción",
      accessorKey: "descripcion",
      cell: (info) => <span className="text-sm text-gray-600 line-clamp-2">{(info.getValue() as string) || "-"}</span>,
    },
    {
      header: "Versión",
      accessorKey: "version",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() as number}</span>,
    },
    {
      header: "Principal",
      accessorKey: "es_principal",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ? "Sí" : "No"}</span>,
    },
    {
      header: "Activo",
      accessorKey: "activo",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ? "Sí" : "No"}</span>,
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={() => onEdit(row.original)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(row.original.id)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} emptyText="No hay documentos disponibles" />;
}

function TiposDocumentoTab() {
  const { user } = useUser();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    area_id: "",
    activo: true,
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTiposDocumento();
      setItems(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al cargar tipos de documento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", area_id: "", activo: true });
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      nombre: item.nombre || "",
      descripcion: item.descripcion || "",
      area_id: item.area_id || "",
      activo: !!item.activo,
    });
    setModalOpen(true);
  };

  const changeForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiService.updateTipoDocumento(editing.id, form);
        await swalSuccess("Tipo de documento actualizado");
      } else {
        await apiService.createTipoDocumento(form);
        await swalSuccess("Tipo de documento creado");
      }
      setModalOpen(false);
      loadItems();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al guardar");
    }
  };

  const deleteTipoDocumento = async (id: string) => {
    const confirmed = await swalConfirmDelete("¿Eliminar tipo de documento? Esta acción no se puede deshacer.");
    if (!confirmed) return;
    try {
      await apiService.deleteTipoDocumento(id);
      await swalSuccess("Tipo de documento eliminado");
      loadItems();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al eliminar");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tipos de documento</h2>
          <p className="text-sm text-gray-500">Define los tipos de documentos disponibles para los siniestros.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>Nuevo tipo</Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando tipos de documento...</p>
      ) : (
        <TiposDocumentoTable data={items} onEdit={openEdit} onDelete={deleteTipoDocumento} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar tipo de documento" : "Nuevo tipo de documento"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={changeForm} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion || ""}
              onChange={changeForm}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <Switch
            label="Activo"
            checked={!!form.activo}
            onChange={(checked) => setForm((prev) => ({ ...prev, activo: checked }))}
          />
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TiposDocumentoTable({ data, onEdit, onDelete }: { data: any[]; onEdit: (row: any) => void; onDelete: (id: string) => void }) {
  const columns: ColumnDef<any>[] = [
    {
      header: "Nombre",
      accessorKey: "nombre",
      cell: (info) => <span className="text-sm text-gray-900">{info.getValue() as string}</span>,
    },
    {
      header: "Descripción",
      accessorKey: "descripcion",
      cell: (info) => <span className="text-sm text-gray-600">{(info.getValue() as string) || "-"}</span>,
    },
    {
      header: "Activo",
      accessorKey: "activo",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() ? "Sí" : "No"}</span>,
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={() => onEdit(row.original)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(row.original.id)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} emptyText="No hay tipos de documento registrados" />;
}
