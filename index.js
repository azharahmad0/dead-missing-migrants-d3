import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useWorldAtlas } from './useWorldAtlas';
import { useData } from './useData';
import { BubbleMap } from './BubbleMap/BubbleMap.js';
import { DateHistogram } from './DateHistogram/DateHistogram.js';

const width = 960;
const height = 500;
const dateHistogramSize = 0.2;

const xValue = (d) => d['Reported Date'];

const App = () => {
  const worldAtlas = useWorldAtlas();
  const data = useData();
  const [brushExtent, setBrushExtent] = useState();

  if (!worldAtlas || !data) {
    return <pre>Loading...</pre>;
  }

  // will return unfiltered dataset if brushExtent is null/ showing by the brushExtent ? filterfunc... : data;
  const filteredData = brushExtent
    ? data.filter((d) => {
        const date = xValue(d);
        return date
          ? date > brushExtent[0] && date < brushExtent[1]
          : null; // only returns dates within the brushExtent date range
      })
    : data;

  return (
    <svg width={width} height={height}>
      <BubbleMap
        data={data}
        filteredData={filteredData}
        worldAtlas={worldAtlas}
      />
      <g
        transform={`translate(0, ${
          height - dateHistogramSize * height
        })`}
      >
        <DateHistogram
          data={data}
          width={width}
          height={dateHistogramSize * height}
          setBrushExtent={setBrushExtent}
          xValue={xValue}
        />
      </g>
    </svg>
  );
};
const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
