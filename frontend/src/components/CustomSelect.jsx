import React, { useEffect, useRef, useState } from 'react';

export default function CustomSelect({ value, onChange, options, placeholder = 'Select', required }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="custom-select" ref={wrapRef}>
      <button
        type="button"
        className="form-control custom-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span style={{ color: selected ? 'inherit' : '#9ca3af' }}>
          {selected ? selected.label : placeholder}
        </span>
      </button>
      {required && (
        <input
          tabIndex={-1}
          value={value || ''}
          onChange={() => {}}
          required
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
        />
      )}
      {open && (
        <ul className="custom-select-menu">
          {options.map((option) => (
            <li
              key={option.value}
              className={`custom-select-option ${option.value === value ? 'is-active' : ''}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
