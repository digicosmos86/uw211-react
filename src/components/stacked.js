import React, { useEffect, useState } from "react"
import { categoryOptions } from "../components/formElements"
import * as d3 from "d3"
import moment from "moment"
import { interpolatePath } from "d3-interpolate-path"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUndoAlt } from "@fortawesome/free-solid-svg-icons"

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

export default function Chart(props) {
  const chartHeight = 400
  const margin = { top: 10, right: 30, bottom: 30, left: 30 }
  const [showMinor, setShowMinor] = useState(false)
  const [showAvg, setShowAvg] = useState(false)
  const [chart, setChart] = useState(null)

  let handleResize

  useEffect(() => {
    if (chart) {
      chart.updateChart(props.filter, showAvg)
      window.removeEventListener("resize", handleResize)
      handleResize = function () {
        chart.updateChart(props.filter, showAvg)
      }
      window.addEventListener("resize", handleResize)
    } else {
      const chart = initChart()
      setChart(chart)
      handleResize = function () {
        chart.updateChart(props.filter, showAvg)
      }
      window.addEventListener("resize", handleResize)
    }
  }, [props.filter, showAvg])

  const legendItem = label => (
    <div className="align-top cursor-pointer" key={label} title={label}>
      <a
        href="#"
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
      </a>
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
    }

    if (avg) {
      rawData = rawData.map(d => ({
        key: d.type,
        values: movingAverage(d.values, 7).slice(
          dates.indexOf(low) == -1 ? 0 : dates.indexOf(low),
          (dates.indexOf(high) == -1 ? dates.length : dates.indexOf(high)) + 1
        ),
      }))
    } else {
      rawData = rawData.map(d => ({
        key: d.type,
        values: d.values.slice(
          dates.indexOf(low) == -1 ? 0 : dates.indexOf(low),
          (dates.indexOf(high) == -1 ? dates.length : dates.indexOf(high)) + 1
        ),
      }))
    }

    let nestedData = rawData[0].values.map(() => {
      return {}
    })

    rawData.forEach(row =>
      row.values.forEach((d, i) => (nestedData[i][row.key] = d))
    )

    const columns =
      filter.callType === "All Categories" ? major_columns : [filter.callType]

    const stackedData = d3.stack().keys(columns)(nestedData)

    return stackedData
  }

  function initChart() {
    let data = filterData(props.filter, showAvg)

    let width = getProperty("#chart", "width") - margin.left - margin.right
    const height = chartHeight - margin.top - margin.bottom

    const svg = d3
      .select("#svg_chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.left + margin.right)

    let g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    let domainLeft = new moment(props.filter.startDate).isBefore(
      new moment(props.filter.dateRange[0])
    )
      ? new Date(props.filter.dateRange[0])
      : new Date(props.filter.startDate)

    let domainRight = new moment(props.filter.endDate).isAfter(
      new moment(props.filter.dateRange[1])
    )
      ? new Date(props.filter.dateRange[1])
      : new Date(props.filter.endDate)

    let x = d3.scaleUtc().domain([domainLeft, domainRight]).range([0, width])

    let xAxis = g
      .append("g")
      .attr("id", "x_axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.utcFormat("%b %-d")))

    console.log(data)

    let y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max([
          20,
          d3.max(data.map(d => d3.max(d.map(d1 => d3.max(d1))))) * 1.1,
        ]),
      ])
      .range([height, 0])

    console.log(y.domain())

    let yAxis = g
      .append("g")
      .attr("id", "y_axis")
      .call(d3.axisLeft(y).ticks(10))

    const color = colorScale

    let ticks = x.ticks(d3.utcDay)
    let ticksX = ticks.map(x)

    let stacks = g.append("g").attr("id", "stack").selectAll("path")

    let paths = stacks.data(data).enter().append("path")

    let area = d3
      .area()
      .x(function (d, i) {
        return x(ticks[i])
      })
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))

    paths
      .attr("fill", d => color(d.key))
      .on("mousemove", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .attr("class", "area")
      .attr("d", area)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .attr("opacity", 1)

    const handleClick = d =>
      props.setFilterState(prev => ({ ...prev, callType: d }))

    let interactive = svg
      .append("g")
      .attr("id", "guide")
      .on("mouseover", function () {
        d3.select(this).style("visibility", "visible")
        d3.select("#chart_tooltip").style("visibility", "visible")
      })
      .on("mouseout", handleMouseOut)

    interactive
      .append("line")
      .attr("id", "vertline")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", height)

    let circles = interactive.selectAll("circle").data(data)

    circles.enter().append("circle")

    function excludeSegment(a, b) {
      return a.x === b.x
    }

    function handleMouseOver() {
      // obtain cursor location
      let data = d3.select("#stack").selectAll("path").data()

      let mouseX = d3.mouse(this)[0]
      let left = d3.bisectLeft(ticksX, mouseX) - 1

      let pos =
        Math.abs(mouseX - ticksX[left]) < Math.abs(mouseX - ticksX[left + 1])
          ? left
          : left + 1

      interactive
        .attr(
          "transform",
          `translate(${margin.left + ticksX[pos]} ${margin.top})`
        )
        .style("visibility", "visible")

      interactive
        .selectAll("circle")
        .data(data)
        .join(
          enter =>
            enter
              .append("circle")
              .attr("r", 3)
              .attr("cy", d => y(d[pos][1]))
              .attr("fill", d => color(d.key))
              .attr("stroke-width", 1)
              .attr("stroke", "#333"),
          update =>
            update
              .attr("r", 3)
              .attr("cy", d => y(d[pos][1]))
              .attr("fill", d => color(d.key))
              .attr("stroke-width", 1)
              .attr("stroke", "#333"),
          exit => exit.remove()
        )

      let lineLeft = interactive
        .select("#vertline")
        .node()
        .getBoundingClientRect().x

      let datum = d3.select(this).datum()

      let date = moment(ticks[pos]).format("YYYY-MM-DD")
      let type = datum.key
      let value = +datum[pos].data[type]

      d3.select("#chart_tooltip")
        .html(`<h6>${date}</h6><span>${type}: </span>${value}`)
        .style("visibility", "visible")
        .style("left", lineLeft + 10 + "px")
        .style("top", d3.event.pageY + 10 + "px")
    }

    function handleMouseOut() {
      interactive.style("visibility", "hidden")

      d3.select("#chart_tooltip").style("visibility", "hidden")
    }

    function updateChart(filter, showAvg) {
      let data = filterData(filter, showAvg)

      width = getProperty("#chart", "width") - margin.left - margin.right

      svg.attr("width", width + margin.left + margin.right)

      if (data == null) return

      let domainLeft = new moment(filter.startDate).isBefore(
        new moment(filter.dateRange[0])
      )
        ? new Date(filter.dateRange[0])
        : new Date(filter.startDate)

      let domainRight = new moment(filter.endDate).isAfter(
        new moment(filter.dateRange[1])
      )
        ? new Date(filter.dateRange[1])
        : new Date(filter.endDate)

      // update x axis
      x = x.domain([domainLeft, domainRight]).range([0, width])

      xAxis
        .attr("transform", `translate(0,${height})`)
        .transition()
        .duration(500)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.utcFormat("%b %-d")))

      // update y axix
      y = y
        .domain([
          0,
          d3.max([
            20,
            d3.max(data.map(d => d3.max(d.map(d1 => d3.max(d1))))) * 1.1,
          ]),
        ])
        .range([height, 0])

      yAxis.attr("id", "y_axis").transition().duration(500).call(d3.axisLeft(y))

      ticks = x.ticks(d3.utcDay)
      ticksX = ticks.map(x)

      let stacks = d3.select("#stack").selectAll("path").data(data)

      let t = d3
        .transition()
        .duration(500)
        .delay((d, i) => 100 * i)

      stacks.join(
        enter =>
          enter
            .append("path")
            .attr("class", "area")
            .attr("fill", d => color(d.key))
            .attr("d", area)
            .attr("opacity", 0)
            .on("mousemove", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .call(enter => enter.transition(t).attr("opacity", 1)),
        update =>
          update
            .attr("fill", d => color(d.key))
            .call(update =>
              update
                .transition()
                .duration(500)
                .attr("opactiy", 1)
                .attrTween("d", function (d) {
                  let previous = d3.select(this).attr("d")
                  let current = area(d)
                  return interpolatePath(previous, current, excludeSegment)
                })
            ),
        exit => exit.transition().duration(500).attr("opacity", 0).remove()
      )
    }

    function getProperty(id, property) {
      let width = d3.select(id).style(property)
      width = +width.substring(0, width.length - 2)
      return width
    }

    return {
      updateChart,
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
      <svg id="svg_chart" />
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
