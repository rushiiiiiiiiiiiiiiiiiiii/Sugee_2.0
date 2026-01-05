import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
  import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster font-inter"
      position="top-right"
      expand
      closeButton
      toastOptions={{
        style: {
          borderRadius: "1rem",
          padding: "1rem 1.25rem",
          border: "1px solid hsl(var(--border))",
          background: "hsl(var(--background))",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          backdropFilter: "blur(8px)",
        },
        classNames: {
          toast: cn(
            "group flex items-start gap-3 toast",
            "group-[.toaster]:bg-background/90 group-[.toaster]:backdrop-blur-md",
            "group-[.toaster]:text-foreground group-[.toaster]:border-border",
            "transition-all duration-300 ease-in-out",
            "hover:translate-x-1 hover:shadow-lg"
          ),
          description:
            "group-[.toast]:text-muted-foreground text-sm mt-0.5 leading-snug",
          actionButton: cn(
            "group-[.toast]:bg-primary/90 group-[.toast]:hover:bg-primary",
            "group-[.toast]:text-primary-foreground rounded-md",
            "px-3 py-1.5 text-sm transition-all shadow-sm"
          ),
          cancelButton: cn(
            "group-[.toast]:bg-muted/60 group-[.toast]:hover:bg-muted",
            "group-[.toast]:text-muted-foreground rounded-md",
            "px-3 py-1.5 text-sm transition-all"
          ),
        },
        icons: {
          success: <CheckCircle2 className="text-green-500" size={22} />,
          error: <XCircle className="text-red-500" size={22} />,
          info: <Info className="text-blue-500" size={22} />,
          warning: <AlertTriangle className="text-amber-500" size={22} />,
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
