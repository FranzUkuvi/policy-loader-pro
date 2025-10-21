import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ValidationSummaryProps {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
}

export const ValidationSummary = ({ total, valid, warnings, errors }: ValidationSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <div className="w-5 h-5 text-foreground font-semibold">#</div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{total}</p>
            <p className="text-sm text-muted-foreground">Total registros</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-success/20 bg-success-light">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{valid}</p>
            <p className="text-sm text-success/80">Válidos</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-warning/20 bg-warning-light">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{warnings}</p>
            <p className="text-sm text-warning/80">Advertencias</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-error/20 bg-error-light">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-error/10">
            <XCircle className="w-5 h-5 text-error" />
          </div>
          <div>
            <p className="text-2xl font-bold text-error">{errors}</p>
            <p className="text-sm text-error/80">Errores</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
