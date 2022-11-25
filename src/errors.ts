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
    "es": "No has ingresado sesión.",
};

const UNVALIDATED = {
    "status": "error",
    "code": "UNVALIDATED",
    "en": "You must validate your email account before logging in.",
    "es": "Debes validar tu correo electrónico antes de iniciar sesión.",
};

const TOKEN_EXPIRED = {
    "status": "error",
    "code": "TOKEN_EXPIRED",
    "es": "Este link ha expirado, pide uno nuevo.",
    "en": "This link has expired, request for a new one."
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
    "es": "Ocurrió un error desconocido.",
    "en": "An unknown error occurred "
};

const UNKOWN_ERROR_CREATE_USER = {
    "status": "error",
    "code": "UNKOWN_ERROR_CREATE_USER",
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
const INVALID_PASSWORD = {
    "status": "error",
    "code": "INVALID_PASSWORD",
    "en": "The password must have a minimum length of 8 characters, in addition to containing at least one uppercase letter, one lowercase letter, one number. ",
    "es": "La contraseña debe de tener una longitud minima de 8 caracteres, además de contener minimo una letra mayúscula, una minúscula, un número."
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
    "status": "error",
    "code": "MISSING_ID",
    "es": "El campo `id` es obligatorio.",
    "en": "The field `id` is mandatory."
};

const INTERNAL_SERVER = {
    "status": "error",
    "code": "INTERNAL_SERVER_ERROR",
    "es": "Ocurrió un error en el servidor.",
    "en": "Ocurrió un error en el servidor.",
};

const ALREADY_VALIDATED = {
    "status": "error",
    "code": "ALREADY_VALIDATED",
    "es": "El correo electrónico para este usuario ya fue validado, intenta ingresar.",
    "en": "Your email was already validated, try signing in."

};

const EMAIL_COULD_NOT_BE_SENT = {
    "status": "error",
    "code": "EMAIL_COULD_NOT_BE_SENT",
    "es": "El correo de verificación no se pudo enviar.",
    "en": "The email could not be sent."
};

const SUBMISSION_NOT_FOUND = {
    "status": "error",
    "code": "SUBMISSION_NOT_FOUND",
    "es": "No se pudo encontrar una submission para el usuario.",
    "en": "A submission could not be found for that user."
};

const USER_ALREADY_BORROWS = {
    "status": "error",
    "code": "USER_ALREADY_BORROWS",
    "es": "Sólo se puede arrendar una bicicleta.",
    "en": "You may only borrow one bicycle."
};

const BICYCLE_ALREADY_LENT = {
    "status": "error",
    "code": "BICYCLE_ALREADY_LENT",
    "es": "La bicicleta sigue prestada, termine el préstamo antes de volver a prestarla.",
    "en": "The bicycle is "
};

const INCOMPLETE_USER_INFO = {
    "status": "error",
    "code": "INCOMPLETE_USER_INFO",
    "es": "Completa tu información de usuario antes de solicitar una bicicleta.",
    "en": "Complete your user info before requesting a bicycle."
};

const USER_ALREADY_SUBMITTED = {
    "status": "error",
    "code": "USER_ALREADY_SUBMTTED",
    "es": "Lo siento, ya tienes una reserva activa a tu nombre.",
    "en": "You already have a pending submission to your name."
};

const MISSING_EXIT_FORM = {
    "status": "error",
    "code": "MISSING_EXIT_FORM",
    "es": "El usuario debe rellenar el formulario de salida antes de devolver la bicicleta.",
    "en": "The user must fill out the exit form before returning the bike."
};

const BOOKING_ALREADY_TERMINATED = {
    "status": "error",
    "code": "BOOKING_ALREADY_TERMINATED",
    "es": "La reserva ya ha terminado.",
    "en": "The booking was already terminated."
};

const BOOKING_NOT_FOUND = {
    "status": "error",
    "en": "You have not active bookings.",
    "es": "No tienes reservas activas."
};

const CANNOT_DELETE_LENT_BICYCLE = {
    "status": "error",
    "code": "CANNOT_DELETE_LENT_BICYCLE",
    "en": "The bicycle cannot be deleted because it has been lent. Alternatively, you may set its status to \"INHABILITADA\".",
    "es": "La bicicleta no puede ser borrada ya que ha sido prestada. Alternativamente, puedes cambiar su estado a \"INHABILITADA\"."
};

const EXPECTED_MATRIX = {
    "status": "error",
    "code": "EXPECTED_MATRIX",
    "en": "Expected a boolean matrix of 6x8.",
    "es": "Se esperaba una matriz booleana de 6x8.",
};

const OUT_OF_SERVICE = {
    "status": "error",
    "code": "OUT_OF_SERVICE",
    "en": "Sibico is currenlty out of service.",
    "es": "Sibico se encuentra actualmente fuera de servicio."
};

export default {
    USER_ALREADY_EXISTS, NOT_FOUND, UNAUTHENTICATED,
    UNREGISTERED_USER, INVALID_EMAIL, INVALID_PASSWORD,
    INCORRECT_PASSWORD, UNKOWN_ERROR, BICYCLE_NOT_FOUND,
    USER_NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, UNVALIDATED,
    MISSING_ID, TOKEN_EXPIRED, INTERNAL_SERVER, ALREADY_VALIDATED,
    EMAIL_COULD_NOT_BE_SENT, SUBMISSION_NOT_FOUND, BICYCLE_ALREADY_LENT,
    USER_ALREADY_BORROWS, UNKOWN_ERROR_CREATE_USER, INCOMPLETE_USER_INFO,
    USER_ALREADY_SUBMITTED, MISSING_EXIT_FORM, BOOKING_ALREADY_TERMINATED,
    BOOKING_NOT_FOUND, CANNOT_DELETE_LENT_BICYCLE, EXPECTED_MATRIX, OUT_OF_SERVICE
};
