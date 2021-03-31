import React, { useState, useEffect } from 'react';
import { csv } from 'd3';

const csvUrl = 'https://gist.githubusercontent.com/azharahmad0/d48240378dce38bf7fc0047e4f18a4de/raw/missing_migrants.csv';

const row = d => {
  d.coords = d['Location Coordinates'].split(",").map(d => +d).reverse();
  d["Total Dead and Missing"] = +d["Total Dead and Missing"];
  d['Reported Date'] = new Date(d['Reported Date']);
	return d;
};

export const useData = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    csv(csvUrl, row).then(setData);
  }, []);
  //console.log(data);
  return data;
};
