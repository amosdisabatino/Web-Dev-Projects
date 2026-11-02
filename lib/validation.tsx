export function checkPassword(password: string, confirmed_password: string) {
    if (password !== undefined && password !== confirmed_password) {
        return {pwdValid: false, message: "Passwords do not match."};
    }
    if (password.length < 8) {
        return {pwdValid: false, message: "Password must contain at least 8 characters."};
    }
    if (!/\d/.test(password)) {
        return {pwdValid: false, message: "Password must contain at least a number."};
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {pwdValid: false, message: "Password must contain at least a special character."};
    }
    return {pwdValid: true}
}
