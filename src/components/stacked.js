import React, { useEffect, useState, useRef } from "react"
import { categoryOptions } from "../components/formElements"
import * as d3 from "d3"
import moment from "moment"
import Chart from "chart.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUndoAlt } from "@fortawesome/free-solid-svg-icons"

Chart.defaults.global.defaultFontFamily = '"Roboto"'
Chart.defaults.global.defaultFontSize = 14

const catColors = [
  "#114d93",
  "#2eb09f",
  "#1272e0",
  "#7ea4cf",
  "#e6001f",
  "#fc951e",
  "#5ae8d5",
  "#b0c94d",
  "#ad3b4a",
  "#eb6073",
]

const major_columns = Object.values(categoryOptions["Major Categories"])
const minor_columns = Object.values(categoryOptions["Minor Categories"])
const columns = major_columns.concat(minor_columns)

const colorScale = d3.scaleOrdinal().domain(columns).range(catColors)

const movingAverage = function (values, N) {
  const means = values.map((d, end) => {
    const start = end - N + 1
    return end < 0 ? 0 : Math.round(d3.sum(values.slice(start, end + 1)) / N)
  })
  return means
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            left: 0,
            top: 20
        }
    },
    title: {
        display: false,
    },
    legend: {
        display: false,
    },
    tooltips: {
        mode: "index",
        position: "nearest"
    },
    hover: {
        mode: 'index'
    },
    animation: {
        duration: 500
    },
    elements: {
        line: {
            tension: 0,
            borderWidth: 0
        },
        point: {
            radius: 0,
            borderWidth: 0,
            hoverRadius: 4,
            hoverBorderWidth: 1,
            hitRadius: 20,
            borderColor: "#333"
        }
    },
    scales: {
        xAxes: [{
            type: "time",
            ticks: {
                autoSkipPadding: 20,
                source: "auto",
                maxRotation: 0
            },
            gridLines: {
                drawOnChartArea: false,
                zeroLineColor: "#222"
            },
            scaleLabel: {
                display: false
            }
        }],
        yAxes: [{
            beforeBuildTicks: axis => { 
                axis.max = Math.max(axis.max, 20) 
            },
            stacked: true,
            gridLines: {
                drawOnChartArea: false,
                zeroLineColor: "#222"
            },
            scaleLabel: {
                display: false
            },
        }]
    }
}

export default function StackedChart(props) {
  const [showMinor, setShowMinor] = useState(false)
  const [showAvg, setShowAvg] = useState(false)
  const [chart, setChart] = useState(null)

  const ctx = useRef()

  useEffect(() => {
      if (chart) {
        const filteredData = filterData(props.filter, showAvg)
        setChart(chart => {
            chart.data = filteredData
            chart.update()
            return chart
        })
      }
  }, [props.filter, showAvg])

  useEffect(() => {
    const filteredData = filterData(props.filter, showAvg)
    const chart = new Chart(ctx.current.getContext('2d'), {
        type: "line",
        data: filteredData,
        options: chartOptions
    })
    
    setChart(chart)
  }, [])

  const legendItem = label => (
    <div className="align-top cursor-pointer" key={label} title={label}>
      <button 
        className="focus:outline-none"
        onClick={e => {
          e.preventDefault()
          props.setFilterState(prev => ({ ...prev, callType: label }))
        }}
      >
        <span
          className="inline-block mr-2 w-3 h-3 rounded-sm"
          style={{ backgroundColor: colorScale(label) }}
        ></span>
        {label.slice(0, 15) + (label.length > 15 ? "..." : "")}
      </button>
    </div>
  )

  function filterData(filter, avg) {
    if (filter.startDate == undefined || filter.endDate == undefined)
      return null

    const high = filter.endDate
    const low = filter.startDate

    if (new moment(high).isBefore(new moment(low))) return null

    const dates = props.data.columns.slice(2)

    let rawData = props.data.filter(d => d.city === filter.city)

    if (filter.callType === "All Categories") {
      rawData = rawData.filter(d => major_columns.includes(d.type))
    } else {
        rawData = rawData.filter(d => d.type == filter.callType)
    }

    const sliceArray = (arr, low, high) => arr.slice(
        dates.indexOf(low) == -1 ? 0 : dates.indexOf(low),
        (dates.indexOf(high) == -1 ? dates.length : dates.indexOf(high)) + 1
      )

    if (avg) {
      rawData = rawData.map(d => ({
        label: d.type,
        backgroundColor: colorScale(d.type),
        data: sliceArray(movingAverage(d.values, 7), low, high),
        order: columns.indexOf(d.type)
      }))
    } else {
      rawData = rawData.map(d => ({
        label: d.type,
        backgroundColor: colorScale(d.type),
        data: sliceArray(d.values, low, high),
        order: columns.indexOf(d.type)
      }))
    }

    return {
        labels: sliceArray(dates, low, high),
        datasets: rawData
    }
  }

  return (
    <div id="chart" className="font-text">
      <div className="font-title text-2xl font-bold">{props.title}</div>
      <div className="font-title text-xl">
        Number of calls in{" "}
        <b>
          {props.filter.callType.toLowerCase() +
            (props.filter.callType === "All Categories" ? "*" : "")}
        </b>{" "}
        over time
      </div>
      <div className="font-text text-base mt-1">
        Showing {showAvg ? "7-day moving averages " : "call volumes "}
        <b>{props.filter.startDate}</b> - <b>{props.filter.endDate}</b> in{" "}
        <b>
          {props.filter.city === "All Areas" ? "all areas" : props.filter.city}
        </b>
        <br />
        Click on any legend item to focus on that category
      </div>
      <div id="chart_tooltip"></div>
      <div id="chart_legend" className="font-text text-sm mt-4">
        <div id="chart-controls" className="font-text text-base">
          <span className="mr-2">
            <input
              id="show-minor"
              value={showMinor}
              type="checkbox"
              onChange={() => setShowMinor(!showMinor)}
              className="mr-1"
            />
            <label htmlFor="show-minor">Show minor categories in legend</label>
          </span>
          <span className="mr-2">
            <input
              id="toggle_avg"
              value={showAvg}
              type="checkbox"
              onChange={() => setShowAvg(!showAvg)}
              className="mr-1"
            />
            <label htmlFor="toggle_avg">Show 7-day moving averages</label>
          </span>
          <button className="focus:outline-none"
            onClick={() =>
              props.setFilterState(prev => ({
                ...prev,
                callType: "All Categories",
              }))
            }
          >
            <FontAwesomeIcon icon={faUndoAlt} size="sm" className="mr-1" /> Back
            to all categories
          </button>
        </div>
        <div
          id="legend_major"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-gap-2 mt-2"
        >
          {major_columns.map(legendItem)}
        </div>
        {showMinor ? (
          <div
            id="legend_minor"
            className="grid grid-cols-3 sm:grid-cols-4 grid-gap-2 mt-4"
          >
            {minor_columns.map(legendItem)}
          </div>
        ) : (
          ""
        )}
      </div>
      <div style={{ height: "400px"}}>
        <canvas id="stacked-chart" ref={ctx}  />
      </div>
      {props.filter.callType === "All Categories" ? (
        <div className="note">
          {"*"} Showing calls in major categories only.
        </div>
      ) : (
        ""
      )}
    </div>
  )
}
