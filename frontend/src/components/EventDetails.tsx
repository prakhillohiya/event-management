import {
  Autocomplete,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  Divider,
  FormHelperText,
  IconButton,
  InputBase,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  ThemeProvider,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import React, { ChangeEvent, Fragment, useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import {
  Controller,
  FieldErrors,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { InputLabel } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/en";
import { Icon } from "@iconify/react";
import { companies } from "../../companyList.ts";
import axios from "axios";
import { v4 as uuid } from "uuid";
import sha1 from "sha1";
import {
  useCustomMutationClient,
  useCustomQueryClient,
} from "@/config/queryClient.ts";
import { useDialog } from "@/context/DialogProvider.tsx";
import { ErrorObject } from "@hookform/resolvers/io-ts/src/types.js";
import { stringAvatar } from "@/lib/utils.ts";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ZEmail = z.string().email({ message: "Invalid Email" });

const ZAttachment = z.object({
  asset_id: z.string(),
  public_id: z.string(),
  version: z.number(),
  version_id: z.string(),
  signature: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
  resource_type: z.string(),
  created_at: z.string(),
  tags: z.array(z.string()),
  bytes: z.number(),
  type: z.string(),
  etag: z.string(),
  placeholder: z.boolean(),
  url: z.string(),
  secure_url: z.string(),
  folder: z.string(),
  access_mode: z.string(),
  existing: z.boolean(),
  original_filename: z.string(),
});

type AttachmentType = z.infer<typeof ZAttachment>;

export interface IAttachment extends AttachmentType {}

// export interface IAttachment {
//   asset_id: string;
//   public_id: string;
//   version: number;
//   version_id: string;
//   signature: string;
//   width: number;
//   height: number;
//   format: string;
//   resource_type: string;
//   created_at: string;
//   tags: string[];
//   bytes: number;
//   type: string;
//   etag: string;
//   placeholder: boolean;
//   url: string;
//   secure_url: string;
//   folder: string;
//   access_mode: string;
//   existing: boolean;
//   original_filename: string;
// }

const ZEvent = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  description: z.string().optional(),
  date: z.string().refine((value) => dayjs(value).isValid(), {
    message: "Invalid Date Format",
  }),
  time: z.string().refine((value) => dayjs(value).isValid(), {
    message: "Invalid Time Format",
  }),
  duration: z.object({
    hr: z.string().min(1, { message: "Hours Required" }),
    m: z.string().min(1, { message: "Minutes Required" }),
  }),
  location: z.string().min(1, { message: "Required" }),
  meetingRoom: z.string().optional(),
  currentGuest: z.string().optional(),
  attachment: z.array(ZAttachment),
  notification: z.enum(["email", "slack"]),
  reminder: z.string().min(1, { message: "Required" }),
  guest: z.array(z.string()).optional(),
});

type EventType = z.infer<typeof ZEvent>;

export interface IEvent extends EventType {}

// export interface IEvent {
//   _id: string;
//   name: string;
//   description?: string;
//   date: string;
//   time: string;
//   duration: { hr: string; m: string };
//   location: string;
//   meetingRoom?: string;
//   currentGuest: string;
//   attachment: IAttachment[];
//   notification: "email" | "slack";
//   reminder: string;
//   guest: string[];
// }

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const defaultEvent: IEvent = {
  _id: "",
  name: "",
  description: "",
  date: "",
  time: "",
  duration: { hr: "", m: "" },
  location: "",
  meetingRoom: "",
  currentGuest: "",
  attachment: [],
  notification: "email",
  reminder: "",
  guest: [],
};

const names = ["Conference Room 1", "Conference Room 2", "Conference Room 3"];

const EventDetails: React.FC<{
  postUrl: string;
  fetchUrl?: string;
  parentCallback: () => void;
}> = ({ postUrl, fetchUrl, parentCallback }) => {
  const [showEventDescription, setShowEventDescription] = useState(false);
  const [showMeetingRoom, setShowMeetingRoom] = useState(false);
  const [guests, setGuests] = useState<string[]>([]);
  const [files, setFiles] = useState<IAttachment[]>([]);
  const [notification, setNotification] = useState<string>("email");
  const [event, setEvent] = useState<IEvent>(defaultEvent);

  const {
    isLoading: queryLoading,
    error: queryError,
    data: queryData,
    isSuccess: querySuccess,
    refetch,
    isFetching: queryFetching,
  } = useCustomQueryClient<IEvent>({
    url: fetchUrl || "",
    method: "get",
    queryKey: "getEvent",
    enabled: fetchUrl ? true : false,
  });

  const {
    mutate,
    isPending: mutatePending,
    error: mutateError,
    isSuccess: mutateSuccess,
    data: mutateData,
  } = useCustomMutationClient<Omit<IEvent, "currentGuest" | "_id">>({
    url: postUrl,
    method: "post",
    mutationKey: "postEvent",
    successCallback: () => {
      parentCallback();
      closeDialog();
    },
    retry: false,
  });

  const {
    control,
    register,
    unregister,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    getFieldState,
    setError,
    clearErrors,
    formState: {
      isDirty,
      isSubmitSuccessful,
      isSubmitting,
      isSubmitted,
      isValid,
    },
  } = useForm<IEvent>({
    defaultValues: {
      name: "",
      description: "",
      date: "",
      time: "",
      duration: { hr: "", m: "" },
      location: "",
      meetingRoom: "",
      currentGuest: "",
      attachment: [],
      notification: "email",
      reminder: "",
    },
    resolver: zodResolver(ZEvent),
  });

  const { closeDialog } = useDialog();

  useEffect(() => {
    if (!queryFetching && querySuccess && fetchUrl) {
      const responseEvent = queryData.data.data;
      setEvent(responseEvent);
    } else if (!fetchUrl) {
      setEvent(defaultEvent);
    }
  }, [queryData]);

  // useEffect(() => {
  //   console.log(isValid)
  //   if (isSubmitting && guests.length) {
  //     console.log("Submitted")
  //     clearErrors("guest");
  //   }
  // }, [isSubmitting]);

  useEffect(() => {
    if (!queryFetching && querySuccess) {
      reset(event);
      setFiles(event.attachment?.length ? event.attachment : []);
      setNotification(event.notification);
      setShowEventDescription(event.description?.length ? true : false);
      setShowMeetingRoom(event.meetingRoom?.length ? true : false);
      setGuests(event.guest?.length ? event.guest : []);
    }
  }, [event]);

  // useEffect(() => {
  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     if (isDirty && !isSubmitSuccessful) {
  //       event.preventDefault();
  //       event.returnValue = "";
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [isDirty, isSubmitSuccessful]);

  if (queryFetching) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  const handleAddDescriptionClick = () => {
    setShowEventDescription(true);
  };

  const handleRemoveDescriptionClick = () => {
    setValue("description", "");
    setShowEventDescription(false);
  };

  const handleSetMeetingRoomClick = () => {
    setShowMeetingRoom(true);
  };

  const handleRemoveMeetingRoomClick = () => {
    setValue("meetingRoom", "");
    setShowMeetingRoom(false);
  };

  const handleAddGuestClick = () => {
    const currentGuest = watch("currentGuest");
    if (currentGuest && ZEmail.safeParse(currentGuest).success) {
      setGuests((prev) => [...prev, currentGuest]);

      setValue("currentGuest", "");
    } else {
      toast.error("Invalid Email");
    }
  };

  const handleRemoveGuestClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    currentGuest: string
  ) => {
    const filteredGuests = guests.filter((x) => x !== currentGuest);
    setGuests(filteredGuests);
  };

  const uploadFilesToCloud = async (files: File[]) => {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.split(".")[0];
      const randomId = uuid();

      formData.append("file", file);
      formData.append(
        "upload_preset",
        `${import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET}`
      );
      formData.append("api_key", `${import.meta.env.VITE_CLOUDINARY_API_KEY}`);
      formData.append("public_id", `${randomId}/${fileName}`);

      const response = await toast.promise(
        axios.post(
          `${import.meta.env.VITE_CLOUDINARY_BASE_URI}/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          formData
        ),
        {
          error: (err) => err.message,
          success: (data) => "Uploaded",
          loading: "Uploading",
        }
      );

      const responseFileDetails = response.data;

      setFiles((prevState) => [...prevState, responseFileDetails]);
    }
  };

  const handleSuccessfulSubmit = async (submittedData: IEvent) => {
    const { currentGuest, _id, ...formData } = submittedData;

    mutate({ ...formData, guest: guests, attachment: files });
  };

  const handleInvalidFormSubmit = (error: FieldErrors<IEvent>) => {
    console.log(error);
    toast.error("Invalid Details. Please check all the details");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileList = Array.from(selectedFiles);

      await uploadFilesToCloud(fileList);
    }
  };

  const handleDeleteFileClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    file: IAttachment
  ) => {
    const formData = new FormData();

    const timestamp = Date.now();
    const signature = sha1(
      `public_id=${file.public_id}&timestamp=${timestamp}${
        import.meta.env.VITE_CLOUDINARY_API_SECRET
      }`
    );

    formData.append("timestamp", `${timestamp}`);
    formData.append("api_key", `${import.meta.env.VITE_CLOUDINARY_API_KEY}`);
    formData.append("public_id", file.public_id);
    formData.append("signature", `${signature}`);

    await toast.promise(
      axios.post(
        `${import.meta.env.VITE_CLOUDINARY_BASE_URI}/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/destroy`,
        formData
      ),
      {
        error: (err) => err.message,
        success: (data) => "Deleted",
        loading: "Deleting",
      }
    );

    const filteredFiles = files.filter(
      (x) => x.original_filename !== file.original_filename
    );
    setFiles(filteredFiles);
  };

  const handleViewClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    file: IAttachment
  ) => {
    e.preventDefault();
    window.open(file.url, "_blank");
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Grid container spacing={2} margin={0}>
        <form
          onSubmit={handleSubmit(
            (data) => handleSuccessfulSubmit(data),
            (error) => handleInvalidFormSubmit(error)
          )}
        >
          <Grid xs={12}>
            <InputLabel variant="standard" sx={{ color: "black" }}>
              Event name
            </InputLabel>
            <Paper
              component="label"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: "100%",
                backgroundColor: "#F2F3F4 ",
                borderRadius: "10px",
              }}
              elevation={0}
            >
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <InputBase
                    sx={{ ml: 1, flex: 1, padding: "5px" }}
                    placeholder={"Enter event name"}
                    inputRef={ref}
                    onChange={onChange}
                    error={!!getFieldState("name").error?.message}
                    // helperText={getFieldState("name").error?.message}
                    onBlur={onBlur}
                    value={value || ""}
                    id="event-name"
                    type="text"
                    // inputProps={{ 'aria-label': 'search google maps' }}
                  />
                )}
              />

              {!showEventDescription && (
                <Button
                  onClick={handleAddDescriptionClick}
                  size="small"
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    p: "2px 15px",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    color: "black",
                    textTransform: "none",
                    border: "1px solid lightgrey",
                  }}
                >
                  Add description
                </Button>
              )}
              {/* </IconButton> */}
            </Paper>
            <FormHelperText error={!!getFieldState("name").error?.message}>
              {getFieldState("name").error?.message}
            </FormHelperText>
          </Grid>

          {showEventDescription && (
            <Grid>
              <InputLabel variant="standard" sx={{ color: "black" }}>
                Event Description
              </InputLabel>
              <div className="flex">
                <Paper
                  component="label"
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    backgroundColor: "#F2F3F4 ",
                    borderRadius: "10px",
                  }}
                  elevation={0}
                >
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <InputBase
                        sx={{ ml: 1, flex: 1, padding: "5px" }}
                        placeholder={"Enter event description"}
                        inputRef={ref}
                        onChange={onChange}
                        error={!!getFieldState("description").error?.message}
                        onBlur={onBlur}
                        value={value || ""}
                        id="event-description"
                        type="text"
                        // inputProps={{ 'aria-label': 'search google maps' }}
                      />
                    )}
                  />
                </Paper>
                <IconButton
                  onClick={handleRemoveDescriptionClick}
                  color="primary"
                  sx={{ p: "12px" }}
                  aria-label="directions"
                >
                  <Icon
                    icon="system-uicons:cross-circle"
                    style={{ color: "gray" }}
                  />
                </IconButton>
              </div>
              <FormHelperText error={!!getFieldState("name").error?.message}>
                {getFieldState("description").error?.message}
              </FormHelperText>
            </Grid>
          )}

          <div className="flex">
            <Grid xs={4}>
              <InputLabel variant="standard" sx={{ color: "black" }}>
                Date
              </InputLabel>
              <Paper
                component="label"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  backgroundColor: "#F2F3F4 ",
                  borderRadius: "10px",
                  height: "46px",
                }}
                elevation={0}
              >
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="en"
                    >
                      <DatePicker
                        inputRef={ref}
                        disablePast
                        onChange={(date) => onChange(dayjs(date).toISOString())}
                        value={dayjs(value).isValid() ? dayjs(value) : null}
                        format="DD MMMM, YYYY"
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: {
                              "& .MuiInputBase-root .MuiOutlinedInput-notchedOutline":
                                {
                                  border: 0,
                                },
                            },
                            placeholder: "Choose event date",
                            id: "date",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Paper>
              <FormHelperText error={!!getFieldState("date").error?.message}>
                {getFieldState("date").error?.message}
              </FormHelperText>
            </Grid>
            <Grid xs={4}>
              <InputLabel variant="standard" sx={{ color: "black" }}>
                Time
              </InputLabel>
              <Paper
                component="label"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  backgroundColor: "#F2F3F4 ",
                  borderRadius: "10px",
                  height: "46px",
                }}
                elevation={0}
              >
                <Controller
                  control={control}
                  name="time"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="en"
                    >
                      <TimePicker
                        onChange={(time) => onChange(dayjs(time).toISOString())}
                        value={dayjs(value).isValid() ? dayjs(value) : null}
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: {
                              "& .MuiInputBase-root .MuiOutlinedInput-notchedOutline":
                                {
                                  border: 0,
                                },
                            },
                            placeholder: "Choose event time",
                            id: "time",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Paper>
              <FormHelperText error={!!getFieldState("time").error?.message}>
                {getFieldState("time").error?.message}
              </FormHelperText>
            </Grid>
            <Grid xs={4}>
              <InputLabel variant="standard" sx={{ color: "black" }}>
                Duration
              </InputLabel>
              <Paper
                component="label"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  backgroundColor: "#F2F3F4 ",
                  borderRadius: "10px",
                }}
                elevation={0}
              >
                <Box display="flex" alignItems="center" maxWidth={"100%"}>
                  <Controller
                    control={control}
                    name="duration.hr"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <>
                        <InputBase
                          sx={{ ml: 1, flex: 1, padding: "5px", width: "40px" }}
                          inputRef={ref}
                          placeholder="h"
                          onChange={onChange}
                          value={value || ""}
                          type="number"
                          inputProps={{
                            min: 0,
                            "aria-label": "hours",
                          }}
                          id="duration-h"
                        />
                        <Typography sx={{ p: "4px 0 5px 0" }}>h</Typography>
                      </>
                    )}
                  />

                  <Controller
                    control={control}
                    name="duration.m"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <>
                        <InputBase
                          sx={{ ml: 1, flex: 1, padding: "5px", width: "40px" }}
                          placeholder="m"
                          inputRef={ref}
                          onChange={onChange}
                          value={value || ""}
                          type="number"
                          inputProps={{
                            min: 0,
                            max: 59,
                            "aria-label": "minutes",
                          }}
                          id="duration-m"
                        />
                        <Typography sx={{ p: "4px 0 5px 0" }}>m</Typography>
                      </>
                    )}
                  />
                </Box>
              </Paper>
              <FormHelperText error={!!getFieldState("duration").error?.hr}>
                {getFieldState("duration").error?.hr &&
                  getFieldState("duration").error?.hr?.message}
              </FormHelperText>
              <FormHelperText error={!!getFieldState("duration").error?.m}>
                {getFieldState("duration").error?.m &&
                  getFieldState("duration").error?.m?.message}
              </FormHelperText>
            </Grid>
          </div>

          {dayjs(watch("time")).isValid() &&
            dayjs(watch("duration.hr")) &&
            watch("duration.m") && (
              <Typography variant="subtitle2" padding={"2px 1rem 2px 1rem"}>
                {`This event will take place on the ${dayjs(
                  watch("date")
                ).format("DD MMMM, YYYY")} from ${dayjs(watch("time")).format(
                  "hh:mm A"
                )} until ${dayjs(watch("time"))
                  .add(Number(watch("duration.hr")), "hour")
                  .add(Number(watch("duration.m")), "minute")
                  .format("hh:mm A")}
            `}
              </Typography>
            )}

          <Grid>
            <InputLabel variant="standard" sx={{ color: "black" }}>
              Location
            </InputLabel>
            <Paper
              component="label"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",

                backgroundColor: "#F2F3F4 ",
                borderRadius: "10px",
                height: "46px",
              }}
              elevation={0}
            >
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Autocomplete
                    value={value || null}
                    onChange={(event, newValue) => {
                      onChange(newValue);
                    }}
                    disablePortal
                    id="location"
                    options={companies}
                    sx={{ flex: "1" }}
                    renderInput={(params) => (
                      <TextField
                        placeholder="Choose Location"
                        {...params}
                        inputRef={ref}
                        error={!!getFieldState(`location`).error?.message}
                        onBlur={onBlur}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline ": {
                            border: "0",
                          },
                        }}
                        id="location"
                      />
                    )}
                  />
                )}
              />

              {!showMeetingRoom && (
                <Button
                  onClick={handleSetMeetingRoomClick}
                  size="small"
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    p: "2px 15px",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    color: "black",
                    textTransform: "none",
                    border: "1px solid lightgrey",
                  }}
                >
                  Set meeting room
                </Button>
              )}
            </Paper>
            <FormHelperText error={!!getFieldState("location").error?.message}>
              {getFieldState("location").error?.message}
            </FormHelperText>
          </Grid>

          {showMeetingRoom && (
            <Grid>
              <InputLabel variant="standard" sx={{ color: "black" }}>
                Meeting Room
              </InputLabel>
              <div className="flex">
                <Paper
                  component="label"
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    backgroundColor: "#F2F3F4 ",
                    borderRadius: "10px",
                    height: "46px",
                  }}
                  elevation={0}
                >
                  <Controller
                    control={control}
                    name="meetingRoom"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <Select
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        inputRef={ref}
                        error={!!getFieldState(`meetingRoom`).error?.message}
                        id="meeting-room"
                        input={
                          <OutlinedInput
                            sx={{
                              width: "100%",
                              "& .MuiOutlinedInput-notchedOutline ": {
                                border: "0",
                              },
                            }}
                          />
                        }
                        // renderValue={(selected: string[]) => {
                        //   if (selected.length === 0) {
                        //     return <em>Placeholder</em>;
                        //   }

                        //   return selected.join(", ");
                        // }}
                        // MenuProps={MenuProps}
                      >
                        {names.map((name) => (
                          <MenuItem
                            key={name}
                            value={name}
                            // style={getStyles(name, personName, theme)}
                          >
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </Paper>
                <IconButton
                  onClick={handleRemoveMeetingRoomClick}
                  color="primary"
                  sx={{ p: "12px" }}
                  aria-label="directions"
                >
                  <Icon
                    icon="system-uicons:cross-circle"
                    style={{ color: "gray" }}
                  />
                </IconButton>
              </div>
              <FormHelperText
                error={!!getFieldState("meetingRoom").error?.message}
              >
                {getFieldState("meetingRoom").error?.message}
              </FormHelperText>
            </Grid>
          )}

          <Grid>
            <InputLabel variant="standard" sx={{ color: "black" }}>
              Add guests
            </InputLabel>
            <Paper
              component="label"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: "100%",
                backgroundColor: "#F2F3F4 ",
                borderRadius: "10px",
              }}
              elevation={0}
            >
              <Controller
                control={control}
                name="currentGuest"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <InputBase
                    sx={{ ml: 1, flex: 1, padding: "5px" }}
                    placeholder={"contact@example.com"}
                    inputRef={ref}
                    onChange={onChange}
                    // error={!!getFieldState("currentGuest").error?.message}
                    onBlur={onBlur}
                    value={value || ""}
                    id="current-guest"
                    type="text"

                    // inputProps={{ 'aria-label': 'search google maps' }}
                  />
                )}
              />

              {watch("currentGuest") && !!watch("currentGuest")?.length && (
                <Button
                  onClick={handleAddGuestClick}
                  size="small"
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    p: "2px 15px",
                    boxShadow: 1,
                    color: "black",
                    textTransform: "none",
                  }}
                >
                  Add
                </Button>
              )}
            </Paper>
            {/* <FormHelperText error={isSubmitted && !guests.length}>
              {isSubmitted && !guests.length && "Required"}
            </FormHelperText> */}
            {/* <FormHelperText error={!!getFieldState("guest").error?.message}>
              {getFieldState("guest").error?.message}
            </FormHelperText> */}
          </Grid>
          <div className="flex gap-2 p-2">
            {guests.map((x, i) => (
              <Fragment key={i}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  badgeContent={
                    <IconButton
                      onClick={(e) => handleRemoveGuestClick(e, x)}
                      color="primary"
                      aria-label="directions"
                      sx={{
                        backgroundColor: "gray",
                        padding: "0",
                        "&:hover": { backgroundColor: "gray" },
                      }}
                    >
                      <Icon
                        icon="basil:cross-outline"
                        style={{ color: "white" }}
                        className="w-4 h-4"
                      />
                    </IconButton>
                  }
                >
                  {x && (
                    <Avatar {...stringAvatar(`${x}`)}>
                      {x.slice(0, 1).toUpperCase()}
                    </Avatar>
                  )}
                </Badge>
              </Fragment>
            ))}
          </div>

          <Grid>
            <div className="flex gap-8">
              <div>
                <InputLabel variant="standard" sx={{ color: "black" }}>
                  Notification
                </InputLabel>

                <Controller
                  control={control}
                  name="notification"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <BottomNavigation
                      id="notification"
                      showLabels
                      value={value}
                      onChange={(event, newValue) => {
                        setNotification(newValue);
                        onChange(newValue);
                      }}
                      sx={{
                        backgroundColor: "#f2f3f4",
                        borderRadius: "10px",
                        height: "42px",
                      }}
                    >
                      <BottomNavigationAction
                        label="Email"
                        id="email"
                        value={"email"}
                        sx={{
                          "& .MuiBottomNavigationAction-label":
                            notification === "email"
                              ? {
                                  borderRadius: "10px",
                                  backgroundColor: "white",
                                  p: "5px 20px 5px 20px",
                                  fontWeight: "bold",
                                  color: "black",
                                  boxShadow:
                                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                                  border: "1px solid lightgrey",
                                }
                              : {},
                        }}
                      />
                      <BottomNavigationAction
                        id="slack"
                        label="Slack"
                        value={"slack"}
                        sx={{
                          "& .MuiBottomNavigationAction-label":
                            notification === "slack"
                              ? {
                                  borderRadius: "10px",
                                  backgroundColor: "white",
                                  p: "5px 20px 5px 20px",
                                  fontWeight: "bold",
                                  color: "black",
                                  boxShadow:
                                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                                  border: "1px solid lightgrey",
                                }
                              : {},
                        }}
                      />
                    </BottomNavigation>
                  )}
                />
              </div>
              <div>
                <InputLabel variant="standard" sx={{ color: "black" }}>
                  Set reminder
                </InputLabel>

                <Paper
                  component="label"
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    backgroundColor: "#F2F3F4 ",
                    borderRadius: "10px",
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                  elevation={0}
                >
                  <Controller
                    control={control}
                    name="reminder"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <>
                        <InputBase
                          sx={{
                            ml: 1,
                            flex: 1,
                            padding: "3px",
                            maxWidth: "50px",
                          }}
                          placeholder={"h"}
                          inputRef={ref}
                          onChange={onChange}
                          error={!!getFieldState("reminder").error?.message}
                          onBlur={onBlur}
                          value={value || ""}
                          id="reminder"
                          type="number"
                          // inputProps={{ 'aria-label': 'search google maps' }}
                        />
                        <Typography
                          sx={{
                            p: "4px 8px 5px 0",
                            textAlign: { xs: "center", sm: "center" },
                          }}
                        >
                          hour before event
                        </Typography>
                      </>
                    )}
                  />
                </Paper>
                <FormHelperText
                  error={!!getFieldState("reminder").error?.message}
                >
                  {getFieldState("reminder").error?.message}
                </FormHelperText>
              </div>
            </div>
          </Grid>

          <Grid>
            <InputLabel variant="standard" sx={{ color: "black" }}>
              Upload attachments
            </InputLabel>
            <div className="bg-[#f2f3f4] p-4 rounded-lg">
              <Controller
                control={control}
                name="attachment"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <>
                    <Button
                      component="label"
                      size="small"
                      sx={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        p: "2px 15px",
                        boxShadow:
                          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        color: "black",
                        textTransform: "none",
                        border: "1px solid lightgrey",
                      }}
                    >
                      Select Files
                      <VisuallyHiddenInput
                        type="file"
                        id="file"
                        multiple
                        onChange={handleFileChange}
                      />
                    </Button>
                  </>
                )}
              />
              <Divider className="p-2" />

              <List dense>
                {files.map((x, i) => (
                  <ListItem
                    sx={{
                      gap: "1rem",
                    }}
                    key={i}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleDeleteFileClick(e, x)}
                      >
                        <Icon
                          icon="material-symbols-light:delete-outline"
                          style={{ color: "black", fontSize: "1.5rem" }}
                        />
                      </IconButton>
                    }
                  >
                    <Icon
                      icon="ic:twotone-check"
                      style={{ color: "#4d43e5", fontSize: "1.5rem" }}
                    />

                    <ListItemText
                      sx={{ flexGrow: "0" }}
                      primary={`${x.original_filename}.${x.format}`}
                    />
                    <Chip
                      label={`${(x.bytes / (1024 * 1024)).toFixed(2)} MB`}
                    />

                    <Chip
                      label="View"
                      onClick={(e) => handleViewClick(e, x)}
                      color="success"
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          </Grid>
          <div className="flex justify-end gap-4 p-2">
            <Button
              onClick={closeDialog}
              component="label"
              size="small"
              sx={{
                backgroundColor: "white",
                borderRadius: "8px",
                p: "2px 15px",
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                color: "black",
                textTransform: "none",
                width: "20%",
                border: "1px solid lightgrey",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ width: "30%", textTransform: "none" }}
            >
              {fetchUrl ? "Edit Event" : "Create Event"}
            </Button>
          </div>
        </form>
        {/* </FormProvider> */}
      </Grid>
    </Box>
  );
};

export default EventDetails;
