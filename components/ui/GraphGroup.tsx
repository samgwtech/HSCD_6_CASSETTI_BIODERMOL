import React from 'react'
// import ChartComponent from './ChartComponent'

// interface GraphGroupProps {
  //  secondsArray: string[]
  //  tempData: number[]
  //  pressureData: number[]
  //  pompPowerData: number[]
  //  mwPowerData: number[]
  //  labels: string[], 
  //  data: number[],
  //  onHoverIndex?: (index: number) => void,
  //  setHoverIndex?: (index: number) => void,
//  }

const GraphGroup = () => {
   return (
      <div className="grid grid-cols-2 gap-4">
        {/* <ChartComponent
          name_measurement="Temperature over time"
          max_x_axis={110}
          unit="Temperature (°C)"
          unitOfTime="seconds"
          labels={secondsArray}
          data={tempData}
          onHoverIndex={setHoverIndex}
        />
        <ChartComponent
          name_measurement="Pressure over time"
          max_x_axis={13}
          unit="Pressure (BAR)"
          unitOfTime="seconds"
          labels={secondsArray}
          data={pressureData}
          onHoverIndex={setHoverIndex}
        />
        <ChartComponent
          name_measurement="MW Power over time"
          max_x_axis={110}
          unit="Power (%)"
          unitOfTime="seconds"
          labels={secondsArray}
          data={mwPowerData}
          onHoverIndex={setHoverIndex}
        />
        <ChartComponent
          name_measurement="Pomp Power over time"
          max_x_axis={110}
          unit="Power (%)"
          unitOfTime="seconds"
          labels={secondsArray}
          data={pompPowerData}
          onHoverIndex={setHoverIndex}
        /> */}
      </div>
  )
}

export default GraphGroup
