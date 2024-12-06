import React, { useEffect, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
import "./App.css";

const App = () => {
  interface Runner {
    name: string;
    position: number;
    speed: number;
    acceleration: number;
    reactionTime: number;
  }

  const [runners, setRunners] = useState<Runner[]>([]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  // Establish SignalR connection and set up the event listener
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7018/racehub")
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => console.log("Connected to SignalR Hub"))
      .catch((err) => console.error("SignalR Connection Error: ", err));

    newConnection.on("ReceiveRaceUpdate", (updatedRunners: Runner[]) => {
      console.log("Updated runners:", updatedRunners); // Log the updated runners
      setRunners(updatedRunners);
    });

    setConnection(newConnection);

    return () => {
      newConnection.stop().catch((err) => console.error("Error stopping connection", err));
    };
  }, []);

  // Start the race
  const startRace = useCallback(async () => {
    try {
      await axios.post("https://localhost:7018/api/race/start");
      setRaceStarted(true);
    } catch (err) {
      console.error("Error starting race: ", err);
    }
  }, []);

  return (
    <div className="App">
      <h1>100m Sprint Simulation</h1>
      <button onClick={startRace} disabled={raceStarted}>
        {raceStarted ? "Race in Progress" : "Start Race"}
      </button>
      <div className="track">
        {runners.map((runner, index) => (
          <div
            key={`${runner.name}-${index}`}  // Ensures uniqueness with a combination of Name and index
            className="runner"
            style={{
              left: `${Math.min((runner.position / 100) * 100, 100)}%`,  // Prevent overflow past 100%
              top: `${index * 40}px`, // Adjust vertical spacing for multiple runners
              transition: "left 0.5s linear", // Smooth transition for movement
            }}
          >
            🏃 {runner.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
