import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const loginMutation = useLogin();

  useEffect(() => {
    if (!isUserLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isUserLoading, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: () => {
          setLocation("/dashboard");
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: err.error?.error || "حدث خطأ أثناء تسجيل الدخول",
          });
        },
      }
    );
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary tracking-tight">Varecvsce</h1>
          <p className="text-secondary-foreground text-lg">مرحباً بك، سجّل دخولك</p>
        </div>

        <div className="bg-card text-card-foreground rounded-3xl p-6 sm:p-8 shadow-sm border border-card-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl h-12 bg-background border-transparent focus:border-primary focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl h-12 bg-background border-transparent focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-lg font-medium shadow-sm transition-all active:scale-[0.98]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              ليس لديك حساب؟ إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}