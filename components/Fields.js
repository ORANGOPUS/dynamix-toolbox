// Form controls for the settings panel.
import { useEffect, useRef, useState } from "react";

export function Field({ label, hint, children, wide = false }) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Section({ title, description, children, actions }) {
  return (
    <section className="settings-section">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {description && <p className="muted small">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function TextInput({ value, onChange, multiline = false, rows = 3, ...rest }) {
  return multiline ? (
    <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  ) : (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  );
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="toggle">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track"><span className="toggle-thumb" /></span>
      <span className="toggle-text">
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </span>
    </label>
  );
}

export function ColorInput({ label, value, onChange }) {
  // Keep typing local so a half-typed hex doesn't get thrown away.
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <Field label={label}>
      <span className="color-input">
        <input type="color" value={value.slice(0, 7)} onChange={(e) => onChange(e.target.value)} aria-label={`${label} picker`} />
        <input
          type="text"
          value={draft}
          spellCheck={false}
          onChange={(e) => {
            setDraft(e.target.value);
            if (/^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/.test(e.target.value)) onChange(e.target.value);
          }}
        />
      </span>
    </Field>
  );
}

export function Range({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <Field label={<>{label} <span className="range-value">{value}{unit}</span></>}>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  );
}

export function Select({ label, value, options, onChange }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => {
          const [key, name] = Array.isArray(option) ? option : [option, option];
          return <option key={key} value={key}>{name}</option>;
        })}
      </select>
    </Field>
  );
}

/** A row of buttons for a handful of choices. */
export function Segmented({ label, value, options, onChange }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="segmented" role="radiogroup" aria-label={typeof label === "string" ? label : undefined}>
        {options.map((option) => {
          const [key, name] = Array.isArray(option) ? option : [option, option[0].toUpperCase() + option.slice(1)];
          return (
            <button key={key} type="button" role="radio" aria-checked={value === key} className={value === key ? "on" : ""} onClick={() => onChange(key)}>
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * An editable list of objects, one card per item. `fields` describe the
 * inputs: { key, label, type: text|textarea|color|select, options, wide, show }.
 */
export function ListEditor({ items, fields, onChange, make, addLabel, title }) {
  const update = (index, key, value) => onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  const move = (index, by) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  };
  return (
    <div className="list-editor">
      {items.map((item, index) => (
        <div className="list-row" key={index}>
          {title && <div className="list-row-title">{title(item, index)}</div>}
          <div className="list-row-fields">
            {fields
              .filter((field) => !field.show || field.show(item))
              .map(({ key, label, type = "text", options, wide, placeholder }) => {
                const set = (value) => update(index, key, value);
                if (type === "color") return <ColorInput key={key} label={label} value={item[key]} onChange={set} />;
                if (type === "select") return <Select key={key} label={label} value={item[key]} options={typeof options === "function" ? options(item) : options} onChange={set} />;
                return (
                  <Field key={key} label={label} wide={wide || type === "textarea"}>
                    <TextInput value={item[key]} onChange={set} multiline={type === "textarea"} rows={2} placeholder={placeholder} />
                  </Field>
                );
              })}
          </div>
          <div className="row-actions">
            <button type="button" className="icon-button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">↑</button>
            <button type="button" className="icon-button" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move down">↓</button>
            <button type="button" className="icon-button" onClick={() => onChange([...items.slice(0, index + 1), { ...item }, ...items.slice(index + 1)])} aria-label="Duplicate">⧉</button>
            <button type="button" className="icon-button danger" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove">✕</button>
          </div>
        </div>
      ))}
      <button type="button" className="button ghost small" onClick={() => onChange([...items, make(items.length)])}>+ {addLabel}</button>
    </div>
  );
}

export function CopyButton({ text, children, className = "button ghost small" }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text());
          setCopied(true);
          timer.current = setTimeout(() => setCopied(false), 1500);
        } catch {
          window.prompt("Copy this:", text());
        }
      }}
    >
      {copied ? "Copied ✓" : children}
    </button>
  );
}
