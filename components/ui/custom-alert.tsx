"use client";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CustomAlertProps {
    /** Visual style of the alert (color/intent). */
    variant?: "default" | "destructive" | "success" | "warning" | "info";
    /** Optional heading text displayed above the description. */
    title?: string;
    /** Main message/content of the alert. */
    description: string;
    /** Optional icon element rendered before the content. */
    icon?: React.ReactNode;
    /** Show a close (dismiss) button when true. */
    dismissible?: boolean;
    /** Called when the alert is dismissed (via button or auto-dismiss). */
    onDismiss?: () => void;
    /** Auto-dismiss delay in milliseconds (positive number, requires onDismiss). */
    autoDismissMs?: number;
}

export function CustomAlert({ variant = "default", title, description, icon, dismissible = false, onDismiss, autoDismissMs, }: CustomAlertProps) {
    const { isRTL } = useLanguage();
    React.useEffect(() => {
        if (autoDismissMs && autoDismissMs > 0 && onDismiss) {
            const t = setTimeout(() => onDismiss(), autoDismissMs);
            return () => clearTimeout(t);
        }
    }, [autoDismissMs, onDismiss]);

    return (
        <Alert variant={variant} className={isRTL ? "text-right" : undefined}>
            {icon}
            <div className="flex items-start gap-2">
                <div className="flex-1">
                    {title ? <AlertTitle>{title}</AlertTitle> : null}
                    <AlertDescription>{description}</AlertDescription>
                </div>
                {dismissible && onDismiss ? (
                    <button aria-label="dismiss" className="ml-2 text-muted-foreground hover:text-foreground" onClick={onDismiss}>
                        <X className="h-4 w-4" />
                    </button>
                ) : null}
            </div>
        </Alert>
    );
}

export default CustomAlert;
