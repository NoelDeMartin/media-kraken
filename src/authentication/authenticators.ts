import { AuthenticationMethod } from '@/authentication';
import Authenticator from '@/authentication/Authenticator';
import InruptAuthenticator from '@/authentication/InruptAuthenticator';
import LegacyAuthenticator from '@/authentication/LegacyAuthenticator';

const authenticators: Record<AuthenticationMethod, Authenticator> = {
    [AuthenticationMethod.Inrupt]: InruptAuthenticator,
    [AuthenticationMethod.Legacy]: LegacyAuthenticator,
};

export default authenticators;
