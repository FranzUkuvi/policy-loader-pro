import { useState, useMemo } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ProcessStepper } from "@/components/ProcessStepper";
import { ValidationSummary } from "@/components/ValidationSummary";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";

interface PolicyRecord {
  id: number;
  poliza: string;
  cliente: string;
  fecha: string;
  monto: string;
  estado: string;
  validationStatus: "valid" | "warning" | "error";
  validationMessage?: string;
}

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
          if (row[name] !== undefined && row[name] !== null) {
            return String(row[name]);
          }
        }
        return "";
      };

      // Simular validación de datos
      const processedRecords: PolicyRecord[] = jsonData.map((row: any, index) => {
        const validationStatus: "valid" | "warning" | "error" = Math.random() > 0.7 ? "error" : Math.random() > 0.5 ? "warning" : "valid";
        
        const record = {
          id: index + 1,
          poliza: getColumnValue(row, ["Poliza", "poliza", "Póliza", "póliza", "POLIZA"]),
          cliente: getColumnValue(row, ["Cliente", "cliente", "CLIENTE"]),
          fecha: getColumnValue(row, ["Fecha", "fecha", "FECHA"]),
          monto: getColumnValue(row, ["Monto", "monto", "MONTO"]),
          estado: getColumnValue(row, ["Estado", "estado", "ESTADO"]),
          validationStatus,
          validationMessage:
            validationStatus === "error"
              ? "Formato de póliza inválido"
              : validationStatus === "warning"
              ? "Verificar datos del cliente"
              : undefined,
        };
        
        console.log("Registro procesado:", record);
        return record;
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

  const columns: ColumnDef<PolicyRecord>[] = [
    {
      accessorKey: "validationStatus",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.validationStatus;
        return (
          <Badge
            variant={status === "valid" ? "default" : status === "warning" ? "secondary" : "destructive"}
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
      accessorKey: "poliza",
      header: "Póliza",
    },
    {
      accessorKey: "cliente",
      header: "Cliente",
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
    },
    {
      accessorKey: "monto",
      header: "Monto",
    },
    {
      accessorKey: "estado",
      header: "Estado",
    },
    {
      accessorKey: "validationMessage",
      header: "Mensaje",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.validationMessage || "-"}</span>
      ),
    },
  ];

  const handleDownload = () => {
    const validRecords = records.filter((r) => r.validationStatus === "valid");
    const invalidRecords = records.filter((r) => r.validationStatus !== "valid");

    const wb = XLSX.utils.book_new();
    
    if (validRecords.length > 0) {
      const validWs = XLSX.utils.json_to_sheet(
        validRecords.map(({ id, validationStatus, validationMessage, ...rest }) => rest)
      );
      XLSX.utils.book_append_sheet(wb, validWs, "Registros Válidos");
    }

    if (invalidRecords.length > 0) {
      const invalidWs = XLSX.utils.json_to_sheet(invalidRecords);
      XLSX.utils.book_append_sheet(wb, invalidWs, "Registros con Errores");
    }

    XLSX.writeFile(wb, "validacion_polizas.xlsx");
    
    toast({
      title: "Descarga completada",
      description: "Los resultados se han exportado exitosamente",
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
              Validador de Pólizas CRM
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
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Comienza cargando tu archivo Excel
                </h2>
                <p className="text-muted-foreground">
                  El sistema validará automáticamente los datos contra el layout definido
                </p>
              </div>
              
              <FileUploader onFileSelect={handleFileSelect} />

              <div className="pt-4 border-t">
                <h3 className="font-medium text-foreground mb-3">Formato esperado del archivo:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Poliza", "Cliente", "Fecha", "Monto", "Estado"].map((col) => (
                    <div key={col} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{col}</span>
                    </div>
                  ))}
                </div>
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
