import { Icon } from "@iconify/react";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import React, {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

interface IDialogContext {
  openDialog: (
    content: ReactNode,
    title?: string | undefined,
    actions?: ReactNode | undefined
  ) => void;
  closeDialog: () => void;
  setIsOpen: Dispatch<React.SetStateAction<boolean>>;
}

const DialogContext = createContext<IDialogContext>({
  closeDialog: () => {},
  openDialog: () => {},
  setIsOpen: () => {},
});

export const useDialog = () => useContext(DialogContext);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string | undefined>(undefined);
  const [dialogActions, setDialogActions] = useState<ReactNode | undefined>(
    undefined
  );

  const openDialog = (
    content: ReactNode,
    title?: string | undefined,
    actions?: ReactNode | undefined
  ) => {
    setDialogContent(content);
    setDialogTitle(title);
    setDialogActions(actions);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setDialogContent(undefined);
    setDialogTitle(undefined);
    setDialogActions(undefined);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, setIsOpen }}>
      {children}
      <Dialog open={isOpen} onClose={closeDialog} maxWidth={"lg"}>
        {dialogTitle && (
          <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
        )}
        <IconButton
          aria-label="close"
          onClick={closeDialog}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icon
            icon="clarity:close-line"
            width="24"
            height="24"
            style={{ color: "black" }}
          />
        </IconButton>
        <DialogContent>
          {dialogContent}
        </DialogContent>
        {dialogActions && <DialogActions>{dialogActions}</DialogActions>}
      </Dialog>
    </DialogContext.Provider>
  );
};
