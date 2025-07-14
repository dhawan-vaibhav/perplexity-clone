import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600">Join Perplexity to start exploring</p>
        </div>
        <SignUp 
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
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}