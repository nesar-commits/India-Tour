export default function Button({
  children,
  loading = false,
  loadingText,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} ${loading ? "is-loading" : ""} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      <span className="btn-label">{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}
