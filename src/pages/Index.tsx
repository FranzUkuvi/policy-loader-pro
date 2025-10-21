import { useState, useMemo } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ProcessStepper } from "@/components/ProcessStepper";
import { ValidationSummary } from "@/components/ValidationSummary";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { EditRecordDialog, PolicyRecord } from "@/components/EditRecordDialog";

const steps = [
  { id: 1, title: "Cargar archivo", description: "Excel con datos" },
  { id: 2, title: "Validar datos", description: "Revisar registros" },
  { id: 3, title: "Corregir errores", description: "Editar si necesario" },
  { id: 4, title: "Confirmar", description: "Descargar resultados" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [records, setRecords] = useState<PolicyRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PolicyRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Datos cargados del archivo:", jsonData);
      console.log("Primera fila:", jsonData[0]);

      // Función helper para obtener valor de columna (case-insensitive)
      const getColumnValue = (row: any, columnNames: string[]): string => {
        for (const name of columnNames) {
          const keys = Object.keys(row);
          const matchedKey = keys.find(
            (key) => key.toLowerCase().trim() === name.toLowerCase().trim()
          );
          if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
            return String(row[matchedKey]).trim();
          }
        }
        return "";
      };

      // Procesar datos con las 29 columnas
      const processedRecords: PolicyRecord[] = jsonData.map((row: any, index) => {
        // Datos personales
        const nombre = getColumnValue(row, ["Nombre"]);
        const apellidoPaterno = getColumnValue(row, ["Apellido Paterno"]);
        const apellidoMaterno = getColumnValue(row, ["Apellido Materno"]);
        const rfc = getColumnValue(row, ["RFC"]);
        const genero = getColumnValue(row, ["Genero", "Género"]);
        const correo = getColumnValue(row, ["Correo", "Email"]);
        const telefono = getColumnValue(row, ["Telefono", "Teléfono"]);
        
        // Datos de la póliza
        const ramo = getColumnValue(row, ["Ramo"]);
        const subRamo = getColumnValue(row, ["Sub-Ramo", "SubRamo"]);
        const producto = getColumnValue(row, ["Producto"]);
        const aseguradora = getColumnValue(row, ["Aseguradora"]);
        const plan = getColumnValue(row, ["Plan"]);
        const numeroPoliza = getColumnValue(row, ["N° de Póliza", "Número de Póliza", "No de Poliza"]);
        
        // Fechas
        const inicioVigencia = getColumnValue(row, ["Inicio Vigencia"]);
        const finVigencia = getColumnValue(row, ["Fin Vigencia"]);
        const fechaEmision = getColumnValue(row, ["Fecha Emisión", "Fecha Emision"]);
        const fechaUltimoPago = getColumnValue(row, ["Fecha Último Pago", "Fecha Ultimo Pago"]);
        
        // Datos financieros
        const primaNeta = getColumnValue(row, ["Prima Neta Anual"]);
        const recargo = getColumnValue(row, ["Recargo"]);
        const derechoPoliza = getColumnValue(row, ["Derecho de Póliza", "Derecho de Poliza"]);
        const iva = getColumnValue(row, ["IVA"]);
        const porcentajeIva = getColumnValue(row, ["% IVA"]);
        const montoPrimaAnual = getColumnValue(row, ["Monto Prima Anual"]);
        
        // Otros
        const temporalidad = getColumnValue(row, ["Temporalidad"]);
        const diaCompromisoPago = getColumnValue(row, ["Día Compromiso de Pago", "Dia Compromiso de Pago"]);
        const moneda = getColumnValue(row, ["Moneda"]);
        const formaPago = getColumnValue(row, ["Forma de Pago"]);
        const metodoPago = getColumnValue(row, ["Método de Pago", "Metodo de Pago"]);
        const formaPagoDerechoPoliza = getColumnValue(row, ["Forma de Pago Derecho de Póliza", "Forma de Pago Derecho de Poliza"]);
        
        // Validaciones básicas
        let validationStatus: "valid" | "warning" | "error" = "valid";
        let validationMessage = "";
        
        if (!nombre || !numeroPoliza || !rfc) {
          validationStatus = "error";
          validationMessage = "Faltan campos obligatorios (Nombre, RFC o N° Póliza)";
        } else if (!correo || !aseguradora) {
          validationStatus = "warning";
          validationMessage = "Faltan campos recomendados";
        }
        
        return {
          id: index + 1,
          nombre,
          apellidoPaterno,
          apellidoMaterno,
          rfc,
          genero,
          correo,
          telefono,
          ramo,
          subRamo,
          producto,
          aseguradora,
          plan,
          numeroPoliza,
          inicioVigencia,
          finVigencia,
          fechaEmision,
          fechaUltimoPago,
          primaNeta,
          recargo,
          derechoPoliza,
          iva,
          porcentajeIva,
          montoPrimaAnual,
          temporalidad,
          diaCompromisoPago,
          moneda,
          formaPago,
          metodoPago,
          formaPagoDerechoPoliza,
          validationStatus,
          validationMessage,
        };
      });

      setRecords(processedRecords);
      setCurrentStep(2);
      
      toast({
        title: "Archivo cargado exitosamente",
        description: `Se procesaron ${processedRecords.length} registros`,
      });
    } catch (error) {
      toast({
        title: "Error al procesar el archivo",
        description: "Verifica que el archivo tenga el formato correcto",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validationStats = useMemo(() => {
    const valid = records.filter((r) => r.validationStatus === "valid").length;
    const warnings = records.filter((r) => r.validationStatus === "warning").length;
    const errors = records.filter((r) => r.validationStatus === "error").length;
    return { total: records.length, valid, warnings, errors };
  }, [records]);

  const handleEditRecord = (record: PolicyRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleSaveRecord = (updatedRecord: PolicyRecord) => {
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    toast({
      title: "Registro actualizado",
      description: "Los cambios se han guardado exitosamente",
    });
  };

  const columns: ColumnDef<PolicyRecord>[] = [
    {
      accessorKey: "validationStatus",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.validationStatus;
        return (
          <Badge
            variant={status === "valid" ? "success" : status === "warning" ? "warning" : "error"}
            className="gap-1"
          >
            {status === "valid" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {status === "valid" ? "Válido" : status === "warning" ? "Advertencia" : "Error"}
          </Badge>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => handleEditRecord(row.original)}>
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
    // Datos Personales
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "apellidoPaterno", header: "Apellido Paterno" },
    { accessorKey: "apellidoMaterno", header: "Apellido Materno" },
    { accessorKey: "rfc", header: "RFC" },
    { accessorKey: "genero", header: "Género" },
    { accessorKey: "correo", header: "Correo" },
    { accessorKey: "telefono", header: "Teléfono" },
    // Datos de la Póliza
    { accessorKey: "numeroPoliza", header: "N° de Póliza" },
    { accessorKey: "aseguradora", header: "Aseguradora" },
    { accessorKey: "ramo", header: "Ramo" },
    { accessorKey: "subRamo", header: "Sub-Ramo" },
    { accessorKey: "producto", header: "Producto" },
    { accessorKey: "plan", header: "Plan" },
    // Fechas
    { accessorKey: "inicioVigencia", header: "Inicio Vigencia" },
    { accessorKey: "finVigencia", header: "Fin Vigencia" },
    { accessorKey: "fechaEmision", header: "Fecha Emisión" },
    { accessorKey: "fechaUltimoPago", header: "Fecha Último Pago" },
    // Datos Financieros
    { accessorKey: "primaNeta", header: "Prima Neta Anual" },
    { accessorKey: "recargo", header: "Recargo" },
    { accessorKey: "derechoPoliza", header: "Derecho de Póliza" },
    { accessorKey: "iva", header: "IVA" },
    { accessorKey: "porcentajeIva", header: "% IVA" },
    { accessorKey: "montoPrimaAnual", header: "Monto Prima Anual" },
    // Otros
    { accessorKey: "temporalidad", header: "Temporalidad" },
    { accessorKey: "diaCompromisoPago", header: "Día Compromiso de Pago" },
    { accessorKey: "moneda", header: "Moneda" },
    { accessorKey: "formaPago", header: "Forma de Pago" },
    { accessorKey: "metodoPago", header: "Método de Pago" },
    { accessorKey: "formaPagoDerechoPoliza", header: "Forma de Pago Derecho Póliza" },
    // Mensaje de validación
    {
      accessorKey: "validationMessage",
      header: "Mensaje",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.validationMessage || "-"}</span>
      ),
    },
  ];

  const handleDownload = () => {
    const validRecords = records.filter((r) => r.validationStatus === "valid");
    const invalidRecords = records.filter((r) => r.validationStatus !== "valid");

    const wb = XLSX.utils.book_new();
    
    if (validRecords.length > 0) {
      const validWs = XLSX.utils.json_to_sheet(
        validRecords.map(({ id, validationStatus, validationMessage, ...rest }) => ({
          "Nombre": rest.nombre,
          "Apellido Paterno": rest.apellidoPaterno,
          "Apellido Materno": rest.apellidoMaterno,
          "RFC": rest.rfc,
          "Género": rest.genero,
          "Correo": rest.correo,
          "Teléfono": rest.telefono,
          "Ramo": rest.ramo,
          "Sub-Ramo": rest.subRamo,
          "Producto": rest.producto,
          "Aseguradora": rest.aseguradora,
          "Plan": rest.plan,
          "N° de Póliza": rest.numeroPoliza,
          "Inicio Vigencia": rest.inicioVigencia,
          "Fin Vigencia": rest.finVigencia,
          "Fecha Emisión": rest.fechaEmision,
          "Fecha Último Pago": rest.fechaUltimoPago,
          "Prima Neta Anual": rest.primaNeta,
          "Recargo": rest.recargo,
          "Derecho de Póliza": rest.derechoPoliza,
          "IVA": rest.iva,
          "% IVA": rest.porcentajeIva,
          "Monto Prima Anual": rest.montoPrimaAnual,
          "Temporalidad": rest.temporalidad,
          "Día Compromiso de Pago": rest.diaCompromisoPago,
          "Moneda": rest.moneda,
          "Forma de Pago": rest.formaPago,
          "Método de Pago": rest.metodoPago,
          "Forma de Pago Derecho de Póliza": rest.formaPagoDerechoPoliza,
        }))
      );
      XLSX.utils.book_append_sheet(wb, validWs, "Registros Válidos");
    }
    
    if (invalidRecords.length > 0) {
      const invalidWs = XLSX.utils.json_to_sheet(
        invalidRecords.map(({ id, validationStatus, ...rest }) => ({
          "Nombre": rest.nombre,
          "Apellido Paterno": rest.apellidoPaterno,
          "Apellido Materno": rest.apellidoMaterno,
          "RFC": rest.rfc,
          "Género": rest.genero,
          "Correo": rest.correo,
          "Teléfono": rest.telefono,
          "Ramo": rest.ramo,
          "Sub-Ramo": rest.subRamo,
          "Producto": rest.producto,
          "Aseguradora": rest.aseguradora,
          "Plan": rest.plan,
          "N° de Póliza": rest.numeroPoliza,
          "Inicio Vigencia": rest.inicioVigencia,
          "Fin Vigencia": rest.finVigencia,
          "Fecha Emisión": rest.fechaEmision,
          "Fecha Último Pago": rest.fechaUltimoPago,
          "Prima Neta Anual": rest.primaNeta,
          "Recargo": rest.recargo,
          "Derecho de Póliza": rest.derechoPoliza,
          "IVA": rest.iva,
          "% IVA": rest.porcentajeIva,
          "Monto Prima Anual": rest.montoPrimaAnual,
          "Temporalidad": rest.temporalidad,
          "Día Compromiso de Pago": rest.diaCompromisoPago,
          "Moneda": rest.moneda,
          "Forma de Pago": rest.formaPago,
          "Método de Pago": rest.metodoPago,
          "Forma de Pago Derecho de Póliza": rest.formaPagoDerechoPoliza,
          "Error": rest.validationMessage,
        }))
      );
      XLSX.utils.book_append_sheet(wb, invalidWs, "Registros con Errores");
    }

    XLSX.writeFile(wb, `polizas_procesadas_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Archivo descargado",
      description: `Se descargaron ${validRecords.length} registros válidos y ${invalidRecords.length} con errores`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Carga de Pólizas a CRM
            </h1>
          </div>
          <p className="text-muted-foreground">
            Carga, valida y limpia datos de pólizas para tu CRM de forma automatizada
          </p>
        </div>

        <Card className="p-6 mb-8 shadow-elegant">
          <ProcessStepper steps={steps} currentStep={currentStep} />
        </Card>

        {currentStep === 1 && (
          <Card className="p-8 shadow-elegant">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Comienza cargando tu archivo Excel
                </h2>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Layout
                </Button>
              </div>
              
              <FileUploader onFileSelect={handleFileSelect} />

              <div className="pt-4 border-t space-y-3">
                <h3 className="font-semibold text-foreground">Instrucciones</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Asegúrate de que tu archivo Excel contenga todas las columnas requeridas según el layout definido</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>El sistema validará automáticamente formatos, campos obligatorios y catálogos</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Los datos se limpiarán automáticamente cuando sea posible (caracteres especiales, formatos)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Podrás editar los registros con errores directamente en la tabla</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Al finalizar, descarga los reportes de registros válidos e inválidos</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {currentStep >= 2 && records.length > 0 && (
          <div className="space-y-6">
            <ValidationSummary
              total={validationStats.total}
              valid={validationStats.valid}
              warnings={validationStats.warnings}
              errors={validationStats.errors}
            />

            <Card className="p-6 shadow-elegant">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Resultados de la validación
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Cargar nuevo archivo
                  </Button>
                  <Button onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar resultados
                  </Button>
                </div>
              </div>

              <DataTable columns={columns} data={records} />
            </Card>

            <EditRecordDialog
              record={editingRecord}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onSave={handleSaveRecord}
            />

            {validationStats.valid > 0 && (
              <Card className="p-6 bg-success-light border-success/20">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-success mb-1">
                      {validationStats.valid} registros listos para cargar
                    </h3>
                    <p className="text-sm text-success/80">
                      Los registros válidos están listos para ser cargados al CRM. 
                      En la próxima fase conectaremos esta funcionalidad directamente a tu base de datos.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
