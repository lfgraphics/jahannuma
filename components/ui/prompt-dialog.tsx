"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

export type PromptDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    defaultValue?: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    onSubmit: (value: string) => void;
    onCancel: () => void;
};

export const PromptDialog: React.FC<PromptDialogProps> = ({
    open,
    title,
    description,
    defaultValue = "",
    placeholder,
    confirmText = "OK",
    cancelText = "Cancel",
    onSubmit,
    onCancel,
}) => {
    const [value, setValue] = React.useState<string>(defaultValue);

    React.useEffect(() => {
        setValue(defaultValue ?? "");
    }, [defaultValue, open]);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) onCancel();
    };

    const handleSubmit = () => {
        onSubmit(value?.trim() ?? "");
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[360px] bg-background text-foreground border border-border p-0">
                <DialogHeader className="px-4 pt-4 mx-auto">
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>
                <div className="px-4 pb-4 space-y-3">
                    <div className="flex flex-col gap-1">
                        <Label className="text-sm" htmlFor="prompt-input">
                            {placeholder || "Value"}
                        </Label>
                        <Input
                            id="prompt-input"
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={onKeyDown}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onCancel}>
                            {cancelText}
                        </Button>
                        <Button onClick={handleSubmit}>{confirmText}</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PromptDialog;
