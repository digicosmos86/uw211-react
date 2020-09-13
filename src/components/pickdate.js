import React from "react"

export default function DatePick(props) {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="block font-title font-bold text-lg mb-1"
      >
        {props.label}
      </label>
      <input
        type="date"
        className="block font-text text-2xl border-b outline-none border-darkgrey w-64 ml-4"
        name={props.name}
        id={props.id}
        value={props.value}
        onChange={props.onChange}
      >
      </input>
    </div>
  )
}
