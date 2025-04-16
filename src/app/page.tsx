// "use client"

// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import Image from "next/image"
// export default function Home() {
//   const validateEmail = (email: string) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     return regex.test(email)
//   }

//    const [error, submitAction, isPending] = useActionState(
//     async (_: unknown, formData: FormData) => {
//       const email = formData.get('email') as string;
//       const firstName = formData.get('firstName') as string;

//       if (!firstName) {
//         return {
//           email: "",
//           firstName: "Please enter a valid name"
//         }
//       }

//       if (!validateEmail(email)) {
//         return {
//           email: "Please enter a valid email",
//           firstName: ""
//         }
//       }
      

//       const {error} = await fetch("/api/send", {
//         method: "POST",
//         body: JSON.stringify({ email, firstName })
//       }).then(res => res.json())

//       if (error) {
//         return {
//           email: "",
//           firstName: "",
//           apiMessage: "Sorry! We couldn't subscribe you at the moment.",
//           apiError: true
//         }
//       }

//       return {
//         email: "",
//         firstName: "",
//         apiMessage: "Thank you! Please confirm your email by clicking the confirmation link. :)",
//         apiError: false
//       };
//     },
//     null,
//   );

//   return (
//     <div className="min-h-screen bg-black text-white">
//       <div className="mx-auto max-w-4xl px-4 py-8 text-center">
//         <Image src="/logo.png" className="mx-auto w-80" width={500} height={500} alt="state wizard logo" />
//         <p className="mb-4 text-lg text-gray-400">
//          Cansado de lidar com estados complexos do jeito tradicional? As state machines vão mudar o jogo, trazendo mais clareza, previsibilidade e estabilidade para suas aplicações!
//         </p>
//         <p className="mb-12 text-lg text-gray-400">
//           O State Wizard é um curso gratuito por e-mail, projetado para te ensinar, de forma prática e eficiente, como lidar com estados complexos de forma simples e eficiente. 🚀<br />Não enviaremos spam.
//         </p>

//       {error?.apiMessage 
//         ? <p className={`mt-2 mx-auto text-center text-sm ${error?.apiError ? 'text-red-400' : 'text-emerald-400'}`}>{error.apiMessage}</p>
//         : (
//             <form action={submitAction} className="mx-auto max-w-md space-y-4">
//               <div className="relative">
//                 <Input
//                   type="text"
//                   placeholder="Nome"
//                   name="firstName"
//                   className="h-12 bg-gray-800/50 text-white placeholder:text-gray-400"
//                 />
//                 {error?.firstName && <p className="mt-2 text-left text-sm text-red-400">{error.firstName}</p>}
//               </div>
//               <div className="relative">
//                 <Input
//                   type="email"
//                   placeholder="E-mail"
//                   name="email"
//                   className="h-12 bg-gray-800/50 text-white placeholder:text-gray-400"
//                 />
//                 {error?.email && <p className="mt-2 text-left text-sm text-red-400">{error.email}</p>}
//               </div>
//               <Button
//                 type="submit"
//                 className="h-12 w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:opacity-90"
//                 disabled={isPending}
//               >
//                 {isPending ? "Salvando..." : "Quero receber o curso via email"}
//               </Button>
//             </form>
//           )}
//       </div>
//     </div>
//   )
// }

'use client'

import { useActionState } from "react"

import { ArrowRight, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import VideoHero from "@/components/video-hero"
import FeatureCard from "@/components/feature-card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

   const [actionResult, submitAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const email = formData.get('email') as string;


      if (!validateEmail(email)) {
        return {
          email: "Please enter a valid email",
        }
      }
      

      const {error} = await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify({ email })
      }).then(res => res.json())

      if (error) {
        return {
          email: "",
          apiMessage: "Sorry! We couldn't subscribe you at the moment.",
          apiError: true
        }
      }

      return {
        email: "",
        apiMessage: "Thank you! Please confirm your email by clicking the confirmation link. :)",
        apiError: false
      };
    },
    null,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between m-auto">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl">Qaengineer.ai</div>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-background/90">
          <div className="container px-4 md:px-6 m-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <Badge variant="outline" className="px-3 py-1">
                Coming Soon
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                QA engineer agent at your fingertips
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Effortlessly create end-to-end tests using simple prompts. Deploy tests anytime, anywhere—locally, in
                CI, or with our cloud service.
              </p>
              <form action={submitAction} className="flex flex-col sm:flex-row gap-4 min-w-[380px] justify-center">
                <div className="flex-1">
                  <Input type="email" placeholder="Enter your email" className="w-full" name="email" />
                </div>
                <Button className="px-8" type="submit" disabled={isPending}>
                  {isPending ? "Subscribing..." : "Subscribe"} {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">Get notified when we launch. No spam, just updates.</p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6 m-auto">
            <VideoHero />
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 m-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="outline" className="px-3 py-1">
                  Features
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Rentless bug finder</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our framework transforms how you approach end-to-end testing with AI-powered simplicity.
                </p>
              </div>
            </div>
            <div className="features-grid mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <FeatureCard
                title="Prompt-Based Test Creation"
                description="Write end-to-end tests using natural language prompts. No complex syntax or boilerplate required."
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
              />
              <FeatureCard
                title="Self-Hosted Cloud Integration"
                description="Run tests with your own cloud instance for complete control over your testing environment and data."
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
              />
              <FeatureCard
                title="Local Development Mode"
                description="Develop and run tests locally with fast feedback loops during development. No credits needed."
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
              />
              <FeatureCard
                title="CI/CD Integration"
                description="Seamlessly integrate with your CI/CD pipeline for automated testing on every commit."
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
              />
              <FeatureCard
                title="Managed Cloud Service"
                description="Use our managed cloud service for hassle-free testing without infrastructure management."
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
              />
              <FeatureCard
                title="Comprehensive Test Coverage"
                description="Generate tests that cover edge cases and scenarios you might not have considered."
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
              />
              <div className="lg:col-start-2 lg:col-end-3">
                <FeatureCard
                  title="AI Assistant Mode"
                  description="Augment your QA team's capabilities with an AI assistant that handles repetitive tasks"
                  icon={<CheckCircle className="h-10 w-10 text-primary" />}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6 m-auto">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <Badge variant="outline" className="px-3 py-1">
                  Early Access
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join the waitlist today</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Be among the first to experience the future of E2E testing. Early access members receive exclusive
                  benefits and pricing.
                </p>
                <form action={submitAction} className="flex flex-col sm:flex-row gap-4 max-w-md">
                  <div className="flex-1">
                    <Input type="email" placeholder="Enter your email" className="w-full" name="email" />
                  </div>
                  <Button className="px-8" type="submit" disabled={isPending}>
                    {isPending ? "Subscribing..." : "Subscribe"} {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Priority access to new features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Dedicated onboarding support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Exclusive early adopter pricing</span>
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
      <footer className="w-full border-t py-6 md:py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6 m-auto">
          <div className="flex flex-col items-center gap-4 md:items-start md:gap-2">
            <div className="font-bold text-xl">qaengineer.ai</div>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} qaengineer.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
