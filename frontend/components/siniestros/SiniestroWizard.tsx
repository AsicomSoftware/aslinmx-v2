import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiSearch, FiTrash2, FiUser } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import RichTextEditor from "@/components/ui/RichTextEditor";
import CustomSelect, { SelectOption } from "@/components/ui/Select";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
let googlePlacesPromise: Promise<void> | null = null;

function loadGooglePlaces(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps API key no configurada"));
  }

  if (!googlePlacesPromise) {
    googlePlacesPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById("google-maps-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", (error) => reject(error));
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=es`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.body.appendChild(script);
    });
  }

  return googlePlacesPromise;
}

export interface SiniestroFormState {
  numero_siniestro: string;
  fecha_siniestro: string;
  ubicacion: string;
  descripcion_hechos: string;
  numero_poliza: string;
  deducible: number | "";
  reserva: number | "";
  coaseguro: number | "";
  suma_asegurada: number | "";
  estado_id: string;
  institucion_id: string;
  autoridad_id: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  observaciones: string;
  activo: boolean;
}

export interface PolizaDraft {
  tempId: string;
  numero_poliza: string;
  deducible: number | "";
  reserva: number | "";
  coaseguro: number | "";
  suma_asegurada: number | "";
}

export interface ExtendedSiniestroFormState {
  asegurado: {
    seleccionadoId: string | null;
    busqueda: string;
    formaContacto: "" | "correo" | "telefono" | "directa";
    nuevo: {
      nombre: string;
      apellido_paterno: string;
      apellido_materno: string;
      celular: string;
      telefono_casa: string;
      telefono_oficina: string;
      estado: string;
      ciudad: string;
      email: string;
      direccion: string;
      colonia: string;
      municipio: string;
      codigo_postal: string;
      pais: string;
    };
  };
  generales: {
    numero_reporte: string;
    proveniente_id: string;
    institucion_id: string;
    autoridad_id: string;
    fecha_inicio_vigencia: string;
    fecha_fin_vigencia: string;
    calificacion: string;
    abogado_id: string;
    areas_ids: string[]; // Array para múltiples áreas
    usuarios_ids: string[]; // Array para múltiples usuarios
    polizas: PolizaDraft[];
  };
  especificos: {
    tipo_intervencion: string;
    tercero: string;
    nicho: string;
    materia: string;
    expediente: string;
    descripcion_html: string;
  };
}

export type CatalogOption = {
  id: string;
  nombre?: string;
  descripcion?: string;
};

export type PersonaLigera = {
  id: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  email?: string;
  telefono?: string;
  estado?: string;
  ciudad?: string;
};

type SiniestroWizardProps = {
  open: boolean;
  editing: boolean;
  form: SiniestroFormState;
  setForm: React.Dispatch<React.SetStateAction<SiniestroFormState>>;
  extendedForm: ExtendedSiniestroFormState;
  setExtendedForm: React.Dispatch<React.SetStateAction<ExtendedSiniestroFormState>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  asegurados: PersonaLigera[];
  provenientes: PersonaLigera[];
  instituciones: CatalogOption[];
  autoridades: CatalogOption[];
  estados: CatalogOption[];
  areas: CatalogOption[];
  abogados: PersonaLigera[];
  calificaciones: string[];
  calificacionesCatalogo?: any[]; // Catálogo completo con IDs
};

const contactoPreferencia = [
  { value: "", label: "Sin preferencia" },
  { value: "correo", label: "Correo" },
  { value: "telefono", label: "Teléfono" },
  { value: "directa", label: "Directa" },
];

function buildTempId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function SiniestroWizard({
  open,
  editing,
  form,
  setForm,
  extendedForm,
  setExtendedForm,
  onClose,
  onSubmit,
  onChange,
  asegurados,
  provenientes,
  instituciones,
  autoridades,
  estados,
  areas,
  abogados,
  calificaciones,
  calificacionesCatalogo = [],
}: SiniestroWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  // Debug: Ver qué datos están llegando
  useEffect(() => {
    if (open) {
      console.log("Wizard - Instituciones recibidas:", instituciones);
      console.log("Wizard - Autoridades recibidas:", autoridades);
      console.log("Wizard - Provenientes recibidos:", provenientes);
    }
  }, [open, instituciones, autoridades, provenientes]);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setValidationError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let autocomplete: any = null;

    loadGooglePlaces()
      .then(() => {
        if (addressInputRef.current && window.google?.maps?.places) {
          autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
            types: ["geocode"],
            componentRestrictions: undefined,
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete?.getPlace();
            handleDireccionSeleccionada(place);
          });
        }
      })
      .catch((error) => {
        console.warn("No fue posible inicializar Google Places:", error);
      });

    return () => {
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDireccionSeleccionada = (place: any) => {
    if (!place) return;
    const components = place.address_components || [];
    const getComponent = (types: string[]) => {
      const component = components.find((item: any) => types.every((type) => item.types.includes(type)));
      return component ? component.long_name : "";
    };

    const formattedAddress = place.formatted_address || addressInputRef.current?.value || "";
    const estado = getComponent(["administrative_area_level_1"]);
    const ciudad =
      getComponent(["locality"]) ||
      getComponent(["administrative_area_level_2"]) ||
      extendedForm.asegurado.nuevo.ciudad;
    const municipio =
      getComponent(["administrative_area_level_2"]) || extendedForm.asegurado.nuevo.municipio;
    const colonia =
      getComponent(["sublocality", "sublocality_level_1"]) ||
      getComponent(["neighborhood"]) ||
      extendedForm.asegurado.nuevo.colonia;
    const codigoPostal = getComponent(["postal_code"]) || extendedForm.asegurado.nuevo.codigo_postal;
    const pais = getComponent(["country"]) || extendedForm.asegurado.nuevo.pais;

    setExtendedForm((prev) => ({
      ...prev,
      asegurado: {
        ...prev.asegurado,
        nuevo: {
          ...prev.asegurado.nuevo,
          direccion: formattedAddress,
          estado: estado || prev.asegurado.nuevo.estado,
          ciudad,
          municipio,
          colonia,
          codigo_postal: codigoPostal,
          pais,
        },
      },
    }));

    setForm((prev) => ({
      ...prev,
      ubicacion: formattedAddress || prev.ubicacion,
    }));
  };

  const filteredAsegurados = useMemo(() => {
    const term = extendedForm.asegurado.busqueda.toLowerCase().trim();
    if (!term) return asegurados;
    return asegurados.filter((item) => {
      const fullName = `${item.nombre || ""} ${item.apellido_paterno || ""} ${item.apellido_materno || ""}`.toLowerCase();
      const email = (item.email || "").toLowerCase();
      return fullName.includes(term) || email.includes(term);
    });
  }, [asegurados, extendedForm.asegurado.busqueda]);

  const provenienteOptions = useMemo(() => {
    return provenientes.map((p) => ({
      id: p.id,
      nombre: p.nombre || p.email || p.id,
    }));
  }, [provenientes]);

  const abogadoOptions = useMemo(() => {
    return abogados.map((p) => ({
      id: p.id,
      nombre: `${p.nombre || ""} ${p.apellido_paterno || ""}`.trim() || p.email || p.id,
    }));
  }, [abogados]);

  const handleSelectAsegurado = (id: string) => {
    setExtendedForm((prev) => ({
      ...prev,
      asegurado: {
        ...prev.asegurado,
        seleccionadoId: id,
      },
    }));
  };

  const handleNuevoAseguradoChange = (field: keyof ExtendedSiniestroFormState["asegurado"]["nuevo"], value: string) => {
    setExtendedForm((prev) => ({
      ...prev,
      asegurado: {
        ...prev.asegurado,
        seleccionadoId: prev.asegurado.seleccionadoId,
        nuevo: {
          ...prev.asegurado.nuevo,
          [field]: value,
        },
      },
    }));
  };

  const handlePolizaFieldChange = (index: number, field: keyof PolizaDraft, value: string) => {
    setExtendedForm((prev) => {
      const updated = prev.generales.polizas.map((poliza, idx) =>
        idx === index
          ? {
              ...poliza,
              [field]: ["deducible", "reserva", "coaseguro", "suma_asegurada"].includes(field)
                ? value === "" || Number.isNaN(Number(value))
                  ? ""
                  : Number(value)
                : value,
            }
          : poliza
      );

      return {
        ...prev,
        generales: {
          ...prev.generales,
          polizas: updated,
        },
      };
    });

    if (index === 0) {
      setForm((prev) => ({
        ...prev,
        numero_poliza: field === "numero_poliza" ? value : prev.numero_poliza,
        deducible: field === "deducible" ? (value === "" ? "" : Number(value)) : prev.deducible,
        reserva: field === "reserva" ? (value === "" ? "" : Number(value)) : prev.reserva,
        coaseguro: field === "coaseguro" ? (value === "" ? "" : Number(value)) : prev.coaseguro,
        suma_asegurada: field === "suma_asegurada" ? (value === "" ? "" : Number(value)) : prev.suma_asegurada,
      }));
    }
  };

  const handleAddPoliza = () => {
    setExtendedForm((prev) => ({
      ...prev,
      generales: {
        ...prev.generales,
        polizas: [
          ...prev.generales.polizas,
          {
            tempId: buildTempId("poliza"),
            numero_poliza: "",
            deducible: "",
            reserva: "",
            coaseguro: "",
            suma_asegurada: "",
          },
        ],
      },
    }));
  };

  const handleRemovePoliza = (index: number) => {
    setExtendedForm((prev) => {
      const updated = prev.generales.polizas.filter((_, idx) => idx !== index);
      const next = {
        ...prev,
        generales: {
          ...prev.generales,
          polizas: updated.length
            ? updated
            : [
                {
                  tempId: buildTempId("poliza"),
                  numero_poliza: "",
                  deducible: "",
                  reserva: "",
                  coaseguro: "",
                  suma_asegurada: "",
                },
              ],
        },
      };

      const primary = next.generales.polizas[0];
      setForm((prevForm) => ({
        ...prevForm,
        numero_poliza: primary.numero_poliza,
        deducible: primary.deducible,
        reserva: primary.reserva,
        coaseguro: primary.coaseguro,
        suma_asegurada: primary.suma_asegurada,
      }));

      return next;
    });
  };

  const setGeneralesValue = <K extends keyof ExtendedSiniestroFormState["generales"]>(
    field: K,
    value: ExtendedSiniestroFormState["generales"][K]
  ) => {
    setExtendedForm((prev) => ({
      ...prev,
      generales: {
        ...prev.generales,
        [field]: value,
      },
    }));
  };

  const setEspecificosValue = <K extends keyof ExtendedSiniestroFormState["especificos"]>(
    field: K,
    value: ExtendedSiniestroFormState["especificos"][K]
  ) => {
    setExtendedForm((prev) => ({
      ...prev,
      especificos: {
        ...prev.especificos,
        [field]: value,
      },
    }));
  };

  const validateStep = (step: number): string | null => {
    if (step === 0) {
      if (extendedForm.asegurado.seleccionadoId) return null;
      const nuevo = extendedForm.asegurado.nuevo;
      if (!nuevo.nombre.trim() || !nuevo.apellido_paterno.trim() || !nuevo.email.trim()) {
        return "Selecciona un asegurado existente o captura nombre, apellido paterno y correo para crear uno nuevo.";
      }
      return null;
    }
    if (step === 1) {
      if (!form.numero_siniestro.trim()) {
        return "El número de siniestro es obligatorio.";
      }
      if (!form.fecha_siniestro) {
        return "Selecciona la fecha del siniestro.";
      }
      if (!form.estado_id) {
        return "Selecciona un status para el siniestro.";
      }
      return null;
    }
    if (step === 2) {
      if (!extendedForm.especificos.descripcion_html || extendedForm.especificos.descripcion_html.trim() === "") {
        return "La descripción de los hechos es obligatoria.";
      }
      return null;
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const goPrev = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const error = validateStep(currentStep);
    if (error) {
      event.preventDefault();
      setValidationError(error);
      return;
    }
    setValidationError(null);
    onSubmit(event);
  };

  if (!open) {
    return null;
  }

  const isLastStep = currentStep === 2;

  const steps = [
    {
      id: "asegurado",
      title: "Datos del asegurado",
      description: "Selecciona o captura la información del asegurado principal",
    },
    {
      id: "generales",
      title: "Datos generales",
      description: "Completa los detalles operativos del siniestro",
    },
    {
      id: "especificos",
      title: "Datos específicos",
      description: "Configura información estratégica y descripción",
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl border border-gray-200">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editing ? "Editar siniestro" : "Nuevo siniestro"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Completa la información paso a paso para {editing ? "actualizar" : "registrar"} el siniestro.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar wizard"
          >
            ×
          </button>
        </div>

        <div className="px-6 pt-6">
          <nav aria-label="Progreso" className="mb-6">
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {steps.map((step, index) => {
                const status =
                  index === currentStep ? "current" : index < currentStep ? "complete" : "upcoming";
                return (
                  <li
                    key={step.id}
                    className={`rounded-lg border px-4 py-3 transition-colors ${
                      status === "current"
                        ? "border-primary-500 bg-primary-50"
                        : status === "complete"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          status === "current"
                            ? "bg-primary-500 text-white"
                            : status === "complete"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{step.title}</p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {validationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {validationError}
              </div>
            )}

            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Buscar asegurado</h3>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-10 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Buscar por nombre o correo"
                        value={extendedForm.asegurado.busqueda}
                        onChange={(event) =>
                          setExtendedForm((prev) => ({
                            ...prev,
                            asegurado: { ...prev.asegurado, busqueda: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      Resultados: {filteredAsegurados.length}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {filteredAsegurados.map((item) => {
                    const fullName = `${item.nombre || ""} ${item.apellido_paterno || ""} ${item.apellido_materno || ""}`.trim();
                    const selected = extendedForm.asegurado.seleccionadoId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectAsegurado(item.id)}
                        className={`flex w-full flex-col items-start gap-2 rounded-lg border px-4 py-3 text-left shadow-sm transition-colors ${
                          selected ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white hover:border-primary-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FiUser className={`text-lg ${selected ? "text-primary-600" : "text-gray-400"}`} />
                          <span className="text-sm font-semibold text-gray-900">{fullName || item.email || "Sin nombre"}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.email || "Sin correo"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {[item.telefono, item.estado, item.ciudad].filter(Boolean).join(" • ") || "Sin datos adicionales"}
                        </div>
                      </button>
                    );
                  })}
                  {filteredAsegurados.length === 0 && (
                    <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                      No se encontraron asegurados con ese término.
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Crear nuevo asegurado</h3>
                      <p className="text-xs text-gray-500">
                        Captura la información si aún no existe en el sistema. Esta información se mantendrá en el borrador del siniestro.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      label="Nombre *"
                      name="asegurado_nombre"
                      value={extendedForm.asegurado.nuevo.nombre}
                      onChange={(event) => handleNuevoAseguradoChange("nombre", event.target.value)}
                      placeholder="Nombre(s)"
                    />
                    <Input
                      label="Apellido paterno *"
                      name="asegurado_apellido_paterno"
                      value={extendedForm.asegurado.nuevo.apellido_paterno}
                      onChange={(event) => handleNuevoAseguradoChange("apellido_paterno", event.target.value)}
                      placeholder="Apellido paterno"
                    />
                    <Input
                      label="Apellido materno"
                      name="asegurado_apellido_materno"
                      value={extendedForm.asegurado.nuevo.apellido_materno}
                      onChange={(event) => handleNuevoAseguradoChange("apellido_materno", event.target.value)}
                      placeholder="Apellido materno"
                    />
                    <Input
                      label="Correo electrónico *"
                      name="asegurado_email"
                      value={extendedForm.asegurado.nuevo.email}
                      onChange={(event) => handleNuevoAseguradoChange("email", event.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                    <Input
                      label="Celular"
                      name="asegurado_celular"
                      value={extendedForm.asegurado.nuevo.celular}
                      onChange={(event) => handleNuevoAseguradoChange("celular", event.target.value)}
                      placeholder="55 0000 0000"
                    />
                    <Input
                      label="Teléfono casa"
                      name="asegurado_telefono_casa"
                      value={extendedForm.asegurado.nuevo.telefono_casa}
                      onChange={(event) => handleNuevoAseguradoChange("telefono_casa", event.target.value)}
                      placeholder="55 0000 0000"
                    />
                    <Input
                      label="Teléfono oficina"
                      name="asegurado_telefono_oficina"
                      value={extendedForm.asegurado.nuevo.telefono_oficina}
                      onChange={(event) => handleNuevoAseguradoChange("telefono_oficina", event.target.value)}
                      placeholder="55 0000 0000"
                    />
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección (Google)
                      </label>
                      <input
                        ref={addressInputRef}
                        type="text"
                        value={extendedForm.asegurado.nuevo.direccion}
                        onChange={(event) => {
                          handleNuevoAseguradoChange("direccion", event.target.value);
                          setForm((prev) => ({ ...prev, ubicacion: event.target.value }));
                        }}
                        placeholder="Ingresa la dirección y selecciona desde las sugerencias"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {!GOOGLE_MAPS_API_KEY && (
                        <p className="mt-1 text-xs text-amber-600">
                          Configura <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> para habilitar las sugerencias de Google.
                        </p>
                      )}
                    </div>
                    <Input
                      label="Colonia"
                      name="asegurado_colonia"
                      value={extendedForm.asegurado.nuevo.colonia}
                      onChange={(event) => handleNuevoAseguradoChange("colonia", event.target.value)}
                      placeholder="Colonia o barrio"
                    />
                    <Input
                      label="Municipio / Delegación"
                      name="asegurado_municipio"
                      value={extendedForm.asegurado.nuevo.municipio}
                      onChange={(event) => handleNuevoAseguradoChange("municipio", event.target.value)}
                      placeholder="Municipio o delegación"
                    />
                    <Input
                      label="Código postal"
                      name="asegurado_codigo_postal"
                      value={extendedForm.asegurado.nuevo.codigo_postal}
                      onChange={(event) => handleNuevoAseguradoChange("codigo_postal", event.target.value)}
                      placeholder="00000"
                    />
                    <Input
                      label="País"
                      name="asegurado_pais"
                      value={extendedForm.asegurado.nuevo.pais}
                      onChange={(event) => handleNuevoAseguradoChange("pais", event.target.value)}
                      placeholder="México"
                    />
                    <Input
                      label="Estado"
                      name="asegurado_estado"
                      value={extendedForm.asegurado.nuevo.estado}
                      onChange={(event) => handleNuevoAseguradoChange("estado", event.target.value)}
                      placeholder="CDMX"
                    />
                    <Input
                      label="Ciudad"
                      name="asegurado_ciudad"
                      value={extendedForm.asegurado.nuevo.ciudad}
                      onChange={(event) => handleNuevoAseguradoChange("ciudad", event.target.value)}
                      placeholder="Ciudad"
                    />
                    <CustomSelect
                      label="Forma de contacto"
                      name="formaContacto"
                      value={extendedForm.asegurado.formaContacto}
                      onChange={(value) =>
                        setExtendedForm((prev) => ({
                          ...prev,
                          asegurado: { ...prev.asegurado, formaContacto: value as any },
                        }))
                      }
                      options={contactoPreferencia.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    label="Número de reporte"
                    name="numero_reporte"
                    value={extendedForm.generales.numero_reporte}
                    onChange={(event) => setGeneralesValue("numero_reporte", event.target.value)}
                    placeholder="REP-2025-0001"
                  />
                  <Input
                    label="Número de siniestro *"
                    name="numero_siniestro"
                    value={form.numero_siniestro}
                    onChange={onChange}
                    placeholder="SIN-2025-000001"
                  />
                  <Input
                    label="Fecha del siniestro *"
                    type="date"
                    name="fecha_siniestro"
                    value={form.fecha_siniestro}
                    onChange={onChange}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <CustomSelect
                    label="Proveniente"
                    name="proveniente_id"
                    value={extendedForm.generales.proveniente_id}
                    onChange={(value) => setGeneralesValue("proveniente_id", value as string)}
                    options={[
                      { value: "", label: "Seleccionar proveniente" },
                      ...provenienteOptions.map((option) => ({
                        value: option.id,
                        label: option.nombre,
                      })),
                    ]}
                  />
                  <CustomSelect
                    label="Institución"
                    name="institucion_id"
                    value={form.institucion_id}
                    onChange={(value) => {
                      const fakeEvent = {
                        target: { name: "institucion_id", value: value as string },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange(fakeEvent);
                      setGeneralesValue("institucion_id", value as string);
                    }}
                    options={[
                      { value: "", label: "Seleccionar institución" },
                      ...(instituciones && Array.isArray(instituciones) ? instituciones.map((option) => ({
                        value: String(option.id || ""),
                        label: option.nombre || String(option.id) || "Sin nombre",
                      })) : []),
                    ]}
                  />
                  <CustomSelect
                    label="Autoridad"
                    name="autoridad_id"
                    value={form.autoridad_id}
                    onChange={(value) => {
                      const fakeEvent = {
                        target: { name: "autoridad_id", value: value as string },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange(fakeEvent);
                      setGeneralesValue("autoridad_id", value as string);
                    }}
                    options={(() => {
                      const autoridadOptions = autoridades && Array.isArray(autoridades) 
                        ? autoridades.map((option) => ({
                            value: String(option.id || ""),
                            label: option.nombre || String(option.id) || "Sin nombre",
                          }))
                        : [];
                      console.log("Opciones de autoridades para el select:", autoridadOptions);
                      return [
                        { value: "", label: "Seleccionar autoridad" },
                        ...autoridadOptions,
                      ];
                    })()}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    label="Fecha inicio vigencia"
                    type="date"
                    name="fecha_inicio_vigencia"
                    value={extendedForm.generales.fecha_inicio_vigencia}
                    onChange={(event) => setGeneralesValue("fecha_inicio_vigencia", event.target.value)}
                  />
                  <Input
                    label="Fecha fin vigencia"
                    type="date"
                    name="fecha_fin_vigencia"
                    value={extendedForm.generales.fecha_fin_vigencia}
                    onChange={(event) => setGeneralesValue("fecha_fin_vigencia", event.target.value)}
                  />
                  <CustomSelect
                    label="Status *"
                    name="estado_id"
                    value={form.estado_id}
                    onChange={(value) => {
                      const fakeEvent = {
                        target: { name: "estado_id", value: value as string },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange(fakeEvent);
                    }}
                    options={[
                      { value: "", label: "Seleccionar status" },
                      ...estados.map((estado) => ({
                        value: estado.id,
                        label: estado.nombre || estado.id,
                      })),
                    ]}
                    required
                  />
                  <CustomSelect
                    label="Calificación"
                    name="calificacion"
                    value={extendedForm.generales.calificacion}
                    onChange={(value) => setGeneralesValue("calificacion", value as string)}
                    options={[
                      { value: "", label: "Sin calificación" },
                      ...(calificacionesCatalogo && calificacionesCatalogo.length > 0
                        ? calificacionesCatalogo.map((cal: any) => ({
                            value: cal.nombre || cal.id,
                            label: cal.nombre || cal.id,
                          }))
                        : calificaciones.map((option) => ({
                            value: option,
                            label: option,
                          }))),
                    ]}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <CustomSelect
                    label="Áreas"
                    name="areas_ids"
                    value={extendedForm.generales.areas_ids || []}
                    onChange={(value) => {
                      const areasArray = Array.isArray(value) ? value : [];
                      setGeneralesValue("areas_ids", areasArray);
                    }}
                    isMulti
                    options={areas.map((area) => ({
                      value: area.id,
                      label: area.nombre || area.id,
                    }))}
                    placeholder="Seleccionar áreas..."
                  />
                  <CustomSelect
                    label="Usuarios asignados"
                    name="usuarios_ids"
                    value={extendedForm.generales.usuarios_ids || []}
                    onChange={(value) => {
                      const usuariosArray = Array.isArray(value) ? value : [];
                      setGeneralesValue("usuarios_ids", usuariosArray);
                      // Actualizar abogado_id para referencia interna (primer usuario)
                      if (usuariosArray.length > 0) {
                        setGeneralesValue("abogado_id", usuariosArray[0]);
                      } else {
                        setGeneralesValue("abogado_id", "");
                      }
                    }}
                    isMulti
                    options={abogadoOptions.map((option) => ({
                      value: option.id,
                      label: option.nombre,
                    }))}
                    placeholder="Seleccionar usuarios..."
                  />
                  <CustomSelect
                    label="Prioridad"
                    name="prioridad"
                    value={form.prioridad}
                    onChange={(value) => {
                      const fakeEvent = {
                        target: { name: "prioridad", value: value as string },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange(fakeEvent);
                    }}
                    options={[
                      { value: "baja", label: "Baja" },
                      { value: "media", label: "Media" },
                      { value: "alta", label: "Alta" },
                      { value: "critica", label: "Crítica" },
                    ]}
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Pólizas relacionadas</h3>
                    <Button type="button" variant="ghost" onClick={handleAddPoliza}>
                      <FiPlus className="mr-2" /> Agregar póliza adicional
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {extendedForm.generales.polizas.map((poliza, index) => (
                      <div key={poliza.tempId} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            {index === 0 ? "Póliza principal" : `Póliza adicional ${index}`}
                          </span>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePoliza(index)}
                              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                            >
                              <FiTrash2 /> Quitar
                            </button>
                          )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-5">
                          <Input
                            label="Número"
                            name={`poliza_numero_${index}`}
                            value={poliza.numero_poliza}
                            onChange={(event) => handlePolizaFieldChange(index, "numero_poliza", event.target.value)}
                            placeholder="01-066-07007105-8-0"
                          />
                          <Input
                            label="Deducible"
                            type="number"
                            step="0.01"
                            min="0"
                            name={`poliza_deducible_${index}`}
                            value={poliza.deducible}
                            onChange={(event) => handlePolizaFieldChange(index, "deducible", event.target.value)}
                          />
                          <Input
                            label="Reserva"
                            type="number"
                            step="0.01"
                            min="0"
                            name={`poliza_reserva_${index}`}
                            value={poliza.reserva}
                            onChange={(event) => handlePolizaFieldChange(index, "reserva", event.target.value)}
                          />
                          <Input
                            label="Coaseguro"
                            type="number"
                            step="0.01"
                            min="0"
                            name={`poliza_coaseguro_${index}`}
                            value={poliza.coaseguro}
                            onChange={(event) => handlePolizaFieldChange(index, "coaseguro", event.target.value)}
                          />
                          <Input
                            label="Suma asegurada"
                            type="number"
                            step="0.01"
                            min="0"
                            name={`poliza_suma_${index}`}
                            value={poliza.suma_asegurada}
                            onChange={(event) => handlePolizaFieldChange(index, "suma_asegurada", event.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <Switch
                    label="Siniestro activo"
                    checked={form.activo}
                    onChange={(checked) => setForm((prevForm) => ({ ...prevForm, activo: checked }))}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Tipo de intervención"
                    name="tipo_intervencion"
                    value={extendedForm.especificos.tipo_intervencion}
                    onChange={(event) => setEspecificosValue("tipo_intervencion", event.target.value)}
                    placeholder="Ej. Jurídica"
                  />
                  <Input
                    label="Tercero involucrado"
                    name="tercero"
                    value={extendedForm.especificos.tercero}
                    onChange={(event) => setEspecificosValue("tercero", event.target.value)}
                    placeholder="Nombre del tercero"
                  />
                  <Input
                    label="Nicho"
                    name="nicho"
                    value={extendedForm.especificos.nicho}
                    onChange={(event) => setEspecificosValue("nicho", event.target.value)}
                    placeholder="Ej. Salud"
                  />
                  <Input
                    label="Materia"
                    name="materia"
                    value={extendedForm.especificos.materia}
                    onChange={(event) => setEspecificosValue("materia", event.target.value)}
                    placeholder="Ej. Penal"
                  />
                </div>

                <Input
                  label="Número de expediente"
                  name="expediente"
                  value={extendedForm.especificos.expediente}
                  onChange={(event) => setEspecificosValue("expediente", event.target.value)}
                  placeholder="EXP-2025-0001"
                />

                <RichTextEditor
                  label="Descripción de los hechos *"
                  value={extendedForm.especificos.descripcion_html}
                  onChange={(value) => setEspecificosValue("descripcion_html", value)}
                  placeholder="Describe con detalle lo ocurrido"
                />

                <div>
                  <label className="text-sm font-medium text-gray-700">Observaciones adicionales</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={4}
                    name="observaciones"
                    value={form.observaciones}
                    onChange={onChange}
                    placeholder="Notas internas, acuerdos o puntos a seguir"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-xl">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button type="button" variant="secondary" onClick={goPrev}>
                  Anterior
                </Button>
              )}
              <Button type={isLastStep ? "submit" : "button"} onClick={isLastStep ? undefined : goNext}>
                {isLastStep ? (editing ? "Actualizar" : "Crear") : "Siguiente"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

