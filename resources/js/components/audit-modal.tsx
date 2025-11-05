import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Badge
} from "@/components/ui/badge";
import { X, User, Calendar, FileText, Tag, RefreshCw } from "lucide-react";

interface AuditLog {
  id: number;
  log_name: string;
  description: string;
  event: string | null;
  subject_type: string | null;
  causer: { id: number; first_name: string; last_name: string } | null;
  properties: any;
  created_at: string;
}

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

const formatValue = (value: any) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  // Handle objects and arrays by converting them to a formatted JSON string
  // and wrapping them in a <pre> tag with the correct classes.
  if (typeof value === "object") {
    const jsonString = JSON.stringify(value, null, 2);
    return (
      <pre className="whitespace-pre-wrap font-mono text-xs overflow-auto max-h-40">
        {jsonString}
      </pre>
    );
  }

  return String(value);
};

const renderProperties = (properties: any) => {
  if (!properties || Object.keys(properties).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground border rounded-lg">
        <RefreshCw className="h-10 w-10 mb-2 opacity-50" />
        <p>No changes recorded</p>
      </div>
    );
  }

  try {
    const parsed = typeof properties === "string" ? JSON.parse(properties) : properties;

    // 🔹 Detect array of employees with employee_id + name
    if (Array.isArray(parsed) && parsed.every((p) => p.employee_id && p.name)) {
      return (
        <div className="border rounded-lg">
          <div className="p-4 bg-muted/30 border-b rounded-t-lg">
            <div className="text-sm font-semibold">Synced Employees</div>
          </div>
          <div className="p-4 space-y-4">
            {parsed.map((emp, index) => (
              <div key={index} className="p-3 border rounded-md bg-muted/30">
                <p><span className="font-medium">Name:</span> {emp.name}</p>
                <p><span className="font-medium">Employee ID:</span> {emp.employee_id.replace(/^'+/, "")}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (parsed.attributes || parsed.old) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {parsed.old && Object.keys(parsed.old).length > 0 && (
            <div className="border border-destructive/30 rounded-lg">
              <div className="p-4 bg-destructive/5 border-b border-destructive/30 rounded-t-lg">
                <div className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Previous Values
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {Object.entries(parsed.old).map(([key, value]) => (
                    <div key={key} className="flex flex-col border-b border-destructive/10 pb-3 last:border-0 last:pb-0">
                      <span className="font-medium text-sm text-muted-foreground mb-1">{key}</span>
                      <div className="font-mono text-xs break-all p-2 bg-muted/50 rounded-md">
                        {formatValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {parsed.attributes && Object.keys(parsed.attributes).length > 0 && (
            <div className="border border-success/30 rounded-lg">
              <div className="p-4 bg-success/5 border-b border-success/30 rounded-t-lg">
                <div className="text-sm font-semibold text-success flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Updated Values
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {Object.entries(parsed.attributes).map(([key, value]) => (
                    <div key={key} className="flex flex-col border-b border-success/10 pb-3 last:border-0 last:pb-0">
                      <span className="font-medium text-sm text-muted-foreground mb-1">{key}</span>
                      <div className="font-mono text-xs break-all p-2 bg-muted/50 rounded-md">
                        {formatValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="border rounded-lg">
        <div className="p-4 bg-muted/30 border-b rounded-t-lg">
          <div className="text-sm font-semibold">Properties</div>
        </div>
        <div className="p-4 space-y-3">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="flex flex-col border-b pb-3 last:border-0 last:pb-0">
              <span className="font-medium text-sm text-muted-foreground mb-1">{key}</span>
              <div className="font-mono text-xs break-all p-2 bg-muted/50 rounded-md">
                {formatValue(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (e) {
    return (
      <div className="border rounded-lg">
        <div className="p-4 bg-muted/30 border-b rounded-t-lg">
          <div className="text-sm font-semibold">Raw Properties</div>
        </div>
        <div className="p-4">
          <div className="p-3 bg-muted rounded-md">
            <pre className="whitespace-pre-wrap font-mono text-xs overflow-auto max-h-40">
              {String(properties)}
            </pre>
          </div>
        </div>
      </div>
    );
  }
};

export default function AuditLogModal({ isOpen, onClose, log }: AuditLogModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Log Details
            </DialogTitle>
          </div>
          <DialogDescription>
            Detailed information about this Audit log entry
          </DialogDescription>
        </DialogHeader>

        {log ? (
          <div className="grid gap-6 py-2">

            {/* Summary Section */}
            <div className="space-y-4">
              <div className="grid gap-1 border-b last:border-b-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <p className="text-base">{log.description || "-"}</p>
              </div>
              <div className="grid gap-1 border-b last:border-b-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Event</span>
                <p className="text-base">{log.event || "N/A"}</p>
              </div>
              <div className="grid gap-1 border-b last:border-b-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">User</span>
                <p className="text-base">
                  {log.causer
                    ? `${log.causer.first_name?.charAt(0)}.${log.causer.last_name}`
                    : "-"}
                </p>
              </div>
              <div className="grid gap-1 border-b last:border-b-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">Date</span>
                <p className="text-base">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Changes Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                Changes
              </h4>
              {renderProperties(log.properties)}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p>No log details available</p>
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}