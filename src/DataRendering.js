import React, { useEffect } from "react";
import { useFetchData } from "./DataMain"; // Import the hook

const DataFetchingComponent = ({ onDataFetched }) => {
  // Call the hook inside the component body
  const Data = useFetchData() || [];

  // Get the index from localStorage inside the effect or component
  const indexofsystem = localStorage.getItem("IndexOfSystem");

  const fetchDataByHostname = async (index) => {
    try {
      // Ensure Data is populated before accessing it
      if (!Data.length) {
        console.error("Data is not yet available");
        return;
      }

      // Get hostname using index from Data
      if (index < 0 || index >= Data.length) {
        throw new Error("Invalid index");
      }
      const hostname = Data[index].hostname;
      const url = `https://enxjxql4opngt36iprhemnqexi0abwbp.lambda-url.me-south-1.on.aws/?hostname=${encodeURIComponent(
        hostname
      )}`;

      // Fetch data from the endpoint
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Error fetching data: ${response.status} - ${response.statusText}`
        );
      }

      // Wait for the response to download
      const fetchedData = await response.json();
      onDataFetched(fetchedData); // Pass fetched data to parent component
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    if (indexofsystem !== null) {
      const index = parseInt(indexofsystem); // Convert index to integer
      if (Data.length > 0 && index >= 0 && index < Data.length) {
        fetchDataByHostname(index); // Only fetch when Data is available and index is valid
      } else {
        console.error("Invalid index or data not yet available");
      }
    } else {
      console.error("Index of system not found in localStorage");
    }
  }, [indexofsystem, Data]); // Ensure Data is included in the dependency array

  return <div>Data Fetching Component...</div>;
};

export default DataFetchingComponent;
