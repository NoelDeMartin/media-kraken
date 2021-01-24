export enum AuthenticationStatus {
    LoggedIn = 'logged-in',
    LoggingIn = 'logging-in',
    Failed = 'failed',
}

export enum AuthenticationMethod {
    Inrupt = 'inrupt',
    Legacy = 'legacy',
}

export const defaultAuthenticationMethod = AuthenticationMethod.Inrupt;
