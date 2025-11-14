/**
 * Página de detalle de un flujo de trabajo
 * Muestra el flujo y permite gestionar sus etapas
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import apiService from "@/lib/apiService";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/ui/DataTable";
import type { FlujoCompleto, EtapaFlujo } from "@/types/flujosTrabajo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Switch from "@/components/ui/Switch";

export default function FlujoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const flujoId = params.id as string;

  const [flujo, setFlujo] = useState<FlujoCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEtapaForm, setShowEtapaForm] = useState(false);
  const [etapaEditando, setEtapaEditando] = useState<EtapaFlujo | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    orden: 1,
    es_obligatoria: true,
    permite_omision: false,
    inhabilita_siguiente: false,
    tipo_documento_principal_id: "",
    activo: true,
  });

  useEffect(() => {
    cargarFlujo();
  }, [flujoId]);

  const cargarFlujo = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFlujoById(flujoId);
      setFlujo(data);
    } catch (error: any) {
      swalError(error.response?.data?.detail || "Error al cargar flujo");
      router.push("/flujos-trabajo");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? parseInt(value) || 0
        : value === ""
        ? null
        : value,
    });
  };

  const handleCrearEtapa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tipo_documento_principal_id: formData.tipo_documento_principal_id || undefined,
      };
      if (etapaEditando) {
        await apiService.updateEtapa(etapaEditando.id, data);
        await swalSuccess("Etapa actualizada correctamente");
      } else {
        await apiService.createEtapa(flujoId, data);
        await swalSuccess("Etapa creada correctamente");
      }
      setShowEtapaForm(false);
      setEtapaEditando(null);
      resetForm();
      cargarFlujo();
    } catch (error: any) {
      swalError(error.response?.data?.detail || "Error al guardar etapa");
    }
  };

  const handleEditarEtapa = (etapa: EtapaFlujo) => {
    setEtapaEditando(etapa);
    setFormData({
      nombre: etapa.nombre,
      descripcion: etapa.descripcion || "",
      orden: etapa.orden,
      es_obligatoria: etapa.es_obligatoria,
      permite_omision: etapa.permite_omision,
      inhabilita_siguiente: etapa.inhabilita_siguiente,
      tipo_documento_principal_id: etapa.tipo_documento_principal_id || "",
      activo: etapa.activo,
    });
    setShowEtapaForm(true);
  };

  const handleEliminarEtapa = async (etapaId: string) => {
    const confirmed = await swalConfirmDelete("¿Está seguro de eliminar esta etapa? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    try {
      await apiService.deleteEtapa(etapaId);
      await swalSuccess("Etapa eliminada correctamente");
      cargarFlujo();
    } catch (error: any) {
      swalError(error.response?.data?.detail || "Error al eliminar etapa");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      orden: (flujo?.etapas?.length || 0) + 1,
      es_obligatoria: true,
      permite_omision: false,
      inhabilita_siguiente: false,
      tipo_documento_principal_id: "",
      activo: true,
    });
  };

  if (loading || !flujo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{flujo.nombre}</h1>
            {flujo.es_predeterminado && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                Predeterminado
              </span>
            )}
          </div>
          <Button variant="secondary" onClick={() => router.push("/flujos-trabajo")}>
            ← Volver
          </Button>
        </div>

        {flujo.descripcion && (
          <p className="text-gray-600 mb-6">{flujo.descripcion}</p>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Etapas del Flujo</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                resetForm();
                setEtapaEditando(null);
                setShowEtapaForm(true);
              }}
            >
              + Agregar Etapa
            </Button>
          </div>

          {flujo.etapas && flujo.etapas.length > 0 ? (
            <EtapasTable
              data={[...flujo.etapas].sort((a, b) => a.orden - b.orden)}
              onEdit={handleEditarEtapa}
              onDelete={handleEliminarEtapa}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No hay etapas configuradas. Agrega la primera etapa.</p>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Etapa */}
      <Modal open={showEtapaForm} onClose={() => setShowEtapaForm(false)} title={etapaEditando ? "Editar Etapa" : "Nueva Etapa"}>
        <form onSubmit={handleCrearEtapa} className="space-y-4">
          <Input label="Nombre de la Etapa" name="nombre" value={formData.nombre} onChange={handleChange} required />
          <Input label="Orden" name="orden" type="number" value={formData.orden.toString()} onChange={handleChange} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex gap-6 flex-wrap">
            <Switch
              label="Obligatoria"
              checked={!!formData.es_obligatoria}
              onChange={(checked) => setFormData((prev) => ({ ...prev, es_obligatoria: checked }))}
            />
            <Switch
              label="Permite omisión"
              checked={!!formData.permite_omision}
              onChange={(checked) => setFormData((prev) => ({ ...prev, permite_omision: checked }))}
            />
            <Switch
              label="Bloquea siguiente"
              checked={!!formData.inhabilita_siguiente}
              onChange={(checked) => setFormData((prev) => ({ ...prev, inhabilita_siguiente: checked }))}
            />
            <Switch
              label="Activa"
              checked={!!formData.activo}
              onChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowEtapaForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {etapaEditando ? "Guardar cambios" : "Crear etapa"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function EtapasTable({ data, onEdit, onDelete }: { data: EtapaFlujo[]; onEdit: (row: EtapaFlujo) => void; onDelete: (id: string) => void }) {
  const columns: ColumnDef<EtapaFlujo>[] = [
    { header: "Orden", accessorKey: "orden", cell: (info) => <span className="text-sm text-gray-900">{info.getValue() as number}</span> },
    { header: "Nombre", accessorKey: "nombre", cell: (info) => <span className="text-sm text-gray-900">{info.getValue() as string}</span> },
    {
      header: "Estado",
      id: "estado",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
          {!row.original.activo && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Inactiva</span>}
          {row.original.es_obligatoria && <span className="bg-red-100 text-red-600 px-2 py-1 rounded">Obligatoria</span>}
          {row.original.inhabilita_siguiente && <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded">Bloquea siguiente</span>}
        </div>
      ),
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
  return <DataTable columns={columns} data={data} emptyText="Sin etapas" />;
}

