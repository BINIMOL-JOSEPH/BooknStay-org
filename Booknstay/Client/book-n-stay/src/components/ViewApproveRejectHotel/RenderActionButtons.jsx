import React, { useState } from "react";
import { Button, Backdrop, CircularProgress } from "@mui/material";

const RenderActionButtons = ({
  hotel,
  handleApprove,
  handleReject,
  handleActivate,
  handleDelete,
  handleSuspend,
}) => {
  const [loading, setLoading] = useState(false);

  const startAction = async (action, id, handler) => {
    try {
      setLoading(true);
      await handler(id);
    } finally {
      setLoading(false);
    }
  };

  if (!hotel) {
    return null;
  }

  const { status } = hotel;
  const isDeleted = status === "deleted" || status === "rejected";

  if (isDeleted) {
    return null;
  }

  const isInactive = status === "inactive";
  const isActive = status === "active";

  return (
    <>
      {isInactive && (
        <>
          <Button
            data-testid="approve"
            color="success"
            variant="contained"
            onClick={() => startAction("approve", hotel.id, handleApprove)}
            sx={{ ml: '35%', mt: '3%' }}
          >
            Approve
          </Button>
          <Button
            data-testid="reject"
            color="error"
            variant="contained"
            onClick={() => startAction("reject", hotel.id, handleReject)}
            sx={{ ml: '2%', mt: '3%'  }}
          >
            Reject
          </Button>
        </>
      )}

      {(status === "suspended" || status === "rejected") && (
        <>
          {status === "suspended" && (
            <Button
              variant="contained"
              data-testid="activate"
              color="success"
              onClick={() => startAction("activate", hotel.id, handleActivate)}
              sx={{ ml: '35%', mt: '3%'  }}
            >
              Activate
            </Button>
          )}
          <Button
            data-testid="delete"
            variant="contained"
            color="error"
            onClick={() => startAction("delete", hotel.id, handleDelete)}
            sx={{ ml: '2%', mt: '3%'  }}
          >
            Delete
          </Button>
        </>
      )}

      {isActive && (
        <>
          <Button
            variant="contained"
            data-testid="suspend"
            color="warning"
            onClick={() => startAction("suspend", hotel.id, handleSuspend)}
            sx={{  ml: '35%', mt: '3%'  }}
          >
            Suspend
          </Button>
          <Button
            variant="contained"
            data-testid="delete"
            color="error"
            onClick={() => startAction("delete", hotel.id, handleDelete)}
            sx={{  ml: '2%', mt: '3%'  }}
          >
            Delete
          </Button>
        </>
      )}

      <Backdrop
        sx={{ color: "inherit", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default RenderActionButtons;
