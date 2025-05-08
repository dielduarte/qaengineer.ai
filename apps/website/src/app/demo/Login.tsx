"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const emailPattern = /^[^@]+@getqaengineer\.com$/;

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email, password);
    if (emailPattern.test(email) && password.trim() !== "") {
      router.push("/demo/list");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between m-auto">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl">Qaengineer.ai - TODO app</div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-background/90">
          <div className="container px-4 md:px-6 m-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-sm font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                Login to your account
              </h1>
              <form
                className="flex flex-col gap-4 w-full max-w-sm mx-auto"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="remember" value="true" />
                <div>
                  <label
                    htmlFor="email"
                    className="block text-left mb-1 font-medium"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-left mb-1 font-medium"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full mt-2">
                  Sign in
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
