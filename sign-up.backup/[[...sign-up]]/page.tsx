'use client'
import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import AuthCard from '../../components/auth/AuthCard'

const SignUpPage = () => {
    const { isLoaded, signUp, setActive } = useSignUp()
    const [emailAddress, setEmailAddress] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [code, setCode] = useState('')
    const [verificationError, setVerificationError] = useState('')
    const router = useRouter()

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isLoaded) {
            return;
        }

        try {
            await signUp.create({
                emailAddress,  // Changed from email_address
                firstName,     // Changed from first_name
                lastName,      // Changed from last_name
                password,
            });
            // Send verification email
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            // Change UI to pending verification
            setIsPending(true)
        } catch(error) {
            console.error(error)
        }
    };

    // Already has a code
    const handleHasCode = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsPending(true)
    }
    
    // Verify the code from the email
    const onPressVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Clear any previous errors
        setVerificationError('');
        
        if (!isLoaded) {
            return;
        }
        
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });
            
            if (completeSignUp.status !== 'complete') {
                // Handle specific status cases
                if (completeSignUp.status === 'abandoned') {
                    setVerificationError('Verification was abandoned. Please try again.');
                } else {
                    // Display a generic message for other non-complete statuses
                    setVerificationError('Verification failed. Please check your code and try again.');
                }
                console.log(JSON.stringify(completeSignUp, null, 2));
            }
            
            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                router.push('/');
            }
        } catch (err) {
            // Parse and display structured error messages from Clerk
            if (err.errors && err.errors.length > 0) {
                // Get the most relevant error message
                const errorMessage = err.errors[0].longMessage || err.errors[0].message;
                setVerificationError(errorMessage);
            } else {
                // Fallback for unexpected error formats
                setVerificationError('Verification failed. Please try again.');
            }
            console.error(JSON.stringify(err, null, 2));
        }
    };

    // Go back to sign up form when user does not have a code
    const handleGoBackToSignUpForm = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsPending(false)
    }
  
    return (
        <AuthCard>
            <h1 className='text-2xl mb-6 text-[#DA7756] font-bold'>Sign Up</h1>
            { !isPending && (
                <form onSubmit={handleSubmit} className='space-y-4 md:space-y-6'>
                    <div>
                        <label
                            htmlFor='first_name'
                            className='block mb-2 text-sm font-medium text-[#333333]'
                        >
                            First Name
                        </label>
                        <input
                            type='text'
                            name='first_name'
                            id='first_name'
                            onChange={(e) => setFirstName(e.target.value)}
                            className='input-neumorphic w-full'
                            required={true}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor='last_name'
                            className='block mb-2 text-sm font-medium text-[#333333]'
                        >
                            Last Name
                        </label>
                        <input
                            type='text'
                            name='last_name'
                            id='last_name'
                            onChange={(e) => setLastName(e.target.value)}
                            className='input-neumorphic w-full'
                            required={true}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor='email'
                            className='block mb-2 text-sm font-medium text-[#333333]'
                        >
                            Email Address
                        </label>
                        <input
                            type='email'
                            name='email'
                            id='email'
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className='input-neumorphic w-full'
                            placeholder='name@company.com'
                            required={true}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor='password'
                            className='block mb-2 text-sm font-medium text-[#333333]'
                        >
                            Password
                        </label>
                        <input
                            type='password'
                            name='password'
                            id='password'
                            onChange={(e) => setPassword(e.target.value)}
                            className='input-neumorphic w-full'
                            required={true}
                        />
                    </div>
                    <div id="clerk-captcha" className="my-3"></div>
                    <button
                        type='submit'
                        className='btn-neumorphic btn-primary w-full'
                    >
                        Create an account
                    </button>
                    
                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-[#CCCCCC]"></div>
                        <span className="flex-shrink mx-4 text-[#333333]">or</span>
                        <div className="flex-grow border-t border-[#CCCCCC]"></div>
                    </div>
                    
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => signUp.authenticateWithRedirect({
                                strategy: "oauth_google",
                                redirectUrl: "/sso-callback",
                                redirectUrlComplete: "/"
                            })}
                            className='btn-neumorphic w-full flex items-center justify-center gap-2'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                <path fill="none" d="M1 1h22v22H1z"/>
                            </svg>
                            Continue with Google
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => signUp.authenticateWithRedirect({
                                strategy: "oauth_linkedin",
                                redirectUrl: "/sso-callback",
                                redirectUrlComplete: "/"
                            })}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            Continue with LinkedIn
                        </button>
                    </div>
                    
                    <button type='button' onClick={handleHasCode} className='text-sm text-gray-500 hover:text-gray-900'>Already have a code?</button>
                </form>
            )}
            {isPending && (
                <form onSubmit={onPressVerify} className='space-y-4 md:space-y-6'>
                    {verificationError && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                            {verificationError}
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor='code'
                            className='block mb-2 text-sm font-medium text-[#333333]'
                        >
                            Verification Code
                        </label>
                        <input
                            type='text'
                            name='code'
                            id='code'
                            onChange={(e) => setCode(e.target.value)}
                            className='input-neumorphic w-full'
                            required={true}
                        />
                    </div>
                    <button
                        type='submit'
                        className='btn-neumorphic btn-primary w-full'
                    >
                        Verify Email
                    </button>
                    <button
                        onClick={handleGoBackToSignUpForm}
                        className='btn-neumorphic w-full mt-2'
                    >
                        Go Back
                    </button>
                </form>
            )}
        </AuthCard>
    )
}

export default SignUpPage;