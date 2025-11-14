/**
 * Página de detalle de Siniestro
 * Muestra información completa del siniestro con pestañas para:
 * - Información General
 * - Etapas del Flujo
 * - Documentos (pendiente)
 * - Bitácora (pendiente)
 * - Evidencias (pendiente)
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import apiService from "@/lib/apiService";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import Switch from "@/components/ui/Switch";
import CustomSelect, { SelectOption } from "@/components/ui/Select";
import { swalSuccess, swalError, swalConfirmDelete } from "@/lib/swal";
import { ColumnDef } from "@tanstack/react-table";
import { Siniestro } from "@/types/siniestros";
import { SiniestroEtapa } from "@/types/flujosTrabajo";
import { BitacoraActividad } from "@/types/bitacora";
import { Documento } from "@/types/documentos";
import { EvidenciaFotografica } from "@/types/evidencias";
import { SiniestroUsuario, SiniestroArea } from "@/types/siniestrosRelaciones";
import { FiArrowLeft, FiEdit2, FiCheckCircle, FiClock, FiTrash2, FiPlus, FiFileText, FiImage, FiList, FiUsers, FiLayers } from "react-icons/fi";

export default function SiniestroDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useUser();
  const siniestroId = params.id as string;

  const [siniestro, setSiniestro] = useState<Siniestro | null>(null);
  const [siniestroLoading, setSiniestroLoading] = useState(false);
  const [etapas, setEtapas] = useState<SiniestroEtapa[]>([]);
  const [etapasLoading, setEtapasLoading] = useState(false);
  const [bitacora, setBitacora] = useState<BitacoraActividad[]>([]);
  const [bitacoraLoading, setBitacoraLoading] = useState(false);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [documentosLoading, setDocumentosLoading] = useState(false);
  const [evidencias, setEvidencias] = useState<EvidenciaFotografica[]>([]);
  const [evidenciasLoading, setEvidenciasLoading] = useState(false);
  const [involucrados, setInvolucrados] = useState<SiniestroUsuario[]>([]);
  const [involucradosLoading, setInvolucradosLoading] = useState(false);
  const [areasAdicionales, setAreasAdicionales] = useState<SiniestroArea[]>([]);
  const [areasAdicionalesLoading, setAreasAdicionalesLoading] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [flujos, setFlujos] = useState<any[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"info" | "involucrados" | "areas" | "etapas" | "documentos" | "bitacora" | "evidencias">("info");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  
  // Modals para bitácora, documentos y evidencias
  const [bitacoraModalOpen, setBitacoraModalOpen] = useState(false);
  const [bitacoraForm, setBitacoraForm] = useState<any>({});
  const [documentoModalOpen, setDocumentoModalOpen] = useState(false);
  const [documentoForm, setDocumentoForm] = useState<any>({});
  const [evidenciaModalOpen, setEvidenciaModalOpen] = useState(false);
  const [evidenciaForm, setEvidenciaForm] = useState<any>({});
  const [involucradoModalOpen, setInvolucradoModalOpen] = useState(false);
  const [involucradoForm, setInvolucradoForm] = useState<any>({});
  const [areaAdicionalModalOpen, setAreaAdicionalModalOpen] = useState(false);
  const [areaAdicionalForm, setAreaAdicionalForm] = useState<any>({});

  // Autenticación
  useEffect(() => {
    if (loading) return;
    const token = localStorage.getItem("token");
    if (!token || !user) {
      router.push("/login");
    }
  }, [router, loading, user]);

  // Cargar datos
  useEffect(() => {
    if (user && siniestroId) {
      loadSiniestro();
      loadEtapas();
      loadCatalogos();
      if (activeTab === "bitacora") loadBitacora();
      if (activeTab === "documentos") loadDocumentos();
      if (activeTab === "evidencias") loadEvidencias();
      if (activeTab === "involucrados") loadInvolucrados();
      if (activeTab === "areas") loadAreasAdicionales();
    }
  }, [user, siniestroId, activeTab]);

  const loadSiniestro = async () => {
    try {
      setSiniestroLoading(true);
      const data = await apiService.getSiniestroById(siniestroId);
      setSiniestro(data);
      setForm({
        numero_siniestro: data.numero_siniestro,
        fecha_siniestro: data.fecha_siniestro.split("T")[0],
        ubicacion: data.ubicacion || "",
        descripcion_hechos: data.descripcion_hechos,
        numero_poliza: data.numero_poliza || "",
        deducible: data.deducible,
        reserva: data.reserva,
        coaseguro: data.coaseguro,
        suma_asegurada: data.suma_asegurada,
        usuario_asignado: data.usuario_asignado || "",
        area_principal_id: data.area_principal_id || "",
        estado_id: data.estado_id || "",
        institucion_id: data.institucion_id || "",
        autoridad_id: data.autoridad_id || "",
        prioridad: data.prioridad,
        observaciones: data.observaciones || "",
        activo: data.activo,
      });
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      if (e.response?.status === 404) {
        swalError("Siniestro no encontrado");
        router.push("/siniestros");
        return;
      }
      swalError(e.response?.data?.detail || "Error al cargar siniestro");
    } finally {
      setSiniestroLoading(false);
    }
  };

  const loadEtapas = async () => {
    try {
      setEtapasLoading(true);
      const data = await apiService.getEtapasSiniestro(siniestroId);
      setEtapas(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      // Si no hay etapas inicializadas, no es un error crítico
      if (e.response?.status !== 404) {
        console.error("Error al cargar etapas:", e);
      }
    } finally {
      setEtapasLoading(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const [areasData, estadosData, usuariosData, flujosData, tiposDocData] = await Promise.all([
        apiService.getAreas(true),
        apiService.getEstadosSiniestro(true),
        apiService.getUsers(),
        apiService.getFlujos(),
        apiService.getTiposDocumento(true),
      ]);
      setAreas(areasData);
      setEstados(estadosData);
      setUsuarios(usuariosData);
      setFlujos(flujosData);
      setTiposDocumento(tiposDocData);
    } catch (e: any) {
      console.error("Error al cargar catálogos:", e);
    }
  };

  const loadBitacora = async () => {
    try {
      setBitacoraLoading(true);
      const data = await apiService.getBitacoraSiniestro(siniestroId);
      setBitacora(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      console.error("Error al cargar bitácora:", e);
    } finally {
      setBitacoraLoading(false);
    }
  };

  const loadDocumentos = async () => {
    try {
      setDocumentosLoading(true);
      const data = await apiService.getDocumentosSiniestro(siniestroId);
      setDocumentos(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      console.error("Error al cargar documentos:", e);
    } finally {
      setDocumentosLoading(false);
    }
  };

  const loadEvidencias = async () => {
    try {
      setEvidenciasLoading(true);
      const data = await apiService.getEvidenciasSiniestro(siniestroId);
      setEvidencias(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      console.error("Error al cargar evidencias:", e);
    } finally {
      setEvidenciasLoading(false);
    }
  };

  const loadInvolucrados = async () => {
    try {
      setInvolucradosLoading(true);
      const data = await apiService.getInvolucrados(siniestroId, true);
      setInvolucrados(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      console.error("Error al cargar involucrados:", e);
    } finally {
      setInvolucradosLoading(false);
    }
  };

  const loadAreasAdicionales = async () => {
    try {
      setAreasAdicionalesLoading(true);
      const data = await apiService.getAreasAdicionales(siniestroId, true);
      setAreasAdicionales(data);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      console.error("Error al cargar áreas adicionales:", e);
    } finally {
      setAreasAdicionalesLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siniestro) return;
    try {
      await apiService.updateSiniestro(siniestro.id, form as any);
      await swalSuccess("Siniestro actualizado correctamente");
      setEditModalOpen(false);
      loadSiniestro();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al actualizar siniestro");
    }
  };

  const inicializarEtapas = async () => {
    if (!siniestro) return;
    try {
      const areaId = siniestro.area_principal_id;
      const flujoPredeterminado = await apiService.getFlujoPredeterminado(areaId || undefined);
      if (flujoPredeterminado) {
        await apiService.inicializarEtapasSiniestro(siniestro.id, flujoPredeterminado.id);
        await swalSuccess("Etapas inicializadas correctamente");
        loadEtapas();
      } else {
        swalError("No hay un flujo predeterminado para esta área");
      }
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al inicializar etapas");
    }
  };

  const completarEtapa = async (etapaId: string) => {
    try {
      await apiService.completarEtapa(siniestroId, etapaId, {});
      await swalSuccess("Etapa completada correctamente");
      loadEtapas();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al completar etapa");
    }
  };

  // Handlers para Bitácora
  const openCreateBitacora = () => {
    if (!user) return;
    setBitacoraForm({
      tipo_actividad: "otro",
      descripcion: "",
      horas_trabajadas: 0,
      fecha_actividad: new Date().toISOString().slice(0, 16),
      comentarios: "",
    });
    setBitacoraModalOpen(true);
  };

  const submitBitacora = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await apiService.createBitacoraActividad({
        siniestro_id: siniestroId,
        usuario_id: user.id,
        ...bitacoraForm,
      });
      await swalSuccess("Actividad registrada correctamente");
      setBitacoraModalOpen(false);
      loadBitacora();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al registrar actividad");
    }
  };

  const deleteBitacora = async (id: string) => {
    const confirmed = await swalConfirmDelete("¿Está seguro de eliminar esta actividad?");
    if (!confirmed) return;
    try {
      await apiService.deleteBitacoraActividad(id);
      await swalSuccess("Actividad eliminada");
      loadBitacora();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al eliminar actividad");
    }
  };

  // Handlers para Documentos
  const openCreateDocumento = () => {
    if (!user) return;
    setDocumentoForm({
      nombre_archivo: "",
      ruta_archivo: "",
      tipo_documento_id: "",
      descripcion: "",
      fecha_documento: new Date().toISOString().split("T")[0],
      es_principal: false,
      es_adicional: false,
    });
    setDocumentoModalOpen(true);
  };

  const submitDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await apiService.createDocumento({
        siniestro_id: siniestroId,
        usuario_subio: user.id,
        ...documentoForm,
      });
      await swalSuccess("Documento registrado correctamente");
      setDocumentoModalOpen(false);
      loadDocumentos();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al registrar documento");
    }
  };

  const deleteDocumento = async (id: string) => {
    const confirmed = await swalConfirmDelete("¿Está seguro de eliminar este documento?");
    if (!confirmed) return;
    try {
      await apiService.deleteDocumento(id);
      await swalSuccess("Documento eliminado");
      loadDocumentos();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al eliminar documento");
    }
  };

  // Handlers para Evidencias
  const openCreateEvidencia = () => {
    if (!user) return;
    setEvidenciaForm({
      nombre_archivo: "",
      ruta_archivo: "",
      descripcion: "",
      fecha_toma: new Date().toISOString().slice(0, 16),
    });
    setEvidenciaModalOpen(true);
  };

  const submitEvidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await apiService.createEvidencia({
        siniestro_id: siniestroId,
        usuario_subio: user.id,
        ...evidenciaForm,
      });
      await swalSuccess("Evidencia registrada correctamente");
      setEvidenciaModalOpen(false);
      loadEvidencias();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al registrar evidencia");
    }
  };

  const deleteEvidencia = async (id: string) => {
    const confirmed = await swalConfirmDelete("¿Está seguro de eliminar esta evidencia?");
    if (!confirmed) return;
    try {
      await apiService.deleteEvidencia(id);
      await swalSuccess("Evidencia eliminada");
      loadEvidencias();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al eliminar evidencia");
    }
  };

  // Handlers para Involucrados
  const openCreateInvolucrado = () => {
    setInvolucradoForm({
      usuario_id: "",
      tipo_relacion: "asegurado",
      es_principal: false,
      observaciones: "",
    });
    setInvolucradoModalOpen(true);
  };

  const submitInvolucrado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.addInvolucrado(siniestroId, involucradoForm);
      await swalSuccess("Involucrado agregado correctamente");
      setInvolucradoModalOpen(false);
      loadInvolucrados();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al agregar involucrado");
    }
  };

  const deleteInvolucrado = async (id: string) => {
    const confirmed = await swalConfirmDelete("¿Está seguro de eliminar este involucrado?");
    if (!confirmed) return;
    try {
      await apiService.removeInvolucrado(id);
      await swalSuccess("Involucrado eliminado");
      loadInvolucrados();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al eliminar involucrado");
    }
  };

  // Handlers para Áreas Adicionales
  const openCreateAreaAdicional = () => {
    setAreaAdicionalForm({
      area_id: "",
      usuario_responsable: "",
      observaciones: "",
    });
    setAreaAdicionalModalOpen(true);
  };

  const submitAreaAdicional = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.addAreaAdicional(siniestroId, areaAdicionalForm);
      await swalSuccess("Área adicional agregada correctamente");
      setAreaAdicionalModalOpen(false);
      loadAreasAdicionales();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al agregar área adicional");
    }
  };

  const deleteAreaAdicional = async (id: string) => {
    const confirmed = await swalConfirmDelete("¿Está seguro de eliminar esta área adicional?");
    if (!confirmed) return;
    try {
      await apiService.removeAreaAdicional(id);
      await swalSuccess("Área adicional eliminada");
      loadAreasAdicionales();
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.push("/login");
        return;
      }
      swalError(e.response?.data?.detail || "Error al eliminar área adicional");
    }
  };

  // Columnas para tabla de bitácora
  const bitacoraColumns: ColumnDef<BitacoraActividad>[] = [
    {
      accessorKey: "fecha_actividad",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.fecha_actividad).toLocaleString("es-MX"),
    },
    {
      accessorKey: "tipo_actividad",
      header: "Tipo",
      cell: ({ row }) => {
        const tipos: Record<string, string> = {
          documento: "Documento",
          llamada: "Llamada",
          reunion: "Reunión",
          inspeccion: "Inspección",
          otro: "Otro",
        };
        return tipos[row.original.tipo_actividad] || row.original.tipo_actividad;
      },
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <span className="max-w-md truncate block" title={row.original.descripcion}>
          {row.original.descripcion}
        </span>
      ),
    },
    {
      accessorKey: "horas_trabajadas",
      header: "Horas",
      cell: ({ row }) => `${row.original.horas_trabajadas} h`,
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          onClick={() => deleteBitacora(row.original.id)}
          className="text-red-600 hover:text-red-800"
          title="Eliminar"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  // Columnas para tabla de documentos
  const documentosColumns: ColumnDef<Documento>[] = [
    {
      accessorKey: "nombre_archivo",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nombre_archivo}</span>
      ),
    },
    {
      accessorKey: "tipo_documento_id",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = tiposDocumento.find((t) => t.id === row.original.tipo_documento_id);
        return tipo?.nombre || "Sin tipo";
      },
    },
    {
      accessorKey: "fecha_documento",
      header: "Fecha",
      cell: ({ row }) => row.original.fecha_documento ? new Date(row.original.fecha_documento).toLocaleDateString("es-MX") : "-",
    },
    {
      accessorKey: "tamaño_archivo",
      header: "Tamaño",
      cell: ({ row }) => {
        if (!row.original.tamaño_archivo) return "-";
        const size = row.original.tamaño_archivo;
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          onClick={() => deleteDocumento(row.original.id)}
          className="text-red-600 hover:text-red-800"
          title="Eliminar"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  // Columnas para tabla de involucrados
  const involucradosColumns: ColumnDef<SiniestroUsuario>[] = [
    {
      accessorKey: "usuario_id",
      header: "Usuario",
      cell: ({ row }) => {
        const usuario = usuarios.find((u) => u.id === row.original.usuario_id);
        return usuario?.email || "N/A";
      },
    },
    {
      accessorKey: "tipo_relacion",
      header: "Tipo de Relación",
      cell: ({ row }) => {
        const tipos: Record<string, string> = {
          asegurado: "Asegurado",
          proveniente: "Proveniente",
          testigo: "Testigo",
          tercero: "Tercero",
        };
        return tipos[row.original.tipo_relacion] || row.original.tipo_relacion;
      },
    },
    {
      accessorKey: "es_principal",
      header: "Principal",
      cell: ({ row }) => (row.original.es_principal ? "Sí" : "No"),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          onClick={() => deleteInvolucrado(row.original.id)}
          className="text-red-600 hover:text-red-800"
          title="Eliminar"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  // Columnas para tabla de áreas adicionales
  const areasAdicionalesColumns: ColumnDef<SiniestroArea>[] = [
    {
      accessorKey: "area_id",
      header: "Área",
      cell: ({ row }) => {
        const area = areas.find((a) => a.id === row.original.area_id);
        return area?.nombre || "N/A";
      },
    },
    {
      accessorKey: "usuario_responsable",
      header: "Responsable",
      cell: ({ row }) => {
        if (!row.original.usuario_responsable) return "Sin asignar";
        const usuario = usuarios.find((u) => u.id === row.original.usuario_responsable);
        return usuario?.email || "N/A";
      },
    },
    {
      accessorKey: "fecha_asignacion",
      header: "Fecha Asignación",
      cell: ({ row }) => new Date(row.original.fecha_asignacion).toLocaleDateString("es-MX"),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          onClick={() => deleteAreaAdicional(row.original.id)}
          className="text-red-600 hover:text-red-800"
          title="Eliminar"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  // Columnas para tabla de evidencias
  const evidenciasColumns: ColumnDef<EvidenciaFotografica>[] = [
    {
      accessorKey: "nombre_archivo",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nombre_archivo}</span>
      ),
    },
    {
      accessorKey: "fecha_toma",
      header: "Fecha Toma",
      cell: ({ row }) => row.original.fecha_toma ? new Date(row.original.fecha_toma).toLocaleString("es-MX") : "-",
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <span className="max-w-md truncate block" title={row.original.descripcion}>
          {row.original.descripcion || "-"}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          onClick={() => deleteEvidencia(row.original.id)}
          className="text-red-600 hover:text-red-800"
          title="Eliminar"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  // Columnas para tabla de etapas
  const etapasColumns: ColumnDef<SiniestroEtapa>[] = [
    {
      accessorKey: "etapa.nombre",
      header: "Etapa",
      cell: ({ row }) => row.original.etapa?.nombre || "N/A",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estados: Record<string, { text: string; color: string }> = {
          pendiente: { text: "Pendiente", color: "bg-gray-100 text-gray-800" },
          en_proceso: { text: "En Proceso", color: "bg-blue-100 text-blue-800" },
          completada: { text: "Completada", color: "bg-green-100 text-green-800" },
          omitida: { text: "Omitida", color: "bg-yellow-100 text-yellow-800" },
          bloqueada: { text: "Bloqueada", color: "bg-red-100 text-red-800" },
        };
        const estado = estados[row.original.estado] || estados.pendiente;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${estado.color}`}>
            {estado.text}
          </span>
        );
      },
    },
    {
      accessorKey: "fecha_inicio",
      header: "Fecha Inicio",
      cell: ({ row }) => new Date(row.original.fecha_inicio).toLocaleDateString("es-MX"),
    },
    {
      accessorKey: "fecha_completada",
      header: "Fecha Completada",
      cell: ({ row }) => row.original.fecha_completada ? new Date(row.original.fecha_completada).toLocaleDateString("es-MX") : "-",
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.estado !== "completada" && (
            <button
              onClick={() => completarEtapa(row.original.etapa_flujo_id)}
              className="text-green-600 hover:text-green-800"
              title="Completar etapa"
            >
              <FiCheckCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading || siniestroLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!user || !siniestro) {
    return null;
  }

  const TabButton = ({ id, label }: { id: string; label: string }) => (
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

  const getAreaNombre = (id?: string) => areas.find((a) => a.id === id)?.nombre || "N/A";
  const getEstadoNombre = (id?: string) => estados.find((e) => e.id === id)?.nombre || "N/A";
  const getUsuarioNombre = (id?: string) => usuarios.find((u) => u.id === id)?.email || "Sin asignar";

  const prioridadColors: Record<string, string> = {
    baja: "bg-gray-100 text-gray-800",
    media: "bg-blue-100 text-blue-800",
    alta: "bg-orange-100 text-orange-800",
    critica: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/siniestros")}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {siniestro.numero_siniestro}
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(siniestro.fecha_siniestro).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button onClick={() => setEditModalOpen(true)}>
            <FiEdit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Tabs">
            <TabButton id="info" label="Información General" />
            <TabButton id="involucrados" label="Involucrados" />
            <TabButton id="areas" label="Áreas Adicionales" />
            <TabButton id="etapas" label="Etapas del Flujo" />
            <TabButton id="documentos" label="Documentos" />
            <TabButton id="bitacora" label="Bitácora" />
            <TabButton id="evidencias" label="Evidencias" />
          </nav>
        </div>

        {/* Contenido de pestañas */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Pestaña: Información General */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Cambio de Estado */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3">Cambiar Estado</h4>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <CustomSelect
                      label="Nuevo Estado"
                      name="estado_id"
                      value={siniestro?.estado_id || ""}
                      onChange={async (value) => {
                        try {
                          await apiService.updateSiniestro(siniestroId, { estado_id: value as string || undefined });
                          await swalSuccess("Estado actualizado correctamente");
                          loadSiniestro();
                        } catch (e: any) {
                          if (e.response?.status === 401) {
                            router.push("/login");
                            return;
                          }
                          swalError(e.response?.data?.detail || "Error al actualizar estado");
                        }
                      }}
                      options={[
                        { value: "", label: "Sin estado" },
                        ...estados.map((estado) => ({
                          value: estado.id,
                          label: estado.nombre,
                        })),
                      ]}
                      placeholder="Sin estado"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Información del Siniestro</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Número de Siniestro</dt>
                      <dd className="mt-1 text-sm text-gray-900">{siniestro.numero_siniestro}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha del Siniestro</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(siniestro.fecha_siniestro).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                      <dd className="mt-1 text-sm text-gray-900">{siniestro.ubicacion || "No especificada"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Prioridad</dt>
                      <dd className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${prioridadColors[siniestro.prioridad]}`}>
                          {siniestro.prioridad.toUpperCase()}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="mt-1 text-sm text-gray-900">{getEstadoNombre(siniestro.estado_id)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Área Principal</dt>
                      <dd className="mt-1 text-sm text-gray-900">{getAreaNombre(siniestro.area_principal_id)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Usuario Asignado</dt>
                      <dd className="mt-1 text-sm text-gray-900">{getUsuarioNombre(siniestro.usuario_asignado)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Información de Póliza</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Número de Póliza</dt>
                      <dd className="mt-1 text-sm text-gray-900">{siniestro.numero_poliza || "No especificado"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Suma Asegurada</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(siniestro.suma_asegurada)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Deducible</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(siniestro.deducible)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reserva</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(siniestro.reserva)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Coaseguro</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(siniestro.coaseguro)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Descripción de Hechos</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{siniestro.descripcion_hechos}</p>
              </div>

              {siniestro.observaciones && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Observaciones</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{siniestro.observaciones}</p>
                </div>
              )}
            </div>
          )}

          {/* Pestaña: Involucrados */}
          {activeTab === "involucrados" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Involucrados en el Siniestro</h3>
                <Button onClick={openCreateInvolucrado}>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Agregar Involucrado
                </Button>
              </div>

              {involucradosLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando involucrados...</div>
              ) : (
                <DataTable columns={involucradosColumns} data={involucrados} emptyText="No hay involucrados registrados" />
              )}
            </div>
          )}

          {/* Pestaña: Áreas Adicionales */}
          {activeTab === "areas" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Áreas Adicionales</h3>
                <Button onClick={openCreateAreaAdicional}>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Agregar Área
                </Button>
              </div>

              {areasAdicionalesLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando áreas adicionales...</div>
              ) : (
                <DataTable columns={areasAdicionalesColumns} data={areasAdicionales} emptyText="No hay áreas adicionales" />
              )}
            </div>
          )}

          {/* Pestaña: Etapas del Flujo */}
          {activeTab === "etapas" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Etapas del Flujo de Trabajo</h3>
                {etapas.length === 0 && (
                  <Button onClick={inicializarEtapas}>Inicializar Etapas</Button>
                )}
              </div>

              {etapasLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando etapas...</div>
              ) : etapas.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FiClock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay etapas inicializadas para este siniestro.</p>
                  <p className="text-sm mt-2">Selecciona un flujo de trabajo para inicializar las etapas.</p>
                </div>
              ) : (
                <DataTable columns={etapasColumns} data={etapas} emptyText="No hay etapas" />
              )}
            </div>
          )}

          {/* Pestaña: Bitácora */}
          {activeTab === "bitacora" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bitácora de Actividades</h3>
                <Button onClick={openCreateBitacora}>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Nueva Actividad
                </Button>
              </div>

              {bitacoraLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando bitácora...</div>
              ) : (
                <DataTable columns={bitacoraColumns} data={bitacora} emptyText="No hay actividades registradas" />
              )}
            </div>
          )}

          {/* Pestaña: Documentos */}
          {activeTab === "documentos" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documentos</h3>
                <Button onClick={openCreateDocumento}>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Nuevo Documento
                </Button>
              </div>

              {documentosLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando documentos...</div>
              ) : (
                <DataTable columns={documentosColumns} data={documentos} emptyText="No hay documentos" />
              )}
            </div>
          )}

          {/* Pestaña: Evidencias */}
          {activeTab === "evidencias" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Evidencias Fotográficas</h3>
                <Button onClick={openCreateEvidencia}>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Nueva Evidencia
                </Button>
              </div>

              {evidenciasLoading ? (
                <div className="text-center text-gray-500 py-8">Cargando evidencias...</div>
              ) : (
                <DataTable columns={evidenciasColumns} data={evidencias} emptyText="No hay evidencias" />
              )}
            </div>
          )}
        </div>

        {/* Modal de edición */}
        <Modal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar Siniestro"
        >
          <form onSubmit={submitForm} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Siniestro *</label>
                <Input
                  name="numero_siniestro"
                  value={form.numero_siniestro}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Siniestro *</label>
                <Input
                  type="date"
                  name="fecha_siniestro"
                  value={form.fecha_siniestro}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <Input
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleFormChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de Hechos *</label>
                <textarea
                  name="descripcion_hechos"
                  value={form.descripcion_hechos}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Póliza</label>
                <Input
                  name="numero_poliza"
                  value={form.numero_poliza}
                  onChange={handleFormChange}
                />
              </div>
              <CustomSelect
                label="Prioridad"
                name="prioridad"
                value={form.prioridad}
                onChange={(value) => {
                  const fakeEvent = {
                    target: { name: "prioridad", value: value as string },
                  } as React.ChangeEvent<HTMLSelectElement>;
                  handleFormChange(fakeEvent);
                }}
                options={[
                  { value: "baja", label: "Baja" },
                  { value: "media", label: "Media" },
                  { value: "alta", label: "Alta" },
                  { value: "critica", label: "Crítica" },
                ]}
              />
              <CustomSelect
                label="Área Principal"
                name="area_principal_id"
                value={form.area_principal_id}
                onChange={(value) => {
                  const fakeEvent = {
                    target: { name: "area_principal_id", value: value as string },
                  } as React.ChangeEvent<HTMLSelectElement>;
                  handleFormChange(fakeEvent);
                }}
                options={[
                  { value: "", label: "Seleccionar área" },
                  ...areas.map((area) => ({
                    value: area.id,
                    label: area.nombre,
                  })),
                ]}
                placeholder="Seleccionar área"
              />
              <CustomSelect
                label="Estado"
                name="estado_id"
                value={form.estado_id}
                onChange={(value) => {
                  const fakeEvent = {
                    target: { name: "estado_id", value: value as string },
                  } as React.ChangeEvent<HTMLSelectElement>;
                  handleFormChange(fakeEvent);
                }}
                options={[
                  { value: "", label: "Seleccionar estado" },
                  ...estados.map((estado) => ({
                    value: estado.id,
                    label: estado.nombre,
                  })),
                ]}
                placeholder="Seleccionar estado"
              />
              <CustomSelect
                label="Usuario Asignado"
                name="usuario_asignado"
                value={form.usuario_asignado}
                onChange={(value) => {
                  const fakeEvent = {
                    target: { name: "usuario_asignado", value: value as string },
                  } as React.ChangeEvent<HTMLSelectElement>;
                  handleFormChange(fakeEvent);
                }}
                options={[
                  { value: "", label: "Sin asignar" },
                  ...usuarios.map((usuario) => ({
                    value: usuario.id,
                    label: usuario.email,
                  })),
                ]}
                placeholder="Sin asignar"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suma Asegurada</label>
                <Input
                  type="number"
                  step="0.01"
                  name="suma_asegurada"
                  value={form.suma_asegurada}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deducible</label>
                <Input
                  type="number"
                  step="0.01"
                  name="deducible"
                  value={form.deducible}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reserva</label>
                <Input
                  type="number"
                  step="0.01"
                  name="reserva"
                  value={form.reserva}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coaseguro</label>
                <Input
                  type="number"
                  step="0.01"
                  name="coaseguro"
                  value={form.coaseguro}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar</Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Bitácora */}
        <Modal
          open={bitacoraModalOpen}
          onClose={() => setBitacoraModalOpen(false)}
          title="Nueva Actividad en Bitácora"
        >
          <form onSubmit={submitBitacora} className="space-y-4">
            <CustomSelect
              label="Tipo de Actividad *"
              name="tipo_actividad"
              value={bitacoraForm.tipo_actividad || "otro"}
              onChange={(value) => setBitacoraForm({ ...bitacoraForm, tipo_actividad: value as any })}
              options={[
                { value: "documento", label: "Documento" },
                { value: "llamada", label: "Llamada" },
                { value: "reunion", label: "Reunión" },
                { value: "inspeccion", label: "Inspección" },
                { value: "otro", label: "Otro" },
              ]}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                name="descripcion"
                value={bitacoraForm.descripcion || ""}
                onChange={(e) => setBitacoraForm({ ...bitacoraForm, descripcion: e.target.value })}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Describe la actividad realizada"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora *</label>
                <Input
                  type="datetime-local"
                  value={bitacoraForm.fecha_actividad || ""}
                  onChange={(e) => setBitacoraForm({ ...bitacoraForm, fecha_actividad: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas Trabajadas</label>
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={bitacoraForm.horas_trabajadas || 0}
                  onChange={(e) => setBitacoraForm({ ...bitacoraForm, horas_trabajadas: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
              <textarea
                name="comentarios"
                value={bitacoraForm.comentarios || ""}
                onChange={(e) => setBitacoraForm({ ...bitacoraForm, comentarios: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Comentarios adicionales"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setBitacoraModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Documento */}
        <Modal
          open={documentoModalOpen}
          onClose={() => setDocumentoModalOpen(false)}
          title="Nuevo Documento"
        >
          <form onSubmit={submitDocumento} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Archivo *</label>
              <Input
                name="nombre_archivo"
                value={documentoForm.nombre_archivo || ""}
                onChange={(e) => setDocumentoForm({ ...documentoForm, nombre_archivo: e.target.value })}
                required
                placeholder="ejemplo.pdf"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ruta del Archivo *</label>
              <Input
                name="ruta_archivo"
                value={documentoForm.ruta_archivo || ""}
                onChange={(e) => setDocumentoForm({ ...documentoForm, ruta_archivo: e.target.value })}
                required
                placeholder="/uploads/documentos/..."
              />
            </div>
            <CustomSelect
              label="Tipo de Documento"
              name="tipo_documento_id"
              value={documentoForm.tipo_documento_id || ""}
              onChange={(value) => setDocumentoForm({ ...documentoForm, tipo_documento_id: value as string })}
              options={[
                { value: "", label: "Seleccionar tipo" },
                ...tiposDocumento.map((tipo) => ({
                  value: tipo.id,
                  label: tipo.nombre,
                })),
              ]}
              placeholder="Seleccionar tipo"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Documento</label>
              <Input
                type="date"
                name="fecha_documento"
                value={documentoForm.fecha_documento || ""}
                onChange={(e) => setDocumentoForm({ ...documentoForm, fecha_documento: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={documentoForm.descripcion || ""}
                onChange={(e) => setDocumentoForm({ ...documentoForm, descripcion: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Descripción del documento"
              />
            </div>
            <div className="flex gap-4">
              <Switch
                label="Documento Principal"
                checked={documentoForm.es_principal || false}
                onChange={(checked) => setDocumentoForm({ ...documentoForm, es_principal: checked })}
              />
              <Switch
                label="Documento Adicional"
                checked={documentoForm.es_adicional || false}
                onChange={(checked) => setDocumentoForm({ ...documentoForm, es_adicional: checked })}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setDocumentoModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Evidencia */}
        <Modal
          open={evidenciaModalOpen}
          onClose={() => setEvidenciaModalOpen(false)}
          title="Nueva Evidencia Fotográfica"
        >
          <form onSubmit={submitEvidencia} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Archivo *</label>
              <Input
                name="nombre_archivo"
                value={evidenciaForm.nombre_archivo || ""}
                onChange={(e) => setEvidenciaForm({ ...evidenciaForm, nombre_archivo: e.target.value })}
                required
                placeholder="foto_evidencia.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ruta del Archivo *</label>
              <Input
                name="ruta_archivo"
                value={evidenciaForm.ruta_archivo || ""}
                onChange={(e) => setEvidenciaForm({ ...evidenciaForm, ruta_archivo: e.target.value })}
                required
                placeholder="/uploads/evidencias/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Toma</label>
                <Input
                  type="datetime-local"
                  name="fecha_toma"
                  value={evidenciaForm.fecha_toma || ""}
                  onChange={(e) => setEvidenciaForm({ ...evidenciaForm, fecha_toma: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                <Input
                  type="number"
                  step="0.00000001"
                  name="latitud"
                  value={evidenciaForm.latitud || ""}
                  onChange={(e) => setEvidenciaForm({ ...evidenciaForm, latitud: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="19.432608"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
              <Input
                type="number"
                step="0.00000001"
                name="longitud"
                value={evidenciaForm.longitud || ""}
                onChange={(e) => setEvidenciaForm({ ...evidenciaForm, longitud: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="-99.133209"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={evidenciaForm.descripcion || ""}
                onChange={(e) => setEvidenciaForm({ ...evidenciaForm, descripcion: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Descripción de la evidencia fotográfica"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setEvidenciaModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Involucrado */}
        <Modal
          open={involucradoModalOpen}
          onClose={() => setInvolucradoModalOpen(false)}
          title="Agregar Involucrado"
        >
          <form onSubmit={submitInvolucrado} className="space-y-4">
            <CustomSelect
              label="Usuario *"
              name="usuario_id"
              value={involucradoForm.usuario_id || ""}
              onChange={(value) => setInvolucradoForm({ ...involucradoForm, usuario_id: value as string })}
              options={[
                { value: "", label: "Seleccionar usuario" },
                ...usuarios.map((usuario) => ({
                  value: usuario.id,
                  label: usuario.email,
                })),
              ]}
              placeholder="Seleccionar usuario"
              required
            />
            <CustomSelect
              label="Tipo de Relación *"
              name="tipo_relacion"
              value={involucradoForm.tipo_relacion || "asegurado"}
              onChange={(value) => setInvolucradoForm({ ...involucradoForm, tipo_relacion: value as any })}
              options={[
                { value: "asegurado", label: "Asegurado" },
                { value: "proveniente", label: "Proveniente" },
                { value: "testigo", label: "Testigo" },
                { value: "tercero", label: "Tercero" },
              ]}
              required
            />
            <div>
              <Switch
                label="Es Principal"
                checked={involucradoForm.es_principal || false}
                onChange={(checked) => setInvolucradoForm({ ...involucradoForm, es_principal: checked })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                name="observaciones"
                value={involucradoForm.observaciones || ""}
                onChange={(e) => setInvolucradoForm({ ...involucradoForm, observaciones: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Observaciones sobre este involucrado"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setInvolucradoModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Agregar</Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Área Adicional */}
        <Modal
          open={areaAdicionalModalOpen}
          onClose={() => setAreaAdicionalModalOpen(false)}
          title="Agregar Área Adicional"
        >
          <form onSubmit={submitAreaAdicional} className="space-y-4">
            <CustomSelect
              label="Área *"
              name="area_id"
              value={areaAdicionalForm.area_id || ""}
              onChange={(value) => setAreaAdicionalForm({ ...areaAdicionalForm, area_id: value as string })}
              options={[
                { value: "", label: "Seleccionar área" },
                ...areas.map((area) => ({
                  value: area.id,
                  label: area.nombre,
                })),
              ]}
              placeholder="Seleccionar área"
              required
            />
            <CustomSelect
              label="Usuario Responsable"
              name="usuario_responsable"
              value={areaAdicionalForm.usuario_responsable || ""}
              onChange={(value) => setAreaAdicionalForm({ ...areaAdicionalForm, usuario_responsable: value as string })}
              options={[
                { value: "", label: "Sin asignar" },
                ...usuarios.map((usuario) => ({
                  value: usuario.id,
                  label: usuario.email,
                })),
              ]}
              placeholder="Sin asignar"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                name="observaciones"
                value={areaAdicionalForm.observaciones || ""}
                onChange={(e) => setAreaAdicionalForm({ ...areaAdicionalForm, observaciones: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Observaciones sobre esta área adicional"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setAreaAdicionalModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Agregar</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

