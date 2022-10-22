
const UNREGISTERED_USER = {
    "status": "error",
    "code": "UNREGISTERED_USER",
    "es": "El correo electrónico no está registrado.",
    "en": "The email is not registered."
};

const UNAUTHENTICATED = {
    "status": "error",
    "code": "UNAUTHENTICATED",
    "en": "You are not logged in.",
    "es": "No has ingresado sessión.",
};
const UNVALIDATED = {
    "status": "error",
    "en": "You must validate your email account before logging in.",
    "es": "Debes validar tu correo electrónico antes de iniciar sessión.",
};
const INCORRECT_PASSWORD = {
    "status": "error",
    "code": "INCORRECT_PASSWORD",
    "es": "La contraseña o usuario son incorrectos.",
    "en": "The user or password are incorrect.",
};
const UNKOWN_ERROR = {
    "status": "error",
    "code": "UNKOWN_ERROR",
    "es": "Ocurrió un error creando el usuario.",
    "en": "An error occurred creating the user"
};
const USER_NOT_FOUND = {
    "status": "error",
    "code": "USER_NOT_FOUND",
    "es": "El usuario no fue encontrado.",
    "en": "The user was not found",
};
const BICYCLE_NOT_FOUND = {
    "status": "error",
    "code": "BICYCLE_NOT_FOUND",
    "es": "La bicicleta no fue encontrada.",
    "en": "The bicycle was not found",
};
const UNAUTHORIZED = {
    "status": "error",
    "code": "UNAUTHORIZED",
    "es": "No tienes permiso para acceder a este recurso",
    "en": "You are not allowed to access this resource",
};

const BAD_REQUEST = {
    "status": "error",
    "code": "BAD_REQUEST",
    "en": "Bad request",
    "es": "Bad request",
};

const INVALID_EMAIL = {
    "status": "error",
    "code": "INVALID_EMAIL",
    "en": "The email address is not valid",
    "es": "El correo electrónico no es válido."
};
const USER_ALREADY_EXISTS = {
    "status": "error",
    "code": "USER_ALREADY_EXISTS",
    "en": "A user with that email already exists, try signing in.",
    "es": "Ese correo electrónico ya está registrado, intenta ingresando sesión."
};
const NOT_FOUND = {
    "status": "error",
    "code": "NOT_FOUND",
    "es": "El recurso no fue encontrado.",
    "en": "The resource was not found.",
};

const MISSING_ID = {
    "stauts": "error",
    "code": "MISSING_ID",
    "es": "El campo `id` es obligatorio.",
    "en": "The field `id` is mandatory."
};
export default {
    USER_ALREADY_EXISTS, NOT_FOUND,
    UNREGISTERED_USER, INVALID_EMAIL, UNAUTHENTICATED,
    INCORRECT_PASSWORD, UNKOWN_ERROR, BICYCLE_NOT_FOUND,
    USER_NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, MISSING_ID,
    UNVALIDATED
};