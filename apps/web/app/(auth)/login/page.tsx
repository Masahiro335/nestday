import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return <LoginForm redirectTo={searchParams.redirect} />;
}
