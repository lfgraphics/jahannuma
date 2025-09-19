// ToastComponent.tsx
import React, { useEffect } from "react";
import { CheckCircle2, CircleX, AlertCircle, X } from "lucide-react";
import "./toast.css"; // You can use Tailwind classes in this CSS file

interface ToastProps {
  msgtype: "success" | "error" | "invalid";
  message: string;
  onHide: () => void;
}

const ToastComponent: React.FC<ToastProps> = ({ msgtype, message, onHide }) => {
  const getIconAndColor = () => {
  let icon: React.ReactNode = null;
    let bgColor = "";

    switch (msgtype) {
      case "success":
        icon = <CheckCircle2 className="mx-4 text-4xl" />;
        bgColor = "text-green-500";
        break;
      case "error":
        icon = <CircleX className="mx-4 text-4xl" />;
        bgColor = "text-red-500";
        break;
      case "invalid":
        icon = <AlertCircle className="mx-4 text-4xl" />;
        bgColor = "text-yellow-500";
        break;
      default:
        break;
    }

    return { icon, bgColor };
  };

  const { icon, bgColor } = getIconAndColor();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onHide();
    }, 6000); // Hide after 5 seconds

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onHide]);

  return (
    <div
      className={`toast`}
      //   onClick={clearTimeout(timeoutId)}
    >
      {icon && <span className={`${bgColor}`}>{icon}</span>}
      <p className="text-black">{message}</p>
      <button onClick={onHide} className="text-black ml-4 focus:outline-none">
        <X className="text-black mr-4 text-2xl" />
      </button>
    </div>
  );
};

export default ToastComponent;
