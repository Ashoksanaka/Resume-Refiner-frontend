import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="flex justify-center">
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        </div>
    );
}
