import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  createSubscriptionRecord,
  deleteSubscriptionRecord,
  findSubscriptionByIdOrKey,
  listSubscriptions,
  setGlobalKillSwitchRecords,
  updateSubscriptionRecord,
} from "../models/Subscription.js";
import responser from "../utils/responser.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const subscriptions = await listSubscriptions();
    return responser.success({
      res,
      message: "Suscripciones listadas correctamente.",
      body: { subscriptions },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/audit-logs", async (req, res) => {
  return responser.success({
    res,
    message: "Logs de auditoría listados.",
    body: { logs: [] },
  });
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const sub = await createSubscriptionRecord(req.body ?? {});
    return responser.success({
      res,
      message: "Suscripción creada correctamente.",
      body: { subscription: sub },
      status: 201,
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/global-kill-switch",
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { enabled, reason } = req.body ?? {};
      const subscriptions = await setGlobalKillSwitchRecords(
        Boolean(enabled),
        reason,
      );
      return responser.success({
        res,
        message: "Kill-Switch global ejecutado.",
        body: { subscriptions },
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.patch(
  "/:id/remote-state",
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const enabled =
        req.body?.remote_enabled !== undefined
          ? Boolean(req.body.remote_enabled)
          : Boolean(req.body?.enabled);
      const updated = await updateSubscriptionRecord(req.params.id, {
        remoteEnabled: enabled,
        statusNote: enabled
          ? "Reactivación remota enviada por el Administrador"
          : `Apagado remoto (${req.body?.reason || "Control Admin"})`,
      });
      if (!updated) {
        return responser.error({
          res,
          message: "Suscripción no encontrada.",
          status: 404,
        });
      }
      return responser.success({
        res,
        message: "Estado remoto actualizado.",
        body: { subscription: updated },
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/:id/reset-machine-id",
  authenticate,
  async (req, res, next) => {
    try {
      const updated = await updateSubscriptionRecord(req.params.id, {
        boundMachineId: null,
        statusNote:
          "Machine ID liberado. Listo para vincular nueva computadora única (1 PC).",
      });
      if (!updated) {
        return responser.error({
          res,
          message: "Suscripción no encontrada.",
          status: 404,
        });
      }
      return responser.success({
        res,
        message: "Machine ID liberado correctamente.",
        body: { subscription: updated },
      });
    } catch (error) {
      return next(error);
    }
  },
);

async function handleUpdateSubscription(req, res, next) {
  try {
    const updated = await updateSubscriptionRecord(
      req.params.id,
      req.body ?? {},
    );
    if (!updated) {
      return responser.error({
        res,
        message: "Suscripción no encontrada.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Suscripción actualizada correctamente.",
      body: { subscription: updated },
    });
  } catch (error) {
    return next(error);
  }
}

router.put("/:id", authenticate, handleUpdateSubscription);
router.patch("/:id", authenticate, handleUpdateSubscription);

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteSubscriptionRecord(req.params.id);
    if (!deleted) {
      return responser.error({
        res,
        message: "Suscripción no encontrada.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Suscripción eliminada correctamente.",
      body: { subscription: deleted },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
