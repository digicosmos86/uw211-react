import React, { useEffect, useState } from "react"
import * as d3 from "d3"
import moment from "moment"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUndoAlt } from "@fortawesome/free-solid-svg-icons"

export default function MapRI(props) {
  const [map, setMap] = useState(null)
  const [table, setTable] = useState({})

  useEffect(() => {
    if (map) {
      const filteredData = filterData(props.filter)
      updateTable(filteredData, props.filter)
      map.updateMap(filteredData, props.filter)
    } else {
      const map = initMap()
      const filteredData = filterData(props.filter)
      updateTable(filteredData, props.filter)
      setMap(map)
    }
  }, [props.filter])

  function filterData(options) {
    if (options.startDate == undefined || options.endDate == undefined)
      return null

    let high = options.endDate
    let low = options.startDate

    if (new moment.utc(high).isBefore(new moment.utc(low))) return null

    let columns = props.data.columns.slice(2)

    let mapData = props.data
      .filter(d => d.type === options.callType)
      .map(d => ({
        city: d.city,
        type: d.type,
        values: d3.sum(
          d.values.slice(
            columns.indexOf(low) == -1 ? 0 : columns.indexOf(low),
            (columns.indexOf(high) == -1
              ? columns.length
              : columns.indexOf(high)) + 1
          )
        ),
      }))

    return mapData
  }

  function updateTable(mapData, filter) {
    if (!mapData) return

    const total =
      filter.callType === "All Categories"
        ? d3.sum(mapData, d => d.values)
        : mapData.find(d => d.city === "All Areas").values

    const outOfState = mapData.find(d => d.city === "Other").values

    const inState = total - outOfState
    setTable(prev => ({ prev, inState, outOfState, total }))
  }

  function initMap() {
    const shape = props.mapShape

    const projection = d3
      .geoTransverseMercator()
      .rotate([70.65 + 30 / 60, -41.64 - 5 / 60])
      .scale(47000)

    const path = d3.geoPath().projection(projection)

    let svg = d3.select("#svg_map").attr("viewBox", "0 0 550 620")

    svg
      .selectAll("path")
      .data(shape)
      .enter()
      .append("path")
      .attr(
        "id",
        d => "city" + d.id.replace(" ", "").toLowerCase().substring(0, 6)
      )
      .attr("d", path)
      .attr("fill", "white")
      .attr("class", "city")
      .on("click", d =>
        props.setFilterState(prev => ({
          ...prev,
          city: d.id.replace(
            /\w\S*/g,
            txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          ),
        }))
      )

    let legendData = d3.quantize(d3.interpolateRgb("#ffffff", "#114D93"), 6)

    d3.select("#gradient")
      .selectAll("rect")
      .data(legendData)
      .enter()
      .append("span")
      .attr("class", "legend_span")
      .style("background-color", d => d)

    function handleMouseOver(d, filter) {
      let html =
        "City/Town: " +
        d.city +
        "<br />" +
        "Type: " +
        filter.callType +
        "<br />" +
        "Call Counts: " +
        d.values

      d3.select(".tooltip")
        .html(html)
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px")
        .style("visibility", "visible")
    }

    function handleMouseOut() {
      d3.select(".tooltip").style("visibility", "hidden")
    }

    function updateMap(mapData, filter) {
      if (!mapData) return

      if (filter.callType !== "All Categories") {
        mapData = mapData.filter(d => d.city !== "All Areas")
      }

      let dataRangePer1000 = d3.extent(
        mapData.map(d => d.values / (props.pops[d.city] / 1000))
      )

      let colorScale = d3
        .scaleSequential()
        .domain(dataRangePer1000)
        .interpolator(d3.interpolateRgb("#ffffff", "#114D93"))

      mapData.forEach(d =>
        d3
          .select(
            "path#city" + d.city.replace(" ", "").toLowerCase().substring(0, 6)
          )
          .on("mouseover", () => handleMouseOver(d, filter))
          .on("mouseout", handleMouseOut)
          .transition()
          .duration(1000)
          .attr("fill", colorScale(d.values / (props.pops[d.city] / 1000)))
      )
    }

    const filteredData = filterData(props.filter)
    updateMap(filteredData, props.filter)

    return {
      updateMap,
    }
  }

  return (
    <div id="map" className="font-text">
      <div className="font-title text-2xl font-bold">{props.title}</div>
      <div className="font-title text-xl">
        Total number of calls in{" "}
        <b>
          {props.filter.callType.toLowerCase() +
            (props.filter.callType === "All Categories" ? "*" : "")}
        </b>{" "}
        across RI
      </div>
      <div className="font-text text-base mt-1">
        Accumulating calls{" "}
        <b>{props.filter.startDate}</b> -<b>{props.filter.endDate}</b>
        <br />
        Click on any map tile to focus on that region
      </div>
      <div id="legend_wrapper">
        <div id="table_wrapper">
          <table>
            <tbody>
              <tr>
                <td className="row_header">Total calls:</td>
                <td>{table.total}</td>
              </tr>
              <tr>
                <td className="row_header">From RI:</td>
                <td>{table.inState}</td>
              </tr>
              <tr>
                <td className="row_header">Out-of-state/Location Unknown:</td>
                <td>{table.outOfState}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div id="legend">
          <div id="all_areas">
            <a
              href="#"
              onClick={() =>
                props.setFilterState(prev => ({ ...prev, city: "All Areas" }))
              }
            >
              <FontAwesomeIcon icon={faUndoAlt} size="sm" className="mr-1" />
              Back to all areas
            </a>
          </div>
          <div id="gradient"></div>
          <div id="legend_text_wrapper">
            <div>Fewer</div>
            <div>More calls</div>
          </div>
          <div>(Adjusted for population)</div>
        </div>
      </div>
      <svg id="svg_map" />
      {props.filter.callType === "All Categories" ? (
        <div className="note">
          {"* "} Calls that fall under multiple categories counted once.
        </div>
      ) : null}

      <div className="tooltip"></div>
    </div>
  )
}
