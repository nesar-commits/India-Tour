import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from "../Icons.jsx";

const ICONS = { error: AlertCircleIcon, success: CheckCircleIcon, info: InfoIcon };

export default function FormAlert({ tone = "info", title, children }) {
  const Icon = ICONS[tone];
  return (
    <div className={`form-alert form-alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={18} className="form-alert-icon" />
      <div>
        {title && <p className="form-alert-title">{title}</p>}
        <p>{children}</p>
      </div>
    </div>
  );
}
