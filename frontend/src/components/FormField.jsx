const FormField = ({ id, label, value, onChange, type = 'text', options, emptyLabel = 'Select category', required = false, ...attributes }) => (
  <div className="mb-3">
    <label className="form-label" htmlFor={id}>{label}</label>
    {options ? (
      <select className="form-select" id={id} value={value} onChange={onChange} required={required} {...attributes}>
        {options.map((option) => <option key={option} value={option}>{option || emptyLabel}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea className="form-control" id={id} value={value} onChange={onChange} rows="2" {...attributes} />
    ) : (
      <input className="form-control" id={id} type={type} value={value} onChange={onChange} required={required} {...attributes} />
    )}
  </div>
);

export default FormField;
