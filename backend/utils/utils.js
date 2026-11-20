import { createHash } from "node:crypto";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidPassword(password) {
  return (
    typeof password === "string" &&
    Buffer.byteLength(password, "utf8") >= 8 &&
    Buffer.byteLength(password, "utf8") <= 72
  );
}

export function isValidEmail(email) {
  return (
    typeof email === "string" &&
    email.length <= 320 &&
    EMAIL_PATTERN.test(email)
  );
}

export function isValidInternationalPhoneNumber(value) {
  if (typeof value !== "string") {
    return false;
  }

  const phoneInput = value.trim();
  if (
    phoneInput.length === 0 ||
    phoneInput.length > 40 ||
    !/^\+?[\d\s().-]+$/.test(phoneInput)
  ) {
    return false;
  }

  let internationalNumber = phoneInput.replace(/[\s().-]/g, "");
  if (internationalNumber.startsWith("00")) {
    internationalNumber = `+${internationalNumber.slice(2)}`;
  }
  if (!internationalNumber.startsWith("+")) {
    return false;
  }

  return parsePhoneNumberFromString(internationalNumber)?.isValid() ?? false;
}

function firstProvidedValue(object, keys) {
  const key = keys.find((candidate) => object[candidate] !== undefined);
  return key === undefined ? undefined : object[key];
}

function readOptionalRegistrationString(object, key) {
  return object[key] === undefined ? "" : object[key].trim();
}

export function validateRegistrationData(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      errors: [
        {
          field: "body",
          message: "El cuerpo de la solicitud debe ser un objeto JSON.",
        },
      ],
    };
  }

  const errors = [];
  const nameInput = firstProvidedValue(body, [
    "nombreCompleto",
    "name",
    "full_name",
  ]);
  const emailInput = firstProvidedValue(body, ["correoElectronico", "email"]);
  const password = body.password;

  if (nameInput === undefined) {
    errors.push({
      field: "nombreCompleto",
      message: "El nombre completo es obligatorio.",
    });
  } else if (typeof nameInput !== "string") {
    errors.push({
      field: "nombreCompleto",
      message: "El nombre completo debe ser texto.",
    });
  } else if (nameInput.trim().length === 0) {
    errors.push({
      field: "nombreCompleto",
      message: "El nombre completo no puede estar vacío.",
    });
  } else if (nameInput.trim().length > 120) {
    errors.push({
      field: "nombreCompleto",
      message: "El nombre completo no puede superar 120 caracteres.",
    });
  }

  if (emailInput === undefined) {
    errors.push({
      field: "correoElectronico",
      message: "El correo electrónico es obligatorio.",
    });
  } else if (typeof emailInput !== "string") {
    errors.push({
      field: "correoElectronico",
      message: "El correo electrónico debe ser texto.",
    });
  } else if (emailInput.trim().length === 0) {
    errors.push({
      field: "correoElectronico",
      message: "El correo electrónico no puede estar vacío.",
    });
  } else if (emailInput.trim().length > 320) {
    errors.push({
      field: "correoElectronico",
      message: "El correo electrónico no puede superar 320 caracteres.",
    });
  } else if (!isValidEmail(emailInput.trim())) {
    errors.push({
      field: "correoElectronico",
      message: "El formato del correo electrónico no es válido.",
    });
  }

  if (password === undefined) {
    errors.push({
      field: "password",
      message: "La contraseña es obligatoria.",
    });
  } else if (typeof password !== "string") {
    errors.push({
      field: "password",
      message: "La contraseña debe ser texto.",
    });
  } else if (Buffer.byteLength(password, "utf8") < 8) {
    errors.push({
      field: "password",
      message: "La contraseña debe tener al menos 8 bytes UTF-8.",
    });
  } else if (Buffer.byteLength(password, "utf8") > 72) {
    errors.push({
      field: "password",
      message: "La contraseña no puede superar 72 bytes UTF-8.",
    });
  }

  const optionalStringFields = [
    ["direccion", "La dirección"],
    ["telefono", "El teléfono"],
    ["whatsapp", "El WhatsApp"],
    ["urlDocumentoIdentidad", "La URL del documento de identidad"],
    ["urlReciboServicio", "La URL del recibo de servicio"],
    ["urlContratoDisclaimer", "La URL del contrato o disclaimer"],
    ["urlComprobanteAceptacion", "La URL del comprobante de aceptación"],
  ];
  for (const [field, label] of optionalStringFields) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      errors.push({
        field,
        message: `${label} debe ser texto.`,
      });
    }
  }

  for (const [field, label] of [
    ["telefono", "El teléfono"],
    ["whatsapp", "El WhatsApp"],
  ]) {
    if (typeof body[field] === "string" && body[field].trim().length > 0) {
      if (body[field].trim().length > 40) {
        errors.push({
          field,
          message: `${label} no puede superar 40 caracteres.`,
        });
      } else if (!isValidInternationalPhoneNumber(body[field])) {
        errors.push({
          field,
          message: `${label} debe ser un número internacional válido, con código de país y sin letras.`,
        });
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    password,
    userData: {
      nombreCompleto: firstProvidedValue(body, [
        "nombreCompleto",
        "name",
        "full_name",
      ]).trim(),
      direccion: readOptionalRegistrationString(body, "direccion"),
      telefono: readOptionalRegistrationString(body, "telefono"),
      whatsapp: readOptionalRegistrationString(body, "whatsapp"),
      correoElectronico: firstProvidedValue(body, [
        "correoElectronico",
        "email",
      ]).trim(),
      urlDocumentoIdentidad: readOptionalRegistrationString(
        body,
        "urlDocumentoIdentidad",
      ),
      urlReciboServicio: readOptionalRegistrationString(
        body,
        "urlReciboServicio",
      ),
      urlContratoDisclaimer: readOptionalRegistrationString(
        body,
        "urlContratoDisclaimer",
      ),
      urlComprobanteAceptacion: readOptionalRegistrationString(
        body,
        "urlComprobanteAceptacion",
      ),
    },
  };
}

export function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function passwordResetUrl(token) {
  const baseUrl = process.env.PASSWORD_RESET_URL;
  if (!baseUrl) {
    throw new Error("PASSWORD_RESET_URL is not configured");
  }

  const url = new URL(baseUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("PASSWORD_RESET_URL must use HTTP or HTTPS");
  }
  url.searchParams.set("token", token);
  return url.toString();
}

export function isPostId(value) {
  return (
    typeof value === "string" &&
    /^[1-9]\d{0,18}$/.test(value) &&
    BigInt(value) <= MAX_POST_ID
  );
}

export function isHttpUrl(value) {
  if (typeof value !== "string" || value.length > 2048) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function readOptionalString(object, key) {
  if (object[key] === undefined) {
    return "";
  }
  return typeof object[key] === "string" ? object[key].trim() : null;
}

export function readFirstString(object, keys) {
  const key = keys.find((candidate) => object[candidate] !== undefined);
  return key === undefined ? "" : readOptionalString(object, key);
}

export function registrationValidationMessage(errors) {
  return `${errors
      .map(({ message }) => message.replace(/[.,;:!?]+$/, ""))
      .join(", ")}.`;
}