import { useRef, useState } from "react";

// Small form state hook: values, touched-based inline errors, focus-first-invalid on submit,
// and a guard against duplicate submissions.
export function useAuthForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [formError, setFormError] = useState(null);
  const fieldRefs = useRef({});
  const inFlight = useRef(false);

  const errors = validate(values);
  const visibleError = (name) => (touched[name] || attempted ? errors[name] : undefined);

  const field = (name) => {
    const isCheckbox = typeof initialValues[name] === "boolean";
    return {
      id: name,
      name,
      ref: (el) => (fieldRefs.current[name] = el),
      onChange: (e) => {
        const value = isCheckbox ? e.target.checked : e.target.value;
        setValues((v) => ({ ...v, [name]: value }));
        if (formError) setFormError(null);
      },
      onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
      error: visibleError(name),
      ...(isCheckbox ? { checked: values[name] } : { value: values[name] }),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    setAttempted(true);

    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    inFlight.current = true;
    setStatus("submitting");
    setFormError(null);
    try {
      await onSubmit(values);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setFormError(err);
    } finally {
      inFlight.current = false;
    }
  };

  return { values, field, handleSubmit, status, formError, submitting: status === "submitting" };
}
