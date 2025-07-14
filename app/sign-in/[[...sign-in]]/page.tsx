import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">
            Welcome to Perplexity
          </h1>
          <p className="text-gray-600">Sign in to continue exploring</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              formButtonPrimary: 
                "bg-[#0d9488] hover:bg-[#0f766e] text-white transition-colors",
              card: "shadow-none bg-transparent",
              formFieldInput: "bg-white",
              footer: "hidden"
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}