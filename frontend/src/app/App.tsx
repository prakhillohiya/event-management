import { Fragment, useState } from "react";
import "./App.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Dashboard from "./dashboard/Dashboard";
import { DialogProvider } from "@/context/DialogProvider";
import { queryClient } from "@/config/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <DialogProvider>
          <CssBaseline />
          <Dashboard />
          <Toaster />
        </DialogProvider>
      </QueryClientProvider>
    </Fragment>
  );
}

export default App;
