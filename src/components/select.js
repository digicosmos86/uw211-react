import React from "react"

export default function InputSelect(props) {
  const options = ([label, value]) => (
    <option
      key={label}
      className="text-xl"
      value={value}
      title={label}
    >
      {label}
    </option>
  )

  const children = props.grouped
    ? Object.entries(props.options).map(([groupLabel, subgroup]) => {
        return (
          <optgroup
            className="text-xl font-bold"
            label={groupLabel}
            key={groupLabel}
          >
            {Object.entries(subgroup).map(options)}
          </optgroup>
        )
      })
    : Object.entries(props.options).map(options)

  return (
    <div>
      <label
        htmlFor={props.id}
        className="block font-title font-bold text-lg mb-1"
      >
        {props.label}
      </label>
      <select
        className="block font-text text-2xl border-b outline-none border-darkgrey w-64 ml-4"
        name={props.name}
        id={props.id}
        value={props.value}
        onChange={props.onChange}
      >
        {children}
      </select>
    </div>
  )
}
