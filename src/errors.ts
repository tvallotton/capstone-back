
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
export default {
    UNREGISTERED_USER, UNAUTHENTICATED, INCORRECT_PASSWORD, UNKOWN_ERROR, BICYCLE_NOT_FOUND, USER_NOT_FOUND, UNAUTHORIZED, BAD_REQUEST
};