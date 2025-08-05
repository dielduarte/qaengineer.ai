'use client';

import { useActionState } from 'react';

import { ArrowRight, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VideoHero from '@/components/video-hero';
import FeatureCard from '@/components/feature-card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import hero from '@/assets/hero.png';
import logo from '@/assets/logo.svg';

export default function Home() {
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const [actionResult, submitAction, isPending] =
    useActionState(
      async (_: unknown, formData: FormData) => {
        const email = formData.get('email') as string;

        if (!validateEmail(email)) {
          return {
            email: 'Please enter a valid email',
          };
        }

        const { error } = await fetch('/api/send', {
          method: 'POST',
          body: JSON.stringify({ email }),
        }).then((res) => res.json());

        if (error) {
          return {
            email: '',
            apiMessage:
              "Sorry! We couldn't subscribe you at the moment.",
            apiError: true,
          };
        }

        return {
          email: '',
          apiMessage:
            'Thank you! Please confirm your email by clicking the confirmation link. :)',
          apiError: false,
        };
      },
      null,
    );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="relative h-screen w-full text-white">
          <header className="absolute left-0 right-0 top-[-130px] mx-auto mt-4 flex w-[80%] items-center justify-between rounded-lg border border-white/20 p-6 backdrop-blur-md">
            <Image src={logo} alt="logo" />
            <nav>
              <a href="#features">Features</a>
            </nav>
          </header>
          <Image
            src={hero}
            alt="hero"
            className="absolute right-0 top-0 h-full w-full object-cover mix-blend-multiply md:w-[50%]"
          />
          <div className="container m-auto w-[80%]">
            <div className="items-left mt-[10%] flex w-[50%] flex-col space-y-4 text-left">
              <h1 className="mt-[30%] font-mono text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Your AI QA Engineer. Ready to work.
              </h1>
              <p className="font-figtree max-w-[700px] text-[15px] font-normal text-white">
                Catch bugs before your users do with an
                AI-powered, open-source testing framework.
                Works anywhere — locally, in your CI
                pipeline, or in the cloud.
              </p>
              {actionResult?.apiError === false ? (
                <p className="py-8 text-lg font-semibold text-emerald-500">
                  Thank you for subscribing! You will be
                  notified when we launch.
                </p>
              ) : actionResult?.apiError ? (
                <p className="py-8 text-lg font-semibold text-red-500">
                  {actionResult.apiMessage}
                </p>
              ) : (
                <form
                  action={submitAction}
                  className="justify-left flex min-w-[260px] flex-col gap-4 sm:flex-row md:min-w-[380px]"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                  />

                  <Button
                    className="px-8"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending
                      ? 'Subscribing...'
                      : 'Subscribe'}{' '}
                    {!isPending && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </form>
              )}
              <p className="text-xs text-white">
                We are sending invites to our early access
                program. no spams, just updates.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container m-auto px-4 md:px-6">
            <VideoHero />
          </div>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container m-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className="px-3 py-1"
                >
                  Features
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Relentless bug finder
                </h2>
                <p className="mx-auto max-w-[700px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The open-source framework that transforms
                  how you approach end-to-end testing with
                  AI-powered simplicity.
                </p>
              </div>
            </div>
            <div className="features-grid mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <FeatureCard
                title="Prompt-Based Test Creation"
                description="Write end-to-end tests using natural language prompts. No complex syntax or boilerplate required."
                icon={
                  <CheckCircle className="h-10 w-10 text-primary" />
                }
              />
              <FeatureCard
                title="Comprehensive Test Coverage"
                description="Generate tests that cover edge cases and scenarios you might not have considered."
                icon={
                  <CheckCircle className="h-10 w-10 text-primary" />
                }
              />
              <FeatureCard
                title="AI Assistant Mode"
                description="Augment your QA team's capabilities with an AI assistant that handles repetitive tasks"
                icon={
                  <CheckCircle className="h-10 w-10 text-primary" />
                }
              />
              <FeatureCard
                title="Self-Hosted Cloud Integration"
                description="Run tests with your own cloud instance for complete control over your testing environment and data."
                icon={
                  <CheckCircle className="h-10 w-10 text-primary" />
                }
              />
              <FeatureCard
                title="Local Development Mode"
                description="Develop and run tests locally with fast feedback loops during development. No credits needed."
                icon={
                  <CheckCircle className="h-10 w-10 text-primary" />
                }
              />
              <FeatureCard
                title="CI/CD Integration"
                description="Seamlessly integrate with your CI/CD pipeline for automated testing on every commit."
                icon={
                  <CheckCircle className="h-10 w-10 text-primary" />
                }
              />
              <div className="lg:col-start-2 lg:col-end-3">
                <FeatureCard
                  title="Managed Cloud Service"
                  description="Use our managed cloud service for hassle-free testing without infrastructure management."
                  icon={
                    <CheckCircle className="h-10 w-10 text-primary" />
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container m-auto px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="px-3 py-1"
                >
                  Early Access
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Join the waitlist today
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Be among the first to experience the
                  future of E2E testing. Early access
                  members receive exclusive benefits and
                  pricing.
                </p>
                {actionResult?.apiError === false ? (
                  <p className="py-8 text-lg font-semibold text-emerald-500">
                    Thank you for subscribing! You will be
                    notified when we launch.
                  </p>
                ) : actionResult?.apiError ? (
                  <p className="py-8 text-lg font-semibold text-red-500">
                    {actionResult.apiMessage}
                  </p>
                ) : (
                  <form
                    action={submitAction}
                    className="flex max-w-md flex-col gap-4 sm:flex-row"
                  >
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full"
                        name="email"
                      />
                    </div>
                    <Button
                      className="px-8"
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending
                        ? 'Subscribing...'
                        : 'Subscribe'}{' '}
                      {!isPending && (
                        <ArrowRight className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </form>
                )}
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>
                      Priority access to new features
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>
                      Dedicated onboarding support
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>
                      Exclusive early adopter pricing
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Shape the product roadmap</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* <footer className="w-full border-t py-6 md:py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6 m-auto">
          <div className="flex flex-col items-center gap-4 md:items-start md:gap-2">
            <div className="font-bold text-xl">qaengineer.ai</div>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} qaengineer.ai. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
