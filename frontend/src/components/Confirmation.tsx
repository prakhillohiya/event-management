import { Button } from "@mui/material";
import React from "react";
import { IEvent } from "./EventDetails";

const Confirmation: React.FC<{
  parentConfirmClick: (
    e: React.MouseEvent<HTMLElement>,
    event?: IEvent
  ) => void;
}> = ({ parentConfirmClick }) => {
  return (
    <div className="w-[500px] flex flex-col gap-8">
      <h2>Are You Sure?</h2>
      <Button
        onClick={(e) => parentConfirmClick(e)}
        variant="contained"
        color="success"
        type="submit"
        sx={{ marginLeft: "auto", width: "30%", marginTop: "1rem" }}
      >
        Confirm
      </Button>
    </div>
  );
};

export default Confirmation;
