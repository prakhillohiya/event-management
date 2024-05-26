import {
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { Fragment, useState } from "react";
import { IEvent } from "./EventDetails";
import { Icon } from "@iconify/react";

export interface IMenuItems {
  id: string;
  action: string;
  icon: string;
}




const XEvent: React.FC<{
  events: IEvent[];
  menuItems: IMenuItems[];
  parentMenuItemClick: (
    { id, action }: Partial<IMenuItems>,
    events: IEvent
  ) => void;
}> = ({ events, parentMenuItemClick, menuItems }) => {
  const [anchorEls, setAnchorEls] = useState<{
    [key: string]: null | HTMLElement;
  }>({});

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    setAnchorEls((prevState) => ({
      ...prevState,
      [id]: event.currentTarget,
    }));
  };

  const handleClose = (id: string) => {
    setAnchorEls((prevState) => ({
      ...prevState,
      [id]: null,
    }));
  };

  const handleMenuItemClick = (
    anchorId: string,
    { action }: IMenuItems,
    event: IEvent
  ) => {
    parentMenuItemClick({ action }, event);
    handleClose(anchorId);
  };

  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          margin: "5rem",
        }}
      >
        {events.map((x, i) => {
          const id = x._id;
          return (
            <Fragment key={id}>
              <div className="flex flex-col justify-center p-4 bg-green-200 m-4 rounded-lg">
                <IconButton
                  onClick={(e) => handleClick(e, id)}
                  size="small"
                  aria-controls={
                    anchorEls[id] ? `account-menu-${id}` : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={anchorEls[id] ? "true" : undefined}
                >
                   <Icon icon="material-symbols:event-note-outline" width="5rem" height="5rem" />
                </IconButton>
                <Chip
                  label={`${events[i].name}`}
                  color="primary"
                  sx={{
                    margin: "1rem",
                    width: "100%",
                    marginLeft: "auto",
                    marginRight: "auto",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                />
              </div>

              <Menu
                anchorEl={anchorEls[id]}
                id={`account-menu-${id}`}
                open={Boolean(anchorEls[id])}
                onClose={() => handleClose(id)}
              >
                {menuItems.map((item, index) => (
                  <MenuItem
                    key={item.id}
                    onClick={() => handleMenuItemClick(id, item, x)}
                  >
                    <ListItemIcon>
                      <Icon
                        icon={item.icon}
                        width={"1.5rem"}
                        height={"1.5rem"}
                      />
                    </ListItemIcon>
                    {item.action}
                  </MenuItem>
                ))}
              </Menu>
            </Fragment>
          );
        })}
      </Box>
    </Fragment>
  );
};

export default XEvent;
