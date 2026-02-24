import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function FileViewerPage({
  params,
}: {
  params: Promise<{ agentId: string; filePath: string }>;
}) {
  const { filePath } = await params;
  const decodedFilePath = decodeURIComponent(filePath);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <FileText className="size-5 text-accent" />
        <h1 className="text-xl font-bold font-mono text-text-primary">
          {decodedFilePath}
        </h1>
      </div>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            File Contents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            File viewer will render markdown with View / Edit / History tabs.
          </p>
          <div className="mt-4 rounded-lg border border-border bg-background p-4 font-mono text-xs text-text-muted">
            # {decodedFilePath}
            <br />
            <br />
            Content loading...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
