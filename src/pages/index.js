import React, { useState, useEffect } from "react"
import * as d3 from "d3"
import * as topojson from "topojson"
import moment from "moment"

import Header from "../components/header"
import Footer from "../components/footer"
import InputSelect from "../components/select"
import DatePick from "../components/pickdate"
import StackedChart from "../components/stacked"
import MapRI from "../components/mapRI"
import {
  dateRangeOptions,
  categoryOptions,
  areaOptions,
} from "../components/formElements"

const previousDate = (date, days) => moment(date, "YYYY-MM-DD").subtract(days, "days").format("YYYY-MM-DD")

export default function Home() {
  const [dataReady, setDataReady] = useState(false)

  const [{data, mapShape, riPops}, setData] = useState({
    data: null,
    mapShape: null,
    riPops: null
  })

  useEffect(() => {
    async function fetchData() {
      const [data, topo, riPops] = await Promise.all([
        d3.csv('/dashboard_data.csv', row => {
          return {
            city: row.city,
            type: row.type,
            values: Object.values(row)
              .slice(2)
              .map(d => +d),
          }
        }),
        d3.json('/ri.topo.json'),
        d3.json('/ri_pops.json'),
      ])
  
      const features = topojson
        .feature(topo, topo.objects.ri)
        .features.filter(d => d.id)
      const mapShape = features
  
      const dateRange = [data.columns[2], data.columns[data.columns.length - 1]]
  
      setData({data, mapShape, riPops})
      setFilterState(prev => 
        ({...prev, 
          startDate: previousDate(dateRange[1], 7),
          endDate: dateRange[1],
          dateRange
        }))
      setDataReady(true)
    }
    fetchData()
  }, [])

  const [filterState, setFilterState] = useState(() => {
    return {
      range: "Week",
      callType: "All Categories",
      city: "All Areas",
      startDate: "",
      endDate: "",
      dateRange: null
    }
  })

  const handleChange = e => {
    const name = e.target.name
    const value = e.target.value
    setFilterState(prev => {
      const newState = { ...prev }
      newState[name] = value
      if (name === "range") {
        if (value === "Week") {
          newState.startDate = previousDate(newState.dateRange[1], 7)
          newState.endDate = newState.dateRange[1];
        } else if (value === "Month") {
          newState.startDate = previousDate(newState.dateRange[1], 30)
          newState.endDate = newState.dateRange[1];
        } else if (value === "2 Months") {
          newState.startDate = previousDate(newState.dateRange[1], 60)
          newState.endDate = newState.dateRange[1];
        } else if (value === "3 Months") {
          newState.startDate = previousDate(newState.dateRange[1], 90)
          newState.endDate = newState.dateRange[1];
        } else if (value === "6 Months") {
          newState.startDate = previousDate(newState.dateRange[1], 180)
          newState.endDate = newState.dateRange[1];
        } else if (value === "All Dates") {
          newState.startDate = newState.dateRange[0]
          newState.endDate = newState.dateRange[1]
        }
      }
      return newState
    })
  }

  return (
    <div>
      <Header />
      <section
        id="controls"
        className="flex flex-col flex-wrap justify-center sm:flex-row space-x-0 sm:space-x-10 space-y-5 sm:space-y-0 w-9/12 px-8 mx-auto mb-4"
      >
        <InputSelect
          name="range"
          id="select-date-range"
          value={filterState.range}
          label="Calls to 211 over the Past"
          options={dateRangeOptions}
          grouped={false}
          onChange={handleChange}
        />
        <InputSelect
          name="callType"
          id="select-call-type"
          value={filterState.callType}
          label="Related to"
          options={categoryOptions}
          grouped={true}
          onChange={handleChange}
        />
        <InputSelect
          name="city"
          id="select-city"
          value={filterState.city}
          label="Across"
          options={areaOptions}
          grouped={false}
          onChange={handleChange}
        />
      </section>
      {filterState.range === "Select Dates" ? (
        <section
          id="date_controls"
          className="flex flex-col flex-wrap justify-center sm:flex-row space-x-0 sm:space-x-5 space-y-5 sm:space-y-0 w-8/12 px-8 mx-auto mb-4"
        >
          <DatePick
            name="startDate"
            id="input-start-date"
            value={filterState.startDate}
            label="Between"
            onChange={handleChange}
          />
          <DatePick
            name="endDate"
            id="input-end-date"
            value={filterState.endDate}
            label="And"
            onChange={handleChange}
          />
        </section>
      ) : ""}
      { dataReady ?
      (
        <section id="charts" className="flex flex-row flex-wrap items-stretch mx-auto px-6 mt-8">
          <StackedChart title="What were the calls about?" filter={filterState} setFilterState={setFilterState} data={data} />
          <MapRI title="Where did the calls come from?" filter={filterState} setFilterState={setFilterState} data={data} mapShape={mapShape} pops={riPops} />
        </section>
      ) : ""}
      <Footer />
    </div>
  )
}
