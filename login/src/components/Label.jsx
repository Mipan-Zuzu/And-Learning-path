const Label = (props) => {
  const { children, placeholder, type, ref } = props;
  return (
    <label htmlFor={children}>
      <input className="p-2 border border-gray-500 rounded-lg w-64" type={type} placeholder={placeholder} ref={ref} required/>
    </label>
  )
}

export default Label
