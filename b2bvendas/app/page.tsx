import { Hero, Features, HowItWorks, CallToAction } from '@/components/public';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
    </div>
  );
}
