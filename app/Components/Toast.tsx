// ToastComponent.tsx
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "./toast.css"; // You can use Tailwind classes in this CSS file

interface ToastProps {
  msgtype: "success" | "error" | "invalid";
  message: string;
  onHide: () => void;
}

const ToastComponent: React.FC<ToastProps> = ({ msgtype, message, onHide }) => {
  const getIconAndColor = () => {
    let icon = null;
    let bgColor = "";

    switch (msgtype) {
      case "success":
        icon = faCheckCircle;
        bgColor = "text-green-500";
        break;
      case "error":
        icon = faTimesCircle;
        bgColor = "text-red-500";
        break;
      case "invalid":
        icon = faExclamationCircle;
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
      {icon && (
        <FontAwesomeIcon icon={icon} className={`${bgColor} mx-4 text-4xl`} />
      )}
      <p className="text-black">{message}</p>
      <button onClick={onHide} className="text-black ml-4 focus:outline-none">
        <FontAwesomeIcon icon={faXmark} className="text-black mr-4 text-2xl" />
      </button>
    </div>
  );
};

export default ToastComponent;
