import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-sm border border-border/60 bg-card rounded-none shadow-2xl font-sans text-center">
        <CardHeader className="space-y-1.5 border-b border-border/40 pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 border border-destructive/20 bg-destructive/[0.02] text-destructive">
              <AlertCircle className="h-6 w-6 stroke-[1.5]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold uppercase tracking-wider text-foreground">
            404 // Not Found
          </CardTitle>
          <CardDescription className="font-medium uppercase text-[10px] tracking-widest text-muted-foreground">
            Transmission Error
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6 p-8">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            The requested resource is currently unreachable. The link might be expired or the pipeline address is incorrect.
          </p>

          <Button 
            asChild 
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-[11px] tracking-widest rounded-none py-6 transition-opacity"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to primary node
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}