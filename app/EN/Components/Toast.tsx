// ToastComponent.tsx
import React from "react";
import { CheckCircle2, CircleX, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ToastProps {
  msgtype: "success" | "error" | "invalid";
  message: string;
  onHide: () => void;
}

const ToastComponent: React.FC<ToastProps> = ({ msgtype, message, onHide }) => {
  const getIconAndConfig = () => {
    let icon: React.ReactNode = null;
    
    switch (msgtype) {
      case "success":
        icon = <CheckCircle2 className="text-2xl" />;
        toast.success(message, {
          icon: icon,
          duration: 6000,
          onDismiss: onHide
        });
        break;
      case "error":
        icon = <CircleX className="text-2xl" />;
        toast.error(message, {
          icon: icon,
          duration: 6000,
          onDismiss: onHide
        });
        break;
      case "invalid":
        icon = <AlertCircle className="text-2xl" />;
        toast.warning(message, {
          icon: icon,
          duration: 6000,
          onDismiss: onHide
        });
        break;
      default:
        break;
    }
    
    return { icon };
  };

  // Trigger the toast immediately when component mounts
  React.useEffect(() => {
    getIconAndConfig();
  }, [message, msgtype]);

  // Return null as we're using the sonner toast directly
  return null;
};

export default ToastComponent;
