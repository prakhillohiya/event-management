import React, { useContext, useEffect, useRef, useState } from "react";
import { Box, Chip, Fab, LinearProgress, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";
import { useDialog } from "@/context/DialogProvider";
import Navbar from "@/components/Navbar";
import XEvent, { IMenuItems } from "@/components/XEvent";
import EventDetails from "@/components/EventDetails";
import { IEvent } from "@/components/EventDetails";
import Confirmation from "@/components/Confirmation";
import {
  useCustomMutationClient,
  useCustomQueryClient,
} from "@/config/queryClient";

const menuItems: IMenuItems[] = [
  {
    id: "1",
    action: "Edit",
    icon: "mingcute:edit-line",
  },
  {
    id: "2",
    action: "Delete",
    icon: "ic:outline-delete",
  },
];

const Dashboard = () => {
  const [events, setEvents] = useState<IEvent[]>([]);

  const [eventId, setEventId] = useState("");

  const { openDialog, setIsOpen } = useDialog();

  const {
    isLoading: queryLoading,
    error: queryError,
    data: queryData,
    isSuccess: querySuccess,
    refetch,
  } = useCustomQueryClient<IEvent[]>({
    url: `${import.meta.env.VITE_BASE_URI}/event/fetchAll`,
    method: "get",
    queryKey: "fetchAllEvents",
    enabled: true,
  });

  const {
    mutate,
    isPending: mutatePending,
    error: mutateError,
    data: mutateData,
    isSuccess: mutateSuccess,
  } = useCustomMutationClient<IEvent>({
    url: `${import.meta.env.VITE_BASE_URI}/event/delete/${eventId}`,
    method: "delete",
    mutationKey: "deleteEvent",
    successCallback: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (!queryLoading && querySuccess) {
      setEvents(queryData.data.data);
    }
  }, [queryLoading, querySuccess, queryData]);

  const parentSuccessClick = () => {
    refetch();
  };

  if (queryLoading || !querySuccess) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  const handlePlusClick = () => {
    openDialog(
      <EventDetails
        postUrl={`${import.meta.env.VITE_BASE_URI}/event/create`}
        parentCallback={parentSuccessClick}
      />,
      "Create Event"
    );
  };

  const parentConfirmClick = async (
    e: React.MouseEvent<HTMLElement>,
    event: IEvent
  ) => {
    setEventId(event._id!);
    await mutate(event);
    setEvents(queryData?.data.data);
    setIsOpen(false);
  };

  const parentMenuItemClick = (
    { id, action }: Partial<IMenuItems>,
    event: IEvent
  ) => {
    switch (action) {
      case "Edit":
        openDialog(
          <EventDetails
            fetchUrl={`${import.meta.env.VITE_BASE_URI}/event/fetch/${
              event._id
            }`}
            postUrl={`${import.meta.env.VITE_BASE_URI}/event/update/${
              event._id
            }`}
            parentCallback={parentSuccessClick}
          />,
          "Edit Event"
        );
        break;
      case "Delete":
        openDialog(
          <Confirmation
            parentConfirmClick={(e) => parentConfirmClick(e, event)}
          />,
          "Confirmation"
        );
        break;

      default:
        break;
    }
  };

  return (
    <Box
      sx={{
        flexDirection: "column",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Navbar />

      <Chip
        label={`Total Events - ${events.length}`}
        color="success"
        sx={{
          margin: "1rem",
          width: "15%",
          marginLeft: "auto",
          marginRight: "auto",
          fontSize: "1rem",
          fontWeight: "bold",
          minWidth: "150px",
        }}
      />
      <div>
        <XEvent
          events={events}
          menuItems={menuItems}
          parentMenuItemClick={parentMenuItemClick}
        />
      </div>
      <div className="mt-auto ml-auto">
        <div className="m-4">
        <Tooltip title="Create New Event" arrow onClick={handlePlusClick}>
          <Fab color="primary" aria-label="create-cv">
            <Icon
              icon="majesticons:plus-line"
              style={{ color: "fff" }}
              width={"1rem"}
            />
          </Fab>
        </Tooltip>
        </div>
      </div>
    </Box>
  );
};

export default Dashboard;
