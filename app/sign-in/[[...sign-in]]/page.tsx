import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">
            Welcome to Perplexity
          </h1>
          <p className="text-gray-600">Sign in to continue exploring</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-[#0d9488] hover:bg-[#0f766e] text-white transition-colors",
              card: "shadow-none",
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