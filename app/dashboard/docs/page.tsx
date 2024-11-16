import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsTabs } from "@/components/docs/docs-tabs";

export const metadata: Metadata = {
  title: "Documentation - MoreLife",
  description: "Begin your journey to freedom with MoreLife",
};

export default function DocsPage() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome to MoreLife</h1>
          <p className="text-lg text-muted-foreground">
            Discover how to start your journey towards personal freedom and growth with our comprehensive platform.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Begin your transformation with MoreLife in just a few steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">1. Create Your Account</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>Visit https://morelife.com/signup to create your personal account</code>
            </pre>

            <h3 className="font-semibold">2. Complete Your Profile</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>Set up your personal dashboard and goals</code>
            </pre>

            <h3 className="font-semibold">3. Connect with Your Community</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>Join our vibrant community of like-minded individuals</code>
            </pre>

            <h3 className="font-semibold">4. Begin Your Journey</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>Access your personalized roadmap to freedom</code>
            </pre>
          </CardContent>
        </Card>

        <DocsTabs />
      </div>
    </div>
  );
}