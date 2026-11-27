import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  findSubscriptionPlanByIdOrCode,
  listSubscriptionPlans,
  updateSubscriptionPlan,
} from "../models/SubscriptionPlan.js";
import responser from "../utils/responser.js";

const router = Router();

function validatePlanPayload(body, isUpdate = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["El cuerpo de la solicitud debe ser un objeto JSON."];
  }
  const errors = [];

  if (!isUpdate || body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length < 2) {
      errors.push("El nombre del plan de membresía es obligatorio.");
    }
  }

  if (!isUpdate || body.priceUsd !== undefined) {
    const price = Number(body.priceUsd);
    if (!Number.isFinite(price) || price < 0) {
      errors.push("El precio en USD debe ser un número mayor o igual a 0.");
    }
  }

  if (body.durationDays !== undefined) {
    const days = Number(body.durationDays);
    if (!Number.isFinite(days) || days <= 0) {
      errors.push("La duración en días debe ser un número mayor a 0.");
    }
  }

  return errors;
}

router.get("/", async (req, res, next) => {
  try {
    const plans = await listSubscriptionPlans();
    return responser.success({
      res,
      message: "Planes de membresía listados correctamente.",
      body: { plans },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const plan = await findSubscriptionPlanByIdOrCode(req.params.id);
    if (!plan) {
      return responser.error({
        res,
        message: "No se encontró el plan de membresía.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Plan de membresía encontrado.",
      body: { plan },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  const errors = validatePlanPayload(req.body, false);
  if (errors.length > 0) {
    return responser.error({
      res,
      message: errors.join(" "),
      status: 400,
    });
  }

  try {
    const plan = await createSubscriptionPlan(req.body);
    return responser.success({
      res,
      message: "Plan de membresía creado correctamente.",
      body: { plan },
      status: 201,
    });
  } catch (error) {
    if (error.code === "23505") {
      return responser.error({
        res,
        message: "Ya existe un plan de membresía con ese código.",
        status: 409,
      });
    }
    return next(error);
  }
});

async function handleUpdatePlan(req, res, next) {
  const errors = validatePlanPayload(req.body, true);
  if (errors.length > 0) {
    return responser.error({
      res,
      message: errors.join(" "),
      status: 400,
    });
  }

  try {
    const plan = await updateSubscriptionPlan(req.params.id, req.body);
    if (!plan) {
      return responser.error({
        res,
        message: "No se encontró el plan de membresía.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Plan de membresía actualizado correctamente.",
      body: { plan },
    });
  } catch (error) {
    return next(error);
  }
}

router.put("/:id", authenticate, requireAdmin, handleUpdatePlan);
router.patch("/:id", authenticate, requireAdmin, handleUpdatePlan);

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const plan = await deleteSubscriptionPlan(req.params.id);
    if (!plan) {
      return responser.error({
        res,
        message: "No se encontró el plan de membresía.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Plan de membresía eliminado correctamente.",
      body: { plan },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
