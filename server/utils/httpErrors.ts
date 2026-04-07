// Uniform HTTP error helpers
// Usage: throw badRequest('Message');

export function invalidInput(issues: unknown) {
    return createError({
        statusCode: 400,
        statusMessage: 'Entrée invalide',
        data: issues,
    })
}

export function badRequest(message: string, data?: any) {
    return createError({
        statusCode: 400,
        statusMessage: message,
        data,
    })
}

export function unauthorized(message = 'Non autorisé') {
    return createError({
        statusCode: 401,
        statusMessage: message,
    })
}

export function conflict(message: string, field?: string) {
    return createError({
        statusCode: 409,
        statusMessage: message,
        data: field ? { field } : undefined,
    })
}

export function tooManyRequests(message = 'Trop de tentatives. Réessayez plus tard.') {
    return createError({
        statusCode: 429,
        statusMessage: message,
    })
}

export function internal(message = 'Erreur interne du serveur') {
    return createError({
        statusCode: 500,
        statusMessage: message,
    })
}
