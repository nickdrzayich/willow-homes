import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <AuthShell>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>We&apos;ll email you a link to set a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, a reset link is on its way. Check your inbox.
            </p>
          ) : (
            <form action={requestPasswordReset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" autoFocus />
              </div>
              <Button type="submit" className="mt-1 w-full">
                Send reset link
              </Button>
            </form>
          )}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            <Link href="/admin/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Back to log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
