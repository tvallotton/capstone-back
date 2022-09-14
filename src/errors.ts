
const UNREGISTERED_USER = {
    "status": "error",
    "es": "El correo electrónico no está registrado.",
    "en": "The email is not registered."
};

const UNAUTHENTICATED = {
    "status": "error",
    "en": "You are not logged in.",
    "es": "No has ingresado sessión.",
};

const INCORRECT_PASSWORD = {
    "status": "error",
    "es": "La contraseña o usuario son incorrectos.",
    "en": "The user or password are incorrect.",
};
const UNKOWN_ERROR = {
    "status": "error",
    "es": "Ocurrió un error creando el usuario.",
    "en": "An error occurred creating the user"
};
const USER_NOT_FOUND = {
    "status": "error",
    "es": "El usuario no fue encontrado.",
    "en": "The user was not found",
};
const BICYCLE_NOT_FOUND = {
    "status": "error",
    "es": "La bicicleta no fue encontrada.",
    "en": "The bicycle was not found",
};
const UNAUTHORIZED = {
    "status": "error",
    "es": "No tienes permiso para acceder a este recurso",
    "en": "You are not allowed to access this resource",
};

const BAD_REQUEST = {
    "en": "Bad request",
    "es": "Bad request",
    "status": "error"
};

const INVALID_EMAIL = {
    "status": "error",
    "en": "The email address is not valid",
    "es": "El correo electrónico no es válido."
};
const USER_ALREADY_EXISTS = {
    "status": "error",
    "en": "A user with that email already exists, try signing in.",
    "es": "Ese correo electrónico ya está registrado, intenta ingresando sesión."
};
const NOT_FOUND = {
    "status": "error",
    "es": "El recurso no fue encontrado.",
    "en": "The resource was not found.",
};
export default {
    USER_ALREADY_EXISTS, NOT_FOUND,
    UNREGISTERED_USER, INVALID_EMAIL, UNAUTHENTICATED,
    INCORRECT_PASSWORD, UNKOWN_ERROR, BICYCLE_NOT_FOUND,
    USER_NOT_FOUND, UNAUTHORIZED, BAD_REQUEST
};