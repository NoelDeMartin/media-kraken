import { AuthenticationMethod } from '@/authentication/AuthenticationMethod';
import Authenticator from '@/authentication/Authenticator';
import LegacyAuthenticator from '@/authentication/LegacyAuthenticator';

const authenticators: Record<AuthenticationMethod, Authenticator> = {
    [AuthenticationMethod.Legacy]: LegacyAuthenticator,
};

export default authenticators;
