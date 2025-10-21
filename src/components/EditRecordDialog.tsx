import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface PolicyRecord {
  id: number;
  // Datos personales
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rfc: string;
  genero: string;
  correo: string;
  telefono: string;
  // Datos de la póliza
  ramo: string;
  subRamo: string;
  producto: string;
  aseguradora: string;
  plan: string;
  numeroPoliza: string;
  // Fechas
  inicioVigencia: string;
  finVigencia: string;
  fechaEmision: string;
  fechaUltimoPago: string;
  // Datos financieros
  primaNeta: string;
  recargo: string;
  derechoPoliza: string;
  iva: string;
  porcentajeIva: string;
  montoPrimaAnual: string;
  // Otros
  temporalidad: string;
  diaCompromisoPago: string;
  moneda: string;
  formaPago: string;
  metodoPago: string;
  formaPagoDerechoPoliza: string;
  // Validación
  validationStatus: "valid" | "warning" | "error";
  validationMessage?: string;
}

interface EditRecordDialogProps {
  record: PolicyRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedRecord: PolicyRecord) => void;
}

export function EditRecordDialog({ record, open, onOpenChange, onSave }: EditRecordDialogProps) {
  const [formData, setFormData] = useState<PolicyRecord | null>(record);

  useEffect(() => {
    if (record) {
      setFormData(record);
    }
  }, [record]);

  const handleChange = (field: keyof PolicyRecord, value: string) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Editar Registro - Póliza {formData.numeroPoliza || formData.id}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Datos Personales */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input value={formData.nombre} onChange={(e) => handleChange("nombre", e.target.value)} />
                </div>
                <div>
                  <Label>Apellido Paterno</Label>
                  <Input value={formData.apellidoPaterno} onChange={(e) => handleChange("apellidoPaterno", e.target.value)} />
                </div>
                <div>
                  <Label>Apellido Materno</Label>
                  <Input value={formData.apellidoMaterno} onChange={(e) => handleChange("apellidoMaterno", e.target.value)} />
                </div>
                <div>
                  <Label>RFC</Label>
                  <Input value={formData.rfc} onChange={(e) => handleChange("rfc", e.target.value)} />
                </div>
                <div>
                  <Label>Género</Label>
                  <Input value={formData.genero} onChange={(e) => handleChange("genero", e.target.value)} />
                </div>
                <div>
                  <Label>Correo</Label>
                  <Input value={formData.correo} onChange={(e) => handleChange("correo", e.target.value)} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Datos de la Póliza */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Datos de la Póliza</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>N° de Póliza</Label>
                  <Input value={formData.numeroPoliza} onChange={(e) => handleChange("numeroPoliza", e.target.value)} />
                </div>
                <div>
                  <Label>Aseguradora</Label>
                  <Input value={formData.aseguradora} onChange={(e) => handleChange("aseguradora", e.target.value)} />
                </div>
                <div>
                  <Label>Ramo</Label>
                  <Input value={formData.ramo} onChange={(e) => handleChange("ramo", e.target.value)} />
                </div>
                <div>
                  <Label>Sub-Ramo</Label>
                  <Input value={formData.subRamo} onChange={(e) => handleChange("subRamo", e.target.value)} />
                </div>
                <div>
                  <Label>Producto</Label>
                  <Input value={formData.producto} onChange={(e) => handleChange("producto", e.target.value)} />
                </div>
                <div>
                  <Label>Plan</Label>
                  <Input value={formData.plan} onChange={(e) => handleChange("plan", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Fechas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Inicio Vigencia</Label>
                  <Input value={formData.inicioVigencia} onChange={(e) => handleChange("inicioVigencia", e.target.value)} />
                </div>
                <div>
                  <Label>Fin Vigencia</Label>
                  <Input value={formData.finVigencia} onChange={(e) => handleChange("finVigencia", e.target.value)} />
                </div>
                <div>
                  <Label>Fecha Emisión</Label>
                  <Input value={formData.fechaEmision} onChange={(e) => handleChange("fechaEmision", e.target.value)} />
                </div>
                <div>
                  <Label>Fecha Último Pago</Label>
                  <Input value={formData.fechaUltimoPago} onChange={(e) => handleChange("fechaUltimoPago", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Datos Financieros */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Datos Financieros</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prima Neta Anual</Label>
                  <Input value={formData.primaNeta} onChange={(e) => handleChange("primaNeta", e.target.value)} />
                </div>
                <div>
                  <Label>Recargo</Label>
                  <Input value={formData.recargo} onChange={(e) => handleChange("recargo", e.target.value)} />
                </div>
                <div>
                  <Label>Derecho de Póliza</Label>
                  <Input value={formData.derechoPoliza} onChange={(e) => handleChange("derechoPoliza", e.target.value)} />
                </div>
                <div>
                  <Label>IVA</Label>
                  <Input value={formData.iva} onChange={(e) => handleChange("iva", e.target.value)} />
                </div>
                <div>
                  <Label>% IVA</Label>
                  <Input value={formData.porcentajeIva} onChange={(e) => handleChange("porcentajeIva", e.target.value)} />
                </div>
                <div>
                  <Label>Monto Prima Anual</Label>
                  <Input value={formData.montoPrimaAnual} onChange={(e) => handleChange("montoPrimaAnual", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Otros Datos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Otros Datos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Temporalidad</Label>
                  <Input value={formData.temporalidad} onChange={(e) => handleChange("temporalidad", e.target.value)} />
                </div>
                <div>
                  <Label>Día Compromiso de Pago</Label>
                  <Input value={formData.diaCompromisoPago} onChange={(e) => handleChange("diaCompromisoPago", e.target.value)} />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Input value={formData.moneda} onChange={(e) => handleChange("moneda", e.target.value)} />
                </div>
                <div>
                  <Label>Forma de Pago</Label>
                  <Input value={formData.formaPago} onChange={(e) => handleChange("formaPago", e.target.value)} />
                </div>
                <div>
                  <Label>Método de Pago</Label>
                  <Input value={formData.metodoPago} onChange={(e) => handleChange("metodoPago", e.target.value)} />
                </div>
                <div>
                  <Label>Forma de Pago Derecho de Póliza</Label>
                  <Input value={formData.formaPagoDerechoPoliza} onChange={(e) => handleChange("formaPagoDerechoPoliza", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
